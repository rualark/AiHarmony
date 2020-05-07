import {async_redraw, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { getArchiveStorage, storage2archiveStorage, plain2data, session_id } from "../../state/state.js";
import { showModal } from "../lib/modal.js";

function version_html(ver, id, uniq_id) {
  let st = '';
  st += `<a id=ver${id} class='btn btn-outline-white p-1' href=# role='button' style='min-width: 30px; text-align: left'>`;
  st += '';
  st += `<div>${new Date(ver.time * 1000).ymd_his()} <b>${ver.nd.name}</b>`;
  if (ver.why === 1) st += ` <span title='This file was auto-saved before creating new file'>(before New)</span>`;
  if (ver.why === 2) st += ` <span title='This file was auto-saved before opening another file'>(before Open)</span>`;
  if (ver.why === 3) st += ` <span title='This file was auto-saved before conflict with another session' style='color:red'>(before Conflict)</span>`;
  if (ver.why === 4) st += ` <span title='This file was auto-saved before creating new counterpoint exercise'>(before New cantus)</span>`;
  st += `</div>`;
  st += '</a><br>';
  return st;
}

export function showRestoreModal() {
  if (state.state !== 'ready') return;
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
    st += `No unsaved files`;
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
  showModal(1, 'Recover unsaved files edited in this browser', st, '', [], ["modal-lg"], false, ()=>{}, ()=>{});
  for (const i in archive) {
    document.getElementById('ver' + i).onclick=function() {
      $('#Modal1').modal('hide');
      // Do not archive current state when restoring to protect old archived versions
      //storage2archiveStorage();
      alertify.confirm('Recover', 'Warning! You are recovering a previous file. Currently opened file will be deleted and you will not be able to recovere it if you did not download it.',
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
}
