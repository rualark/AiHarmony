<?php
  //die("Site is currently in maintenance mode. Please check back later.");
require_once "lib.php";

// Job classes
define("jcANALYSE", 3);
define("jcCORRECT", 5);
define("jcGENERATE", 7);
define("jcRENDER", 9);

$bheight = 24;
$bheight2 = 36;
$wie = 0;
$wie = array();
$wfi = 0;
$wfi = array();
$voa = 0;
$voa = array();
$wf = 0;
$wj = 0;
$waj = 0;
$waj = array();
$caa = 0;
$caa = array();
$inames = 0;
$inames = array();
$igroups = 0;
$igroups = array();
$fia = array();
$sua = 0;
$stems_present = -1;

$major = array(1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1);

// Job priorities
// 3 - Highest priority for counterpoint analysis
// 4 - Priority for counterpoint correction
// 10-1010 - Priority for rendering jobs
// 1000000 - Priority for examples generation

$harm_notations = array(
  0 => 'Russian notation (Sposobin)',
  1 => 'Russian notation (detailed)',
  2 => 'Russian notation (detailed MAJOR / minor)',
  3 => 'International notation (Walter Piston)',
  4 => 'International notation (MAJOR / minor)',
  5 => 'International notation (detailed MAJOR / minor)'
);

$ui_verbosity = array(
  0 => 'Simple mode',
  5 => 'Advanced mode',
  10 => 'Expert mode'
);

$rule_verbosities = array(
  0 => 'MINIMUM: Show minimum information about each mistake',
  1 => 'MEDIUM: Add full technical name of each mistake',
  2 => 'MAXIMUM: Add full technical name and additional technical description for each mistake',
);

$min_severities = array(
  49 => 'ONLY MAIN MISTAKES: only critical (red) and important (yellow) mistakes',
  0 => 'ALL MISTAKES: critical (red), important (yellow) and informational (green) mistakes',
);

$cantus_highs = array(
  0 => 'AUTO DETECT',
  1 => 'Cantus firmus is in the lower part',
  2 => 'Cantus firmus is in the upper part'
);

$yesno_options = array(
  0 => "No",
  1 => "Yes"
);

$toload_times = array(
  0 => "Render whole track (no preview)",
  10 => "10 first seconds",
  20 => "20 first seconds",
  30 => "30 first seconds",
  45 => "45 first seconds",
  60 => "1 first minute",
  90 => "1.5 first minutes",
  120 => "2 first minutes",
  150 => "2.5 first minutes",
  180 => "3 first minutes",
  240 => "4 first minutes",
  300 => "5 first minutes",
  360 => "6 first minutes",
  480 => "8 first minutes",
  600 => "10 first minutes"
);

$mftypes = array(
  'Finale' => "Finale",
  'Sibelius' => "Sibelius",
  'MuseScore' => "MuseScore",
  'Other' => "Other"
);


$jclasses = array(
  jcANALYSE => "Analyse",
  jcCORRECT => "Correct",
  jcGENERATE => "Generate",
  jcRENDER => "Perform"
);

$sites = array(
  "studio", "algo", "counterpoint"
);

$export_types = array(
  0 => "No (render only master mix MP3)",
  1 => "Yes (render master mix MP3 + MP3 for each track)"
);

$store_periods = array(
  7 => "1 week",
  31 => "1 month",
  366 => "1 year",
  366000 => "Forever (stems - up to 1 year)", // 1000 years
  366001 => "Forever" // 1000 years
);

$vtypes = array(
  0 => "Public access",
  1 => "Unlisted",
  2 => "Group access",
  3 => "Private access"
);

$rule_variants = array(
  "" => "Auto",
  "-1;0;;;;" => "Allow",
  "0;100;;;;" => "Prohibit"
);

$page_breakings = array(
  "minimal-breaking" => "Dense",
  "page-turn-breaking" => "Sparse"
);

$reverb_mixes = array(
  0 => "Dry sound (0%)",
  10 => "Close chamber (10%)",
  20 => "Far chamber (20%)",
  30 => "Orchestra (30%)",
  40 => "Big orchestra (40%)",
  50 => "Very big orchestra (50%)",
  100 => "Infinite reverb (100%)"
);

$species_name = array(
  1 => "sp1",
  2 => "sp2",
  3 => "sp3",
  4 => "sp4",
  5 => "sp5"
);

$species_name2 = array(
  0 => "AUTO DETECT",
  1 => "Counterpoint species 1 - one whole note agains one whole note in cantus firmus",
  2 => "Counterpoint species 2 - two half notes against one whole note in cantus firmus",
  3 => "Counterpoint species 3 - four quarter notes against one whole note in cantus firmus",
  4 => "Counterpoint species 4 - sycopes of whole notes",
  5 => "Counterpoint species 5 - free rhythm"
);

$default_instr = "Piano";
$default_ilist = "Piano";
$MAX_INSTR = 64;

function load_instruments() {
  GLOBAL $ml, $wi, $wig, $wie, $instr_alias, $wiclass;
  $wi = array();
  $wig = array();
  $instr_alias = array();
  $r = mysqli_query($ml, "SELECT * FROM instr");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    if ($w['i_default']) {
      $igroup = $w['i_group'];
      $wig[] = $w;
      $instr_alias[$igroup] = array_map('trim', explode(',', $w['i_aliases']));
      array_unshift($instr_alias[$igroup], $igroup);
      $instr_alias[$igroup] = array_filter($instr_alias[$igroup]);
    }
    // For each instrument group build vector of instruments
    $wi[$w['i_group']][] = $w;
    // Set if instrument exists in particular group
    $wie[$w['i_group']][$w['i_name']] = $w;
  }
}

function load_cc($igroup, $iname) {
  GLOBAL $ml, $cc_names, $cc_ids;
  $cc_names = array();
  $cc_ids = array();
  $r = mysqli_query($ml, "SELECT * FROM i_cc WHERE i_group='$igroup' AND i_name='$iname'");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $cc_names[$w['cc_id']] = $w['cc_name'];
    $cc_ids[$w['cc_name']] = $w['cc_id'];
  }
  $cc_names[7] = "Volume";
  $cc_names[10] = "Pan";
}

function load_ksw($igroup, $iname) {
  GLOBAL $ml, $ksw_names;
  $ksw_names = array();
  $r = mysqli_query($ml, "SELECT * FROM i_ksw WHERE i_group='$igroup' AND i_name='$iname'");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $ksw_names[$w['ksw_note']] = $w['ksw_name'];
  }
}

function load_finstruments() {
  GLOBAL $ml, $wfi, $wf;
  $wfi = array();
  $r = mysqli_query($ml, "SELECT * FROM ftracks WHERE f_id='$wf[f_id]'");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $wfi[$w['fi_lid']] = $w;
  }
}

function furl($w) {
  return $w['f_folder'] . $w['f_name'];
}

function bfurl($w) {
  $pp = pathinfo(furl($w));
  return $pp['dirname']."/".$pp['filename'];
}

function jurl($w) {
  return $w['j_folder'] . $w['f_name'];
}

function bjurl($w) {
  $fname = jurl($w);
  $pos = strrpos($fname, ".");
  if (!$pos) return $fname;
  $fname = substr($fname, 0, $pos);
  return $fname;
}

function load_file() {
  GLOBAL $f_id, $ml, $wf;
  $r = mysqli_query($ml, "SELECT * FROM files 
    LEFT JOIN users USING (u_id)
    WHERE f_id='$f_id'");
  echo mysqli_error($ml);
  $wf = mysqli_fetch_assoc($r);
}

function load_job($j_id) {
  GLOBAL $ml, $f_id;
  $r = mysqli_query($ml, "SELECT * FROM jobs
    LEFT JOIN files USING (f_id) 
    LEFT JOIN users USING (u_id)
    WHERE j_id='$j_id'");
  echo mysqli_error($ml);
  $wj = mysqli_fetch_assoc($r);
  $f_id = $wj['f_id'];
  return $wj;
}

function get_job_starter($wj) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT * FROM users WHERE u_id='$wj[started_u_id]'");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  return $w;
}

function load_job_config($fname) {
  if (!is_file($fname)) return "";
  return file_get_contents($fname);
}

function parse_job_config($fname) {
  GLOBAL $duplicate_ca;
  $ca = array();
  if (!is_file($fname)) return $ca;
  $fa = file($fname);
  for($i=0; $i<mycount($fa); ++$i) {
    $st = $fa[$i];
    $pos = strpos($st, "#");
    // Changed from !== false to allow loading parameters starting from # symbol
    if ($pos > 0) {
      $st = substr($st, 0, $pos);
    }
    $pos = strpos($st, "=");
    if ($pos !== false) {
      $key = substr($st, 0, $pos);
      $val = substr($st, $pos+1, strlen($st));
      $key = trim($key);
      $val = trim($val, " \t\n\r\0\x0B\"");
      //$key = strtolower($key);
      if (isset($ca[$key])) {
        if (!is_array($duplicate_ca[$key]))
          $duplicate_ca[$key][] = $ca[$key];
        $duplicate_ca[$key][] = $val;
      }
      $ca[$key] = $val;
    }
  }
  return $ca;
}

function parse_jobs_config($waj) {
  GLOBAL $root_folder, $duplicate_caa, $duplicate_ca;
  $caa = array();
  foreach($waj as $key => $val) {
    $caa[$key] = parse_job_config("{$root_folder}share/" . $val['j_folder'] . bfname($val['f_name']) . ".pl");
    $duplicate_caa[$key] = $duplicate_ca;
  }
  return $caa;
}

function save_job_config($wj, $jconfig) {
  file_put_contents("share/" . $wj['j_folder'] . bfname($wj['f_name']) . ".pl", $jconfig);
}

$drafts = 0;
$non_drafts = 0;

function load_active_jobs() {
  GLOBAL $f_id, $ml, $waj, $drafts, $non_drafts;
  $waj = array();
  $r = mysqli_query($ml, "SELECT *,
    TIMESTAMPDIFF(SECOND, j_updated, NOW()) as pass_updated
    FROM jobs
    LEFT JOIN files USING (f_id) 
    LEFT JOIN users USING (u_id)
    WHERE jobs.f_id='$f_id' AND j_deleted=0");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $waj[$w['j_class']] = $w;
  }
  // If there are draft jobs
  $drafts = ($waj[jcANALYSE] && !$waj[jcANALYSE]['j_state']) +
    ($waj[jcCORRECT] && !$waj[jcCORRECT]['j_state']) +
    ($waj[jcGENERATE] && !$waj[jcGENERATE]['j_state']) +
    ($waj[jcRENDER] && !$waj[jcRENDER]['j_state']);
  // If there are non-draft jobs
  $r = mysqli_query($ml, "SELECT COUNT(*) AS cnt FROM jobs
    WHERE f_id='$f_id' AND j_state!=0");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  $non_drafts = $w['cnt'];
}

function create_job($j_gen, $j_class, $j_timeout, $j_timeout2, $j_priority, $j_engrave, $j_render) {
  GLOBAL $ml, $uid, $f_id, $wf, $create_cause, $wj, $j_id, $root_folder;
  // Get maximum lj_id
  $r = mysqli_query($ml, "SELECT MAX(lj_id) as mx FROM jobs WHERE f_id='$f_id'");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  $lj_id = 1;
  if ($w['mx'] > 0) $lj_id = $w['mx'] + 1;
  // Create job draft
  mysqli_query($ml, "INSERT INTO jobs 
    (j_added, j_priority, j_gen, j_class, f_id, j_timeout, j_timeout2, 
    j_engrave, j_render, j_cause, lj_id)
    VALUES(NOW(), '$j_priority', '$j_gen', '$j_class', '$f_id', '$j_timeout', '$j_timeout2', 
    '$j_engrave', '$j_render', '$create_cause', '$lj_id')");
  echo mysqli_error($ml);
  // Set job folder
  $j_id = mysqli_insert_id($ml);
  $j_folder = "jobs/" . date("Y/m-d") . "/$uid-$j_id/";
  mysqli_query($ml, "UPDATE jobs SET j_folder='$j_folder' WHERE j_id='$j_id'");
  echo mysqli_error($ml);
  $wj = load_job($j_id);
  mkdir("{$root_folder}share/" . substr($j_folder, 0, strlen($j_folder) - 1), 0777, true);
  // Copy config
  $fname_pl = "{$root_folder}share/$j_folder".bfname($wf['f_name']).".pl";
  copy("{$root_folder}configs/Gen$j_gen.pl", $fname_pl);
  file_put_contents($fname_pl, "\n", FILE_APPEND);
  // Append midi file to config if not generating
  if ($wf['f_format'] == "MIDI") {
    if ($j_class != jcGENERATE) {
      file_put_contents($fname_pl, "Midi_file = \"server\\cache\\" . $wf['f_name'] . "\"\n", FILE_APPEND);
      // Append correct to config if correcting
      if ($j_class  == jcCORRECT) {
        inject_config($wj, "corrections", "1", "Enable correcting notes");
      }
    }
  }
  // Append XML file to config if not generating
  if ($wf['f_format'] == "MusicXML") {
    if ($j_class != jcGENERATE) {
      file_put_contents($fname_pl, "MusicXML_file = \"server\\cache\\" . $wf['f_name'] . "\"\n", FILE_APPEND);
    }
  }
  // Append file id and task id
  file_put_contents($fname_pl, "ctools_task_id = \"$j_id\"\n", FILE_APPEND);
  file_put_contents($fname_pl, "ctools_file_id = \"$f_id\"\n", FILE_APPEND);
  file_put_contents($fname_pl, "ctools_file_name = \"$wf[f_source]\"\n", FILE_APPEND);
  return $j_id;
}

// Specifying j_class will create jobs only of this class
function create_jobs($f_gen, $j_priority) {
  if ($f_gen == "CA1" || $f_gen == "CA2") {
    //create_job($f_gen, jcRENDER, 60, 80, $j_priority, 0, 12000);
    create_job($f_gen, jcCORRECT, 300, 340, 1801, 600, 0);
    //create_job($f_gen, jcANALYSE, 60, 80, 1800, 600, 0);
  }
  else if ($f_gen == "CA3") {
    create_job($f_gen, jcRENDER, 60, 80, $j_priority, 0, 12000);
    create_job($f_gen, jcANALYSE, 60, 80, 4, 600, 0);
  }
  else if ($f_gen == "CF1") {
    create_job($f_gen, jcRENDER, 120, 160, $j_priority, 600, 12000);
  }
  else if ($f_gen == "CP1") {
    create_job($f_gen, jcRENDER, 120, 160, $j_priority, 600, 12000);
  }
  else if ($f_gen == "CP3") {
    create_job($f_gen, jcRENDER, 120, 160, $j_priority, 600, 12000);
  }
  else if ($f_gen == "MP1") {
    create_job($f_gen, jcRENDER, 300, 340, $j_priority, 0, 12000);
  }
}

function multi_inject_config($wj, $ca) {
  GLOBAL $ua;
  // Do not inject info empty config
  if ($wj['j_folder'] == '') return;
  $fname_pl =  "share/".$wj['j_folder'] . bfname($wj['f_name']).".pl";
  $last_string = "\n";
  // Read config
  $fa = file($fname_pl);
  // Write config without required tags
  $fh = fopen($fname_pl, 'w');
  for ($i=0; $i<mycount($fa); ++$i) {
    $found = 0;
    foreach($ca as $key => $val) {
      if (stripos($fa[$i], "$key ") === 0 || stripos($fa[$i], "$key=") === 0) {
        $found = 1;
        break;
      }
    }
    if ($found) continue;
    fwrite($fh, $fa[$i]);
    $last_string = $fa[$i];
  }
  $date = date("Y-m-d H:i:s");
  foreach($ca as $key => $val) {
    // Do not write empty parameter
    if ($val === "") continue;
    // Write newline
    if ($last_string[strlen($last_string) - 1] != "\n") fwrite($fh, "\n");
    // Write tag
    $st = "$key = \"$val\"";
    $st .= " # Injected by $ua[u_name] at $date";
    $st .= "\n";
    $last_string = $st;
    fwrite($fh, "$st");
    change_job($wj, 1, "$key = \"$val\"");
  }
  fclose($fh);
}

function inject_config($wj, $tag, $value="", $comm="") {
  GLOBAL $ua, $root_folder;
  // Do not inject info empty config
  if ($wj['j_folder'] == '') return;
  $fname_pl =  "{$root_folder}share/".$wj['j_folder'] . bfname($wj['f_name']).".pl";
  $last_string = "\n";
  // Read config
  $fa = file($fname_pl);
  // Write config without tag
  $fh = fopen($fname_pl, 'w');
  $found = array();
  for ($i=0; $i<mycount($fa); ++$i) {
    if (stripos($fa[$i], "$tag ") === 0 || stripos($fa[$i], "$tag=") === 0) {
      $found[] = $fa[$i];
      continue;
    }
    fwrite($fh, $fa[$i]);
    $last_string = $fa[$i];
  }
  // Do not write empty parameter
  if ($value === "") {
    for ($i=0; $i<mycount($found); ++$i) {
      change_job($wj, 1, "Revert to default: " . $found[$i]);
    }
    fclose($fh);
    return;
  }
  // Write newline
  if ($last_string[strlen($last_string) - 1] != "\n") fwrite($fh, "\n");
  // Write tag
  $st = "$tag = \"$value\"";
  $date = date("Y-m-d H:i:s");
  $st .= " # $comm";
  if ($comm != "") $st .= ". ";
  $st .= "Injected by $ua[u_name] at $date";
  fwrite($fh, "$st\n");
  fclose($fh);
  change_job($wj, 1, "$tag = \"$value\"");
}

// Set job changed flag
function change_job($wj, $important, $st) {
  GLOBAL $ml;
  $date = date("Y-m-d H:i:s");
  if ($important) {
    mysqli_query($ml, "UPDATE jobs SET j_changes=j_changes+1, 
      j_changes_st=CONCAT(j_changes_st, '$date $st\n')
      WHERE j_id=$wj[j_id]");
  }
  mysqli_query($ml, "UPDATE jobs SET  
      j_log=CONCAT(j_log, '$date $st\n') 
      WHERE j_id=$wj[j_id]");
  echo mysqli_error($ml);
}

// Set job changed flag
function change_jobs($f_id, $important, $st) {
  GLOBAL $ml;
  $date = date("Y-m-d H:i:s");
  if ($important) {
    mysqli_query($ml, "UPDATE jobs SET j_changes=j_changes+$important, 
     j_changes_st=CONCAT(j_changes_st, '$date $st\n') 
      WHERE f_id=$f_id");
  }
  mysqli_query($ml, "UPDATE jobs SET 
    j_log=CONCAT(j_log, '$date $st\n') 
    WHERE f_id=$f_id");
  echo mysqli_error($ml);
}

function deactivate_job($j_id) {
  GLOBAL $ml;
  mysqli_query($ml, "UPDATE jobs SET j_deleted=1 WHERE j_id='$j_id'");
  echo mysqli_error($ml);
}

function deactivate_jobs($j_class) {
  GLOBAL $f_id, $ml;
  mysqli_query($ml, "UPDATE jobs SET j_deleted=1 WHERE f_id='$f_id' AND j_class='$j_class'");
  echo mysqli_error($ml);
}

function deactivate_all_jobs() {
  GLOBAL $f_id, $ml;
  mysqli_query($ml, "UPDATE jobs SET j_deleted=1 WHERE f_id='$f_id'");
  echo mysqli_error($ml);
}

function delete_old_drafts() {
  GLOBAL $f_id, $ml;
  // Delete deactivated drafts
  mysqli_query($ml, "DELETE FROM jobs WHERE f_id='$f_id' AND j_state=0 AND j_deleted=1");
  echo mysqli_error($ml);
}

function replace_instrument($inst_id, $inst, $iconf) {
  GLOBAL $caa;
  $ilist = $caa[jcRENDER]['Instruments'];
  $ia = explode(",", $ilist);
  if ($inst == "") {
    $iname = $ia[$inst_id];
    if (strpos($iname, "/") !== false) $iname = substr($iname, 0, strpos($iname, "/"));
  }
  else $iname = $inst;
  if ($iconf != "") $iname .= "/$iconf";
  $ia[$inst_id] = $iname;
  $ilist = implode(",", $ia);
  return $ilist;
}

function change_ilist_len($ilist, $len) {
  GLOBAL $default_instr;
  $ia = explode(",", $ilist);
  if ($ilist == "") $ia = array();
  if (mycount($ia) < $len) {
    for ($i=0; $i<$len - mycount($ia); ++$i) {
      if ($ilist != "") $ilist .= ",";
      $ilist .= "$default_instr";
    }
  }
  else if (mycount($ia) > $len) {
    $ilist = "";
    for ($i=0; $i<$len; ++$i) {
      if ($ilist != "") $ilist .= ",";
      $ilist .= $ia[$i];
    }
  }
  return $ilist;
}

function map_instruments() {
  GLOBAL $track_name, $track_count, $wig, $ml, $wf, $first_track, $instr_alias;
  if ($track_count <= 1) return "Piano";
  $ilist = "";
  for ($i=$first_track; $i<$track_count; ++$i) {
    $iname = $track_name[$i];
    $iname2 = "Piano";
    $found = 0;
    // Find full match
    foreach ($wig as $key => $w) {
      foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
        //if ($iname == "Violini I") echo "Compare `$alias` to `$iname`<br>";
        if ($alias == $iname) {
          $iname2 = $w['i_group'];
          $found = 9;
          break;
        }
      }
    }
    // Find lower full match
    if (!$found) foreach ($wig as $key => $w) {
      foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
        if (strtolower($alias) == strtolower($iname)) {
          $iname2 = $w['i_group'];
          $found = 8;
          break;
        }
      }
    }
    if ($iname != "") {
      // Find starting match
      $matched = 0;
      if (!$found) foreach ($wig as $key => $w) {
        foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
          if (strpos(strtolower($alias), strtolower($iname)) === 0) {
            if (strlen($iname) > $matched) {
              $matched = strlen($iname);
              $iname2 = $w['i_group'];
              $found = 7;
            }
          }
        }
      }
      // Find starting match
      $matched = 0;
      if (!$found) foreach ($wig as $key => $w) {
        foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
          if (strpos(strtolower($iname), strtolower($alias)) === 0) {
            if (strlen($alias) > $matched) {
              $matched = strlen($alias);
              $iname2 = $w['i_group'];
              $found = 7;
            }
          }
        }
      }
      // Find match
      $matched = 0;
      if (!$found) foreach ($wig as $key => $w) {
        foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
          if (strpos(strtolower($alias), strtolower($iname)) !== false) {
            if (strlen($iname) > $matched) {
              $matched = strlen($iname);
              $iname2 = $w['i_group'];
              $found = 6;
            }
          }
        }
      }
      $matched = 0;
      if (!$found) foreach ($wig as $key => $w) {
        foreach ($instr_alias[$w['i_group']] as $key2 => $alias) {
          if (strpos(strtolower($iname), strtolower($alias)) !== false) {
            if (strlen($alias) > $matched) {
              $matched = strlen($alias);
              $iname2 = $w['i_group'];
              $found = 5;
            }
          }
        }
      }
    }
    // Add instrument
    if ($ilist != "") $ilist .= ",";
    $ilist .= $iname2;
    mysqli_query($ml, "UPDATE ftracks SET fi_found='$found' 
      WHERE f_id='$wf[f_id]' AND fi_lid='".($i + 1 - $first_track)."'");
    echo mysqli_error($ml);
  }
  return $ilist;
}

function show_lock($private) {
  GLOBAL $bheight, $vtypes;
  if ($private == 1) echo "<img title='$vtypes[$private]' src=img/lock3.png height=$bheight> ";
  if ($private == 2) echo "<img title='$vtypes[$private]' src=img/lock.png height=$bheight> ";
  if ($private >= 3) echo "<img title='$vtypes[$private]' src=img/lock2.png height=$bheight> ";
}

function load_midifile($fname) {
  GLOBAL $midiclass;
  if (!is_file($fname)) return 1;
  try {
    $midiclass->importMid($fname);
  } catch (Exception $e) {
    return 1;
  }
  return 0;
}

function reload_inames_from_file() {
  GLOBAL $track_count, $track_name, $first_track, $midi_duration, $f_id, $ml,
         $midi_ppq, $track_notes, $track_minnote, $track_maxnote, $wf,
         $mti, $midi_file_type;
  get_tracknames();
  if ($track_count) {
    // For counterpoint with single voice allow two voices
    if ($track_count - $first_track == 1 && $wf['f_gen'] == 'CA2') {
      $track_name[$first_track + 1] = $track_name[$first_track];
      $track_notes[$first_track + 1] = $track_notes[$first_track];
      $track_minnote[$first_track + 1] = $track_minnote[$first_track];
      $track_maxnote[$first_track + 1] = $track_maxnote[$first_track];
      $track_count += 1;
    }
    if ($first_track) $f_name0 = mysqli_escape_string($ml, $track_name[0]);
    else $f_name0 = "";
    mysqli_query($ml, "UPDATE files SET 
      f_dur='$midi_duration', f_ppq='$midi_ppq', f_firsttrack='$first_track',
      f_icount='$track_count', f_name0='$f_name0', f_midi_type='$midi_file_type',
      f_t0_channels='" . mycount($mti[0]->ch_on_cnt) . "',
      f_predict_dur=f_dur * (0.2 + 3.4/29 * (f_icount - f_firsttrack)), f_predict_cost=f_predict_dur * 0.08 / 60
      WHERE f_id='$f_id'");
    echo mysqli_error($ml);
    mysqli_query($ml, "DELETE FROM ftracks WHERE f_id='$f_id'");
    echo mysqli_error($ml);
    for ($i = $first_track; $i < $track_count; ++$i) {
      mysqli_query($ml, "REPLACE INTO ftracks 
        (f_id, fi_lid, fi_name, fi_found, fi_notes, fi_minnote, fi_maxnote, fi_cc1, fi_cc7) 
        VALUES('$f_id', '".($i + 1 - $first_track)."', '" .
        mysqli_escape_string($ml, $track_name[$i]) . "', 9, 
        '$track_notes[$i]', '$track_minnote[$i]', '$track_maxnote[$i]', '" .
        $mti[$i]->cc_cnt[1] . "', '" . $mti[$i]->cc_cnt[7] . "')");
      echo mysqli_error($ml);
    }
  }
}

function remap_instruments() {
  GLOBAL $track_count, $waj;
  if ($track_count) {
    load_instruments();
    $ilist = map_instruments();
    inject_config($waj[jcRENDER], "Instruments", $ilist);
  }
}

function detect_mftype() {
  GLOBAL $mftype, $waj;
  inject_config($waj[jcRENDER], "MidiFileType", $mftype);
}

function get_iabbr($iname) {
  GLOBAL $wi;
  return $wi[$iname][0]['i_abbr'];
}

function get_iabbr_list($st) {
  $sa = explode(",", $st);
  $alist = "";
  foreach ($sa as $key => $iname) {
    $iname = trim($iname, " \t\n\r\0\x0B\"");
    if (strpos($iname, "/") !== false) {
      $iname = substr($iname, 0, strpos($iname, "/"));
    }
    if ($key > 7) {
      $alist .= "...";
      break;
    }
    if ($alist != "") $alist .= ",";
    $alist .= "<span data-toggle=tooltip data-placement=top title=\"$iname\">" . get_iabbr($iname) . "</span>";
  }
  return $alist;
}

function get_tr_inst() {
  GLOBAL $igroups, $inames, $caa, $wi;
  $ia = explode(",", $caa[jcRENDER]['Instruments']);
  $id = 0;
  foreach ($ia as $key => $val) {
    $val = trim($val);
    if (strpos($val, "/") !== false) {
      $igroup = substr($val, 0, strpos($val, "/"));
      $iname = substr($val, strpos($val, "/") + 1);
    }
    else {
      $igroup = $val;
      $iname = $wi[$val][0]['i_name'];
    }
    $igroups[$id] = $igroup;
    $inames[$id] = $iname;
    ++$id;
  }
}

function get_inst_badges($w, $all=1) {
  $clist = "";
  if ($w['trem_maxlen'] > 0) {
    if ($w['cc_dynamics'] > 0)
      $clist .=
        "<span data-toggle=tooltip data-placement=top title='Tremolo is automatically detected and replaced with correct sound, with continuout dynamics control' class='circledtext'>T</span>";
    else
      $clist .=
        "<span data-toggle=tooltip data-placement=top title='Tremolo is automatically detected and replaced with correct sound. Dynamics is controlled only at start of tremolo note.' class='circledtext2'>T</span>";
  }
  if ($all) {
    if ($w['pedal_import'] > 0) $clist .=
      "<span data-toggle=tooltip data-placement=top title='Pedal can be used to control instrument' class='circledtext'>P</span>";
    if ($w['replacepitch']) $clist .=
      "<span data-toggle=tooltip data-placement=top title='Any pitch is replaced with target pitch' class='circledtext'>R</span>";
    if ($w['poly'] == 1) $clist .=
      "<span data-toggle=tooltip data-placement=top title='Monophonic instrument' class='circledtext'>M</span>";
  }
  return $clist;
}

function apply_custvol($st) {
  GLOBAL $waj, $igroups, $inames, $votr, $voa;
  $sa = explode("|", $st);
  for ($i=0; $i<mycount($sa); ++$i) {
    if ($sa[$i] == "") continue;
    $sa2 = explode(":", $sa[$i]);
    $tr = $sa2[0] - 1;
    if (mycount($sa2) == 2) {
      $tvol[$tr] = $sa2[1];
    }
    else {
      $sta = $sa2[1];
      inject_config($waj[jcRENDER], "\"$igroups[$tr]/$inames[$tr]/" . ($tr + 1) . "/$sta\": Pan", $sa2[2]);
    }
  }
  for ($v = mycount($voa) - 1; $v >= 0; --$v) {
    if ($v && $voa[$v]['src_id'] == $voa[$v - 1]['src_id']) continue;
    // Get current target track
    $tr = $voa[$v]['src_id'] - 1;
    $stage = $voa[$v]['stage'];
    $track = $voa[$v]['track'];
    $my_vol = 100;
    if (isset($tvol[$tr])) {
      $my_vol = $tvol[$tr];
      inject_config($waj[jcRENDER], "\"$igroups[$tr]/$inames[$tr]/" . ($tr + 1) . "\": Volume", $my_vol);
    }
    else {
      for ($v2 = mycount($voa) - 1; $v2 >= 0; --$v2) {
        $tr2 = $voa[$v2]['src_id'] - 1;
        $stage2 = $voa[$v2]['stage'];
        $track2 = $voa[$v2]['track'];
        if ($stage2 == $stage && $track2 == $track && isset($tvol[$tr2])) {
          $my_vol = $tvol[$tr2];
          inject_config($waj[jcRENDER], "\"$igroups[$tr]/$inames[$tr]/" . ($tr + 1) . "\": Volume", $my_vol);
          break;
        }
      }
    }
  }
}

function load_voices($wj) {
  GLOBAL $voa, $votr;
  $voa = array();
  $votr = array();
  $fname = "share/$wj[j_folder]" . basename2($wj['f_name']) . ".csv";
  if (!is_file($fname)) return;
  $fa = file($fname);
  for ($i=1; $i<mycount($fa); ++$i) {
    $sa = explode(";", $fa[$i]);
    $voa[$sa[2]]['src_id'] = $sa[0];
    $voa[$sa[2]]['src_name'] = $sa[1];
    $voa[$sa[2]]['i_group'] = $sa[3];
    $voa[$sa[2]]['i_name'] = $sa[4];
    $voa[$sa[2]]['stage'] = $sa[5];
    $voa[$sa[2]]['track'] = $sa[6];
    $voa[$sa[2]]['reverb'] = $sa[10];
    $votr[$sa[5]][$sa[6]] = $sa[2];
  }
}

function map_stems($wj) {
  GLOBAL $submix_fname, $mix_fname, $stem_fname;
  $submix_fname = array();
  $stem_fname = array();
  if ($wj['j_folder'] == "") return;
  $fl = listdir("share/$wj[j_folder]");
  for ($x=0; $x<mycount($fl); ++$x) {
    $fname = $fl[$x];
    $fname = str_replace("//", "/", $fname);
    if (substr($fname, strlen($fname) - 4) != ".png") continue;
    if (substr($fname, strlen($fname) - 5) == "_.png") continue;
    $cname = basename2($fname);
    $fname2 = basename2($wj['f_name']);
    if (substr($cname, 0, strlen($fname2)) == $fname2) {
      $cname = substr($cname, strlen($fname2) + 1);
    }
    if ($cname == "") $mix_fname = $fname;
    else if (is_numeric($cname)) $submix_fname[$cname] = $fname;
    else {
      if ($cname[2] == "-") {
        $track = substr($cname, 0, 2) - 3;
        $stage = substr($cname, strrpos($cname, "_") + 1) + 0;
        if (!isset($stem_fname[$stage][$track])) $stem_fname[$stage][$track] = $fname;
        //else echo "Error: $fname exists<br>";
      }
    }
  }
}

function icf($ca, $tr, $param, $default) {
  GLOBAL $igroups, $inames;
  //echo "TR $tr IG $igroups[$tr] IN $inames[$tr] PA $param<Br>";
  //echo "\"$igroups[$tr]/$inames[$tr]/".($tr+1)."\": $param";
  if (isset($ca["\"$igroups[$tr]/$inames[$tr]/".($tr+1)."\": $param"]))
    return $ca["\"$igroups[$tr]/$inames[$tr]/".($tr+1)."\": $param"];
  else return $default;
}

function icf_sta($ca, $tr, $sta, $param, $default) {
  GLOBAL $igroups, $inames;
  //echo "TR $tr IG $igroups[$tr] IN $inames[$tr] PA $param<Br>";
  if (isset($ca["\"$igroups[$tr]/$inames[$tr]/".($tr+1)."/$sta\": $param"]))
    return $ca["\"$igroups[$tr]/$inames[$tr]/".($tr+1)."/$sta\": $param"];
  else return $default;
}

// Find mp3 for particular track
function find_mp3($wj, $tr, $sta) {
  $fl = listdir("share/$wj[j_folder]");
  $fa = array();
  for ($x=0; $x<mycount($fl); ++$x) {
    $fname = $fl[$x];
    $fname = str_replace("//", "/", $fname);
    if (substr($fname, strlen($fname) - 5 - strlen($sta)) != "_$sta.mp3") continue;
    //$fa[] = $fname;

    $starting = substr(basename2($fname), 0, strlen(basename2($wj['f_name'])) + 4);
    $starting2 = basename2($wj['f_name']) . "-" .
      str_pad($tr + 3, 2, "0", STR_PAD_LEFT) . "-";
    //echo "$starting<br>";
    //echo "$starting2<br>";
    if ($starting != $starting2) continue;
    return $fname;
  }
  return "";
}

function vol2db($vol, $vol_default, $db_max, $db_coef) {
  // Zero volume is -infinite db
  if (!$vol) return -INF;
  if ($vol > 100) {
    return round(($vol - 100) / 5, 1);
  }
  // Get vol to CC coef
  $vol_to_cc = $vol_default / 100;
  // Get CC
  $cc = $vol * $vol_to_cc;
  // Get default db
  $db_default = (pow($vol_default/127.0, 0.007) - 1) * 1250 * $db_coef + $db_max;
  // Get db
  $db = (pow($cc/127.0, 0.007) - 1) * 1250 * $db_coef + $db_max;
  // Round
  return round(($db - $db_default), 1);
}

function stems_exist() {
  GLOBAL $stems_present, $voa, $stem_fname;
  if ($stems_present != -1) return $stems_present;
  foreach ($voa as $v => $w) {
    $sta = $w['stage'];
    $tr = $w['track'];
    $fname = $stem_fname[$sta][$tr];
    $fname3 = str_replace(".png", ".mp3", $fname);
    if (is_file($fname3)) {
      $stems_present = 1;
      return $stems_present;
    }
  }
  $stems_present = 0;
}

function get_file_hash($fname) {
  return hash_file('sha512', $fname);
}

function get_hash_id($fname) {
  GLOBAL $ml;
  $hash = get_file_hash($fname);
  $size = filesize($fname);
  // Does hash already exist?
  $r2 = mysqli_query($ml, "SELECT h_id FROM file_hash WHERE f_hash='$hash' AND f_size='$size'");
  $n2 = mysqli_num_rows($r2);
  if ($n2) {
    $w2 = mysqli_fetch_assoc($r2);
    $h_id = $w2['h_id'];
  }
  else {
    $r3 = mysqli_query($ml, "INSERT INTO file_hash (f_hash, f_size) VALUES('$hash', '$size')");
    $h_id = mysqli_insert_id($ml);
  }
  return $h_id;
}

function copy_config($j_id, $wj) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT * FROM jobs LEFT JOIN files USING (f_id) WHERE j_id='$j_id'");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  // Check if job exists
  if ($w['j_id'] != $j_id) return 1;
  // Check if file does not differ much
  if ($w['f_icount'] != $wj['f_icount']) {
    echo "<script>alert('Cannot apply existing config because MIDI file has different track count: $w[f_icount], not $wj[f_icount]');</script>";
    return 1;
  }
  if ($w['f_firsttrack'] != $wj['f_firsttrack']) {
    echo "<script>alert('Cannot apply existing config because MIDI file has different track structure');</script>";
    return 1;
  }
  if ($w['f_ppq'] != $wj['f_ppq']) {
    echo "<script>alert('Cannot apply existing config because MIDI file has different PPQ');</script>";
    return 1;
  }
  // Copy mysql file config
  $q = "UPDATE files SET f_stems='$w[f_stems]', f_private='$w[f_private]', f_store='$w[f_store]' WHERE f_id='$wj[f_id]'";
  //echo "<script>alert(\"$j_id, $w[f_id], $q\");</script>";
  $r2 = mysqli_query($ml, $q);
  echo mysqli_error($ml);
  // Load source config
  $ca = parse_job_config("share/" . $w['j_folder'] . bfname($w['f_name']) . ".pl");
  // Remove parameters, that should not be copied
  unset($ca['Midi_file']);
  unset($ca['ctools_task_id']);
  unset($ca['ctools_file_id']);
  unset($ca['ctools_file_name']);
  unset($ca['MidiFileType']);
  multi_inject_config($wj, $ca);
  // Config was copied, which means that instruments were all set to desired. Remove flag fi_found
  mysqli_query($ml, "UPDATE ftracks SET fi_found=9 WHERE f_id='$wj[f_id]'");
  echo mysqli_error($ml);
  return 0;
}

function wie($st) {
  GLOBAL $iname, $igroup, $wie;
  return $wie[$igroup][$iname][$st];
}

function show_aiharmony() {
  GLOBAL $site_folder;
  if ($site_folder == "counterpoint") {
    echo "<div class='text-white bg-success'>";
    echo "<div class='p-2'>"; // d2ffaa
    echo "  <p align=center class='card-text' style='color: white'><b>Try our <a style='color: #aaddff' href=https://artinfuser.com/exercise target=_blank>online exercise editor</a> with integrated counterpoint analysis.</b>";
    echo "</div>";
    echo "</div>";
  }
}
