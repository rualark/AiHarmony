import {nd} from "../notes/NotesData.js";
import {async_redraw, clicked, engraverParams} from "../abc/abchelper.js";
import {currentTimestamp, start_counter} from "../core/time.js";
import {b256_safeString, safeString_b256, ui_b256, b256_ui, b256_debug} from "./base256.js";

const ENCODING_VERSION = 10;
export const STATE_VOLATILE_SUFFIX = 12;

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
  st += ui_b256(ENCODING_VERSION, 1);
  st += safeString_b256(nd.algo, 1);
  st += ui_b256(nd.algoMode, 1);
  st += ui_b256(nd.phrases.length, 1);
  for (let i=0; i<nd.phrases.length; ++i) {
    st += ui_b256(nd.phrases[i], 2);
  }
  //console.log('keysig', nd.keysig.fifths, nd.keysig.mode, nd.keysig.fifths + 10 + nd.keysig.mode * 16);
  st += ui_b256(nd.keysig.fifths + 10 + nd.keysig.mode * 16, 1);
  st += ui_b256(nd.modes.length, 1);
  for (let i=0; i<nd.modes.length; ++i) {
    st += ui_b256(nd.modes[i].step, 2);
    st += ui_b256(nd.modes[i].fifths + 10 + nd.modes[i].mode * 16, 1);
  }
  st += ui_b256(nd.timesig.beats_per_measure, 1);
  st += ui_b256(nd.timesig.beat_type, 1);
  st += ui_b256(nd.voices.length, 1);
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += ui_b256(vc.species, 1);
    st += safeString_b256(nd.voices[v].clef, 1);
    for (let n = 0; n < vc.notes.length; ++n) {
      let nt = vc.notes[n];
      st += ui_b256(alter2contig(nt.alter || 0) * 4 + (nt.startsTie ? 2 : 0), 1);
      st += ui_b256(nt.d, 1);
      st += ui_b256(nt.len, 1);
    }
    // Write end of voice
    st+= ui_b256(1, 1);
  }
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += safeString_b256(nd.voices[v].name, 1);
  }
  st += safeString_b256(nd.name, 1);
  st += safeString_b256(nd.fileName, 1);
  st += ui_b256(engraverParams.scale * 1000, 2);
  if (clicked.note == null) {
    st += ui_b256(255, 1);
    st += ui_b256(0, 2);
  } else {
    st += ui_b256(clicked.note.voice, 1);
    st += ui_b256(clicked.note.note, 2);
  }
  st += ui_b256(currentTimestamp(), 4);
  //console.log(st, b256_debug(st));
  return st;
}

function plain2data(st, pos) {
  let saved_encoding_version = b256_ui(st, pos, 1);
  if (saved_encoding_version !== ENCODING_VERSION) {
    throw('version');
  }
  nd.algo = b256_safeString(st, pos, 1);
  nd.algoMode = b256_ui(st, pos, 1);
  let pcount = b256_ui(st, pos, 1);
  nd.phrases = [];
  for (let i = 0; i<pcount; ++i) {
    nd.phrases.push(b256_ui(st, pos, 2));
  }
  let packed = b256_ui(st, pos, 1);
  let fifths = packed % 16 - 10;
  let mode = Math.floor(packed / 16);
  nd.build_keysig(fifths, mode);
  let mcount = b256_ui(st, pos, 1);
  nd.modes = [];
  for (let i = 0; i<mcount; ++i) {
    let step = b256_ui(st, pos, 2);
    let packed = b256_ui(st, pos, 1);
    let fifths = packed % 16 - 10;
    let mode = Math.floor(packed / 16);
    nd.modes.push({
      fifths: fifths,
      mode: mode,
      step: step
    });
  }
  let beats_per_measure = b256_ui(st, pos, 1);
  let beat_type = b256_ui(st, pos, 1);
  nd.build_timesig(beats_per_measure, beat_type);
  let vcount = b256_ui(st, pos, 1);
  nd.voices = [];
  for (let v=0; v<vcount; ++v) {
    let species = b256_ui(st, pos, 1);
    let clef = b256_safeString(st, pos, 1);
    //let ncount = b256_ui(st, pos, 4);
    //console.log('Voice', clef, species);
    nd.voices.push({
      clef: clef,
      species: species,
      notes: []
    });
    for (let n = 0; n < 1000000; ++n) {
      let packed = b256_ui(st, pos, 1);
      // Detect end of voice
      if (packed === 1) break;
      let d = b256_ui(st, pos, 1);
      let len = b256_ui(st, pos, 1);
      //console.log('Note', d, len, contig2alter(Math.floor(packed / 4)), !!(packed % 4));
      nd.voices[v].notes.push({
        d: d,
        len: len,
        alter: contig2alter(Math.floor(packed / 4)),
        startsTie: !!(packed % 4)
      });
    }
  }
  for (let v=0; v<vcount; ++v) {
    let name = b256_safeString(st, pos, 1);
    nd.set_voiceName(v, name);
  }
  nd.set_name(b256_safeString(st, pos, 1));
  nd.set_fileName(b256_safeString(st, pos, 1));
  engraverParams.scale = b256_ui(st, pos, 2) / 1000;
  let v = b256_ui(st, pos, 1);
  let n = b256_ui(st, pos, 2);
  clicked.note = {voice: v, note: n};
  if (clicked.note.voice === 255) {
    clicked.note = null;
  }
  //let time = b256_ui(st, pos, 4);
  //console.log('Decoded time:', time, timestamp2date(time));
  //console.log(nd);
}

export function utf16_storage(utf16) {
  localStorage.setItem('aih', utf16);
  //stop_counter();
  //console.log(`Saved state: ${utf16.length} bytes`);
}

export function state2storage() {
  start_counter('save_state');
  let plain = '';
  plain += data2plain();
  //console.log('state2storage plain', plain);
  let utf16 = LZString.compressToUTF16(plain);
  utf16_storage(utf16);
  return {plain: plain, utf16: utf16};
}

export function storage_utf16(utf16) {
  let plain = LZString.decompressFromUTF16(utf16);
  plain2data(plain, [0]);
  async_redraw();
  return plain;
}

export function storage2state() {
  try {
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
  try {
    //console.log(url);
    let b64 = url.replace(/\./g, '/').replace(/_/g, '=').replace(/-/g, '+');
    //console.log(b64);
    let plain = LZString.decompressFromBase64(b64);
    //console.log('url2state plain', plain);
    plain2data(plain, [0]);
  }
  catch (e) {
    nd.reset();
    alertify.error('Shared url is corrupted or expired');
    throw e;
  }
}
