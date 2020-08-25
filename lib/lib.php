<?php
  ini_set('error_reporting', E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED & ~E_WARNING);
  //ini_set('error_reporting', E_ALL);
require_once "vendor/autoload.php";
require "sentry.php";

$bheight = 24;

$mtime = microtime(TRUE);

$qstring = $_SERVER['QUERY_STRING'];
if ($qstring == '') {
  foreach ($_POST as $key => $val) {
    if ($qstring != '') $qstring .= "&";
    $qstring .= "$key=" . str_replace("\"", "'", str_replace("\r\n", " ", $val));
  }
}

$note_name = array(
  0 => "C", // 0
	1 => "C#", // 1
  2 => "D", // 2
  3 => "D#", // 3
  4 => "E", // 4
  5 => "F", // 5
  6 => "F#", // 6
  7 => "G", // 7
  8 => "G#", // 8
  9 => "A", // 9
  10 => "A#", // 10
  11 => "B" // 11
);

function num_secure_variable($st) {
  $var = secure_variable($st);
  if ($var == "") return "";
  if (!is_numeric($var)) {
    die("Error in numeric variable $st = $var");
    //trigger_error("Error in numeric variable $st = $var", E_USER_ERROR);
  }
  return $var;
}

function mycount($ar) {
  if (!is_array($ar)) return 0;
  return count($ar);
}

function secure_variable($st) {
  if (isset($_GET[$st])) return $_GET[$st];
  if (isset($_POST[$st])) return $_POST[$st];
  return "";
}

function secure_variable_post($st) {
  if (isset($_POST[$st])) return $_POST[$st];
  return "";
}

function start_time() {
  GLOBAL $starttime, $starttime2;
  $mtime = microtime();
  $mtime = explode(" ",$mtime);
  $mtime = $mtime[1] + $mtime[0];
  if ($starttime2 == 0) $starttime2 = $mtime;
  $starttime = $mtime;
}

start_time();

function stop_time($st="", $show=1) {
  GLOBAL $starttime, $starttime2, $view_child;
  // Show run time
  $mtime = microtime();
  $mtime = explode(" ",$mtime);
  $mtime = $mtime[1] + $mtime[0];
  $endtime = $mtime;
  $totaltime = round($endtime - $starttime, 3);
  $totaltime2 = round($endtime - $starttime2, 3);
  if ($show>0) {
    echo "<p>The script ran ".$totaltime." seconds ";
    if ($totaltime2>$totaltime) echo "($totaltime2 total) ";
    echo "$st. ";
  }
  // Set all subsequent views to child
  $view_child=1;
  // Restart timer
  start_time();
}

function basename2($fname) {
  $pp = pathinfo($fname);
  return $pp['filename'];
}

// Get base filename
function bfname($st) {
  $pos = strrpos($st, ".");
  if (!$pos) return $st;
  return substr($st, 0, $pos);
}

function human_pass($s) {
  if ($s < 60) return "$s seconds";
  else if ($s < 3600) return round($s/60) . " minutes";
  else if ($s < 3600*24) return round($s/3600) . " hours";
  else if ($s < 3600*24*30) return round($s/3600/24) . " days";
  else if ($s < 3600*24*365) return round($s/3600/24/30) . " months";
  else return round($s/3600/24/365) . " years";
}

function human_pass2($s) {
  if ($s < 60) return "$s seconds";
  else if ($s < 3600) return round($s/60, 1) . " minutes";
  else if ($s < 3600*24) return round($s/3600, 1) . " hours";
  else if ($s < 3600*24*30) return round($s/3600/24, 1) . " days";
  else if ($s < 3600*24*365) return round($s/3600/24/30, 1) . " months";
  else return round($s/3600/24/365) . " years";
}

function human_pass3($s) {
  if ($s < 3600) return str_pad(floor($s/60), 2, '0', STR_PAD_LEFT) . ':' .
    str_pad($s%60, 2, '0', STR_PAD_LEFT);
  else return
    str_pad(floor($s/3600), 2, '0', STR_PAD_LEFT) . ':' .
    str_pad(floor(($s % 3600) / 60), 2, '0', STR_PAD_LEFT) . ':' .
    str_pad($s%60, 2, '0', STR_PAD_LEFT);
}

function human_filesize($bytes, $decimals = 2) {
  $size = array('B','KB','MB','GB','TB','PB','EB','ZB','YB');
  $factor = intval(floor((strlen($bytes) - 1) / 3));
  return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . " " . @$size[$factor];
}

function share_header($url, $title, $desc, $img) {
  echo "<meta property='og:type' content='website' />";
  echo "<meta property='og:url' content='$url' />";
  echo "<meta property='og:image' content='$img' />";
  echo "<meta property='og:title' content='$title' />";
  echo "<meta property='og:description' content='$desc' />";
}

function show_chatovod($name) {
  return;
  echo "<script type=\"text/javascript\">";
  echo "var chatovodOnLoad = chatovodOnLoad || [];";
  echo "chatovodOnLoad.push(function() {";
  echo "    chatovod.addChatButton({host: \"$name.chatovod.com\", align: \"bottomRight\",";
  echo "        width: 490, height: 600, defaultLanguage: \"en\"});";
  echo "});";
  echo "(function() {";
  echo "    var po = document.createElement('script');";
  echo "    po.type = 'text/javascript'; po.charset = \"UTF-8\"; po.async = true;";
  echo "    po.src = (document.location.protocol=='https:'?'https:':'http:') + '//st1.chatovod.com/api/js/v1.js?2';";
  echo "    var s = document.getElementsByTagName('script')[0];";
  echo "    s.parentNode.insertBefore(po, s);";
  echo "})();";
  echo "</script></div>";
}

function share_link($url, $title, $desc, $img, $services='facebook,vkontakte,gplus', $style='') {
  echo "
    <script type='text/javascript' src='//yastatic.net/es5-shims/0.0.2/es5-shims.min.js' charset='utf-8'></script>
    <script type='text/javascript' src='//yastatic.net/share2/share.js' charset='utf-8'></script>
    <div style='display: inline-block; $style' class='ya-share2'
    data-services='$services'
    data-counter=''
    data-description='$desc'
    data-title='$title'
    data-url='$url'
    data-image='$img'></div>
  ";
}

function listdir($dir='.') {
  if (!is_dir($dir)) {
    return false;
  }

  $files = array();
  listdiraux($dir, $files);

  return $files;
}

function listdiraux($dir, &$files) {
  $handle = opendir($dir);
  while (($file = readdir($handle)) !== false) {
    if ($file == '.' || $file == '..') {
      continue;
    }
    $filepath = $dir == '.' ? $file : $dir . '/' . $file;
    if (is_link($filepath))
      continue;
    if (is_file($filepath))
      $files[] = $filepath;
    else if (is_dir($filepath))
      listdiraux($filepath, $files);
  }
  closedir($handle);
}

function show_pagination($page, $pages, $url) {
  echo "<nav aria-label='...'>";
  echo "<ul class='pagination'>";
  echo "<li class='page-item disabled'>";
  echo "<a class='page-link' href='#' tabindex='-1'>Page:</a>";
  echo "</li>";
  for ($i=1; $i<=$pages; $i++) {
    echo "<li class='page-item";
    if ($i == $page) echo " active";
    echo "'><a class='page-link' href='$url&page=$i'>$i</a></li>";
  }
  echo "</ul></nav>";
}

function myexec($path) {
  exec( $path, $ra, $rv );
  //$output = "";
  //for ($x=0; $x<mycount($ra); $x++) $output .= $ra[$x]." ";
  //$path = iconv("cp866", "windows-1251", $path);
  //$output = iconv("cp866", "windows-1251", $output);
  //echo $path."<br>";
  //if ($rv != 0) echo "<font color=red>";
  //else echo "<font color=green>";
  //echo "<b>";
  //echo "Output: ". $output."<br>";
  //echo "</font></b>";
}

function GetNoteName($n) {
  GLOBAL $note_name;
  return $note_name[$n % 12] . floor($n / 12 - 1);
}

function translit($s) {
  $s = (string) $s; // преобразуем в строковое значение
  $s = strip_tags($s); // убираем HTML-теги
  $s = str_replace(array("\n", "\r"), " ", $s); // убираем перевод каретки
  $s = preg_replace("/\s+/", ' ', $s); // удаляем повторяющие пробелы
  $s = trim($s); // убираем пробелы в начале и конце строки
  //$s = function_exists('mb_strtolower') ? mb_strtolower($s) : strtolower($s); // переводим строку в нижний регистр (иногда надо задать локаль)
  $s = strtr($s, array('а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'j','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'c','ч'=>'ch','ш'=>'sh','щ'=>'shch','ы'=>'y','э'=>'e','ю'=>'yu','я'=>'ya','ъ'=>'','ь'=>'','А'=>'A','Б'=>'B','В'=>'V','Г'=>'G','Д'=>'D','Е'=>'E','Ё'=>'E','Ж'=>'J','З'=>'Z','И'=>'I','Й'=>'Y','К'=>'K','Л'=>'L','М'=>'M','Н'=>'N','О'=>'O','П'=>'P','Р'=>'R','С'=>'S','Т'=>'T','У'=>'U','Ф'=>'F','Х'=>'H','Ц'=>'C','Ч'=>'CH','Ш'=>'SH','Щ'=>'SHCH','Ы'=>'Y','Э'=>'E','Ю'=>'YU','Я'=>'YA','Ъ'=>'','Ь'=>''));
  $s = preg_replace("/[^0-9a-zA-Z_\-\.]/i", "", $s); // очищаем строку от недопустимых символов
  $s = str_replace(" ", "-", $s); // заменяем пробелы знаком минус
  return $s; // возвращаем результат
}

function show_option($opt, $var) {
  echo "<option value='$opt'";
  if ($var == $opt) echo " selected";
  echo ">$opt</option>";
}

function show_option2($opt, $name, $var) {
  echo "<option value='$opt'";
  if ($var == $opt) echo " selected";
  echo ">$name</option>";
}

function make_color($r, $g=-1, $b=-1) {
  if (is_array($r) && sizeof($r) == 3)
    list($r, $g, $b) = $r;

  $r = intval($r);
  $g = intval($g);
  $b = intval($b);

  $r = dechex($r<0?0:($r>255?255:$r));
  $g = dechex($g<0?0:($g>255?255:$g));
  $b = dechex($b<0?0:($b>255?255:$b));

  $color = (strlen($r) < 2?'0':'').$r;
  $color .= (strlen($g) < 2?'0':'').$g;
  $color .= (strlen($b) < 2?'0':'').$b;
  return '#'.$color;
}

function send_mail($recipients, $headers, $body) {
  GLOBAL $mail_method, $mail_params;
  $mail_object =& Mail::factory($mail_method, $mail_params);
  if (PEAR::isError($mail_object)) {
    echo $mail_object->getMessage() . "\n" . $mail_object->getUserInfo() . "\n";
    die();
  }
  return $mail_object->send($recipients, $headers, $body);
}

function mysql_log($type, $u_id, $f_id, $j_id, $txt, $txt2, $txt3) {
  GLOBAL $ml, $qstring;
  $txt = mysqli_real_escape_string($ml, $txt);
  $txt2 = mysqli_real_escape_string($ml, $txt2);
  $txt3 = mysqli_real_escape_string($ml, $txt3);
  if (isset($_SERVER["HTTP_X_REMOTE_ADDR"])) $analytics_ip =  $_SERVER["HTTP_X_REMOTE_ADDR"];
  else $analytics_ip = $_SERVER['REMOTE_ADDR'];
  $qstring = mysqli_real_escape_string($ml, $qstring);
  mysqli_query($ml, "INSERT INTO log VALUES(NOW(), '$type', '$u_id', '$f_id', '$j_id', '$txt', '$txt2', '$txt3', '$analytics_ip', '$_SERVER[HTTP_HOST]', '$_SERVER[SCRIPT_NAME]', '$qstring')");
  echo mysqli_error($ml);
}

function insert_analytics_hit($table, $hitserver, $hitscript, $hitquery, $u_id) {
  GLOBAL $analytics_ip, $ml;
  if (isset($_SERVER["HTTP_X_REMOTE_ADDR"])) $analytics_ip =  $_SERVER["HTTP_X_REMOTE_ADDR"];
  else $analytics_ip = $_SERVER['REMOTE_ADDR'];
  $hitquery = mysqli_real_escape_string($ml, $hitquery);
  $uag = mysqli_real_escape_string($ml, $_SERVER['HTTP_USER_AGENT']);
  $q = "INSERT INTO $table VALUES(NOW(), '$analytics_ip', '$hitserver', '$hitscript', \"$hitquery\", '$u_id', '$uag')";
  mysqli_query($ml, $q);
  echo mysqli_error($ml);
}

function my_mkdir($path, $mode, $recur) {
  if (is_dir($path)) return;
  mkdir($path, $mode, $recur);
}

function startsWith($string, $startString) {
  $len = strlen($startString);
  return (substr($string, 0, $len) === $startString);
}

function query($q) {
  GLOBAL $ml;
  $r = mysqli_query($ml, $q);
  $err = mysqli_error($ml);
  if ($err) {
    die("$err: $q<br>");
  }
  return $r;
}
