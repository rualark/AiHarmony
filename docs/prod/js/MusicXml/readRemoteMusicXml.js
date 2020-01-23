import {readMusicXml} from "./musicXmlToData.js";
import {state} from "../abc/abchelper.js";

function httpGetAsync(theUrl, callback) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
      callback(xmlHttp.responseText, theUrl.split('/').pop());
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

export function readRemoteMusicXmlFile(url) {
  state.state = 'downloading';
  httpGetAsync(url, readMusicXml);
}
