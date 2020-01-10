import * as a2 from './a2.js';

export let z = 3;
export function f3(a) {
  console.log('f3', a, a2.x, a2.y, z);
}

f3(4);
a2.f2(5);

