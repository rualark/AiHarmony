import {readMusicXml} from "./musicXmlToData.js";

function readLocalMusicXmlFile(e) {
  $('#Modal').modal('hide');
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    readMusicXml(e.target.result, file.name);
  };
  reader.readAsText(file);
}

export function showOpenMusicXmlModal() {
  document.getElementById("ModalTitle").innerHTML = 'Open MusicXML file';
  let st = '';
  //st += 'Please select MusicXML file from your computer<br><br>';
  //st += '<input type=file id="mxml-file-input" />';
  st += "<div class='custom-file'>";
  st += "<input type=file accept='.xml' class='custom-file-input' id='mxml-file-input' name='mxml-file-input' />";
  st += "<label class='custom-file-label' for='mxml-file-input'>Choose file</label>";
  st += "</div>";
  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById('mxml-file-input').addEventListener('change', readLocalMusicXmlFile, false);
  $('#Modal').modal();
  $('#mxml-file-input').click();
}
