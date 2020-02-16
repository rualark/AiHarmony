import {debugLog} from "../core/debug.js";
import {async_redraw} from "../abc/abchelper.js";
import {ares} from "./AnalysisResults.js";
import {trackEvent} from "../integration/tracking.js";

let workers = {};

function createWorker() {
  return new Worker('js/analysis/worker.js');
}

async function workerMessageReceiver(event) {
  const { type, modName, funcName, data } = event.data;
  let worker = workers[modName].worker;
  if (type === 'ERROR') {
    if (workers[modName].startedTime != null) {
      if (worker.firstResultReceived == null) {
        trackEvent('AiHarmony', 'analysis_error_first', modName, new Date() - worker.startedTime);
      }
      else {
        trackEvent('AiHarmony', 'analysis_error', modName, new Date() - worker.startedTime);
      }
      worker.startedTime = null;
      worker.firstResultReceived = true;
    }
    debugLog(5, modName, funcName, data);
    throw data;
  }
  if (type === 'RESULT') {
    if (worker.startedTime != null) {
      if (worker.firstResultReceived == null) {
        trackEvent('AiHarmony', 'analysis_first', modName, new Date() - worker.startedTime);
      }
      else {
        trackEvent('AiHarmony', 'analysis', modName, new Date() - worker.startedTime);
      }
      worker.startedTime = null;
      worker.firstResultReceived = true;
    }
    //debugLog(10, 'Debug result:' + b256_debug(data), data.length);
    ares.import(data);
    ares.printFlags();
    //console.log(ares);
    async_redraw();
  }
  console.log('Event from worker:', event.data.type, event.data.modName);
}

export function launchAnalysis(modName, funcName, data) {
  if (workers[modName] == null) {
    workers[modName] = {};
    workers[modName].worker = createWorker();
    workers[modName].worker.addEventListener('message', workerMessageReceiver);
  }
  console.log('AnalyseL');
  let worker = workers[modName].worker;
  if (worker.startedTime == null) {
    worker.startedTime = new Date();
  }
  worker.postMessage({
    type: 'CALL',
    modName: modName,
    funcName: funcName,
    data: data
  });
}
