import {dataToMusicXml} from "../../MusicXml/dataToMusicXml.js";
import {name2filename} from "../../core/string.js";
import {nd} from "../../notes/NotesData.js";
import {dataToAbc} from "../../abc/dataToAbc.js";
import "../../../plugin/FileSaver.js-2.0.2/FileSaver.js";

let exportFormats = [
  {name: 'Download as MusicXML', func: downloadAsMusicXml },
  {name: 'Download as SVG', func: downloadAsSvg },
  {name: 'Download as ABC', func: downloadAsAbc },
   {name: 'Download as MIDI', link: linkAsMidi },
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
  saveAs(new Blob([xml], {type: "text/xml"}), name2filename(nd.name, nd.filename) + '.xml');
}

function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  saveAs(new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"}), name);
}

function downloadAsSvg() {
  saveSvg($('#abc').children()[0], name2filename(nd.name, nd.filename) + '.svg');
}

function downloadAsAbc() {
  saveAs(new Blob([dataToAbc()], {type: "text/abc"}), name2filename(nd.name, nd.filename) + '.abc');
}

function linkAsMidi() {
  return {
    href: ABCJS.synth.getMidiFile(dataToAbc(), {generateLink: false}),
    download: name2filename(nd.name, nd.filename) + '.mid'
  };
}

export function showDownloadModal() {
  let st = '';
  for (const i in exportFormats) {
    st += `<p style='text-align: center'>`;
    if (exportFormats[i].link != null) {
      let link = exportFormats[i].link();
      st += `<a id=adownload${i} href="${link.href}" download="${link.download}" class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
    }
    else {
      st += `<a id=adownload${i} class='btn btn-outline-white p-3' href=# role='button' style='min-width: 30px;'>`;
    }
    st += `<b>${exportFormats[i].name}</b>`;
    st += '</a></p>';
  }
  st += `<div style='display: none' id="midi-download"></div>`;
  $('#modalDialog').removeClass("modal-lg");
  document.getElementById("ModalTitle").innerHTML = 'Download music';
  document.getElementById("ModalBody").innerHTML = st;
  for (const i in exportFormats) {
    document.getElementById('adownload' + i).onclick = function () {
      $('#Modal').modal('hide');
      if (exportFormats[i].func != null) {
        exportFormats[i].func();
      }
    };
  }
  $('#Modal').modal();
}
