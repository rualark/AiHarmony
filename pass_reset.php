<?php
require_once "lib/lib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

$login = secure_variable("login");
$reset = secure_variable("reset");
$new_pass = secure_variable_post("new_pass");
$password = secure_variable_post("password");
$h = secure_variable_post("h");
$u_id = secure_variable_post("u_id");
if ($h == "") $h = secure_variable("h");
if (!$u_id) $u_id = secure_variable("u_id");

$title = "$site_name: Forgot password";

if (login()) {
  //die ("<script language=javascript>location.replace('index.php');</script>");
}

if ($new_pass != "") {
  if (pass_valid()) {
    $r = mysqli_query($ml, "SELECT * FROM users WHERE u_id='$u_id'");
    echo mysqli_error($ml);
    $ua = mysqli_fetch_assoc($r);

    $salt = mt_rand(100000, 999999);
    $pass_md5 = md5(md5($password) . $salt);
    mysqli_query($ml, "UPDATE users SET u_pass='$pass_md5', u_salt='$salt' WHERE u_id='$u_id'");
    echo mysqli_error($ml);
    $login = $ua['u_login'];
    enter();
    die ("<script language=javascript>location.replace('index.php');</script>");
  }
}

require_once "template/menu.php";

if ($h != "" || $new_pass != "") {
  $r = mysqli_query($ml, "SELECT * FROM users WHERE u_id='$u_id'");
  echo mysqli_error($ml);
  $ua = mysqli_fetch_assoc($r);
  if ($h != md5($ua['u_pass'])) {
    echo "<div class=\"col-md-4\" style=\"margin: 0 auto;\"><br>";
    echo "<p class=text-danger><b>Wrong link. Please try to generate password reset link <a href='pass_reset.php'>again</a>.</p>";
    exit;
  }

  require_once "template/new_pass.php";
  require_once "template/footer.php";
  exit;
}

if ($reset != "") {
  $r = mysqli_query($ml, "SELECT * FROM users WHERE u_login='$login'");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  if ($n != 1) {
    $auth_error = "Can't find that email, sorry.";
  }
  else {
    echo "<div class=\"col-md-4\" style=\"margin: 0 auto;\">";
    $ua = mysqli_fetch_assoc($r);
    $res = send_mail(array($ua['u_login']), array (
      'From' => "$site_name <noreply@$domain_mail>",
      'To' => $ua['u_login'],
      'Subject' => "Password for $site_name",
    ), "Please follow the link to set your new password for $site_name:\r\n\r\n".
      "$url_main/pass_reset.php?u_id=$ua[u_id]&h=".md5($ua['u_pass'])."\r\n\r\nYou received this mail because someone tried to recover your password. If it was not you, you can do nothing.");
    if ($res) {
      echo "<br><h4>Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.</h4>";
    } else {
      echo "Error sending mail.";
    }
    echo "<br><a class='btn btn-outline-primary' href='login.php'>Return to login</a><br><br>";
    echo "</div>";
    require_once "template/footer.php";
    exit;
  }
}

require_once "template/pass_reset.php";
require_once "template/footer.php";

?>
