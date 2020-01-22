import {
  add_part, del_bar, del_part,
  increment_note,
  increment_octave, new_file, next_note,
  prev_note, repeat_element,
  set_len,
  set_note,
  set_rest, stop_advancing,
  toggle_alter,
  toggle_dot,
  toggle_tie, voiceChange
} from "./edit.js";
import {showShortcutsModal} from "./modal/shortcutsModal.js";
import {async_redraw, notation_zoom} from "../abc/abchelper.js";
import {keyCodes} from './lib/keys.js';
import {play} from "../audio/audio.js";
import {nd} from "../notes/NotesData.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {showOpenMusicXmlModal} from "../MusicXml/readLocalMusicXml.js";
import {showDownloadModal} from "./modal/download.js";
import {showShareModal} from "./modal/share.js";
import {redoState, undoState} from "../history.js";
import {mobileOrTablet} from "../mobileCheck.js";
import {sendToAic} from "../integration/aiCounterpoint.js";
import {enableKeys} from "./ui.js";

let mobileOpt = {
  true: {
    toolbar_img_height: 30,
    toolbar_button_width: 40,
    toolbar_font_scale: 1,
  },
  false: {
    toolbar_img_height: 20,
    toolbar_button_width: 25,
    toolbar_font_scale: 0.7,
  },
};

function setKeyCode(struct, key, command) {
  if (!(key in keyCodes)) console.error('Unknown key:', key);
  if (struct[keyCodes[key]] != null) console.error('Duplicate key command:', key);
  struct[keyCodes[key]] = command;
}

export function init_commands() {
  for (let command of commands) {
    if (command.keys === undefined) continue;
    for (let key of command.keys) {
      if (key.startsWith('Ctrl+')) {
        setKeyCode(commandCtrlKeyCodes, key.substr(5), command);
      }
      else if (key.startsWith('Alt+')) {
        setKeyCode(commandAltKeyCodes, key.substr(4), command);
      }
      else if (key.startsWith('Shift+')) {
        setKeyCode(commandShiftKeyCodes, key.substr(6), command);
      }
      else {
        setKeyCode(commandKeyCodes, key, command);
      }
    }
  }
  let st = '';
  for (let command of commands) {
    if (command.toolbar != null && command.toolbar.dev != null) {
      if (mobileOrTablet && !(command.toolbar.dev & 1)) continue;
      if (!mobileOrTablet && !(command.toolbar.dev & 2)) continue;
    }
    if (command.separator) {
      st += `<div style='display: inline-block; height: 100%; vertical-align: middle;'><img src=img/color/gray.png style='vertical-align: middle; opacity: 0.3' height=${mobileOpt[mobileOrTablet].toolbar_img_height - 4} width=1></div>&nbsp;`;
      continue;
    }
    if (!command.toolbar) continue;
    if (!command.id) continue;
    let tooltip = '';
    if (!mobileOrTablet) {
      let title = command.name;
      if (command.keys != null && command.keys.length) {
        title += '<br>(shortcut ' + command.keys[0] + ')';
      }
      tooltip = `data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="${title}"`;
    }
    st += `<a ${tooltip} id='${command.id}' class='btn btn-outline-white ${command.toolbar.disabled ? "disabled " : ""}p-1' href=# role='button' style='min-width: ${mobileOpt[mobileOrTablet].toolbar_button_width}px; font-size: ${command.toolbar.fontSize * mobileOpt[mobileOrTablet].toolbar_font_scale || '1'}em'>`;
    if (command.toolbar.type === 'image') {
      command.toolbar.html = `<img id='${command.id}i' src=img/toolbar/${command.id}.png height=${mobileOpt[mobileOrTablet].toolbar_img_height}>`;
    }
    if (command.toolbar.type === 'text') {
      command.toolbar.html = `${command.toolbar.text}`;
    }
    st += command.toolbar.html + '</a>&nbsp;';
  }
  //console.log(st);
  document.getElementById("toolbar").innerHTML = st;
  for (let command of commands) {
    if (command.toolbar != null && command.toolbar.dev != null) {
      if (mobileOrTablet && !(command.toolbar.dev & 1)) continue;
      if (!mobileOrTablet && !(command.toolbar.dev & 2)) continue;
    }
    if (!command.id) continue;
    document.getElementById(command.id).onclick=function(){
      command.command();
      return false;
    };
  }
  document.getElementById('filename').onclick=function(){
    enableKeys(false);
    alertify.prompt('Exercise name', '', nd.name,
      function(evt, value) {
        enableKeys(true);
        nd.name = value;
        $('#filename').html('&nbsp;&nbsp;' + nd.name);
      },
      function() {
        enableKeys(true);
      }
    );
    return false;
  };
}

export let commandKeyCodes = {};
export let commandCtrlKeyCodes = {};
export let commandAltKeyCodes = {};
export let commandShiftKeyCodes = {};

export let commands = [
  {
    id: 'question',
    toolbar: {type: 'image'},
    keys: ['F1'],
    command: () => { showShortcutsModal() },
    name: '',
  },
  {
    id: 'new',
    toolbar: {type: 'image'},
    keys: ['Alt+N'],
    command: () => { new_file() },
    name: 'New file',
  },
  {
    id: 'open',
    toolbar: {type: 'image'},
    keys: ['Ctrl+O'],
    command: () => { showOpenMusicXmlModal() },
    name: 'Open MusicXml file',
  },
  {
    id: 'download',
    toolbar: {type: 'image'},
    keys: ['Ctrl+S'],
    command: () => { showDownloadModal() },
    name: 'Download music',
  },
  {
    id: 'share',
    toolbar: {type: 'image'},
    keys: ['Ctrl+R'],
    command: () => { showShareModal() },
    name: 'Share music',
  },
  {
    id: 'aic',
    toolbar: {type: 'image'},
    keys: ['Ctrl+A'],
    command: () => { sendToAic() },
    name: 'Artinfuser Counterpoint analysis',
  },
  { separator: true },
  {
    id: 'undo',
    toolbar: {type: 'image', disabled: true},
    keys: ['Ctrl+Z'],
    command: () => { undoState() },
    name: 'Undo',
  },
  {
    id: 'redo',
    toolbar: {type: 'image', disabled: true},
    keys: ['Ctrl+Y'],
    command: () => { redoState() },
    name: 'Redo',
  },
  { separator: true },
  {
    id: 'len6',
    toolbar: {type: 'image'},
    keys: ['1', 'Numpad1'],
    command: () => { set_len(16) },
    name: 'Input whole note',
  },
  {
    id: 'len5',
    toolbar: {type: 'image'},
    keys: ['2', 'Numpad2'],
    command: () => { set_len(8) },
    name: 'Input half note',
  },
  {
    id: 'len4',
    toolbar: {type: 'image'},
    keys: ['4', 'Numpad4'],
    command: () => { set_len(4) },
    name: 'Input quarter note',
  },
  {
    id: 'len3',
    toolbar: {type: 'image'},
    keys: ['8', 'Numpad8'],
    command: () => { set_len(2) },
    name: 'Input 1/8 note',
  },
  {
    id: 'len2',
    toolbar: {type: 'image'},
    keys: ['6', 'Numpad6'],
    command: () => { set_len(1) },
    name: 'Input 1/16 note',
  },
  {
    id: 'dot',
    toolbar: {type: 'image'},
    keys: ['Period', 'NumpadDecimalPoint'],
    command: () => { toggle_dot() },
    name: 'Input dotted note',
  },
  {
    id: 'tie',
    toolbar: {type: 'image'},
    keys: ['Backslash', 'NumpadDivide'],
    command: () => { toggle_tie() },
    name: 'Input tie between notes',
  },
  { separator: true },
  {
    id: 'note_c',
    toolbar: {type: 'image'},
    keys: ['C'],
    command: () => { set_note(0) },
    name: 'Input note C',
  },
  {
    id: 'note_d',
    toolbar: {type: 'image'},
    keys: ['D'],
    command: () => { set_note(1) },
    name: 'Input note D',
  },
  {
    id: 'note_e',
    toolbar: {type: 'image'},
    keys: ['E'],
    command: () => { set_note(2) },
    name: 'Input note E',
  },
  {
    id: 'note_f',
    toolbar: {type: 'image'},
    keys: ['F'],
    command: () => { set_note(3) },
    name: 'Input note F',
  },
  {
    id: 'note_g',
    toolbar: {type: 'image'},
    keys: ['G'],
    command: () => { set_note(4) },
    name: 'Input note G',
  },
  {
    id: 'note_a',
    toolbar: {type: 'image'},
    keys: ['A'],
    command: () => { set_note(5) },
    name: 'Input note A',
  },
  {
    id: 'note_b',
    toolbar: {type: 'image'},
    keys: ['B'],
    command: () => { set_note(6) },
    name: 'Input note B',
  },
  { separator: true },
  {
    id: 'dblflat',
    toolbar: {type: 'image'},
    keys: [],
    command: () => { toggle_alter(-2) },
    name: 'Input double flat',
  },
  {
    id: 'flat',
    toolbar: {type: 'image'},
    keys: ['Dash', 'NumpadSubtract'],
    command: () => { toggle_alter(-1) },
    name: 'Input flat',
  },
  {
    id: 'natural',
    toolbar: {type: 'image'},
    keys: ['N', 'EqualSign'],
    command: () => { toggle_alter(0) },
    name: 'Input natural',
  },
  {
    id: 'sharp',
    toolbar: {type: 'image'},
    keys: ['Shift+EqualSign', 'NumpadAdd'],
    command: () => { toggle_alter(1) },
    name: 'Input sharp',
  },
  {
    id: 'dblsharp',
    toolbar: {type: 'image'},
    keys: [],
    command: () => { toggle_alter(2) },
    name: 'Input double sharp',
  },
  { separator: true },
  {
    id: 'keysig',
    toolbar: {type: 'image'},
    keys: ['K'],
    command: () => { showKeysigModal() },
    name: 'Key signature',
  },
  { separator: true },
  {
    id: 'up8',
    toolbar: {type: 'text', text: '+8ve', fontSize: 1.2},
    keys: ['Shift+UpArrow'],
    command: () => { increment_octave(1) },
    name: 'Move note up an octave',
  },
  {
    id: 'down8',
    toolbar: {type: 'text', text: '-8ve', fontSize: 1.2},
    keys: ['Shift+DownArrow'],
    command: () => { increment_octave(-1) },
    name: 'Move note down an octave',
  },
  { separator: true },
  {
    id: 'rest',
    toolbar: {type: 'image'},
    keys: ['0', 'Numpad0'],
    command: () => { set_rest(true) },
    name: 'Input rest',
  },
  { separator: true },
  {
    id: 'add_bar',
    toolbar: {type: 'image'},
    keys: ['Ctrl+B'],
    command: () => { nd.append_measure(); async_redraw(); },
    name: 'Add bar at end',
  },
  {
    id: 'del_bar',
    toolbar: {type: 'image'},
    keys: ['Ctrl+Delete'],
    command: () => { del_bar(); },
    name: 'Delete current bar',
  },
  { separator: true },
  {
    id: 'add_part',
    toolbar: {type: 'text', text: '+Part', fontSize: 1.2},
    keys: [],
    command: () => { add_part() },
    name: 'Add part below selected part',
  },
  {
    id: 'del_part',
    toolbar: {type: 'text', text: '-Part', fontSize: 1.2},
    keys: [],
    command: () => { del_part() },
    name: 'Delete selected part',
  },
  { separator: true },
  {
    id: 'play',
    toolbar: {type: 'image'},
    keys: ['Space'],
    command: () => { play() },
    name: 'Playback',
  },
  /*
  {
    id: 'play_hq',
    toolbar: {type: 'image'},
    keys: ['Ctrl+Space'],
    command: () => { play() },
    name: 'Playback (high quality)',
  },
   */
  {
    keys: ['Ctrl+UpArrow'],
    command: () => { voiceChange(-1) },
    name: 'Move to higher voice',
  },
  {
    keys: ['Ctrl+DownArrow'],
    command: () => { voiceChange(1) },
    name: 'Move to lower voice',
  },
  {
    keys: ['Delete'],
    command: () => { set_rest(false) },
    name: 'Delete note',
  },
  {
    keys: ['R'],
    command: () => { repeat_element() },
    name: 'Repeat element',
  },
  {
    keys: ['T'],
    command: () => { showTimesigModal() },
    name: 'Change time signature',
  },
  {
    keys: ['LeftArrow'],
    command: () => { prev_note() },
    name: 'Select previous note',
  },
  {
    keys: ['RightArrow'],
    command: () => { next_note() },
    name: 'Select next note',
  },
  {
    keys: ['UpArrow'],
    command: () => { increment_note(1) },
    name: 'Move note up',
  },
  {
    keys: ['DownArrow'],
    command: () => { increment_note(-1) },
    name: 'Move note down',
  },
  {
    id: 'zoom-in',
    keys: ['Ctrl+NumpadAdd'],
    command: () => { notation_zoom(1.1) },
    name: 'Zoom in',
  },
  {
    id: 'zoom-out',
    keys: ['Ctrl+NumpadSubtract'],
    command: () => { notation_zoom(0.9) },
    name: 'Zoom out',
  },
  {
    keys: ['Esc'],
    command: () => { stop_advancing() },
    name: 'Stop advancing edit',
  },
];
