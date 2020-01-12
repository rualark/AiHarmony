import {
  increment_note,
  increment_octave, next_note,
  prev_note,
  set_len,
  set_note,
  set_rest,
  toggle_alteration,
  toggle_dot,
  toggle_tie
} from "./edit.js";
import {showShortcutsModal} from "./modal.js";
import {notation_zoom} from "./abchelper.js";
import {keyCodes} from './keys.js';

export function init_commands() {
  for (let command of commands) {
    if (command.keys === undefined) continue;
    for (let key of command.keys) {
      if (key.startsWith('Ctrl+')) {
        commandCtrlKeyCodes[keyCodes[key.substr(5)]] = command;
      } else {
        commandKeyCodes[keyCodes[key]] = command;
      }
    }
  }
  let st = '';
  for (let command of commands) {
    if (!command.toolbar) continue;
    if (!command.id) continue;
    st += `<a id='${command.id}' class='btn btn-outline-white p-1' href=# role='button' style='width: 50px; ${command.toolbar.style || ''}'>`;
    if (command.toolbar.type === 'image') {
      st += `<img src=img/toolbar/${command.id}.png height=35>`;
    }
    if (command.toolbar.type === 'text') {
      st += `${command.toolbar.text}`;
    }
    st += '</a>&nbsp;';
  }
  console.log(st);
  document.getElementById("toolbar").innerHTML = st;
  for (let command of commands) {
    if (!command.id) continue;
    document.getElementById(command.id).onclick=function(){
      command.command();
      return false;
    };
  }
}

export let commandKeyCodes = {};
export let commandCtrlKeyCodes = {};

export let commands = [
  {
    id: 'question',
    toolbar: {type: 'image'},
    keys: ['F1'],
    command: () => { showShortcutsModal() },
    name: '',
  },
  {
    id: 'len6',
    toolbar: {type: 'image'},
    keys: ['6', 'Numpad6'],
    command: () => { set_len(16) },
    name: 'Input whole note',
  },
  {
    id: 'len5',
    toolbar: {type: 'image'},
    keys: ['5', 'Numpad5'],
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
    keys: ['3', 'Numpad3'],
    command: () => { set_len(2) },
    name: 'Input 1/8 note',
  },
  {
    id: 'len2',
    toolbar: {type: 'image'},
    keys: ['2', 'Numpad2'],
    command: () => { set_len(1) },
    name: 'Input 1/16 note',
  },
  {
    id: 'dot',
    toolbar: {type: 'image'},
    keys: ['Period', 'DecimalPoint'],
    command: () => { toggle_dot() },
    name: 'Input dotted note',
  },
  {
    id: 'tie',
    toolbar: {type: 'image'},
    keys: ['Dash'],
    command: () => { toggle_tie() },
    name: 'Input tie between notes',
  },
  { separator: true },
  {
    id: 'note_c',
    toolbar: {type: 'text', text: 'C', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['C'],
    command: () => { set_note(0) },
    name: 'Input note C',
  },
  {
    id: 'note_d',
    toolbar: {type: 'text', text: 'D', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['D'],
    command: () => { set_note(1) },
    name: 'Input note D',
  },
  {
    id: 'note_e',
    toolbar: {type: 'text', text: 'E', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['E'],
    command: () => { set_note(2) },
    name: 'Input note E',
  },
  {
    id: 'note_f',
    toolbar: {type: 'text', text: 'F', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['F'],
    command: () => { set_note(3) },
    name: 'Input note F',
  },
  {
    id: 'note_g',
    toolbar: {type: 'text', text: 'G', style: 'font-family: sans-serif; font-size: 1.5em'},
    command: () => { set_note(4) },
    name: 'Input note G',
  },
  {
    id: 'note_a',
    toolbar: {type: 'text', text: 'A', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['A'],
    command: () => { set_note(5) },
    name: 'Input note A',
  },
  {
    id: 'note_b',
    toolbar: {type: 'text', text: 'B', style: 'font-family: sans-serif; font-size: 1.5em'},
    keys: ['B'],
    command: () => { set_note(6) },
    name: 'Input note B',
  },
  { separator: true },
  {
    id: 'natural',
    toolbar: {type: 'image'},
    keys: ['7', 'Numpad7'],
    command: () => { toggle_alteration('=') },
    name: 'Input natural',
  },
  {
    id: 'sharp',
    toolbar: {type: 'image'},
    keys: ['8', 'Numpad8'],
    command: () => { toggle_alteration('^') },
    name: 'Input sharp',
  },
  {
    id: 'flat',
    toolbar: {type: 'image'},
    keys: ['9', 'Numpad9'],
    command: () => { toggle_alteration('_') },
    name: 'Input flat',
  },
  { separator: true },
  {
    id: 'up8',
    toolbar: {type: 'text', text: '+8ve', style: 'font-family: sans-serif; font-size: 1.2em'},
    keys: ['Ctrl+UpArrow'],
    command: () => { increment_octave(1) },
    name: 'Move note up an octave',
  },
  {
    id: 'down8',
    toolbar: {type: 'text', text: '-8ve', style: 'font-family: sans-serif; font-size: 1.2em'},
    keys: ['Ctrl+DownArrow'],
    command: () => { increment_octave(-1) },
    name: 'Move note down an octave',
  },
  { separator: true },
  {
    id: 'rest',
    toolbar: {type: 'image'},
    keys: ['EqualSign', 'Numpad0'],
    command: () => { set_rest() },
    name: 'Input rest',
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
    keys: ['Add'],
    command: () => { notation_zoom(1.1) },
  },
  {
    id: 'zoom-out',
    keys: ['Subtract'],
    command: () => { notation_zoom(0.9) },
  },
];
