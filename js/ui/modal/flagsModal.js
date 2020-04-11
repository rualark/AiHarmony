export function showFlagsModal() {
  let st = 'flags';
  document.getElementById("ModalTitle").innerHTML = 'Flags';
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = '';
  $('#Modal').modal();
}
