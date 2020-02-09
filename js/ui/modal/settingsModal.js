import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";

function showSelectShortcutsLayout() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_shortcutsLayout"><b>Keyboard shortcuts</b></label>`;
  st += `<select class="form-control custom-select" id=sel_shortcutsLayout name=sel_shortcutsLayout>`;
  for (const layout in shortcutsLayouts) {
    let selected = "";
    if (layout === settings.shortcutsLayout) selected = "selected";
    st += `<option value=${layout} ${selected}>${layout}</option>`;
  }
  st += `</select>`;
  st += `</div>`;
  return st;
}

export function showSettingsModal() {
  let st = '';
  st += showSelectShortcutsLayout();
  document.getElementById("ModalTitle").innerHTML = 'Settings';
  document.getElementById("ModalBody").innerHTML = st;
  $('#sel_shortcutsLayout').change(() => {
    settings.setShortcutsLayout($("#sel_shortcutsLayout option:selected" ).text());
    settings.settings2storage();
    initTooltips(800, 100);
  });
  $('#Modal').modal();
}
