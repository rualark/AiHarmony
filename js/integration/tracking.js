export function trackEvent(category, action, label=null, value=null) {
  console.log('Tracking', category, action, label, value);
  gtag('event', action, {
    'event_category': category,
    'event_label': label,
    'value': value,
  });
}
