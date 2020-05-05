import {async_redraw, state} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import { showModal, showMultiButtonSelect, showSelect } from "./lib/modal.js";
import { c2d, d2abc, abc2d, alter2abc, keysig_imprint } from "../../notes/noteHelper.js";
import { button_visible_active } from "../../ui/lib/uilib.js";
import { keysigs } from "./keysig.js";
import { clefs } from "./clefs.js";
import { nd } from "../../notes/NotesData.js";
import { storage2archiveStorage } from "../../state/state.js";
import { timesigs } from "./timesig.js";

let okClicked = false;

const canti = [
  ['C', 'D', 'E', 'G', 'A', 'F', 'E', 'D', 'C'],
  ['C', 'A', 'G', 'E', 'F', 'G', 'E', 'D', 'C'],
  ['C', 'G', 'A', 'G', 'F', 'G', 'E', 'D', 'C'],
  ['C', 'D', 'E', 'F', 'A', 'G', 'E', 'F', 'E', 'D', 'C'],
  ['c', 'A', 'G', 'E', 'F', 'A', 'G', 'E', 'D', 'C'],
  ['C', 'D', 'E', 'G', 'A', 'F', 'E', 'C', 'D', 'C'],
  ['C', 'E', 'G', 'F', 'E', 'A', 'G', '=B,', 'C'],
  ['c', 'B', 'A', 'G', 'F', 'A', 'G', '=B', 'c'],
  ['c', 'd', 'B', 'c', 'F', 'G', 'A', 'G', 'c'],
  ['C', 'D', 'G,', 'A,', 'C', 'D', 'E', 'D', '=B,', 'C'],
];

const arrangements = [
  {parts: ['Soprano', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Bass'], cantus: 'Bass'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Alto'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Bass'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Alto'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Tenor'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Bass'},
];

const vocras = {
  'Soprano': {clef: 'treble', short: 'Sop.', minD: 35, maxD: 47},
  'Alto': {clef: 'treble', short: 'Alt.', minD: 31, maxD: 43},
  'Tenor': {clef: 'treble-8', short: 'Ten.', minD: 28, maxD: 40},
  'Bass': {clef: 'bass', short: 'Bas.', minD: 24, maxD: 36},
};

function makeCantusKeysigs() {
  let res = [];
  for (const keysig in keysigs) {
    if (keysigs[keysig].mode === 0) {
      res.push({val: keysig, text: keysig + ' major'});
    }
    if (keysigs[keysig].mode === 9) {
      res.push({val: keysig, text: keysig.slice(0, -1) + ' minor'});
    }
  }
  return res;
}

function makeCantusTimesig() {
  let res = [];
  for (const timesig of timesigs) {
    if (timesig.beat_type > 4) continue;
    res.push({
      val: timesig.beats_per_measure + '/' + timesig.beat_type,
      text: timesig.beats_per_measure + '/' + timesig.beat_type,
      timesig: timesig
    });
  }
  return res;
}

function cantusToAbc(cid) {
  let abc = '';
  abc += '%%barnumbers 0\n';
  //abc += 'M:4/4\n';
  abc += 'K:C\n';
  abc += 'L:1/16\n';
  abc += `V: V0 clef=treble name=""\n`;
  abc += `[V: V0]`;
  const cantus = canti[cid];
  for (let n=0; n<cantus.length; ++n) {
    abc += cantus[n] + '16|';
  }
  abc += '\n';
  return abc;
}

function bestTranspose(minD, maxD, rangeMinD, rangeMaxD, step) {
  let transpose = 0;
  let ldif = rangeMinD - minD;
  let hdif = rangeMaxD - maxD;
  let transpose_step = 0;
  if (ldif > -hdif) {
    transpose_step = step;
  } else {
    transpose_step = -step;
  }
  let range_penalty = Math.max(ldif, 0) - Math.min(hdif, 0);
  let i = 0;
  while (1) {
    i++;
    if (i > 100) break;
    transpose += transpose_step;
    ldif = rangeMinD - minD - transpose;
    hdif = rangeMaxD - maxD - transpose;
    let range_penalty2 = Math.max(ldif, 0) - Math.min(hdif, 0);
    // Check if range penalty is not decreasing or out of allowed range
    if (range_penalty2 >= range_penalty ||
      maxD + transpose > 127 ||
      minD + transpose < 0) {
      // Undo last transposition
      transpose -= transpose_step;
      break;
    }
    // Update new range penalty
    range_penalty = range_penalty2;
  }
  return transpose;
}

function transposeCantus(cid, arrangement, keysig) {
  let d = [];
  let alter = [];
  let base_d = abc2d(keysig.name[0]) - 35;
  const cantus = canti[cid];
  const imprint = keysig_imprint(keysig.fifths);
  for (let n=0; n<cantus.length; ++n) {
    let abc_note = cantus[n];
    // Calculate diatonic
    if (cantus[n][0] === '=') {
      abc_note = abc_note.slice(1);
    }
    const nd = abc2d(abc_note) + base_d;
    d.push(nd);
    // Calculate alteration
    if (cantus[n][0] === '=') {
      if (keysig.mode === 9) {
        alter.push(imprint[nd % 7] + 1);
      } else {
        alter.push(10);
      }
    } else {
      alter.push(10);
    }
  }
  // Calculate best octave transposition
  const minD = Math.min.apply(null, d);
  const maxD = Math.max.apply(null, d);
  const transpose = bestTranspose(minD, maxD, vocras[arrangement.cantus].minD, vocras[arrangement.cantus].maxD, 7);
  for (let n=0; n<cantus.length; ++n) {
    d[n] += transpose;
  }
  return [d, alter];
}

function cantusPreviewToAbc(cid, arrangement, keysig, timesig) {
  let abc = '';
  let cantus_clef = vocras[arrangement.cantus].clef;
  abc += '%%barnumbers 0\n';
  abc += `M:${timesig.beats_per_measure}/${timesig.beat_type}\n`;
  abc += `K:${keysig.name}\n`;
  abc += 'L:1/16\n';
  let [d, alter] = transposeCantus(cid, arrangement, keysig);
  // Output voices
  for (let v=0; v<arrangement.parts.length; ++v) {
    const vocra = arrangement.parts[v];
    abc += `V: V${v} clef=${vocras[vocra].clef} name=""\n`;
  }
  // Output notes
  for (let v=0; v<arrangement.parts.length; ++v) {
    abc += `[V: V${v}]`;
    for (let n=0; n<d.length; ++n) {
      if (arrangement.parts[v] !== arrangement.cantus) {
        abc += 'z' + timesig.measure_len + '|';
      } else {
        abc += alter2abc(alter[n]);
        abc += d2abc(d[n] - clefs[cantus_clef].transpose) + timesig.measure_len + '|';
      }
    }
    abc += '\n';
  }
  return abc;
}

function cantusToData(cid, arrangement, keysig, timesig) {
  let [d, alter] = transposeCantus(cid, arrangement, keysig);
  nd.set_keysig(keysig);
  nd.set_timesig(timesig);
  nd.voices = [];
  for (let v=0; v<arrangement.parts.length; ++v) {
    const vocra = arrangement.parts[v];
    const is_cantus = arrangement.parts[v] === arrangement.cantus;
    let notes = [];
    for (let n=0; n<d.length; ++n) {
      notes.push({
        d: is_cantus ? d[n] : 0,
        alter: is_cantus ? alter[n] : 10,
        len: timesig.measure_len,
        startsTie: false
      });
    }
    nd.voices.push({
      clef: vocras[vocra].clef,
      name: vocras[vocra].short,
      species: 10,
      locked: is_cantus,
      notes: notes
    });
  }
  nd.algo = 'CA3';
}

export function showCantusModal() {
  if (state.state !== 'ready') return;
  let st = '';
  st += "<div style='width: 100%'>";
  for (let cid=0; cid<canti.length; ++cid) {
    st += `<a id=acantus${cid} href=#><div id=cantus${cid}></div></a> `;
  }
  st += "</div>";
  showModal(1, 'Choose cantus firmus', st, '', [], [], false, ()=>{}, ()=>{});
  for (let cid=0; cid<canti.length; ++cid) {
    const cantus = canti[cid];
    ABCJS.renderAbc(`cantus${cid}`, cantusToAbc(cid), {staffwidth: 110});
    document.getElementById('acantus' + cid).onclick=function() {
      $('#Modal1').modal('hide');
      showCantusModal2(cid);
    };
  }
}

function makeArrangements() {
  for (let i in arrangements) {
    let arrangement = arrangements[i];
    arrangement.val = i;
    arrangement.text = `${arrangement.parts.length} parts, cantus in ${arrangement.cantus}`;
  }
  return arrangements;
}

function updateCantusPreview(cid) {
  const timesig = timesigs.find(timesig => timesig.beats_per_measure + '/' + timesig.beat_type === $("#selectTimeSig option:selected" ).val() );
  const keysig = keysigs[$("#selectKey option:selected" ).val()];
  const arrangement = arrangements[$("#selectArrangement option:selected" ).val()];
  const parserParams = {
    dragging: false,
    selectAll: false,
    selectionColor: "black",
    format: {
      voicefont: "Times New Roman 11 bold",
    }
  };
  ABCJS.renderAbc(`cantusAbc`, cantusPreviewToAbc(cid, arrangement, keysig, timesig), parserParams);
}

function showCantusModal2(cid) {
  let st = '';
  st += `<table cellpadding=5>`;
  st += `<tr><td>`;
  st += `<b>Exercise:</b><td>`;
  st += showSelect('selectArrangement', 0, makeArrangements());
  st += `<tr><td>`;
  st += `<b>Key:</b><td>`;
  st += showSelect('selectKey', 'C', makeCantusKeysigs());
  st += `<tr><td>`;
  st += `<b>Time signature:</b><td>`;
  st += showSelect('selectTimeSig', '4/4', makeCantusTimesig());
  st += `</table>`;
  st += "<div style='width: 100%'>";
  st += `<div id=cantusAbc></div> `;
  st += "</div>";
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(2, 'Cantus firmus arrangement', st, footer, [], ["modal-lg"], false, ()=>{}, ()=>{
    if (!okClicked) showCantusModal();
  });
  setTimeout(() => { updateCantusPreview(cid) }, 0);
  $('#selectArrangement').change(() => {
    updateCantusPreview(cid);
  });
  $('#selectKey').change(() => {
    updateCantusPreview(cid);
  });
  $('#selectTimeSig').change(() => {
    updateCantusPreview(cid);
  });
  $('#modalOk').click(() => {
    okClicked = true;
    $('#Modal2').modal('hide');
    storage2archiveStorage(4);
    nd.reset();
    cantusToData(
      cid,
      arrangements[$("#selectArrangement option:selected" ).val()],
      keysigs[$("#selectKey option:selected" ).val()],
      timesigs.find(timesig => timesig.beats_per_measure + '/' + timesig.beat_type === $("#selectTimeSig option:selected" ).val() ));
    saveState(true);
    async_redraw();
  });
}
