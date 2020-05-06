<?php

$sentry_enabled = 0;

if ($sentry_enabled) {
  Sentry\init([
    'dsn' => 'https://24f94d15146c4d6296cb1ef92941f08d@sentry.io/1461286',
    'error_types' => E_ALL & ~E_NOTICE & ~E_DEPRECATED
  ]);
}

//require_once 'vendor/sentry/sentry/lib/Raven/Autoloader.php';
//Raven_Autoloader::register();
//$sentryClient = new Raven_Client('https://24f94d15146c4d6296cb1ef92941f08d@sentry.io/1461286');
//$sentryClient->install();

//$error_handler = new Raven_ErrorHandler($sentryClient);
//$error_handler->registerExceptionHandler();
//$error_handler->registerErrorHandler();
//$error_handler->registerShutdownFunction();
