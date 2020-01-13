import {dataToAbc} from "./dataToAbc.js";
import {notesData} from "./notesData.js";
import {async_redraw} from "./abchelper.js";

export let clefs = {
  'treble': {name: 'Treble', transpose: 0},
  'bass': {name: 'Bass', transpose: 0},
  'alto': {name: 'Alto', transpose: 0},
  'tenor': {name: 'Tenor', transpose: 0},
  'treble-8': {name: 'Treble down 8', transpose: -7},
  'treble+8': {name: 'Treble up 8', transpose: 7},
  'bass-8': {name: 'Bass down 8', transpose: -7},
  'bass+8': {name: 'Bass up 8', transpose: 7},
};

export function showClefsModal(voice) {
  let st = '';
  st += "<div style='width: 100%; text-align: center;'><table style='display: inline'>";
  let i;
  i = 0;
  for (const clef in clefs) {
    st += "<tr>";
    st += `<td style='vertical-align:middle'><b>${clefs[clef].name}:</b>`;
    st += `<td style='vertical-align:middle; text-align: center'><a id=aclef${i} href=#><span id=clef${i}></span></a> `;
    ++i;
  }
  st += "</table></div>";
  document.getElementById("clefsModalTitle").innerHTML = 'Choose clef';
  document.getElementById("clefsModalBody").innerHTML = st;
  i = 0;
  for (const clef in clefs) {
    ABCJS.renderAbc(`clef${i}`, `V: V0 clef=${clef}\n[V: V0]x`, {staffwidth: 110});
    document.getElementById('aclef' + i).onclick=function() {
      $('#clefsModal').modal('hide');
      voice.clef = clef;
      async_redraw();
    };
    ++i;
  }
  $('#clefsModal').modal();
}
