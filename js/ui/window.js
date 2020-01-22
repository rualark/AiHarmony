import {async_redraw, clicked, get_voice} from "../abc/abchelper.js";
import {showClefsModal} from "./modal/clefs.js";
import {nd} from "../notes/NotesData.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {increment_note, stop_advancing, update_selection} from "./edit.js";
import {saveState} from "../state/history.js";

window.onresize = function() {
  async_redraw();
};

export function element_click(abcElem, tuneNumber, classes, move) {
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