import {async_redraw} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import { showModal, showMultiButtonSelect } from "./lib/modal.js";
import { c2d, d2abc, alter2abc } from "../../notes/noteHelper.js";
import { button_visible_active } from "../../ui/lib/uilib.js";

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
  {parts: ['Soprano', 'Bass'], cantus: 'Bass'},
  {parts: ['Soprano', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Bass'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Alto'},
  {parts: ['Soprano', 'Alto', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Soprano'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Alto'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Tenor'},
  {parts: ['Soprano', 'Alto', 'Tenor', 'Bass'], cantus: 'Bass'},
];

const vocra = {
  'Soprano': {clef: 'treble', short: 'Sop.'},
  'Alto': {clef: 'treble', short: 'Alt.'},
  'Tenor': {clef: 'treble', short: 'Ten.'},
  'Bass': {clef: 'treble', short: 'Bas.'},
};

export function cantusToAbc(cid) {
  let abc = '';
  abc += '%%barnumbers 0\n';
  //abc += 'M:4/4\n';
  abc += 'K:C\n';
  abc += 'L:1/16\n';
  abc += `V: V0 clef=treble name=""\n`;
  abc += `[V: V0]`;
  const cantus = canti[cid];
  for (let n=0; n<cantus.length; ++n) {
    let d = c2d(cantus[n]);
    abc += cantus[n] + '16|';
  }
  abc += '\n';
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

function showCantusModal2(cid) {
  let st = '';
  st += `<table>`;
  st += `<tr><td>`;
  st += `<b>Mode:</b><td>`;
  st += showMultiButtonSelect('selectMode', 'major', [
    {id: 'major', text: 'Major'},
    {id: 'minor', text: 'Minor'},
  ]);
  st += `<tr><td>`;
  st += `<b>Parts:</b><td>`;
  st += showMultiButtonSelect('selectVoices', '2', [
    {id: '2', text: '2'},
    {id: '3', text: '3'},
    {id: '4', text: '4'},
  ]);
  st += `<tr><td>`;
  st += `<b>Cantus firmus in:</b><td>`;
  st += showMultiButtonSelect('selectCantusIn', 'bas', [
    {id: 'sop', text: 'Soprano'},
    {id: 'alt', text: 'Alto'},
    {id: 'ten', text: 'Tenor'},
    {id: 'bas', text: 'Bass'},
  ]);
  st += `<tr><td valign=top>`;
  st += `<b>Key:</b><td>`;
  st += showMultiButtonSelect('selectKey', 'C', [
    {id: 'C', text: 'C'},
    {id: 'G', text: 'G'},
    {id: 'D', text: 'D'},
    {id: 'A', text: 'A'},
    {id: 'E', text: 'E'},
    {id: 'Fs', text: 'F#'},
    {id: 'Cs', text: 'C#'},
    {id: 'F', text: 'F', newline: true},
    {id: 'Bb', text: 'Bb'},
    {id: 'Eb', text: 'Eb'},
    {id: 'Ab', text: 'Ab'},
    {id: 'Db', text: 'Db'},
    {id: 'Gb', text: 'Gb'},
    {id: 'Cb', text: 'Cb'},
  ]);
  st += `</table>`;
  st += "<div style='width: 100%'>";
  st += `<div id=cantusAbc></div> `;
  st += "</div>";
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, 'Cantus firmus arrangement', st, footer, [], [], false, ()=>{}, ()=>{});
  updateCantusSelects();
  ABCJS.renderAbc(`cantusAbc`, cantusToAbc(cid), {staffwidth: 110});
  $('#modalOk').click(() => {
    $('#Modal1').modal('hide');
    //console.log($('#selectVoices2').attr('data-value'));
  });
}
