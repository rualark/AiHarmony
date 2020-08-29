<?php
require_once "lib/mlib.php";
require_once "lib/elib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

$title = "$site_name: Exercises";
$login_result = login();

require_once "template/menu.php";
echo "<div class=container><br>";

show_exercises($suid);

require_once "template/footer.php";
