export let debugLevel = 10;
export let debugError = 0;

export function debugLog(level, ...rest) {
  if (level > debugLevel) return;
  console.log(...rest);
}
