import {async_redraw, selected, highlightNote, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {update_selection} from "../selection.js";
import {future} from "./editNote.js";
import {showPartModal} from "../modal/partModal.js";
import { storage2archiveStorage } from "../../state/state.js";
import { enableKeys } from "../commands.js";
import { name2filename } from "../../core/string.js";

export function stop_advancing() {
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
}

export function insert_bar() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return false;
  if (selected.note == null) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  nd.insert_measure(el.voice, el.note);
  selected.note = {
    voice: selected.note.voice,
    note: el.note + 1
  };
  stop_advancing();
  async_redraw();
}

export function del_bar() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return false;
  if (selected.note == null) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  // Check that there are more than 1 measures (do not allow to delete last measure)
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
  if (!selected.note) return false;
  if (selected.note == null) return false;
  if (selected.note.voice + dv < 0 || selected.note.voice + dv >= nd.voices.length) return false;
  let note = nd.voices[selected.note.voice].notes[selected.note.note];
  selected.note = {
    voice: selected.note.voice + dv,
    note: nd.getClosestNote(selected.note.voice + dv, note.step)
  };
  stop_advancing();
  highlightNote();
  saveState();
  update_selection();
}

export function new_file(parts=4) {
  if (state.state !== 'ready') return;
  storage2archiveStorage(1);
  nd.reset(parts);
  saveState(true);
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

export function edit_exercise_name() {
  enableKeys(false);
  bootbox.prompt({
    title: "Exercise name",
    value: nd.name,
    callback: function(value) {
      enableKeys(true);
      if (value == null) return;
      nd.set_name(value);
      nd.set_fileName(name2filename(value));
      $('#filename').html('&nbsp;&nbsp;' + nd.name);
      saveState(false);
    }
  });
}
