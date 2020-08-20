import {clefs} from "../ui/modal/clefs.js";
import {nd} from "../notes/NotesData.js";
import {alter2abc, d2abc} from "../notes/noteHelper.js";
import {ares} from "../analysis/AnalysisResults.js";
import { settings } from "../state/settings.js";

export function dataToAbc(instrument) {
  let mlen = nd.timesig.measure_len;
  let abc = '';
  abc += '%%barnumbers 1\n';
  abc += `Q:1/4=${nd.tempo}\n`;
  abc += 'M:' + nd.timesig.beats_per_measure + '/' + nd.timesig.beat_type + '\n';
  abc += 'K:' + nd.keysig.name + '\n';
  abc += 'L:1/16\n';
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    let name = vc.name;
    if (nd.algo === 'CA3') {
      let vocra = ares.getVocra(v);
      let spec = ares.getSpecies(v);
      if (vocra != null && vc.name.slice(0, 3).toLowerCase() !== vocra.slice(0, 3).toLowerCase()) name += `\\n[${vocra}]`;
      if (spec != null && ares.av_cnt > 1) {
        if (spec === 0) {
          name += `\\n(c.f.)`;
        }
        else {
          name += `\\n(sp. ${spec})`;
        }
      }
    }
    if (instrument) name = instrument + '# ' + name;
    abc += `V: V${v} clef=${vc.clef} name="${name}"\n`;
  }
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    abc += `[V: V${v}]`;
    let s = 0;
    let old_m = 0;
    let altmap = {};
    let prev_altmap = {};
    for (let n=0; n<vc.notes.length; ++n) {
      let m = Math.floor(s / mlen);
      if (m != old_m) {
        old_m = m;
        prev_altmap = altmap;
        altmap = {};
      }
      let nt = vc.notes[n];
      nd.abc_charStarts[abc.length] = {voice: v, note: n};
      nt.abc_charStarts = abc.length;
      if (nt.d && settings.show_nht && nd.algo === 'CA3') {
        const msh = ares.getMsh(v, s);
        if (msh < 0) abc += `"^ø"`;
      }
      let flags = ares.getFlagsInInterval(v, s, s + nt.len);
      if (flags.red > 0) abc += '"^!"';
      else if (flags.yellow > 0) abc += '"^?"';
      if (ares.harm != null && s in ares.harm && ares.vid != null && v === ares.vid[0]) {
        let harm_st = '';
        for (let s2 = 0; s2 < nt.len; ++s2) {
          if (!((s + s2) in ares.harm)) continue;
          if (harm_st !== '') {
            harm_st += ', ';
          }
          harm_st += ares.harm[s + s2];
        }
        abc += `"_${harm_st}"`;
      }
      if (nt.text) {
        let ta = nt.text.split('\n');
        for (const text of ta) {
          abc += `"^${text}"`;
        }
      }
      if (nt.lyric) {
        let la = nt.lyric.split('\n');
        for (const lyric of la) {
          abc += `"_${lyric}"`;
        }
      }
      let d = nt.d;
      let dc = nt.d % 7;
      if (d) {
        let show_alter = nt.alter;
        if (nt.alter == 10) {
          if (!(d in altmap)) {
            // First unaltered
            if (d in prev_altmap && prev_altmap[d] != nt.alter && prev_altmap[d] != nd.keysig.imprint[dc]) {
              // First unaltered after alter in previous measure
              show_alter = nd.keysig.imprint[dc];
            }
          } else if (nt.alter != altmap[d]) {
            // Changed to unaltered
            show_alter = nd.keysig.imprint[dc];
          }
        } else {
          if (d in altmap && nt.alter == altmap[d]) {
            // Same altered
            show_alter = 10;
          }
        }
        altmap[d] = nt.alter;
        let abc_note = d2abc(d - clefs[vc.clef].transpose);
        abc += alter2abc(show_alter) + abc_note + nt.len;
      } else {
        abc += 'z' + nt.len;
      }
      s += nt.len;
      if (nt.startsTie && n < vc.notes.length - 1 && vc.notes[n + 1].d) {
        abc += '-';
      }
      nt.abc_charEnds = abc.length;
      if (s % nd.timesig.measure_len === 0) {
        abc += '|';
      }
    }
    abc += '\n';
  }
  return abc;
}
