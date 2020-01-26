export function waitForVar(obj, field, vals, pause, timeout) {
  return new Promise((resolve, reject) => {
    (function waitForVarInternal(time = 0) {
      if (vals.includes(obj[field])) {
        return resolve(time);
      }
      if (time > timeout) {
        return reject(`Timeout ${timeout} ms waiting for ${field}=${vals.join(',')}`);
      }
      setTimeout(() => {
        waitForVarInternal(time + pause);
      }, pause);
    })();
  });
}
