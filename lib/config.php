<?
$site_dir = $_SERVER['SCRIPT_NAME'];
$site_dir = substr($site_dir, 0, strrpos($site_dir, "/"));
$site_folder = substr($site_dir, strrpos($site_dir, "/") + 1);
$domain_main = "artinfuser.com";
$url_root = "https://$domain_main";
$url_main = "$url_root/$site_folder";
$url_share = "$url_root/$site_folder";
$url_root_ai = "https://$domain_main/artinfuser";

$docs_folder = "md";
$site_name = "Artinfuser Exercise";
$site_descr = "Edit and check music exercises";
$docs_menu_file = "_menu.txt";
$og_img = "og-counterpoint-600.jpg";
$favicon = "img/favicon-green.ico";

$company_name = "Artinfuser";
$company_email = "info@$domain_mail";
$country_name = "Russian Federation";
