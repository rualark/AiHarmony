$(function () {
  let tts = $('[data-toggle="tooltip"]');
  if (tts.length) {
    tts.tooltip({
      trigger: 'hover',
      container: 'body',
      boundary: 'viewport',
      animation: true,
      delay: { "show": 800, "hide": 100 }
    });
  }
});

