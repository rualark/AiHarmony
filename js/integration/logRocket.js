import {environment} from "../core/remote.js";

if (environment === 'prod') {
  window.LogRocket && window.LogRocket.init('rgvzmt/aiharmony');

  LogRocket.getSessionURL(sessionURL => {
    Sentry.configureScope(scope => {
      scope.setExtra("sessionURL", sessionURL);
      console.log('Logrocket integrated with sentry');
    });
  });
  console.log('Logrocket initialized');
}
