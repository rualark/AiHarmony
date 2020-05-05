import { enableKeys } from "../../commands.js";
import { button_active } from "../../lib/uilib.js";

export function showModal(id, title, body, footer, classes, classesDialog, pauseKeys, shown, hidden) {
  if (pauseKeys) {
    enableKeys(false);
  }
  document.getElementById(`ModalTitle${id}`).innerHTML = title;
  document.getElementById(`ModalBody${id}`).innerHTML = body;
  document.getElementById(`ModalFooter${id}`).innerHTML = footer;
  for (const clas of classes) {
    $(`#Modal${id}`).addClass(clas);
  }
  for (const clas of classesDialog) {
    $(`#ModalDialog${id}`).addClass(clas);
  }
  $(`#Modal${id}`).on('shown.bs.modal', function () {
    shown();
  });
  $(`#Modal${id}`).on('hidden.bs.modal', function () {
    for (const clas of classes) {
      $(`#Modal${id}`).removeClass(clas);
    }
    for (const clas of classesDialog) {
      $(`#ModalDialog${id}`).removeClass(clas);
    }
    if (pauseKeys) {
      enableKeys(true);
    }
    $(`#Modal${id}`).off('shown.bs.modal');
    $(`#Modal${id}`).off('hidden.bs.modal');
    hidden();
  });
  $(`#Modal${id}`).modal();
}

export function showMultiButtonSelect(id, selectedId, options, userHandler) {
  let st = '';
  st += `<span>`;
  for (let i=0; i<options.length; ++i) {
    const oid = `${id}${options[i].id}`;
    if (options[i].newline) st += `<br>`;
    st += `<a id='${oid}' class='btn btn-outline-white p-2' href=# role='button' style='font-size: 1em'>`;
    st += `${options[i].text}`;
    st += `</a> `;
    setTimeout(() => {
      document.getElementById(oid).onclick=function() {
        if (userHandler) userHandler();
        $(`#${id}${options[0].id}`).attr('data-value', options[i].id);
        for (let x=0; x<options.length; ++x) {
          const oid2 = `${id}${options[x].id}`;
          button_active(oid2, oid === oid2);
        }
      };
    }, 0);
  }
  setTimeout(() => {
    console.log(`${id}${options[0].id}`);
    $(`#${id}${options[0].id}`).attr('data-value', selectedId);
    button_active(`${id}${selectedId}`, true);
  }, 0);
  st += `</span>`;
  return st;
}