import {state2storage, STATE_VOLATILE_SUFFIX, storage2state, storage_utf16, utf16_storage} from "./state.js";
import {nd} from "../notes/NotesData.js";
import {async_redraw} from "../abc/abchelper.js";
import {button_enabled} from "../ui/lib/uilib.js";
import {stop_advancing} from "../ui/edit/editScore.js";
import {makePatch} from "../core/string.js";
import {analyse} from "../analysis/musicAnalysis.js";

export let history = [];
export let history_pos = -1;
let MAX_HISTORY = 100;
let MAX_HISTORY_CHAIN = 10;

function historySize() {
  let size = 0;
  for (const his of history) {
    if (his.utf16 == null) {
      size += his.patch.length + 8*4;
    } else {
      size += his.utf16.length + 8*2;
    }
  }
  return size;
}

function limitHistory() {
  while (history_pos > MAX_HISTORY || (history.length && history[0].chain)) {
    history_pos--;
    history.splice(0, 1);
  }
}

function compilePlain(pos) {
  let chain = history[pos].chain;
  let res = LZString.decompressFromUTF16(history[pos - chain].utf16);
  if (!chain) return res;
  res = res.slice(0, -STATE_VOLATILE_SUFFIX);
  for (let i=pos - chain + 1; i<=pos; ++i) {
    let h = history[i];
    let res1 = h.p1 ? res.slice(0, h.p1) : '';
    let res2 = h.p2 ? res.slice(res.length - h.p2) : '';
    res = res1 + h.patch + res2;
    //console.log('compilePlain', chain, res1, h.patch, res2, res);
  }
  return res + history[pos].suffix;
}

function getHistoryUtf16(history_pos) {
  if (history[history_pos].chain) {
    return LZString.compressToUTF16(compilePlain(history_pos));
  } else {
    return history[history_pos].utf16;
  }
}

function newHist(state) {
  //console.log('newHist', history_pos, state);
  if (history_pos < 0) return {chain: 0, utf16: state.utf16};
  if (history[history_pos].chain > MAX_HISTORY_CHAIN) return {chain: 0, utf16: state.utf16};
  let plain = compilePlain(history_pos);
  let patch = makePatch(plain.slice(0, -STATE_VOLATILE_SUFFIX), state.plain.slice(0, -STATE_VOLATILE_SUFFIX));
  if (patch.p1 + patch.p2 < plain.length / 3) {
    return {chain: 0, utf16: state.utf16};
  }
  patch.suffix = state.plain.slice(-STATE_VOLATILE_SUFFIX);
  patch.chain = history[history_pos].chain + 1;
  return patch;
}

function pushState(state) {
  if (history_pos !== -1 && history[history_pos].utf16 === state.utf16) return false;
  if (history.length > history_pos + 1) {
    history.splice(history_pos + 1, history.length - history_pos - 1);
  }
  let hist = newHist(state);
  history.push(hist);
  history_pos++;
  limitHistory();
  updateUndoRedoButtons();
  //console.log('History', history_pos, historySize());
}

export function loadState() {
  try {
    pushState(storage2state());
  }
  catch (e) {
    if (e === 'version') {
      alertify.error('Your previous session was reset because new version of application does not support previous format. Please save your files before exiting to minimize this risk.', 20);
      nd.reset();
      saveState();
    }
    else console.trace(e);
  }
}

export function saveState(doAnalysis=true) {
  pushState(state2storage());
  if (doAnalysis) analyse();
}

export function undoState(doAnalysis=true) {
  if (history_pos < 1) {
    return false;
  }
  try {
    history_pos--;
    let utf16 = getHistoryUtf16(history_pos);
    storage_utf16(utf16);
    utf16_storage('aih', utf16);
    stop_advancing();
    updateUndoRedoButtons();
    if (doAnalysis) analyse();
    //console.log('History', history_pos, historySize());
  }
  catch (e) {
    nd.reset();
    async_redraw();
    updateUndoRedoButtons();
    throw e;
  }
}

export function redoState(doAnalysis=true) {
  if (history_pos === history.length - 1) {
    return false;
  }
  history_pos++;
  let utf16 = getHistoryUtf16(history_pos);
  storage_utf16(utf16);
  utf16_storage('aih', utf16);
  stop_advancing();
  updateUndoRedoButtons();
  if (doAnalysis) analyse();
  //console.log('History', history_pos, historySize());
}

function updateUndoRedoButtons() {
  button_enabled('undo', history_pos > 0);
  button_enabled('redo', history_pos < history.length - 1);
}

