import {async_redraw, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { showModal } from "../lib/modal.js";

const transpositions = [
  {dd: 7, text: "Up octave"},
  {dd: -7, text: "Down octave"},
];

function transposition_html(id) {
  let st = '';
  st += `<a id=atranspose${id} class='btn btn-outline-white p-1' href=# role='button' style='min-width: 30px;'>`;
  st += '';
  st += `<div style='font-family: sans-serif; font-size: 1.5em'>${transpositions[id].text}</div>`;
  st += '</a><br>';
  return st;
}

export function showTransposeModal(v) {
  if (state.state !== 'ready') return;
  let st = '';
  st += "<div style='width: 100%; text-align: center;'>";
  for (const i in transpositions) {
    st += transposition_html(i);
  }
  st += "</table></div>";
  showModal(1, 'Transpose part', st, '', [], [], false, ()=>{}, ()=>{});
  for (const i in transpositions) {
    document.getElementById('atranspose' + i).onclick=function() {
      $('#Modal1').modal('hide');
      nd.transpose_voice(v, transpositions[i].dd);
      saveState();
      async_redraw();
    };
  }
}
