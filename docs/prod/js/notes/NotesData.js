import {fifths2keysig, keysig_imprint} from "./noteHelper.js";
import {saveState} from "../state/history.js";
import {selected} from "../abc/abchelper.js";
import { generateRandomId } from "../core/string.js";

export let supportedNoteLen = new Set([1, 2, 3, 4, 6, 8, 12, 16, 20, 24]);

// alter = 0 is natural. alter = 10 is no accidental (inherits key)

export class NotesData {
  saveState() {
    saveState(true);
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
    if (len > note.len) {
      let debt = len - note.len;
      for (let n = ni + 1; n < notes.length; ++n) {
        if (debt < notes[n].len) {
          nd.set_rest(v, n, false);
          notes[n].len = notes[n].len - debt;
          notes[n].startsTie = false;
          break;
        }
        else {
          debt -= notes[n].len;
          notes.splice(n, 1);
          --n;
          if (!debt) break;
        }
      }
    }
    else {
      notes.splice(ni + 1, 0, {d: 0, alter: 10, len: note.len - len, startsTie: false});
      nd.set_rest(v, ni + 1, false);
    }
    note.len = len;
    note.startsTie = false;
    if (saveState) this.saveState();
  }

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
    this.saveState();
  }

  append_measure(saveState=true) {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      vc.notes.push({d: 0, alter: 10, len: this.timesig.measure_len, startsTie: false});
    }
    if (saveState) this.saveState();
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

  reset() {
    const hash = generateRandomId(10);
    this.set_name(`New exercise [${hash}]`);
    this.set_fileName(`New-exercise-${hash}`);
    this.algoMode = 0;
    this.phrases = [ 0 ];
    this.build_keysig(0, 13);
    let mode = this.keysig;
    mode.step = 0;
    this.modes = [
      mode
    ];
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
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'treble',
        name: 'Alt.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'treble-8',
        name: 'Ten.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
      {
        clef: 'bass',
        name: 'Bas.',
        species: 10,
        locked: false,
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
          {d: 0, alter: 0, len: 16, startsTie: false, text: '', lyric: ''},
        ]
      },
    ];
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

  getClosestNote(v, pos, hint=0) {
    if (this.voices.length <= v || !this.voices[v].notes.length) return;
    // Reset hint if it is wrong
    if (this.voices[v].notes.length <= hint || this.voices[v].notes[hint].step > pos) hint = 0;
    for (let n = hint; n < this.voices[v].notes.length; ++n) {
      let nt = this.voices[v].notes[n];
      if (nt.step <= pos && nt.step + nt.len > pos) return n;
    }
    return 0;
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
}

export let nd = new NotesData();
