import {musicXmlToData, xmlLoadWarnings} from "./musicXmlToData.js";
import {async_redraw} from "../abc/abchelper.js";
import {nd} from "../notes/NotesData.js";

function readLocalMusicXmlFile(e) {
  $('#Modal').modal('hide');
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    let contents = e.target.result;
    try {
      let error = musicXmlToData(contents);
      if (error) {
        nd.reset();
        alert(error);
      }
      else if (xmlLoadWarnings.size) alert([...xmlLoadWarnings].join('\n'));
      if (file.name.endsWith('.xml')) {
        nd.filename = file.name.slice(0, -4);
      } else {
        nd.filename = file.name;
      }
      if (!nd.name) nd.name = nd.filename;
    }
    catch (e) {
      nd.reset();
      alert(e);
      throw e;
    }
    console.log(nd);
    async_redraw();
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
