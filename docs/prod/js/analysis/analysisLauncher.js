import {debugLog} from "../core/debug.js";
import {async_redraw} from "../abc/abchelper.js";
import {ares} from "./AnalysisResults.js";
import {trackEvent} from "../integration/tracking.js";
import { environment, mgen_login } from "../core/remote.js";
import { nd } from "../notes/NotesData.js";
import { publish } from "../integration/publish.js";

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
    alertify.warning(`If analysis is not working, try to <a href='https://www.digitaltrends.com/computing/how-to-clear-your-browser-cache/' target=_blank>clear Cached Images and Files</a>, reopen browser and reload page`, 60);
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
    if (mgen_login === 'rualark@gmail.com' && nd.eid) {
      // Update in database
      publish(0, true);
      nd.eid = 0;
    }
    //console.log(ares);
    async_redraw();
  }
  //console.log('Event from worker:', event.data.type, event.data.modName);
}

export function launchAnalysis(modName, funcName, data, options) {
  if (workers[modName] == null) {
    workers[modName] = {};
    workers[modName].worker = createWorker();
    workers[modName].worker.addEventListener('message', workerMessageReceiver);
  }
  //console.log('AnalyseL');
  let worker = workers[modName].worker;
  if (worker.startedTime == null) {
    worker.startedTime = new Date();
  }
  worker.postMessage({
    type: 'CALL',
    modName: modName,
    funcName: funcName,
    data: data,
    options: options
  });
}
