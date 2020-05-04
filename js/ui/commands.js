import {
  increment_note,
  increment_octave,
  repeat_element,
  set_note,
  set_rest,
  toggle_alter
} from "./edit/editNote.js";
import {showShortcutsModal} from "./modal/shortcutsModal.js";
import {async_redraw, notation_zoom} from "../abc/abchelper.js";
import {keyCodes} from './lib/keys.js';
import {play} from "../audio/audio.js";
import {nd} from "../notes/NotesData.js";
import {showTimesigModal} from "./modal/timesig.js";
import {showKeysigModal} from "./modal/keysig.js";
import {showDownloadModal} from "./modal/download.js";
import {showShareModal} from "./modal/shareModal.js";
import {redoState, saveState, undoState} from "../state/history.js";
import {mobileOrTablet} from "../core/mobileCheck.js";
import {sendToAic} from "../integration/aiCounterpoint.js";
import {add_part, del_bar, del_part, new_file, stop_advancing, voiceChange} from "./edit/editScore.js";
import {toggle_tie} from "./edit/editTie.js";
import {next_note, prev_note} from "./edit/select.js";
import {set_len, toggle_dot} from "./edit/editLen.js";
import {name2filename} from "../core/string.js";
import {sendToAis} from "../integration/aiStudio.js";
import {showSettingsModal} from "./modal/settingsModal.js";
import {ares} from "../analysis/AnalysisResults.js";
import {openNewUrl} from "./lib/uilib.js";
import {trackEvent} from "../integration/tracking.js";
import {settings} from "../state/settings.js";
import { add_lyric, add_text } from "./edit/editText.js";
import { showOpenModal } from "./modal/openModal.js";

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

export let keysEnabled = true;

function executeCommand(command) {
  command.command();
  trackEvent('AiHarmony', 'action_shortcut', command.name);
  return false;
}

window.onkeydown = function (e) {
  if (!keysEnabled) return true;
  if (e.ctrlKey || e.metaKey) {
    if (e.keyCode in commandCtrlKeyCodes) {
      return executeCommand(commandCtrlKeyCodes[e.keyCode]);
    }
  }
  else if (e.altKey) {
    if (e.keyCode in commandAltKeyCodes) {
      return executeCommand(commandAltKeyCodes[e.keyCode]);
    }
  }
  else if (e.shiftKey) {
    if (e.keyCode in commandShiftKeyCodes) {
      return executeCommand(commandShiftKeyCodes[e.keyCode]);
    }
  }
  else {
    if (e.keyCode in commandKeyCodes) {
      return executeCommand(commandKeyCodes[e.keyCode]);
    }
  }
  return true;
};

function setKeyCode(struct, key, command) {
  if (!(key in keyCodes)) console.error('Unknown key:', key);
  if (struct[keyCodes[key]] != null) console.error('Duplicate key command:', key);
  struct[keyCodes[key]] = command;
}

export function enableKeys(enable = true) {
  keysEnabled = enable;
}

export function initKeyCodes() {
  commandKeyCodes = {};
  commandCtrlKeyCodes = {};
  commandAltKeyCodes = {};
  commandShiftKeyCodes = {};
  for (let command of commands) {
    if (command.keys == null) continue;
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
}

export function toolbarButtonHtml(command, showHints) {
  let st = '';
  let tooltip = '';
  if (command.toolbar.type !== 'select') {
    if (!mobileOrTablet) {
      let title = command.name;
      if (command.keys != null && command.keys.length) {
        title += '<br>(shortcut: ' + command.keys[0] + ')';
      }
      tooltip = `data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="${title}"`;
    }
    st += `<a ${tooltip} id='${command.id}' class='btn btn-outline-white ${command.toolbar.disabled ? "disabled " : ""}p-1' href=# role='button' style='display: flex; justify-content: center; flex-shrink: 0; align-items: center; min-width: ${mobileOpt[mobileOrTablet].toolbar_button_width}px; font-size: ${command.toolbar.fontSize * mobileOpt[mobileOrTablet].toolbar_font_scale || '1'}em'>`;
  }
  if (command.toolbar.type === 'image') {
    st += `<img id='${command.id}i' src=img/toolbar/${command.id}.png height=${mobileOpt[mobileOrTablet].toolbar_img_height}>`;
    if (showHints && command.toolbar.hintText) {
      st += `&nbsp;<span style='font-size: 0.8em'>${command.toolbar.hintText}</span>`;
    }
  }
  if (command.toolbar.type === 'text') {
    st += `${command.toolbar.text}`;
  }
  if (command.toolbar.type === 'select') {
    if (command.id === 'algo') {
      st += `<div style='display: flex; justify-content: center; flex-shrink: 0; align-items: center;'>`;
      st += `<select class="form-control custom-select" style='box-shadow: none; font-size: 0.85em; height: 32px; width: 175px;' id=${command.id}>`;
      st += `<option value='' ${nd.algo === '' ? "selected" : ""}>No music analysis</option>`;
      st += `<option value=CA3 ${nd.algo === 'CA3' ? "selected" : ""}>Counterpoint analysis</option>`;
      st += `<option value=HA1 ${nd.algo === 'HA1' ? "selected" : ""}>Basic analysis</option>`;
      st += `</select></div>`;
    }
  }
  if (command.toolbar.type !== 'select') {
    st += '</a>';
  }
  return st;
}

function makeToolbar(toolbar_id) {
  let st = '';
  for (let command of commands) {
    if (command.toolbar != null && command.toolbar.dev != null) {
      if (mobileOrTablet && !(command.toolbar.dev & 1)) continue;
      if (!mobileOrTablet && !(command.toolbar.dev & 2)) continue;
    }
    if (!command.toolbar) continue;
    if (command.toolbar.toolbar_id !== toolbar_id) {
      if (command.toolbar.toolbar_id === 'pc2-mobile1') {
        if (!mobileOrTablet && toolbar_id !== 2) continue;
        if (mobileOrTablet && toolbar_id !== 1) continue;
      }
      else continue;
    }
    let nbsp = '&nbsp;';
    //if (!mobileOrTablet) nbsp = '';
    if (command.separator) {
      st += `<div style='display: flex; justify-content: center; align-items: center;'><img src=img/color/gray.png style='opacity: 0.3' height=${mobileOpt[mobileOrTablet].toolbar_img_height - 4} width=1></div>${nbsp}`;
      continue;
    }
    if (!command.id) continue;
    st += toolbarButtonHtml(command, settings.toolbarHints) + `${nbsp}`;
  }
  return st;
}

export function initCommands() {
  //console.log(st);
  document.getElementById("toolbar").innerHTML = makeToolbar(1);
  document.getElementById("toolbar2").innerHTML = makeToolbar(2);
  document.getElementById("toolbar3").innerHTML = makeToolbar(3);
  for (let command of commands) {
    if (!command.event) continue;
    if (command.toolbar != null && command.toolbar.dev != null) {
      if (mobileOrTablet && !(command.toolbar.dev & 1)) continue;
      if (!mobileOrTablet && !(command.toolbar.dev & 2)) continue;
    }
    if (!command.id) continue;
    document.getElementById(command.id)[command.event] =function(){
      command.command();
      trackEvent('AiHarmony', 'action_click', command.name);
      return false;
    };
  }
}

export function initFilenameClick() {
  document.getElementById('filename').onclick=function(){
    enableKeys(false);
    bootbox.prompt({
      title: "Exercise name",
      value: nd.name,
      callback: function(value) {
        enableKeys(true);
        if (value == null) return;
        nd.set_name(value);
        nd.set_fileName(name2filename(value));
        $('#filename').html('&nbsp;&nbsp;' + nd.name);
        saveState(false);
      }
    });
    return false;
  };
  $('#mode').click(() => {
    showKeysigModal();
    return false;
  });
}

export let commandKeyCodes = {};
export let commandCtrlKeyCodes = {};
export let commandAltKeyCodes = {};
export let commandShiftKeyCodes = {};

export let commands = [
  {
    id: 'logo',
    toolbar: {type: 'image', toolbar_id: 2},
    event: 'onclick',
    keys: [],
    command: () => { openNewUrl('https://artinfuser.com') },
    name: 'Artinfuser site',
  },
  {
    id: 'question',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Help'},
    event: 'onclick',
    keys: ['F1'],
    command: () => { showShortcutsModal() },
    name: 'Help',
  },
  { separator: true, toolbar: {toolbar_id: 2} },
  {
    id: 'new',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'New'},
    event: 'onclick',
    keys: ['Alt+N'],
    command: () => { new_file() },
    name: 'New file',
  },
  {
    id: 'open',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Open'},
    event: 'onclick',
    keys: ['Ctrl+O', 'Alt+O'],
    command: () => { showOpenModal() },
    name: 'Open MusicXml file',
  },
  {
    id: 'download',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Download'},
    event: 'onclick',
    keys: ['Ctrl+S'],
    command: () => { showDownloadModal() },
    name: 'Download music',
  },
  {
    id: 'share',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Share'},
    event: 'onclick',
    keys: ['Ctrl+R'],
    command: () => { showShareModal() },
    name: 'Share music',
  },
  {
    id: 'aprev',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+LeftArrow'],
    command: () => { ares.prevFlag() },
    name: 'Previous mistake',
  },
  {
    id: 'mistake',
    toolbar: {type: 'image', toolbar_id: 1, hintText: 'Mistakes'},
    event: 'onclick',
    keys: ['F2'],
    command: () => { ares.selectedFlags() },
    name: 'Show selected mistakes',
  },
  {
    id: 'anext',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+RightArrow'],
    command: () => { ares.nextFlag() },
    name: 'Next mistake',
  },
  { separator: true, toolbar: {toolbar_id: 2} },
  {
    id: 'settings',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Settings'},
    event: 'onclick',
    keys: [],
    command: () => { showSettingsModal() },
    name: 'Settings',
  },
  { separator: true, toolbar: {toolbar_id: 2} },
  {
    id: 'support',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Support'},
    event: 'onclick',
    keys: [],
    command: () => { openNewUrl('https://github.com/rualark/AiHarmony/issues') },
    name: 'Create support request',
  },
  {
    id: 'docs',
    toolbar: {type: 'image', toolbar_id: 2, hintText: 'Docs'},
    event: 'onclick',
    keys: [],
    command: () => { openNewUrl('https://artinfuser.com/counterpoint/docs.php?d=cp_analyse') },
    name: 'Counterpoint documentation',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'undo',
    toolbar: {type: 'image', disabled: true, toolbar_id: 1, hintText: 'Undo'},
    event: 'onclick',
    keys: ['Ctrl+Z'],
    command: () => { undoState() },
    name: 'Undo',
  },
  {
    id: 'redo',
    toolbar: {type: 'image', disabled: true, toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+Y'],
    command: () => { redoState() },
    name: 'Redo',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'whole',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['1', 'Numpad1'],
    command: () => { set_len(16) },
    name: 'Input whole note',
  },
  {
    id: 'half',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['2', 'Numpad2'],
    command: () => { set_len(8) },
    name: 'Input half note',
  },
  {
    id: 'quarter',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['4', 'Numpad4'],
    command: () => { set_len(4) },
    name: 'Input quarter note',
  },
  {
    id: '8th',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['8', 'Numpad8'],
    command: () => { set_len(2) },
    name: 'Input 1/8 note',
  },
  {
    id: '16th',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['6', 'Numpad6'],
    command: () => { set_len(1) },
    name: 'Input 1/16 note',
  },
  {
    id: 'dot',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Period', 'NumpadDecimalPoint'],
    command: () => { toggle_dot() },
    name: 'Input dotted note',
  },
  {
    id: 'tie',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Backslash', 'NumpadDivide'],
    command: () => { toggle_tie() },
    name: 'Input tie between notes',
  },
  { separator: true, toolbar: {toolbar_id: 'pc2-mobile1'} },
  {
    id: 'note_c',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['C'],
    command: () => { set_note(0) },
    name: 'Input note C',
  },
  {
    id: 'note_d',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['D'],
    command: () => { set_note(1) },
    name: 'Input note D',
  },
  {
    id: 'note_e',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['E'],
    command: () => { set_note(2) },
    name: 'Input note E',
  },
  {
    id: 'note_f',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['F'],
    command: () => { set_note(3) },
    name: 'Input note F',
  },
  {
    id: 'note_g',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['G'],
    command: () => { set_note(4) },
    name: 'Input note G',
  },
  {
    id: 'note_a',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['A'],
    command: () => { set_note(5) },
    name: 'Input note A',
  },
  {
    id: 'note_b',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1'},
    event: 'onclick',
    keys: ['B'],
    command: () => { set_note(6) },
    name: 'Input note B',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'dblflat',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: [],
    command: () => { toggle_alter(-2) },
    name: 'Input double flat',
  },
  {
    id: 'flat',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Dash', 'NumpadSubtract'],
    command: () => { toggle_alter(-1) },
    name: 'Input flat',
  },
  {
    id: 'natural',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['N', 'EqualSign'],
    command: () => { toggle_alter(0) },
    name: 'Input natural',
  },
  {
    id: 'sharp',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Shift+EqualSign', 'NumpadAdd'],
    command: () => { toggle_alter(1) },
    name: 'Input sharp',
  },
  {
    id: 'dblsharp',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: [],
    command: () => { toggle_alter(2) },
    name: 'Input double sharp',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'up8',
    toolbar: {type: 'text', text: '+8ve', fontSize: 1.2, toolbar_id: 1},
    event: 'onclick',
    keys: ['Shift+UpArrow'],
    command: () => { increment_octave(1) },
    name: 'Move note up an octave',
  },
  {
    id: 'down8',
    toolbar: {type: 'text', text: '-8ve', fontSize: 1.2, toolbar_id: 1},
    event: 'onclick',
    keys: ['Shift+DownArrow'],
    command: () => { increment_octave(-1) },
    name: 'Move note down an octave',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'rest',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['0', 'Numpad0'],
    command: () => { set_rest(true) },
    name: 'Input rest',
  },
  { separator: true, toolbar: {toolbar_id: 'pc2-mobile1'} },
  {
    id: 'keysig',
    toolbar: {type: 'image', toolbar_id: 'pc2-mobile1', hintText: 'Key'},
    event: 'onclick',
    keys: ['K'],
    command: () => { showKeysigModal() },
    name: 'Key signature',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'add_bar',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+B'],
    command: () => { nd.append_measure(); async_redraw(); },
    name: 'Add bar at end',
  },
  {
    id: 'del_bar',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+Delete'],
    command: () => { del_bar(); },
    name: 'Delete current bar',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'add_part',
    toolbar: {type: 'text', text: '+Part', fontSize: 1.3, toolbar_id: 1},
    event: 'onclick',
    keys: [],
    command: () => { add_part() },
    name: 'Add part below selected part',
  },
  {
    id: 'del_part',
    toolbar: {type: 'text', text: '-Part', fontSize: 1.3, toolbar_id: 1},
    event: 'onclick',
    keys: [],
    command: () => { del_part() },
    name: 'Delete selected part',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'add_text',
    toolbar: {type: 'text', text: 'Text', fontSize: 1.3, toolbar_id: 1},
    event: 'onclick',
    keys: ['Alt+T'],
    command: () => { add_text() },
    name: 'Add text above note',
  },
  {
    id: 'add_lyric',
    toolbar: {type: 'text', text: 'Lyric', fontSize: 1.3, toolbar_id: 1},
    event: 'onclick',
    keys: ['Alt+L'],
    command: () => { add_lyric() },
    name: 'Add lyric below note',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'play',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Space'],
    command: () => { play() },
    name: 'Playback',
  },
  {
    id: 'ais',
    toolbar: {type: 'image', toolbar_id: 1},
    event: 'onclick',
    keys: ['Ctrl+Space'],
    command: () => { sendToAis() },
    name: 'Playback (high quality)',
  },
  { separator: true, toolbar: {toolbar_id: 1} },
  {
    id: 'cantus',
    toolbar: {type: 'image', toolbar_id: 3, hintText: 'Cantus'},
    event: 'onclick',
    keys: [],
    command: () => { sendToAis() },
    name: 'Open cantus firumus',
  },
  {
    id: 'algo',
    toolbar: {type: 'select', toolbar_id: 3, hintText: 'Music analysis algorithm'},
    event: 'onchange',
    keys: [],
    command: () => {
      nd.algo = $("#algo option:selected" ).val();
      saveState();
      if (nd.algo === '') async_redraw();
    },
    name: 'Music analysis algorithm',
  },
  {
    id: 'aic',
    toolbar: {type: 'image', toolbar_id: 3, hintText: 'Report'},
    event: 'onclick',
    keys: ['Ctrl+A'],
    command: () => { sendToAic() },
    name: 'Artinfuser Counterpoint analysis',
  },
  {
    id: 'up_part',
    keys: ['Ctrl+UpArrow'],
    command: () => { voiceChange(-1) },
    name: 'Move to higher voice',
  },
  {
    id: 'down_part',
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
    id: 'repeat',
    keys: ['R'],
    command: () => { repeat_element() },
    name: 'Repeat element',
  },
  {
    id: 'timesig',
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
    event: 'onclick',
    keys: ['Ctrl+NumpadAdd'],
    command: () => { notation_zoom(1.1) },
    name: 'Zoom in',
  },
  {
    id: 'zoom-out',
    event: 'onclick',
    keys: ['Ctrl+NumpadSubtract'],
    command: () => { notation_zoom(0.9) },
    name: 'Zoom out',
  },
  {
    keys: ['Esc'],
    command: () => {
      stop_advancing();
      async_redraw();
      alertify.dismissAll();
    },
    name: 'Stop advancing edit',
  },
];
