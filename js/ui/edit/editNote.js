import {nd} from "../../notes/NotesData.js";
import {async_redraw, selected, highlightNote, MAX_ABC_NOTE, MIN_ABC_NOTE, state} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import {stop_advancing} from "./editScore.js";
import {move_to_next_note, move_to_previous_note} from "./select.js";
import {set_len} from "./editLen.js";

export let future = {
  advancing: false,
  alteration: 10,
  len: 0
};

export function set_note(dc) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  let pd = 35;
  if (note.d && !future.advancing) {
    pd = note.d;
  }
  else if (el.note && notes[el.note - 1].d) {
    pd = notes[el.note - 1].d;
  }
  let d = dc;
  if (!note.d || future.advancing) {
    note.alter = future.alteration;
  }
  while (pd - d > 3) d += 7;
  while (d - pd > 3) d -= 7;
  nd.set_note(el.voice, el.note, d, false);
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len);
  }
  saveState();
  // Advance
  future.advancing = true;
  future.alteration = 10;
  future.len = note.len;
  move_to_next_note();
  async_redraw();
}

export function repeat_element() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let n = el.note;
  if (future.advancing) {
    if (!n) return;
  } else {
    move_to_next_note();
    highlightNote();
    future.advancing = true;
    future.len = notes[n].len;
    ++n;
  }
  future.alteration = notes[n-1].alter;
  if (!notes[n - 1].d) {
    set_rest(true);
  } else {
    set_note(notes[n - 1].d % 7);
  }
  move_to_previous_note();
  stop_advancing();
}

export function set_rest(advance) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  nd.set_rest(el.voice, el.note, false);
  if (el.note) {
    notes[el.note - 1].startsTie = false;
  }
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len, false);
  }
  saveState();
  if (advance) {
    // Advance
    future.advancing = true;
    future.alteration = 10;
    future.len = note.len;
    move_to_next_note();
  }
  async_redraw();
}

export function can_increment_note(dnote) {
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let note = nd.voices[el.voice].notes[n];
  let d = note.d;
  return d && d + dnote < MAX_ABC_NOTE && d + dnote > MIN_ABC_NOTE;
}

export function increment_octave(doct) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  if (!can_increment_note(doct * 7)) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let notes = nd.voices[el.voice].notes;
  let note = notes[n];
  let d = note.d;
  nd.set_note(el.voice, n, d + 7 * doct);
  async_redraw();
}

export function increment_note(dnote) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  if (!can_increment_note(dnote)) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let notes = nd.voices[el.voice].notes;
  let note = notes[n];
  let d = note.d;
  nd.set_note(el.voice, n, d + dnote);
  async_redraw();
}

export function toggle_alter(alt) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let note = nd.voices[el.voice].notes[el.note];
  if (!note.d) {
    future.advancing = true;
    if (future.alteration === alt) future.alteration = 10;
    else future.alteration = alt;
  }
  else {
    if (note.alter === alt) {
      nd.set_alter(el.voice, el.note, 10);
    } else {
      nd.set_alter(el.voice, el.note, alt);
    }
  }
  async_redraw();
}

