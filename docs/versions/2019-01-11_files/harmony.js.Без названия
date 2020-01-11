import {abc2d, d2abc, dataToAbc} from './dataToAbc.js';
import {nd_set_rest, notesData} from "./notesData.js";
import {json_stringify_circular} from "./lib.js";

let abcjs;
let clicked_element = {};
let clicked_classes = '';
let clicked_note;

document.getElementById('zoom-in').onclick=function(){ notation_zoom(1.1); return false; };
document.getElementById('zoom-out').onclick=function(){ notation_zoom(0.9); return false; };
document.getElementById('sharp').onclick=function(){ toggle_alteration('^'); return false; };
document.getElementById('natural').onclick=function(){ toggle_alteration('='); return false; };
document.getElementById('flat').onclick=function(){ toggle_alteration('_'); return false; };
document.getElementById('rest').onclick=function(){ set_rest(this.id); return false; };
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
  if (note.len % 3 === 0) set_len(Math.round(note.len * 2 / 3));
  else set_len(Math.round(note.len * 1.5));
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

function set_note(dc) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  let pd = 35;
  if (note.abc_note !== 'z') {
    pd = abc2d(note.abc_note);
  }
  else if (el.note && notes[el.note - 1].abc_note !== 'z') {
    pd = abc2d(notes[el.note - 1].abc_note);
  }
  let d;
  if (note.abc_note === 'z') {
    d = dc;
  }
  else {
    console.log(note.abc_note);
    d = abc2d(note.abc_note);
    d = Math.floor(d / 7) * 7 + dc;
  }
  while (pd - d > 3) d += 7;
  while (d - pd > 3) d -= 7;
  note.abc_note = d2abc(d);
  note.startsTie = false;
  async_redraw();
}

function set_rest(id) {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  nd_set_rest(notesData.voices[el.voice].notes, el.note);
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
  if (notesData.voices[el.voice].notes[el.note].abc_alter === alt) {
    notesData.voices[el.voice].notes[el.note].abc_alter = '';
  }
  else {
    notesData.voices[el.voice].notes[el.note].abc_alter = alt;
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

function toggle_tie() {
  if (!clicked_element || !clicked_element.duration) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  if (notes[el.note].startsTie) {
    notes[el.note].startsTie = false;
  }
  else {
    if (can_tie()) notes[el.note].startsTie = true;
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

function noteclick(abcElem, tuneNumber, classes) {
  console.log('Click', abcElem, tuneNumber, classes);
  clicked_element = abcElem;
  clicked_classes = classes;
  clicked_note = undefined;
  if (abcElem.duration != null) {
    clicked_note = notesData.abc_charStarts[abcElem.startChar];
  }
  button_enabled_active('note_c', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 0);
  button_enabled_active('note_d', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 1);
  button_enabled_active('note_e', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 2);
  button_enabled_active('note_f', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 3);
  button_enabled_active('note_g', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 4);
  button_enabled_active('note_a', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 5);
  button_enabled_active('note_b', abcElem.duration, abcElem.pitches && (77 + abcElem.pitches[0].pitch) % 7 === 6);
  button_enabled_active('sharp', abcElem.duration, abcElem.pitches && abcElem.pitches[0].accidental === 'sharp');
  button_enabled_active('flat', abcElem.duration, abcElem.pitches && abcElem.pitches[0].accidental === 'flat');
  button_enabled_active('natural', abcElem.duration, abcElem.pitches && abcElem.pitches[0].accidental === 'natural');
  button_enabled_active('rest', abcElem.duration, abcElem.rest && abcElem.rest.type === 'rest');
  button_enabled_active('len2', abcElem.duration, [0.0625].includes(abcElem.duration));
  button_enabled_active('up8', can_octave(1), false);
  button_enabled_active('down8', can_octave(-1), false);
  button_enabled_active('len3', can_len(2), [0.125, 0.1875].includes(abcElem.duration));
  button_enabled_active('len4', can_len(4), [0.25, 0.375].includes(abcElem.duration));
  button_enabled_active('len5', can_len(8), [0.5, 0.75].includes(abcElem.duration));
  button_enabled_active('len6', can_len(16), [1, 1.5].includes(abcElem.duration));
  button_enabled_active('dot', can_dot(), [0.375, 0.75, 1.5].includes(abcElem.duration));
  button_enabled_active('tie', can_tie(), abcElem.abselem && abcElem.abselem.startTie);
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  abcjs = ABCJS.renderAbc('notation', dataToAbc(notesData), parserParams, engraverParams);
  if (clicked_note) {
    let nt = notesData.voices[clicked_note.voice].notes[clicked_note.note];
    let el = getElementByStartChar(nt.abc_charStarts);
    abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
    noteclick(el.abcelem, 0, "");
  }
  else {
    noteclick({}, 0, "");
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
  clickListener: noteclick,
  add_classes: true,
  staffwidth: window.innerWidth - 60,
  wrap: { minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16 }
};

let engraverParams = { scale: 1 };

async_redraw();

window.onresize = function(event) {
  async_redraw();
};
