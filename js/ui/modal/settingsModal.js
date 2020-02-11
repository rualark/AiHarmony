import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {async_redraw} from "../../abc/abchelper.js";

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

function showSelectAlgo() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_algo"><b>Music analysis</b></label>`;
  st += `<select class="form-control custom-select" id=sel_algo name=sel_algo>`;
  st += `<option value='' ${nd.algo === '' ? "selected" : ""}>Disabled</option>`;
  st += `<option value=CA3 ${nd.algo === 'CA3' ? "selected" : ""}>Counterpoint analysis</option>`;
  //st += `<option value=HA1 ${nd.algo === 'HA1' ? "selected" : ""}>Harmonic analysis</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

export function showSettingsModal() {
  let st = '';
  st += showSelectShortcutsLayout();
  st += showSelectAlgo();
  document.getElementById("ModalTitle").innerHTML = 'Settings';
  document.getElementById("ModalBody").innerHTML = st;
  $('#sel_algo').change(() => {
    nd.algo = $("#sel_algo option:selected" ).val();
    saveState();
    if (nd.algo === '') async_redraw();
  });
  $('#sel_shortcutsLayout').change(() => {
    settings.setShortcutsLayout($("#sel_shortcutsLayout option:selected" ).val());
    settings.settings2storage();
    initTooltips(800, 100);
  });
  $('#Modal').modal();
}
