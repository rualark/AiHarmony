import { enableKeys } from "../commands.js";

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
