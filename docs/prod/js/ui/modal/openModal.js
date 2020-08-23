import { showModal } from "../lib/modal.js";
import { readLocalMusicXmlFile } from "../../MusicXml/readLocalMusicXml.js";
import { showRestoreModal } from "./restoreModal.js";
import { state } from "../../abc/abchelper.js";

export function showOpenLocalMusicXmlModal() {
  let st = '';
  //st += 'Please select MusicXML file from your computer<br><br>';
  //st += '<input type=file id="mxml-file-input" />';
  st += "<div class='custom-file'>";
  st += "<input type=file accept='.xml' class='custom-file-input' id='mxml-file-input' name='mxml-file-input' />";
  st += "<label class='custom-file-label' for='mxml-file-input'>Choose local file</label>";
  st += "</div>";
  showModal(1, 'Open MusicXML file from this computer', st, '', [], [], false, () => { }, () => { });
  document.getElementById('mxml-file-input').addEventListener('change', readLocalMusicXmlFile, false);
  $('#mxml-file-input').click();
}

export function showOpenExampleMusicXmlModal() {
  let st = '';
  st += '<a href=editor.html?load=2018-04-bad-cp5>2018-04-bad-cp5</a><br>';
  st += '<a href=editor.html?load=2018-04-ideal-cp5>2018-04-ideal-cp5</a><br>';
  st += '<a href=editor.html?load=2018-04-norm-cp5>2018-04-norm-cp5</a><br>';
  st += '<a href=editor.html?load=ca3/canuts1>ca3/canuts1</a><br>';
  st += '<a href=editor.html?load=ca3/canuts2>ca3/canuts2</a><br>';
  st += '<a href=editor.html?load=ca3/devoir.cours-6.3-en-re>ca3/devoir.cours-6.3-en-re</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-1>ca3/gallon-v2sp3-1</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-2>ca3/gallon-v2sp3-2</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-3>ca3/gallon-v2sp3-3</a><br>';
  st += '<a href=editor.html?load=ca3/gallon-v2sp3-4>ca3/gallon-v2sp3-4</a><br>';
  st += '<a href=editor.html?load=ca3/good-cp5-extract>ca3/good-cp5-extract</a><br>';
  st += '<a href=editor.html?load=ca3/short>ca3/short</a><br>';
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
  st += '<a href=editor.html?load=presentation/Sposobin-492-3-shegolev>presentation/Sposobin-492-3-shegolev</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony>shegolev/Shegolev-2020-02-07-harmony</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony2>shegolev/Shegolev-2020-02-07-harmony2</a><br>';
  st += '<a href=editor.html?load=shegolev/Shegolev-2020-02-07-harmony3>shegolev/Shegolev-2020-02-07-harmony3</a><br>';
  st += '<a href=editor.html?load=shegolev/Species-1-exercise-2>shegolev/Species-1-exercise-2</a><br>';
  st += '<a href=editor.html?load=shegolev/Species-1-exercise>shegolev/Species-1-exercise</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-312-1>sposobin-exercise-312-1</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-335-1>sposobin-exercise-335-1</a><br>';
  st += '<a href=editor.html?load=sposobin-exercise-335-2>sposobin-exercise-335-2</a><br>';
    showModal(1, 'Open example MusicXML file', st, '', [], [], false, () => { }, () => { });
}

export function showOpenModal() {
  if (state.state !== 'ready') return;
  let st = '';

  st += `<p style='text-align: center'>`;
  st += `<a href=https://artinfuser.com/counterpoint/exercises.php class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
  st += `<b>Open from ArtInfuser database</b>`;
  st += '</a></p>';

  st += `<p style='text-align: center'>`;
  st += `<a id=openLocal href=# class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
  st += `<b>Open MuxicXML file from my computer</b>`;
  st += '</a></p>';

  /*
  st += `<p style='text-align: center'>`;
  st += `<a id=openServer href=# class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
  st += `<b>Open example MuxicXML file</b>`;
  st += '</a></p>';
  */

  st += `<p style='text-align: center'>`;
  st += `<a href=docs.php?d=cp_examples class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
  st += `<b>Open counterpoint examples</b>`;
  st += '</a></p>';

  st += `<p style='text-align: center'>`;
  st += `<a id=recover href=# class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
  st += `<b>Recover unsaved files</b>`;
  st += '</a></p>';

  showModal(1, 'Open MusicXML file', st, '', [], [], false, ()=>{}, ()=>{});
  document.getElementById('openLocal').onclick = function () {
    $('#Modal1').modal('hide');
    showOpenLocalMusicXmlModal();
  };
  /*
  document.getElementById('openServer').onclick = function () {
    $('#Modal1').modal('hide');
    showOpenExampleMusicXmlModal();
  };
  */
  document.getElementById('recover').onclick = function () {
    $('#Modal1').modal('hide');
    showRestoreModal();
  };
}
