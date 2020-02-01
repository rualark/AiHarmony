import {enableKeys} from "../ui/commands.js";
import {getCookie, getEnvironment, pageLoadTime, urlNoParams} from "../core/remote.js";
import {debugError} from "../core/debug.js";
import {state2url} from "../state/state.js";

window.showReportDialog = function (eventId) {
  try {
    enableKeys(false);
  } catch (e) {
    console.log(e);
  }
  console.log(eventId);
  Sentry.showReportDialog({eventId: eventId});
};

if (getEnvironment() !== 'prod') {
  Sentry.init({
    dsn: 'https://ad05883cb9534743b6ca504ece76bba6@sentry.io/1894684',
    environment: getEnvironment(),
    beforeSend(event, hint) {
      // Check if it is an exception, and if so, show the report dialog
      let now = new Date();
      if (event.exception && !debugError && (now - pageLoadTime > 5000)) {
        console.log(event.event_id);
        alertify.error(`Problem occured and was reported to site administrator. <a style='color: white' href=# onclick='window.showReportDialog("${event.event_id}"); return false;'><b><u>Сlick here</u></b></a> to add details and track this issue.`, 45);
      }
      try {
        event.tags = event.tags || {};
        event.tags['stateUrl'] = urlNoParams() + '?state=' + state2url();
      }
      catch (e) {
        console.log(e);
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
}
