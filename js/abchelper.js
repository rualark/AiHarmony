import {dataToAbc} from "./dataToAbc.js";
import {nd} from "./NotesData.js";
import {update_selection} from "./edit.js";

export let MAX_ABC_NOTE = 60;
export let MIN_ABC_NOTE = 1;

let engraverParams = {};
let parserParams = {};

export let abcjs = {};

export let clicked = {
  element: {},
  classes: '',
  note: {voice: 0, note: 0}
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
  let nt = nd.voices[clicked.note.voice].notes[clicked.note.note];
  let el = getElementByStartChar(abcjs, nt.abc_charStarts);
  abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
  clicked.element = el.abcelem;
  clicked.classes = "";
  update_selection();
}

function notation_redraw() {
  parserParams.staffwidth = window.innerWidth - 60;
  abcjs = ABCJS.renderAbc('notation', dataToAbc(nd), parserParams, engraverParams);
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
    wrap: {minSpacing: 1.4, maxSpacing: 2.4, preferredMeasuresPerLine: 16},
    format: {
      titlefont: "Verdana 9 italic bold",
      gchordfont: "Verdana 9 italic bold",
      composerfont: "Verdana 9 italic bold",
      footerfont: "Verdana 9 italic bold",
      headerfont: "Verdana 9 italic bold",
      historyfont: "Verdana 9 italic bold",
      infofont: "Verdana 9 italic bold",
      measurefont: "Verdana 9 italic",
      partsfont: "Verdana 9 italic bold",
      repeatfont: "Verdana 9 italic bold",
      subtitlefont: "Verdana 9 italic bold",
      tempofont: "Verdana 9 italic bold",
      textfont: "Verdana 9 italic bold",
      voicefont: "Times New Roman 11 bold",
      tripletfont: "Verdana 9 italic bold",
      vocalfont: "Verdana 9 italic bold",
      wordsfont: "Verdana 9 italic bold",
      annotationfont: "Verdana 9 italic bold",
    }
  };

  engraverParams = {scale: 1};

  async_redraw();
}

