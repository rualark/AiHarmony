import {fifths2keysig, keysig_imprint} from "./notehelper.js";
import {saveState} from "../history.js";

export let supportedNoteLen = new Set([1, 2, 3, 4, 6, 8, 12, 16, 20, 24]);

// alter = 0 is natural. alter = 10 is no accidental (inherits key)

class NotesData {
  saveState() {
    saveState();
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
    vc.name = this.voices[v - 1].name;
    vc.notes = [];
    let len = this.get_voice_len(0);
    let measures = Math.floor(len / mlen)
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
    this.keysig.fifths = fifths;
    this.keysig.mode = mode;
    this.keysig.name = fifths2keysig[fifths];
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
    this.saveState();
  }

  set_timesig(timesig) {
    this.timesig = timesig;
    let mlen = this.timesig.measure_len;
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      let s2 = 0;
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        s2 = nt.step + nt.len;
        if (nt.step % mlen + nt.len > mlen) {
          let debt = nt.step % mlen + nt.len - mlen;
          nt.len -= debt;
          while (debt > 0) {
            let len = debt > mlen ? mlen : debt;
            debt -= len;
            let new_note = {d: nt.d, alter: nt.alter, len: len};
            //console.log("Insert", v, n, nt.len, nt.step, len, debt, new_note);
            vc.notes.splice(n + 1, 0, new_note);
            vc.notes[n].startsTie = true;
            ++n;
          }
        }
      }
      if (s2 % mlen) {
        vc.notes.push({d: 0, alter: 10, len: mlen - s2 % mlen, startsTie: false});
      }
      //console.log(vc.notes);
    }
    this.saveState();
  }

  reset() {
    this.name = "New exercise";
    this.filename = "New-exercise";
    this.keysig = {
      name: 'Am',
      mode: 9, // 0 - major, 2 - dorian, 9 - aeolian
      fifths: 0, // Number of alterations near key
      base_note: 9, // Base tonic note (C - 0, Am - 9)
    };
    this.timesig = {
      beats_per_measure: 4,
      beat_type: 4,
      measure_len: 16
    };
    this.voices = [
      {
        clef: 'treble',
        name: 'Sop.',
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
        ]
      },
      {
        clef: 'treble',
        name: 'Alt.',
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
        ]
      },
      {
        clef: 'treble-8',
        name: 'Ten.',
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
        ]
      },
      {
        clef: 'bass',
        name: 'Bas.',
        notes: [
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
          {d: 0, alter: 0, len: 16, startsTie: false},
        ]
      },
    ];
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

  getClosestNote(v, pos) {
    for (let n = 0; n < this.voices[v].notes.length; ++n) {
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
          --n;
        }
      }
    }
  }

  constructor() {
    this.reset();
  }
}

export let nd = new NotesData();
