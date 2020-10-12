<?php

require_once "lib/lib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

if (!login()) {
  die ("Authentication error");
}

$state = mysqli_real_escape_string($ml, $_POST["state"]);
$settings = mysqli_real_escape_string($ml, $_POST["settings"]);
$title = mysqli_real_escape_string($ml, $_POST["title"]);
$fname = mysqli_real_escape_string($ml, $_POST["fname"]);
$uname = mysqli_real_escape_string($ml, $_POST["uname"]);
$browser_id = mysqli_real_escape_string($ml, $_POST["browser_id"]);
$security = mysqli_real_escape_string($ml, $_POST["security"]);
$robot = mysqli_real_escape_string($ml, $_POST["robot"]);
$token = mysqli_real_escape_string($ml, $_POST["token"]);
$base_url = mysqli_real_escape_string($ml, $_POST["base_url"]);
$root_eid = mysqli_real_escape_string($ml, $_POST["root_eid"]);
$logrocket = mysqli_real_escape_string($ml, $_POST["logrocket"]);
$algo = mysqli_real_escape_string($ml, $_POST["algo"]);
$flags = mysqli_real_escape_string($ml, $_POST["flags"]);
$music_hash = mysqli_real_escape_string($ml, $_POST["music_hash"]);
$annotations = mysqli_real_escape_string($ml, $_POST["annotations"]);
$keysig = mysqli_real_escape_string($ml, $_POST["keysig"]);
$species = mysqli_real_escape_string($ml, $_POST["species"]);
$cantus_hash = mysqli_real_escape_string($ml, $_POST["cantus_hash"]);
$vocra = mysqli_real_escape_string($ml, $_POST["vocra"]);
$timesig = mysqli_real_escape_string($ml, $_POST["timesig"]);
$eid = mysqli_real_escape_string($ml, $_POST["eid"]);
$debug = mysqli_real_escape_string($ml, $_POST["debug"]);
$mistakes_st = mysqli_real_escape_string($ml, $_POST["mistakes"]);

if (isset($_SERVER["HTTP_X_REMOTE_ADDR"])) $ip =  $_SERVER["HTTP_X_REMOTE_ADDR"];
else $ip = $_SERVER['REMOTE_ADDR'];

$r = query("SELECT u_id FROM users WHERE u_login='$uname'");
$wu = mysqli_fetch_assoc($r);

$mistakes = array();
if ($mistakes_st) {
  $msa = explode("~", $mistakes_st);
  for ($i=0; $i<count($msa); ++$i) {
    $mistake = explode("|", $msa[$i]);
    if (!$mistake[0]) break;
    $mistakes[] = $mistake;
  }
}

function update_mistakes($mistakes) {
  GLOBAL $root_eid, $eid;
  query("DELETE FROM mistakes WHERE root_eid='$root_eid' AND eid='$eid'");
  foreach ($mistakes as $mistake) {
    query("INSERT INTO mistakes VALUES('$root_eid', '$eid', '$mistake[0]', '$mistake[1]', '$mistake[2]', '$mistake[3]')");
  }
}

if ($eid) {
  query("
    UPDATE exercises
    SET keysig='$keysig', species='$species', music_hash='$music_hash', debug='$debug', cantus_hash='$cantus_hash', vocra='$vocra', timesig='$timesig', debug='$debug', annotations='$annotations'
    WHERE root_eid='$root_eid' AND eid='$eid'
  ");
  update_mistakes($mistakes);
  echo "Published successfully\n";
  echo "$root_eid\n";
  echo "$eid\n";
  die();
}

if (!$root_eid) {
  query("INSERT INTO root_exercises VALUES(0, 1)");
  $root_eid = mysqli_insert_id($ml);
  $eid = 1;
} else {
  // Make new eid
  query("UPDATE root_exercises SET ecount=ecount+1 WHERE root_eid=$root_eid");
  $r = query("SELECT ecount FROM root_exercises WHERE root_eid=$root_eid");
  $w = mysqli_fetch_assoc($r);
  $eid = $w['ecount'];
  if (!$eid) {
    $eid = 1;
    query("REPLACE INTO root_exercises VALUES($root_eid, $eid)");
  }
  // Notify
  $r = query("
    SELECT * FROM exercises
    WHERE root_eid=$root_eid AND eid=1
  ");
  $w2 = mysqli_fetch_assoc($r);
  if ($w2['u_cookie'] != $uname) {
    $res = send_mail(array($w2['u_cookie']), array (
      'From' => "$site_name <noreply@$domain_mail>",
      'To' => $w2['u_cookie'],
      'Subject' => "Reply to exercise #$root_eid/$eid. $title",
    ), "You got reply to your exercise #$root_eid/$eid. $title from $uname:\r\n\r\n".
      "$url_main/exercise.php?id=$root_eid\r\n\r\nYou are receiving this email because you signed up for $site_name.\r\nPlease do not reply to this email.\r\nVisit $url_main/profile.php to modify your email notification settings.");
  }
}

query("
  INSERT INTO exercises
  VALUES('$root_eid', '$eid', NOW(), '$uname', '$wu[u_id]', '$browser_id', '$state', '$settings', '$title', '$fname', '$security', '$robot', '$token', '$base_url', '$ip', '$logrocket', '$algo', '$flags', '$music_hash', '$annotations', '$keysig', '$species', '$cantus_hash', '$vocra', '$timesig', '$debug')
");
update_mistakes($mistakes);

echo "Published successfully\n";
echo "$root_eid\n";
echo "$eid\n";

if ($uname != 'rualark@gmail.com') {
  $res = send_mail(array('rualark@gmail.com'), array (
    'From' => "$site_name <noreply@$domain_mail>",
    'To' => 'rualark@gmail.com',
    'Subject' => "Published #$root_eid/$eid. $uname $title",
  ), "$uname published #$root_eid/$eid. $title:\r\n\r\n".
    "$url_main/exercise.php?id=$root_eid\r\n\r\n" .
    count($mistakes) . " mistakes" .
    "\r\n\r\nYou are receiving this email because you signed up for $site_name.\r\nPlease do not reply to this email.\r\nVisit $url_main/profile.php to modify your email notification settings.");
}
