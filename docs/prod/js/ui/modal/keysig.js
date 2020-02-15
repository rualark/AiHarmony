import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {initTooltips} from "../lib/tooltips.js";

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

  'G# mix': {name: 'G# mix', fifths: 7, mode: 7, base_note: 8},
  'C# mix': {name: 'C# mix', fifths: 6, mode: 7, base_note: 1},
  'F# mix': {name: 'F# mix', fifths: 5, mode: 7, base_note: 6},
  'B mix': {name: 'B mix', fifths: 4, mode: 7, base_note: 11},
  'E mix': {name: 'E mix', fifths: 3, mode: 7, base_note: 4},
  'A mix': {name: 'A mix', fifths: 2, mode: 7, base_note: 9},
  'D mix': {name: 'D mix', fifths: 1, mode: 7, base_note: 2},
  'G mix': {name: 'G mix', fifths: 0, mode: 7, base_note: 7},
  'C mix': {name: 'C mix', fifths: -1, mode: 7, base_note: 0},
  'F mix': {name: 'F mix', fifths: -2, mode: 7, base_note: 5},
  'Bb mix': {name: 'Bb mix', fifths: -3, mode: 7, base_note: 10},
  'Eb mix': {name: 'Eb mix', fifths: -4, mode: 7, base_note: 3},
  'Ab mix': {name: 'Ab mix', fifths: -5, mode: 7, base_note: 8},
  'Db mix': {name: 'Db mix', fifths: -6, mode: 7, base_note: 1},
  'Gb mix': {name: 'Gb mix', fifths: -7, mode: 7, base_note: 6},

  'D# dor': {name: 'D# dor', fifths: 7, mode: 2, base_note: 3},
  'G# dor': {name: 'G# dor', fifths: 6, mode: 2, base_note: 8},
  'C# dor': {name: 'C# dor', fifths: 5, mode: 2, base_note: 1},
  'F# dor': {name: 'F# dor', fifths: 4, mode: 2, base_note: 6},
  'B dor': {name: 'B dor', fifths: 3, mode: 2, base_note: 11},
  'E dor': {name: 'E dor', fifths: 2, mode: 2, base_note: 4},
  'A dor': {name: 'A dor', fifths: 1, mode: 2, base_note: 9},
  'D dor': {name: 'D dor', fifths: 0, mode: 2, base_note: 2},
  'G dor': {name: 'G dor', fifths: -1, mode: 2, base_note: 7},
  'C dor': {name: 'C dor', fifths: -2, mode: 2, base_note: 0},
  'F dor': {name: 'F dor', fifths: -3, mode: 2, base_note: 5},
  'Bb dor': {name: 'Bb dor', fifths: -4, mode: 2, base_note: 10},
  'Eb dor': {name: 'Eb dor', fifths: -5, mode: 2, base_note: 3},
  'Ab dor': {name: 'Ab dor', fifths: -6, mode: 2, base_note: 8},
  'Db dor': {name: 'Db dor', fifths: -7, mode: 2, base_note: 1},

  'E# phr': {name: 'E# phr', fifths: 7, mode: 4, base_note: 5},
  'A# phr': {name: 'A# phr', fifths: 6, mode: 4, base_note: 10},
  'D# phr': {name: 'D# phr', fifths: 5, mode: 4, base_note: 3},
  'G# phr': {name: 'G# phr', fifths: 4, mode: 4, base_note: 8},
  'C# phr': {name: 'C# phr', fifths: 3, mode: 4, base_note: 1},
  'F# phr': {name: 'F# phr', fifths: 2, mode: 4, base_note: 6},
  'B phr': {name: 'B phr', fifths: 1, mode: 4, base_note: 11},
  'E phr': {name: 'E phr', fifths: 0, mode: 4, base_note: 4},
  'A phr': {name: 'A phr', fifths: -1, mode: 4, base_note: 9},
  'D phr': {name: 'D phr', fifths: -2, mode: 4, base_note: 2},
  'G phr': {name: 'G phr', fifths: -3, mode: 4, base_note: 7},
  'C phr': {name: 'C phr', fifths: -4, mode: 4, base_note: 0},
  'F phr': {name: 'F phr', fifths: -5, mode: 4, base_note: 5},
  'Bb phr': {name: 'Bb phr', fifths: -6, mode: 4, base_note: 10},
  'Eb phr': {name: 'Eb phr', fifths: -7, mode: 4, base_note: 3},

  'F# lyd': {name: 'F# lyd', fifths: 7, mode: 5, base_note: 6},
  'B lyd': {name: 'B lyd', fifths: 6, mode: 5, base_note: 11},
  'E lyd': {name: 'E lyd', fifths: 5, mode: 5, base_note: 4},
  'A lyd': {name: 'A lyd', fifths: 4, mode: 5, base_note: 9},
  'D lyd': {name: 'D lyd', fifths: 3, mode: 5, base_note: 2},
  'G lyd': {name: 'G lyd', fifths: 2, mode: 5, base_note: 7},
  'C lyd': {name: 'C lyd', fifths: 1, mode: 5, base_note: 0},
  'F lyd': {name: 'F lyd', fifths: 0, mode: 5, base_note: 5},
  'Bb lyd': {name: 'Bb lyd', fifths: -1, mode: 5, base_note: 10},
  'Eb lyd': {name: 'Eb lyd', fifths: -2, mode: 5, base_note: 3},
  'Ab lyd': {name: 'Ab lyd', fifths: -3, mode: 5, base_note: 8},
  'Db lyd': {name: 'Db lyd', fifths: -4, mode: 5, base_note: 1},
  'Gb lyd': {name: 'Gb lyd', fifths: -5, mode: 5, base_note: 6},
  'Cb lyd': {name: 'Cb lyd', fifths: -6, mode: 5, base_note: 11},
  'Fb lyd': {name: 'Fb lyd', fifths: -7, mode: 5, base_note: 4},

  'B# loc': {name: 'B# loc', fifths: 7, mode: 11, base_note: 0},
  'E# loc': {name: 'E# loc', fifths: 6, mode: 11, base_note: 5},
  'A# loc': {name: 'A# loc', fifths: 5, mode: 11, base_note: 10},
  'D# loc': {name: 'D# loc', fifths: 4, mode: 11, base_note: 3},
  'G# loc': {name: 'G# loc', fifths: 3, mode: 11, base_note: 8},
  'C# loc': {name: 'C# loc', fifths: 2, mode: 11, base_note: 1},
  'F# loc': {name: 'F# loc', fifths: 1, mode: 11, base_note: 6},
  'B loc': {name: 'B loc', fifths: 0, mode: 11, base_note: 11},
  'E loc': {name: 'E loc', fifths: -1, mode: 11, base_note: 4},
  'A loc': {name: 'A loc', fifths: -2, mode: 11, base_note: 9},
  'D loc': {name: 'D loc', fifths: -3, mode: 11, base_note: 2},
  'G loc': {name: 'G loc', fifths: -4, mode: 11, base_note: 7},
  'C loc': {name: 'C loc', fifths: -5, mode: 11, base_note: 0},
  'F loc': {name: 'F loc', fifths: -6, mode: 11, base_note: 5},
  'Bb loc': {name: 'Bb loc', fifths: -7, mode: 11, base_note: 10},
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
  st += '<table style="border-collapse: collapse" border=1>';
  st += '<tr>';
  st += '<th style="vertical-align:middle; text-align: center">Key<br>sig.';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Major">Maj';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Minor">Minor';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Mixolydian">Mixolyd.';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Dorian">Dorian';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Phrygian">Phryg.';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Lydian">Lydian';
  st += '<th style="vertical-align:middle; text-align: center" data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="Locrian">Locrian';
  let xlen = Object.keys(keysigs).length / 15;
  //console.log(xlen);
  for (let y=0; y<15; ++y) {
    st += '<tr>';
    if (y < 7) st += `<td style="vertical-align:middle; text-align: center">${7 - y} #`;
    if (y === 7) st += `<td style="vertical-align:middle; text-align: center">0`;
    if (y > 7) st += `<td style="vertical-align:middle; text-align: center">${y - 7} b`;
    for (let x=0; x<xlen; ++x) {
      st += '<td style="vertical-align:middle; text-align: center">';
      st += `<a id=akeysig${ksig[x][y].i} class='btn btn-outline-white p-1' href=# role='button'>`;
      st += ksig[x][y].name;
      st += '</a>';
    }
  }
  st += '</table>';
  //$('#modalDialog').removeClass("modal-lg");
  $('#modalDialog').addClass("modal-lg");
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
  initTooltips(200, 100);
  $('#Modal').modal();
}
