<?php
// Algorithms

$algo = array();

function load_algo() {
  GLOBAL $algo;
  $fa = file("algo/configs/algorithms.txt");
  for ($i=0; $i < mycount($fa); ++$i) {
    $st = $fa[$i];
    if ($st[0] == "#") continue;
    $sa = explode("|", $st);
    if (mycount($sa) < 8) continue;
    for ($x=0; $x<mycount($sa); ++$x) {
      $sa[$x] = trim($sa[$x]);
    }
    $acode = substr($sa[1], 3);
    $algo[$acode]['id'] = $sa[0];
    $algo[$acode]['folder'] = $sa[1];
    $algo[$acode]['mfi'] = $sa[2];
    $algo[$acode]['xfi'] = $sa[3];
    $sa2 = explode(":", $sa[4]);
    $algo[$acode]['site'] = $sa2[0];
    $algo[$acode]['site_group'] = $sa2[1];
    $algo[$acode]['name'] = $sa[5];
    $algo[$acode]['group'] = $sa[6];
    $algo[$acode]['comment'] = $sa[7];
    $algo[$acode]['upload comment'] = $sa[8];
  }
}

function show_algo($acode, $atitle) {
  GLOBAL $algo;
  $aw = $algo[$acode];
  //$link = "create.php?act=create&acode=$acode";
  if ($aw['mfi']) $link = "upload.php?acode=$acode";
  else $link = "algorithm.php?acode=$acode";
  echo "<div class=row>";
  echo "<div class=col-lg-6>";
  echo "<a class='btn btn-lg btn-outline-primary' href='$link' style='width: 100%; text-align: left; border-radius: 10px;'>";
  echo $algo[$acode]['name'];
  if ($acode == "CP1") echo " &nbsp;<img style='vertical-align: top' height=25 src=img/star-yellow.png>";
  echo "</a>";
  echo "</div>";
  echo "</div>";
  echo "<br>";
  return;
  /*
  echo "<div class='bg-primary cardmo shadow card' style='background-color: rgba(245, 245, 245, 1); border-radius: 10px;'>"; // bg-light
  //echo "<img class='card-img-top' style='border-radius: 10px;' src='img/algo/CP1.png' alt='Card image cap'>";
  echo "<div class=card-body style='color: white'>";
  echo "<a href=upload.php class='stretched-link'></a><h5 class=card-title style='color: white'>";
  echo "$aw[name]";
  echo "</h5>";
  echo "$aw[comment]";
  echo "</div>";
  echo "</div>";
  echo "<div style='line-height:100%'><br></div>";
  */
}

function create_gen_file($f_gen) {
  GLOBAL $ml, $uid, $f_site, $f_id, $waj, $default_ilist, $create_cause, $wf;
  // Insert into sql
  mysqli_query($ml, "INSERT INTO files 
    (f_time, f_private, u_id, f_format, f_gen, f_site, f_store)
    VALUES(NOW(), 0, '$uid', 'None', '$f_gen', '$f_site', 31)");
  echo mysqli_error($ml);
  // Set job folder
  $f_id = mysqli_insert_id($ml);
  $fname = "$f_gen-$f_id";
  mysqli_query($ml, "UPDATE files SET
    f_name='$fname', f_source='$fname'
    WHERE f_id='$f_id'");
  echo mysqli_error($ml);
  load_file();
  // Create jobs
  $create_cause = "Upload new file";
  create_jobs($f_gen, 2000);
  load_active_jobs();
  inject_config($waj[jcRENDER], "Instruments", $default_ilist);
}

load_algo();
