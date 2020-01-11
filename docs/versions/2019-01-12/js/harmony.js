import {abc2d, d2abc, dataToAbc} from './dataToAbc.js';
import {nd_append_measure, nd_set_rest, notesData} from "./notesData.js";
import {json_stringify_circular} from "./lib.js";

let abcjs;
let clicked_element = {};
let clicked_classes = '';
let clicked_note;
let advancing_input = false;
let next_alteration = '';
let next_len = 0;

document.getElementById('zoom-in').onclick=function(){ notation_zoom(1.1); return false; };
document.getElementById('zoom-out').onclick=function(){ notation_zoom(0.9); return false; };
document.getElementById('sharp').onclick=function(){ toggle_alteration('^'); return false; };
document.getElementById('natural').onclick=function(){ toggle_alteration('='); return false; };
document.getElementById('flat').onclick=function(){ toggle_alteration('_'); return false; };
document.getElementById('rest').onclick=function(){ set_rest(); return false; };
document.getElementById('note_c').onclick=function(){ set_note(0); return false; };
document.getElementById('note_d').onclick=function(){ set_note(1); return false; };
document.getElementById('note_e').onclick=function(){ set_note(2); return false; };
document.getElementById('note_f').onclick=function(){ set_note(3); return false; };
document.getElementById('note_g').onclick=function(){ set_note(4); return false; };
document.getElementById('note_a').onclick=function(){ set_note(5); return false; };
document.getElementById('note_b').onclick=function(){ set_note(6); return false; };
document.getElementById('up8').onclick=function(){ set_octave(1); return false; };
document.getElementById('down8').onclick=function(){ set_octave(-1); return false; };
document.getElementById('tie').onclick=function(){ toggle_tie(); return false; };
document.getElementById('len2').onclick=function(){ set_len(1); return false; };
document.getElementById('len3').onclick=function(){ set_len(2); return false; };
document.getElementById('len4').onclick=function(){ set_len(4); return false; };
document.getElementById('len5').onclick=function(){ set_len(8); return false; };
document.getElementById('len6').onclick=function(){ set_len(16); return false; };
document.getElementById('dot').onclick=function(){ toggle_dot(); return false; };

function can_dot() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  if (note.len % 3 === 0) return true;
  return can_len(Math.round(note.len * 1.5));
}

function toggle_dot() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  let len = note.len;
  if (advancing_input) {
    len = next_len;
  }
  if (note.len % 3 === 0) set_len(Math.round(len * 2 / 3));
  else set_len(Math.round(len * 1.5));
}

function can_len(len) {
  if (!clicked_element || !clicked_element.duration) return false;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  return note.step % notesData.time.measure_len + len <= notesData.time.measure_len;
}

function set_len(len) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  //console.log(note.step, notesData.time.measure_len, len);
  if (!can_len(len)) return;
  if (advancing_input) {
    next_len = len;
    update_selection(false);
    return;
  }
  if (len === note.len) return;
  if (len > note.len) {
    let debt = len - note.len;
    for (let n = el.note + 1; n < notes.length; ++n) {
      if (debt < notes[n].len) {
        nd_set_rest(notes, n);
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
    nd_set_rest(notes, el.note + 1);
  }
  note.len = len;
  note.startsTie = false;
  async_redraw();
}

function move_to_next_note() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  if (el.note === notes.length -1) {
    nd_append_measure(notesData);
  }
  clicked_note.note++;
}

function set_note(dc) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  let pd = 35;
  if (note.abc_note !== 'z' && !advancing_input) {
    pd = abc2d(note.abc_note);
  }
  else if (el.note && notes[el.note - 1].abc_note !== 'z') {
    pd = abc2d(notes[el.note - 1].abc_note);
  }
  let d = dc;
  if (note.abc_note === 'z' || advancing_input) {
    note.abc_alter = next_alteration;
  }
  while (pd - d > 3) d += 7;
  while (d - pd > 3) d -= 7;
  note.abc_note = d2abc(d);
  note.startsTie = false;
  if (el.note && notes[el.note - 1].abc_note !== note.abc_note) {
    notes[el.note - 1].startsTie = false;
  }
  if (advancing_input && next_len) {
    advancing_input = false;
    set_len(next_len);
  }
  // Advance
  advancing_input = true;
  next_alteration = '';
  next_len = note.len;
  move_to_next_note();
  async_redraw();
}

function set_rest() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  nd_set_rest(notes, el.note);
  if (el.note) {
    notes[el.note - 1].startsTie = false;
  }
  if (advancing_input && next_len) {
    advancing_input = false;
    set_len(next_len);
  }
  // Advance
  advancing_input = true;
  next_alteration = '';
  next_len = note.len;
  move_to_next_note();
  async_redraw();
}

function can_octave(doct) {
  if (doct === 1) return clicked_element.pitches && clicked_element.pitches[0].pitch < 30;
  else return clicked_element.pitches && clicked_element.pitches[0].pitch > -20;
}

function set_octave(doct) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let d = abc2d(notesData.voices[el.voice].notes[el.note].abc_note);
  let note = notesData.voices[el.voice].notes[el.note];
  note.abc_note = d2abc(d + 7 * doct);
  note.startsTie = false;
  async_redraw();
}

function toggle_alteration(alt) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let note = notesData.voices[el.voice].notes[el.note];
  if (note.abc_note === 'z' || advancing_input) {
    if (next_alteration === alt) next_alteration = "";
    else next_alteration = alt;
  }
  else {
    if (note.abc_alter === alt) {
      notesData.voices[el.voice].notes[el.note].abc_alter = '';
    } else {
      notesData.voices[el.voice].notes[el.note].abc_alter = alt;
    }
  }
  async_redraw();
}

function can_tie() {
  if (!clicked_element || !clicked_element.duration) return false;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  if (notes.length === el.note + 1) return false;
  return notes[el.note].abc_note === notes[el.note + 1].abc_note;
}

function can_pre_tie() {
  if (!clicked_element || !clicked_element.duration) return false;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  return el.note;
}

function is_pre_tie() {
  if (!clicked_element || !clicked_element.duration) return false;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  return el.note && notesData.voices[el.voice].notes[el.note - 1].startsTie;
}

function toggle_tie() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  if (advancing_input) {
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

function button_enabled_active(id, enabled, active) {
  if (active) {
    $('#' + id).removeClass("btn-outline-white").addClass("btn-lblue");
  } else {
    $('#' + id).removeClass("btn-lblue").addClass("btn-outline-white");
  }
  if (enabled) {
    $('#' + id).removeClass("disabled");
  } else {
    $('#' + id).addClass("disabled");
  }
}

function update_button(par, vals, id) {
  button_enabled_active(id, par && vals.includes(par));
}

function update_selection(clicked) {
  button_enabled_active('note_c', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 0);
  button_enabled_active('note_d', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 1);
  button_enabled_active('note_e', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 2);
  button_enabled_active('note_f', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 3);
  button_enabled_active('note_g', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 4);
  button_enabled_active('note_a', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 5);
  button_enabled_active('note_b', clicked_element.duration, clicked_element.pitches && (77 + clicked_element.pitches[0].pitch) % 7 === 6);
  button_enabled_active('rest', clicked_element.duration, clicked_element.rest && clicked_element.rest.type === 'rest');
  button_enabled_active('up8', can_octave(1), false);
  button_enabled_active('down8', can_octave(-1), false);
  if (clicked_element.rest && clicked_element.rest.type === 'rest' || advancing_input) {
    button_enabled_active('sharp', clicked_element.duration, next_alteration === '^');
    button_enabled_active('flat', clicked_element.duration, next_alteration === '_');
    button_enabled_active('natural', clicked_element.duration, next_alteration === '=');
  } else {
    button_enabled_active('sharp', clicked_element.duration, clicked_element.pitches && clicked_element.pitches[0].accidental === 'sharp');
    button_enabled_active('flat', clicked_element.duration, clicked_element.pitches && clicked_element.pitches[0].accidental === 'flat');
    button_enabled_active('natural', clicked_element.duration, clicked_element.pitches && clicked_element.pitches[0].accidental === 'natural');
  }
  console.log('nl', advancing_input, next_len);
  if (advancing_input && next_len) {
    button_enabled_active('len2', clicked_element.duration, [1].includes(next_len));
    button_enabled_active('len3', can_len(2), [2, 3].includes(next_len));
    button_enabled_active('len4', can_len(4), [4, 6].includes(next_len));
    button_enabled_active('len5', can_len(8), [8, 12].includes(next_len));
    button_enabled_active('len6', can_len(16), [16, 24].includes(next_len));
    button_enabled_active('dot', can_dot(), [3, 6, 12, 24].includes(next_len));
  }
  else {
    button_enabled_active('len2', clicked_element.duration, [0.0625].includes(clicked_element.duration));
    button_enabled_active('len3', can_len(2), [0.125, 0.1875].includes(clicked_element.duration));
    button_enabled_active('len4', can_len(4), [0.25, 0.375].includes(clicked_element.duration));
    button_enabled_active('len5', can_len(8), [0.5, 0.75].includes(clicked_element.duration));
    button_enabled_active('len6', can_len(16), [1, 1.5].includes(clicked_element.duration));
    button_enabled_active('dot', can_dot(), [0.375, 0.75, 1.5].includes(clicked_element.duration));
  }
  if (advancing_input && next_len) {
    button_enabled_active('tie', can_pre_tie(), is_pre_tie());
  } else {
    button_enabled_active('tie', can_tie(), clicked_element.abselem && clicked_element.abselem.startTie);
  }
}

function element_click(abcElem, tuneNumber, classes) {
  console.log('Click', abcElem, tuneNumber, classes);
  clicked_element = abcElem;
  clicked_classes = classes;
  clicked_note = undefined;
  if (clicked_element.duration != null) {
    clicked_note = notesData.abc_charStarts[clicked_element.startChar];
  }
  advancing_input = false;
  next_alteration = '';
  next_len = 0;
  update_selection(true);
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  abcjs = ABCJS.renderAbc('notation', dataToAbc(notesData), parserParams, engraverParams);
  if (clicked_note) {
    let nt = notesData.voices[clicked_note.voice].notes[clicked_note.note];
    console.log('dr', nt);
    let el = getElementByStartChar(nt.abc_charStarts);
    abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
    clicked_element = el.abcelem;
    clicked_classes = "";
    update_selection(false);
  }
  else {
    clicked_element = {};
    clicked_classes = "";
    update_selection(false);
  }
}

function async_redraw() {
  setTimeout(notation_redraw, 0);
}

function highlightElementByStartChar(startChar) {
  abcjs[0].engraver.clearSelection();
  let el = getElementByStartChar(startChar);
  el.highlight();
  return el;
}

function getElementByStartChar(startChar) {
  let engraver = abcjs[0].engraver;
  for (let line = 0; line < engraver.staffgroups.length; line++) {
    let voices = engraver.staffgroups[line].voices;
    for (let voice = 0; voice < voices.length; voice++) {
      let elems = voices[voice].children;
      for (let elem = 0; elem < elems.length; elem++) {
        if (startChar === elems[elem].abcelem.startChar) {
          return elems[elem];
        }
      }
    }
  }
}

function notation_zoom(zoom) {
  engraverParams.scale *= zoom;
  if (engraverParams.scale > 3) engraverParams.scale = 3;
  if (engraverParams.scale < 0.5) engraverParams.scale = 0.5;
  async_redraw();
}

let parserParams = {
  clickListener: element_click,
  add_classes: true,
  staffwidth: window.innerWidth - 60,
  wrap: { minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16 }
};

let engraverParams = { scale: 1 };

async_redraw();

window.onresize = function(event) {
  async_redraw();
};

let keymap = {
  67: () => { set_note(0) },
  68: () => { set_note(1) },
  69: () => { set_note(2) },
  70: () => { set_note(3) },
  71: () => { set_note(4) },
  65: () => { set_note(5) },
  66: () => { set_note(6) },
  54: () => { set_len(16) },
  53: () => { set_len(8) },
  52: () => { set_len(4) },
  51: () => { set_len(2) },
  50: () => { set_len(1) },
  102: () => { set_len(16) },
  101: () => { set_len(8) },
  100: () => { set_len(4) },
  99: () => { set_len(2) },
  98: () => { set_len(1) },
  190: () => { toggle_dot() },
  110: () => { toggle_dot() },
  189: () => { toggle_tie() },
  55: () => { toggle_alteration('=') },
  56: () => { toggle_alteration('^') },
  57: () => { toggle_alteration('_') },
  103: () => { toggle_alteration('=') },
  104: () => { toggle_alteration('^') },
  105: () => { toggle_alteration('_') },
  187: () => { set_rest() },
  96: () => { set_rest() },
};

window.onkeydown = function (e) {
  if (e.keyCode in keymap) {
    keymap[e.keyCode]();
    return false;
  }
  return true;
};
