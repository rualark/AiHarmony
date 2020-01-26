let mods = {};

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
  mods[modName] = {};
  mods[modName].state = 'loading js';
  mods[modName].jsMod = await import('./modules/' + modName + '.js');
  if (mods[modName].jsMod == null || mods[modName].jsMod.Module == null) {
    throw 'Error loading worker js module';
  }
  mods[modName].wasmMod = mods[modName].jsMod.Module;
  mods[modName].state = 'loading wasm';
  mods[modName].wasmMod.onRuntimeInitialized = function() {
    mods[modName].state = 'ready';
  };
  await waitForVar(mods[modName], 'state', 'ready', 50, 4000);
}

function transferToHeap(wasmMod, arr) {
  const intArray = toInt32Arr(arr);
  let heapSpace = wasmMod._malloc(intArray.length * intArray.BYTES_PER_ELEMENT);
  wasmMod.HEAPF32.set(intArray, heapSpace >> 2);
  return heapSpace;
  function toInt32Arr(arr) {
    const res = new Int32Array(arr.length);
    for (let i=0; i < arr.length; i++)
      res[i] = arr[i];
    return res;
  }
}

function callWasmFuncArray(wasmMod, funcName, arr) {
  let arrayOnHeap;
  try {
    arrayOnHeap = transferToHeap(wasmMod, arr);
    throw "test";
    return wasmMod[funcName](arrayOnHeap, arr.length);
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

// Handle incoming messages
self.addEventListener('message', async function(event) {
  const { type, modName, funcName, data } = event.data;
  if (type === "CALL") {
    try {
      if (!(modName in mods)) {
        await initWasmModule(modName);
      }
      let wasmMod = mods[modName].wasmMod;
      let res = callWasmFuncArrayToArray(wasmMod, funcName, data);
      self.postMessage({
        type: "RESULT",
        modName: modName,
        funcName: funcName,
        data: res,
      });
    }
    catch (e) {
      self.postMessage({
        type: "ERROR",
        modName: modName,
        funcName: funcName,
        data: e,
      });
    }
  }
}, false);
