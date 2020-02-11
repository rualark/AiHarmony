import {shortcutsLayouts} from "../shortcutsLayouts.js";
import {settings} from "../../state/settings.js";
import {initTooltips} from "../lib/tooltips.js";
import {nd} from "../../notes/NotesData.js";
import {enableKeys} from "../commands.js";
import {async_redraw, selected} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import {ares} from "../../analysis/AnalysisResults.js";

function showInputPartName(v) {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="input_partName"><b>Part name</b></label>`;
  st += `<input class="form-control" id=input_partName name=input_partName value="${nd.voices[v].name}">`;
  st += `</input>`;
  st += `</div>`;
  return st;
}

function showSelectSpecies(v) {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="sel_partSpecies"><b>Counterpoint species</b></label>`;
  st += `<select class="form-control custom-select" id=sel_partSpecies name=sel_partSpecies>`;
  for (let sp=1; sp<6; ++sp) {
    let selected = "";
    let cur_sp = nd.voices[v].species;
    if (cur_sp == null || cur_sp === 10) {
      cur_sp = ares.getSpecies(v);
    }
    if (sp === cur_sp) selected = "selected";
    st += `<option value=${sp} ${selected}>Counterpoint species ${sp}</option>`;
  }
  st += `</select>`;
  st += `</div>`;
  return st;
}

export function showPartModal(v) {
  enableKeys(false);
  let st = '';
  st += showInputPartName(v);
  st += showSelectSpecies(v);
  document.getElementById("ModalTitle").innerHTML = 'Part';
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = `
    <button type="button" class="btn btn-primary" id=modalOk>OK</button>
    <button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>
  `;
  $('#modalOk').click(() => {
    enableKeys(true);
    nd.set_voiceName(v, $('#input_partName').val().substr(0, 50));
    console.log('v', $("#sel_partSpecies option:selected").val());
    nd.set_species(v, $("#sel_partSpecies option:selected").val());
    $('#Modal').modal('hide');
    document.getElementById("ModalFooter").innerHTML = "";
    saveState();
    async_redraw();
  });
  $('#Modal').modal();
}
