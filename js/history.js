import {load_state, load_state_utf16, save_state} from "./state.js";
import {stop_advancing} from "./ui/edit.js";
import {nd} from "./notes/NotesData.js";
import {async_redraw} from "./abc/abchelper.js";
import {button_enabled} from "./ui/lib/uilib.js";

export let history = [];
export let history_pos = -1;

function historySize() {
  let size = 0;
  for (const his of history) {
    size += his.utf16.length;
  }
  return size;
}

function pushState(state) {
  if (history_pos !== -1 && history[history_pos].utf16 === state.utf16) return false;
  if (history.length > history_pos + 1) {
    history.splice(history_pos + 1, history.length - history_pos - 1);
  }
  history.push({utf16: state.utf16, time: Date.now()});
  history_pos++;
  updateUndoRedoButtons();
  console.log('History', history, history_pos, historySize());
}

export function loadState() {
  pushState(load_state());
}

export function saveState() {
  pushState(save_state());
}

export function undoState() {
  if (history_pos < 1) {
    return false;
  }
  try {
    history_pos--;
    load_state_utf16(history[history_pos].utf16);
    stop_advancing();
    updateUndoRedoButtons();
    console.log('History', history, history_pos, historySize());
  }
  catch {
    nd.reset();
    async_redraw();
    updateUndoRedoButtons();
    throw e;
  }
}

export function redoState() {
  if (history_pos === history.length - 1) {
    return false;
  }
  history_pos++;
  load_state_utf16(history[history_pos].utf16);
  stop_advancing();
  updateUndoRedoButtons();
  console.log('History', history, history_pos, historySize());
}

function updateUndoRedoButtons() {
  button_enabled('undo', history_pos > 0);
  button_enabled('redo', history_pos < history.length - 1);
}
