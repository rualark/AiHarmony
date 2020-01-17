let abc_d = {c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6};
let d_abc = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

// https://i.imgur.com/86u2JM2.png
export function keysig_imprint(fifths) {
  let imprint = [];
  for (let d=0; d<7; ++d) imprint.push(0);
  for (let f=1; f<=fifths; ++f) {
    imprint[(76 + f * 4) % 7] = 1;
  }
  for (let f=fifths; f<0; ++f) {
    imprint[(76 + (f + 1) * 4) % 7] = -1;
  }
  return imprint;
}

export function abc2d(st) {
  if (st === 'z') return 0;
  let lc = st[0].toLowerCase();
  let d = abc_d[lc];
  if (st[0] !== lc) d -= 7;
  d += 7 * (st.split("'").length - 1);
  d -= 7 * (st.split(",").length - 1);
  return d + 35;
}

export function d2abc(d) {
  if (!d) return 'z';
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

export function alter2abc(alter) {
  if (alter === 0) return '=';
  if (alter === 10) return '';
  if (alter === 1) return '^';
  if (alter === -1) return '_';
  if (alter === 2) return '^^';
  if (alter === -2) return '__';
}

export function abc2alter(abc) {
  if (abc === '') return 10;
  if (abc === '=') return 0;
  if (abc === '^') return 1;
  if (abc === '_') return -1;
  if (abc === '^^') return 2;
  if (abc === '__') return -2;
}
