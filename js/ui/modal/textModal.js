import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { enableKeys } from "../commands.js";

function submitText(v, n, type) {
  enableKeys(true);
  if (type === 'lyric') {
    nd.set_lyric(v, n, $('#textArea').val().substr(0, 100));
  } else {
    nd.set_text(v, n, $('#textArea').val().substr(0, 100));
  }
  $('#Modal').modal('hide');
  saveState();
  async_redraw();
}

export function showTextModal(v, n, type) {
  let st = '';
  if (type === 'lyric') {
    var text = nd.voices[v].notes[n].lyric;
    document.getElementById("ModalTitle").innerHTML = 'Add lyric below note';
  } else {
    var text = nd.voices[v].notes[n].text;
    document.getElementById("ModalTitle").innerHTML = 'Add text above note';
  }
  enableKeys(false);
  st += `<div class="input-group mb-3">`;
  st += ` <textarea id=textArea type="text" rows=5 class="form-control">${text}</textarea>`;
  st += `</div>`;
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = footer;
  $("#textArea").keypress(function (e) {
    if(e.which == 13 && !e.shiftKey) {
      submitText(v, n, type);
      e.preventDefault();
    }
  });
  $('#Modal').on('shown.bs.modal', function () {
    let el = document.querySelector('#textArea');
    console.log(el);
    el.focus();
    //el.setSelectionRange(0, el.value.length)
    el.setSelectionRange(el.value.length, el.value.length)
  });
  $('#modalOk').click(() => {
    submitText(v, n, type);
  });
  $('#Modal').on('hidden.bs.modal', () => {
    enableKeys(true);
  });
  $('#Modal').modal();
}
