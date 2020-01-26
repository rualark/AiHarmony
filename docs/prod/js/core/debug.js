export let debugLevel = 10;
export let debugError = false;

export function debugLog(level, ...rest) {
  if (level > debugLevel) return;
  console.log(...rest);
}
