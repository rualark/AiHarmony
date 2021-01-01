import { mgen_login, mgen_name } from "../../core/remote.js";
import { showModal } from "../lib/modal.js";

function showInputText(id, name, value) {
  let st = '';
  st += `<div class="form-group">`;
  st += `<label for="input_${id}"><b>${name}</b></label>`;
  st += `<input class="form-control" id=input_${id} name=input_${id} value="${value}">`;
  st += `</input>`;
  st += `</div>`;
  return st;
}

function submitModal() {
  try {
    submitSentryUserFeedback($('#textArea').val().trim() + '\n' + $('#input_userName').val().trim() + '\n' + $('#input_userEmail').val().trim());
    alertify.notify('Your feedback has been sent! We will try to respond as soon as possible.');
  }
  catch (e) {
    alertify.error('There was an error sending your feedback. This can be result of bad connection or ad blocker. Please try to disable this or send feedback here manually: <a target=_blank href="https://github.com/rualark/AiHarmony/issues">GitHub</a>', 30);
  }
  $('#Modal1').modal('hide');
}

export function showFeedbackModal() {
  if (typeof Sentry === 'undefined') {
    alertify.error('Cannot send your feedback. This can be a result of bad connection or ad blocker. Please try to disable this or send feedback here manually: <a target=_blank href="https://github.com/rualark/AiHarmony/issues">GitHub</a>', 30);
    return;
  }
  let st = '';
  st += showInputText('userName', 'Your name', mgen_name);
  st += showInputText('userEmail', 'Your email', mgen_login);
  st += ` <label for="textArea"><b>Problem or question</b></label>`;
  st += `<div class="input-group mb-3">`;
  st += ` <textarea id=textArea type="text" rows=8 class="form-control"></textarea>`;
  st += `</div>`;
  st += `<span style='color:#aaaaaa'>A copy of your screen and your last actions will be automatically attached to your report.</span> `
  st += `<span style='color:#aaaaaa'>If you want to attach files and images, you can report issue on <a target=_blank href="https://github.com/rualark/AiHarmony/issues">Github</a>.</span>`
  let footer = '';
  footer += `<button type="button" class="btn btn-primary" id=modalOk>OK</button>`;
  footer += `<button type="button" class="btn btn-secondary" data-dismiss="modal" id=modalCancel>Cancel</button>`;
  showModal(1, "Report a problem or ask a question", st, footer, [], [], true, () =>
    {
      if (mgen_login) {
        let el = document.querySelector('#textArea');
        el.focus();
      } else {
        let el = document.querySelector('#input_userName');
        el.focus();
      }
    },
    () => {
    }
  );
  $("#textArea").keypress(function (e) {
    if((e.which == 10 || e.which == 13) && (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
      submitModal();
      e.preventDefault();
    }
  });
  $('#modalOk').click(() => {
    submitModal();
  });
}
