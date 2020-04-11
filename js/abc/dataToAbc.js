import {clefs} from "../ui/modal/clefs.js";
import {nd} from "../notes/NotesData.js";
import {alter2abc, d2abc} from "../notes/noteHelper.js";
import {ares} from "../analysis/AnalysisResults.js";

export function dataToAbc() {
  let abc = '';
  abc += '%%barnumbers 1\n';
  abc += 'M:' + nd.timesig.beats_per_measure + '/' + nd.timesig.beat_type + '\n';
  abc += 'K:' + nd.keysig.name + '\n';
  abc += 'L:1/16\n';
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    let name = vc.name;
    let vocra = ares.getVocra(v);
    let spec = ares.getSpecies(v);
    if (vocra != null) name += ` [${vocra}]`;
    if (spec != null && ares.av_cnt > 1) {
      if (spec === 0) {
        name += ` (c.f.)`;
      }
      else {
        name += ` (sp. ${spec})`;
      }
    }
    abc += `V: V${v} clef=${vc.clef} name="${name}"\n`;
  }
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    abc += `[V: V${v}]`;
    let s = 0;
    for (let n=0; n<vc.notes.length; ++n) {
      let nt = vc.notes[n];
      nt.step = s;
      nd.abc_charStarts[abc.length] = {voice: v, note: n};
      nt.abc_charStarts = abc.length;
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
        abc += `"^${nt.text}"`;
      }
      if (nt.lyric) {
        abc += `"_${nt.lyric}"`;
      }
      let d = nt.d;
      if (d) {
        let abc_note = d2abc(d - clefs[vc.clef].transpose);
        abc += alter2abc(nt.alter) + abc_note + nt.len;
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
