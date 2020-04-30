export function ui_b256(num, chars=1) {
  if (num == null) {
    console.trace();
    throw "Trying to serialize null";
  }
  //console.log('ui_b256', num);
  //num = num || 0;
  let i = Math.floor(num);
  if (i < 0) {
    throw("ui_b256 can convert to Base256 only non-negative numbers, but got " + i);
  }
  let st = '';
  for (let c = 0; c < chars; ++c) {
    let data = i % 256;
    //console.log('Ascii', data, String.fromCharCode(data), encodeURI(String.fromCharCode(data)), String.fromCharCode(data).charCodeAt(0));
    st = String.fromCharCode(data) + st;
    i = Math.floor(i / 256);
  }
  if (i > 0) {
    throw(`ui_b256 cannot convert number ${num} to ${chars} base256 characters due to overflow`);
  }
  //console.log('ui_b64', num, chars, st);
  return st;
}

export function b256_single(char) {
  return char.charCodeAt(0);
}

export function b256_ui(st, pos, chars=1) {
  let res = 0;
  let pow = 1;
  for (let c = 0; c < chars; ++c) {
    let data = b256_single(st[pos[0] + chars - 1 - c]);
    res += data * pow;
    pow *= 256;
  }
  pos[0] += chars;
  //console.log('b256_ui', pos[0] - chars, chars, st.substr(pos[0] - chars, chars), res);
  return res;
}

export function safeString_b256(st, sizeCharacters=1) {
  st = st ? st : "";
  return ui_b256(st.length, sizeCharacters) + st;
}

export function b256_safeString(st, pos, sizeCharacters=1) {
  let chars = b256_ui(st, pos, sizeCharacters);
  let res = st.substr(pos[0], chars);
  //console.log('b64_safeShortString', chars, res);
  pos[0] += chars;
  return res;
}

export function b256_debugSingle(char) {
  let res = '';
  let data = b256_single(char);
  res += data;
  if (data > 32 && data < 126) {
    res += ' ' + char;
  }
  res += '~';
  return res;
}

export function b256_debug(st) {
  let res = '';
  for (let i=0; i<st.length; ++i) {
    res += i + '#';
    res += b256_debugSingle(st[i]);
  }
  return res;
}