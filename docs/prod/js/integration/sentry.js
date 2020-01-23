import {enableKeys} from "../ui/commands.js";
import {getEnvironment, urlNoParams} from "../core/url.js";

Sentry.init({
  dsn: 'https://ad05883cb9534743b6ca504ece76bba6@sentry.io/1894684',
  environment: getEnvironment(),
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

LogRocket.getSessionURL(sessionURL => {
  Sentry.configureScope(scope => {
    scope.setExtra("sessionURL", sessionURL);
  });
});
