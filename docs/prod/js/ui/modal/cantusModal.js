import {async_redraw, state} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import { showModal, showSelect } from "../lib/modal.js";
import { d2abc, abc2d, alter2abc, keysig_imprint } from "../../notes/noteHelper.js";
import { randomSelect } from "../../ui/lib/uilib.js";
import { keysigs } from "./keysig.js";
import { clefs } from "./clefs.js";
import { nd } from "../../notes/NotesData.js";
import { storage2archiveStorage } from "../../state/state.js";
import { timesigs } from "./timesig.js";
import { initTooltips } from "../lib/tooltips.js";
import { trackEvent } from "../../integration/tracking.js";

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

const vocras = {
  'Soprano': {clef: 'treble', short: 'Sop.', minD: 35, maxD: 47},
  'Alto': {clef: 'treble', short: 'Alt.', minD: 31, maxD: 43},
  'Tenor': {clef: 'treble-8', short: 'Ten.', minD: 28, maxD: 40},
  'Bass': {clef: 'bass', short: 'Bas.', minD: 24, maxD: 36},
};

function makeCantusKeysigs() {
  let res = [];
  for (const keysig in keysigs) {
    if (keysigs[keysig].fifths > 5) continue;
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
    abc += `V: V${v} clef=${vocras[vocra].clef} name="${vocra}"\n`;
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
  showModal(1, 'Choose cantus firmus', st, '', [], [], true, ()=>{}, ()=>{});
  for (let cid=0; cid<canti.length; ++cid) {
    const cantus = canti[cid];
    ABCJS.renderAbc(`cantus${cid}`, cantusToAbc(cid), {staffwidth: 110});
    document.getElementById('acantus' + cid).onclick=function() {
      $('#Modal1').modal('hide');
      showCantusModal2(cid);
    };
  }
}

function getArrangement() {
  let arrangement = {parts: [], cantus: ''};
  for (const vocra in vocras) {
    const val = $(`#select${vocra} option:selected`).val();
    if (val === 'cf') {
      arrangement.cantus = vocra;
      arrangement.parts.push(vocra);
    }
    if (val === 'cp') {
      arrangement.parts.push(vocra);
    }
  }
  return arrangement;
}

function shuffleArrangement(cid) {
  let arrangement = {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: ''};
  const removed = Math.floor(Math.random() * 3);
  for(var i = 0; i < removed; ++i){
    arrangement.parts.splice(Math.floor(Math.random() * arrangement.parts.length), 1);
  }
  arrangement.cantus = arrangement.parts[Math.floor(Math.random() * arrangement.parts.length)];
  // Set
  for (const vocra in vocras) {
    if (vocra === arrangement.cantus) {
      $(`#select${vocra}`).val('cf');
    } else if (arrangement.parts.includes(vocra)) {
      $(`#select${vocra}`).val('cp');
    } else $(`#select${vocra}`).val('-');
  }
  randomSelect('selectKey');
  randomSelect('selectTimeSig');
  updateCantusPreview(cid);
}

function updateCantusPreview(cid) {
  const timesig = timesigs.find(timesig => timesig.beats_per_measure + '/' + timesig.beat_type === $("#selectTimeSig option:selected" ).val() );
  const keysig = keysigs[$("#selectKey option:selected" ).val()];
  const parserParams = {
    dragging: false,
    selectAll: false,
    selectionColor: "black",
    format: {
      voicefont: "Times New Roman 11 bold",
    }
  };
  ABCJS.renderAbc(`cantusAbc`, cantusPreviewToAbc(cid, getArrangement(), keysig, timesig), parserParams);
}

function showCantusModal2(cid) {
  trackEvent('AiHarmony', 'open', 'Choose cantus');
  let st = '';
  st += `<table cellpadding=5>`;
  for (const vocra in vocras) {
    st += `<tr><td>`;
    st += `<b>${vocra}:</b><td>`;
    let selected = '-';
    if (vocra === 'Soprano') selected = 'cp';
    if (vocra === 'Alto') selected = 'cf';
    st += showSelect(`select${vocra}`, selected, [
      {val: '-', text: '-'},
      {val: 'cf', text: 'Cantus firmus'},
      {val: 'cp', text: 'Counterpoint'},
    ]);
    setTimeout(() => {
      $(`#select${vocra}`).change(() => {
        // Replace multiple cf with cp
        if ($(`#select${vocra} option:selected`).val() === 'cf') {
          for (const vocra2 in vocras) {
            if (vocra2 === vocra) continue;
            if ($(`#select${vocra2} option:selected`).val() === 'cf') {
              $(`#select${vocra2}`).val('cp');
            }
          }
        }
        updateCantusPreview(cid);
      });
    }, 0);
    if (vocra === 'Soprano') {
      st += `<td>`;
      st += `<a href=# id=shuffleArrangement data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Random arrangement">`;
      st += `<img src=img/shuffle.png height=25></a>`;
      setTimeout(() => {
        $(`#shuffleArrangement`).click(() => {
          shuffleArrangement(cid);
        });
      }, 0);
    }
  }
  st += `<tr><td colspan=2><hr>`;
  st += `<tr><td>`;
  st += `<b>Key:</b><td>`;
  st += showSelect('selectKey', 'C', makeCantusKeysigs());
  st += `<tr><td>`;
  st += `<b>Time signature:</b><td>`;
  st += showSelect('selectTimeSig', '4/4', makeCantusTimesig());
  st += `<tr><td colspan=2><hr>`;
  st += `</table>`;
  st += "<div style='width: 100%'>";
  st += `<div id=cantusAbc></div> `;
  st += "</div>";
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(2, 'New counterpoint exercise', st, footer, [], ["modal-lg"], true, ()=>{}, ()=>{
    if (!okClicked) showCantusModal();
  });
  initTooltips(200, 100);
  setTimeout(() => { updateCantusPreview(cid) }, 0);
  $('#selectKey').change(() => {
    updateCantusPreview(cid);
  });
  $('#selectTimeSig').change(() => {
    updateCantusPreview(cid);
  });
  $('#modalOk').click(() => {
    okClicked = true;
    $('#Modal2').modal('hide');
    trackEvent('AiHarmony', 'open', 'Create new cantus exercise');
    storage2archiveStorage(4);
    nd.reset();
    cantusToData(
      cid,
      getArrangement(),
      keysigs[$("#selectKey option:selected" ).val()],
      timesigs.find(timesig => timesig.beats_per_measure + '/' + timesig.beat_type === $("#selectTimeSig option:selected" ).val() ));
    saveState(true);
    async_redraw();
  });
}
