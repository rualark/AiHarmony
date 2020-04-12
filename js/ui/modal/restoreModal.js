import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { getArchiveStorage, storage2archiveStorage, plain2data, session_id } from "../../state/state.js";

function version_html(ver, id, uniq_id) {
  /*
  let color = '#aaccee';
  if (value === 8) {
    color='#aaeecc';
  }
  if (value === 2) {
    color='#eeaacc';
  }
  */
  let st = '';
  st += `<a id=ver${id} class='btn btn-outline-white p-1' href=# role='button' style='min-width: 30px'>`;
  st += '';
  st += `<div>${new Date(ver.time * 1000).ymd_his()} <b>${ver.nd.name}</b>`;
  if (ver.why === 1) st += ` <span title='This file was auto-saved before creating new file'>(before New)</span>`;
  if (ver.why === 2) st += ` <span title='This file was auto-saved before opening another file'>(before Open)</span>`;
  if (ver.why === 3) st += ` <span title='This file was auto-saved before conflict with another session'>(before Conflict)</span>`;
  st += `</div>`;
  st += '</a><br>';
  return st;
}

export function showRestoreModal() {
  let archive = getArchiveStorage();
  let st = '';
  st += "<div style='width: 100%;'>";
  let uniq_sessions = {};
  for (let i=archive.length - 1; i>=0; --i) {
    if (!(archive[i].id in uniq_sessions)) {
      uniq_sessions[archive[i].id] = Object.keys(uniq_sessions).length + 1;
    }
    archive[i].uniq_id = uniq_sessions[archive[i].id];
  }
  if (archive.length === 0) {
    st += `No previous files`;
  }
  for (const id in uniq_sessions) {
    const uniq_id = uniq_sessions[id];
    st += `<b title='Session hash: ${id}'>Session ${uniq_id}</b>`;
    if (session_id == id) {
      st += ` (current)`;
    }
    st += `:<br>`;
    for (let i=archive.length - 1; i>=0; --i) {
      if (archive[i].uniq_id === uniq_id) {
        st += version_html(archive[i], i);
      }
    }
  }
  st += "</div>";
  $('#modalDialog2').addClass("modal-lg");
  document.getElementById("ModalTitle2").innerHTML = 'Restore previous files edited in this browser';
  document.getElementById("ModalBody2").innerHTML = st;
  document.getElementById("ModalFooter2").innerHTML = '';
  for (const i in archive) {
    document.getElementById('ver' + i).onclick=function() {
      $('#Modal2').modal('hide');
      // Do not archive current state when restoring to protect old archived versions
      //storage2archiveStorage();
      alertify.confirm('Restore', 'Warning! You are restoring a previous file. Currently opened file will be deleted and you will not be able to restore it if you did not download it.',
        function(){
          let plain = LZString.decompressFromUTF16(archive[i].utf16);
          plain2data(plain, [0], nd, false);
          saveState();
          async_redraw();
        },
        function(){
        }
      );
    };
  }
  $('#Modal2').modal();
}
