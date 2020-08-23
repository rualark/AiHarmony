import {async_redraw, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { showModal } from "../lib/modal.js";
import { mobileOrTablet } from "../../core/mobileCheck.js";
import { keyCodes } from "../lib/keys.js";

const symbols = ['✅', '⚠️', '⛔', '⭐', '❗', '❓', '❌', '🚩', '🚫'];

function submitText(v, n, type) {
  let text = $('#textArea').val().trim().substr(0, 100);
  if (type === 'lyric') {
    nd.set_lyric(v, n, text);
  } else {
    nd.set_text(v, n, text);
  }
  $('#Modal1').modal('hide');
  async_redraw();
}

function showSymbol(i) {
  let st = '';
  st += `<a id=asymbol${i} class='btn btn-outline-white p-1' href=# role='button' style='min-width: 10px;'>`;
  st += '';
  st += `<div style='font-family: sans-serif; font-size: 1em'>${symbols[i]}</div>`;
  st += '</a>';
  return st;
}

function showSymbols() {
  let st = ``;
  for (const i in symbols) {
    st += showSymbol(i);
  }
  return st + '<br>';
}

function add_symbol(i) {
  const el = document.querySelector('#textArea');
  const selStart = el.selectionStart;
  const selEnd = el.selectionEnd;
  if (selStart || selStart == '0') {
    el.value = el.value.substring(0, selStart)
      + symbols[i]
      + el.value.substring(selEnd, el.value.length);
  } else {
    el.value += symbols[i];
  }
  el.focus();
  el.setSelectionRange(selStart + 1, selEnd + 1);
}

export function showTextModal(v, n, type) {
  if (state.state !== 'ready') return;
  let text, title;
  if (type === 'lyric') {
    text = nd.voices[v].notes[n].lyric;
    title = 'Add lyric below note';
  } else {
    text = nd.voices[v].notes[n].text;
    title = 'Add text above note';
  }
  text = text ? text : "";
  let st = '';
  st += `<div class="input-group mb-3">`;
  st += ` <textarea id=textArea type="text" rows=3 class="form-control">${text}</textarea>`;
  st += `</div>`;
  st += showSymbols();
  if (!mobileOrTablet) {
    st += `<span style='color:#aaaaaa'><img src=img/keyboard3.png height=20 style='vertical-align:middle; opacity:0.3'> Press Shift+Enter to add new row</span>`
  }
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-danger" id=modalDelete>Delete</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, title, st, footer, ["right"], [], true, () =>
    {
      let el = document.querySelector('#textArea');
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length)
    },
    () => {
    }
  );
  for (const i in symbols) {
    document.getElementById('asymbol' + i).onclick = () => {
      add_symbol(i);
    }
  }
  $("#textArea").keypress(function (e) {
    if((e.which == 10 || e.which == 13) && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !mobileOrTablet) {
      submitText(v, n, type);
      e.preventDefault();
    }
    if(e.ctrlKey && e.code === "KeyQ") add_symbol(0);
    if(e.ctrlKey && e.code === "IntlBackslash") add_symbol(1);
    if(e.ctrlKey && e.code === "KeyB") add_symbol(2);
  });
  $('#modalOk').click(() => {
    submitText(v, n, type);
  });
  $('#modalDelete').click(() => {
    $("#textArea").val("");
    submitText(v, n, type);
  });
}
