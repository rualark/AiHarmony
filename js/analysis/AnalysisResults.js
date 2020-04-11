import {b256_safeString, b256_ui} from "../core/base256.js";
import {nd} from "../notes/NotesData.js";
import {d2name, modeName} from "../notes/noteHelper.js";
import {select_note, select_range} from "../ui/edit/select.js";
import {settings} from "../state/settings.js";
import {debugLevel} from "../core/debug.js";
import {encodeHtmlSpecialChars} from "../core/string.js";
import {initTooltips} from "../ui/lib/tooltips.js";
import {selected} from "../abc/abchelper.js";
import {getEnvironment} from "../core/remote.js";

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
    this.harm = [];
    this.flag = [];
    this.vid = [];
    this.vid2 = [];
    this.vsp = [];
    this.vocra = [];
    this.state = 'clean';
    this.stepFlags = {};
    this.av_cnt = 0;
    this.c_len = 0;
    this.s_start = 0;
    this.mode = null;
    this.pFlag = [];
    this.pFlagCur = -1;
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
            s: s * 2 + this.s_start,
            v: v,
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

  getRuleString(fla, verbosity, showLinks) {
    let npm = nd.timesig.measure_len;
    let ruleName = fla.name;
    if (!verbosity) {
      if (ruleName.includes(":")) {
        ruleName = ruleName.slice(0, ruleName.indexOf(':'));
      }
    }
    let st = '';
    st += `${fla.class}: ${ruleName}`;
    let subName = fla.subName;
    // Always hide hidden subrule names starting with /
    if (subName.charAt(0) === '/') subName = '';
    if (subName.charAt(0) === '/') subName = '';
    // If minimum verbosity, hide all subrule names except starting with :
    if (!verbosity) {
      if (subName.charAt(0) !== ':') subName = '';
    }
    if (subName) {
      // Always remove :
      if (subName.charAt(0) === ':') {
        subName = subName.slice(1);
      }
      st += " (" + subName + ")";
    }
    if (verbosity > 1 && fla.comment)
      st += ". " + fla.comment;
    if (verbosity > 1 && fla.subComment)
      st += " (" + fla.subComment + ")";
    if (!showLinks) return st;
    let sl_st = '';
    sl_st = `bar ${Math.floor(fla.fsl / npm) + 1}, beat ${Math.floor((fla.fsl % npm) / 4) + 1}`;
    if (this.flag.length > 2 && fla.fvl !== fla.v) {
      if (this.vid[fla.fvl] < nd.voices.length) {
        st += " - with " + nd.voices[this.vid[fla.fvl]].name;
        if (fla.fsl != fla.s) {
          st += ", " + sl_st;
        }
      }
    }
    else {
      if (fla.fsl < fla.s) {
        st += " - from " + sl_st;
      }
      else if (fla.fsl > fla.s) {
        st += " - to " + sl_st;
      }
    }
    return st;
  }

  static getRuleTooltip(fla) {
    let st = '';
    if (debugLevel > 5 && getEnvironment() !== 'prod') {
      st += `[${fla.fl}] `;
    }
    if (fla.comment)
      st += fla.comment;
    if (fla.subComment)
      st += " (" + fla.subComment + ")";
    return st;
  }

  printFlags() {
    this.stepFlags = {};
    this.pFlag = [];
    this.pFlagCur = -1;
    let st = '';
    if (this.mode == null || this.mode === 13) {
      $('#mode').html('');
    }
    else if (nd.keysig.mode === this.mode) {
      $('#mode').html('<b>' + modeName(nd.keysig.fifths, this.mode) + '</b>');
    }
    else {
      $('#mode').html(modeName(nd.keysig.fifths, this.mode));
    }
    for (const err of this.errors) {
      let color='black';
        if (err.level > 50) color = 'red';
      st += `<span style='color: ${color}'><b>- ${err.message}</b></span><br>`;
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
          let col;
          if (fla.severity < settings.show_min_severity) continue;
          if (fla.severity > SEVERITY_RED) col = SEVERITY_RED_COLOR;
          else col = SEVERITY_YELLOW_COLOR;
          if (old_n !== n) {
            old_n = n;
            st += `<a href=# class='ares ares_${vi}_${n}' style='color: black'>\n`;
            if (this.flag.length > 1) {
              st += `${nd.voices[vi].name} `;
            }
            st += `[bar ${m + 1}, beat ${beat + 1}] ${noteName}</a><br>\n`;
            noteClick.push({vi: vi, n: n});
          }
          let alertText = this.getRuleString(fla, settings.rule_verbose, false, false);
          let tooltipText = AnalysisResults.getRuleTooltip(fla);
          let htmlText = this.getRuleString(fla, settings.rule_verbose, true, false);
          st += `<a data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title="${encodeHtmlSpecialChars(tooltipText)}" href=# class='ares ares_${vi}_${s}_${f}' style='color: ${col}'>\n`;
          st += '- ' + encodeHtmlSpecialChars(htmlText);
          st += `</a><br>\n`;
          let pf = {
            vi1: vi,
            vi2: this.vid[fla.fvl],
            s1: s,
            s2: fla.fsl,
            f: f,
            severity: fla.severity,
            text: encodeHtmlSpecialChars(alertText),
            num: this.pFlag.length
          };
          this.pFlag.push(pf);
          if (!(vi in this.stepFlags)) this.stepFlags[vi] = {};
          if (!(s in this.stepFlags[vi])) this.stepFlags[vi][s] = [];
          this.stepFlags[vi][s].push(pf);
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
        this.selectFlag(fc);
        return false;
      });
    }
    initTooltips(800, 100);
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
    if (this.pFlagCur >= this.pFlag.length - 1) return;
    this.pFlagCur++;
    let pf = this.pFlag[this.pFlagCur];
    this.selectFlag(pf);
    AnalysisResults.notifyFlag(pf);
  }

  prevFlag() {
    if (this.pFlag == null) return;
    if (this.pFlagCur <= 0) return;
    this.pFlagCur--;
    let pf = this.pFlag[this.pFlagCur];
    this.selectFlag(pf);
    AnalysisResults.notifyFlag(pf);
  }

  selectFlag(pf) {
    let id = '.ares_' + pf.vi1 + '_' + pf.s1 + '_' + pf.f;
    $('.ares').css({"font-weight": ''});
    $(id).css({"font-weight": 'bold'});
    this.pFlagCur = pf.num;
    select_range(pf.vi1, pf.vi2, pf.s1, pf.s2, pf.severity);
  }

  selectedFlags(pf) {
    if (!selected.note) return;
    let vi = selected.note.voice;
    let notes = nd.voices[vi].notes;
    let note = notes[selected.note.note];
    let s = note.step;
    if (!(vi in this.stepFlags)) return;
    if (!(s in this.stepFlags[vi])) return;

    $('.ares').css({"font-weight": ''});
    let st = '';
    for (let f=0; f<this.stepFlags[vi][s].length; ++f) {
      let pf = this.stepFlags[vi][s][f];
      //console.log(pf);
      // Select first flag
      if (st === '') {
        this.pFlagCur = pf.num;
        select_range(pf.vi1, pf.vi2, pf.s1, pf.s2, pf.severity);
      }
      // Highlight all flags
      let id = '.ares_' + pf.vi1 + '_' + pf.s1 + '_' + pf.f;
      $(id).css({"font-weight": 'bold'});
      // Build alert string
      let color = '#A36F00';
      if (pf.severity > SEVERITY_RED) color = 'red';
      if (st !== '') st += '<br>';
      st += `<span style='color: ${color}'><b>${pf.text}</b></span>`;
    }
    AnalysisResults.notifyFlags(st);
  }

  static notifyFlag(pf) {
    alertify.dismissAll();
    let color = '#A36F00';
    if (pf.severity > SEVERITY_RED) color = 'red';
    alertify.notify(`<span style='color: ${color}'><b>${pf.text}</b></span>`, 'custom', 60);
  }

  static notifyFlags(st) {
    alertify.dismissAll();
    alertify.notify(st, 'custom', 60);
  }
}

export let ares = new AnalysisResults();
