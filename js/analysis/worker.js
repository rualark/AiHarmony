let workerState = {
  state: 'init'
};

function waitForVar(obj, field, vals, pause, timeout) {
  return new Promise((resolve, reject) => {
    (function waitForVarInternal(time = 0) {
      if (vals.includes(obj[field])) {
        return resolve(time);
      }
      if (time > timeout) {
        return reject(`Timeout ${timeout} ms waiting for ${field}`);
      }
      setTimeout(() => {
        waitForVarInternal(time + pause);
      }, pause);
    })();
  });
}

async function initWasmModule(modName) {
  workerState = {};
  workerState.state = 'loading js';
  importScripts('modules/' + modName + '.js');
  if (Module == null) {
    throw 'Error loading worker js module';
  }
  workerState.state = 'loading wasm';
  Module.onRuntimeInitialized = function() {
    workerState.state = 'ready';
  };
  await waitForVar(workerState, 'state', 'ready', 50, 4000);
}

function toInt32Arr(arr) {
  const res = new Int32Array(arr.length);
  for (let i=0; i < arr.length; i++)
    res[i] = arr[i];
  return res;
}

function transferToHeap(wasmMod, arr) {
  const intArray = toInt32Arr(arr);
  let heapSpace = wasmMod._malloc(intArray.length * intArray.BYTES_PER_ELEMENT);
  wasmMod.HEAPF32.set(intArray, heapSpace >> 2);
  return heapSpace;
}

function callWasmFuncArray(wasmMod, funcName, arr) {
  let arrayOnHeap;
  try {
    arrayOnHeap = transferToHeap(wasmMod, arr);
    return wasmMod.__Z12doubleValuesPii(arrayOnHeap, arr.length);
  }
  finally {
    wasmMod._free(arrayOnHeap);
  }
}

function callWasmFuncArrayToArray(wasmMod, funcName, arr) {
  let res = callWasmFuncArray(wasmMod, funcName, arr);
  const array = [];
  let n = wasmMod.HEAPF32[res / Int32Array.BYTES_PER_ELEMENT];
  for (let i=0; i<n; i++) {
    array.push(wasmMod.HEAPF32[res / Int32Array.BYTES_PER_ELEMENT + i + 1]);
  }
  return array;
}

function message(type, modName, funcName, data) {
  self.postMessage({
    type: type,
    modName: modName,
    funcName: funcName,
    data: data,
  });
}

// Handle incoming messages
self.addEventListener('message', async function(event) {
  const { type, modName, funcName, data } = event.data;
  if (type === "CALL") {
    try {
      if (workerState.state === 'init') {
        await initWasmModule(modName);
      }
      let res = callWasmFuncArrayToArray(Module, funcName, data);
      message("RESULT", modName, funcName, res);
    }
    catch (e) {
      message("ERROR", modName, funcName, e);
    }
  }
}, false);
