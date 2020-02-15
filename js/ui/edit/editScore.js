import {async_redraw, selected, highlightNote, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {update_selection} from "../notation.js";
import {future} from "./editNote.js";
import {showPartModal} from "../modal/partModal.js";

export function stop_advancing() {
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
}

export function del_bar() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return false;
  if (selected.note == null) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  let nt = nd.voices[el.voice].notes.slice(-1)[0];
  if (nt.step + nt.len <= nd.timesig.measure_len) return false;
  nd.delBar(el.voice, el.note);
  if (el.note >= nd.voices[el.voice].notes.length) {
    selected.note = {
      voice: selected.note.voice,
      note: nd.voices[el.voice].notes.length - 1
    };
  }
  stop_advancing();
  saveState();
  async_redraw();
}

export function voiceChange(dv) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return false;
  if (selected.note == null) return false;
  if (selected.note.voice + dv < 0 || selected.note.voice + dv >= nd.voices.length) return false;
  let note = nd.voices[selected.note.voice].notes[selected.note.note];
  selected.note = {
    voice: selected.note.voice + dv,
    note: nd.getClosestNote(selected.note.voice + dv, note.step)
  };
  highlightNote();
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
  if (typeof selected.element.abselem === 'undefined') return;
  if (nd.voices.length === 1) return;
  nd.del_voice(selected.voice);
  selected.note = null;
  selected.element = {};
  async_redraw();
}

export function add_part() {
  if (state.state !== 'ready') return;
  if (nd.voices.length > 62) return;
  if (typeof selected.element.abselem === 'undefined') return;
  nd.add_voice(selected.voice + 1);
  async_redraw();
}

export function rename_part() {
  if (state.state !== 'ready') return;
  showPartModal(selected.voice);
}

