import {b256_safeString, b256_ui} from "../core/base256.js";
import {nd} from "../notes/NotesData.js";
import {d2name, modeName} from "../notes/noteHelper.js";
import {select_note, select_range} from "../ui/edit/select.js";
import {settings} from "../state/settings.js";
import {selected} from "../abc/abchelper.js";
import {xmlLoadWarnings} from "../MusicXml/musicXmlToData.js";
import {debugLevel} from "../core/debug.js";

let ARES_ENCODING_VERSION = 2;
export let SEVERITY_RED = 80;
export let SEVERITY_RED_COLOR = "red";
export let SEVERITY_YELLOW_COLOR = "#F19900";

let vocra_name = {
  1: 'Bas.',
  2: 'Ten.',
  3: 'Alt.',
  4: 'Sop.'
};

class AnalysisResults {
  constructor() {
    this.reset();
  }

  reset() {
    this.errors = [];
    this.pFlag = [];
    this.harm = [];
    this.flag = [];
    this.vid = [];
    this.vid2 = [];
    this.vsp = [];
    this.vocra = [];
    this.pFlagCur = -1;
    this.state = 'clean';
  }

  import(st) {
    this.reset();
    let pos = [0];
    let received_encoding_version = b256_ui(st, pos, 1);
    if (received_encoding_version !== ARES_ENCODING_VERSION) {
      throw(`Analysis results version: got ${received_encoding_version}, should be ${ARES_ENCODING_VERSION}`);
    }
    let ecnt = b256_ui(st, pos, 2);
    for (let i=0; i<ecnt; ++i) {
      this.errors.push({
        level: b256_ui(st, pos, 1),
        message: b256_safeString(st, pos, 2)
      });
    }
    this.av_cnt = b256_ui(st, pos, 1);
    this.s_start = b256_ui(st, pos, 2) * 2;
    this.c_len = b256_ui(st, pos, 2);
    this.mode = b256_ui(st, pos, 1);
    const hli_size = b256_ui(st, pos, 2);
    for (let hs=0; hs<hli_size; ++hs) {
      this.harm[b256_ui(st, pos, 2) * 2] = b256_safeString(st, pos, 1);
    }
    for (let v=0; v<this.av_cnt; ++v) {
      let va = b256_ui(st, pos, 1);
      this.vid2[va] = v;
      this.vid[v] = va;
      this.vsp[v] = b256_ui(st, pos, 1);
      this.vocra[v] = b256_ui(st, pos, 1);
      this.flag[v] = {};
      for (let s = 0; s < this.c_len; ++s) {
        let fcnt = b256_ui(st, pos, 1);
        if (!fcnt) continue;
        this.flag[v][s * 2 + this.s_start] = [];
        for (let f = 0; f < fcnt; ++f) {
          this.flag[v][s * 2 + this.s_start].push({
            fl: b256_ui(st, pos, 2),
            fvl: b256_ui(st, pos, 1),
            fsl: b256_ui(st, pos, 2) * 2 + this.s_start,
            accept: b256_ui(st, pos, 1) - 10,
            severity: b256_ui(st, pos, 1),
            class: b256_safeString(st, pos, 1),
            name: b256_safeString(st, pos, 2),
            subName: b256_safeString(st, pos, 2),
            comment: b256_safeString(st, pos, 2),
            subComment: b256_safeString(st, pos, 2),
          });
        }
      }
    }
  }

  printFlags() {
    let st = '';
    $('#mode').html(modeName(nd.keysig.fifths, this.mode));
    for (const err of this.errors) {
      st += `<span style='color: red'><b>${err.level}: ${err.message}</b></span><br>`;
    }
    let fcnt = 0;
    let npm = nd.timesig.measure_len;
    let noteClick = [];
    for (let v=this.flag.length - 1; v>=0; --v) {
      let vi = this.vid[v];
      if (vi >= nd.voices.length) continue;
      let n = 0;
      let old_n = -1;
      for (let s in this.flag[v]) {
        let m = Math.floor(s / npm);
        let beat = Math.floor((s % npm) / 4);
        n = nd.getClosestNote(vi, s, n);
        if (n >= nd.voices[vi].notes.length) continue;
        let noteName = d2name(nd.voices[vi].notes[n].d, nd.get_realAlter(vi, n));
        if (noteName !== 'rest') noteName = 'note ' + noteName;
        for (let f in this.flag[v][s]) {
          let fla = this.flag[v][s][f];
          let col = 'black';
          if (fla.severity < settings.show_min_severity) continue;
          if (fla.severity > SEVERITY_RED) col = SEVERITY_RED_COLOR;
          else col = SEVERITY_YELLOW_COLOR;
          if (old_n !== n) {
            old_n = n;
            st += `<a href=# class='ares ares_${vi}_${n}' style='color: black'>`;
            if (this.flag.length > 1) {
              st += `${nd.voices[vi].name} `;
            }
            st += `[bar ${m + 1}, beat ${beat + 1}] ${noteName}</a><br>`;
            noteClick.push({vi: vi, n: n});
          }
          let ruleName = fla.name;
          if (!settings.rule_verbose) {
            if (ruleName.includes(":")) {
              ruleName = ruleName.slice(0, ruleName.indexOf(':'));
            }
          }
          st += `<a href=# class='ares ares_${vi}_${s}_${f}' style='color: ${col}'>`;
          if (debugLevel > 5) {
            st += `[${fla.fl}] `;
          }
          let shortText = '';
          shortText += `${fla.class}: ${ruleName}`;
          let subName = fla.subName;
          // Always hide hidden subrule names starting with /
          if (subName.charAt(0) === '/') subName = '';
          // If minimum verbosity, hide all subrule names except starting with :
          if (!settings.rule_verbose) {
            if (subName.charAt(0) !== ':') subName = '';
          }
          if (subName) {
            // Always remove :
            if (subName.charAt(0) === ':') {
              subName = subName.slice(1);
            }
            shortText += " (" + subName + ")";
          }
          st += shortText;
          if (settings.rule_verbose > 1 && fla.comment)
            st += ". " + fla.comment;
          if (settings.rule_verbose > 1 && fla.subComment)
            st += " (" + fla.subComment + ")";
          let sl_st = '';
          sl_st = `bar ${Math.floor(fla.fsl / npm) + 1}, beat ${Math.floor((fla.fsl % npm) / 4) + 1}`;
          if (this.flag.length > 2 && fla.fvl !== v) {
            if (this.vid[fla.fvl] < nd.voices.length) {
              st += " - with " + nd.voices[this.vid[fla.fvl]].name;
              if (fla.fsl != s) {
                st += ", " + sl_st;
              }
            }
          }
          else {
            if (fla.fsl < s) {
              st += " - from " + sl_st;
            }
            else if (fla.fsl > s) {
              st += " - to " + sl_st;
            }
          }
          st += ``;
          st += `</a><br>`;
          this.pFlag.push({
            vi1: vi,
            vi2: this.vid[fla.fvl],
            s1: s,
            s2: fla.fsl,
            f: f,
            severity: fla.severity,
            text: shortText,
            num: this.pFlag.length
          });
          fcnt++;
        }
      }
    }
    if (!this.errors.length && !fcnt) st += '<img height=130 src=img/excellent.png>';
    // if (this.previous_print_st !== st) {
    // this.previous_print_st = st;
    document.getElementById('analysisConsole').innerHTML = st;
    for (const fc of noteClick) {
      $('.ares_' + fc.vi + '_' + fc.n).click(() => {
        select_note(fc.vi, fc.n);
        return false;
      });
    }
    for (const fc of this.pFlag) {
      let id = '.ares_' + fc.vi1 + '_' + fc.s1 + '_' + fc.f;
      $(id).click(() => {
        selectFlag(fc);
        this.pFlagCur = fc.num;
        return false;
      });
    }
    this.state = 'ready';
  }

  getFlags(va, pos) {
    if (!this.flag || va >= this.flag.length) return {};
    if (!(pos in this.flag[va])) return {};
    let yellow = 0;
    let red = 0;
    for (const fla of this.flag[va][pos]) {
      if (fla.severity > SEVERITY_RED) red++;
      else if (fla.severity >= settings.show_min_severity) yellow++;
    }
    return {red: red, yellow: yellow};
  }

  getFlagsInInterval(v, pos1, pos2) {
    if (this.vid2 == null || !(v in this.vid2)) return {};
    let va = this.vid2[v];
    if (!this.flag || va >= this.flag.length) return {};
    let total = {red: 0, yellow: 0};
    for (let pos = pos1; pos < pos2; ++pos) {
      let flags = this.getFlags(va, pos);
      if (flags.red) total.red += flags.red;
      if (flags.yellow) total.yellow += flags.yellow;
    }
    return total;
  }

  getVocra(v) {
    if (this.vid2 == null || !(v in this.vid2)) return;
    let va = this.vid2[v];
    return vocra_name[this.vocra[va]];
  }

  getSpecies(v) {
    if (this.vid2 == null || !(v in this.vid2)) return;
    let va = this.vid2[v];
    return this.vsp[va];
  }

  nextFlag() {
    if (this.pFlag == null) return;
    if (this.pFlagCur >= this.pFlag.length) return;
    this.pFlagCur++;
    let pf = this.pFlag[this.pFlagCur];
    selectFlag(pf);
    notifyFlag(pf);
  }

  prevFlag() {
    if (this.pFlag == null) return;
    if (this.pFlagCur <= 0) return;
    this.pFlagCur--;
    let pf = this.pFlag[this.pFlagCur];
    selectFlag(pf);
    notifyFlag(pf);
  }
}

function selectFlag(pf) {
  let id = '.ares_' + pf.vi1 + '_' + pf.s1 + '_' + pf.f;
  $('.ares').css({"font-weight": ''});
  $(id).css({"font-weight": 'bold'});
  select_range(pf.vi1, pf.vi2, pf.s1, pf.s2, pf.severity);
}

function notifyFlag(pf) {
  alertify.dismissAll();
  let color = '#A36F00';
  if (pf.severity > SEVERITY_RED) color = 'red';
  alertify.notify(`<span style='color: ${color}'><b>${pf.text}</b></span>`, 'custom', 60);
}

export let ares = new AnalysisResults();
