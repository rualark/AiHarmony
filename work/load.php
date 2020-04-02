<?php

function scan_dir($dir) {
  if ($handle = opendir($dir)) {
    while (false !== ($entry = readdir($handle))) {
      if ($entry == "." || $entry == "..") continue;
      if (is_file("$dir/$entry")) {
        $url = substr("$dir/$entry", 0, strpos("$dir/$entry", ".xml"));
        $url = str_replace("musicxml/", "", $url);
        $url = str_replace(" ", "+", $url);
        echo "st += '<a href=index.html?load=$url>$url</a><br>';\n";
      }
      else if (is_dir("$dir/$entry")) {
        scan_dir("$dir/$entry");
      }
    }
    closedir($handle);
  }
}

scan_dir('musicxml');
