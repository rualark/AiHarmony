import "./MusicXml/musicXmlToData.js";
import {async_redraw, init_abcjs} from "./abc/abchelper.js";
import {initCommands, initFilenameClick, initKeyCodes} from "./ui/commands.js";
import {getUrlParam, urlNoParams} from "./core/url.js";
import {showShortcutsModal} from "./ui/modal/shortcutsModal.js";
import {init_base64, url2state} from "./state/state.js";
import {readRemoteMusicXmlFile} from "./MusicXml/readRemoteMusicXml.js";
import {loadState, saveState} from "./state/history.js";
import {initTooltips} from "./ui/lib/tooltips.js";
import {element_click} from "./ui/notation.js";

function init() {
  initKeyCodes();
  initCommands();
  initFilenameClick();
  init_abcjs(element_click);
  init_base64();
  loadState();
  if (getUrlParam('state')) {
    url2state(getUrlParam('state'));
    saveState();
    window.history.replaceState("", "", urlNoParams());
  }
  async_redraw();
  if (getUrlParam('load')) {
    readRemoteMusicXmlFile('musicxml/' + getUrlParam('load').replace('/', '') + '.xml');
    window.history.replaceState("", "", urlNoParams());
  }
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  setTimeout(after_init, 0);
}

function after_init() {
  initTooltips(800, 100);
}

init();

