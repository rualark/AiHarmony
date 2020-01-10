import * as a1 from './a1.js';

export let y = 2;
export function f2(a) {
  console.log('f2', a, a1.x, y);
  a1.f1(a);
}
