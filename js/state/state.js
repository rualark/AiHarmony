import {nd} from "../notes/NotesData.js";
import {b64_safeShortString, b64_string, b64_ui, safeShortString_b64, string_b64, ui_b64} from "./base64.js";
import {async_redraw, clicked, engraverParams} from "../abc/abchelper.js";
import {currentTimestamp, start_counter} from "../core/time.js";

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
  st += ui_b64(ENCODING_VERSION, 2);
  st += safeShortString_b64(nd.algo);
  st += ui_b64(nd.algoMode, 1);
  st += ui_b64(nd.phrases.length, 2);
  for (let i=0; i<nd.phrases.length; ++i) {
    st += ui_b64(nd.phrases[i], 3);
  }
  st += string_b64(nd.name);
  st += string_b64(nd.filename);
  st += ui_b64(nd.keysig.fifths + 10, 1);
  st += ui_b64(nd.keysig.mode, 1);
  st += ui_b64(nd.modes.length, 2);
  for (let i=0; i<nd.modes.length; ++i) {
    st += ui_b64(nd.modes[i].step, 3);
    st += ui_b64(nd.modes[i].fifths + 10, 1);
    st += ui_b64(nd.modes[i].mode, 1);
  }
  st += ui_b64(nd.timesig.beats_per_measure, 1);
  st += ui_b64(nd.timesig.beat_type, 1);
  st += ui_b64(nd.voices.length, 1);
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += ui_b64(vc.species, 1);
    st += safeShortString_b64(nd.voices[v].clef);
    st += string_b64(nd.voices[v].name);
    //st += ui_b64(nd.voices[v].notes.length, 4);
    for (let n = 0; n < vc.notes.length; ++n) {
      let nt = vc.notes[n];
      st += ui_b64(alter2contig(nt.alter || 0) * 4 + (nt.startsTie ? 2 : 0), 1);
      st += ui_b64(nt.d ? nt.d - 4 : 0, 1);
      //console.log('pack', nt.alter || 0, alter2contig(nt.alter || 0), nt.startsTie, nt.startsTie ? 1 : 0, alter2contig(nt.alter || 0) * 2 + (nt.startsTie ? 1 : 0));
      st += ui_b64(nt.len, 1);
    }
    // Write end of voice
    st+= ui_b64(1, 1);
  }
  st += ui_b64(engraverParams.scale * 1000, 4);
  if (clicked.note == null) {
    st += ui_b64(64*64 - 1, 2);
    st += ui_b64(0, 4);
  } else {
    st += ui_b64(clicked.note.voice, 2);
    st += ui_b64(clicked.note.note, 4);
  }
  st += ui_b64(currentTimestamp(), 6);
  return st;
}

function plain2data(st, pos) {
  let saved_encoding_version = b64_ui(st, pos, 2);
  if (saved_encoding_version !== ENCODING_VERSION) {
    throw('version');
  }
  nd.algo = b64_safeShortString(st, pos);
  nd.algoMode = b64_ui(st, pos, 1);
  let pcount = b64_ui(st, pos, 2);
  nd.phrases = [];
  for (let i = 0; i<pcount; ++i) {
    nd.phrases.push(b64_ui(st, pos, 3));
  }
  nd.name = b64_string(st, pos);
  nd.filename = b64_string(st, pos);
  let fifths = b64_ui(st, pos, 1) - 10;
  let mode = b64_ui(st, pos, 1);
  nd.build_keysig(fifths, mode);
  let mcount = b64_ui(st, pos, 2);
  nd.modes = [];
  for (let i = 0; i<mcount; ++i) {
    let step = b64_ui(st, pos, 3);
    let fifths = b64_ui(st, pos, 1) - 10;
    let mode = b64_ui(st, pos, 1);
    nd.modes.push({
      fifths: fifths,
      mode: mode,
      step: step
    });
  }
  let beats_per_measure = b64_ui(st, pos, 1);
  let beat_type = b64_ui(st, pos, 1);
  nd.build_timesig(beats_per_measure, beat_type);
  let vcount = b64_ui(st, pos, 1);
  nd.voices = [];
  for (let v=0; v<vcount; ++v) {
    let species = b64_ui(st, pos, 1);
    let clef = b64_safeShortString(st, pos);
    let name = b64_string(st, pos);
    //let ncount = b64_ui(st, pos, 4);
    nd.voices.push({
      clef: clef,
      name: name,
      species: species,
      notes: []
    });
    for (let n = 0; n < 1000000; ++n) {
      let packed = b64_ui(st, pos, 1);
      // Detect end of voice
      if (packed === 1) break;
      let d = b64_ui(st, pos, 1);
      let len = b64_ui(st, pos, 1);
      nd.voices[v].notes.push({
        d: d ? d + 4 : 0,
        len: len,
        alter: contig2alter(Math.floor(packed / 4)),
        startsTie: !!(packed % 4)
      });
    }
  }
  engraverParams.scale = b64_ui(st, pos, 4) / 1000;
  let v = b64_ui(st, pos, 2);
  let n = b64_ui(st, pos, 4);
  clicked.note = {voice: v, note: n};
  if (clicked.note.voice === 64*64 - 1) {
    clicked.note = null;
  }
  //let time = b64_ui(st, pos, 6);
  //console.log('Decoded time:', time, timestamp2date(time));
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

