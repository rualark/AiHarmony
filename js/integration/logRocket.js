import {getEnvironment} from "../core/remote.js";

if (getEnvironment() === 'prod') {
  window.LogRocket && window.LogRocket.init('rgvzmt/aiharmony');

  LogRocket.getSessionURL(sessionURL => {
    Sentry.configureScope(scope => {
      scope.setExtra("sessionURL", sessionURL);
      console.log('Logrocket integrated with sentry');
    });
  });
}