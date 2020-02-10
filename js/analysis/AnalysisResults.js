import {b256_safeString, b256_ui} from "../core/base256.js";
import {nd} from "../notes/NotesData.js";
import {d2name, modeName} from "../notes/noteHelper.js";
import {select_note} from "../ui/edit/move.js";
import {settings} from "../state/settings.js";

let ARES_ENCODING_VERSION = 2;

let vocra_name = {
  1: 'Bas.',
  2: 'Ten.',
  3: 'Alt.',
  4: 'Sop.'
}

class AnalysisResults {
  constructor() {
  }

  import(st) {
    let pos = [0];
    let received_encoding_version = b256_ui(st, pos, 1);
    if (received_encoding_version !== ARES_ENCODING_VERSION) {
      throw(`Analysis results version: got ${received_encoding_version}, should be ${ARES_ENCODING_VERSION}`);
    }
    let ecnt = b256_ui(st, pos, 2);
    this.errors = [];
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
    this.harm = [];
    for (let hs=0; hs<hli_size; ++hs) {
      this.harm[b256_ui(st, pos, 2) * 2] = b256_safeString(st, pos, 1);
    }
    this.flag = [];
    this.vid = [];
    this.vid2 = [];
    this.vsp = [];
    this.vocra = [];
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
    let onclick = {};
    for (let v=this.flag.length - 1; v>=0; --v) {
      let vi = this.vid[v];
      let n = 0;
      let old_n = -1;
      for (let s in this.flag[v]) {
        let m = Math.floor(s / npm);
        let beat = Math.floor((s % npm) / 4);
        n = nd.getClosestNote(vi, s, n);
        let noteName = d2name(nd.voices[vi].notes[n].d, nd.get_realAlter(vi, n));
        if (noteName !== 'rest') noteName = 'note ' + noteName;
        for (let f in this.flag[v][s]) {
          let fla = this.flag[v][s][f];
          let col = 'black';
          if (fla.severity < settings.show_min_severity) continue;
          if (fla.severity > 80) col = 'red';
          else col = 'orange';
          if (old_n !== n) {
            old_n = n;
            st += `<a href=# class='ares ares_${vi}_${n}' style='color: black'>`;
            if (this.flag.length > 1) {
              st += `${nd.voices[vi].name} `;
            }
            st += `[bar ${m + 1}, beat ${beat + 1}] ${noteName}</a><br>`;
          }
          let ruleName = fla.name;
          if (!settings.rule_verbose) {
            if (ruleName.includes(":")) {
              ruleName = ruleName.slice(0, ruleName.indexOf(':'));
            }
          }
          st += `<a href=# class='ares ares_${vi}_${n}' style='color: ${col}'>`;
          st += `${fla.class}: ${ruleName}`;
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
            st += " (" + subName + ")";
          }
          if (settings.rule_verbose > 1 && fla.comment)
            st += ". " + fla.comment;
          if (settings.rule_verbose > 1 && fla.subComment)
            st += " (" + fla.subComment + ")";
          let sl_st = '';
          sl_st = `bar ${Math.floor(fla.fsl / npm) + 1}, beat ${Math.floor((fla.fsl % npm) / 4) + 1}`;
          if (this.flag.length > 2 && fla.fvl !== v) {
            st += " - with " + nd.voices[this.vid[fla.fvl]].name;
            if (fla.fsl !== s) {
              st += ", " + sl_st;
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
          st += `</a><br>`;
          onclick[`ares_${vi}_${n}`] = {n: n, v: vi};
          fcnt++;
        }
      }
    }
    if (!this.errors.length && !fcnt) st += '<img height=130 src=img/excellent.png>';
    // if (this.previous_print_st !== st) {
    // this.previous_print_st = st;
    document.getElementById('analysisConsole').innerHTML = st;
    for (const id in onclick) {
      $('.' + id).click(() => {
        select_note(onclick[id].v, onclick[id].n);
        return false;
      });
    }
  }

  getFlags(va, pos) {
    if (!this.flag || va >= this.flag.length) return {};
    if (!(pos in this.flag[va])) return {};
    let yellow = 0;
    let red = 0;
    for (const fla of this.flag[va][pos]) {
      if (fla.severity > 80) red++;
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
}

export let ares = new AnalysisResults();
