import {async_redraw} from "./abchelper.js";
import {nd} from "./NotesData.js";

export let keysigs = {
  'C#': {fifths: 7, mode: 0, base_note: 1},
  'F#': {fifths: 6, mode: 0, base_note: 6},
  'B': {fifths: 5, mode: 0, base_note: 11},
  'E': {fifths: 4, mode: 0, base_note: 4},
  'A': {fifths: 3, mode: 0, base_note: 9},
  'D': {fifths: 2, mode: 0, base_note: 2},
  'G': {fifths: 1, mode: 0, base_note: 7},
  'C': {fifths: 0, mode: 0, base_note: 0},
  'F': {fifths: -1, mode: 0, base_note: 5},
  'Bb': {fifths: -2, mode: 0, base_note: 10},
  'Eb': {fifths: -3, mode: 0, base_note: 3},
  'Ab': {fifths: -4, mode: 0, base_note: 8},
  'Db': {fifths: -5, mode: 0, base_note: 1},
  'Gb': {fifths: -6, mode: 0, base_note: 6},
  'Cb': {fifths: -7, mode: 0, base_note: 11},

  'A#m': {fifths: 7, mode: 9, base_note: 10},
  'D#m': {fifths: 6, mode: 9, base_note: 3},
  'G#m': {fifths: 5, mode: 9, base_note: 8},
  'C#m': {fifths: 4, mode: 9, base_note: 1},
  'F#m': {fifths: 3, mode: 9, base_note: 6},
  'Bm': {fifths: 2, mode: 9, base_note: 11},
  'Em': {fifths: 1, mode: 9, base_note: 4},
  'Am': {fifths: 0, mode: 9, base_note: 9},
  'Dm': {fifths: -1, mode: 9, base_note: 2},
  'Gm': {fifths: -2, mode: 9, base_note: 7},
  'Cm': {fifths: -3, mode: 9, base_note: 0},
  'Fm': {fifths: -4, mode: 9, base_note: 5},
  'Bbm': {fifths: -5, mode: 9, base_note: 10},
  'Ebm': {fifths: -6, mode: 9, base_note: 3},
  'Abm': {fifths: -7, mode: 9, base_note: 8},

  /*
  'G# mix': {fifths: 7, mode: 7, base_note: 8},
  'C# mix': {fifths: 6, mode: 7, base_note: 1},
  'F# mix': {fifths: 5, mode: 7, base_note: 6},
  'B mix': {fifths: 4, mode: 7, base_note: 11},
  'E mix': {fifths: 3, mode: 7, base_note: 4},
  'A mix': {fifths: 2, mode: 7, base_note: 9},
  'D mix': {fifths: 1, mode: 7, base_note: 2},
  'G mix': {fifths: 0, mode: 7, base_note: 7},
  'C mix': {fifths: -1, mode: 7, base_note: 0},
  'F mix': {fifths: -2, mode: 7, base_note: 6},
  'Bb mix': {fifths: -3, mode: 7, base_note: 10},
  'Eb mix': {fifths: -4, mode: 7, base_note: 3},
  'Ab mix': {fifths: -5, mode: 7, base_note: 8},
  'Db mix': {fifths: -6, mode: 7, base_note: 1},
  'Gb mix': {fifths: -7, mode: 7, base_note: 6},
   */
};

export function showKeysigModal() {
  let ksig = [];
  let i;
  i = 0;
  for (const keysig in keysigs) {
    keysigs[keysig].name = keysig;
    if (!(i % 15)) ksig.push([]);
    ksig[Math.floor(i / 15)].push({name: keysig, i: i, value: keysigs[keysig]});
    ++i;
  }
  console.log(ksig);
  let st = '';
  st += '<table class=table>';
  st += '<tr>';
  st += '<th>Key signature';
  st += '<th style="vertical-align:middle; text-align: center">Major';
  st += '<th style="vertical-align:middle; text-align: center">Minor';
  //st += '<th style="vertical-align:middle; text-align: center">Mixolydian';
  let xlen = Object.keys(keysigs).length / 15;
  console.log(xlen);
  for (let y=0; y<15; ++y) {
    st += '<tr>';
    if (y < 7) st += `<td>${7 - y} sharps`;
    if (y === 7) st += `<td>0 sharps/flats`;
    if (y > 7) st += `<td>${y - 7} flats`;
    for (let x=0; x<xlen; ++x) {
      st += '<td style="vertical-align:middle; text-align: center">';
      st += `<a id=akeysig${ksig[x][y].i} class='btn btn-outline-white p-1' href=# role='button'>`;
      st += ksig[x][y].name;
      st += '</a>';
    }
  }
  st += '</table>';
  document.getElementById("ModalTitle").innerHTML = 'Choose key signature';
  document.getElementById("ModalBody").innerHTML = st;
  i = 0;
  for (const keysig in keysigs) {
    document.getElementById('akeysig' + i).onclick=function() {
      $('#Modal').modal('hide');
      nd.set_keysig(keysigs[keysig]);
      async_redraw();
    };
    ++i;
  }
  $('#Modal').modal();
}
