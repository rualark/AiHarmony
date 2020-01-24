import {async_redraw, init_abcjs} from "./abc/abchelper.js";
import {initCommands, initFilenameClick, initKeyCodes} from "./ui/commands.js";
import {debug_error, getUrlParam, urlNoParams} from "./core/remote.js";
import {showShortcutsModal} from "./ui/modal/shortcutsModal.js";
import {init_base64, url2state} from "./state/state.js";
import {readRemoteMusicXmlFile} from "./MusicXml/readRemoteMusicXml.js";
import {loadState, saveState} from "./state/history.js";
import {initTooltips} from "./ui/lib/tooltips.js";
import {element_click} from "./ui/notation.js";
import {test} from "./test/test.js";

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
    async_redraw();
  }
  else if (getUrlParam('load')) {
    readRemoteMusicXmlFile('musicxml/' + getUrlParam('load').replace('/', '') + '.xml');
    window.history.replaceState("", "", urlNoParams());
  }
  else {
    async_redraw();
  }
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  setTimeout(after_init, 6000);
}

function after_init() {
  initTooltips(800, 100);
  if (debug_error) throw "debug_test_exception";
  if (getUrlParam('test') != null) {
    test(getUrlParam('test'));
  }
}

init();

