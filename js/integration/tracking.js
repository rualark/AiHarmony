export function trackEvent(category, action, label=null, value=null) {
  if (label == null) label = action;
  //console.log('Tracking', category, action, label, value);
  gtag('event', action, {
    'event_category': category,
    'event_label': label,
    'value': value,
  });
}
