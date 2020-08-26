import {async_redraw, init_abcjs} from "./abc/abchelper.js";
import {initFilenameClick} from "./ui/commands.js";
import {getUrlParam, urlNoParams} from "./core/remote.js";
import {showShortcutsModal} from "./ui/modal/shortcutsModal.js";
import {url2state, update_browser_id, storage2archiveStorage} from "./state/state.js";
import {readRemoteMusicXmlFile} from "./MusicXml/readRemoteMusicXml.js";
import {loadState, saveState} from "./state/history.js";
import {initTooltips} from "./ui/lib/tooltips.js";
import {element_click} from "./ui/selection.js";
import {debugError} from "./core/debug.js";
import {analyse} from "./analysis/musicAnalysis.js";
import {init_base64} from "./core/base64.js";
import {settings} from "./state/settings.js";
import {nd} from "./notes/NotesData.js";
import {trackEvent} from "./integration/tracking.js";
import { showCantusModal } from "./ui/modal/cantusModal.js";

function checkBrowserSupported() {
  if (navigator.browserSpecs.name !== 'Chrome' && navigator.browserSpecs.name !== 'Safari') {
    alertify.warning('Please use latest Chrome or Safari browser for best results on this site', 15);
  }
}

function init() {
  init_base64();
  update_browser_id();
  settings.storage2settings();
  initFilenameClick();
  init_abcjs(element_click);
  loadState();
  if (getUrlParam('state')) {
    trackEvent('AiHarmony', 'open_shared');
    storage2archiveStorage(5);
    nd.reset();
    try {
      url2state(getUrlParam('state'));
      const root_eid = getUrlParam('rid');
      if (root_eid) nd.set_root_eid(root_eid);
    }
    catch (e) {
      nd.reset();
      if (e === 'version') {
        alertify.error('Shared url is expired');
      } else {
        alertify.error('Shared url is corrupted');
      }
    }
    saveState();
    window.history.replaceState("", "", urlNoParams());
    async_redraw();
  }
  else if (getUrlParam('load')) {
    trackEvent('AiHarmony', 'open', 'Open server MusicXML');
    nd.reset();
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
  if (getUrlParam('action') === 'cantus') {
    setTimeout(showCantusModal, 0);
  }
  setTimeout(after_init, 1000);
}

function maintenanceMessage() {
  //alertify.warning(`If analysis is not working, try to <a href='https://www.digitaltrends.com/computing/how-to-clear-your-browser-cache/' target=_blank>clear Cached Images and Files</a>`, 60);
}

async function after_init() {
  if (debugError) throw "debug_test_exception";
  checkBrowserSupported();
  maintenanceMessage();
}

window.addEventListener('DOMContentLoaded', async function() {
  initTooltips(800, 100);
  if (getUrlParam('test') != null) {
    let testModule = await import("./test/test.js");
    await testModule.test(getUrlParam('test'));
  }
});

window.onload = function() {
  let lastWidth = 0;
  window.onresize = () => {
    if (window.innerWidth == lastWidth) return;
    lastWidth = window.innerWidth;
    $('body').css('padding-top', $('#toolbar').height() + 4);
    async_redraw();
  };
  $('body').css('padding-top', $('#toolbar').height() + 4);
};

init();
