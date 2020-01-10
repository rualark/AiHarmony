<!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset='utf-8'>
  <meta http-equiv="content-type" content="text/html" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harmony</title>
  <script src="plugin/abcjs-5.10.3/abcjs_basic_5.10.3-min.js" type="text/javascript"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
  <link rel="stylesheet" href="plugin/bootstrap-4.3.1/css/bootstrap.min.css">
</head>
<?php
require_once "css/style.php";
?>
<body style='touch-action: pan-x pan-y;'>
<?php
$btnclass = "btn btn-outline-white p-1";
//$btnclass = "btn btn-outline-secondary p-1";
//$border = "1px solid black";
$border = "0px";
echo "<div style='position: fixed; top: 0; left: 0; z-index: 99; background-color: white; -webkit-backface-visibility: hidden; width: 100%; overflow: auto; white-space: nowrap; border:$border; border-bottom: 1px solid #dddddd; padding: 2px;'>";
echo "<a id='len6' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/len6.png height=35></a>&nbsp;";
echo "<a id='len5' class='$btnclass' href=# onclick='return false;' role='button'>&nbsp;<img src=img/notes/len5.png height=35>&nbsp;</a>&nbsp;";
echo "<a id='len4' class='$btnclass' href=# onclick='return false;' role='button'>&nbsp;<img src=img/notes/len4.png height=35>&nbsp;</a>&nbsp;";
echo "<a id='len3' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/len3.png height=35></a>&nbsp;";
echo "<a id='len2' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/len2.png height=35></a>&nbsp;";
echo "<a id='dot' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/dot.png height=35></a>&nbsp;";
echo "<a id='tie' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/tie.png height=35></a>&nbsp;";
echo "<div style='display: inline-block; height: 100%; vertical-align: middle;'><img src=img/gray.png style='vertical-align: middle; opacity: 0.3' height=30 width=1></div>&nbsp;";
echo "<a id='note_c' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;C&nbsp;</a>&nbsp;";
echo "<a id='note_d' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;D&nbsp;</a>&nbsp;";
echo "<a id='note_e' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;E&nbsp;</a>&nbsp;";
echo "<a id='note_f' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;F&nbsp;</a>&nbsp;";
echo "<a id='note_g' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;G&nbsp;</a>&nbsp;";
echo "<a id='note_a' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;A&nbsp;</a>&nbsp;";
echo "<a id='note_b' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.5em;'>&nbsp;B&nbsp;</a>&nbsp;";
echo "<div style='display: inline-block; height: 100%; vertical-align: middle;'><img src=img/gray.png style='vertical-align: middle; opacity: 0.3' height=30 width=1></div>&nbsp;";
echo "<a id='natural' class='$btnclass' href=# onclick='return false;' role='button'>&nbsp;<img src=img/notes/natural.png height=35>&nbsp;</a>&nbsp;";
echo "<a id='sharp' class='$btnclass' href=# onclick='return false;' role='button'>&nbsp;<img src=img/notes/sharp.png height=35>&nbsp;</a>&nbsp;";
echo "<a id='flat' class='$btnclass' href=# onclick='return false;' role='button'>&nbsp;<img src=img/notes/flat.png height=35>&nbsp;</a>&nbsp;";
echo "<div style='display: inline-block; height: 100%; vertical-align: middle;'><img src=img/gray.png style='vertical-align: middle; opacity: 0.3' height=30 width=1></div>&nbsp;";
echo "<a id='up8' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.2em;'>+8ve</a>&nbsp;";
echo "<a id='down8' class='$btnclass' href=# onclick='return false;' role='button' style='font-family: sans-serif; font-size: 1.2em;'>-8ve</a>&nbsp;";
echo "<div style='display: inline-block; height: 100%; vertical-align: middle;'><img src=img/gray.png style='vertical-align: middle; opacity: 0.3' height=30 width=1></div>&nbsp;";
echo "<a id='pause' class='$btnclass' href=# onclick='return false;' role='button'><img src=img/notes/pause.png height=35></a>&nbsp;";
echo "</div>";

//echo "<div style='position: fixed; top: 60px; left: 0; z-index: 99; width: 100%; overflow: hidden; border:$border;padding: 10px;'>";
echo "<div style='position: fixed; bottom: 50px; right: 20px; z-index: 99'>";
echo "<a href=# onclick='notation_zoom(1.1); return false;'><img width=40 style='opacity: 0.15' align=right src=img/zoom-in.png></a><br>";
echo "<a href=# onclick='notation_zoom(0.9); return false;'><img width=40 style='opacity: 0.15' align=right src=img/zoom-out.png></a>";
echo "</div>";
//echo "</div>";

echo "<h5>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Harmonic exercise #7</h5>";
echo "<div style='border: $border; position:relative; width: 100%; height: 100px; display: inline-block'>";
//echo "<div style='width: 100%; position: absolute; top: 0px; left: 0px; '>";
//echo "</div>";
echo "<div style='position: absolute; top: 0px; left: 0px; ' id='notation'></div>";
echo "</div>";
?>
<script src=js/harmony.js></script>
<script defer type='text/javascript' src='plugin/jquery-3.4.1/jquery-3.4.1.min.js'></script>
<script defer src="plugin/bootstrap-4.3.1/js/bootstrap.bundle.min.js"></script>
