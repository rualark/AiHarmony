import {fifths2keysig, keysig_imprint, split_len} from "./noteHelper.js";
import {saveState} from "../state/history.js";
import {selected} from "../abc/abchelper.js";
import { name2filename } from "../core/string.js";
import { generateRandomHashWords } from "../core/hashwords.js";

export let supportedNoteLen = new Set([1, 2, 3, 4, 6, 8, 12, 16, 20, 24]);

// alter = 0 is natural. alter = 10 is no accidental (inherits key)

export class NotesData {
  saveState() {
    saveState(true);
  }

  // Determines if measure already contains to the left of n
  // altered notes of diatonic d
  inherited_alter(v, n, d) {
    let notes = this.voices[v].notes;
    let note = notes[n];
    let mlen = this.timesig.measure_len;
    // If note is first (step=0) or was just added (step=undefined)
    // then no inheritance is possible
    if (!note.step) return 10;
    let m = Math.floor(note.step / mlen);
    // Get first note in measure
    let nstart = this.getClosestNote(v, m * mlen);
    // If error finding first note in measure, cancel inheritance
    if (notes[nstart].step != m * mlen) return 10;
    // Loop inside measure
    for (let n2 = n - 1; n2 >= nstart; --n2) {
      if (notes[n2].d == d) {
        return notes[n2].alter;
      }
    }
    // Note d not found in measure
    return 10;
  }

  has_notes() {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        if (nt.d) return true;
      }
    }
    return false;
  }

  set_note(v, n, d, saveState=true) {
    this.voices[v].notes[n].d = d;
    let notes = this.voices[v].notes;
    let note = notes[n];
    note.startsTie = false;
    if (n && notes[n - 1].d !== note.d) {
      notes[n - 1].startsTie = false;
    }
    if (saveState) this.saveState();
  }

  set_alter(v, n, alt) {
    this.voices[v].notes[n].alter = alt;
    this.saveState();
  }

  set_text(v, n, st) {
    if (st.length > 127) st = st.slice(0, 127);
    this.voices[v].notes[n].text = st;
    this.saveState();
  }

  set_lyric(v, n, st) {
    if (st.length > 127) st = st.slice(0, 127);
    this.voices[v].notes[n].lyric = st;
    this.saveState();
  }

  set_rest(v, n, saveState=true) {
    this.set_note(v, n, 0, saveState);
    this.voices[v].notes[n].alter = 10;
    this.voices[v].notes[n].startsTie = false;
    if (n) {
      this.voices[v].notes[n - 1].startsTie = false;
    }
    if (saveState) this.saveState();
  }

  set_len(v, ni, len, saveState=true) {
    let notes = this.voices[v].notes;
    let note = notes[ni];
    // If we are enlarging current note
    if (len > note.len) {
      // Debt is the length that we owe to the newly inserted note due to making it shorter
      let debt = len - note.len;
      for (let n = ni + 1; n < notes.length; ++n) {
        // If we can cover the debt fully with current note, do it
        if (debt < notes[n].len) {
          // Replace this note with residue rest(s)
          notes.splice(n, 1, ...NotesData.make_rests(notes[n].len - debt));
          break;
        }
        else {
          // If current note is smaller than debt, just remove it
          debt -= notes[n].len;
          notes.splice(n, 1);
          --n;
          if (!debt) break;
        }
      }
    }
    // If we are making current note smaller
    else {
      console.log(`Insert residue rest old_len:${note.len} - len:${len}`);
      // Insert residue rest(s) after our note
      notes.splice(ni + 1, 0, ...NotesData.make_rests(note.len - len));
      this.set_rest(v, ni + 1, false);
    }
    note.len = len;
    note.startsTie = false;
    if (saveState) this.saveState();
  }

  static make_rests(len) {
    let result = [];
    for (const ln of split_len(len)) {
      result.push({d: 0, alter: 10, len: ln, startsTie: false});
    }
    return result;
  }

  static split_note(note) {
    let result = [];
    const lens = split_len(note.len);
    for (let i=0; i<lens.length; i++) {
      let copy_of_note = JSON.parse(JSON.stringify(note));
      copy_of_note.len = lens[i];
      if (note.d && i < lens.length - 1) {
        copy_of_note.startsTie = true;
      }
      result.push(copy_of_note);
    }
    return result;
  }

  // Adds new empty voice before voice v
  add_voice(v) {
    if (!v) return;
    this.voices.splice(v, 0, []);
    let vc = this.voices[v];
    let mlen = this.timesig.measure_len;
    vc.clef = this.voices[v - 1].clef;
    this.set_voiceName(v, this.voices[v - 1].name);
    vc.species = this.voices[v - 1].species;
    vc.notes = [];
    let len = this.get_voice_len(0);
    let measures = Math.floor(len / mlen);
    for (let m = 0; m < measures; ++m) {
      vc.notes.push({d: 0, alter: 10, len: mlen, startsTie: false});
    }
    this.saveState();
  }

  del_voice(v) {
    if (v == null) return;
    this.voices.splice(v, 1);
  }

  append_measure(saveState=true) {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      vc.notes.push({d: 0, alter: 10, len: this.timesig.measure_len, startsTie: false});
    }
    if (saveState) this.saveState();
  }

  insert_measure(v, n) {
    let m = Math.floor(this.voices[v].notes[n].step / this.timesig.measure_len);
    let p1 = m * this.timesig.measure_len;
    let p2 = p1 + this.timesig.measure_len;
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        if (nt.step == p1) {
          vc.notes.splice(n, 0, {
            d: 0,
            alter: 10,
            len: this.timesig.measure_len,
            startsTie: false}
          );
          if (n) {
            vc.notes[n - 1].startsTie = false;
          }
          break;
        }
      }
    }
  }

  delBar(v, n) {
    let p1 = Math.floor(this.voices[v].notes[n].step / this.timesig.measure_len) * this.timesig.measure_len;
    let p2 = p1 + this.timesig.measure_len;
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        if (nt.step >= p1 && nt.step + nt.len <= p2) {
          vc.notes.splice(n, 1);
          if (n) {
            vc.notes[n - 1].startsTie = false;
          }
          --n;
        }
      }
    }
  }

  build_keysig(fifths, mode) {
    this.keysig = {};
    this.keysig.fifths = fifths;
    this.keysig.mode = mode;
    this.keysig.name = fifths2keysig[fifths];
    this.keysig.imprint = keysig_imprint(this.keysig.fifths);
  }

  build_timesig(beats_per_measure, beat_type) {
    this.timesig.beats_per_measure = beats_per_measure;
    this.timesig.beat_type = beat_type;
    this.timesig.measure_len = this.timesig.beats_per_measure * 16 / this.timesig.beat_type;
  }

  set_keysig(keysig) {
    let ki1 = keysig_imprint(this.keysig.fifths);
    let ki2 = keysig_imprint(keysig.fifths);
    //console.log(ki1, ki2);
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        let dc = nt.d % 7;
        //console.log(v, n, dc, nt.abc_alter, ki1[dc], ki2[dc]);
        // Remove duplicate alterations
        if (nt.alter === 1 && ki2[dc] === 1) {
          nt.alter = 10;
        }
        else if (nt.alter === -1 && ki2[dc] === -1) {
          nt.alter = 10;
        }
        else if (nt.alter === 0 && ki2[dc] === 0) {
          nt.alter = 10;
        }
        // Add alteration if loosing
        else if (nt.alter === 10) {
          if (ki1[dc] === 1 && ki2[dc] !== 1) nt.alter = 1;
          if (ki1[dc] === -1 && ki2[dc] !== -1) nt.alter = -1;
          if (ki1[dc] === 0 && ki2[dc] !== 0) nt.alter = 0;
        }
      }
    }
    this.keysig = keysig;
    this.keysig.imprint = ki2;
    this.modes[0] = keysig;
    this.modes[0].step = 0;
    this.saveState();
  }

  get_realAlter(v, n) {
    if (this.voices[v].notes[n].alter === 10) {
      return this.keysig.imprint[this.voices[v].notes[n].d % 7];
    }
    return this.voices[v].notes[n].alter;
  }

  set_timesig(timesig) {
    this.timesig.beats_per_measure = timesig.beats_per_measure;
    this.timesig.beat_type = timesig.beat_type;
    this.timesig.measure_len = timesig.measure_len;
    let mlen = this.timesig.measure_len;
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      // Merge pauses
      let s2 = 0;
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        s2 = nt.step + nt.len;
        if (n >= vc.notes.length - 1) break;
        if (nt.d) continue;
        let nt2 = vc.notes[n + 1];
        if (nt2.d) continue;
        // Merge second rest to first rest
        nt.len += nt2.len;
        // Remove second rest
        vc.notes.splice(n + 1, 1);
        // Return to first rest to check if there are more rests to merge
        --n;
      }
      // Complete last measure
      if (s2 % mlen) {
        // If there is note in the end, append rest
        if (vc.notes[vc.notes.length - 1].d) {
          vc.notes.push({d: 0, alter: 10, len: mlen - s2 % mlen, startsTie: false});
        }
        // If there is rest in the end, grow rest length
        else {
          vc.notes[vc.notes.length - 1].len += mlen - s2 % mlen;
        }
      }
      // Split notes
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        if (nt.step % mlen + nt.len > mlen) {
          let debt = nt.step % mlen + nt.len - mlen;
          nt.len -= debt;
          while (debt > 0) {
            let len = debt > mlen ? mlen : debt;
            debt -= len;
            let new_note = {d: nt.d, alter: nt.alter, len: len};
            //console.log("Insert", v, n, nt.len, nt.step, len, debt, new_note);
            vc.notes.splice(n + 1, 0, new_note);
            if (vc.notes[n].d) {
              vc.notes[n].startsTie = true;
            } else {
              vc.notes[n].startsTie = false;
            }
            ++n;
          }
        }
      }
    }
    this.saveState();
  }

  reset(parts) {
    //const hash = generateRandomId(10);
    //this.set_name(`New exercise [${hash}]`);
    //this.set_fileName(`New-exercise-${hash}`);
    this.styles = [];
    this.root_eid = 0;
    this.eid = 0;
    this.set_name(generateRandomHashWords('A n n-###'));
    this.set_fileName(name2filename(this.name));
    this.rules_whitelist = Object.create(null);
    this.rules_blacklist = Object.create(null);
    this.algoMode = 0;
    this.phrases = [ 0 ];
    this.build_keysig(0, 13);
    let mode = this.keysig;
    mode.step = 0;
    this.modes = [
      mode
    ];
    this.tempo = 140;
    this.timesig = {
      beats_per_measure: 4,
      beat_type: 4,
      measure_len: 16
    };
    this.voices = [
      {
        clef: 'treble',
        name: 'Sop.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'treble',
        name: 'Alt.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'treble-8',
        name: 'Ten.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'bass',
        name: 'Bas.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 10, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
    ];
    if (parts < 4) {
      this.voices.splice(1, 3 - parts + 1);
    }
    selected.note = {voice: 0, note: 0};
    this.abc_charStarts = [];
  }

  get_voice_len(v) {
    let len = 0;
    for (let n = 0; n < this.voices[v].notes.length; ++n) {
      let nt = this.voices[v].notes[n];
      len += nt.len;
    }
    return len;
  }

  // TODO: Implement binary search
  getClosestNote(v, pos, hint=0) {
    if (this.voices.length <= v || !this.voices[v].notes.length) return;
    // Reset hint if it is wrong
    if (this.voices[v].notes.length <= hint || this.voices[v].notes[hint].step > pos) hint = 0;
    for (let n = hint; n < this.voices[v].notes.length; ++n) {
      let nt = this.voices[v].notes[n];
      if (nt.step <= pos && nt.step + nt.len > pos) return n;
    }
    return this.voices[v].notes.length - 1;
  }

  constructor() {
    // Set values that should not be reset on new score, but should be inherited from previous score
    this.algo = 'CA3';
    this.reset();
  }

  set_name(st) {
    if (st == null) this.name = '';
    else if (st === '') this.name = '-';
    else this.name = st.substr(0, 255);
  }

  set_fileName(st) {
    if (st == null) this.fileName = '';
    else if (st === '') this.fileName = '-';
    else this.fileName = st.substr(0, 255);
  }

  set_voiceName(v, st) {
    if (st == null) this.voices[v].name = '';
    else this.voices[v].name = st.substr(0, 255);
  }

  set_tempo(tempo) {
    if (tempo > 255) tempo = 255;
    if (tempo < 1) tempo = 1;
    this.tempo = tempo;
  }

  set_root_eid(root_eid) {
    this.root_eid = root_eid;
  }

  set_eid(eid) {
    this.eid = eid;
    console.log('Eid', this.eid);
  }

  set_voiceLocked(v, locked) {
    this.voices[v].locked = locked;
  }

  set_species(v, sp) {
    this.voices[v].species = sp;
  }

  transpose_voice(v, dd) {
    let vc = this.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      if (!vc.notes[n].d) continue;
      const new_d = vc.notes[n].d + dd
      if (new_d < 1 || new_d > 74) continue;
      vc.notes[n].d = new_d;
    }
  }

  update_note_steps() {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      let s = 0;
      for (let n=0; n<vc.notes.length; ++n) {
        let nt = vc.notes[n];
        nt.step = s;
        s += nt.len;
      }
    }
  }

  // Ensure that smax is ending of notes in all voices (selection is rectangular)
  getCommonEnding(vmin, vmax, smax) {
    for (let attempt=0; attempt<10000; ++attempt) {
      let smax_new = smax;
      for (let v=vmin; v<=vmax; v++) {
        const voice = this.voices[v];
        const notes = voice.notes;
        const n2 = this.getClosestNote(v, smax_new);
        if (notes[n2].step + notes[n2].len - 1 > smax_new) {
          smax_new = notes[n2].step + notes[n2].len - 1;
        }
      }
      if (smax === smax_new) return smax;
      smax = smax_new;
    }
  }

  // Ensure that smin is start of notes in all voices (selection is rectangular)
  getCommonStart(vmin, vmax, smin) {
    for (let attempt=0; attempt<10000; ++attempt) {
      let smin_new = smin;
      for (let v=vmin; v<=vmax; v++) {
        const voice = this.voices[v];
        const notes = voice.notes;
        const n2 = this.getClosestNote(v, smin_new);
        if (notes[n2].step < smin_new) {
          smin_new = notes[n2].step;
        }
      }
      if (smin === smin_new) return smin;
      smin = smin_new;
    }
  }

  // Check if any voice in range is locked
  voicesAreLocked(vmin, vmax) {
    for (let v=vmin; v<=vmax; ++v) {
      if (v < this.voices.length && this.voices[v].locked) {
        return true;
      }
    }
    return false;
  }
}

export let nd = new NotesData();
