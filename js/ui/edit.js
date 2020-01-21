import {nd} from "../notes/NotesData.js";
import {async_redraw, clicked, find_selection, MAX_ABC_NOTE, MIN_ABC_NOTE, state} from "../abc/abchelper.js";
import {button_enabled, button_enabled_active} from "./lib/uilib.js";
import {save_state} from "../state.js";

export let future = {
  advancing: false,
  alteration: 10,
  len: 0
};

function can_dot() {
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
  if (note.len % 3 === 0) set_len(Math.round(len * 2 / 3));
  else set_len(Math.round(len * 1.5));
}

function can_len(len) {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  return note.step % nd.timesig.measure_len + len <= nd.timesig.measure_len;
}

export function set_len(len) {
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
  nd.set_len(el.voice, el.note, len);
  async_redraw();
}

function move_to_next_note() {
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  if (el.note === notes.length - 1) {
    nd.append_measure();
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
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
  save_state();
  update_selection();
}

export function next_note() {
  if (state.state !== 'ready') return;
  if (move_to_next_note()) {
    async_redraw();
  } else {
    find_selection();
  }
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
  save_state();
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
  nd.set_note(el.voice, el.note, d);
  note.startsTie = false;
  if (el.note && notes[el.note - 1].d !== note.d) {
    notes[el.note - 1].startsTie = false;
  }
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len);
  }
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
  future.advancing = false;
  future.len = 0;
  future.alteration = 10;
}

export function set_rest(advance) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  nd.set_rest(el.voice, el.note);
  if (el.note) {
    notes[el.note - 1].startsTie = false;
  }
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len);
  }
  if (advance) {
    // Advance
    future.advancing = true;
    future.alteration = 10;
    future.len = note.len;
    move_to_next_note();
  }
  async_redraw();
}

function can_increment_note(dnote) {
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
  note.startsTie = false;
  if (n) {
    notes[n - 1].startsTie = false;
  }
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
  note.startsTie = false;
  if (n) {
    notes[n - 1].startsTie = false;
  }
  async_redraw();
}

export function toggle_alteration(alt) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let note = nd.voices[el.voice].notes[el.note];
  if (!note.d || future.advancing) {
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

function can_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  if (notes.length === el.note + 1) return false;
  return notes[el.note].d === notes[el.note + 1].d;
}

function can_pre_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  if (!el.note) return false;
  return nd.voices[el.voice].notes[el.note - 1].d !== 0;
}

function is_pre_tie() {
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
  if (typeof clicked.element.abselem === 'undefined') return;
  nd.add_voice(clicked.voice + 1);
  async_redraw();
}

export function del_part() {
  if (typeof clicked.element.abselem === 'undefined') return;
  if (nd.voices.length === 1) return;
  nd.del_voice(clicked.voice);
  clicked.note = null;
  clicked.element = {};
  async_redraw();
}

export function update_selection() {
  button_enabled('add_part', typeof clicked.element.abselem !== 'undefined');
  button_enabled('del_part', typeof clicked.element.abselem !== 'undefined' && nd.voices.length > 1);
  button_enabled_active('note_c', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 0);
  button_enabled_active('note_d', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 1);
  button_enabled_active('note_e', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 2);
  button_enabled_active('note_f', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 3);
  button_enabled_active('note_g', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 4);
  button_enabled_active('note_a', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 5);
  button_enabled_active('note_b', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 6);
  button_enabled_active('rest', clicked.element.duration, clicked.element.rest && clicked.element.rest.type === 'rest');
  button_enabled_active('up8', can_increment_note(7), false);
  button_enabled_active('down8', can_increment_note(-7), false);
  if (clicked.element.rest && clicked.element.rest.type === 'rest' || future.advancing) {
    button_enabled_active('dblflat', clicked.element.duration, future.alteration === -2);
    button_enabled_active('flat', clicked.element.duration, future.alteration === -1);
    button_enabled_active('natural', clicked.element.duration, future.alteration === 0);
    button_enabled_active('sharp', clicked.element.duration, future.alteration === 1);
    button_enabled_active('dblsharp', clicked.element.duration, future.alteration === 2);
  } else {
    button_enabled_active('dblflat', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'dblflat');
    button_enabled_active('flat', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'flat');
    button_enabled_active('natural', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'natural');
    button_enabled_active('sharp', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'sharp');
    button_enabled_active('dblsharp', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'dblsharp');
  }
  //console.log('nl', future.advancing, future.len);
  if (future.advancing && future.len) {
    button_enabled_active('len2', clicked.element.duration, [1].includes(future.len));
    button_enabled_active('len3', can_len(2), [2, 3].includes(future.len));
    button_enabled_active('len4', can_len(4), [4, 6].includes(future.len));
    button_enabled_active('len5', can_len(8), [8, 12].includes(future.len));
    button_enabled_active('len6', can_len(16), [16, 24].includes(future.len));
    button_enabled_active('dot', can_dot(), [3, 6, 12, 24].includes(future.len));
  }
  else {
    button_enabled_active('len2', clicked.element.duration, [0.0625].includes(clicked.element.duration));
    button_enabled_active('len3', can_len(2), [0.125, 0.1875].includes(clicked.element.duration));
    button_enabled_active('len4', can_len(4), [0.25, 0.375].includes(clicked.element.duration));
    button_enabled_active('len5', can_len(8), [0.5, 0.75].includes(clicked.element.duration));
    button_enabled_active('len6', can_len(16), [1, 1.5].includes(clicked.element.duration));
    button_enabled_active('dot', can_dot(), [0.375, 0.75, 1.5].includes(clicked.element.duration));
  }
  if (future.advancing && future.len) {
    button_enabled_active('tie', can_pre_tie(), is_pre_tie());
  } else {
    button_enabled_active('tie', can_tie(), clicked.element.abselem && clicked.element.abselem.startTie);
  }
}

export function stop_advancing() {
  future.advancing = false;
  future.alteration = 10;
  future.len = 0;
}

export function new_file() {
  nd.reset();
  clicked.note = {voice: 0, note: 0};
  save_state();
  async_redraw();
}
