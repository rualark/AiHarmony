import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";
import {nd} from "../../notes/NotesData.js";
import {updateUndoRedoButtons} from "../../state/history.js";
import {async_redraw, state} from "../../abc/abchelper.js";
import {ares} from "../../analysis/AnalysisResults.js";
import {initCommands} from "../commands.js";
import { update_selection } from "../selection.js";
import { showModal } from "../lib/modal.js";
import { showCheckBox } from "../lib/uilib.js";

function showCheckToolbarHints() {
  let st = '';
  st += `<div class="form-check">`;
  st += `<input type="checkbox" class="form-check-input" id="check_toolbarHints" ${settings.toolbarHints ? "checked" : ""}>`;
  st += `<label class="form-check-label" for="check_toolbarHints">Show toolbar text hints</label>`;
  st += `</div><br>`;
  return st;
}

function showCheckAlterBeforeNote() {
  let st = '';
  st += `<div class="form-check">`;
  st += `<input type="checkbox" class="form-check-input" id="check_alterBeforeNote" ${settings.alter_before_note ? "checked" : ""}>`;
  st += `<label class="form-check-label" for="check_alterBeforeNote">Input alteration before note (like in Sibelius)</label>`;
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

export function showSettingsModal() {
  if (state.state !== 'ready') return;
  let st = '';
  st += showCheckToolbarHints();
  st += showCheckAlterBeforeNote();
  st += showCheckBox('check_showNht', settings.show_nht, `Label non-harmonic tones with 'nht' text`);
  st += showSelectShortcutsLayout();
  //st += showSelectAlgo();
  st += showSelectRuleVerbose();
  showModal(1, 'Settings', st, '', [], [], false, ()=>{}, ()=>{});
  $('#check_toolbarHints').change(() => {
    settings.toolbarHints = Number($('#check_toolbarHints').is(":checked"));
    settings.settings2storage();
    initCommands();
    updateUndoRedoButtons();
    update_selection();
  });
  $('#check_alterBeforeNote').change(() => {
    settings.alter_before_note = Number($('#check_alterBeforeNote').is(":checked"));
    settings.settings2storage();
  });
  $('#check_showNht').change(() => {
    settings.show_nht = Number($('#check_showNht').is(":checked"));
    settings.settings2storage();
    async_redraw();
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
}
