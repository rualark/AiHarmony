let mods = {};

async function initWasmModule(modName) {
  mods[modName].state = 'loading js';
  mods[modName].jsMod = await import('./modules/' + modName + '.js');
  mods[modName].state = 'loading wasm';
  mods[modName].Module.onRuntimeInitialized = function() {
    mods[modName].state = 'ready';
  }
}

// Handle incoming messages
self.addEventListener('message', async function(event) {
  const { type, modName, funcName, data } = event.data;
  if (type === "CALL") {
    if (!(modName in mods)) {
      await initWasmModule(modName);
    }
    wasmReady
      .then((wasmInstance) => {
        const method = wasmInstance[eventData.method];
        const result = method.apply(null, eventData.arguments);
        self.postMessage({
          eventType: "RESULT",
          eventData: result,
          eventId: eventId
        });
      })
      .catch((error) => {
        self.postMessage({
          eventType: "ERROR",
          eventData: "An error occured executing WASM instance function: " + error.toString(),
          eventId: eventId
        });
      })
  }

}, false);
