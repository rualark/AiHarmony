import {state} from "../../abc/abchelper.js";
import { showModal } from "../lib/modal.js";
import { publish } from "../../integration/publish.js";
import { mgen_login } from "../../core/remote.js";

function showSelectSecurity() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_security"><b>Security:</b></label>`;
  st += `<select class="form-control custom-select" id=sel_security name=sel_security>`;
  st += `<option value=0>Public</option>`;
  st += `<option value=1 selected>For authenticated users only</option>`;
  st += `<option value=2>For administrators only</option>`;
  st += `<option value=3>Unlisted</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

export function showPublishModal(v) {
  if (state.state !== 'ready') return;
  let st = '';
  st += "<b>Publish as:</b> "
  if (mgen_login !== '') {
    st += mgen_login;
  } else {
    st += `<a href=https://artinfuser.com/studio/login.php target=_blank>Login</a>`;
  }
  st += showSelectSecurity();
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, 'Publish exercise to ArtInfuser database', st, footer, [], [], true, ()=>{}, ()=>{});
  $('#modalOk').click(() => {
    $('#Modal1').modal('hide');
    publish(Number($("#sel_security option:selected").val()));
  });
}
