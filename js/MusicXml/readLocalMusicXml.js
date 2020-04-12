import {readMusicXml} from "./musicXmlToData.js";
import {trackEvent} from "../integration/tracking.js";

export function readLocalMusicXmlFile(e) {
  $('#Modal1').modal('hide');
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(e) {
    readMusicXml(e.target.result, file.name);
    trackEvent('AiHarmony', 'open', 'Open local MusicXML');
  };
  reader.readAsText(file);
}


