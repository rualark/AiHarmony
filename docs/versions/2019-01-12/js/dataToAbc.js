export function dataToAbc(nd) {
  let abc = '';
  abc += '%%barnumbers 1\n';
  abc += 'M:' + nd.time.beats_per_measure + '/' + nd.time.beat_type + '\n';
  abc += 'K:C\n';
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
      abc += nt.abc_alter + nt.abc_note + nt.len;
      s += nt.len;
      if (nt.startsTie) abc += '-';
      nt.abc_charEnds = abc.length;
      if (s % nd.time.measure_len === 0) {
        abc += '|';
      }
    }
    abc += '\n';
  }
  console.log(abc);
  return abc;
}

let abc_d = {c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6};
let d_abc = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

export function abc2d(st) {
  let lc = st[0].toLowerCase();
  let d = abc_d[lc];
  if (st[0] !== lc) d -= 7;
  d += 7 * (st.split("'").length - 1);
  d -= 7 * (st.split(",").length - 1);
  return d + 35;
}

export function d2abc(d) {
  let oct = d / 7;
  let st;
  if (d > 34) st = d_abc[d % 7];
  else st = d_abc[d % 7].toUpperCase();
  for (let o=42; o<=d; o += 7) {
    st += "'";
  }
  for (let o=27; o>=d; o -= 7) {
    st += ",";
  }
  return st;
}
