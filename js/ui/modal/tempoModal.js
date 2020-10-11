import {nd} from "../../notes/NotesData.js";
import {async_redraw, state} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import { showModal } from "../lib/modal.js";
import { trackEvent } from "../../integration/tracking.js";

function showInputTempo() {
  let st = '';
  st += `<div class="form-group">`;
  st += `<input class="form-control" type=tel min=1 max=255 id=input_tempo name=input_tempo value="${nd.tempo}">`;
  st += `</input>`;
  st += `</div>`;
  return st;
}

function submitTempo() {
  nd.set_tempo($('#input_tempo').val());
  $('#Modal1').modal('hide');
  saveState();
  async_redraw();
}

export function showTempoModal() {
  trackEvent('AiHarmony', 'click_tempo');
  if (state.state !== 'ready') return;
  let st = '';
  st += showInputTempo();
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, 'Tempo', st, footer, [], [], true, () =>
    {
      setTimeout(() => {
        let el = document.querySelector('#input_tempo');
        el.focus();
        el.setSelectionRange(0, el.value.length);
      }, 10);
    },
    () => {
    }
  );
  $('#modalOk').click(() => {
    submitTempo();
  });
  $("#input_tempo").keypress(function (e) {
    if((e.which == 10 || e.which == 13) && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      submitTempo();
    }
  });
}
