<?php
require_once "lib/mlib.php";
require_once "lib/config.php";

$title = "$site_name: Privacy Policy";

require_once "template/menu.php";

echo "<div class=container>";

require_once "template/privacy.php";
require_once "template/footer.php";
