<?php
require_once "lib/mlib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

login();
$title = "$site_name: $site_descr";

require_once "template/menu.php";

require_once "template/guest-counterpoint.php";

require_once "template/footer.php";
