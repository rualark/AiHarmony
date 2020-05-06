<?php
require_once "lib/mlib.php";
require_once "lib/config.php";
require_once "lib/doclib.php";

$d = strtolower(secure_variable("d"));
if ($d == "") $d = "cp_start";

//parse_docs();
load_docs_titles();
get_docs($d);
load_docs_menu($d);

$title = "$site_name: $docs_title";

require_once "template/menu.php";

echo "<link href='css/docs.css' rel=stylesheet />";

echo "<br>";
echo "<div class=container>";
echo "<div class=row>";
echo $docs_menu_st;
show_docs($d);
echo "</div>";

require_once "template/footer.php";
