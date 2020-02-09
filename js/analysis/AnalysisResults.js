import {b256_safeString, b256_ui} from "../core/base256.js";
import {nd} from "../notes/NotesData.js";
import {d2name} from "../notes/noteHelper.js";
import {select_note} from "../ui/edit/move.js";

let ARES_ENCODING_VERSION = 1;

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
    this.s_start = b256_ui(st, pos, 2);
    this.c_len = b256_ui(st, pos, 2);
    this.mode = b256_ui(st, pos, 1);
    this.flag = [];
    this.vid = [];
    this.vsp = [];
    for (let v=0; v<this.av_cnt; ++v) {
      this.vid[v] = b256_ui(st, pos, 1);
      this.vsp[v] = b256_ui(st, pos, 1);
      this.flag[v] = {};
      for (let s = 0; s < this.c_len; ++s) {
        let fcnt = b256_ui(st, pos, 1);
        if (!fcnt) continue;
        this.flag[v][s] = [];
        for (let f = 0; f < fcnt; ++f) {
          this.flag[v][s].push({
            fl: b256_ui(st, pos, 2),
            fvl: b256_ui(st, pos, 1),
            fsl: b256_ui(st, pos, 2),
            accept: b256_ui(st, pos, 1) - 10,
            severity: b256_ui(st, pos, 1),
            name: b256_safeString(st, pos, 2),
            subName: b256_safeString(st, pos, 2),
          });
        }
      }
    }
  }

  printFlags() {
    let st = '';
    st += `Mode: ${this.mode}. Species: `;
    for (let v in this.flag) {
      st += this.vsp[v] + ' ';
    }
    st += "<br>";
    for (const err of this.errors) {
      st += `<span style='color: red'><b>${err.level}: ${err.message}</b></span><br>`;
    }
    let fcnt = 0;
    let npm = Math.floor(nd.timesig.measure_len / 2);
    let onclick = {};
    for (let v in this.flag) {
      let vi = this.vid[v];
      let n = 0;
      let old_n = -1;
      for (let s in this.flag[v]) {
        let m = Math.floor(s / npm);
        let beat = Math.floor((s % npm) / 2);
        n = nd.getClosestNote(vi, s * 2, n);
        let noteName = d2name(nd.voices[vi].notes[n].d, nd.get_realAlter(vi, n));
        if (noteName !== 'rest') noteName = 'note ' + noteName;
        for (let f in this.flag[v][s]) {
          let fla = this.flag[v][s][f];
          let col = 'black';
          if (fla.severity < 49) continue;
          if (fla.severity > 80) col = 'red';
          else col = 'orange';
          if (old_n !== n) {
            old_n = n;
            st += `<a href=# class='ares ares_${vi}_${n}' style='color: black'>${nd.voices[vi].name} [bar ${m + 1}, beat ${beat + 1}] ${noteName}</a><br>`;
          }
          st += `<a href=# class='ares ares_${vi}_${n}' style='color: ${col}'>${fla.name}: ${fla.subName}</a><br>`;
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

  getFlags(vi, pos) {
    if (!this.flag || vi >= this.flag.length) return {};
    if (!(pos in this.flag[vi])) return {};
    let yellow = 0;
    let red = 0;
    for (const fla of this.flag[vi][pos]) {
      if (fla.severity > 80) red++;
      else if (fla.severity >= 49) yellow++;
    }
    return {red: red, yellow: yellow};
  }

  getFlagsInInterval(vi, pos1, pos2) {
    if (!this.flag || vi >= this.flag.length) return {};
    let total = {red: 0, yellow: 0};
    for (let pos = pos1; pos < pos2; ++pos) {
      let flags = this.getFlags(vi, pos);
      if (flags.red) total.red += flags.red;
      if (flags.yellow) total.yellow += flags.yellow;
    }
    return total;
  }
}

export let ares = new AnalysisResults();
