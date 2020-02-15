import {dataToAbc} from "./dataToAbc.js";
import {nd} from "../notes/NotesData.js";
import {saveState} from "../state/history.js";
import {start_counter} from "../core/time.js";
import {update_selection} from "../ui/notation.js";
import {settings} from "../state/settings.js";
import {SEVERITY_RED, SEVERITY_RED_COLOR, SEVERITY_YELLOW_COLOR} from "../analysis/AnalysisResults.js";

export let MAX_ABC_NOTE = 60;
export let MIN_ABC_NOTE = 1;

export let engraverParams = {};
let parserParams = {};

export let abcjs = {};
export let state = {};

export let selected = {
  element: {},
  classes: '',
  note: {voice: 0, note: 0},
  voice: 0
};

function getElementByStartChar(abcjs, startChar) {
  let engraver = abcjs[0].engraver;
  //console.log(engraver);
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

function abcRangeNotesHighlight(start, end, color, clear=true) {
  let engraver = abcjs[0].engraver;
  if (clear) engraver.clearSelection();
  for (let line = 0; line < engraver.staffgroups.length; line++) {
    let voices = engraver.staffgroups[line].voices;
    for (let voice = 0; voice < voices.length; voice++) {
      let elems = voices[voice].children;
      for (let elem = 0; elem < elems.length; elem++) {
        if (!elems[elem].duration) continue;
        // Since the user can highlight more than an element, or part of an element, a hit is if any of the endpoints
        // is inside the other range.
        let elStart = elems[elem].abcelem.startChar;
        let elEnd = elems[elem].abcelem.endChar;
        if (end > elStart && start < elEnd || end === start && end === elEnd) {
          //		if (elems[elem].abcelem.startChar>=start && elems[elem].abcelem.endChar<=end) {
          engraver.selected[engraver.selected.length] = elems[elem];
          elems[elem].highlight(undefined, color);
        }
      }
    }
  }
}

export function highlightNote() {
  let nt = nd.voices[selected.note.voice].notes[selected.note.note];
  let el = getElementByStartChar(abcjs, nt.abc_charStarts);
  abcjs[0].engraver.rangeHighlight(nt.abc_charStarts, nt.abc_charEnds);
  selected.element = el.abcelem;
  selected.classes = "";
}

export function highlightRange(severity) {
  let nt11 = nd.voices[selected.note.v1].notes[selected.note.n11];
  let nt12 = nd.voices[selected.note.v1].notes[selected.note.n12];
  let nt21 = nd.voices[selected.note.v2].notes[selected.note.n21];
  let nt22 = nd.voices[selected.note.v2].notes[selected.note.n22];
  let color;
  if (severity > SEVERITY_RED) {
    color = SEVERITY_RED_COLOR;
  }
  else {
    color = SEVERITY_YELLOW_COLOR;
  }
  abcRangeNotesHighlight(
    Math.min(nt11.abc_charStarts, nt12.abc_charStarts),
    Math.max(nt11.abc_charEnds, nt12.abc_charEnds),
    color
  );
  abcRangeNotesHighlight(
    Math.min(nt21.abc_charStarts, nt22.abc_charStarts),
    Math.max(nt21.abc_charEnds, nt22.abc_charEnds),
    color,
    false
  );
  selected.element = null;
  selected.classes = "";
}

function notation_redraw() {
  try {
    parserParams.staffwidth = window.innerWidth - 60;
    $('#filename').html('&nbsp;&nbsp;' + nd.name);
    start_counter('renderAbc');
    abcjs = ABCJS.renderAbc('abc', dataToAbc(), parserParams, engraverParams);
    //stop_counter();
    if (selected.note) {
      highlightNote();
    } else {
      selected.element = {};
      selected.classes = "";
    }
    update_selection();
  }
  catch (e) {
    state.error = e;
    state.state = 'ready';
    throw e;
  }
  state.state = 'ready';
}

export function async_redraw() {
  state.state = 'drawing';
  setTimeout(notation_redraw, 0);
}

export function notation_zoom(zoom) {
  engraverParams.scale *= zoom;
  if (engraverParams.scale > 3) engraverParams.scale = 3;
  if (engraverParams.scale < 0.5) engraverParams.scale = 0.5;
  console.log('Zoom scale', engraverParams.scale);
  settings.settings2storage();
  async_redraw();
}

export function get_voice(classes) {
  for (let cla of classes) {
    for (let cl of cla.split(' ')) {
      if (!cl.startsWith('abcjs-v')) continue;
      return Number(cl[7]);
    }
  }
}

export function init_abcjs(clickListener) {
  parserParams = {
    clickListener: clickListener,
    add_classes: true,
    dragging: true,
    selectAll: true,
    selectionColor: "#33AAFF",
    dragColor: "#3399FF",
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
}

