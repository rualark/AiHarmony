import {nd} from "../notes/NotesData.js";
import {async_redraw, clicked, find_selection, MAX_ABC_NOTE, MIN_ABC_NOTE, state} from "../abc/abchelper.js";
import {saveState} from "../state/history.js";
import {update_selection} from "./notation.js";

export let future = {
  advancing: false,
  alteration: 10,
  len: 0
};

export function can_dot() {
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  if (note.len % 3 === 0) return true;
  return can_len(Math.round(note.len * 1.5));
}

export function toggle_dot() {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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

export function can_len(len) {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  return note.step % nd.timesig.measure_len + len <= nd.timesig.measure_len;
}

export function set_len(len, saveState=true) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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

function move_to_next_note(saveState=true) {
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

function move_to_previous_note() {
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

export function set_note(dc) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let n = el.note;
  if (future.advancing) {
    if (!n) return;
  } else {
    move_to_next_note();
    find_selection();
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
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  if (!clicked.element || !clicked.element.duration) return;
  if (!can_increment_note(doct * 7)) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  if (!clicked.element || !clicked.element.duration) return;
  if (!can_increment_note(dnote)) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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

export function can_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  if (notes.length === el.note + 1) return false;
  return notes[el.note].d === notes[el.note + 1].d;
}

export function can_pre_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  if (!el.note) return false;
  return nd.voices[el.voice].notes[el.note - 1].d !== 0;
}

export function is_pre_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  return el.note && nd.voices[el.voice].notes[el.note - 1].startsTie;
}

export function toggle_tie() {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
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
  async_redraw();
}

export function add_part() {
  if (state.state !== 'ready') return;
  if (nd.voices.length > 62) return;
  if (typeof clicked.element.abselem === 'undefined') return;
  nd.add_voice(clicked.voice + 1);
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

export function stop_advancing() {
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
}

export function new_file() {
  if (state.state !== 'ready') return;
  nd.reset();
  clicked.note = {voice: 0, note: 0};
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

