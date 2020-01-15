import {nd} from "./NotesData.js";
import {async_redraw, clicked, init_abcjs, notation_zoom} from "./abchelper.js";
import {
  future, stop_advancing,
  update_selection
} from "./edit.js";
import {commandCtrlKeyCodes, commandKeyCodes, init_commands} from "./commands.js";
import {getUrlParam} from "./urlparams.js";
import {showShortcutsModal} from "./modal.js";
import {showClefsModal} from "./clefs.js";

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

function element_click(abcElem, tuneNumber, classes) {
  console.log('Click', abcElem, tuneNumber, classes);
  clicked.element = abcElem;
  clicked.classes = classes;
  clicked.note = undefined;
  if (typeof clicked.element.clefPos !== 'undefined') {
    showClefsModal(nd.voices[Number(classes[0].slice(-1))]);
  }
  if (clicked.element.duration != null) {
    clicked.note = nd.abc_charStarts[clicked.element.startChar];
  }
  stop_advancing();
  update_selection();
}

function init() {
  init_commands();
  init_abcjs(element_click);
  if (getUrlParam('action') === 'shortcuts') {
    setTimeout(showShortcutsModal, 0);
  }
}

init();

