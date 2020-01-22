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
  if (fname.length > 30) fname = fname.substr(0, 30);
  if (fname.length < 4) fname = now.yyyymmdd('-') + ' ' + fname;
  return fname;
}

