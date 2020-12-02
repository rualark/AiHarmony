import {async_redraw, selected, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {future, check_voice_locked} from "./editNote.js";
import {saveState} from "../../state/history.js";

export function can_tie() {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (nd.voices[el.voice].locked) return false;
  let notes = nd.voices[el.voice].notes;
  if (notes.length === el.note + 1) return false;
  return notes[el.note].d === notes[el.note + 1].d;
}

export function can_pre_tie() {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el.note) return false;
  if (nd.voices[el.voice].locked) return false;
  return nd.voices[el.voice].notes[el.note - 1].d !== 0;
}

export function is_pre_tie() {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  return el.note && nd.voices[el.voice].notes[el.note - 1].startsTie;
}

export function toggle_tie() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  if (check_voice_locked(el)) return;
  let notes = nd.voices[el.voice].notes;
  if (future.advancing) {
    if (!el.note) return;
    notes[el.note - 1].startsTie = !notes[el.note - 1].startsTie;
  } else {
    if (notes[el.note].startsTie) {
      notes[el.note].startsTie = false;
    } else {
      if (can_tie()) notes[el.note].startsTie = true;
    }
  }
  saveState();
  async_redraw();
}