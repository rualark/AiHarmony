import {async_redraw, clicked, find_selection, state} from "../../abc/abchelper.js";
import {stop_advancing} from "./editScore.js";
import {saveState} from "../../state/history.js";
import {update_selection} from "../notation.js";
import {nd} from "../../notes/NotesData.js";

export function move_to_next_note(saveState = true) {
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  if (el.note === notes.length - 1) {
    nd.append_measure(saveState);
    clicked.note.note++;
    return true;
  }
  clicked.note.note++;
  return false;
}

export function next_note() {
  if (state.state !== 'ready') return;
  if (move_to_next_note(false)) {
    async_redraw();
  } else {
    find_selection();
  }
  stop_advancing();
  saveState();
  update_selection();
}

export function move_to_previous_note() {
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  if (el.note) {
    clicked.note.note--;
  }
}

export function prev_note() {
  if (state.state !== 'ready') return;
  move_to_previous_note();
  find_selection();
  stop_advancing();
  saveState();
  update_selection();
}