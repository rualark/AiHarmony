import {nd} from "../notes/NotesData.js";
import { ares, vocra_name } from "../analysis/AnalysisResults.js";
import { MD5 } from "../core/string.js";
import { modeName } from "./noteHelper.js";

export function getMusicHash() {
  let st = '';
  st += nd.keysig.name + nd.keysig.mode + ' ';
  st += nd.timesig.measure_len + ' ' + nd.timesig.beats_per_measure + ' ';
  for (let v=0; v<nd.voices.length; ++v) {
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (!nt.d) continue;
      let packed = '';
      packed += nt.len;
      packed += nt.startsTie ? 1 : 0;
      packed += nd.get_realAlter(v, n);
      packed += nt.d;
      st += packed + ' ';
    }
  }
  return MD5(st);
}

export function getMusicPacked() {
  let st = '';
  st += nd.keysig.name + nd.keysig.mode + ' ';
  st += nd.timesig.measure_len + ' ' + nd.timesig.beats_per_measure + ' ';
  for (let v=0; v<nd.voices.length; ++v) {
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (!nt.d) continue;
      let packed = '';
      packed += nt.len;
      packed += nt.startsTie ? 1 : 0;
      packed += nd.get_realAlter(v, n);
      packed += nt.d;
      st += packed + ' ';
    }
  }
  return st;
}

export function getCantusHash() {
  let st = '';
  for (let v=0; v<nd.voices.length; ++v) {
    const species = ares.getSpecies(v);
    if (species) continue;
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (!nt.d) continue;
      let packed = '';
      packed += nt.startsTie ? 1 : 0;
      packed += nd.get_realAlter(v, n);
      packed += nt.d;
      st += packed + ' ';
    }
  }
  if (st) return MD5(st);
  else return '';
}

export function getCantusPacked() {
  let st = '';
  for (let v=0; v<nd.voices.length; ++v) {
    const species = ares.getSpecies(v);
    if (species) continue;
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (!nt.d) continue;
      let packed = '';
      packed += nt.startsTie ? 1 : 0;
      packed += nd.get_realAlter(v, n);
      packed += nt.d;
      st += packed + ' ';
    }
  }
  return st;
}

export function getSpeciesPacked() {
  let st = '';
  for (let v=ares.vsp.length - 1; v>=0; --v) {
    const species = ares.vsp[v];
    st += species ? species : "C";
  }
  return st;
}

export function getVocraPacked() {
  let st = '';
  for (let v=ares.vocra.length - 1; v>=0; --v) {
    const vocra = vocra_name[ares.vocra[v]];
    st += vocra[0];
  }
  return st;
}

export function getAnnotationsHash() {
  let st = '';
  for (let v=0; v<nd.voices.length; ++v) {
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (nt.text) st += v + '' + n + nt.text + '~';
      if (nt.lyric) st += v + '' + n + nt.lyric + '~';
    }
  }
  if (st) return MD5(st);
  else return '';
}

export function getAnnotationsPacked() {
  let st = '';
  for (let v=0; v<nd.voices.length; ++v) {
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (nt.text) st += 't|' + v + '|' + n + '|' + nt.text.replace(/\~/g, "∼") + '~';
      if (nt.lyric) st += 'l|' + v + '|' + n + '|' + nt.lyric.replace(/\~/g, "∼") + '~';
    }
  }
  return st;
}

export function getAnnotationsCount() {
  let cnt = 0;
  for (let v=0; v<nd.voices.length; ++v) {
    const vc = nd.voices[v];
    for (let n = 0; n < vc.notes.length; ++n) {
      const nt = vc.notes[n];
      if (nt.text) cnt++;
      if (nt.lyric) cnt++;
    }
  }
  return cnt;
}

export function getPublishedModeName() {
  if (ares.mode != null) {
    return modeName(nd.keysig.fifths, ares.mode);
  } else {
    return modeName(nd.keysig.fifths, nd.keysig.mode);
  }
}
