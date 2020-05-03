import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { showModal } from "./lib/modal.js";

function submitText(v, n, type) {
  let text = $('#textArea').val().trim().substr(0, 100);
  if (type === 'lyric') {
    nd.set_lyric(v, n, text);
  } else {
    nd.set_text(v, n, text);
  }
  $('#Modal1').modal('hide');
  saveState();
  async_redraw();
}

export function showTextModal(v, n, type) {
  if (type === 'lyric') {
    var text = nd.voices[v].notes[n].lyric;
    var title = 'Add lyric below note';
  } else {
    var text = nd.voices[v].notes[n].text;
    var title = 'Add text above note';
  }
  text = text ? text : "";
  let st = '';
  st += `<div class="input-group mb-3">`;
  st += ` <textarea id=textArea type="text" rows=3 class="form-control">${text}</textarea>`;
  st += `</div>`;
  st += `<span style='color:#aaaaaa'><img src=img/keyboard3.png height=20 style='vertical-align:middle; opacity:0.3'> Press Ctrl+Enter to submit</span>`
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-danger" id=modalDelete>Delete</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, title, st, footer, ["right"], [], true, () =>
    {
      let el = document.querySelector('#textArea');
      el.focus();
      //el.setSelectionRange(0, el.value.length)
      el.setSelectionRange(el.value.length, el.value.length)
    },
    () => {
    }
  );
  $("#textArea").keypress(function (e) {
    if((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
      submitText(v, n, type);
      e.preventDefault();
    }
  });
  $('#modalOk').click(() => {
    submitText(v, n, type);
  });
  $('#modalDelete').click(() => {
    $("#textArea").val("");
    submitText(v, n, type);
  });
}