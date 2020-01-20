import {nd} from "./notes/NotesData.js";

let b64 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function ui2b64(num, chars) {
  let i = num;
  if (i < 0) {
    throw("ui2b64 can convert to Base64 only non-negative numbers, but got " + i);
  }
  let st = '';
  for (let c=0; c<chars; ++c) {
    let data = i % 64;
    st += b64[i];
    i = Math.floor(i / 64);
  }
  if (i > 0) {
    throw(`ui2b64 cannot convert number ${num} to ${chars} base64 characters due to overflow`);
  }
  return st;
}

function safe_string2b64(st) {
  return ui2b64(st.length, 2) + st;
}

function string2b64(st) {
  return safe_string2b64(btoa(st));
}

function alter2contig(alt) {
  if (alt === 10) return 0;
  return alt + 3;
}

function data2string() {
  let st = '';
  st += string2b64(nd.name);
  st += string2b64(nd.filename);
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = this.voices[v];
    st += string2b64(voices[v].clef);
    st += string2b64(voices[v].name);
    st += ui2b64(voices[v].notes.length, 4);
    for (let n = 0; n < vc.notes.length; ++n) {
      let nt = vc.notes[n];
      st += ui2b64(nt.d - 7, 1);
      st += ui2b64(alter2contig(nt.alter) * 2 + (nt.startsTie ? 1 : 0));
      st += ui2b64(nt.len, 1);
    }
  }
}

export function save_state() {

}
