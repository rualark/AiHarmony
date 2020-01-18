import {abc2alter, abc2d, d2abc, keysig_imprint} from "./notehelper.js";

class NotesData {
  set_rest(v, n) {
    this.set_note(v, n, 0);
    this.voices[v].notes[n].alter = 10;
    this.voices[v].notes[n].startsTie = false;
    if (n) {
      this.voices[v].notes[n - 1].startsTie = false;
    }
  }

  get_voice_len(v) {
    let len = 0;
    for (let n = 0; n < this.voices[v].notes.length; ++n) {
      let nt = this.voices[v].notes[n];
      len += nt.len;
    }
    return len;
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
  }

  del_voice(v) {
    if (v == null) return;
    this.voices.splice(v, 1);
  }

  append_measure() {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      vc.notes.push({d: 0, alter: 10, len: this.timesig.measure_len, startsTie: false});
    }
  }

  set_keysig(keysig) {
    let ki1 = keysig_imprint(this.keysig.fifths);
    let ki2 = keysig_imprint(keysig.fifths);
    console.log(ki1, ki2);
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
            console.log("Insert", v, n, nt.len, nt.step, len, debt, new_note);
            vc.notes.splice(n + 1, 0, new_note);
            vc.notes[n].startsTie = true;
            ++n;
          }
        }
      }
      if (s2 % mlen) {
        vc.notes.push({d: 0, alter: 10, len: mlen - s2 % mlen, startsTie: false});
      }
      console.log(vc.notes);
    }
  }

  constructor() {
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
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'c', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'd', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'e', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'f', abc_alter: '', len: 4, startsTie: false},
        ]
      },
      {
        clef: 'treble',
        name: 'Alt.',
        notes: [
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
        ]
      },
      {
        clef: 'treble-8',
        name: 'Ten.',
        notes: [
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'E', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'F', abc_alter: '', len: 4, startsTie: false},
        ]
      },
      {
        clef: 'bass',
        name: 'Bas.',
        notes: [
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 2, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 2, startsTie: true},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '^', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '_', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '=', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'D', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'C', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'B,', abc_alter: '', len: 4, startsTie: false},
          {abc_note: 'A,', abc_alter: '', len: 4, startsTie: false},
        ]
      }
    ];
    this.abc_charStarts = [];
    this.update_d();
  }

  update_d() {
    for (let v=0; v<this.voices.length; ++v) {
      let vc = this.voices[v];
      for (let n = 0; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        nt.d = abc2d(nt.abc_note);
        nt.alter = abc2alter(nt.abc_alter);
      }
    }
  }

  set_note(v, n, d) {
    //this.voices[v].notes[n].abc_note = d2abc(d);
    this.voices[v].notes[n].d = d;
  }
}

export let nd = new NotesData();
