import { selected } from "../../abc/abchelper.js";
import { select_range } from "./select.js";
import {nd} from "../../notes/NotesData.js";
import { json_stringify_circular } from "../../core/string.js";

export function grow_selection_right() {
  if (selected.note == null) return;
  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    const voice = nd.voices[el.voice];
    const notes = voice.notes;
    if (el.note >= notes.length - 1) return;
    const nt1 = notes[el.note];
    const nt2 = notes[el.note + 1];
    select_range(el.voice, el.voice, nt1.step, nt2.step);
  } else {
    if (selected.note.v2 < selected.note.v1) return;
    if (selected.note.n12 < selected.note.n11) return;
    const v1 = selected.note.v1;
    const v2 = selected.note.v2;
    // Calculate smin
    const voice = nd.voices[selected.note.v1];
    const notes = voice.notes;
    const nt11 = notes[selected.note.n11];
    const smin = nt11.step;
    // Grow first voice with one note
    if (selected.note.n12 >= notes.length - 1) return;
    const nt12 = notes[selected.note.n12 + 1];
    let smax = nt12.step + nt12.len - 1;
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax);
  }
}

export function grow_selection_down() {
  if (selected.note == null) return;
  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    if (el.voice >= nd.voices.length - 1) return;
    const v1 = el.voice;
    const v2 = v1 + 1;
    const voice = nd.voices[el.voice];
    const notes = voice.notes;
    const nt1 = notes[el.note];
    let smin = nt1.step;
    let smax = nt1.step + nt1.len - 1;
    smin = nd.getCommonStart(v1, v2, smin);
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax);
  } else {
    if (selected.note.v2 < selected.note.v1) return;
    if (selected.note.n12 < selected.note.n11) return;
    if (selected.note.v2 >= nd.voices.length - 1) return;
    const v1 = selected.note.v1;
    const v2 = selected.note.v2 + 1;
    const voice = nd.voices[selected.note.v1];
    const notes = voice.notes;
    const nt11 = notes[selected.note.n11];
    const nt12 = notes[selected.note.n12];
    let smin = nt11.step;
    let smax = nt12.step + nt12.len - 1;
    smin = nd.getCommonStart(v1, v2, smin);
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax);
  }
}
