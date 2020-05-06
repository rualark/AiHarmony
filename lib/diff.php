<?php

function get_diff($sa, $sa2, &$added, &$removed) {
  $added = array();
  $removed = array();
  // Trim
  for ($i=0; $i<mycount($sa); ++$i) {
    $pos = strpos($sa[$i], "#");
    // Changed from !== false to allow loading parameters starting from # symbol
    if ($pos > 0) {
      $sa[$i] = substr($sa[$i], 0, $pos);
    }
    // Skip full line comment
    else if ($pos === 0) $sa[$i] = "";
    $sa[$i] = trim($sa[$i]);
  }
  for ($i=0; $i<mycount($sa2); ++$i) {
    $pos = strpos($sa2[$i], "#");
    // Changed from !== false to allow loading parameters starting from # symbol
    if ($pos > 0) {
      $sa2[$i] = substr($sa2[$i], 0, $pos);
    }
    // Skip full line comment
    else if ($pos === 0) $sa2[$i] = "";
    $sa2[$i] = trim($sa2[$i]);
  }
  // Find removed
  for ($i=0; $i<mycount($sa); ++$i) {
    if ($sa[$i] == "") continue;
    $found = 0;
    for ($x=0; $x<mycount($sa2); ++$x) {
      if ($sa[$i] == $sa2[$x]) {
        $found = 1;
        break;
      }
    }
    if (!$found) {
      $removed[] = $sa[$i];
    }
  }
  // Find added
  for ($i=0; $i<mycount($sa2); ++$i) {
    if ($sa2[$i] == "") continue;
    $found = 0;
    for ($x=0; $x<mycount($sa); ++$x) {
      if ($sa2[$i] == $sa[$x]) {
        $found = 1;
        break;
      }
    }
    if (!$found) {
      $added[] = $sa2[$i];
    }
  }
}

function show_diff_changed($added, $removed) {
  $acol = "#DDFFDD";
  $acol2 = "#88FF88";
  $rcol = "#FFDDDD";
  $rcol2 = "#FF8888";
  $apar = array();
  $rpar = array();
  $aval = array();
  $rval = array();
  $rfound = array();
  echo "<pre><ul>";
  // Get keys
  for ($i=0; $i<mycount($added); ++$i) {
    $pos = strpos($added[$i], "=");
    if ($pos !== FALSE) {
      $apar[$i] = trim(substr($added[$i], 0, $pos));
      $aval[$i] = trim(substr($added[$i], $pos + 1));
    }
  }
  for ($i=0; $i<mycount($removed); ++$i) {
    $pos = strpos($removed[$i], "=");
    if ($pos !== FALSE) {
      $rpar[$i] = trim(substr($removed[$i], 0, $pos));
      $rval[$i] = trim(substr($removed[$i], $pos + 1));
    }
  }
  // Find keys
  for ($i=0; $i<mycount($added); ++$i) {
    $found = -1;
    if ($apar[$i] != "") {
      for ($x = 0; $x < mycount($removed); ++$x) {
        if ($apar[$i] == $rpar[$x]) {
          $found = $x;
          $rfound[$x] = 1;
          break;
        }
      }
    }
    if ($found == -1) {
      echo "<li><span data-toggle=tooltip data-placement=right title='Added' style='background-color: $acol2'><b>$added[$i]</b></span>";
    }
    else {
      if ($apar[$i] == "Instruments") {
        $sa = explode(",", $rval[$found]);
        $sa2 = explode(",", $aval[$i]);
        echo "<li><span style='background-color: $rcol'>$rpar[$found] = ";
        for ($z=0; $z<mycount($sa); ++$z) {
          if ($z > 0) echo ",";
          if ($sa[$z] != $sa2[$z]) echo "<span data-toggle=tooltip data-placement=right title='Deleted' style='background-color: $rcol2'><b>$sa[$z]</b></span>";
          else echo "$sa[$z]";
        }
        echo "</span>";
        echo "<li><span style='background-color: $acol'>$apar[$i] = ";
        for ($z=0; $z<mycount($sa2); ++$z) {
          if ($z > 0) echo ",";
          if ($sa[$z] != $sa2[$z]) echo "<span data-toggle=tooltip data-placement=right title='Added' style='background-color: $acol2'><b>$sa2[$z]</b></span>";
          else echo "$sa2[$z]";
        }
        echo "</span>";
      }
      else {
        echo "<li><span style='background-color: $rcol'>$rpar[$found] = <span data-toggle=tooltip data-placement=right title='Deleted' style='background-color: $rcol2'><b>$rval[$found]</b></span></span>";
        echo "<li><span style='background-color: $acol'>$apar[$i] = <span data-toggle=tooltip data-placement=right title='Added' style='background-color: $acol2'><b>$aval[$i]</b></span></span>";
      }
    }
  }
  for ($i=0; $i<mycount($removed); ++$i) {
    if ($rfound[$i]) continue;
    echo "<li><span data-toggle=tooltip data-placement=right title='Deleted' style='background-color: $rcol2'><b>$removed[$i]</b></span>";
  }
  echo "</ul></pre>";
}
?>