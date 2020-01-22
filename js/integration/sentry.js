import {enableKeys} from "../ui/commands.js";

Sentry.init({
  dsn: 'https://ad05883cb9534743b6ca504ece76bba6@sentry.io/1894684',
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      try {
        enableKeys(false);
      }
      catch (e) {
        console.log(e);
      }
      Sentry.showReportDialog({ eventId: event.event_id });
    }
    return event;
  }
});
