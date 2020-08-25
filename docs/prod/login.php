<?php
require_once "lib/lib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

$login = secure_variable_post("login");
$password = secure_variable_post("password");
$log_in = secure_variable_post("log_in");
$action = secure_variable("action");
$ru = secure_variable("ru");

$title = "Login to $site_name";

if($action == "out") {
  logout();
  exit;
}

if (login()) {
  //echo "Your session is logged in<br>";
  // Replace empty url and url with
  if ($ru == "" || strpos($ru, "/") > 0) $ru = "$url_main";
  die ("<script>location.replace('$ru');</script>");
}
else {
  if(isset($_POST['log_in'])) {
    if (enter()) {
      //echo "You logged in successfully<br>";
      // Replace empty url and url with
      if ($ru == "" || strpos($ru, "/") > 0) $ru = "$url_main";
      die ("<script>location.replace('$ru');</script>");
    }
  }
}

if (!$uid) {
  require_once "template/menu.php";
  require_once "template/login.php";
  require_once "template/footer.php";
}

?>
