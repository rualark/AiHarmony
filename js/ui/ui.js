import {nd} from "../notes/NotesData.js";
import "../MusicXml/musicXmlToData.js";
import {async_redraw, clicked, get_voice, init_abcjs} from "../abc/abchelper.js";
import {
  increment_note, stop_advancing,
  update_selection
} from "./edit.js";
import {
  commandAltKeyCodes,
  commandCtrlKeyCodes,
  commandKeyCodes,
  commandShiftKeyCodes,
  init_commands
} from "./commands.js";
import {getUrlParam} from "../urlparams.js";
import {showShortcutsModal} from "./modal/shortcutsModal.js";
import {showClefsModal} from "./modal/clefs.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {init_base64, storage2state, url2state, state2storage} from "../state.js";
import {readRemoteMusicXmlFile} from "../MusicXml/readRemoteMusicXml.js";
import {urlNoParams} from "../lib.js";
import {loadState, saveState} from "../history.js";

let keysEnabled = true;

export function enableKeys(enable=true) {
  keysEnabled = enable;
}

window.onresize = function() {
  async_redraw();
};

window.onkeydown = function (e) {
  if (!keysEnabled) return true;
  if (e.ctrlKey || e.metaKey) {
    if (e.keyCode in commandCtrlKeyCodes) {
      commandCtrlKeyCodes[e.keyCode].command();
      return false;
    }
  }
  else if (e.altKey) {
    if (e.keyCode in commandAltKeyCodes) {
      commandAltKeyCodes[e.keyCode].command();
      return false;
    }
  }
  else if (e.shiftKey) {
    if (e.keyCode in commandShiftKeyCodes) {
      commandShiftKeyCodes[e.keyCode].command();
      return false;
    }
  }
  else {
    if (e.keyCode in commandKeyCodes) {
      commandKeyCodes[e.keyCode].command();
      return false;
    }
  }
  return true;
};

function element_click(abcElem, tuneNumber, classes, move) {
  console.log('Click', abcElem, tuneNumber, classes, move);
  clicked.element = abcElem;
  clicked.classes = classes;
  clicked.voice = get_voice(classes);
  clicked.note = undefined;
  if (typeof clicked.element.clefPos !== 'undefined') {
    showClefsModal(nd.voices[clicked.voice]);
  }
  if (typeof clicked.element.value !== 'undefined') {
    showTimesigModal();
  }
  if (typeof clicked.element.mode !== 'undefined') {
    showKeysigModal();
  }
  if (clicked.element.duration != null) {
    clicked.note = nd.abc_charStarts[clicked.element.startChar];
  }
  stop_advancing();
  if (move) {
    increment_note(-move);
    async_redraw();
    return;
  } else {
    saveState();
  }
  update_selection();
}

function init() {
  init_commands();
  init_abcjs(element_click);
  setTimeout(after_init, 0);
}

function after_init() {
  init_base64();
  if (getUrlParam('state')) {
    url2state(getUrlParam('state'));
    saveState();
    window.history.replaceState("", "", urlNoParams());
    return;
  }
  loadState();
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  if (getUrlParam('load')) {
    readRemoteMusicXmlFile('musicxml/' + getUrlParam('load').replace('/', '') + '.xml');
    window.history.replaceState("", "", urlNoParams());
  }
}

init();

