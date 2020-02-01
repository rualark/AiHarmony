import {launchAnalysis} from "./analysisLauncher.js";

export function analyse() {
  let lst = [];
  for (let i=0; i<1000; ++i) lst.push(i);
  launchAnalysis('CA3', '__Z12doubleValuesPhi', lst);
}
