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
