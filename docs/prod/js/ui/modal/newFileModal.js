import {async_redraw, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { enableKeys } from "../commands.js";
import { new_file } from "../edit/editScore.js";
import { showModal } from "../lib/modal.js";

function parts_html(parts) {
  let st = '';
  st += `<a id=aparts${parts} class='btn btn-outline-white p-3' href=# role='button' style='min-width: 50px;'>`;
  st += '';
  st += `<div style='font-family: sans-serif; font-size: 1.5em'>${parts}</div>`;
  st += '</a>&nbsp;&nbsp;&nbsp;&nbsp;';
  return st;
}

export function showNewFileModal() {
  if (state.state !== 'ready') return;
  let st = '';
  //st += "<b>:</b>";
  st += "<div style='width: 100%; text-align: center;'>";
  for (let i=1; i<=4; ++i) {
    st += parts_html(i);
  }
  st += "</table></div>";
  enableKeys(false);
  //const footer = `<span style='color:#cccccc; width:100%'>* You will be able to add more parts later</span>`;
  showModal(1, 'Number of parts in new exercise', st, '', [], [], false, ()=>{}, ()=>{
    $("#Modal1").unbind("keypress");
    enableKeys(true);
  });
  for (let i=1; i<=4; ++i) {
    document.getElementById('aparts' + i).onclick=function() {
      $('#Modal1').modal('hide');
      new_file(i);
    };
  }
  $("#Modal1").keypress(function(event) {
    if (event.which >= 49 && event.which <= 52) {
      $('#Modal1').modal('hide');
      new_file(event.which - 48);
    }
  });
}
