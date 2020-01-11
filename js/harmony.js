import {abc2d, d2abc, dataToAbc} from './dataToAbc.js';
import {nd_set_pause, notesData} from "./notesData.js";
import {json_stringify_circular} from "./lib.js";

let abcjs;
let clicked_element;
let clicked_classes = '';
let clicked_note;

document.getElementById('zoom-in').onclick=function(){ notation_zoom(1.1); return false; };
document.getElementById('zoom-out').onclick=function(){ notation_zoom(0.9); return false; };
document.getElementById('sharp').onclick=function(){ toggle_alteration('^'); return false; };
document.getElementById('natural').onclick=function(){ toggle_alteration('='); return false; };
document.getElementById('flat').onclick=function(){ toggle_alteration('_'); return false; };
document.getElementById('pause').onclick=function(){ set_pause(); return false; };
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

function toggle_dot() {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  if (note.len % 3 === 0) set_len(Math.round(note.len * 2 / 3));
  else set_len(Math.round(note.len * 1.5));
}

function set_len(len) {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  console.log(note.step, notesData.time.measure_len, len);
  if (note.step % notesData.time.measure_len + len > notesData.time.measure_len) return;
  if (len === note.len) return;
  if (len > note.len) {
    let debt = len - note.len;
    for (let n = el.note + 1; n < notes.length; ++n) {
      if (debt < notes[n].len) {
        nd_set_pause(notes, n);
        notes[n].len = notes[n].len - debt;
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
    nd_set_pause(notes, el.note + 1);
  }
  note.len = len;
  notation_redraw();
}

function set_note(dc) {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  let note = notes[el.note];
  let pd = 35;
  if (el.note && notes[el.note - 1].abc_note !== 'z') {
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
  notation_redraw();
}

function set_pause() {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  nd_set_pause(notesData.voices[el.voice].notes, el.note);
  notation_redraw();
}

function set_octave(doct) {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let d = abc2d(notesData.voices[el.voice].notes[el.note].abc_note);
  notesData.voices[el.voice].notes[el.note].abc_note = d2abc(d + 7 * doct);
  notation_redraw();
}

function toggle_alteration(alt) {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  if (notesData.voices[el.voice].notes[el.note].abc_alter === alt) {
    notesData.voices[el.voice].notes[el.note].abc_alter = '';
  }
  else {
    notesData.voices[el.voice].notes[el.note].abc_alter = alt;
  }
  notation_redraw();
}

function toggle_tie() {
  if (!clicked_element) return;
  let el = notesData.abc_charStarts[clicked_element.startChar];
  let notes = notesData.voices[el.voice].notes;
  if (notes[el.note].startsTie) {
    notes[el.note].startsTie = false;
  }
  else {
    if (notes.length === el.note + 1) return;
    if (notes[el.note].abc_note !== notes[el.note + 1].abc_note) return;
    notes[el.note].startsTie = true;
  }
  notation_redraw();
}

function update_button(par, vals, id) {
  if (vals.includes(par)) {
    $('#' + id).removeClass("btn-outline-white").addClass("btn-lblue");
  } else {
    $('#' + id).removeClass("btn-lblue").addClass("btn-outline-white");
  }
}

function noteclick(abcElem, tuneNumber, classes) {
  console.log('Click', abcElem, tuneNumber, classes);
  clicked_element = abcElem;
  clicked_classes = classes;
  clicked_note = undefined;
  if (abcElem.duration != null) {
    clicked_note = notesData.abc_charStarts[abcElem.startChar];
    update_button(abcElem.duration, [0.125], 'len3');
    update_button(abcElem.duration, [0.25, 0.375], 'len4');
    update_button(abcElem.duration, [0.5, 0.75], 'len5');
    update_button(abcElem.duration, [1, 1.5], 'len6');
    update_button(abcElem.duration, [0.375, 0.75, 1.5], 'dot');
    if (abcElem.pitches != null) {
      let pclass = (77 + abcElem.pitches[0].pitch) % 7;
      update_button(pclass, [6], 'note_b');
      update_button(pclass, [5], 'note_a');
      update_button(pclass, [4], 'note_g');
      update_button(pclass, [3], 'note_f');
      update_button(pclass, [2], 'note_e');
      update_button(pclass, [1], 'note_d');
      update_button(pclass, [0], 'note_c');
      update_button(abcElem.pitches[0].accidental, ['sharp'], 'sharp');
      update_button(abcElem.pitches[0].accidental, ['flat'], 'flat');
      update_button(abcElem.pitches[0].accidental, ['natural'], 'natural');
      update_button(abcElem.abselem.startTie, [true], 'tie');
    }
  }
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  abcjs = ABCJS.renderAbc('notation', dataToAbc(notesData), parserParams, engraverParams);
  if (clicked_note) {
    let nt = notesData.voices[clicked_note.voice].notes[clicked_note.note];
    let el = highlightElementByStartChar(nt.abc_charStarts);
    //abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
    noteclick(el.abcelem, 0, "");
  }
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
  notation_redraw();
}

let parserParams = {
  clickListener: noteclick,
  add_classes: true,
  staffwidth: window.innerWidth - 60,
  wrap: { minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16 }
};

let engraverParams = { scale: 1 };

notation_redraw();

window.onresize = function(event) {
  notation_redraw();
};
