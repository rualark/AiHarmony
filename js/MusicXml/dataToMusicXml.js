import {nd} from "../notes/NotesData.js";
import {keysig_imprint} from "../notes/notehelper.js";
import {state2url} from "../state/state.js";

export let xmlExportWarnings = new Set();

export function dataToMusicXml(date) {
  let st = '';
  if (date == null) date = new Date().yyyymmdd('-');
  xmlExportWarnings.clear();
  st += `<?xml version="1.0" encoding='UTF-8' standalone='no' ?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.0">
 <work>
  <work-title>${nd.name}</work-title>
 </work>
 <identification>
  <creator type="composer"></creator>
  <creator type="arranger"></creator>
  <rights></rights>
  <encoding>
   <encoding-date>${date}</encoding-date>
   <encoder></encoder>
   <software>Artinfuser Harmony</software>
   <software>AIHS:${state2url()}</software>
   <encoding-description>Artinfuser Harmony / MusicXML 3.0</encoding-description>
   <supports element="print" type="yes" value="yes" attribute="new-system" />
   <supports element="print" type="yes" value="yes" attribute="new-page" />
   <supports element="accidental" type="yes" />
   <supports element="beam" type="yes" />
   <supports element="stem" type="yes" />
  </encoding>
 </identification>
 <defaults>
  <scaling>
   <millimeters>215.9</millimeters>
   <tenths>1233</tenths>
  </scaling>
  <page-layout>
   <page-height>1596</page-height>
   <page-width>1233</page-width>
   <page-margins type="both">
    <left-margin>85</left-margin>
    <right-margin>85</right-margin>
    <top-margin>85</top-margin>
    <bottom-margin>85</bottom-margin>
   </page-margins>
  </page-layout>
  <system-layout>
   <system-margins>
    <left-margin>67</left-margin>
    <right-margin>0</right-margin>
   </system-margins>
   <system-distance>92</system-distance>
  </system-layout>
  <appearance>
   <line-width type="stem">0.9375</line-width>
   <line-width type="beam">5</line-width>
   <line-width type="staff">0.9375</line-width>
   <line-width type="light barline">1.5625</line-width>
   <line-width type="heavy barline">5</line-width>
   <line-width type="leger">1.5625</line-width>
   <line-width type="ending">1.5625</line-width>
   <line-width type="wedge">1.25</line-width>
   <line-width type="enclosure">0.9375</line-width>
   <line-width type="tuplet bracket">1.25</line-width>
   <line-width type="bracket">5</line-width>
   <line-width type="dashes">1.5625</line-width>
   <line-width type="extend">0.9375</line-width>
   <line-width type="octave shift">1.5625</line-width>
   <line-width type="pedal">1.5625</line-width>
   <line-width type="slur middle">1.5625</line-width>
   <line-width type="slur tip">0.625</line-width>
   <line-width type="tie middle">1.5625</line-width>
   <line-width type="tie tip">0.625</line-width>
   <note-size type="cue">75</note-size>
   <note-size type="grace">60</note-size>
  </appearance>
  <music-font font-family="Opus Std" font-size="19.8425" />
  <lyric-font font-family="Plantin MT Std" font-size="11.4715" />
  <lyric-language xml:lang="en" />
 </defaults>
\n`;
  st += ' <part-list>\n';
  for (const v in nd.voices) {
    st += `  <score-part id="P${v}">
   <part-name>${nd.voices[v].name}</part-name>
   <part-name-display>
    <display-text>${nd.voices[v].name}</display-text>
   </part-name-display>
   <part-abbreviation>${nd.voices[v].name}</part-abbreviation>
   <part-abbreviation-display>
    <display-text>${nd.voices[v].name}</display-text>
   </part-abbreviation-display>
  </score-part>\n`;
  }
  let ki = keysig_imprint(nd.keysig.fifths);
  st += ' </part-list>\n';
  for (const v in nd.voices) {
    st += ` <part id="P${v}">\n`;
    let s = 0;
    for (const n in nd.voices[v].notes) {
      let note = nd.voices[v].notes[n];
      if (s % nd.timesig.measure_len === 0) {
        if (s) {
          st += '  </measure>\n';
        }
        let xmlClef = clefAbc2MusicXml(nd.voices[v].clef);
        st += `  <measure number="${Math.floor(s / nd.timesig.measure_len) + 1}">\n`;
        if (!s) {
          st += `   <attributes>\n`;
          st += `    <divisions>256</divisions>\n`;
          st += `    <key color="#000000">\n`;
          st += `     <fifths>${nd.keysig.fifths}</fifths>\n`;
          st += `     <mode>major</mode>\n`;
          st += `    </key>\n`;
          st += `    <time color="#000000">\n`;
          st += `     <beats>${nd.timesig.beats_per_measure}</beats>\n`;
          st += `     <beat-type>${nd.timesig.beat_type}</beat-type>\n`;
          st += `    </time>\n`;
          st += `    <staves>1</staves>\n`;
          st += `    <clef number="1" color="#000000">\n`;
          st += `     <sign>${xmlClef.sign}</sign>\n`;
          st += `     <line>${xmlClef.line}</line>\n`;
          st += `     <clef-octave-change>${xmlClef.oct}</clef-octave-change>\n`;
          st += `    </clef>\n`;
          st += `    <staff-details number="1" print-object="yes" />\n`;
          st += `   </attributes>\n`;
        } else {
          st += `   <attributes />\n`;
        }
      }
      st += `   <note color="#000000">\n`;
      if (note.d) {
        st += `    <pitch>\n`;
        st += `     <step>${d2name(note.d % 7)}</step>\n`;
        let real_alter = note.alter === 10 ? ki[note.d % 7] : note.alter;
        if (real_alter) {
          st += `     <alter>${real_alter}</alter>\n`;
        }
        st += `     <octave>${Math.floor(note.d / 7) - 1}</octave>\n`;
        st += `    </pitch>\n`;
      } else {
        st += `    <rest />\n`;
      }
      st += `    <duration>${Math.floor(note.len * 256 / 4)}</duration>\n`;
      if (note.d) {
        //console.log('Pre-startsTie', n, n > 0, nd.voices[v].notes[n]);
        if (n > 0 && nd.voices[v].notes[n - 1].startsTie) {
          st += `    <tie type="stop" />\n`;
        }
        if (note.startsTie) {
          st += `    <tie type="start" />\n`;
        }
      }
      st += `    <voice>1</voice>\n`;
      st += `    <type>${len2type(note.len)}</type>\n`;
      if (note.len % 3 === 0) {
        st += `    <dot />\n`;
      }
      if (note.d) {
        if (note.alter !== 10) {
          st += `    <accidental>${alter2accidental(note.alter)}</accidental>\n`;
        }
      }
      st += `    <staff>1</staff>\n`;
      if (note.d) {
        if (note.startsTie || (n > 0 && nd.voices[v].notes[n - 1].startsTie)) {
          st += `    <notations>\n`;
          if (n > 0 && nd.voices[v].notes[n - 1].startsTie) {
            st += `     <tied type="stop" />\n`;
          }
          if (note.startsTie) {
            st += `     <tied type="start" />\n`;
          }
          st += `    </notations>\n`;
        }
      }
      st += `   </note>\n`;
      s += note.len;
    }
    st += `  </measure>\n`;
    st += ` </part>\n`;
  }
  st += `</score-partwise>\n`;
  return st;
}

function alter2accidental(alt) {
  if (alt === 0) return 'natural';
  if (alt === -1) return 'flat';
  if (alt === 1) return 'sharp';
  if (alt === -2) return 'flat-flat';
  if (alt === 2) return 'double-sharp';
  return 10;
}

function len2type(len) {
  if (len === 1) return '16th';
  if (len === 2 || len === 3) return 'eighth';
  if (len === 4 || len === 6) return 'quarter';
  if (len === 8 || len === 12) return 'half';
  if (len === 16 || len === 24) return 'whole';
}

function clefAbc2MusicXml(clef) {
  if (clef === 'treble') return {sign: 'G', line: 2, oct: 0};
  if (clef === 'treble+8') return {sign: 'G', line: 2, oct: 1};
  if (clef === 'treble-8') return {sign: 'G', line: 2, oct: -1};
  if (clef === 'bass') return {sign: 'F', line: 4, oct: 0};
  if (clef === 'bass+8') return {sign: 'F', line: 4, oct: 1};
  if (clef === 'bass-8') return {sign: 'F', line: 4, oct: -1};
  if (clef === 'alto') return {sign: 'C', line: 3, oct: 0};
  if (clef === 'tenor') return {sign: 'C', line: 4, oct: 0};
  xmlExportWarnings.add("Cannot export clef " + clef);
  return {sign: 'G', line: 2, oct: -1};
}

function d2name(d) {
  if (d === 0) return 'C';
  if (d === 1) return 'D';
  if (d === 2) return 'E';
  if (d === 3) return 'F';
  if (d === 4) return 'G';
  if (d === 5) return 'A';
  if (d === 6) return 'B';
  throw("Cannot parse pitch " + d);
}

