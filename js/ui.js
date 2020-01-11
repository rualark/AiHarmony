import {notesData} from "./notesData.js";
import {async_redraw, clicked, find_selection, init_abcjs, notation_zoom} from "./abchelper.js";
import {
  future, move_to_next_note, move_to_previous_note,
  set_len,
  set_note,
  increment_octave,
  set_rest,
  toggle_alteration,
  toggle_dot,
  toggle_tie,
  update_selection, increment_note
} from "./edit.js";

document.getElementById('zoom-in').onclick=function(){ notation_zoom(1.1); return false; };
document.getElementById('zoom-out').onclick=function(){ notation_zoom(0.9); return false; };
document.getElementById('sharp').onclick=function(){ toggle_alteration('^'); return false; };
document.getElementById('natural').onclick=function(){ toggle_alteration('='); return false; };
document.getElementById('flat').onclick=function(){ toggle_alteration('_'); return false; };
document.getElementById('rest').onclick=function(){ set_rest(); return false; };
document.getElementById('note_c').onclick=function(){ set_note(0); return false; };
document.getElementById('note_d').onclick=function(){ set_note(1); return false; };
document.getElementById('note_e').onclick=function(){ set_note(2); return false; };
document.getElementById('note_f').onclick=function(){ set_note(3); return false; };
document.getElementById('note_g').onclick=function(){ set_note(4); return false; };
document.getElementById('note_a').onclick=function(){ set_note(5); return false; };
document.getElementById('note_b').onclick=function(){ set_note(6); return false; };
document.getElementById('up8').onclick=function(){ increment_octave(1); return false; };
document.getElementById('down8').onclick=function(){ increment_octave(-1); return false; };
document.getElementById('tie').onclick=function(){ toggle_tie(); return false; };
document.getElementById('len2').onclick=function(){ set_len(1); return false; };
document.getElementById('len3').onclick=function(){ set_len(2); return false; };
document.getElementById('len4').onclick=function(){ set_len(4); return false; };
document.getElementById('len5').onclick=function(){ set_len(8); return false; };
document.getElementById('len6').onclick=function(){ set_len(16); return false; };
document.getElementById('dot').onclick=function(){ toggle_dot(); return false; };

window.onresize = function() {
  async_redraw();
};

let keymap = {
  67: () => { set_note(0) },
  68: () => { set_note(1) },
  69: () => { set_note(2) },
  70: () => { set_note(3) },
  71: () => { set_note(4) },
  65: () => { set_note(5) },
  66: () => { set_note(6) },
  54: () => { set_len(16) },
  53: () => { set_len(8) },
  52: () => { set_len(4) },
  51: () => { set_len(2) },
  50: () => { set_len(1) },
  102: () => { set_len(16) },
  101: () => { set_len(8) },
  100: () => { set_len(4) },
  99: () => { set_len(2) },
  98: () => { set_len(1) },
  190: () => { toggle_dot() },
  110: () => { toggle_dot() },
  189: () => { toggle_tie() },
  55: () => { toggle_alteration('=') },
  56: () => { toggle_alteration('^') },
  57: () => { toggle_alteration('_') },
  103: () => { toggle_alteration('=') },
  104: () => { toggle_alteration('^') },
  105: () => { toggle_alteration('_') },
  187: () => { set_rest() },
  96: () => { set_rest() },
  37: () => { move_to_previous_note(); find_selection(); },
  39: () => { move_to_next_note(); find_selection(); },
  38: () => { increment_note(1) },
  40: () => { increment_note(-1) },
};

window.onkeydown = function (e) {
  if (e.ctrlKey) {
    if (e.keyCode === 38) {
      increment_octave(1);
      return false;
    }
    if (e.keyCode === 40) {
      increment_octave(-1);
      return false;
    }
  }
  if (e.keyCode in keymap) {
    keymap[e.keyCode]();
    return false;
  }
  return true;
};

function element_click(abcElem, tuneNumber, classes) {
  console.log('Click', abcElem, tuneNumber, classes);
  clicked.element = abcElem;
  clicked.classes = classes;
  clicked.note = undefined;
  if (clicked.element.duration != null) {
    clicked.note = notesData.abc_charStarts[clicked.element.startChar];
  }
  future.advancing = false;
  future.alteration = '';
  future.len = 0;
  update_selection();
}

function init() {
  init_abcjs(element_click);
}

init();
