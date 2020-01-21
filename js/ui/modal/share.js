import {save_state_url} from "../../state.js";
import {cleanUrl} from "../../lib.js";

export function showShareModal() {
  let st = '';
  let url = cleanUrl() + '?state=' + save_state_url();
  st += `Copy link below to share:<br><br>`;
  st += `<div class="input-group mb-3">`;
  st += `<input onClick="this.setSelectionRange(0, this.value.length)" id=shareurl type="text" class="form-control" value="${url}">`;
  st += `<div class="input-group-append">`;
  st += `<button style='margin-top:0px !important; margin-bottom:0px !important' data-clipboard-target=#shareurl class="btn btn-outline-secondary" type="button">`;
  st += `<img height=20 src=img/clipboard.svg alt='Copy to clipboard'>`;
  st += `</button>`;
  st += `</div>`;
  st += `</div>`;
  //st += `<input id=shareurl value="${url}">`;
  //st += `<button class=btn data-clipboard-target=#shareurl>`;
  //st += `<img height=20 src=img/clipboard.svg alt='Copy to clipboard'>`;
  //st += `</button>`;
  new ClipboardJS('.btn');
  document.getElementById("ModalTitle").innerHTML = 'Share music';
  document.getElementById("ModalBody").innerHTML = st;
  $('#Modal').modal();
}
