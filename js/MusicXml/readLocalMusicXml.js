import {readMusicXml} from "./musicXmlToData.js";
import {trackEvent} from "../integration/tracking.js";

function readLocalMusicXmlFile(e) {
  $('#Modal').modal('hide');
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    readMusicXml(e.target.result, file.name);
    trackEvent('AiHarmony', 'open', 'Open local MusicXML');
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
  st += "<label class='custom-file-label' for='mxml-file-input'>Choose local file</label>";
  st += "</div>";
  st += "<br><br><p><b>Example files:</b><p>";

  st += '<a href=editor.html?load=2018-04-bad-cp5>2018-04-bad-cp5</a><br>';
  st += '<a href=editor.html?load=2018-04-ideal-cp5>2018-04-ideal-cp5</a><br>';
  st += '<a href=editor.html?load=2018-04-norm-cp5>2018-04-norm-cp5</a><br>';
  st += '<a href=editor.html?load=ca3/canuts1>ca3/canuts1</a><br>';
  st += '<a href=editor.html?load=ca3/devoir.cours-6.3-en-re>ca3/devoir.cours-6.3-en-re</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-1>ca3/gallon-v2sp3-1</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-2>ca3/gallon-v2sp3-2</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-3>ca3/gallon-v2sp3-3</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-4>ca3/gallon-v2sp3-4</a><br>';
  st += '<a href=editor.html?load=ca3/good-cp5-extract>ca3/good-cp5-extract</a><br>';
  st += '<a href=editor.html?load=gallon-v5sp1>gallon-v5sp1</a><br>';
  st += '<a href=editor.html?load=gallon-v5sp5>gallon-v5sp5</a><br>';
  st += '<a href=editor.html?load=gallon-v6sp1>gallon-v6sp1</a><br>';
  st += '<a href=editor.html?load=gallon-v6sp5>gallon-v6sp5</a><br>';
  st += '<a href=editor.html?load=gallon-v7sp1>gallon-v7sp1</a><br>';
  st += '<a href=editor.html?load=gallon-v7sp5>gallon-v7sp5</a><br>';
  st += '<a href=editor.html?load=gallon-v8sp1>gallon-v8sp1</a><br>';
  st += '<a href=editor.html?load=gallon-v8sp5>gallon-v8sp5</a><br>';
  st += '<a href=editor.html?load=good-cp1>good-cp1</a><br>';
  st += '<a href=editor.html?load=good-cp2>good-cp2</a><br>';
  st += '<a href=editor.html?load=good-cp3>good-cp3</a><br>';
  st += '<a href=editor.html?load=good-cp4>good-cp4</a><br>';
  st += '<a href=editor.html?load=MTE+1110+-+TS2+-+Exemples-mod>MTE+1110+-+TS2+-+Exemples-mod</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony>shegolev/Shegolev-2020-02-07-harmony</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony2>shegolev/Shegolev-2020-02-07-harmony2</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony3>shegolev/Shegolev-2020-02-07-harmony3</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-312-1>sposobin-exercise-312-1</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-335-1>sposobin-exercise-335-1</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-335-2>sposobin-exercise-335-2</a><br>';

  document.getElementById("ModalBody").innerHTML = st;
  document.getElementById("ModalFooter").innerHTML = '';
  document.getElementById('mxml-file-input').addEventListener('change', readLocalMusicXmlFile, false);
  $('#Modal').modal();
  $('#mxml-file-input').click();
}
