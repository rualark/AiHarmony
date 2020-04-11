import {nd} from "../../notes/NotesData.js";
import {enableKeys} from "../commands.js";
import {async_redraw} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import {ares} from "../../analysis/AnalysisResults.js";
import { update_selection } from "../selection.js";
import { settings } from "../../state/settings.js";

function showCheckLocked(v) {
  let st = '';
  st += `<div class="form-check">`;
  st += `<input type="checkbox" class="form-check-input" name="check_voiceLocked" id="check_voiceLocked" ${nd.voices[v].locked ? "checked" : ""}>`;
  st += `<label class="form-check-label" for="check_voiceLocked">Prohibit note editing in this part</label>`;
  st += `</div><br>`;
  return st;
}

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
  let cur_sp = nd.voices[v].species;
  if (cur_sp == null || cur_sp === 10) {
    cur_sp = ares.getSpecies(v);
  }
  let sel = "";
  if (cur_sp === 0) sel = "selected";
  st += `<option value=0 ${sel}>Cantus firmus</option>`;
  for (let sp=1; sp<6; ++sp) {
    sel = "";
    if (sp === cur_sp) sel = "selected";
    st += `<option value=${sp} ${sel}>Counterpoint species ${sp}</option>`;
  }
  st += `</select>`;
  st += `</div>`;
  console.log(cur_sp, st);
  return st;
}

export function showPartModal(v) {
  enableKeys(false);
  let st = '';
  st += showInputPartName(v);
  if (settings.algo === 'CA3') {
    st += showSelectSpecies(v);
  }
  st += showCheckLocked(v);
  document.getElementById("ModalTitle").innerHTML = 'Part';
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = `
    <button type="button" class="btn btn-primary" id=modalOk>OK</button>
    <button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>
  `;
  $('#check_voiceLocked').change(() => {
    nd.set_voiceLocked(v, $('#check_voiceLocked').is(":checked"));
    saveState();
  });
  $('#modalOk').click(() => {
    nd.set_voiceName(v, $('#input_partName').val().substr(0, 50));
    nd.set_species(v, Number($("#sel_partSpecies option:selected").val()));
    $('#Modal').modal('hide');
    document.getElementById("ModalFooter").innerHTML = "";
    saveState();
    async_redraw();
  });
  $('#Modal').on('hidden.bs.modal', () => {
    enableKeys(true);
  });
  $('#Modal').modal();
}
