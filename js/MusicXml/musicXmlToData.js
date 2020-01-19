import {MusicXmlParser} from "./MusicXmlParser.js";
import {nd, supportedNoteLen} from "../notes/NotesData.js";
import {timesigs} from "../ui/modal/timesig.js";
import {getBestClef} from "../notes/bestClef.js";
import {d2c, keysig_imprint} from "../notes/notehelper.js";

export let xmlLoadWarnings = new Set();

let keysigMusicXml2Abc = {
  '7': 'C#', '6': 'F#', '5': 'B', '4': 'E', '3': 'A', '2': 'D', '1': 'G', '0': 'C',
  '-1': 'F', '-2': 'Bb', '-3': 'Eb', '-4': 'Ab', '-5': 'Db', '-6': 'Gb', '-7': 'Cb'
};

export function musicXmlToData(txt) {
  let mxp = new MusicXmlParser(txt);
  //for (let i=0; i<40; ++i) console.log(i, mxp.sliceLen(i));
  let error = checkImportableMusicXml(mxp);
  if (error) return error;
  importWorkTitle(mxp);
  nd.timesig.beats_per_measure = mxp.mea[1].beats_per_measure;
  nd.timesig.beat_type = mxp.mea[1].beat_type;
  nd.timesig.measure_len = mxp.mea[1].measure_len * 16;
  nd.voices = [];
  let ki;
  for (const vi in mxp.notes) {
    nd.voices.push({
      name: mxp.voices[vi].name,
      notes: []
    });
    nd.keysig.fifths = null;
    nd.voices[vi].notes = [];
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      if (nd.timesig.beats_per_measure !== mxp.mea[m].beats_per_measure) {
        return "Time signature changes in MusicXml: cannot load";
      }
      if (nd.timesig.beat_type !== mxp.mea[m].beat_type) {
        return "Time signature changes in MusicXml: cannot load";
      }
      if (nd.timesig.measure_len !== mxp.mea[m].measure_len * 16) {
        return "Time signature changes in MusicXml: cannot load";
      }
      for (const ni in mxp.notes[vi][m]) {
        let note = mxp.notes[vi][m][ni];
        if (note.fifths !== 100) {
          if (nd.keysig.fifths == null) {
            nd.keysig.fifths = note.fifths;
            nd.keysig.name = keysigMusicXml2Abc[note.fifths];
            ki = keysig_imprint(nd.keysig.fifths);
            //console.log(note.fifths, keysigMusicXml2Abc[note.fifths]);
          } else if (nd.keysig.fifths !== note.fifths) {
            xmlLoadWarnings.add("Key signature changes is MusicXml: ignoring");
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
            xmlLoadWarnings.add("Clef changes is MusicXml: ignoring");
          }
        }
        if (note.rest) {
          nd.voices[vi].notes.push({
            d: 0,
            len: Math.floor(note.dur * 4 / note.dur_div),
            startsTie: false
          });
        } else {
          if (!ki) {
            return mxp.getErrPrefix(vi, m, ni) + ` Key signature should be specified before note`;
          }
          //accidental2alter(note.accidental)
          nd.voices[vi].notes.push({
            d: note.d,
            alter: note.alter === ki[note.d % 7] && !note.accidental ? 10 : note.alter,
            len: Math.floor(note.dur * 4 / note.dur_div),
            startsTie: note.tie_start
          });
        }
      }
    }
    if (nd.voices[vi].clef == null) {
      return "No clef specified in MusicXml for voice " + vi;
    }
  }
  if (nd.keysig.fifths == null) {
    return "No key signature found in MusicXml";
  }
}

function importWorkTitle(mxp) {
  nd.name = mxp.work_title;
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
  if (sign === 'G' && line === 2 && oct === 0) return 'treble';
  if (sign === 'G' && line === 2 && oct === 1) return 'treble+8';
  if (sign === 'G' && line === 2 && oct === -1) return 'treble-8';
  if (sign === 'F' && line === 4 && oct === 0) return 'bass';
  if (sign === 'F' && line === 4 && oct === 1) return 'bass+8';
  if (sign === 'F' && line === 4 && oct === -1) return 'bass-8';
  if (sign === 'C' && line === 3) return 'alto';
  if (sign === 'C' && line === 4) return 'tenor';
  xmlLoadWarnings.add("Unknown clef " + sign + "/" + line + "/" + oct + ": choosing best clef automatically");
  return getBestClefForVoice(voice);
}

function checkSupportedTimesig(mxp) {
  let found = 0;
  for (const timesig of timesigs) {
    if (timesig.beats_per_measure !== mxp.mea[1].beats_per_measure) continue;
    if (timesig.beat_type !== mxp.mea[1].beat_type) continue;
    if (timesig.measure_len !== mxp.mea[1].measure_len * 16) {
      xmlLoadWarnings.add(
        "Measure length in MusicXml (" + mxp.mea[1].measure_len +
        ") seems wrong for time signature " + mxp.mea[1].beats_per_measure +
        "/" + mxp.mea[1].beat_type);
    }
    found = 1;
  }
  if (mxp.mea[1].beat_type * mxp.mea[1].beats_per_measure * mxp.mea[1].measure_len === 0) {
    return "Unsupported time signature in MusicXml: " + mxp.mea[1].beats_per_measure +
      "/" + mxp.mea[1].beat_type + ": " + mxp.mea[1].measure_len;
  }
  if (!found) {
    xmlLoadWarnings.add(
      "Unsupported time signature in MusicXml: " + mxp.mea[1].beats_per_measure +
      "/" + mxp.mea[1].beat_type);
  }
}

function checkImportableMusicXml(mxp) {
  if (mxp.error) return mxp.error;
  mxp.validateMusicXml();
  if (mxp.error) return mxp.error;
  if (mxp.mea.length < 2) return "No measures detected in MusicXML";
  let error = checkSupportedTimesig(mxp);
  if (error) return error;
  console.log(mxp);
  //console.log(mxp.mea, mxp.voices, mxp.notes);
  for (const vi in mxp.notes) {
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      for (const ni in mxp.notes[vi][m]) {
        let note = mxp.notes[vi][m][ni];
        if (!supportedNoteLen.has(note.dur * 4 / note.dur_div)) {
          return mxp.getErrPrefix(vi, m, ni) + " Unsupported note duration: " + note.dur + '/' + note.dur_div;
        }
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

