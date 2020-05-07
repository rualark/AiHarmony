import {readMusicXml} from "./musicXmlToData.js";
import {state, async_redraw} from "../abc/abchelper.js";
import { analyse } from "../analysis/musicAnalysis.js";

function httpGetAsync(theUrl, callback) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        callback(xmlHttp.responseText, theUrl.split('/').pop());
      } else {
        const est = 'Error opening file: ' + theUrl;
        alertify.error(est);
        async_redraw();
        analyse();
        throw est;
      }
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

export function readRemoteMusicXmlFile(url) {
  state.state = 'downloading';
  httpGetAsync(url, readMusicXml);
}
