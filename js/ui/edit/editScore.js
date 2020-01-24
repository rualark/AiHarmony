import {async_redraw, clicked, find_selection, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {update_selection} from "../notation.js";
import {future} from "./editNote.js";

export function stop_advancing() {
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
}

export function del_bar() {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return false;
  if (clicked.note == null) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let nt = nd.voices[el.voice].notes.slice(-1)[0];
  if (nt.step + nt.len <= nd.timesig.measure_len) return false;
  nd.delBar(el.voice, el.note);
  if (el.note >= nd.voices[el.voice].notes.length) {
    clicked.note.note = nd.voices[el.voice].notes.length - 1;
  }
  stop_advancing();
  saveState();
  async_redraw();
}

export function voiceChange(dv) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return false;
  if (clicked.note == null) return false;
  if (clicked.note.voice + dv < 0 || clicked.note.voice + dv >= nd.voices.length) return false;
  let note = nd.voices[clicked.note.voice].notes[clicked.note.note];
  clicked.note.voice += dv;
  clicked.note.note = nd.getClosestNote(clicked.note.voice, note.step);
  find_selection();
  stop_advancing();
  saveState();
  update_selection();
}

export function new_file() {
  if (state.state !== 'ready') return;
  nd.reset();
  saveState();
  async_redraw();
}

export function del_part() {
  if (state.state !== 'ready') return;
  if (typeof clicked.element.abselem === 'undefined') return;
  if (nd.voices.length === 1) return;
  nd.del_voice(clicked.voice);
  clicked.note = null;
  clicked.element = {};
  async_redraw();
}

export function add_part() {
  if (state.state !== 'ready') return;
  if (nd.voices.length > 62) return;
  if (typeof clicked.element.abselem === 'undefined') return;
  nd.add_voice(clicked.voice + 1);
  async_redraw();
}