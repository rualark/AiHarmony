<?php
require_once "lib/lib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

$res = send_mail(array("rualark@gmail.com"), array (
  'From' => "$site_name <noreply@$domain_mail>",
  'To' => "rualark@gmail.com",
  'Subject' => "Test from $site_name",
), "This is a test from $site_name:\r\n\r\n");

print_r($res);
