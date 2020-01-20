import {musicXmlToData, xmlLoadWarnings} from "./musicXmlToData.js";
import {async_redraw, clicked} from "../abc/abchelper.js";
import {nd} from "../notes/NotesData.js";
import {start_counter, stop_counter} from "../lib.js";

export function readMusicXml(xml, filename) {
  try {
    start_counter('musicXmlToData');
    let error = musicXmlToData(xml);
    stop_counter();
    if (error) {
      nd.reset();
      alertify.alert('Error loading MusicXML', error);
    }
    else if (xmlLoadWarnings.size) {
      alertify.notify( [...xmlLoadWarnings].join('<br>'), 'custom', 10);
    }
    if (filename.endsWith('.xml')) {
      nd.filename = filename.slice(0, -4);
    } else {
      nd.filename = filename;
    }
    if (!nd.name) nd.name = nd.filename;
    if (!nd.filename) nd.filename = nd.name;
    clicked.note = {voice: 0, note: 0};
  }
  catch (e) {
    nd.reset();
    console.log(e);
    alertify.alert('Error loading MusicXML', e.toString());
    throw e;
  }
  console.log(nd);
  async_redraw();
}

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
