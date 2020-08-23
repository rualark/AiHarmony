import {MusicXmlParser} from "./MusicXmlParser.js";
import {nd, supportedNoteLen} from "../notes/NotesData.js";
import {timesigs} from "../ui/modal/timesig.js";
import {getBestClef} from "../notes/bestClef.js";
import {d2c} from "../notes/noteHelper.js";
import {storage2state, url2state, storage2archiveStorage} from "../state/state.js";
import {async_redraw, selected} from "../abc/abchelper.js";
import {saveState} from "../state/history.js";
import {start_counter} from "../core/time.js";
import {name2filename} from "../core/string.js";

export let xmlLoadWarnings = new Set();

function decodeSpeciesHints() {
  for (const vc of nd.voices) {
    for (const nt of vc.notes) {
      if (!nt.text) continue;
      let species;
      if (nt.text.toLowerCase() === '[c.f.]') species = 0;
      else if (nt.text.toLowerCase() === '[sp1]') species = 1;
      else if (nt.text.toLowerCase() === '[sp2]') species = 2;
      else if (nt.text.toLowerCase() === '[sp3]') species = 3;
      else if (nt.text.toLowerCase() === '[sp4]') species = 4;
      else if (nt.text.toLowerCase() === '[sp5]') species = 5;
      if (species != null) {
        nt.text = '';
        vc.species = species;
      }
    }
  }
  for (const vc of nd.voices) {
    for (const nt of vc.notes) {
      if (!nt.lyric) continue;
      let species;
      if (nt.lyric.toLowerCase() === '[c.f.]') species = 0;
      else if (nt.lyric.toLowerCase() === '[sp1]') species = 1;
      else if (nt.lyric.toLowerCase() === '[sp2]') species = 2;
      else if (nt.lyric.toLowerCase() === '[sp3]') species = 3;
      else if (nt.lyric.toLowerCase() === '[sp4]') species = 4;
      else if (nt.lyric.toLowerCase() === '[sp5]') species = 5;
      if (species != null) {
        nt.lyric = '';
        vc.species = species;
      }
    }
  }
}

export function readMusicXml(xml, filename) {
  try {
    start_counter('musicXmlToData');
    nd.reset();
    let error = musicXmlToData(xml);
    decodeSpeciesHints();
    //stop_counter();
    if (error) {
      throw error;
    } else if (xmlLoadWarnings.size) {
      alertify.notify([...xmlLoadWarnings].join('<br>'), 'custom', 10);
    }
    if (filename) {
      if (filename.endsWith('.xml')) {
        nd.set_fileName(filename.slice(0, -4));
      } else {
        nd.set_fileName(filename);
      }
    }
    else {
      nd.set_fileName(name2filename(nd.name));
    }
    if (!nd.name) nd.set_name(nd.fileName);
    selected.note = {voice: 0, note: 0};
    saveState(true);
  } catch (e) {
    storage2state();
    alertify.alert('Error loading MusicXML', e.toString());
  }
  async_redraw();
}

export function musicXmlToData(txt) {
  storage2archiveStorage(2);
  xmlLoadWarnings.clear();
  let mxp = new MusicXmlParser(txt);
  if (mxp.urlState != null && mxp.urlState.length > 0 && mxp.urlState.startsWith('AIHS:')) {
    try {
      url2state(mxp.urlState.substr(5));
      console.log('Detected and successfully read encoded state from XML file');
      return;
    }
    catch (e) {
      console.log('Cannot read encoded state from XML file. Falling back to importing XML file tags:', e);
    }
  }
  //for (let i=0; i<40; ++i) console.log(i, mxp.sliceLen(i));
  let error = checkImportableMusicXml(mxp);
  if (error) return error;
  if (!mxp.voices.length) return "No notes detected in MusicXML";
  importWorkTitle(mxp);
  nd.timesig.beats_per_measure = mxp.mea[1].beats_per_measure;
  nd.timesig.beat_type = mxp.mea[1].beat_type;
  nd.timesig.measure_len = mxp.mea[1].measure_len * 16;
  nd.voices = [];
  let ki;
  //console.log(mxp);
  for (const vi in mxp.notes) {
    nd.voices.push({
      name: mxp.voices[vi].name,
      notes: [],
      species: 10
    });
    nd.keysig.fifths = null;
    nd.keysig.mode = 13;
    nd.voices[vi].notes = [];
    let ncount = 0;
    let s = 0;
    for (let m=1; m<mxp.notes[vi].length; ++m) {
      if (
        nd.timesig.beats_per_measure !== mxp.mea[m].beats_per_measure ||
        nd.timesig.beat_type !== mxp.mea[m].beat_type ||
        nd.timesig.measure_len !== mxp.mea[m].measure_len * 16
      ) {
        xmlLoadWarnings.add(`Time signature changes in MusicXml at measure ${m}: ignoring rest of file`);
        break;
      }
      for (const ni in mxp.notes[vi][m]) {
        let note = mxp.notes[vi][m][ni];
        if (note.fifths !== 100) {
          if (nd.keysig.fifths == null) {
            nd.build_keysig(note.fifths, 13);
            ki = nd.keysig.imprint;
            //console.log(note.fifths, fifths2keysig[note.fifths]);
          } else if (nd.keysig.fifths !== note.fifths) {
            xmlLoadWarnings.add("Key signature changes in MusicXml: ignoring");
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
            xmlLoadWarnings.add("Clef changes in MusicXml: ignoring");
          }
        }
        let nt;
        let len = Math.floor(note.dur * 4 / note.dur_div);
        if (note.rest) {
          nt = {
            d: 0,
            len: len,
            step: s,
            startsTie: false
          };
        } else {
          ++ncount;
          if (!ki) {
            return mxp.getErrPrefix(vi, m, ni) + ` Key signature should be specified before note`;
          }
          //accidental2alter(note.accidental)
          nt = {
            d: note.d,
            alter: note.alter === ki[note.d % 7] && !note.accidental ? 10 : note.alter,
            len: len,
            step: s,
            startsTie: note.tie_start
          };
        }
        s += len;
        nt.text = note.words;
        nt.lyric = note.lyric;
        nd.voices[vi].notes.push(nt);
      }
    }
    if (nd.voices[vi].clef == null) {
      return mxp.getErrPrefix(vi) + ` No clef specified in MusicXml for voice (${ncount} notes)`;
    }
  }
  if (nd.keysig.fifths == null) {
    return "No key signature found in MusicXml";
  }
}

function importWorkTitle(mxp) {
  nd.set_name(mxp.work_title);
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
  //console.log(mxp);
  if (mxp.error) return mxp.error;
  if (mxp.mea.length < 2) return "No measures detected in MusicXML";
  let error = checkSupportedTimesig(mxp);
  if (error) return error;
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
