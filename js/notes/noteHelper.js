import {keysigs} from "../ui/modal/keysig.js";

let abc_d = {c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6};
let d_abc = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
export let d_ABC = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Middle C or C4: 60 in MIDI (c), 35 in diatonic (d), starts octave 4 in MusicXml, "C" in ABC notation, https://en.wikipedia.org/wiki/C_(musical_note)
// on -1 line in treble clef, on +1 line in bass clef, 60 in js (c), 48 in CA3 (c)

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
  return d + 42;
}

export function d2abc(d) {
  if (!d) return 'z';
  let st;
  if (d >= 42) st = d_abc[d % 7];
  else st = d_abc[d % 7].toUpperCase();
  for (let o=49; o<=d; o += 7) {
    st += "'";
  }
  for (let o=34; o>=d; o -= 7) {
    st += ",";
  }
  return st;
}

const dia_to_chrom = [ 0, 2, 4, 5, 7, 9, 11 ];
const chrom_to_dia = [ 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6 ];

export function d2c(d) {
  return dia_to_chrom[d % 7] + (Math.floor(d / 7) - 1) * 12;
}

export function c2d(c) {
  return chrom_to_dia[(c + 12) % 12] + Math.floor((c + 12) / 12) * 7;
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

export let fifths2keysig = {
  '7': 'C#', '6': 'F#', '5': 'B', '4': 'E', '3': 'A', '2': 'D', '1': 'G', '0': 'C',
  '-1': 'F', '-2': 'Bb', '-3': 'Eb', '-4': 'Ab', '-5': 'Db', '-6': 'Gb', '-7': 'Cb'
};

export function d2name(d, alter) {
  if (!d) return 'rest';
  return d_ABC[d % 7] + alter2name(alter);
}

function alter2name(alter) {
  if (alter === -2) return "bb";
  if (alter === -1) return "b";
  if (alter === 1) return "#";
  if (alter === 2) return "x";
  return "";
}

export function modeName(fifths, mode) {
  for (const name in keysigs) {
    if (keysigs[name].fifths === fifths && keysigs[name].mode === mode)
      return fullModeName(keysigs[name]);
  }
}

function fullModeName(keysig) {
  let st = keysig.name;
  if (keysig.mode === 0) st += ' major';
  if (st.endsWith('m')) st = st.slice(0, -1) + ' minor';
  st = st.replace('mix', 'mixolydian');
  st = st.replace('lyd', 'lydian');
  st = st.replace('loc', 'locrian');
  st = st.replace('dor', 'dorian');
  st = st.replace('phr', 'phrygian');
  st = st.replace('mix', 'mixolydian');
  return st;
}
