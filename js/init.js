import {async_redraw, init_abcjs} from "./abc/abchelper.js";
import {initFilenameClick} from "./ui/commands.js";
import {getUrlParam, urlNoParams} from "./core/remote.js";
import {showShortcutsModal} from "./ui/modal/shortcutsModal.js";
import {url2state} from "./state/state.js";
import {readRemoteMusicXmlFile} from "./MusicXml/readRemoteMusicXml.js";
import {loadState, saveState} from "./state/history.js";
import {initTooltips} from "./ui/lib/tooltips.js";
import {element_click} from "./ui/notation.js";
import {debugError} from "./core/debug.js";
import {analyse} from "./analysis/musicAnalysis.js";
import {init_base64} from "./core/base64.js";
import {settings} from "./state/settings.js";
import {nd} from "./notes/NotesData.js";
import {trackEvent} from "./integration/tracking.js";

function init() {
  init_base64();
  settings.storage2settings();
  initFilenameClick();
  init_abcjs(element_click);
  loadState();
  if (getUrlParam('state')) {
    trackEvent('AiHarmony', 'open_shared');
    try {
      url2state(getUrlParam('state'));
    }
    catch (e) {
      nd.reset();
      alertify.error('Shared url is corrupted or expired');
    }
    saveState();
    window.history.replaceState("", "", urlNoParams());
    async_redraw();
  }
  else if (getUrlParam('load')) {
    trackEvent('AiHarmony', 'open', 'Open server MusicXML');
    readRemoteMusicXmlFile('musicxml/' + getUrlParam('load').replace('..', '') + '.xml');
    window.history.replaceState("", "", urlNoParams());
  }
  else {
    async_redraw();
    analyse();
  }
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  setTimeout(after_init, 1000);
}

async function after_init() {
  if (debugError) throw "debug_test_exception";
}

window.addEventListener('DOMContentLoaded', async function() {
  window.onresize = () => {
    console.log('resize');
    $('body').css('padding-top', $('#toolbar').height() + 4);
    async_redraw();
  };
  $('body').css('padding-top', $('#toolbar').height() + 4);
  initTooltips(800, 100);
  if (getUrlParam('test') != null) {
    let testModule = await import("./test/test.js");
    await testModule.test(getUrlParam('test'));
  }
});

init();

