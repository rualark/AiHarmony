import {nd} from "../notes/NotesData.js";
import { ares, vocra_name } from "../analysis/AnalysisResults.js";
import { MD5 } from "../core/string.js";
import { modeName } from "./noteHelper.js";
import { settings } from "../state/settings.js";

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

export function getMistakesPacked() {
  let st = '';
  let mistakes = {};
  for (let v=ares.flag.length - 1; v>=0; --v) {
    for (const s in ares.flag[v]) {
      for (const f in ares.flag[v][s]) {
        let fla = ares.flag[v][s][f];
        if (fla.accept !== 0) continue;
        if (fla.severity < settings.show_min_severity) continue;
        let ruleName = fla.name;
        if (ruleName.includes(":")) {
          ruleName = ruleName.slice(0, ruleName.indexOf(':'));
        }
        const name = fla.class + ': ' + ruleName;
        const key = name + fla.fl + fla.severity;
        if (key in mistakes) {
          mistakes[key].count += 1;
        } else {
          mistakes[key] = {
            name: name,
            rid: fla.fl,
            severity: fla.severity,
            count: 1,
          };
        }
      }
    }
  }
  for (const key in mistakes) {
    const mistake = mistakes[key];
    st += `${mistake.rid}|${mistake.severity}|${mistake.count}|${mistake.name}~`;
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
