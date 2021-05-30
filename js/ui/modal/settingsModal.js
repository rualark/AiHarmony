import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";
import {nd} from "../../notes/NotesData.js";
import {updateUndoRedoButtons} from "../../state/history.js";
import {async_redraw, state} from "../../abc/abchelper.js";
import {ares} from "../../analysis/AnalysisResults.js";
import {initCommands} from "../commands.js";
import { update_selection } from "../selection.js";
import { showModal, showSelectWithLabel } from "../lib/modal.js";
import { showCheckBox } from "../lib/uilib.js";
import { analyse } from "../../analysis/musicAnalysis.js";

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
  st += `<option value='2' ${settings.rule_verbose === 2 ? "selected" : ""}>Full mistake text</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

function showSelectHarmNotation() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_harmNotation"><b><a target=_blank href=docs.php?d=cp_harm_notations>Harmonic notation:</a></b></label>`;
  st += `<select class="form-control custom-select" id=sel_harmNotation name=sel_harmNotation>`;
  st += `<option value='0' ${settings.harm_notation === 0 ? "selected" : ""}>Russian notation (Sposobin)</option>`;
  st += `<option value='1' ${settings.harm_notation === 1 ? "selected" : ""}>Russian notation (detailed)</option>`;
  st += `<option value='2' ${settings.harm_notation === 2 ? "selected" : ""}>Russian notation (detailed MAJOR / minor)</option>`;
  st += `<option value='3' ${settings.harm_notation === 3 ? "selected" : ""}>International notation (Walter Piston)</option>`;
  st += `<option value='4' ${settings.harm_notation === 4 ? "selected" : ""}>International notation (MAJOR / minor)</option>`;
  st += `<option value='5' ${settings.harm_notation === 5 ? "selected" : ""}>International notation (detailed MAJOR / minor)</option>`;
  st += `</select>`;
  st += `</div>`;
  return st;
}

function makeAutoLegatoOptions() {
  let res = [];
  for (let i=0; i<100; i += 10) {
    res.push({val: i, text: `Add legato to ${i}% of adjacent notes`});
  }
  return res;
}

export function showSettingsModal() {
  if (state.state !== 'ready') return;
  let st = '';
  st += showCheckToolbarHints();
  st += showCheckAlterBeforeNote();
  st += showCheckBox('check_showNht', settings.show_nht, `Label non-harmonic tones with circles`);
  st += showCheckBox('check_showHarmony', settings.show_harmony, `Show harmony below notes`);
  st += showCheckBox('check_showText', settings.show_text, `Show user text above notes`);
  st += showCheckBox('check_showLyrics', settings.show_lyrics, `Show user lyrics below notes`);
  st += showCheckBox('check_editPlay', settings.editPlayVelocity, `Play notes as you edit`);
  st += showSelectShortcutsLayout();
  st += showSelectRuleVerbose();
  st += showSelectHarmNotation();
  st += showSelectWithLabel('Add legato when playing:', 'selectAddSlurs', settings.autoLegato, makeAutoLegatoOptions(), (val) => {
    settings.autoLegato = Number(val);
    settings.settings2storage();
  });
  st += showSelectWithLabel('Playback reverb:', 'selectReverb', settings.reverb_mix, [
    {val: 0, text: 'Dry sound (0%)'},
    {val: 10, text: 'Close chamber (10%)'},
    {val: 20, text: 'Far chamber (20%)'},
    {val: 30, text: 'Orchestra (30%)'},
    {val: 40, text: 'Big orchestra (40%)'},
    {val: 50, text: 'Very big orchestra (50%)'},
    {val: 100, text: 'Infinite reverb (100%)'},
  ], (val) => {
    settings.autoLegato = Number(val);
    settings.settings2storage();
  });
  showModal(1, 'Settings', st, '', [], [], false, ()=>{}, ()=>{});
  $('#check_toolbarHints').change(() => {
    settings.toolbarHints = Number($('#check_toolbarHints').is(":checked"));
    settings.settings2storage();
    initCommands();
    updateUndoRedoButtons();
    update_selection();
    initTooltips(800, 100);
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
  $('#check_showHarmony').change(() => {
    settings.show_harmony = Number($('#check_showHarmony').is(":checked"));
    settings.settings2storage();
    async_redraw();
  });
  $('#check_showText').change(() => {
    settings.show_text = Number($('#check_showText').is(":checked"));
    settings.settings2storage();
    async_redraw();
  });
  $('#check_showLyrics').change(() => {
    settings.show_lyrics = Number($('#check_showLyrics').is(":checked"));
    settings.settings2storage();
    async_redraw();
  });
  $('#check_editPlay').change(() => {
    settings.editPlayVelocity = Number($('#check_editPlay').is(":checked")) ? 90 : 0;
    console.log(settings.editPlayVelocity);
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
  $('#sel_harmNotation').change(() => {
    settings.harm_notation = Number($("#sel_harmNotation option:selected" ).val());
    settings.settings2storage();
    analyse();
  });
}
