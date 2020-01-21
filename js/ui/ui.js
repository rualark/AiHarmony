import {nd} from "../notes/NotesData.js";
import "../MusicXml/musicXmlToData.js";
import {async_redraw, clicked, get_voice, init_abcjs, notation_zoom} from "../abc/abchelper.js";
import {
  future, increment_note, stop_advancing,
  update_selection
} from "./edit.js";
import {commandCtrlKeyCodes, commandKeyCodes, init_commands} from "./commands.js";
import {getUrlParam} from "../urlparams.js";
import {showShortcutsModal} from "./modal/modal.js";
import {showClefsModal} from "./modal/clefs.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {load_test_musicXml} from "../MusicXml/test-xml.js";
import {init_base64, load_state, load_state_url, save_state} from "../state.js";
import {readRemoteMusicXmlFile} from "../MusicXml/readRemoteMusicXml.js";
import {cleanUrl} from "../lib.js";
import {loadState, saveState} from "../history.js";

window.onresize = function() {
  async_redraw();
};

window.onkeydown = function (e) {
  if (e.ctrlKey) {
    if (e.keyCode in commandCtrlKeyCodes) {
      commandCtrlKeyCodes[e.keyCode].command();
      return false;
    }
  } else {
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
    save_state();
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
    load_state_url(getUrlParam('state'));
    saveState();
    window.history.replaceState("", "", cleanUrl());
    return;
  }
  loadState();
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
  if (getUrlParam('load')) {
    readRemoteMusicXmlFile('musicxml/' + getUrlParam('load').replace('/', '') + '.xml');
    window.history.replaceState("", "", cleanUrl());
  }
}

init();

