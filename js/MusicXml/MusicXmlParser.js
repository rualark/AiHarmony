import {XmlParser} from "./XmlParser.js";

let emptyMeasure = {
  beats_per_measure: 0,
  beat_type: 0,
  len: 0, // Measure length in whole notes
  barline: '',
};

let emptyVoice = {
  id: 0,
  name: '',
  display: '',
  staff: 0,
  v: 0,
  chord: 0,
  average_pitch: 0
};

let emptyNote = {
  pos: 0, // position inside measure
  d: 0, // diatonic without alteration applied
  c: 0, // chromatic with alteration applied
  dur: 0, // duration
  dur_div: 1, // duration divisions
  clef_sign: "",
  clef_line: 0,
  clef_octave_change: 0,
  alter: 0, // real alteration
  accidental: 0, // printed alteration
  rest: true,
  tie_start: false,
  tie_stop: false,
  grace: false,
  tempo: 0,
  lyric: '',
  words: '',
  fifths: 100,
  mode: 0,
};

export class MusicXmlParser {
  constructor(txt) {
    this.voices = []; // [v]
    this.mea = []; // [m]
    this.notes = []; // [v][m][]

    this.xml = new XmlParser(txt);
    if (this.xml.error) {
      this.error = this.xml.error;
      return;
    }
    this.encoder = this.xml.xpathFirstValue("/score-partwise/identification/encoding/encoder");
    this.encoding_date = this.xml.xpathFirstValue("/score-partwise/identification/encoding/encoding-date");
    this.software = this.xml.xpathFirstValue("/score-partwise/identification/encoding/software");
    this.encoding_description = this.xml.xpathFirstValue("/score-partwise/identification/encoding/encoding-description");
    this.work_title = this.xml.xpathFirstValue("/score-partwise/work/work-title");
    this.composer = this.xml.xpathFirstValue("/score-partwise/identification/creator[@type='composer']");
    this.arranger = this.xml.xpathFirstValue("/score-partwise/identification/creator[@type='arranger']");
    this.rights = this.xml.xpathFirstValue("/score-partwise/identification/rights");
    let elements = this.xml.xpath("/score-partwise/part/measure/*");
    if (!elements) {
      this.error = "Cannot find notes in XML";
      return;
    }
    //console.log(elements);
    let divisions = 2;
    let staff = 0;
    let m_pos = 0;
    let m_pos_prev = 0;
    let chord = 0;
    let max_mea = 1;
    let v = -1;
    let m = -1;
    let vi = -1;
    let part_id = -1;
    let old_m = -1;
    let old_part_id = "";
    let mode = "";
    let fifths = 100;
    let beats_per_measure = 4;
    let dur_prev = 256;
    let beat_type = 4;
    let clef_sign = {};
    let clef_line = {};
    let clef_octave_change = {};
    let words = {};
    this.mea = [];
    this.mea.push(Object.assign({}, emptyMeasure));
    for (const el of elements) {
      divisions = Number(this.xml.xpathFirstInner('../attributes/divisions', el) || divisions);
      if (el.nodeName === 'direction') {
        staff = this.xml.xpathFirstInner('staff', el) || staff;
        for (const word of this.xml.xpath('direction-type/words', el)) {
          words[staff] += word.innerHTML + ' ';
        }
      }
      if (el.nodeName === "forward") {
        m_pos = m_pos + this.xml.xpathFirstInner('duration', el) * 0.25 / divisions;
        //console.log("Pos:", m_pos);
      }
      if (el.nodeName === "backup") {
        m_pos = m_pos - this.xml.xpathFirstInner('duration', el) * 0.25 / divisions;
        //console.log("Pos:", m_pos);
      }
      if (el.nodeName === "note") {
        v = Number(this.xml.xpathFirstInner('voice', el) || v);
        staff = Number( this.xml.xpathFirstInner('staff', el) || staff);
        part_id = el.parentNode.parentNode.getAttribute('id');
        m = Number(el.parentNode.getAttribute('number'));
        if (m > max_mea) max_mea = m;
        if (el.getElementsByTagName('chord').length) {
          ++chord;
        } else chord = 0;
        vi = this.allocateVoice(part_id, staff, v, chord);
        // Load measure barline if it is first note in measure
        if (this.mea.length <= m) {
          this.mea.push(Object.assign({}, emptyMeasure));
          this.mea[m].barline = this.xml.xpathFirstInner('../barline/bar-style', el) || this.mea[m].barline;
        }
        // Load measure number if this is first note in measure in this voice
        if (old_m !== m || old_part_id !== part_id) {
          m_pos = 0;
        }
        // Load measure parameters if this is new measure in this part
        if (old_m !== m) {
          mode = this.xml.xpathFirstInner('../attributes/key/mode', el) || mode;
          fifths = Number(this.xml.xpathFirstInner('../attributes/key/fifths', el) || fifths);
          beats_per_measure = Number(this.xml.xpathFirstInner('../attributes/time/beats', el) || beats_per_measure);
          beat_type = Number(this.xml.xpathFirstInner('../attributes/time/beat-type', el) || beat_type);
          this.mea[m].beats_per_measure = beats_per_measure;
          this.mea[m].beat_type = beat_type;
          this.mea[m].measure_len = this.mea[m].beats_per_measure / this.mea[m].beat_type;
          old_m = m;
          old_part_id = part_id;
        }
        if (chord) m_pos = m_pos_prev;
        while (this.notes[vi].length <= m) this.notes[vi].push([]);
        this.notes[vi][m].push(Object.assign({}, emptyNote));
        let ni = this.notes[vi][m].length - 1;
        this.notes[vi][m][ni].pos = m_pos;
        //console.log('Fifths', vi, part_id, staff, chord, m, fifths);
        this.notes[vi][m][ni].fifths = fifths;
        this.notes[vi][m][ni].mode = mode;
        if (this.xml.xpathFirstInner('../attributes/clef', el) != null) {
          clef_sign[staff] =
            this.xml.xpathFirstInner(`../attributes/clef[@number="${staff}"]/sign`, el) ||
            this.xml.xpathFirstInner(`../attributes/clef[not(@number)]/sign`, el);
          clef_line[staff] = Number(
            this.xml.xpathFirstInner(`../attributes/clef[@number="${staff}"]/line`, el) ||
            this.xml.xpathFirstInner(`../attributes/clef[not(@number)]/line`, el));
          clef_octave_change[staff] = Number(
            this.xml.xpathFirstInner(`../attributes/clef[@number="${staff}"]/clef-octave-change`, el) ||
            this.xml.xpathFirstInner(`../attributes/clef[not(@number)]/clef-octave-change`, el) ||
            0);
        }
        this.notes[vi][m][ni].clef_sign = clef_sign[staff];
        this.notes[vi][m][ni].clef_line = clef_line[staff];
        this.notes[vi][m][ni].clef_octave_change = clef_octave_change[staff];
        //console.log(vi, m, ni, staff, this.notes[vi][m][ni].clef_sign, this.notes[vi][m][ni].clef_line, this.notes[vi][m][ni].clef_octave_change);
        if (this.xml.xpathFirstInner('tie[@type="stop"]', el) != null) this.notes[vi][m][ni].tie_stop = true;
        if (this.xml.xpathFirstInner('tie[@type="start"]', el) != null) this.notes[vi][m][ni].tie_start = true;
        if (this.xml.xpathFirstInner('grace', el) != null) this.notes[vi][m][ni].grace = true;
        if (this.xml.xpathFirstInner('rest', el) != null) this.notes[vi][m][ni].rest = true;
        else {
          this.notes[vi][m][ni].rest = false;
          this.notes[vi][m][ni].alter = Number(this.xml.xpathFirstInner('pitch/alter', el) || 0);
          this.notes[vi][m][ni].accidental = this.xml.xpathFirstInner('accidental', el);
          let octave = Number(this.xml.xpathFirstInner('pitch/octave', el));
          let pitch_name = this.xml.xpathFirstInner('pitch/step', el);
          this.notes[vi][m][ni].d = 7 * (octave + 1) + this.name2d(pitch_name);
          //console.log(vi, m, ni, pitch_name, octave);
          this.notes[vi][m][ni].pitch = 12 * (octave + 1) + this.name2c(pitch_name) + this.notes[vi][m][ni].alter;
        }
        if (chord) {
          this.notes[vi][m][ni].dur = dur_prev;
        } else {
          this.notes[vi][m][ni].dur = Number(this.xml.xpathFirstInner('duration', el));
        }
        this.notes[vi][m][ni].dur_div = divisions;
        this.notes[vi][m][ni].lyric = this.xml.xpathFirstInner('lyric/text', el);
        if (words[staff] !== "") {
          this.notes[vi][m][ni].words = words[staff];
          words[staff] = "";
        }
        m_pos_prev = m_pos;
        dur_prev = this.notes[vi][m][ni].dur;
        m_pos += this.notes[vi][m][ni].dur * 0.25 / divisions;
      }
    }
    this.appendRests();
    this.removeEmptyVoices();
  }

  appendRests() {
    for (let vi = 0; vi < this.voices.length; ++vi) {
      // Fill empty measures with pause
      for (let m = 1; m < this.mea.length; ++m) {
        // Do not fill measures with notes
        if (this.notes[vi].length > m &&
          this.notes[vi][m].length) continue;
        while (this.notes[vi].length <= m) this.notes[vi].push([]);
        this.append_pause(vi, m, 0, 0, this.mea[m].beats_per_measure / this.mea[m].beat_type, 1024);
        //console.log("Added rest to empty measure vi/m");
      }
    }
  }

  removeEmptyVoices() {
    for (let vi = 0; vi < this.voices.length; ++vi) {
      let empty = 1;
      for (let m = 1; m < this.mea.length; ++m) {
        for (let ni = 0; ni < this.notes[vi][m].length; ++ni) {
          if (this.notes[vi][m][ni].rest === false) {
            //console.log('Not empty', vi, this.notes[vi][m][ni]);
            empty = 0;
            break;
          }
        }
        if (!empty) break;
      }
      if (empty) {
        this.voices.splice(vi, 1);
        this.notes.splice(vi, 1);
        --vi;
      }
    }
  }

  allocateVoice(part_id, staff, v, chord) {
    // Check if this voice exists
    for (let i = 0; i < this.voices.length; ++i) {
      if (this.voices[i].id === part_id && this.voices[i].staff === staff &&
      this.voices[i].v === v && this.voices[i].chord === chord) return i;
    }
    // Create new voice
    let new_voice = Object.assign({}, emptyVoice);
    new_voice.id = part_id;
    new_voice.staff = staff;
    new_voice.v = v;
    new_voice.chord = chord;
    new_voice.name = this.xml.xpathFirstInner("//score-partwise/part-list/score-part[@id = '" + part_id + "']/part-name");
    new_voice.display = this.xml.xpathFirstInner("//score-partwise/part-list/score-part[@id = '" + part_id + "']/part-name-display/display-text");
    if (new_voice.name === 'MusicXML Part') {
      new_voice.name = part_id;
    }
    // For chords search for previous voice
    if (chord) {
      for (let i = 0; i < this.voices.length; ++i) {
        if (this.voices[i].id === part_id && this.voices[i].staff === staff &&
        this.voices[i].v === v && this.voices[i].chord === chord - 1) {
          // Insert before previous voice
          this.voices.splice(i, 0, new_voice);
          this.notes.splice(i, 0, []);
          return i;
        }
      }
    }
    this.voices.push(new_voice);
    this.notes.push([]);
    return this.voices.length - 1;
  }

  name2d(pitch) {
    if (pitch === 'C') return 0;
    if (pitch === 'D') return 1;
    if (pitch === 'E') return 2;
    if (pitch === 'F') return 3;
    if (pitch === 'G') return 4;
    if (pitch === 'A') return 5;
    if (pitch === 'B') return 6;
    this.error = "Cannot parse pitch " + pitch;
    return 0;
  }

  name2c(pitch) {
    if (pitch === 'C') return 0;
    if (pitch === 'D') return 2;
    if (pitch === 'E') return 4;
    if (pitch === 'F') return 5;
    if (pitch === 'G') return 7;
    if (pitch === 'A') return 9;
    if (pitch === 'B') return 11;
    this.error = "Cannot parse pitch " + pitch;
    return 0;
  }

  getErrPrefix(vi, m, ni) {
    return `Measure ${m}, vi ${vi}, part id ` + this.voices[vi].id +
      ", part name " + this.voices[vi].name + 
      ", staff " + this.voices[vi].staff + 
      ", voice " + this.voices[vi].v + 
      ", chord " + this.voices[vi].chord + 
      ", beat " + this.mea[m].beats_per_measure + "/" + this.mea[m].beat_type +
      ": note " + ni +
      " of " + this.notes[vi][m].length + ".";
  }

  validateMusicXml() {
    // Check if measure is not filled with notes
    for (let vi = 0; vi < this.voices.length; ++vi) {
      for (let m = 1; m < this.mea.length; ++m) {
        // Do not check measures without notes
        if (!this.notes[vi][m].length) continue;
        let stack = this.notes[vi][m][0].pos;
        for (let ni = 0; ni < this.notes[vi][m].length; ++ni) {
          // Detect hidden pause
          if (ni && this.notes[vi][m][ni].pos > stack) {
            this.append_pause(vi, m, ni, stack, this.notes[vi][m][ni].pos - stack,
              this.notes[vi][m][ni - 1].dur_div);
            //echo "Added hidden pause vi/m/ni<br>";
          }
          // Detect length error
          if (ni && this.notes[vi][m][ni].pos < stack) {
            this.error = this.getErrPrefix(vi, m, ni) + " Note starts at position " +
              this.notes[vi][m][ni].pos + " that is less than stack of previous note lengths stack";
            return;
          }
          stack += this.notes[vi][m][ni].dur * 0.25 / this.notes[vi][m][ni].dur_div;
        }
        for (let ni = 0; ni < this.notes[vi][m].length; ++ni) {
          if (this.notes[vi][m][ni].tie_start) {
            if (ni < this.notes[vi][m].length - 1) {
              if (this.notes[vi][m][ni + 1].rest) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note starts tie, but next note in this measure is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_start = 0;
              }
              if (this.notes[vi][m][ni].pitch !== this.notes[vi][m][ni + 1].pitch) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note starts tie, but next note in this measure has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_start = 0;
              }
              if (!this.notes[vi][m][ni + 1].tie_stop) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note starts tie, but next note in this measure does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_start = 0;
              }
            } else if (m < this.mea.length - 1) {
              if (!this.notes[vi][m + 1].length) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note starts tie, but next measure does not have note in this voice.";
                this.notes[vi][m][ni].tie_start = 0;
              } else {
                if (this.notes[vi][m + 1][0].rest) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note starts tie, but next note is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_start = 0;
                }
                if (this.notes[vi][m][ni].pitch !== this.notes[vi][m + 1][0].pitch) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note starts tie, but next note has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_start = 0;
                }
                if (!this.notes[vi][m + 1][0].tie_stop) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note starts tie, but next note does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_start = 0;
                }
              }
            } else {
              this.warning = this.getErrPrefix(vi, m, ni) +
              " Note starts tie, but it is last note in this voice.";
              this.notes[vi][m][ni].tie_start = 0;
            }
          }
          if (this.notes[vi][m][ni].tie_stop) {
            if (ni) {
              if (this.notes[vi][m][ni - 1].rest) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note stops tie, but previous note in this measure is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_stop = 0;
              }
              if (this.notes[vi][m][ni].pitch !== this.notes[vi][m][ni - 1].pitch) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note stops tie, but previous note in this measure has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_stop = 0;
              }
              if (!this.notes[vi][m][ni - 1].tie_start) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note stops tie, but previous note in this measure does not stop tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                this.notes[vi][m][ni].tie_stop = 0;
              }
            } else if (m > 1) {
              if (!this.notes[vi][m - 1].length) {
                this.warning = this.getErrPrefix(vi, m, ni) +
                " Note stops tie, but previous measure does not have note in this voice.";
                this.notes[vi][m][ni].tie_stop = 0;
              } else {
                if (this.notes[vi][m - 1][this.notes[vi][m - 1].length - 1].rest) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note stops tie, but previous note is a rest. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_stop = 0;
                }
                if (this.notes[vi][m][ni].pitch !== this.notes[vi][m - 1][this.notes[vi][m - 1].length - 1].pitch) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note stops tie, but previous note has different pitch. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_stop = 0;
                }
                if (!this.notes[vi][m - 1][this.notes[vi][m - 1].length - 1].tie_start) {
                  this.warning = this.getErrPrefix(vi, m, ni) +
                  " Note stops tie, but previous note does not start tie. Probably, you are using tie in a chord, which is not recommended: better use voices or staffs";
                  this.notes[vi][m][ni].tie_stop = 0;
                }
              }
            } else {
              this.warning = this.getErrPrefix(vi, m, ni) +
              " Note stops tie, but it is the first note in this voice.";
              this.notes[vi][m][ni].tie_stop = 0;
            }
          }
        }
        // Do not check chord voices for note length stack
        //if (this.voices[vi].chord) continue;
        // Add pause if measure is not full
        if (stack < this.mea[m].measure_len) {
          this.append_pause(vi, m, this.notes[vi][m].length, stack, this.mea[m].measure_len - stack,
            this.notes[vi][m][this.notes[vi][m].length - 1].dur_div);
          //echo "Added hidden pause to the end of measure vi/m<br>";
        }
        // Detect length error
        if (stack > this.mea[m].measure_len) {
          this.error = this.getErrPrefix(vi, m, this.notes[vi][m].length) +
          " Need " + this.mea[m].measure_len + " time but got stack";
          return;
        }
      }
    }
  }

  append_pause(vi, m, ni, pos, len, dur_div) {
    let len16 = len * 16;
    for (const dur of this.sliceLen(len16)) {
      let new_pause = Object.assign({}, emptyNote);
      new_pause.pos = pos;
      new_pause.dur_div = dur_div;
      new_pause.dur = dur * 0.25 * dur_div;
      this.notes[vi][m].splice(ni, 0, new_pause);
      pos += dur / 16;
    }
  }

  sliceLen(dur) {
    if (dur > 16) return this.sliceLen(dur - 16).concat([16]);
    if (dur === 5) return [1, 4];
    if (dur === 7) return [1, 6];
    if (dur === 9) return [1, 8];
    if (dur === 10) return [2, 8];
    if (dur === 11) return [3, 8];
    if (dur === 13) return [1, 12];
    if (dur === 14) return [2, 12];
    if (dur === 15) return [3, 12];
    return [dur];
  }
}

