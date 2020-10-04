const bestClefCenter = [ 38, 50, 71, 83 ]; // chromatic MIDI
const bestClef = [ "bass-8", "bass", "treble", "treble+8" ]; // ABC notation

export function getBestClef(cmin, cmax) {
  let clef_penalty = [];
  let min_penalty = 10000000;
  let best_clef = 2;
  // Calculate penalty
  for (let c = 0; c < bestClef.length; ++c) {
    clef_penalty.push(Math.max(
      Math.abs(cmax - bestClefCenter[c]),
      Math.abs(cmin - bestClefCenter[c])));
  }
  // Get best clef
  for (let c = 0; c < bestClef.length; ++c) {
    if (clef_penalty[c] < min_penalty) {
      min_penalty = clef_penalty[c];
      best_clef = c;
    }
  }
  return bestClef[best_clef];
}
