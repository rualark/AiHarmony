import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";
import {nd} from "../../notes/NotesData.js";
import {saveState} from "../../state/history.js";
import {async_redraw} from "../../abc/abchelper.js";
import {ares} from "../../analysis/AnalysisResults.js";
import {initCommands} from "../commands.js";
import { update_selection } from "../selection.js";
import { showRestoreModal } from "./restoreModal.js";

function showCheckToolbarHints() {
  let st = '';
  st += `<div class="form-check">`;
  st += `<input type="checkbox" class="form-check-input" name="check_toolbarHints" id="check_toolbarHints" ${settings.toolbarHints ? "checked" : ""}>`;
  st += `<label class="form-check-label" for="check_toolbarHints">Show toolbar text hints</label>`;
  st += `</div><br>`;
  return st;
}

function showSelectShortcutsLayout() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_shortcutsLayout"><b>Keyboard shortcuts:</b></label>`;
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
  st += `<label for="sel_algo"><b>Music analysis:</b></label>`;
  st += `<select class="form-control custom-select" id=sel_algo name=sel_algo>`;
  st += `<option value='' ${nd.algo === '' ? "selected" : ""}>Disabled</option>`;
  st += `<option value=CA3 ${nd.algo === 'CA3' ? "selected" : ""}>Counterpoint analysis</option>`;
  //st += `<option value=HA1 ${nd.algo === 'HA1' ? "selected" : ""}>Harmonic analysis</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

function showSelectRuleVerbose() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_ruleVerbose"><b>Mistakes verbosity:</b></label>`;
  st += `<select class="form-control custom-select" id=sel_ruleVerbose name=sel_ruleVerbose>`;
  st += `<option value='0' ${settings.rule_verbose === 0 ? "selected" : ""}>Short mistake text</option>`;
  st += `<option value='1' ${settings.rule_verbose === 1 ? "selected" : ""}>Medium mistake text</option>`;
  st += `<option value='2' ${settings.rule_verbose === 2 ? "selected" : ""}>Long mistake text</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

function showRestore() {
  let st = '';
  st += `<a id=restore href=#>Restore previous files</a>`
  return st;
}

export function showSettingsModal() {
  let st = '';
  st += showCheckToolbarHints();
  st += showSelectShortcutsLayout();
  st += showSelectAlgo();
  st += showSelectRuleVerbose();
  st += showRestore();
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalTitle").innerHTML = 'Settings';
  document.getElementById("ModalBody").innerHTML = st;
  $('#check_toolbarHints').change(() => {
    settings.toolbarHints = Number($('#check_toolbarHints').is(":checked"));
    settings.settings2storage();
    initCommands();
    update_selection();
  });
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
  $('#sel_ruleVerbose').change(() => {
    settings.rule_verbose = Number($("#sel_ruleVerbose option:selected" ).val());
    settings.settings2storage();
    ares.printFlags();
    async_redraw();
  });
  $('#restore').click(() => {
    showRestoreModal();
  });
  $('#Modal').modal();
}
