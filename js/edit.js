import {NotesData, nd} from "./NotesData.js";
import {abc2d, d2abc} from "./dataToAbc.js";
import {async_redraw, clicked, find_selection, MAX_ABC_NOTE, MIN_ABC_NOTE, state} from "./abchelper.js";
import {button_enabled_active} from "./uilib.js";

export let future = {
  advancing: false,
  alteration: '',
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
  return note.step % nd.time.measure_len + len <= nd.time.measure_len;
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
  if (len > note.len) {
    let debt = len - note.len;
    for (let n = el.note + 1; n < notes.length; ++n) {
      if (debt < notes[n].len) {
        NotesData.set_rest(notes, n);
        notes[n].len = notes[n].len - debt;
        notes[n].startsTie = false;
        break;
      }
      else {
        debt -= notes[n].len;
        notes.splice(n, 1);
        if (!debt) break;
      }
    }
  }
  else {
    notes.splice(el.note + 1, 0, {abc_note: 'z', abc_alter: '', len: note.len - len, startsTie: false});
    NotesData.set_rest(notes, el.note + 1);
  }
  note.len = len;
  note.startsTie = false;
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
  let notes = nd.voices[el.voice].notes;
  if (el.note) {
    clicked.note.note--;
  }
}

export function prev_note() {
  if (state.state !== 'ready') return;
  move_to_previous_note();
  find_selection();
  future.advancing = false;
  future.alteration = '';
  future.len = 0;
}

export function next_note() {
  if (state.state !== 'ready') return;
  if (move_to_next_note()) {
    async_redraw();
  } else {
    find_selection();
  }
  future.advancing = false;
  future.alteration = '';
  future.len = 0;
}

export function set_note(dc) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  let pd = 35;
  if (note.abc_note !== 'z' && !future.advancing) {
    pd = abc2d(note.abc_note);
  }
  else if (el.note && notes[el.note - 1].abc_note !== 'z') {
    pd = abc2d(notes[el.note - 1].abc_note);
  }
  let d = dc;
  if (note.abc_note === 'z' || future.advancing) {
    note.abc_alter = future.alteration;
  }
  while (pd - d > 3) d += 7;
  while (d - pd > 3) d -= 7;
  note.abc_note = d2abc(d);
  note.startsTie = false;
  if (el.note && notes[el.note - 1].abc_note !== note.abc_note) {
    notes[el.note - 1].startsTie = false;
  }
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len);
  }
  // Advance
  future.advancing = true;
  future.alteration = '';
  future.len = note.len;
  move_to_next_note();
  async_redraw();
}

export function set_rest(advance) {
  if (state.state !== 'ready') return;
  if (!clicked.element || !clicked.element.duration) return;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  NotesData.set_rest(notes, el.note);
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
    future.alteration = '';
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
  let d = abc2d(note.abc_note);
  return d + dnote < MAX_ABC_NOTE && d + dnote > MIN_ABC_NOTE;
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
  let d = abc2d(note.abc_note);
  note.abc_note = d2abc(d + 7 * doct);
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
  let d = abc2d(note.abc_note);
  note.abc_note = d2abc(d + dnote);
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
  if (note.abc_note === 'z' || future.advancing) {
    if (future.alteration === alt) future.alteration = "";
    else future.alteration = alt;
  }
  else {
    if (note.abc_alter === alt) {
      nd.voices[el.voice].notes[el.note].abc_alter = '';
    } else {
      nd.voices[el.voice].notes[el.note].abc_alter = alt;
    }
  }
  async_redraw();
}

function can_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  let notes = nd.voices[el.voice].notes;
  if (notes.length === el.note + 1) return false;
  return notes[el.note].abc_note === notes[el.note + 1].abc_note;
}

function can_pre_tie() {
  if (!clicked.element || !clicked.element.duration) return false;
  let el = nd.abc_charStarts[clicked.element.startChar];
  return el.note;
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

export function update_selection() {
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
    button_enabled_active('sharp', clicked.element.duration, future.alteration === '^');
    button_enabled_active('flat', clicked.element.duration, future.alteration === '_');
    button_enabled_active('natural', clicked.element.duration, future.alteration === '=');
  } else {
    button_enabled_active('sharp', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'sharp');
    button_enabled_active('flat', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'flat');
    button_enabled_active('natural', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'natural');
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
  future.alteration = '';
  future.len = 0;
}
