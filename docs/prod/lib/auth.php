<?php

$robot = secure_variable("robot");
$token = secure_variable("token");
$auth_error = "";
$uid = 0;
$ua = 0;

function lastAct() {
  GLOBAL $ml, $uid;
  mysqli_query($ml, "UPDATE users SET u_lastact=NOW() WHERE u_id='$uid'");
  echo mysqli_error($ml);
}

function add_auth_error($st) {
  GLOBAL $auth_error;
  if ($auth_error != "") $auth_error .= "<br>";
  $auth_error .= $st;
}

function regdata_valid() {
  GLOBAL $ml, $login, $auth_error;
  $r = mysqli_query($ml,"SELECT * FROM users WHERE u_login='$login'");
  echo mysqli_error($ml);
  if (mysqli_errno($ml)) {
    $auth_error = "Internal error";
    return 0;
  }
  if (mysqli_num_rows($r) > 0) {
    $auth_error = "This email is already taken";
  }
  if (!filter_var($login, FILTER_VALIDATE_EMAIL)) {
    add_auth_error("Email address format is wrong");
  }
  if ($auth_error != "") return 0;
  return 1;
}

function pass_valid() {
  GLOBAL $password, $auth_error;
  if (strlen($password) < '7') {
    add_auth_error("Your password should contain at least 7 characters!");
  }
  elseif(!preg_match("#[0-9]+#",$password)) {
    add_auth_error("Your password should contain at least 1 number!");
  }
  elseif(!preg_match("#[A-Z]+#",$password)) {
    add_auth_error("Your password should contain at least 1 capital letter!");
  }
  elseif(!preg_match("#[a-z]+#",$password)) {
    add_auth_error("Your password should contain at least 1 lowercase letter!");
  }
  if ($auth_error != "") return 0;
  return 1;
}

function enter() {
  GLOBAL $ml, $login, $password, $auth_error, $uid;
  $r = mysqli_query($ml,"SELECT * FROM users WHERE u_login='$login'");
  echo mysqli_error($ml);
  if (mysqli_num_rows($r) == 1) {
    $w = mysqli_fetch_assoc($r);
    if (md5(md5($password).$w['u_salt']) == $w['u_pass']) {
      session_start();
      $uid = $w['u_id'];
      SetCookie("mgen_login", $w['u_login'], time() + 50000, '/');
      SetCookie("mgen_pass", md5($w['u_login'].$w['u_pass']), time() + 50000, '/');
      $_SESSION['mgen_u_id'] = $uid;
      lastAct();
      return 1;
    }
    else {
      $auth_error = "Wrong login or password";
      return 0;
    }
  }
  else {
    $auth_error = "Wrong login";
    return 0;
  }
}

function logout () {
  GLOBAL $ru, $url_main;
  session_start();
  //echo "Current session u_id is ".$_SESSION['mgen_u_id'];
  unset($_SESSION['mgen_u_id']);
  SetCookie("mgen_login", "", -1, '/');
  SetCookie("mgen_pass", "", -1, '/');
  //echo "Current cookies: ".$_COOKIE['mgen_login']." ".$_COOKIE['mgen_pass'];
  //echo "You are logged out";
  // Replace empty url and url with
  if ($ru == "" || strpos($ru, "/") > 0) $ru = "$url_main";
  die ("<script>location.replace('$ru');</script>");
}

function login() {
  GLOBAL $ml, $uid, $robot, $token;
  ini_set("session.use_trans_sid", true);
  session_start();
  if (isset($_SESSION['mgen_u_id'])) {
    if(isset($_COOKIE['mgen_login']) && isset($_COOKIE['mgen_pass'])) {
      // If both session and cookies exist, update cookies time
      SetCookie("mgen_login", "", -1, '/');
      SetCookie("mgen_pass","", -1, '/');
      SetCookie("mgen_login", $_COOKIE['mgen_login'], time() + 50000, '/');
      SetCookie("mgen_pass", $_COOKIE['mgen_pass'], time() + 50000, '/');
      $uid = $_SESSION['mgen_u_id'];
      lastAct();
      load_user();
      return 1;
    }
    else {
      // If session exists, but there is no cookie, load user from DB and save to cookies
      $r = mysqli_query($ml,"SELECT * FROM users WHERE u_id='{$_SESSION['mgen_u_id']}'");
      echo mysqli_error($ml);
      if (mysqli_num_rows($r) == 1) {
        $w = mysqli_fetch_assoc($r);
        SetCookie("mgen_login", $w['u_login'], time() + 50000, '/');
        SetCookie("mgen_pass", md5($w['u_pass'].$w['u_pass']), time() + 50000, '/');
        $uid = $_SESSION['mgen_u_id'];
        lastAct();
        load_user();
        return 1;
      }
      else return 0;
    }
  }
  else {
    if(isset($_COOKIE['mgen_login']) && isset($_COOKIE['mgen_pass'])) {
      // If session is not set, but cookie is set, load user by cookie and save to session
      $r = mysqli_query($ml,"SELECT * FROM users WHERE u_login='{$_COOKIE['mgen_login']}'");
      echo mysqli_error($ml);
      $w = mysqli_fetch_assoc($r);
      if(mysqli_num_rows($r) == 1 && md5($w['u_login'].$w['u_pass']) == $_COOKIE['mgen_pass']) {
        $uid = $w['u_id'];
        $_SESSION['mgen_u_id'] = $uid;
        $uid = $_SESSION['mgen_u_id'];
        lastAct();
        load_user();
        return 1;
      }
      else {
        // Clear cookies if failed authentication
        SetCookie("mgen_login", "", time() - 360000, '/');
        SetCookie("mgen_pass", "", time() - 360000, '/');
        return 0;
      }
    }
    else {
      // Try to authinticate robot
      if ($robot && $token) {
        $r = mysqli_query($ml,"SELECT * FROM users WHERE u_name='$robot'");
        echo mysqli_error($ml);
        if (mysqli_num_rows($r) == 1) {
          $w = mysqli_fetch_assoc($r);
          if (md5(md5($token).$w['u_salt']) == $w['u_pass']) {
            $uid = $w['u_id'];
            load_user();
            lastAct();
            return 1;
          }
          else {
            echo "Wrong robot or token";
            return 0;
          }
        }
        else {
          echo "Wrong robot";
          return 0;
        }
      }
      return 0;
    }
  }
}

function load_user() {
  GLOBAL $ml, $uid, $ua, $sentry_enabled, $cost_enabled;
  $r = mysqli_query($ml,"SELECT * FROM users WHERE u_id='$uid'");
  echo mysqli_error($ml);
  $ua = mysqli_fetch_assoc($r);
  if ($sentry_enabled) {
    Sentry\configureScope(function (Sentry\State\Scope $scope): void {
      GLOBAL $ua;
      $scope->setUser(['email' => $ua['u_login']]);
    });
  }
  if ($ua['u_admin']) $cost_enabled = 1;
}

function load_suser() {
  GLOBAL $ml, $suid, $sua;
  $r = mysqli_query($ml,"SELECT * FROM users WHERE u_id='$suid'");
  echo mysqli_error($ml);
  $sua = mysqli_fetch_assoc($r);
}
