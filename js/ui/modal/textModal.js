import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { enableKeys } from "../commands.js";

function submitText(v, n, type) {
  let text = $('#textArea').val().trim().substr(0, 100);
  if (type === 'lyric') {
    nd.set_lyric(v, n, text);
  } else {
    nd.set_text(v, n, text);
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
  text = text ? text : "";
  enableKeys(false);
  st += `<div class="input-group mb-3">`;
  st += ` <textarea id=textArea type="text" rows=3 class="form-control">${text}</textarea>`;
  st += `</div>`;
  st += `<span style='color:#aaaaaa'><img src=img/keyboard3.png height=20 style='vertical-align:middle; opacity:0.3'> Press Ctrl+Enter to submit</span>`
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-danger" id=modalDelete>Delete</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = footer;
  $("#textArea").keypress(function (e) {
    if(e.which == 10 && (e.ctrlKey || e.metaKey)) {
      submitText(v, n, type);
      e.preventDefault();
    }
  });
  $('#Modal').addClass("right");
  $('#Modal').on('shown.bs.modal', function () {
    let el = document.querySelector('#textArea');
    el.focus();
    //el.setSelectionRange(0, el.value.length)
    el.setSelectionRange(el.value.length, el.value.length)
  });
  $('#modalOk').click(() => {
    submitText(v, n, type);
  });
  $('#modalDelete').click(() => {
    $("#textArea").val("");
    submitText(v, n, type);
  });
  $('#Modal').on('hidden.bs.modal', () => {
    $('#Modal').removeClass("right");
    enableKeys(true);
  });
  $('#Modal').modal();
}
