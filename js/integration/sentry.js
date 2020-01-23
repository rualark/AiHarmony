import {enableKeys} from "../ui/commands.js";
import {debug_error, getCookie, getEnvironment} from "../core/remote.js";

Sentry.init({
  dsn: 'https://ad05883cb9534743b6ca504ece76bba6@sentry.io/1894684',
  environment: getEnvironment(),
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception && !debug_error) {
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

let mgen_login = getCookie('mgen_login');
if (mgen_login) {
  Sentry.configureScope((scope) => {
    scope.setUser({
      "email": mgen_login
    });
  });
}

