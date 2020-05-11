export function button_enabled_active(id, enabled, active) {
  button_active(id, active);
  button_enabled(id, enabled);
}

export function button_visible_active(id, visible, active) {
  button_active(id, active);
  button_visible(id, visible);
}

export function button_active(id, active) {
  if (active) {
    $('#' + id).removeClass("btn-outline-white").addClass("btn-lblue");
  } else {
    $('#' + id).removeClass("btn-lblue").addClass("btn-outline-white");
  }
}

export function button_enabled(id, enabled) {
  if (enabled) {
    $('#' + id).removeClass("disabled");
  } else {
    $('#' + id).addClass("disabled");
  }
}

export function button_visible(id, visible) {
  if (visible) {
    $('#' + id).show();
  } else {
    $('#' + id).hide();
  }
}

export function openNewUrl(url) {
  let newWin = window.open(url, '_blank');
  if(!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
    alertify.error(`Popup blocked by your browser. Please allow popups or <a style='color: white' href="${url}" target=_blank><b><u>click here</u></b></a> to open it manually`, 45);
  }
}

export function randomSelect(id) {
  var options = $(`#${id} > option`);
  var random = Math.floor(options.length * (Math.random() % 1));
  $(`#${id} > option`).attr('selected', false).eq(random).attr('selected', true);
}

export function showCheckBox(id, value, label) {
  let st = '';
  st += `<div class="form-check">`;
  st += `<input type="checkbox" class="form-check-input" id="${id}" ${value ? "checked" : ""}>`;
  st += `<label class="form-check-label" for="${id}">${label}</label>`;
  st += `</div><br>`;
  return st;
}
