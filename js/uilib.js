export function button_enabled_active(id, enabled, active) {
  if (active) {
    $('#' + id).removeClass("btn-outline-white").addClass("btn-lblue");
  } else {
    $('#' + id).removeClass("btn-lblue").addClass("btn-outline-white");
  }
  if (enabled) {
    $('#' + id).removeClass("disabled");
  } else {
    $('#' + id).addClass("disabled");
  }
}

