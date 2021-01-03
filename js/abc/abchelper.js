import {dataToAbc} from "./dataToAbc.js";
import {nd} from "../notes/NotesData.js";
import {start_counter, stop_counter} from "../core/time.js";
import {update_selection} from "../ui/selection.js";
import {settings} from "../state/settings.js";
import {ares, SEVERITY_RED, SEVERITY_RED_COLOR, SEVERITY_YELLOW_COLOR} from "../analysis/AnalysisResults.js";
import { future } from "../ui/edit/editNote.js";
import { trackEvent } from "../integration/tracking.js";
import { json_stringify_circular } from "../core/string.js";

export let engraverParams = {
  scale: 1
};
let parserParams = {};

export let abcjs = {};
export let state = {};

export let selected = {
  element: {},
  note: {voice: 0, note: 0},
  voice: 0
};

const svgNS = "http://www.w3.org/2000/svg";

const SELECTION_COLOR = "#33AAFF";
//const COLOR_ADVANCING = "#00CC00";

function getElementByStartChar(abcjs, startChar) {
  let engraver = abcjs[0].engraver;
  //console.log(engraver);
  for (let line = 0; line < engraver.staffgroups.length; line++) {
    let voices = engraver.staffgroups[line].voices;
    for (let voice = 0; voice < voices.length; voice++) {
      let elems = voices[voice].children;
      for (let elem = 0; elem < elems.length; elem++) {
        //console.log(elems[elem].abcelem.startChar, nd.abcString[elems[elem].abcelem.startChar]);
        if (startChar === elems[elem].abcelem.startChar) {
          return elems[elem];
        }
      }
    }
  }
}

function clearSelection() {
  let engraver = abcjs[0].engraver;
  for (var i=0;i<engraver.selected.length;i++) {
    engraver.selected[i].unhighlight();
  }
  engraver.selected = [];
}

function abcRangeNotesHighlight(start, end, color, clear=true) {
  let engraver = abcjs[0].engraver;
  if (clear) clearSelection();
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
  if (!selected.note) return;
  const vc = nd.voices[selected.note.voice];
  if (!vc) {
    console.log(json_stringify_circular(nd), json_stringify_circular(selected));
    throw "Cannot find voice";
  }
  const nt = vc.notes[selected.note.note];
  if (!nt) {
    console.log(json_stringify_circular(nd), json_stringify_circular(selected));
    throw "Cannot find note";
  }
  if (future.advancing && selected.note.note) {
    abcRangeNotesHighlight(nt.abc_charStarts, nt.abc_charEnds, SELECTION_COLOR);
  } else {
    abcRangeNotesHighlight(nt.abc_charStarts, nt.abc_charEnds, SELECTION_COLOR);
  }
  let el = getElementByStartChar(abcjs, nt.abc_charStarts);
  if (el) {
    selected.element = el.abcelem;
  } else {
    selected.element = {};
  }
}

export function highlightRange() {
  if (selected.note == null) return;
  if (selected.note.n11 == null) return;
  let nt11 = nd.voices[selected.note.v1].notes[selected.note.n11];
  let nt12 = nd.voices[selected.note.v1].notes[selected.note.n12];
  let nt21 = nd.voices[selected.note.v2].notes[selected.note.n21];
  let nt22 = nd.voices[selected.note.v2].notes[selected.note.n22];
  let color;
  if (selected.note.severity == null) {
    color = SELECTION_COLOR;
  } else if (selected.note.severity > SEVERITY_RED) {
    color = SEVERITY_RED_COLOR;
  } else {
    color = SEVERITY_YELLOW_COLOR;
  }
  try {
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
  }
  catch (e) {
    console.log(nd);
    console.log(selected, nt11, nt12, nt21, nt22);
    throw e;
  }
  // Highlight intermediate voices
  if (selected.note.severity == null) {
    const v1 = selected.note.v1;
    const v2 = selected.note.v2;
    const smin = nt11.step;
    const smax = nt12.step + nt12.len - 1;
    for (let v=v1+1; v<v2; v++) {
      const n1 = nd.getClosestNote(v, smin);
      const n2 = nd.getClosestNote(v, smax);
      abcRangeNotesHighlight(
        nd.voices[v].notes[n1].abc_charStarts,
        nd.voices[v].notes[n2].abc_charEnds,
        color,
        false
      );
    }
  }
  selected.element = null;
}

function apply_abcjs_styles() {
  for (let style of nd.styles) {
    const el = document.querySelector(style.style);
    if (!el) return;
    el.style.stroke = style.stroke;
  }
}

function update_notes_abcelems() {
  let engraver = abcjs[0].engraver;
  for (let line = 0; line < engraver.staffgroups.length; line++) {
    let voices = engraver.staffgroups[line].voices;
    for (let voice = 0; voice < voices.length; voice++) {
      let elems = voices[voice].children;
      for (let elem = 0; elem < elems.length; elem++) {
        if (!elems[elem].duration) continue;
        let elStart = elems[elem].abcelem.startChar;
        if (elStart in nd.abc_charStarts) {
          const el = nd.abc_charStarts[elStart];
          nd.voices[el.voice].notes[el.note].abcelem = elems[elem].abcelem;
        }
      }
    }
  }
}

function drawLine(attr) {
  var svg = document.querySelector("#abc svg");
  var el = document.createElementNS(svgNS, 'line');
  el.setAttribute("x1", attr.x1);
  el.setAttribute("x2", attr.x2);
  el.setAttribute("y1", attr.y1);
  el.setAttribute("y2", attr.y2);
  el.setAttribute("stroke", attr.stroke);
  el.setAttribute("stroke-width", attr.strokeWidth);
  el.setAttribute("stroke-opacity", attr.strokeOpacity);
  svg.appendChild(el);
}

function drawCircle(attr) {
  var svg = document.querySelector("#abc svg");
  var el = document.createElementNS(svgNS, 'circle');
  el.setAttribute("cx", attr.cx);
  el.setAttribute("cy", attr.cy);
  el.setAttribute("r", attr.r);
  el.setAttribute("stroke", attr.stroke);
  el.setAttribute("stroke-width", attr.strokeWidth);
  el.setAttribute("stroke-opacity", attr.strokeOpacity);
  el.setAttribute("fill", "transparent");
  svg.appendChild(el);
}

function draw_circle_around_notehead(abselem) {
  drawCircle({
    cx: abselem.notePositions[0].x,
    cy: abselem.notePositions[0].y,
    r: 7,
    stroke: 'black',
    strokeWidth: 1,
    strokeOpacity: 0.5
  });
}

function draw_nht_circles() {
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    for (let n=0; n<vc.notes.length; ++n) {
      let nt = vc.notes[n];
      const s = nt.step;
      if (nt.d && settings.show_nht && nd.algo === 'CA3') {
        const msh = ares.getMsh(v, s);
        if (msh < 0) draw_circle_around_notehead(nt.abcelem.abselem);
      }
    }
  }
}

function draw_glis(v, n1, n2, sev) {
  const vc = nd.voices[v];
  if (n1 >= vc.notes.length) return;
  if (n2 >= vc.notes.length) return;
  const nt1 = n1 < n2 ? vc.notes[n1] : vc.notes[n2];
  const nt2 = n1 < n2 ? vc.notes[n2] : vc.notes[n1];
  if (!('abcelem' in nt1)) return;
  if (!('abcelem' in nt2)) return;
  const abselem1 = nt1.abcelem.abselem;
  const abselem2 = nt2.abcelem.abselem;
  if (abselem1.counters.line === abselem2.counters.line) {
    const dy = (abselem2.notePositions[0].y - abselem1.notePositions[0].y) / (abselem2.notePositions[0].x - abselem1.notePositions[0].x) * 8;
    drawLine({
      x1: abselem1.notePositions[0].x + 8,
      y1: abselem1.notePositions[0].y + dy,
      x2: abselem2.notePositions[0].x - 8,
      y2: abselem2.notePositions[0].y - dy,
      stroke: sev > SEVERITY_RED ? SEVERITY_RED_COLOR : SEVERITY_YELLOW_COLOR,
      strokeWidth: 2,
      strokeOpacity: sev > SEVERITY_RED ? 0.5 : 0.8,
    });
  } else {
    let dy = 0;
    if (nt1.d > nt2.d) dy = 10;
    if (nt1.d < nt2.d) dy = -10;
    drawLine({
      x1: abselem1.notePositions[0].x + 8,
      y1: abselem1.notePositions[0].y,
      x2: abselem1.notePositions[0].x + 90 + 8,
      y2: abselem1.notePositions[0].y + dy,
      stroke: sev > SEVERITY_RED ? SEVERITY_RED_COLOR : SEVERITY_YELLOW_COLOR,
      strokeWidth: 2,
      strokeOpacity: sev > SEVERITY_RED ? 0.5 : 0.8,
    });
    drawLine({
      x1: abselem2.notePositions[0].x - 8,
      y1: abselem2.notePositions[0].y,
      x2: abselem2.notePositions[0].x - 15 - 8,
      y2: abselem2.notePositions[0].y - dy/6,
      stroke: sev > SEVERITY_RED ? SEVERITY_RED_COLOR : SEVERITY_YELLOW_COLOR,
      strokeWidth: 2,
      strokeOpacity: sev > SEVERITY_RED ? 0.5 : 0.8,
    });
  }
}

function draw_glisses() {
  for (const shape of ares.shapes) {
    if (shape.shapeType === 'glis') {
      console.log(shape);
      draw_glis(shape.v1, shape.n11, shape.n12, shape.severity);
      draw_glis(shape.v2, shape.n21, shape.n22, shape.severity);
    }
  }
}

function notation_redraw() {
  try {
    parserParams.staffwidth = window.innerWidth - 60;
    document.getElementById('algo').value = nd.algo;
    $('#filename').html(nd.name);
    $('#filename').prop('title', 'File name: ' + nd.fileName);
    start_counter('renderAbc');
    nd.abcString = dataToAbc();
    abcjs = ABCJS.renderAbc('abc', nd.abcString, parserParams, engraverParams);
    stop_counter();
    update_notes_abcelems();
    draw_nht_circles();
    draw_glisses();
    apply_abcjs_styles();
    if (selected.note) {
      highlightNote();
      highlightRange();
    } else {
      selected.element = {};
    }
    update_selection();
  }
  catch (e) {
    state.error = e;
    state.state = 'ready';
    console.log(e);
    if (e == "Can't find variable: ABCJS" || e == "ReferenceError: ABCJS is not defined") {
      trackEvent('AiHarmony', 'error_not_found_abcjs');
      alertify.warning(`Please check your internet connection and reload page. Could not load music visualization module.`, 60);
    } else {
      throw e;
    }
  }
  state.state = 'ready';
}

export function async_redraw() {
  state.state = 'drawing';
  // Update note steps synchronously, because it can be needed before redraw occurs
  nd.update_note_steps();
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

export function init_abcjs(clickListener) {
  parserParams = {
    clickListener: clickListener,
    add_classes: true,
    dragging: true,
    selectTypes: ['note', 'clef', 'keySignature', 'voiceName', 'timeSignature', 'tempo'],
    selectionColor: SELECTION_COLOR,
    dragColor: "#3399FF",
    staffwidth: window.innerWidth - 60,
    wrap: {minSpacing: 1.6, maxSpacing: 1.6, preferredMeasuresPerLine: 160},
    //showDebug: ['grid', 'box'],
    //responsive: true,
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
      annotationfont: "Verdana 9 bold",
    }
  };
}
