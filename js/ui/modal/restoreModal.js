import {async_redraw} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import { getArchiveStorage, storage2archiveStorage, plain2data } from "../../state/state.js";

function version_html(ver, id) {
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
  st += `<a id=ver${id} class='btn btn-outline-white p-1' href=# role='button' style='min-width: 30px;'>`;
  st += '';
  st += `<div>${new Date(ver.time * 1000).ymd_his()} <b>${ver.nd.name}</b>  </div>`;
  st += '</a><br>';
  return st;
}

export function showRestoreModal() {
  let archive = getArchiveStorage();
  let st = '';
  st += "<div style='width: 100%;'>";
  for (let i=archive.length - 1; i>=0; --i) {
    st += version_html(archive[i], i);
  }
  st += "</table></div>";
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalTitle").innerHTML = 'Restore previous files';
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = '';
  for (const i in archive) {
    document.getElementById('ver' + i).onclick=function() {
      $('#Modal').modal('hide');
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
  $('#Modal').modal();
}
