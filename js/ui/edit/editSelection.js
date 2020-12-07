import { selected, async_redraw } from "../../abc/abchelper.js";
import {state} from "../../abc/abchelper.js";
import { select_range } from "./select.js";
import {nd} from "../../notes/NotesData.js";
import { nclip } from "../../notes/NotesClipboard.js";
import { saveState } from "../../state/history.js";
import { stop_advancing } from "./editScore.js";
import { update_selection } from "../selection.js";
import { json_stringify_circular } from "../../core/string.js";

export function grow_selection_horizontal(right=true) {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    const voice = nd.voices[el.voice];
    const notes = voice.notes;
    // Check if no space left
    if (el.note - (right?0:1) < 0) return;
    if (el.note + (right?1:0) >= notes.length) return;
    const nt1 = notes[el.note - (right?0:1)];
    const nt2 = notes[el.note + (right?1:0)];
    select_range(el.voice, el.voice, nt1.step, nt2.step + nt2.len - 1, null, false);
  } else {
    if (selected.note.v2 < selected.note.v1) return;
    if (selected.note.n12 < selected.note.n11) return;
    const v1 = selected.note.v1;
    const v2 = selected.note.v2;
    // Calculate smin
    const voice = nd.voices[selected.note.v1];
    const notes = voice.notes;
    // Grow first voice with one note
    if (selected.note.n11 - (right?0:1) < 0) return;
    if (selected.note.n12 + (right?1:0) >= notes.length) return;
    const nt11 = notes[selected.note.n11 - (right?0:1)];
    const nt12 = notes[selected.note.n12 + (right?1:0)];
    let smin = nt11.step;
    let smax = nt12.step + nt12.len - 1;
    smin = nd.getCommonStart(v1, v2, smin);
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax, null, false);
  }
}

export function grow_selection_vertical(down=true) {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    if (el.voice - (down?0:1) < 0) return;
    if (el.voice + (down?1:0) >= nd.voices.length) return;
    const v1 = el.voice - (down?0:1);
    const v2 = el.voice + (down?1:0);
    const voice = nd.voices[el.voice];
    const notes = voice.notes;
    const nt1 = notes[el.note];
    let smin = nt1.step;
    let smax = nt1.step + nt1.len - 1;
    smin = nd.getCommonStart(v1, v2, smin);
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax, null, false);
  } else {
    if (selected.note.v2 < selected.note.v1) return;
    if (selected.note.n12 < selected.note.n11) return;
    if (selected.note.v1 - (down?0:1) < 0) return;
    if (selected.note.v2 + (down?1:0) >= nd.voices.length) return;
    const v1 = selected.note.v1 - (down?0:1);
    const v2 = selected.note.v2 + (down?1:0);
    const voice = nd.voices[selected.note.v1];
    const notes = voice.notes;
    const nt11 = notes[selected.note.n11];
    const nt12 = notes[selected.note.n12];
    let smin = nt11.step;
    let smax = nt12.step + nt12.len - 1;
    smin = nd.getCommonStart(v1, v2, smin);
    smax = nd.getCommonEnding(v1, v2, smax);
    select_range(v1, v2, smin, smax, null, false);
  }
}

export function select_mode() {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  if (nclip.mode === 'select') {
    nclip.mode = 'standby';
  } else {
    nclip.mode = 'select';
  }
  update_selection();
}

export function select_from_to(v1, v2, n1, n2) {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  const nt1 = nd.voices[v1].notes[n1];
  const nt2 = nd.voices[v2].notes[n2];
  let vmin = Math.min(v1, v2);
  let vmax = Math.max(v1, v2);
  let smin = Math.min(nt1.step, nt2.step);
  let smax = Math.max(nt1.step + nt1.len - 1, nt2.step + nt2.len - 1);
  smin = nd.getCommonStart(vmin, vmax, smin);
  smax = nd.getCommonEnding(vmin, vmax, smax);
  select_range(vmin, vmax, smin, smax, null, false);
}

export function copy_selection(quiet=false) {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    const v = el.voice;
    const nt = nd.voices[v].notes[el.note];
    console.log('Copy one note', nt, v);
    if (nclip.copy(v, v, nt.step, nt.step + nt.len - 1)) {
      if (!quiet) {
        alertify.notify(`Copied selection`, 'success');
      }
      return true;
    }
  } else {
    console.log('Copy selection', json_stringify_circular(selected));
    if (nclip.copy(selected.note.v1, selected.note.v2, selected.note.s1, selected.note.s2)) {
      if (!quiet) {
        alertify.notify(`Copied selection`, 'success');
      }
      return true;
    }
  }
}

export function paste_selection(redraw=true) {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;
  if (!nclip.voices.length) return;
  let el = selected.note;
  // Check if voices are locked
  if (nd.voicesAreLocked(el.voice, el.voice + nclip.source.v2 - nclip.source.v1)) {
    alertify.error('Note editing is prohibited in this part. Please click part name and disable protection.', 10);
    return;
  }
  const result = nclip.paste(el.voice, el.note);
  if (result) {
    alertify.warning(result);
    return;
  }
  stop_advancing();
  nd.update_note_steps();
  const s1 = nd.voices[el.voice].notes[el.note].step;
  const len = nclip.source.s2 - nclip.source.s1;
  select_range(el.voice, el.voice + nclip.source.v2 - nclip.source.v1, s1, s1 + len, null, false);
  saveState();
  if (redraw) {
    async_redraw();
  }
}
