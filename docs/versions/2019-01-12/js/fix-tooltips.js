$(function () {
  let tts = $('[data-toggle="tooltip"]');
  if (tts.length) {
    tts.tooltip({
      trigger: 'hover'
    });
  }
});

