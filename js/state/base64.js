let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
let fb64 = {};

export function unicode_b64(str) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
}

export function b64_unicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function ui_b64(num, chars) {
  if (num == null) console.trace();
  //num = num || 0;
  let i = Math.floor(num);
  if (i < 0) {
    throw("ui_b64 can convert to Base64 only non-negative numbers, but got " + i);
  }
  let st = '';
  for (let c = 0; c < chars; ++c) {
    let data = i % 64;
    //console.log(num, i, c, data, b64[data], b64);
    st = b64[data] + st;
    i = Math.floor(i / 64);
  }
  if (i > 0) {
    throw(`ui_b64 cannot convert number ${num} to ${chars} base64 characters due to overflow`);
  }
  //console.log('ui_b64', num, chars, st);
  return st;
}

export function b64_single(char) {
  if (char in fb64) return fb64[char];
  throw(`Cannot convert symbol ${char} from Base64`);
}

export function b64_ui(st, pos, chars) {
  let res = 0;
  let pow = 1;
  for (let c = 0; c < chars; ++c) {
    let data = b64_single(st[pos[0] + chars - 1 - c]);
    res += data * pow;
    pow *= 64;
  }
  pos[0] += chars;
  //console.log('b64_ui', pos[0] - chars, chars, st.substr(pos[0] - chars, chars), res);
  return res;
}

export function safeShortString_b64(st) {
  return ui_b64(st.length, 1) + st;
}

export function safeString_b64(st) {
  return ui_b64(st.length, 2) + st;
}

export function string_b64(st) {
  return safeString_b64(unicode_b64(st));
}

export function b64_string(st, pos) {
  let chars = b64_ui(st, pos, 2);
  let res = b64_unicode(st.substr(pos[0], chars));
  pos[0] += chars;
  //console.log('b64_string', pos[0] - chars, chars, st.substr(pos[0] - chars, chars), res);
  return res;
}

export function b64_safeShortString(st, pos) {
  let chars = b64_ui(st, pos, 1);
  let res = st.substr(pos[0], chars);
  //console.log('b64_safeShortString', chars, res);
  pos[0] += chars;
  return res;
}

export function init_base64() {
  for (let i = 0; i < b64.length; ++i) fb64[b64[i]] = i;
  //console.log(fb64);
}