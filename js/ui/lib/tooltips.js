export function initTooltips(show_ms, hide_ms) {
  let tts = $('[data-toggle="tooltip"]');
  if (tts.length && typeof tts.tooltip === 'function') {
    tts.tooltip({
      trigger: 'hover',
      container: 'body',
      boundary: 'viewport',
      animation: true,
      delay: {"show": 800, "hide": 100}
    });
  }
}
