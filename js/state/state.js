import {nd, NotesData} from "../notes/NotesData.js";
import {async_redraw, selected} from "../abc/abchelper.js";
import {currentTimestamp, start_counter, timestamp2date} from "../core/time.js";
import {b256_safeString, safeString_b256, ui_b256, b256_ui} from "../core/base256.js";
import { generateRandomId } from "../core/string.js";

const MIN_ENCODING_VERSION = 14;
const MAX_ENCODING_VERSION = 16;
export const STATE_VOLATILE_SUFFIX = 7;
const MAX_ARCHIVE_COUNT = 80;
const MAX_ARCHIVE_BYTES = 200000;
export const session_id = generateRandomId(16);
export let browser_id = "";

function alter2contig(alt) {
  if (alt === 10) return 0;
  return alt + 3;
}

function contig2alter(con) {
  if (con === 0) return 10;
  return con - 3;
}

export function data2plain() {
  let st = '';
  st += ui_b256(MAX_ENCODING_VERSION, 1);
  st += safeString_b256(nd.algo, 1);
  st += ui_b256(nd.algoMode, 1);
  st += ui_b256(nd.phrases.length, 1);
  for (let i=0; i<nd.phrases.length; ++i) {
    st += ui_b256(nd.phrases[i], 2);
  }
  //console.log('keysig', nd.keysig.fifths, nd.keysig.mode, nd.keysig.fifths + 10 + nd.keysig.mode * 16);
  st += ui_b256(nd.keysig.fifths + 8 + nd.keysig.mode * 16, 1);
  st += ui_b256(nd.modes.length, 1);
  for (let i=0; i<nd.modes.length; ++i) {
    st += ui_b256(nd.modes[i].step, 2);
    st += ui_b256(nd.modes[i].fifths + 8 + nd.modes[i].mode * 16, 1);
  }
  st += ui_b256(nd.timesig.beats_per_measure, 1);
  st += ui_b256(nd.timesig.beat_type, 1);
  st += ui_b256(nd.voices.length, 1);
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += ui_b256(vc.species + (vc.locked ? 1 : 0) * 16, 1);
    st += safeString_b256(nd.voices[v].clef, 1);
    for (let n = 0; n < vc.notes.length; ++n) {
      let nt = vc.notes[n];
      st += ui_b256(alter2contig(nt.alter || 0) * 4 + (nt.startsTie ? 2 : 0), 1);
      st += ui_b256(nt.d, 1);
      st += ui_b256(nt.len, 1);
      st += safeString_b256(nt.text, 1);
      st += safeString_b256(nt.lyric, 1);
    }
    // Write end of voice
    st+= ui_b256(1, 1);
  }
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += safeString_b256(vc.name, 1);
  }
  st += safeString_b256(nd.name, 1);
  st += safeString_b256(nd.fileName, 1);
  st += ui_b256(nd.tempo, 1);
  st += ui_b256(nd.root_eid, 4);
  if (selected.note == null) {
    st += ui_b256(255, 1);
    st += ui_b256(0, 2);
  } else {
    st += ui_b256(selected.note.voice, 1);
    st += ui_b256(selected.note.note, 2);
  }
  st += ui_b256(currentTimestamp(), 4);
  //console.log(st, b256_debug(st));
  return st;
}

export function plain2data(st, pos, target, full) {
  let saved_encoding_version = b256_ui(st, pos, 1);
  if (saved_encoding_version < MIN_ENCODING_VERSION || saved_encoding_version > MAX_ENCODING_VERSION) {
    throw('version');
  }
  if (saved_encoding_version !== MAX_ENCODING_VERSION) {
    console.log('Loading deprecated version of state: ', saved_encoding_version);
  }
  target.algo = b256_safeString(st, pos, 1);
  target.algoMode = b256_ui(st, pos, 1);
  let pcount = b256_ui(st, pos, 1);
  target.phrases = [];
  for (let i = 0; i<pcount; ++i) {
    target.phrases.push(b256_ui(st, pos, 2));
  }
  let packed = b256_ui(st, pos, 1);
  let fifths = packed % 16 - 8;
  let mode = Math.floor(packed / 16);
  target.build_keysig(fifths, mode);
  let mcount = b256_ui(st, pos, 1);
  target.modes = [];
  for (let i = 0; i<mcount; ++i) {
    let step = b256_ui(st, pos, 2);
    let packed = b256_ui(st, pos, 1);
    let fifths = packed % 16 - 8;
    let mode = Math.floor(packed / 16);
    target.modes.push({
      fifths: fifths,
      mode: mode,
      step: step
    });
  }
  let beats_per_measure = b256_ui(st, pos, 1);
  let beat_type = b256_ui(st, pos, 1);
  target.build_timesig(beats_per_measure, beat_type);
  let vcount = b256_ui(st, pos, 1);
  target.voices = [];
  for (let v=0; v<vcount; ++v) {
    let packed = b256_ui(st, pos, 1);
    let clef = b256_safeString(st, pos, 1);
    //let ncount = b256_ui(st, pos, 4);
    //console.log('Voice', clef, species);
    target.voices.push({
      clef: clef,
      species: packed % 16,
      locked: !!(Math.floor(packed / 16)),
      notes: []
    });
    for (let n = 0; n < 1000000; ++n) {
      let packed = b256_ui(st, pos, 1);
      // Detect end of voice
      if (packed === 1) break;
      let d = b256_ui(st, pos, 1);
      let len = b256_ui(st, pos, 1);
      //console.log('Note', d, len, contig2alter(Math.floor(packed / 4)), !!(packed % 4));
      target.voices[v].notes.push({
        d: d,
        len: len,
        alter: contig2alter(Math.floor(packed / 4)),
        startsTie: !!(packed % 4),
        text: b256_safeString(st, pos, 1),
        lyric: b256_safeString(st, pos, 1),
      });
    }
  }
  for (let v=0; v<vcount; ++v) {
    let name = b256_safeString(st, pos, 1);
    target.set_voiceName(v, name);
  }
  target.set_name(b256_safeString(st, pos, 1));
  target.set_fileName(b256_safeString(st, pos, 1));
  if (saved_encoding_version >= 15) {
    target.set_tempo(b256_ui(st, pos, 1));
  }
  if (saved_encoding_version >= 16) {
    target.set_root_eid(b256_ui(st, pos, 4));
  }
  let v = b256_ui(st, pos, 1);
  let n = b256_ui(st, pos, 2);
  if (full) {
    selected.note = {voice: v, note: n};
    if (selected.note.voice === 255) {
      selected.note = null;
    }
  }
  target.decoded_time = timestamp2date(b256_ui(st, pos, 4));
  //console.log(nd);
}

export function state2storage() {
  //start_counter('save_state');
  let plain = '';
  plain += data2plain();
  //console.log('state2storage plain', plain);
  let utf16 = LZString.compressToUTF16(plain);
  utf16_storage('aih', utf16);
  return {plain: plain, utf16: utf16};
}

export function utf16_storage(name, utf16) {
  let previous_id = localStorage.getItem('aihSessionId');
  // If we are overwriting a different session, first archive it
  if (previous_id != session_id) {
    storage2archiveStorage(3);
    alertify.message('Detected and saved your changes made in another session', 10);
  }
  localStorage.setItem(name, utf16);
  localStorage.setItem('aihSessionId', session_id);
}

export function storage_utf16(utf16) {
  let plain = LZString.decompressFromUTF16(utf16);
  plain2data(plain, [0], nd, true);
  async_redraw();
  return plain;
}

export function update_browser_id() {
  browser_id = localStorage.getItem('aihBrowserId');
  if (!browser_id) {
    browser_id = generateRandomId(16);
    localStorage.setItem('aihBrowserId', browser_id);
  }
}

export function storage2state() {
  try {
    // Prevent archiving state if we load it, even if state is corrupted or old - because this means that archive will also be corrupted/old
    localStorage.setItem('aihSessionId', session_id);
    let utf16 = localStorage.getItem('aih');
    if (utf16 == null) {
      throw "No previous state stored in this browser";
    }
    let plain = storage_utf16(utf16);
    return {plain: plain, utf16: utf16};
  }
  catch (e) {
    nd.reset();
    throw e;
  }
}

export function state2url() {
  let plain = '';
  plain += data2plain();
  //console.log(plain);
  let b64 = LZString.compressToBase64(plain);
  //console.log(url);
  return b64.replace(/\//g, '.').replace(/=/g, '_').replace(/\+/g, '-');
}

export function url2state(url) {
  //console.log(url);
  let b64 = url.replace(/\./g, '/').replace(/_/g, '=').replace(/-/g, '+');
  //console.log(b64);
  let plain = LZString.decompressFromBase64(b64);
  //console.log('url2state plain', plain);
  plain2data(plain, [0], nd, true);
  console.log('This url was shared', nd.decoded_time)
}

export function storage2archiveStorage(why) {
  let utf16 = localStorage.getItem('aih');
  if (!utf16) return;
  let previous_id = localStorage.getItem('aihSessionId');
  let archiveSt = localStorage.getItem('aihArchive');
  if (!archiveSt) {
    archiveSt = "[]";
  }
  let archive = JSON.parse(archiveSt);
  console.log('Archive state', archive.length, archiveSt.length);
  // Remove previous archived state of session being archived if they are both before conflicts,
  // because this means that archived session did not have new/open events and we are losing only events history
  // This allows to use archive capacity more efficiently
  if (why === 3) {
    for (let i=archive.length - 1; i>=0; --i) {
      if (archive[i].id === previous_id) {
        if (archive[i].why === 3) {
          archive.splice(i, 1);
        }
        break;
      }
    }
  }
  // Remove archived states if archive is too big
  while (archiveSt.length > MAX_ARCHIVE_BYTES) {
    archive.splice(0, 1);
    archiveSt = JSON.stringify(archive);
  }
  if (archive.length >= MAX_ARCHIVE_COUNT) {
    archive.splice(0, archive.length - MAX_ARCHIVE_COUNT + 1);
  }
  archive.push({
    utf16: utf16,
    time: Math.floor(Date.now() / 1000),
    id: previous_id,
    why: why,
  });
  localStorage.setItem('aihArchive', JSON.stringify(archive));
  // Set my session_id to prevent conflict detection and archiving again
  localStorage.setItem('aihSessionId', session_id);
}

export function getArchiveStorage() {
  start_counter('getArchiveStorage');
  const archiveSt = localStorage.getItem('aihArchive');
  if (!archiveSt) return [];
  let archive = JSON.parse(archiveSt);
  for (let ver of archive) {
    ver.nd = new NotesData();
    let plain = LZString.decompressFromUTF16(ver.utf16);
    plain2data(plain, [0], ver.nd, false);
  }
  return archive;
}
