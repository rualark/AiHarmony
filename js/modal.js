import {keyicon} from "./keys.js";

export function showShortcutsModal() {
  let st = `
  <table>
  <tr>
  <td>${keyicon('A')}
  <td>Hello
  </table>
  `;
  document.getElementById("shortcutsModalBody").innerHTML = st;
  $('#shortcutsModal').modal();
}
