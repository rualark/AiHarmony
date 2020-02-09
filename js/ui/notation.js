import {async_redraw, clicked, get_voice} from "../abc/abchelper.js";
import {showClefsModal} from "./modal/clefs.js";
import {nd} from "../notes/NotesData.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {
  can_increment_note,
  future,
  increment_note
} from "./edit/editNote.js";
import {saveState} from "../state/history.js";
import {button_enabled, button_enabled_active} from "./lib/uilib.js";
import {rename_part, stop_advancing} from "./edit/editScore.js";
import {can_pre_tie, can_tie, is_pre_tie} from "./edit/editTie.js";
import {can_dot, can_len} from "./edit/editLen.js";
import {showFlagsModal} from "./modal/flagsModal.js";

window.onresize = function() {
  async_redraw();
};

export function update_selection() {
  button_enabled('add_part', typeof clicked.element.abselem !== 'undefined' && nd.voices.length < 63);
  button_enabled('del_part', typeof clicked.element.abselem !== 'undefined' && nd.voices.length > 1);
  button_enabled_active('note_c', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 0);
  button_enabled_active('note_d', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 1);
  button_enabled_active('note_e', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 2);
  button_enabled_active('note_f', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 3);
  button_enabled_active('note_g', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 4);
  button_enabled_active('note_a', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 5);
  button_enabled_active('note_b', clicked.element.duration, clicked.element.pitches && (77 + clicked.element.pitches[0].pitch) % 7 === 6);
  button_enabled_active('rest', clicked.element.duration, clicked.element.rest && clicked.element.rest.type === 'rest');
  button_enabled_active('up8', can_increment_note(7), false);
  button_enabled_active('down8', can_increment_note(-7), false);
  if (clicked.element.rest && clicked.element.rest.type === 'rest' || future.advancing) {
    button_enabled_active('dblflat', clicked.element.duration, future.alteration === -2);
    button_enabled_active('flat', clicked.element.duration, future.alteration === -1);
    button_enabled_active('natural', clicked.element.duration, future.alteration === 0);
    button_enabled_active('sharp', clicked.element.duration, future.alteration === 1);
    button_enabled_active('dblsharp', clicked.element.duration, future.alteration === 2);
  } else {
    button_enabled_active('dblflat', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'dblflat');
    button_enabled_active('flat', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'flat');
    button_enabled_active('natural', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'natural');
    button_enabled_active('sharp', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'sharp');
    button_enabled_active('dblsharp', clicked.element.duration, clicked.element.pitches && clicked.element.pitches[0].accidental === 'dblsharp');
  }
  //console.log('nl', future.advancing, future.len);
  if (future.advancing && future.len) {
    button_enabled_active('len2', clicked.element.duration, [1].includes(future.len));
    button_enabled_active('len3', can_len(2), [2, 3].includes(future.len));
    button_enabled_active('len4', can_len(4), [4, 6].includes(future.len));
    button_enabled_active('len5', can_len(8), [8, 12].includes(future.len));
    button_enabled_active('len6', can_len(16), [16, 24].includes(future.len));
    button_enabled_active('dot', can_dot(), [3, 6, 12, 24].includes(future.len));
  } else {
    button_enabled_active('len2', clicked.element.duration, [0.0625].includes(clicked.element.duration));
    button_enabled_active('len3', can_len(2), [0.125, 0.1875].includes(clicked.element.duration));
    button_enabled_active('len4', can_len(4), [0.25, 0.375].includes(clicked.element.duration));
    button_enabled_active('len5', can_len(8), [0.5, 0.75].includes(clicked.element.duration));
    button_enabled_active('len6', can_len(16), [1, 1.5].includes(clicked.element.duration));
    button_enabled_active('dot', can_dot(), [0.375, 0.75, 1.5].includes(clicked.element.duration));
  }
  if (future.advancing && future.len) {
    button_enabled_active('tie', can_pre_tie(), is_pre_tie());
  } else {
    button_enabled_active('tie', can_tie(), clicked.element.abselem && clicked.element.abselem.startTie);
  }
  if (clicked.note != null && clicked.note.note != null) {
    $('.ares').css({"font-weight": ''});
    $('.ares_' + clicked.note.voice + '_' + clicked.note.note).css({"font-weight": 'bold'});
  }
}

export function element_click(abcElem, tuneNumber, classes, pos, move) {
  console.log('Click', abcElem, tuneNumber, classes, pos, move);
  clicked.element = abcElem;
  clicked.classes = classes;
  clicked.voice = pos.voice;
  //clicked.voice = get_voice(classes);
  clicked.note = null;
  if (abcElem['el_type'] === 'voice-name') {
    rename_part();
  }
  else if (typeof clicked.element.clefPos !== 'undefined') {
    showClefsModal(nd.voices[clicked.voice]);
  }
  else if (typeof clicked.element.value !== 'undefined') {
    showTimesigModal();
  }
  else if (typeof clicked.element.mode !== 'undefined') {
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
    saveState(false);
  }
  update_selection();
}