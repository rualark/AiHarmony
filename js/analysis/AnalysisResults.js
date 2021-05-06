import {b256_safeString, b256_ui} from "../core/base256.js";
import {nd} from "../notes/NotesData.js";
import {d2name, modeName} from "../notes/noteHelper.js";
import {select_note, select_range} from "../ui/edit/select.js";
import {settings} from "../state/settings.js";
import {debugLevel} from "../core/debug.js";
import {encodeHtmlSpecialChars} from "../core/string.js";
import {initTooltips} from "../ui/lib/tooltips.js";
import {selected} from "../abc/abchelper.js";
import {environment} from "../core/remote.js";
import {rules_paragraphs} from "../data/rules_paragraphs.js";
import { mobileOrTablet } from "../core/mobileCheck.js";
import { enableKeys } from "../ui/commands.js";
import { saveState } from "../state/history.js";

const ARES_ENCODING_VERSION = 5;
export const SEVERITY_RED = 80;
export const SEVERITY_RED_COLOR = "red";
export const SEVERITY_YELLOW_COLOR = "#F19900";

const slur_flag_ids = new Set([8,22,58,88,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,140,141,142,143,144,145,146,147,148,149,175,176,177,178,179,180,181,182,183,184,185,186,191,192,203,204,205,206,207,267,268,269,270,271,277,278,279,280,281,296,297,298,299,300,304,315,316,317,318,319,327,328,329,330,331,336,337,338,339,340,348,351,352,353,354,355,386,389,390,391,392,393,394,395,396,397,398,414,415,416,417,418,421,422,423,424,425,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,506,507,508,509,510]);

const glis_flag_ids = new Set([84, 85, 481, 482, 248, 376, 249, 284, 385, 250, 259, 224, 484, 485, 488, 490, 491, 492, 260, 225, 208, 212, 210, 166, 262, 72, 73, 76, 167, 263, 209, 213, 211, 168, 264, 169, 276, 173, 174]);

export const vocra_name = {
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
    this.modName = '';
    this.errors = [];
    this.harm = [];
    this.msh = [];
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
    this.resetShapes();
  }

  resetShapes() {
    this.shapes = [];
  }

  import(st, modName) {
    this.reset();
    this.modName = modName;
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
    this.s_start = b256_ui(st, pos, 2);
    this.c_len = b256_ui(st, pos, 2);
    this.mode = b256_ui(st, pos, 1);
    const hli_size = b256_ui(st, pos, 2);
    for (let hs=0; hs<hli_size; ++hs) {
      this.harm[b256_ui(st, pos, 2) + this.s_start] = b256_safeString(st, pos, 1);
    }
    for (let v=0; v<this.av_cnt; ++v) {
      let va = b256_ui(st, pos, 1);
      this.vid2[va] = v;
      this.vid[v] = va;
      this.vsp[v] = b256_ui(st, pos, 1);
      this.vocra[v] = b256_ui(st, pos, 1);
      this.msh[v] = {};
      this.flag[v] = {};
      let dstep = 1;
      if (this.modName === 'CA3') dstep = 2;
      for (let s = 0; s < this.c_len; s += dstep) {
        this.msh[v][s + this.s_start] = b256_ui(st, pos, 1) - 128;
        let fcnt = b256_ui(st, pos, 1);
        if (!fcnt) continue;
        this.flag[v][s + this.s_start] = [];
        for (let f = 0; f < fcnt; ++f) {
          const flag = {
            s: s + this.s_start,
            v: v,
            fl: b256_ui(st, pos, 2),
            fvl: b256_ui(st, pos, 1),
            fsl: b256_ui(st, pos, 2) + this.s_start,
            accept: b256_ui(st, pos, 1) - 10,
            severity: b256_ui(st, pos, 1),
            class: b256_safeString(st, pos, 1),
            name: b256_safeString(st, pos, 2),
            subName: b256_safeString(st, pos, 2),
            comment: b256_safeString(st, pos, 2),
            subComment: b256_safeString(st, pos, 2),
            debugSt: b256_safeString(st, pos, 2),
            paragraph_num: b256_ui(st, pos, 1),
          };
          if (!environment.startsWith('prod')) {
            if (Object.keys(nd.rules_whitelist).length && !(flag.fl in nd.rules_whitelist)) continue;
            if (flag.fl in nd.rules_blacklist) continue;
          }
          this.flag[v][s + this.s_start].push(flag);
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

  static getRulesPdfUrl() {
    if (mobileOrTablet) return "https://www.docdroid.net/T62f497/artinfuser-counterpoint-rules-pdf";
    else return "md/pdf/Artinfuser_Counterpoint_rules.pdf";
  }

  static getRulesPdfLink() {
    const rules_url = AnalysisResults.getRulesPdfUrl();
    let st = '';
    st += ` <a href=${rules_url} title="Rules" target=_blank>`;
    st += `<img class=imgmo2 src=img/book.png style='position:relative; top:-2px' height=18></a>`;
    return st;
  }

  static getParagraphLink(fla) {
    let st = '';
    if (fla.paragraph_num) {
      const paragraph = rules_paragraphs[fla.paragraph_num];
      const rules_url = AnalysisResults.getRulesPdfUrl();
      st += ` <a href=${rules_url}#page=${paragraph.page} title="${fla.paragraph_num}. ${paragraph.name}" target=_blank>`;
      st += `<img class=imgmo2 src=img/book.png style='position:relative; top:-2px' height=18></a>`;
    }
    return st;
  }

  static getRuleTooltip(fla) {
    let st = '';
    if (debugLevel > 5 && !environment.startsWith('prod')) {
      st += `[${fla.fl}:${fla.debugSt}] `;
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
    this.stats = 0;
    let st = '';
    if (this.mode == null || this.mode === 13 || this.modName !== 'CA3') {
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
    st += `<table style='border-collapse: collapse'>`;
    let fcnt = 0;
    let npm = nd.timesig.measure_len;
    let noteClick = [];
    for (let v=this.flag.length - 1; v>=0; --v) {
      const vi = this.vid[v];
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
          const fla = this.flag[v][s][f];
          const vi2 = this.vid[fla.fvl];
          let col;
          if (fla.accept !== 0) continue;
          if (fla.severity < settings.show_min_severity) continue;
          if (fla.severity > SEVERITY_RED) {
            col = SEVERITY_RED_COLOR;
            this.stats += 10000;
          } else {
            col = SEVERITY_YELLOW_COLOR;
            this.stats += 1;
          }
          if (glis_flag_ids.has(fla.fl)) {
            // TODO: Need more effective getClosestNote
            this.shapes.push({
              shapeType: 'glis',
              v1: vi,
              v2: vi2,
              n11: n,
              n12: nd.getClosestNote(vi, fla.fsl, n),
              n21: nd.getClosestNote(vi2, s),
              n22: nd.getClosestNote(vi2, fla.fsl),
              severity: fla.severity
            });
          }
          if (old_n !== n) {
            old_n = n;
            st += `<tr><td style="vertical-align:top">`;
            st += `<a href=# class='ares ares_${vi}_${n}' style='color: black'>\n`;
            if (this.flag.length > 1) {
              st += `${nd.voices[vi].name} `;
            }
            st += `[bar ${m + 1}, beat ${beat + 1}] ${noteName}</a>\n`;
            st += `<td>&nbsp;<td style="vertical-align:top">`;
            noteClick.push({vi: vi, n: n});
          }
          const paragraph_link = AnalysisResults.getParagraphLink(fla);
          let alertText = this.getRuleString(fla, settings.rule_verbose, false, false);
          let tooltipText = AnalysisResults.getRuleTooltip(fla);
          let htmlText = this.getRuleString(fla, settings.rule_verbose, true, false);
          st += `<a data-html=true data-container=body data-bondary=window data-placement=bottom title="${encodeHtmlSpecialChars(tooltipText)}" href=# class='ares ares_${vi}_${s}_${f}' style='color: ${col}'>\n`;
          st += '- ' + encodeHtmlSpecialChars(htmlText);
          st += `</a> `;
          st += paragraph_link;
          st += `<br>\n`;
          let pf = {
            vi1: vi,
            vi2: vi2,
            s1: s,
            s2: fla.fsl,
            f: f,
            severity: fla.severity,
            text: encodeHtmlSpecialChars(alertText) + ' ' + paragraph_link,
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
    st += `</table>`;
    if (!this.errors.length && !fcnt) {
      st += `<span style='color:green'><b>&#x2705; No mistakes</b></span> `;
      st += AnalysisResults.getRulesPdfLink();
    }
    // if (this.previous_print_st !== st) {
    // this.previous_print_st = st;
    if (!environment.startsWith('prod')) {
      st += `<br>`;
      if (window.location.href.includes('/exercise/')) {
        st += `<a href=# id=harmony_dev><img class=imgmo2 alt='Go to development environment' src=img/sandbox.png height=24 /></a> `;
      } else {
        st += `<a href=# id=harmony_dev><img class=imgmo2 alt='Go to production environment' src=img/worker.png height=24 /></a> `;
      }
      st += `<a href=# id=rules_filter><img class=imgmo2 alt='Rules filter' src=img/filter.png height=24 /></a> `;
      if (Object.keys(nd.rules_whitelist).length) {
        st += ` Rules whitelist: ${Object.keys(nd.rules_whitelist).join(',')}`;
      }
      if (Object.keys(nd.rules_blacklist).length) {
        st += ` Rules blacklist: <strike>${Object.keys(nd.rules_blacklist).join(',')}</strike)`;
      }
    }
    st += '<br><br>';
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
    if (!environment.startsWith('prod')) {
      $('#harmony_dev').click(() => {
        if (window.location.href.includes('/exercise/')) {
          window.location.href = window.location.href.replace(/\/exercise\//, "/harmony-dev/");
        } else {
          window.location.href = window.location.href.replace(/\/harmony-dev\//, "/exercise/");
        }
      });
      $('#rules_filter').click(() => {
        enableKeys(false);
        let st = Object.keys(nd.rules_whitelist).join(',');
        const st2 = Object.keys(nd.rules_blacklist).map(v => -v).join(',');
        if (st && st2) {
          st = st + "," + st2;
        } else {
          st = st + st2;
        }
        bootbox.prompt({
          title: "Rules filter",
          value: st,
          callback: function(value) {
            enableKeys(true);
            if (value == null) return;
            nd.rules_whitelist = Object.create(null);
            for (const st of value.split(',')) {
              const word = st.trim();
              if (word === "") continue;
              let list = nd.rules_whitelist;
              if (word[0] === "-") {
                word = word.slice(1);
                list = nd.rules_blacklist;
              }
              if (/^\d+$/.test(word)) {
                list[word] = true;
              }
            }
            saveState(true);
          }
        });
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
    let yellow_slur = 0;
    let red_slur = 0;
    for (const fla of this.flag[va][pos]) {
      if (fla.accept !== 0) continue;
      if (fla.severity > SEVERITY_RED) {
        if (glis_flag_ids.has(fla.fl)) {}
        else if (slur_flag_ids.has(fla.fl)) red_slur++;
        else red++;
      }
      else if (fla.severity >= settings.show_min_severity) {
        if (glis_flag_ids.has(fla.fl)) {}
        else if (slur_flag_ids.has(fla.fl)) yellow_slur++;
        else yellow++;
      }
    }
    return {red: red, yellow: yellow, red_slur: red_slur, yellow_slur: yellow_slur};
  }

  getFlagsInInterval(v, pos1, pos2) {
    if (this.vid2 == null || !(v in this.vid2)) return {};
    let va = this.vid2[v];
    if (!this.flag || va >= this.flag.length) return {};
    let total = {red: 0, yellow: 0, red_slur: 0, yellow_slur: 0};
    for (let pos = pos1; pos < pos2; ++pos) {
      let flags = this.getFlags(va, pos);
      if (flags.red) total.red += flags.red;
      if (flags.yellow) total.yellow += flags.yellow;
      if (flags.red_slur) total.red_slur += flags.red_slur;
      if (flags.yellow_slur) total.yellow_slur += flags.yellow_slur;
    }
    return total;
  }

  getMsh(v, pos) {
    if (this.vid2 == null || !(v in this.vid2)) return 0;
    let va = this.vid2[v];
    if (!this.msh || va >= this.msh.length) return 0;
    if (!(pos in this.msh[va])) return 0;
    return this.msh[va][pos];
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

  findNextFlag(vi, s) {
    if (this.pFlag == null) return -1;
    if (!this.pFlag.length) return -1;
    for (const f in this.pFlag) {
      const fc = this.pFlag[f];
      if (fc.vi1 > vi) return f;
      if (fc.vi1 == vi && fc.s1 > s) return f;
    }
    return this.pFlag.length - 1;
  }

  nextFlag() {
    if (this.pFlag == null) return;
    if (this.pFlagCur === -1 && selected.note) {
      let vi = selected.note.voice;
      let notes = nd.voices[vi].notes;
      let note = notes[selected.note.note];
      let s = note.step;
      this.pFlagCur = this.findNextFlag(vi, s);
    } else {
      if (this.pFlagCur < this.pFlag.length - 1) this.pFlagCur++;
    }
    if (this.pFlagCur === -1) return;
    let pf = this.pFlag[this.pFlagCur];
    this.selectFlag(pf);
    AnalysisResults.notifyFlag(pf);
  }

  prevFlag() {
    if (this.pFlag == null) return;
    // Find next flag before going to a previous flag
    if (this.pFlagCur === -1 && selected.note) {
      let vi = selected.note.voice;
      let notes = nd.voices[vi].notes;
      let note = notes[selected.note.note];
      let s = note.step;
      this.pFlagCur = this.findNextFlag(vi, s);
    }
    if (this.pFlagCur > 0) this.pFlagCur--;
    let pf = this.pFlag[this.pFlagCur];
    this.selectFlag(pf);
    AnalysisResults.notifyFlag(pf);
  }

  selectFlag(pf) {
    if (!pf) return;
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
    if (!pf) return;
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
