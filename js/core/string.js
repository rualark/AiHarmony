export function json_stringify_circular(obj) {
  let cache = [];
  return JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Duplicate reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
}

String.prototype.count=function(s1) {
  return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
};

export function name2filename(name, filename) {
  //console.log(name, filename);
  if (filename) return filename;
  let now = new Date();
  let fname = name;
  fname = fname.replace(/[^\w.]/g, '-');
  for (let i=0; i<10; ++i)
    fname = fname.replace('--', '-');
  if (fname.length > 60) fname = fname.substr(0, 60);
  if (fname.length < 4) fname = now.yyyymmdd('-') + ' ' + fname;
  return fname;
}

export function makePatch(st1, st2) {
  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < st1.length; ++i) {
    if (st1[i] === st2[i]) ++p1;
    else break;
  }
  let max_p2 = Math.min(st1.length, st2.length) - p1;
  for (let i = 0; i < max_p2; ++i) {
    if (st1[st1.length - i - 1] === st2[st2.length - i - 1]) ++p2;
    else break;
  }
  let patch = st2.slice(p1, st2.length - p2);
  //console.log('Patch', p1, p2, st1.length, st2.length, patch, st1, st2);
  return {p1: p1, p2: p2, patch: patch};
}