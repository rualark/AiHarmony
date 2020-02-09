import {commands, initCommands, initKeyCodes} from "./commands.js";

export function applyShortcutsLayout(layout) {
  for (let command of commands) {
    const id = command['id'];
    if (id in shortcutsLayouts[layout]) {
      command.keys = shortcutsLayouts[layout][id];
    }
  }
  initKeyCodes();
  initCommands();
}

export let shortcutsLayouts = {
  'AiHarmony': {
    'whole': ['1', 'Numpad1'],
    'half': ['2', 'Numpad2'],
    'quarter': ['4', 'Numpad4'],
    '8th': ['8', 'Numpad8'],
    '16th': ['6', 'Numpad6'],
    'tie': ['Backslash', 'NumpadDivide'],
    'dblflat': ['Shift+Dash'],
    'flat': ['Dash', 'NumpadSubtract'],
    'natural': ['N'],
    'sharp': ['EqualSign', 'NumpadAdd'],
    'dblsharp': ['Shift+EqualSign'],
    'up8': ['Shift+UpArrow'],
    'down8': ['Shift+DownArrow'],
    'rest': ['R', '0', 'Numpad0'],
    'up_part': ['Ctrl+UpArrow'],
    'down_part': ['Ctrl+DownArrow'],
    'timesig': ['T'],
    'keysig': ['K'],
    'repeat': ['P'],
  },
  'Finale': {
    'whole': ['7', 'Numpad7'],
    'half': ['6', 'Numpad6'],
    'quarter': ['5', 'Numpad5'],
    '8th': ['4', 'Numpad4'],
    '16th': ['3', 'Numpad3'],
    'tie': ['T', 'ForwardSlash', 'Backslash', 'NumpadDivide'],
    'dblflat': ['Shift+Dash'],
    'flat': ['Dash', 'NumpadSubtract'],
    'natural': ['N'],
    'sharp': ['EqualSign', 'NumpadAdd'],
    'dblsharp': ['Shift+EqualSign'],
    'up8': ['Shift+UpArrow'],
    'down8': ['Shift+DownArrow'],
    'rest': ['R', '0', 'Numpad0'],
    'up_part': ['Ctrl+UpArrow'],
    'down_part': ['Ctrl+DownArrow'],
    'timesig': ['Alt+T'],
    'keysig': ['Alt+K'],
    'repeat': ['P'],
  },
  'Sibelius': {
    'whole': ['6', 'Numpad6'],
    'half': ['5', 'Numpad5'],
    'quarter': ['4', 'Numpad4'],
    '8th': ['4', 'Numpad4'],
    '16th': ['3', 'Numpad3'],
    'tie': ['ForwardSlash', 'Backslash', 'NumpadDivide'],
    'dblflat': ['Shift+9'],
    'flat': ['9', 'Numpad9'],
    'natural': ['7', 'Numpad7'],
    'sharp': ['8', 'Numpad8'],
    'dblsharp': ['Shift+8'],
    'up8': ['Ctrl+UpArrow'],
    'down8': ['Ctrl+DownArrow'],
    'rest': ['0', 'Numpad0'],
    'up_part': ['Alt+UpArrow'],
    'down_part': ['Alt+DownArrow'],
    'timesig': ['T'],
    'keysig': ['K'],
    'repeat': ['R'],
  },
};
