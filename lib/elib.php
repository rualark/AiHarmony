<?php

$SEVERITY_RED = 80;
$species_names = array('Cantus', 1, 2, 3, 4, 5, 'Mixed', 'Free');
$timesigs = array('2/4', '3/4', '2/2', '4/4', '5/4', '6/4', '3/2');
$keysigs = array('C#', 'F#', 'B', 'E', 'A', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb');
$modes = array('major', 'minor', 'other');
$cantus_in = array('higher', 'middle', 'lower');
$vocras = array(
  'S' => 'Soprano',
  'A' => 'Alto',
  'T' => 'Tenor',
  'B' => 'Bass',
);

function get_species($st) {
  $cnt = array();
  $max_species = 0;
  if (strpos($st, 'C') === false) {
    if (strpos($st, '1') !== false) {
      $st[strpos($st, '1')] = 'C';
    }
  }
  for ($i=0; $i<strlen($st); ++$i) {
    $char = $st[$i];
    $cnt[$char] ++;
    if ($char == 'C') continue;
    if ($char > $max_species) $max_species = $char;
  }
  if (strlen($st) == 1) return 'Cantus';
  if (!$cnt['C']) return 'Free';
  if (strlen($st) == 2 && $cnt['C']) return $max_species;
  if (strlen($st) == 3 && $cnt['C'] && $cnt[1]) return $max_species;
  if ($cnt['5'] + $cnt['C'] == strlen($st)) return $max_species;
  return 'Mixed';
}

function get_mode($st) {
  if ($st == "major" || $st == "minor") return $st;
  return "other";
}

function show_elock($private) {
  GLOBAL $bheight, $vtypes;
  if ($private == 1) echo "<img style='vertical-align:bottom' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to all authenticated users' src=img/lock3.png height=$bheight> ";
  if ($private == 2) echo "<img style='vertical-align:bottom' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to author and administrators only' src=img/lock.png height=$bheight> ";
  if ($private >= 3) echo "<img style='vertical-align:bottom' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='Access allowed to author only' src=img/lock2.png height=$bheight> ";
}

function show_keysig_stat($suid) {
  $r = query("
    SELECT keysig, COUNT(*) AS cnt
    FROM exercises
    WHERE u_id=$suid AND keysig != ''
    GROUP BY keysig
    ORDER BY cnt DESC
  ");
  $n = mysqli_num_rows($r);
  echo "<p><table class='table table-striped table-bordered' style='max-width:300px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col>Key signature</th>";
  echo "<th scope=col>Exercises</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    echo "<td>$w[keysig]";
    echo "<td>$w[cnt]";
  }
  echo "</table>";
}

function show_mistakes_stat($suid) {
  $r = query("
    SELECT
      MAX(severity) AS severity,
      mtext,
      SUM(cnt) AS total,
      COUNT(*) AS exercises
    FROM exercises
    INNER JOIN mistakes USING (root_eid, eid)
    WHERE u_id=$suid
    GROUP BY mtext
    ORDER BY total DESC
    LIMIT 20
  ");
  $n = mysqli_num_rows($r);
  echo '<p><b>Most frequent mistakes:</b>';
  echo "<p><table class='table table-sm table-dark table-bordered' style='max-width:700px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col>Mistke</th>";
  echo "<th scope=col>Count</th>";
  echo "<th scope=col>Exercises</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    $color = '#dddd00';
    if ($w['severity'] > 80) $color='#ff8877';
    echo "<td><span style='color:$color'>$w[mtext]";
    echo "<td>$w[total]";
    echo "<td>$w[exercises]";
  }
  echo "</table>";
}

function show_cantusin_stat($suid) {
  GLOBAL $cantus_in;
  $r = query("
    SELECT species, COUNT(*) AS cnt
    FROM exercises
    WHERE u_id=$suid AND species != ''
    GROUP BY species
    ORDER BY cnt DESC
  ");
  $n = mysqli_num_rows($r);
  echo '<p><b>Exercises by voice with cantus:</b>';
  echo "<p><table class='table table-sm table-dark table-bordered' style='max-width:300px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Cantus in</th>";
  echo "<th scope=col class='text-center'>Exercises</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  $cnt = array();
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $species = $w['species'];
    $pos = strpos($species, 'C');
    if ($pos === false) continue;
    if (strlen($species) == 1) continue;
    if ($pos == 0) $cnt['higher'] += $w['cnt'];
    else if ($pos == strlen($species) - 1) $cnt['lower'] += $w['cnt'];
    else $cnt['middle'] += $w['cnt'];
  }
  foreach ($cantus_in as $in) {
    echo "<tr>";
    echo "<th class='text-right'>$in voice";
    echo "<td class='text-center'>" . $cnt[$in];
  }
  echo "</table>";
}

function show_keysig_matrix($suid) {
  GLOBAL $keysigs, $modes;
  $r = query("
    SELECT keysig, COUNT(*) AS cnt
    FROM exercises
    WHERE u_id=$suid AND keysig != ''
    GROUP BY keysig
    ORDER BY cnt DESC
  ");
  $n = mysqli_num_rows($r);
  $cnt = array();
  $mapping = array();
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $sa = explode(' ', $w['keysig']);
    $key = $sa[0] . ' ' . get_mode($sa[1]);
    $cnt[$key] += $w['cnt'];
    $mapping[$key][$w['keysig']] += $w['cnt'];
  }
  echo '<p><b>Exercises by key signature:</b>';
  echo "<p><table class='table table-sm table-bordered table-dark' style='max-width:350px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Key signature</th>";
  foreach ($modes as $mode) {
    echo "<th scope=col class='text-center'>";
    echo $mode;
  }
  echo "</thead>";
  echo "<tbody>";
  foreach ($keysigs as $keysig) {
    echo "<tr>";
    echo "<th class='text-right' >$keysig";
    foreach ($modes as $mode) {
      $key = $keysig . " " . $mode;
      $title = '';
      if ($mode == 'other') $title = implode(', ', array_keys($mapping[$key]));
      echo "<td class='text-center' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='$title'>" . $cnt[$key];
    }
  }
  echo "</table>";
}

function show_close_vocra_matrix($suid) {
  GLOBAL $vocras;
  $r = query("
    SELECT vocra, COUNT(*) AS cnt
    FROM exercises
    WHERE u_id=$suid AND vocra != ''
    GROUP BY vocra
    ORDER BY cnt DESC
  ");
  $n = mysqli_num_rows($r);
  $cnt = array();
  $mapping = array();
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $st = $w['vocra'];
    for ($v=0; $v<strlen($st)-1; $v++) {
      $key = $st[$v] . $st[$v + 1];
      $cnt[$key] += $w['cnt'];
      $mapping[$key][$w['vocra']] += $w['cnt'];
    }
  }
  echo '<p><b>Exercises by pairs of consecutive vocal ranges:</b>';
  echo "<p><table class='table table-sm table-dark table-bordered' style='max-width:350px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Vocal range</th>";
  foreach ($vocras as $vocra) {
    echo "<th scope=col class='text-center'>";
    echo $vocra;
  }
  echo "</thead>";
  echo "<tbody>";
  $x = 0;
  foreach ($vocras as $vocra) {
    ++$x;
    echo "<tr>";
    echo "<th class='text-right'>$vocra";
    $y = 0;
    foreach ($vocras as $vocra2) {
      ++$y;
      $class = '';
      if ($y < $x) $class = "bg-success";
      $key = $vocra2[0] . $vocra[0];
      $title = implode(', ', array_keys($mapping[$key]));
      echo "<td class='text-center $class' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='$title'>" . $cnt[$key];
    }
  }
  echo "</table>";
}

function show_timesig_stat($suid) {
  $r = query("
    SELECT timesig, COUNT(*) AS cnt
    FROM exercises
    WHERE u_id=$suid AND timesig != ''
    GROUP BY timesig
    ORDER BY cnt DESC
  ");
  $n = mysqli_num_rows($r);
  echo "<p><table class='table table-striped table-bordered' style='max-width:300px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Time signature</th>";
  echo "<th scope=col>Exercises</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    echo "<td class='text-right'>$w[timesig]";
    echo "<td>$w[cnt]";
  }
  echo "</table>";
}

function show_species_timesig_stat($suid) {
  GLOBAL $species_names, $timesigs;
  $r = query("
    SELECT timesig, species
    FROM exercises
    WHERE u_id=$suid AND species != '' AND timesig != ''
  ");
  $n = mysqli_num_rows($r);
  $cnt = array();
  $mapping = array();
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $species = get_species($w['species']);
    $key = $w['timesig'] . ':' . $species;
    $mapping[$key][$w['species']]++;
    $cnt[$key] ++;
  }
  echo '<p><b>Exercises by counterpoint species and time signature:</b>';
  echo "<p><table class='table table-sm table-bordered table-dark table-hover' style='max-width:570px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Time signature</th>";
  foreach ($species_names as $species) {
    echo "<th scope=col class='text-center'>";
    if (is_numeric($species)) echo "sp.";
    echo $species;
  }
  echo "</thead>";
  echo "<tbody>";
  foreach ($timesigs as $timesig) {
    echo "<tr>";
    echo "<th class='text-right'>$timesig";
    foreach ($species_names as $species) {
      $key = $timesig . ":" . $species;
      $title = implode(', ', array_keys($mapping[$key]));
      echo "<td class='text-center' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='$title'>" . $cnt[$key];
    }
  }
  echo "</table>";
}

function show_species_voices_stat($suid) {
  GLOBAL $species_names;
  $max_voices = 4;
  $r = query("
    SELECT species
    FROM exercises
    WHERE u_id=$suid AND species != ''
  ");
  $n = mysqli_num_rows($r);
  $cnt = array();
  $mapping = array();
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $species = get_species($w['species']);
    $voices = strlen($w['species']);
    $key = $voices . ':' . $species;
    $cnt[$key] ++;
    $mapping[$key][$w['species']]++;
    if ($voices > $max_voices) $max_voices = $voices;
  }
  echo '<p><b>Exercises by counterpoint species and key signature:</b>';
  echo "<p><table class='table table-sm table-bordered table-dark table-hover' style='max-width:540px'>"; // table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col class='text-right'>Voices</th>";
  foreach ($species_names as $species) {
    echo "<th scope=col class='text-center'>";
    if (is_numeric($species)) echo "sp.";
    echo $species;
  }
  echo "</thead>";
  echo "<tbody>";
  for ($voices=1; $voices<=$max_voices; ++$voices) {
    echo "<tr>";
    echo "<th class='text-right'>$voices voices";
    foreach ($species_names as $species) {
      $key = $voices . ":" . $species;
      $title = implode(', ', array_keys($mapping[$key]));
      echo "<td class='text-center' data-toggle=tooltip data-html=true data-container=body data-bondary=window data-placement=bottom title='$title'>" . $cnt[$key];
    }
  }
  echo "</table>";
}

function show_exercises($suid) {
  GLOBAL $ua, $uid, $login_result, $sua;
  if ($suid) {
    $cond = "WHERE exercises.u_id='$suid'";
    echo "<h3><center>Exercises published by $sua[u_name]</center></h3>";
  } else {
    echo "<h3><center>Exercises</center></h3>";
  }
  echo "<table class='table'>"; // table-striped table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col>ID</th>";
  echo "<th scope=col>Published</th>";
  if (!$suid) echo "<th scope=col>User</th>";
  echo "<th scope=col>Title</th>";
  echo "<th scope=col>Counterpoint</th>";
  echo "<th scope=col>Analysis</th>";
  echo "<th scope=col>Revisions</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";

  $r = query("
    SELECT * FROM exercises
    LEFT JOIN root_exercises USING (root_eid)
    LEFT JOIN users ON (exercises.u_id=users.u_id)
    $cond
    ORDER BY publish_time DESC
    LIMIT 1000
  ");
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    $uname = $w['u_name'] ? $w['u_name'] : $w['u_cookie'];
    // Authenticated
    if ($w['security'] > 0 && !$login_result) {
      continue;
    }
    // Admin
    if ($w['security'] == 2 && !$ua['u_admin'] && $ua['u_login'] != $w['u_cookie'] && $uid != $w['u_id']) {
      continue;
    }
    // Private
    if ($w['security'] == 3 && $ua['u_login'] != $w['u_cookie'] && $uid != $w['u_id']) {
      continue;
    }
    echo "<tr>";
    echo "<td>$w[root_eid]";
    echo ":$w[eid]";
    echo "<td><a href='exercise.php?id=$w[root_eid]'>$w[publish_time]</td>";
    if (!$suid) echo "<td><a href=user.php?suid=$w[u_id]>$uname</td>";
    echo "<td>";
    show_elock($w['security']);
    echo "<a href='exercise.php?id=$w[root_eid]'>";
    echo "$w[title]";
    echo "<td>";
    echo "$w[keysig] $w[timesig] $w[vocra] $w[species]";
    echo "<td> ";
    if ($w['algo'] == 'CA3') {
      if ($w['ecount'] < 100) {
        echo "<a target=_blank href='editor.html?state=$w[state]&rid=$w[root_eid]&eid=$w[eid]' role=button>";
        if ($w['flags'] == 0) {
          echo "✅";
        } else {
          if (floor($w['flags'] / 10000)) {
            echo floor($w['flags'] / 10000) . "🚩 &nbsp;";
          }
          if ($w['flags'] % 10000) {
            echo ($w['flags'] % 10000) . "⚠️";
          }
        }
        echo "</a>";
      } else {
        echo "<a href='exercise.php?id=$w[root_eid]'>...";
      }
    }
    echo "<td>$w[ecount] ";
    echo "</tr>";
  }
  echo "</tbody>";
  echo "</table>";
}
