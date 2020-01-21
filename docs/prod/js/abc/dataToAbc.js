import {clefs} from "../ui/modal/clefs.js";
import {nd} from "../notes/NotesData.js";
import {alter2abc, d2abc} from "../notes/notehelper.js";

export function dataToAbc() {
  let abc = '';
  abc += '%%barnumbers 1\n';
  abc += 'M:' + nd.timesig.beats_per_measure + '/' + nd.timesig.beat_type + '\n';
  abc += 'K:' + nd.keysig.name + '\n';
  abc += 'L:1/16\n';
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    abc += `V: V${v} clef=${vc.clef} name="${vc.name}"\n`;
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
      let d = nt.d;
      if (d) {
        let abc_note = d2abc(d - clefs[vc.clef].transpose);
        abc += alter2abc(nt.alter) + abc_note + nt.len;
      } else {
        abc += 'z' + nt.len;
      }
      s += nt.len;
      if (nt.startsTie) abc += '-';
      nt.abc_charEnds = abc.length;
      if (s % nd.timesig.measure_len === 0) {
        abc += '|';
      }
    }
    abc += '\n';
  }
  //console.log(abc);
  return abc;
}
