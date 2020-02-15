import {async_redraw, selected, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {future} from "./editNote.js";
import {update_selection} from "../selection.js";

export function can_len(len) {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  return note.step % nd.timesig.measure_len + len <= nd.timesig.measure_len;
}

export function can_dot() {
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  if (note.len % 3 === 0) return true;
  return can_len(Math.round(note.len * 1.5));
}

export function set_len(len, saveState = true) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  //console.log(note.step, nd.time.measure_len, len);
  if (!can_len(len)) return;
  if (future.advancing) {
    future.len = len;
    update_selection();
    return;
  }
  if (len === note.len) return;
  nd.set_len(el.voice, el.note, len, saveState);
  async_redraw();
}

export function toggle_dot() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  let len = note.len;
  if (future.advancing) {
    len = future.len;
  }
  //console.log(len, note.len % 3 === 0);
  if (len % 3 === 0) set_len(Math.round(len * 2 / 3));
  else set_len(Math.round(len * 1.5));
}