import {state} from "../../abc/abchelper.js";
import { showModal } from "../lib/modal.js";
import { publish } from "../../integration/publish.js";
import { mgen_login } from "../../core/remote.js";
import { nd } from "../../notes/NotesData.js";

function showSelectSecurity() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_security"><b>Allow access to this exercise:</b></label>`;
  st += `<select class="form-control custom-select" id=sel_security name=sel_security>`;
  st += `<option value=0>To anyone</option>`;
  st += `<option value=1 selected>To all authenticated users</option>`;
  st += `<option value=2>To me and administrators</option>`;
  st += `<option value=3>To me only</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

export function showPublishModal() {
  if (state.state !== 'ready') return;
  let st = '';
  st += "<b>Publish as:</b> "
  if (mgen_login) {
    st += mgen_login;
  } else {
    st += `<a href=https://artinfuser.com/exercise/login.php style='color:red' target=_blank>Please login</a>`;
  }
  if (nd.root_eid) {
    st += "<br><b>Parent exercise:</b> "
    st += `<a href=https://artinfuser.com/exercise/exercise.php?id=${nd.root_eid} target=_blank>#${nd.root_eid}</a>`;
  }
  st += showSelectSecurity();
  let footer = '';
  if (mgen_login) {
    footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  }
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, `Publish exercise to <a href=https://artinfuser.com/exercise/exercises.php target=_blank>ArtInfuser database</a>`, st, footer, [], [], true, ()=>{
    const el = document.querySelector('#sel_security');
    el.focus();
    $("#sel_security").keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault();
        $('#modalOk').click();
      }
    });
  }, ()=>{});
  $('#modalOk').click(() => {
    $('#Modal1').modal('hide');
    publish(Number($("#sel_security option:selected").val()));
  });
}
