import {nd} from "./notes/NotesData.js";
import {b64_unicode, unicode_b64} from "./base64.js";
import {async_redraw, clicked, engraverParams} from "./abc/abchelper.js";
import {start_counter, stop_counter} from "./lib.js";

const ENCODING_VERSION = 3;
export const STATE_VOLATILE_SUFFIX = 6;

let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
let fb64 = {};

function ui_b64(num, chars) {
  let i = Math.floor(num);
  if (i < 0) {
    throw("ui_b64 can convert to Base64 only non-negative numbers, but got " + i);
  }
  let st = '';
  for (let c=0; c<chars; ++c) {
    let data = i % 64;
    st = b64[data] + st;
    i = Math.floor(i / 64);
  }
  if (i > 0) {
    throw(`ui_b64 cannot convert number ${num} to ${chars} base64 characters due to overflow`);
  }
  //console.log('ui_b64', num, chars, st);
  return st;
}

function b64_single(char) {
  if (char in fb64) return fb64[char];
  throw(`Cannot convert symbol ${char} from Base64`);
}

function b64_ui(st, pos, chars) {
  let res = 0;
  let pow = 1;
  for (let c=0; c<chars; ++c) {
    let data = b64_single(st[pos[0] + chars - 1 - c]);
    res += data * pow;
    pow *= 64;
  }
  pos[0] += chars;
  //console.log('b64_ui', pos[0] - chars, chars, st.substr(pos[0] - chars, chars), res);
  return res;
}

function safeString_b64(st) {
  return ui_b64(st.length, 2) + st;
}

function string_b64(st) {
  return safeString_b64(unicode_b64(st));
}

function b64_string(st, pos) {
  let chars = b64_ui(st, pos, 2);
  let res = b64_unicode(st.substr(pos[0], chars));
  pos[0] += chars;
  //console.log('b64_string', pos[0] - chars, chars, st.substr(pos[0] - chars, chars), res);
  return res;
}

function alter2contig(alt) {
  if (alt === 10) return 0;
  return alt + 3;
}

function contig2alter(con) {
  if (con === 0) return 10;
  return con - 3;
}

function data2string() {
  let st = '';
  st += ui_b64(ENCODING_VERSION, 2);
  st += string_b64(nd.name);
  st += string_b64(nd.filename);
  st += ui_b64(nd.voices.length, 2);
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    st += string_b64(nd.voices[v].clef);
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
  return st;
}

function string2data(st, pos) {
  let saved_encoding_version = b64_ui(st, pos, 2);
  if (saved_encoding_version !== ENCODING_VERSION) {
    throw(`Supported encoding version is ${ENCODING_VERSION}, while data has version ${saved_encoding_version}`);
  }
  nd.name = b64_string(st, pos);
  nd.filename = b64_string(st, pos);
  let vcount = b64_ui(st, pos, 2);
  nd.voices = [];
  for (let v=0; v<vcount; ++v) {
    let clef = b64_string(st, pos);
    let name = b64_string(st, pos);
    //let ncount = b64_ui(st, pos, 4);
    nd.voices.push({
      clef: clef,
      name: name,
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
  clicked.note.voice = b64_ui(st, pos, 2);
  clicked.note.note = b64_ui(st, pos, 4);
  if (clicked.note.voice === 64*64 - 1) {
    clicked.note = undefined;
  }
}

export function save_state_utf16(utf16) {
  localStorage.setItem('aih', utf16);
  stop_counter();
  console.log(`Saved state: ${utf16.length} bytes`);
}

export function save_state() {
  start_counter('save_state');
  let plain = '';
  plain += data2string();
  let utf16 = LZString.compressToUTF16(plain);
  save_state_utf16(utf16);
  return {plain: plain, utf16: utf16};
}

export function load_state_utf16(utf16) {
  let plain = LZString.decompressFromUTF16(utf16);
  string2data(plain, [0]);
  async_redraw();
  return plain;
}

export function load_state() {
  try {
    let utf16 = localStorage.getItem('aih');
    let plain = load_state_utf16(utf16);
    return {plain: plain, utf16: utf16};
  }
  catch (e) {
    nd.reset();
    async_redraw();
    throw e;
  }
}

export function save_state_url() {
  let plain = '';
  plain += data2string();
  let b64 = LZString.compressToBase64(plain);
  let url = b64.replace(/\//g, '.').replace(/=/g, '_').replace(/\+/g, '-');
  console.log(url);
  return url;
}

export function load_state_url(url) {
  try {
    console.log(url);
    b64 = url.replace(/\./g, '/').replace(/_/g, '=').replace(/-/g, '+');
    console.log(b64);
    let plain = LZString.decompressFromBase64(b64);
    string2data(plain, [0]);
  }
  catch (e) {
    nd.reset();
    alertify.error('Shared url is corrupted');
    throw e;
  }
  async_redraw();
}

export function init_base64() {
  for (let i=0; i<b64.length; ++i) fb64[b64[i]] = i;
  //console.log(fb64);
}

// TODO: No need to convert to base64 before compressing - can convert to full ASCII array and then compress
