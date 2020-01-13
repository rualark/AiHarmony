import {dataToAbc} from "./dataToAbc.js";
import {notesData} from "./notesData.js";
import {update_selection} from "./edit.js";

export let MAX_ABC_NOTE = 60;
export let MIN_ABC_NOTE = 1;

let engraverParams = {};
let parserParams = {};

export let abcjs = {};

export let clicked = {
  element: {},
  classes: '',
  note: undefined
};

function getElementByStartChar(abcjs, startChar) {
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

export function find_selection() {
  let nt = notesData.voices[clicked.note.voice].notes[clicked.note.note];
  let el = getElementByStartChar(abcjs, nt.abc_charStarts);
  abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
  clicked.element = el.abcelem;
  clicked.classes = "";
  update_selection();
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  abcjs = ABCJS.renderAbc('notation', dataToAbc(notesData), parserParams, engraverParams);
  if (clicked.note) {
    find_selection();
  }
  else {
    clicked.element = {};
    clicked.classes = "";
    update_selection();
  }
}

export function async_redraw() {
  setTimeout(notation_redraw, 0);
}

export function notation_zoom(zoom) {
  engraverParams.scale *= zoom;
  if (engraverParams.scale > 3) engraverParams.scale = 3;
  if (engraverParams.scale < 0.5) engraverParams.scale = 0.5;
  async_redraw();
}

export function init_abcjs(clickListener) {
  parserParams = {
    clickListener: clickListener,
    add_classes: true,
    staffwidth: window.innerWidth - 60,
    wrap: {minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16}
  };

  engraverParams = {scale: 1};

  async_redraw();
}

