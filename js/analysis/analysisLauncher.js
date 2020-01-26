let workers = {};

function createWorker() {
  return new Worker('js/analysis/worker.js');
}

async function workerMessageReceiver(event) {
  const { type, modName, funcName, data } = event.data;
  if (type === 'ERROR') {
    alertify.error(`${modName}/${funcName}: ${data}`, 25);
  }
  console.log(event.data);
}

export function launchAnalysis(modName, funcName, data) {
  if (workers.modName == null) {
    workers[modName] = {};
    workers[modName].worker = createWorker();
  }
  console.log('analyse', modName, funcName, data);
  let worker = workers[modName].worker;
  worker.addEventListener('message', workerMessageReceiver);
  worker.postMessage({
    type: 'CALL',
    modName: modName,
    funcName: funcName,
    data: data,
  });
}
