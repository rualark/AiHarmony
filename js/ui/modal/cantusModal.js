import {async_redraw} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import { showModal, showMultiButtonSelect, showSelect } from "./lib/modal.js";
import { c2d, d2abc, abc2d, alter2abc } from "../../notes/noteHelper.js";
import { button_visible_active } from "../../ui/lib/uilib.js";
import { keysigs } from "./keysig.js";
import { clefs } from "./clefs.js";

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
  'Soprano': {clef: 'treble', short: 'Sop.'},
  'Alto': {clef: 'treble', short: 'Alt.'},
  'Tenor': {clef: 'treble-8', short: 'Ten.'},
  'Bass': {clef: 'bass', short: 'Bas.'},
};

function majorKeysigs() {
  let res = {};
  for (const keysig in keysigs) {
    if (keysigs[keysig].mode === 0) {
      res[keysig] = keysigs[keysig];
    }
  }
  return res;
}

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
  const ldif = rangeMinD - minD;
  const hdif = rangeMaxD - maxD;
  let transpose_step = 0;
  if (ldif > -hdif) {
    transpose_step = step;
  } else {
    transpose_step = -step;
  }
  let range_penalty = Math.max(ldif, 0) - Math.min(hdif, 0);
  while (1) {
    transpose += transpose_step;
    ldif = icf[ii].nmin - ngv_min[v] - transpose;
    hdif = icf[ii].nmax - ngv_max[v] - transpose;
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

function cantusPreviewToAbc(cid, arrangement, keysig) {
  let abc = '';
  abc += '%%barnumbers 0\n';
  abc += 'M:C\n';
  abc += `K:${keysig.name}\n`;
  abc += 'L:1/16\n';
  let d = [];
  let alter = [];
  let cantus_clef = vocras[arrangement.cantus].clef;
  let base_d = abc2d(keysig.name[0]) - 35;
  const cantus = canti[cid];
  for (let n=0; n<cantus.length; ++n) {
    let abc_note = cantus[n];
    if (abc_note[0] === '=') {
      abc_note = abc_note.slice(1);
      alter.push(0);
    } else {
      alter.push(10);
    }
    d.push(abc2d(abc_note) - clefs[cantus_clef].transpose + base_d);
  }
  for (let v=0; v<arrangement.parts.length; ++v) {
    const vocra = arrangement.parts[v];
    abc += `V: V${v} clef=${vocras[vocra].clef} name=""\n`;
  }
  for (let v=0; v<arrangement.parts.length; ++v) {
    abc += `[V: V${v}]`;
    for (let n=0; n<d.length; ++n) {
      if (arrangement.parts[v] !== arrangement.cantus) {
        abc += 'z16|';
      } else {
        if (alter[n] === 0) abc += '=';
        abc += d2abc(d[n]) + '16|';
      }
    }
    abc += '\n';
  }
  console.log(abc);
  return abc;
}

export function showCantusModal() {
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
  const keysig = keysigs[$("#selectKey option:selected" ).val() + ($('#selectModeMajor').attr('data-value') === 'Minor' ? "m" : "")];
  const arrangement = arrangements[$("#selectArrangement option:selected" ).val()]
  console.log($("#selectKey option:selected" ).val(), $('#selectModeMajor').attr('data-value'), keysig, $("#selectArrangement option:selected" ).val(), arrangement);
  const parserParams = {
    dragging: false,
    selectAll: false,
    selectionColor: "black",
    format: {
      voicefont: "Times New Roman 11 bold",
    }
  };
  ABCJS.renderAbc(`cantusAbc`, cantusPreviewToAbc(cid, arrangement, keysig), parserParams);
}

function showCantusModal2(cid) {
  let st = '';
  st += `<table cellpadding=5>`;
  st += `<tr><td>`;
  st += `<b>Arrange:</b><td>`;
  st += showSelect('selectArrangement', 0, makeArrangements());
  st += `<tr><td>`;
  st += `<b>Key:</b><td>`;
  st += showSelect('selectKey', 'C', makeCantusKeysigs());
  st += `<td>`;
  st += showMultiButtonSelect('selectMode', 'Major', [
    {id: 'Major', text: 'Major'},
    {id: 'Minor', text: 'Minor'},
  ], () => { updateCantusPreview(cid); });
  st += `</table>`;
  st += "<div style='width: 100%'>";
  st += `<div id=cantusAbc></div> `;
  st += "</div>";
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, 'Cantus firmus arrangement', st, footer, [], ["modal-lg"], false, ()=>{}, ()=>{});
  setTimeout(() => { updateCantusPreview(cid) }, 0);
  $('#selectArrangement').change(() => {
    updateCantusPreview(cid);
  });
  $('#selectKey').change(() => {
    updateCantusPreview(cid);
  });
  $('#modalOk').click(() => {
    $('#Modal1').modal('hide');
  });
}
