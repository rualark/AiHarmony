<?php
require_once "lib/mlib.php";
require_once "lib/elib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

$suid = secure_variable("suid");

if (!$login_result = login()) {
  die ("<script language=javascript>location.replace('login.php?ru=user.php?suid=$suid');</script>");
}

if ($suid == 0) $suid = $uid;
load_suser();

if (!$ua['u_admin'] && $suid != $uid) {
  die ("<span style='color:red'>You do not have access to this user page");
}

$title = "$site_name: $sua[u_name]";

require_once "template/menu.php";
echo "<div class=container><br>";

echo "<h3><center>$sua[u_name]</center></h3>";

show_cantusin_stat($suid);
show_keysig_matrix($suid);
show_close_vocra_matrix($suid);
show_species_timesig_stat($suid);
show_species_voices_stat($suid);

if ($ua['u_admin']) {
  show_mistakes_stat($suid);
}

show_exercises($suid);

require_once "template/footer.php";
