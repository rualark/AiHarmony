import {async_redraw, init_abcjs} from "./abc/abchelper.js";
import {initCommands, initFilenameClick, initKeyCodes} from "./ui/commands.js";
import {getUrlParam, urlNoParams} from "./core/remote.js";
import {showShortcutsModal} from "./ui/modal/shortcutsModal.js";
import {init_base64, url2state} from "./state/state.js";
import {readRemoteMusicXmlFile} from "./MusicXml/readRemoteMusicXml.js";
import {loadState, saveState} from "./state/history.js";
import {initTooltips} from "./ui/lib/tooltips.js";
import {element_click} from "./ui/notation.js";
import {debugError} from "./core/debug.js";
import {analyse} from "./analysis/analyse.js";

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
  analyse();
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  setTimeout(after_init, 0);
}

async function after_init() {
}

window.addEventListener('DOMContentLoaded', async function() {
  initTooltips(800, 100);
  if (debugError) throw "debug_test_exception";
  if (getUrlParam('test') != null) {
    let testModule = await import("./test/test.js");
    await testModule.test(getUrlParam('test'));
  }
});

init();

