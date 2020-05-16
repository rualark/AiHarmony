import {dataToMusicXml} from "../../MusicXml/dataToMusicXml.js";
import {name2filename} from "../../core/string.js";
import {nd} from "../../notes/NotesData.js";
import {dataToAbc} from "../../abc/dataToAbc.js";
import "../../../plugin/FileSaver.js-2.0.2/FileSaver.js";
import {ais} from "../../integration/aiStudio.js";
import {trackEvent} from "../../integration/tracking.js";
import { showModal } from "../lib/modal.js";
import { state } from "../../abc/abchelper.js";

let exportFormats = [
  {name: 'Download as MusicXML', func: downloadAsMusicXml },
  {name: 'Download as SVG', func: downloadAsSvg },
  {name: 'Download as ABC', func: downloadAsAbc },
  {name: 'Download as MIDI', link: linkAsMidi },
  {name: 'Download as PDF', func: downloadAsPdf },
  {name: 'Download as MP3', link: linkAsMp3 },
];

function linkAsMp3() {
  return {
    href: ais.j_url,
    download: name2filename(nd.name, nd.fileName) + '.mp3'
  };
}

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
  saveAs(new Blob([xml], {type: "text/xml"}), name2filename(nd.name, nd.fileName) + '.xml');
}

function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  saveAs(new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"}), name);
}

function downloadAsSvg() {
  saveSvg($('#abc').children()[0], name2filename(nd.name, nd.fileName) + '.svg');
}

function downloadAsAbc() {
  saveAs(new Blob([dataToAbc()], {type: "text/abc"}), name2filename(nd.name, nd.fileName) + '.abc');
}

function linkAsMidi() {
  return {
    href: ABCJS.synth.getMidiFile(dataToAbc(), {midiOutputType: 'encoded'}),
    download: name2filename(nd.name, nd.fileName) + '.mid'
  };
}

export function showDownloadModal() {
  if (state.state !== 'ready') return;
  let st = '';
  for (let i=0; i<exportFormats.length; ++i) {
    if (exportFormats[i].func == null && exportFormats[i].link == null) continue;
    if (exportFormats[i].link != null && exportFormats[i].link().href == null) continue;
    st += `<p style='text-align: center'>`;
    if (exportFormats[i].func == null) {
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
  showModal(1, 'Download music', st, '', [], [], false, ()=>{}, ()=>{});
  for (let i=0; i<exportFormats.length; ++i) {
    if (exportFormats[i].func == null && exportFormats[i].link == null) continue;
    if (exportFormats[i].link != null && exportFormats[i].link().href == null) continue;
    document.getElementById('adownload' + i).onclick = function () {
      $('#Modal1').modal('hide');
      if (exportFormats[i].func != null) {
        exportFormats[i].func();
      }
      trackEvent('AiHarmony', 'download', exportFormats[i].name);
    };
  }
}
