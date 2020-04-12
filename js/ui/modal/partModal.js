import {nd} from "../../notes/NotesData.js";
import {async_redraw} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import {ares} from "../../analysis/AnalysisResults.js";
import { showModal } from "./lib/modal.js";

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
  let st = '';
  st += showInputPartName(v);
  if (nd.algo === 'CA3') {
    st += showSelectSpecies(v);
  }
  st += showCheckLocked(v);
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, 'Part', st, footer, [], [], true, ()=>{}, ()=>{});
  $('#check_voiceLocked').change(() => {
  });
  $('#modalOk').click(() => {
    nd.set_voiceLocked(v, $('#check_voiceLocked').is(":checked"));
    nd.set_voiceName(v, $('#input_partName').val().substr(0, 50));
    if (nd.algo === 'CA3') {
      nd.set_species(v, Number($("#sel_partSpecies option:selected").val()));
    }
    $('#Modal1').modal('hide');
    saveState();
    async_redraw();
  });
}
