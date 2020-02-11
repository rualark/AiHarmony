import {debugLog} from "../core/debug.js";
import {plain2data} from "../state/state.js";
import {async_redraw} from "../abc/abchelper.js";
import {b256_debug} from "../core/base256.js";
import {ares} from "./AnalysisResults.js";

let workers = {};

function createWorker() {
  return new Worker('js/analysis/worker.js');
}

async function workerMessageReceiver(event) {
  const { type, modName, funcName, data } = event.data;
  if (type === 'ERROR') {
    debugLog(5, modName, funcName, data);
  }
  if (type === 'RESULT') {
    //debugLog(10, 'Debug result:' + b256_debug(data), data.length);
    ares.import(data);
    ares.printFlags();
    console.log(ares);
    async_redraw();
  }
  console.log(event.data);
}

export function launchAnalysis(modName, funcName, data) {
  if (workers[modName] == null) {
    workers[modName] = {};
    workers[modName].worker = createWorker();
  }
  //console.log('AnalyseL');
  let worker = workers[modName].worker;
  worker.addEventListener('message', workerMessageReceiver);
  worker.postMessage({
    type: 'CALL',
    modName: modName,
    funcName: funcName,
    data: data
  });
}
