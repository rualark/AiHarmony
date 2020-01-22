import {dataToMusicXml} from "../../MusicXml/dataToMusicXml.js";
import {fileSave} from "../fileSave.js";
import {name2filename} from "../../lib.js";
import {nd} from "../../notes/NotesData.js";
import {dataToAbc} from "../../abc/dataToAbc.js";

let exportFormats = [
  {name: 'Download as MusicXML', func: downloadAsMusicXml },
  {name: 'Download as SVG', func: downloadAsSvg },
  {name: 'Download as ABC', func: downloadAsAbc },
  // {name: 'Download as MIDI', func: downloadAsMidi },
  {name: 'Download as PDF', func: downloadAsPdf },
  // {name: 'Download as WAV', func: downloadAsABC },
];

function downloadAsPdf() {
  window.print();
}

function downloadAsMusicXml() {
  let xml = '';
  try {
    xml = dataToMusicXml();
  }
  catch (e) {
    alertify.alert("Error exporting MusicXML", e.toString());
    throw e;
  }
  fileSave(name2filename(nd.name, nd.filename) + '.xml', xml);
}

function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function downloadAsSvg() {
  saveSvg($('#notation').children()[0], name2filename(nd.name, nd.filename) + '.svg');
}

function downloadAsAbc() {
  fileSave(name2filename(nd.name, nd.filename) + '.abc', dataToAbc(nd));
}

function downloadAsMidi() {
  ABCJS.renderMidi("midi-download", dataToAbc(nd), { generateDownload: true, generateInline: false });
  let el = $('.abcjs-download-midi > a');
  el.attr('download', name2filename(nd.name, nd.filename) + '.mid');
  el[0].click();
}

export function showDownloadModal() {
  let st = '';
  for (const i in exportFormats) {
    st += `<p style='text-align: center'>`;
    st += `<a id=adownload${i} class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
    st += `<b>${exportFormats[i].name}</b>`;
    st += '</a></p>';
  }
  st += `<div style='display: none' id="midi-download"></div>`;
  document.getElementById("ModalTitle").innerHTML = 'Download music';
  document.getElementById("ModalBody").innerHTML = st;
  for (const i in exportFormats) {
    document.getElementById('adownload' + i).onclick=function() {
      $('#Modal').modal('hide');
      exportFormats[i].func();
    };
  }
  $('#Modal').modal();
}
