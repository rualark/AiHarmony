import {keyicon} from "./keys.js";
import {commands} from "./commands.js";

export function showShortcutsModal() {
  document.getElementById("shortcutsModalTitle").innerHTML = 'ArtInfuser Harmony';
  let st = '';
  st += 'ArtInfuser Harmony allows to edit, play, import and export notes. Minimal supported note length is 1/16. Tuplets are not supported. Only single clef, key and time signature is supported per staff.<br><br>';
  st += '<table class=table>';
  st += '<tr>';
  st += '<th>Function';
  st += '<th>Button';
  st += '<th>Keyboard shortcut';
  for (let command of commands) {
    if (!command.name) continue;
    st += '<tr>';
    st += `<td>${command.name}`;
    st += '<td align=center>';
    if (command.toolbar) {
      st += `<div style='text-align: center; min-width: 40px; ${command.toolbar.style || ''}'>${command.toolbar.html}</div>`;
    }
    st += '<td align=center>';
    if (command.keys) {
      let keys_st = ''
      for (let key of command.keys[0].split('+')) {
        if (keys_st) keys_st += " <b>+</b> ";
        keys_st += keyicon(key);
      }
      st += keys_st;
    }
  }
  document.getElementById("shortcutsModalBody").innerHTML = st;
  $('#shortcutsModal').modal();
}
