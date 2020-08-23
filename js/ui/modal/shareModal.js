import {state2url} from "../../state/state.js";
import {urlNoParams, environment} from "../../core/remote.js";
import { dataToAbc } from "../../abc/dataToAbc.js";
import { showModal } from "../lib/modal.js";
import { state } from "../../abc/abchelper.js";
import { showPublishModal } from "./publishModal.js";

export function showShareModal() {
  if (state.state !== 'ready') return;
  let st = '';

  st += `<a class='btn btn-outline-primary' role=button id=apublish href=#>Publish to ArtInfuser database</a><br><br>`;

  let url = urlNoParams() + '?state=' + state2url();
  //console.log('Share url length:', url.length);
  if (url.length > 2000) {
    alertify.error(`Generated url is ${url.length} characters long, because you try to share large piece of music. It is recommended to download and send file instead`, 15);
  }
  st += `Copy link below to share directly:<br><br>`;
  st += `<div class="input-group mb-3">`;
  st += ` <input readonly onClick="this.setSelectionRange(0, this.value.length)" id=shareurl type="text" class="form-control" value="${url}">`;
  st += ` <div class="input-group-append">`;
  st += `  <button style='margin-top:0px !important; margin-bottom:0px !important' data-clipboard-target=#shareurl class="btn btn-outline-secondary" type="button">`;
  st += `  <img height=20 src=img/clipboard.svg alt='Copy to clipboard'>`;
  st += `  </button>`;
  st += ` </div>`;
  st += `</div>`;

  if (environment === 'dev') {
    st += `Copy ABC notation below to share:<br><br>`;
    st += `<div class="input-group mb-3">`;
    st += ` <textarea readonly onClick="this.setSelectionRange(0, this.value.length)" id=abcinput class="form-control">${dataToAbc()}</textarea>`;
    st += ` <div class="input-group-append">`;
    st += `  <button style='margin-top:0px !important; margin-bottom:0px !important' data-clipboard-target=#abcinput class="btn btn-outline-secondary" type="button">`;
    st += `  <img height=20 src=img/clipboard.svg alt='Copy to clipboard'>`;
    st += `  </button>`;
    st += ` </div>`;
    st += `</div>`;
  }

  new ClipboardJS('.btn');
  showModal(1, 'Share music', st, '', [], [], false, ()=>{}, ()=>{});
  $('#apublish').click(() => {
    $('#Modal1').modal('hide');
    showPublishModal();
  });
}
