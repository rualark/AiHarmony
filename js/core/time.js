export let local_start_counter;
export let global_start_counter;
export let counter_name;

export function start_counter(name, global_start = false) {
  let now = new Date();
  counter_name = name;
  if (!global_start_counter || global_start) {
    global_start_counter = now;
  }
  local_start_counter = now;
}

export function stop_counter() {
  if (!global_start_counter) return;
  let now = new Date();
  let st = `${counter_name} took ${(now - local_start_counter) / 1000} s`;
  if (global_start_counter !== local_start_counter) {
    st += ` (total ${(now - global_start_counter) / 1000} s)`;
  }
  console.log(st);
}

export function currentTimestamp() {
  return new Date().getTime() / 1000;
}

export function timestamp2date(unix_timestamp) {
  return new Date(unix_timestamp * 1000);
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
