import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";

export let keysigs = {
  'C#': {name: 'C#', fifths: 7, mode: 0, base_note: 1},
  'F#': {name: 'F#', fifths: 6, mode: 0, base_note: 6},
  'B': {name: 'B', fifths: 5, mode: 0, base_note: 11},
  'E': {name: 'E', fifths: 4, mode: 0, base_note: 4},
  'A': {name: 'A', fifths: 3, mode: 0, base_note: 9},
  'D': {name: 'D', fifths: 2, mode: 0, base_note: 2},
  'G': {name: 'G', fifths: 1, mode: 0, base_note: 7},
  'C': {name: 'C', fifths: 0, mode: 0, base_note: 0},
  'F': {name: 'F', fifths: -1, mode: 0, base_note: 5},
  'Bb': {name: 'Bb', fifths: -2, mode: 0, base_note: 10},
  'Eb': {name: 'Eb', fifths: -3, mode: 0, base_note: 3},
  'Ab': {name: 'Ab', fifths: -4, mode: 0, base_note: 8},
  'Db': {name: 'Db', fifths: -5, mode: 0, base_note: 1},
  'Gb': {name: 'Gb', fifths: -6, mode: 0, base_note: 6},
  'Cb': {name: 'Cb', fifths: -7, mode: 0, base_note: 11},

  'A#m': {name: 'A#m', fifths: 7, mode: 9, base_note: 10},
  'D#m': {name: 'D#m', fifths: 6, mode: 9, base_note: 3},
  'G#m': {name: 'G#m', fifths: 5, mode: 9, base_note: 8},
  'C#m': {name: 'C#m', fifths: 4, mode: 9, base_note: 1},
  'F#m': {name: 'F#m', fifths: 3, mode: 9, base_note: 6},
  'Bm': {name: 'Bm', fifths: 2, mode: 9, base_note: 11},
  'Em': {name: 'Em', fifths: 1, mode: 9, base_note: 4},
  'Am': {name: 'Am', fifths: 0, mode: 9, base_note: 9},
  'Dm': {name: 'Dm', fifths: -1, mode: 9, base_note: 2},
  'Gm': {name: 'Gm', fifths: -2, mode: 9, base_note: 7},
  'Cm': {name: 'Cm', fifths: -3, mode: 9, base_note: 0},
  'Fm': {name: 'Fm', fifths: -4, mode: 9, base_note: 5},
  'Bbm': {name: 'Bbm', fifths: -5, mode: 9, base_note: 10},
  'Ebm': {name: 'Ebm', fifths: -6, mode: 9, base_note: 3},
  'Abm': {name: 'Abm', fifths: -7, mode: 9, base_note: 8},

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
    if (!(i % 15)) ksig.push([]);
    ksig[Math.floor(i / 15)].push({name: keysig, i: i, value: keysigs[keysig]});
    ++i;
  }
  //console.log(ksig);
  let st = '';
  st += '<table class=table>';
  st += '<tr>';
  st += '<th>Key signature';
  st += '<th style="vertical-align:middle; text-align: center">Major';
  st += '<th style="vertical-align:middle; text-align: center">Minor';
  //st += '<th style="vertical-align:middle; text-align: center">Mixolydian';
  let xlen = Object.keys(keysigs).length / 15;
  //console.log(xlen);
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
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalTitle").innerHTML = 'Choose key signature';
  document.getElementById("ModalBody").innerHTML = st;
  i = 0;
  for (const keysig in keysigs) {
    document.getElementById('akeysig' + i).onclick=function() {
      $('#Modal').modal('hide');
      nd.set_keysig(keysigs[keysig]);
      saveState();
      async_redraw();
    };
    ++i;
  }
  $('#Modal').modal();
}
