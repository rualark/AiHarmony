<?php

if ($handle = opendir('musicxml')) {
  while (false !== ($entry = readdir($handle))) {
    if ($entry != "." && $entry != "..") {
      $url = substr($entry, 0, strpos($entry, ".xml"));
      echo "<a href=index.html?load=$url>$url</a><br>";
    }
  }
  closedir($handle);
}