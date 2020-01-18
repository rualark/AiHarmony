import {test_xml_string} from "./test-xml.js";
import {MusicXmlParser} from "./MusicXmlParser.js";
import {nd} from "./NotesData.js";
import {timesigs} from "./timesig.js";
import {getBestClef} from "./bestClef.js";
import {d2c} from "./notehelper.js";

export let warnings = new Set();

let keysigMusicXml2Abc = {
  '7': 'C#', '6': 'F#', '5': 'B', '4': 'E', '3': 'A', '2': 'D', '1': 'G', '0': 'C',
  '-1': 'F', '-2': 'Bb', '-3': 'Eb', '-4': 'Ab', '-5': 'Db', '-6': 'Gb', '-7': 'Cb'
};

export function musicXmlToData(txt) {
  let mxp = new MusicXmlParser(txt);
  let error = checkImportableMusicXml(mxp);
  if (error) return error;
  nd.timesig.beats_per_measure = mxp.mea[1].beats_per_measure;
  nd.timesig.beat_type = mxp.mea[1].beat_type;
  nd.timesig.measure_len = mxp.mea[1].measure_len * 16;
  nd.voices = [];
  for (const vi in mxp.notes) {
    nd.voices.push({
      name: mxp.voices[vi].name,
      notes: []
    });
    nd.keysig.fifths = null;
    nd.voices[vi].notes = [];
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      if (nd.timesig.beats_per_measure !== mxp.mea[m].beats_per_measure) {
        warnings.add("Time signature changes is MusicXml: ignoring");
      }
      if (nd.timesig.beat_type !== mxp.mea[m].beat_type) {
        warnings.add("Time signature changes is MusicXml: ignoring");
      }
      if (nd.timesig.measure_len !== mxp.mea[m].measure_len) {
        warnings.add("Time signature changes is MusicXml: ignoring");
      }
      for (const ni in mxp.notes[vi][m]) {
        let note = mxp.notes[vi][m][ni];
        if (note.fifths !== 100) {
          if (nd.keysig.fifths == null) {
            nd.keysig.fifths = note.fifths;
            nd.keysig.name = keysigMusicXml2Abc[note.fifths];
            //console.log(note.fifths, keysigMusicXml2Abc[note.fifths]);
          } else if (nd.keysig.fifths !== note.fifths) {
            warnings.add("Key signature changes is MusicXml: ignoring");
          }
        }
        if (note.clef_line) {
          if (nd.voices[vi].clef == null) {
            nd.voices[vi].clef = clefMusicXml2Abc(note.clef_sign, note.clef_line, note.clef_octave_change, mxp.notes[vi]);
            nd.voices[vi].clef_sign = note.clef_sign;
            nd.voices[vi].clef_line = note.clef_line;
            nd.voices[vi].clef_octave_change = note.clef_octave_change;
          } else if (
            nd.voices[vi].clef_sign !== note.clef_sign ||
            nd.voices[vi].clef_line !== note.clef_line ||
            nd.voices[vi].clef_octave_change !== note.clef_octave_change
          ) {
            warnings.add("Clef changes is MusicXml: ignoring");
          }
        }
        nd.voices[vi].notes.push({
          d: note.d,
          alter: accidental2alter(note.accidental),
          len: note.dur * 4 / note.dur_div,
          startsTie: note.tie_start
        });
      }
    }
  }
}

function accidental2alter(st) {
  if (st === 'natural') return 0;
  if (st === 'flat') return -1;
  if (st === 'sharp') return 1;
  if (st === 'flat-flat') return -2;
  if (st === 'double-sharp') return 2;
  return 10;
}

function clefMusicXml2Abc(sign, line, oct, voice) {
  //console.log(sign, line, oct);
  if (line === 2 && oct === 0) return 'treble';
  if (line === 2 && oct === 1) return 'treble+8';
  if (line === 2 && oct === -1) return 'treble-8';
  if (line === 4 && oct === 0) return 'bass';
  if (line === 4 && oct === 1) return 'bass+8';
  if (line === 4 && oct === -1) return 'bass-8';
  if (line === 3) return 'alto';
  warnings.add("Unknown clef " + sign + "/" + line + "/" + oct + ": choosing best clef automatically");
  return getBestClefForVoice(voice);
}

function checkSupportedTimesig(mxp) {
  let found = 0;
  for (const timesig of timesigs) {
    if (timesig.beats_per_measure !== mxp.mea[0].beats_per_measure) continue;
    if (timesig.beat_type !== mxp.mea[0].beat_type) continue;
    if (timesig.measure_len !== mxp.mea[0].measure_len * 16) {
      warnings.add(
        "Measure length in MusicXml (" + mxp.mea[0].measure_len +
        ") seems wrong for time signature " + mxp.mea[0].beats_per_measure +
        "/" + mxp.mea[0].beat_type);
    }
    found = 1;
  }
  if (!found) {
    warnings.add(
      "Unsupported time signature in MusicXml: " + mxp.mea[0].beats_per_measure +
      "/" + mxp.mea[0].beat_type);
  }
}

function checkImportableMusicXml(mxp) {
  if (mxp.error) return mxp.error;
  mxp.validateMusicXml();
  if (mxp.error) return mxp.error;
  if (mxp.mea.length < 2) return "No measures detected in MusicXML";
  checkSupportedTimesig(mxp);
  console.log(mxp.mea, mxp.voices, mxp.notes);
  for (const vi in mxp.notes) {
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      for (const ni in mxp.notes[vi][m]) {
      }
    }
  }
}

function getBestClefForVoice(notes) {
  let dmin = 10000;
  let dmax = 0;
  for (let m=1; m<notes.length; ++m) {
    for (const ni in notes[m]) {
      let note = notes[m][ni];
      if (note.d > dmax) dmax = note.d;
      if (note.d < dmin) dmin = note.d;
    }
  }
  return getBestClef(d2c(dmin), d2c(dmax));
}

function assignBestClefs(mxp) {
  for (const vi in mxp.notes) {
    let dmin = 10000;
    let dmax = 0;
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      for (const ni in mxp.notes[vi][m]) {
        let note = mxp.notes[vi][m][ni];
        if (note.d > dmax) dmax = note.d;
        if (note.d < dmin) dmin = note.d;
      }
    }
    mxp.voices[vi].clef = getBestClef(d2c(dmin), d2c(dmax));
  }
}

let error = musicXmlToData(test_xml_string);
if (error) console.error(error);
if (warnings.length) console.log(warnings);
