import {nd} from "./NotesData.js";
import { state2storage } from "../state/state.js";

export class NotesClipboard {
  constructor() {
    this.clear();
  }

  clear() {
    this.voices = [];
    this.source = {};
  }

  copy(v1, v2, s1, s2) {
    if (v1 > v2 || s1 > s2) return;
    this.clear();
    this.source = {
      v1: v1,
      v2: v2,
      s1: s1,
      s2: s2
    };
    for (let v=v1; v<=v2; ++v) {
      const vc = nd.voices[v];
      const n1 = nd.getClosestNote(v, s1);
      let fragment = {
        notes: []
      };
      for (let n = n1; n < vc.notes.length; ++n) {
        let nt = vc.notes[n];
        if (nt.step > s2) {
          break;
        }
        let nt_copy = JSON.parse(JSON.stringify(nt));
        if (nt.step + nt.len > s2) {
          nt_copy.startsTie = false;
        }
        fragment.notes.push(nt_copy);
      }
      this.voices.push(fragment);
    }
    return true;
  }

  paste(v1, n) {
    if (!this.voices) return "Clipboard is empty";
    const mlen = nd.timesig.measure_len;
    const v2 = v1 + this.voices.length - 1;
    // Add voices if needed
    let voices_added = 0;
    while (v2 >= nd.voices.length) {
      nd.add_voice(nd.voices.length);
      ++voices_added;
    }
    if (voices_added) nd.update_note_steps();
    const s1 = nd.voices[v1].notes[n].step;
    const s2 = s1 + (this.source.s2 - this.source.s1);
    // Append measures if needed to all voices
    const last_note = nd.voices[0].notes[nd.voices[0].notes.length - 1];
    const new_measures = Math.floor((s2 - last_note.step + last_note.len) / mlen);
    if (new_measures > 0) {
      nd.append_measure(false);
      nd.update_note_steps();
    }
    for (let v=v1; v<=v2; ++v) {
      const vc = nd.voices[v];
      const notes = vc.notes;
      const n1 = nd.getClosestNote(v, s1);
      const n2 = nd.getClosestNote(v, s2);
      let left_rest = notes[n2].step + notes[n2].len - 1 - s2;
      let new_notes = JSON.parse(JSON.stringify(this.voices[v - v1].notes));
      if (left_rest) {
        new_notes.push({d: 0, alter: 10, len: left_rest, startsTie: false});
      }
      // Remove old notes and add new
      notes.splice(
        n1,
        n2 - n1 + 1,
        ...new_notes,
      );
    }
  }
};

export let nclip = new NotesClipboard();
