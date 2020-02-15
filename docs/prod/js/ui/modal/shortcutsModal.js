import {keyicon} from "../lib/keys.js";
import {commands, toolbarButtonHtml} from "../commands.js";
import {initTooltips} from "../lib/tooltips.js";

export function showShortcutsModal() {
  document.getElementById("ModalTitle").innerHTML = 'Artinfuser Harmony';
  let st = '';
  st += 'Artinfuser Harmony allows to play, edit and <a href=https://artinfuser.com/counterpoint/docs.php?d=cp_analyse target=_blank>analyse</a> MusicXML files with exercises. ';
  st += 'Limitations: minimal supported note length is 1/16. Tuplets are not supported. Only single clef, key and time signature is supported per staff.<br><br>';
  st += '<table class=table>';
  st += '<tr>';
  st += '<th>Function';
  st += '<th style="text-align: center">Button';
  st += '<th style="text-align: center">Keyboard shortcut';
  for (let command of commands) {
    if (!command.name) continue;
    st += '<tr>';
    st += `<td>${command.name}`;
    st += "<td style='text-align: center'>";
    if (command.toolbar) {
      st += `<div style='text-align: center; min-width: 40px;'>${toolbarButtonHtml(command, false)}</div>`;
    }
    st += "<td style='text-align: center'>";
    if (command.keys) {
      let keys_st = '';
      for (let keys of command.keys) {
        let key_st = '';
        for (let key of keys.split('+')) {
          if (key_st) key_st += " <b>+</b> ";
          key_st += keyicon(key);
        }
        if (keys_st) keys_st += ' <b>or</b> ';
        keys_st += key_st;
      }
      st += keys_st;
    }
  }
  $('#modalDialog').addClass("modal-lg");
  document.getElementById("ModalBody").innerHTML = st;
  initTooltips(200, 100);
  $('#Modal').modal();
}
