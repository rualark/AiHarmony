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

export function trigger_tooltips() {
  let tts = $('[data-toggle="tooltip"]');
  if (tts.length) {
    tts.tooltip({
      trigger: 'hover'
    });
  }
}

Date.prototype.yyyymmdd = function(div = '') {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();

  return [this.getFullYear(),
    (mm>9 ? '' : '0') + mm,
    (dd>9 ? '' : '0') + dd
  ].join(div);
};

Date.prototype.ymd_his = function() {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();
  let hh = this.getHours();
  let ii = this.getMinutes();
  let ss = this.getSeconds();

  return this.getFullYear() + '-' +
    (mm>9 ? '' : '0') + mm + '-' +
    (dd>9 ? '' : '0') + dd + ' ' +
    (hh>9 ? '' : '0') + hh + ':' +
    (ii>9 ? '' : '0') + ii + ':' +
    (ss>9 ? '' : '0') + ss;
};

export function name2filename(name) {
  let now = new Date();
  let fname = name;
  fname = fname.replace(/[^\w.]/g, '-');
  for (let i=0; i<6; ++i)
    fname = fname.replace('--', '-');
  if (fname.length > 30) fname = fname.substr(0, 30);
  if (fname.length < 4) fname = now.yyyymmdd('-') + ' ' + fname;
  return fname;
}
