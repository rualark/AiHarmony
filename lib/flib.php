<?php

function show_upload_midi_header() {
  GLOBAL $wf, $bheight, $ua;
  echo "<div class=container>";
  echo "<br><h2 align=center>";
  if ($wf['f_deleted']) echo "<img data-toggle=tooltip data-placement=top title='This file was deleted' src='img/delete.png' height='$bheight'> ";
  if ($ua['u_verbose'] > 2)
    echo "<a href='share/$wf[f_folder]$wf[f_name]'><img data-toggle=tooltip data-placement=top title='Download source MIDI file' src='img/midi.png' height='$bheight'></a> ";
  show_lock($wf['f_private']);
  echo "$wf[f_source]";
  if ($wf['f_store'] == 366000) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire (tracks MP3 will expire in one year)' src=img/infinity-green.png height=15> ";
  if ($wf['f_store'] == 366001) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire' src=img/infinity-red.png height=15> ";
  echo "</h2>";
  echo "<h5 align=center>$wf[f_name0]</h5>";
  //echo "<hr>";
}

function initial_process_midi() {
  GLOBAL $caa, $wf, $waj;
  // Process midi file for the first time
  if ($caa[jcRENDER]['MidiFileType'] == "") {
    load_midifile("share/$wf[f_folder]$wf[f_name]");
    reload_inames_from_file();
    detect_mftype();
    $caa = parse_jobs_config($waj);
  }
}

function show_task_icons($f_id) {
  GLOBAL $ml;
  $order = "j_class ";
  $cond = " AND f_id='$f_id'";
  $r = mysqli_query($ml, "SELECT * FROM jobs
    INNER JOIN files USING (f_id) 
    LEFT JOIN users USING (u_id)
    WHERE j_deleted=0 $cond 
    ORDER BY $order
    LIMIT 200");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $wj = mysqli_fetch_assoc($r);
    echo "<span id='js$wj[j_id]'>";
    echo show_job_icon($wj, 1, 36);
    echo "</span> ";
  }
}

function show_tab($id, $name, $onclick) {
  echo "<li class='nav-item'>";
  echo "<a class='nav-link' id='$id-tab' data-toggle='tab' href='#$id' 
    role='tab' aria-controls='$id' aria-selected='true' onclick='$onclick'><b>$name</b></a>";
  echo "</li>";
}

function show_midi_tabs($wj) {
  GLOBAL $master_mp3_exist, $tab, $ua;
  echo "<div style='line-height:50%'><br></div>";
  echo "<div id=tabs>";
  echo "<ul class='nav nav-tabs' id='myTabs' role='tablist'>";
  show_tab("multitrack", "Parts", "warn_editor_changed()");
  show_tab("settings", "Settings", "warn_editor_changed()");
  show_tab("files", "Files", "");
  if ($wj['j_class'] > 8 && $wj['j_state'] > 0 && $ua['u_verbose'] > 6) {
    show_tab("instruments", "MIDI", "");
  }
  if ($wj['j_class'] > 8 && $wj['j_state'] > 2 && stems_exist() && $ua['u_verbose'] > 0) {
    show_tab("stems", "Solo parts", "");
  }
  if ($ua['u_verbose'] > 8) {
    show_tab("config", "Config", "setTimeout(function () {refresh_editors();}, 500);");
  }
  if ($ua['u_verbose'] > 6) {
    show_tab("info", "Info", "");
  }
  if ($ua['u_verbose'] > 8) {
    show_tab("similar", "Similar", "");
  }
  echo "</ul>";
  echo "</div>";
  if ($tab == "") $tab = "multitrack";
  echo "<script>window.addEventListener('DOMContentLoaded', function() { $('#$tab-tab').click(); } );</script>";
  echo "<div style='line-height:50%'><br></div>";
}

function start_tab($id) {
  echo "<div class='tab-pane fade show' id='$id' role='tabpanel' aria-labelledby='$id-tab'>";
}

function show_midi_settings() {
  GLOBAL $caa, $toload_times, $export_types, $wf, $vtypes, $store_periods, $ua,
    $reverb_mixes, $mftypes, $bheight, $yesno_options, $cost_enabled;
  echo '<div class="collapse-container1" style="width: 100%">';
  echo '<div class="collapse-header1"  align=left><span>Playback settings</span></div>';
  echo '<div class="collapse-content1">';

  start_gval_select('Reverb', 5, 'reverb_mix', 0, 'gval', 'setgval', 1, '', '',
    'Increase reverb to emulate playing in a larger space');
  if (!isset($caa[jcRENDER]['reverb_mix'])) $caa[2]['reverb_mix'] = 30;
  foreach ($reverb_mixes as $key => $val) {
    echo "<option value=$key";
    if ($key == $caa[jcRENDER]['reverb_mix']) {
      $found = 1;
      echo " selected";
    }
    echo ">$val</option>";
  }
  if (!$found) {
    echo "<option style='font-style: italic' value={$caa[jcRENDER]['reverb_mix']} selected>{$caa[jcRENDER]['reverb_mix']}% reverb</option>";
  }
  echo "</select>";
  echo "</div>";
  echo "<div class=col-sm-5>";
  show_soundcheck("Piano", "Hard/Reverb0", "Piano with reverb 0%");
  show_soundcheck("Piano", "Hard/Reverb10", "Piano with reverb 10%");
  show_soundcheck("Piano", "Hard/Reverb20", "Piano with reverb 20%");
  show_soundcheck("Piano", "Hard/Reverb30", "Piano with reverb 30%");
  show_soundcheck("Piano", "Hard/Reverb40", "Piano with reverb 40%");
  show_soundcheck("Piano", "Hard/Reverb50", "Piano with reverb 50%");
  show_soundcheck("Piano", "Hard/Reverb100", "Piano with reverb 100%");
  echo "</div></div>";

  if ($ua['u_verbose'] > 0) {
    start_gval_select('Preview render', 10, 'toload_time', 0, 'gval', 'setgval', 1,
      '', '', 'If rendering a whole track takes long, choose to render only starting portion of a track. Preview renders are quieter, because volume is not maximized to make processing faster.');
    $found = 0;
    foreach ($toload_times as $key => $val) {
      if ($key > $wf['f_dur']) break;
      echo "<option value=$key";
      if ($key == $caa[jcRENDER]['toload_time']) {
        $found = 1;
        echo " selected";
      }
      echo ">$val";
      if ($cost_enabled && $wf['f_dur']) {
        if ($key) {
          echo " - $" . round($wf['f_predict_cost'] * $key / $wf['f_dur'], 2);
        }
        else {
          echo " - $$wf[f_predict_cost]";
        }
      }
      echo "</option>";
    }
    if (!$found) {
      echo "<option style='font-style: italic' value={$caa[jcRENDER]['toload_time']} selected>{$caa[jcRENDER]['toload_time']} first seconds</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }
  if ($ua['u_verbose'] > 0) {
    start_gval_select('Maximize master volume', 10, 'f_normalize', 0, 'action', 'f_normalize', 0, '', '', 'Master track volume will be maximized after render. Volume is not increased after preview render.');
    foreach ($yesno_options as $key => $val) {
      echo "<option value=$key";
      if ($key == $wf['f_normalize']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  if ($ua['u_verbose'] > 1) {
    start_gval_select('Add slurs', 10, 'AutoLegato', 0, 'gval', 'setgval', 1,
      '', '', 'Randomly adds slurs to adjacent notes if slurs were not specified in notation editor. Pay attention that stepwise motion and shorter leaps get greater probability to have a slur, while longer leaps have less chances to get a slur automatically.');
    $found = 0;
    echo "<option value=0";
    if ($caa[jcRENDER]['AutoLegato'] == 0) {
      $found = 1;
      echo " selected";
    }
    echo ">Do not add slurs automatically</option>";
    for ($i=1; $i<10; ++$i) {
      $val = $i * 10;
      echo "<option value=$val";
      if ($caa[jcRENDER]['AutoLegato'] == $val) {
        $found = 1;
        echo " selected";
      }
      echo ">Automatically add slurs to $val% of adjacent notes</option>";
    }
    $val = $i * 10;
    echo "<option value=200";
    if ($caa[jcRENDER]['AutoLegato'] == 200) {
      $found = 1;
      echo " selected";
    }
    echo ">Automatically add slurs to 100% of adjacent notes</option>";
    if (!$found) {
      echo "<option style='font-style: italic' value={$caa[jcRENDER]['AutoLegato']} selected>Automatically add slurs to {$caa[jcRENDER]['AutoLegato']}% of adjacent notes</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  if ($ua['u_verbose'] > 3) {
    start_gval_select('Autopan voices', 10, 'StagePanInvert', stems_exist()?1:0, 'gval', 'setgval', 1, '', '',
      'If you do not use autopan, all voices of the same instrument type (e.g. flute) will sound from the same point in space. Enabling autopan mirrors panning of all odd voices of current instrument type');
    if (!isset($caa[jcRENDER]['StagePanInvert'])) $caa[jcRENDER]['StagePanInvert'] = 1;
    echo "<option value=0";
    if ($caa[jcRENDER]['StagePanInvert'] == 0) echo " selected";
    echo ">Pan all voices of the same instrument to the same default position</option>";
    echo "<option value=1";
    if ($caa[jcRENDER]['StagePanInvert'] == 1) echo " selected";
    echo ">Automatically distribute panning of the voices of the same instrument</option>";
    echo "</select>";
    echo "</div></div>";
  }

  if ($ua['u_verbose'] > 8) {
    if (!isset($caa[jcRENDER]['rnd_tempo'])) $caa[jcRENDER]['rnd_tempo'] = 6;
    start_gval_select('Randomize tempo', 10, 'rnd_tempo', 0, 'gval', 'setgval', 1, '', '',
      'Adds a smooth random function to tempo within specified maximum percentage of initial tempo (see Rendering algorithms in Docs)');
    echo "<option value=0";
    if ($caa[jcRENDER]['rnd_tempo'] == 0) echo " selected";
    echo ">Disable randomization</option>";
    for ($i=1; $i<40; ++$i) {
      echo "<option value=$i";
      if ($caa[jcRENDER]['rnd_tempo'] == $i) echo " selected";
      echo ">$i% of initial tempo</option>";
    }
    echo "</select>";
    echo "</div></div>";

    if (!isset($caa[jcRENDER]['rnd_tempo_slow'])) $caa[jcRENDER]['rnd_tempo_slow'] = 1;
    start_gval_select('Tempo randomization period', 10, 'rnd_tempo_slow', 0, 'gval', 'setgval', 1, '', '',
    'Increase this parameter to make random tempo changes slower (see Rendering algorithms in Docs)');
    for ($i=1; $i<40; ++$i) {
      echo "<option value=$i";
      if ($caa[jcRENDER]['rnd_tempo_slow'] == $i) echo " selected";
      echo ">about " . $i*7 . " seconds</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  if ($ua['u_verbose'] > 0) {
    start_gval_select('Render separate tracks', 10, 'f_stems', 0, 'action', 'f_stems', 1, '', '',
      'Disable rendering separate tracks to make rendering faster. This will prevent you from downloading MP3 for each track and using multitrack player to solo multiple tracks, change volume and panning');
    foreach ($export_types as $key => $val) {
      echo "<option value=$key";
      if ($key == $wf['f_stems']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }
  end_collapse_container(1, "Playback options", "block");

  echo "<div style='line-height:50%'><br></div>";
  echo '<div class="collapse-container3" style="width: 100%">';
  echo '<div class="collapse-header3"  align=left><span>General settings</span></div>';
  echo '<div class="collapse-content3">';

  if ($ua['u_verbose'] > 1) {
    start_gval_select('Store results', 10, 'f_store', 0, 'action', 'f_store', 0, '', '', 'How long resulting MP3 files will be stored');
    foreach ($store_periods as $key => $val) {
      if ($key > 366 && $wf['f_store'] != $key && !$ua['u_admin']) continue;
      echo "<option value=$key";
      if ($key == $wf['f_store']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  start_gval_select('Visibility', 10, 'f_private', 0, 'action', 'f_private', 0, '', '', 'Set visibility of this file and its processing results');
  foreach ($vtypes as $key => $val) {
    echo "<option value=$key";
    if ($key == $wf['f_private']) echo " selected";
    echo ">$val</option>";
  }
  echo "</select>";
  echo "</div></div>";
  echo "</p>";

  start_gval_select('MIDI file source', 4, 'MidiFileType', 0, 'gval', 'setgval', 1, '', '',
    'Usually MIDI file source is detected correctly. Set it manually to ensure that file is processed correctly');
  foreach ($mftypes as $key => $val) {
    echo "<option value=$key";
    if ($key == $caa[jcRENDER]['MidiFileType']) echo " selected";
    echo ">$val</option>";
  }
  echo "</select>";
  echo "</div>";
  echo "<div class=col-sm-2>";
  if ($caa[jcRENDER]['MidiFileType'] != "Other") {
    echo " <a href='docs.php?d=re_" . $caa[jcRENDER]['MidiFileType'] . "'><img src='img/question.png' height='$bheight'></a> ";
  }
  echo "</div>";
  echo "</div>";

  show_file_midi_actions();

  end_collapse_container(3, "General options", "block");
  send_settings_scripts();
}

function show_file_info($wj) {
  GLOBAL $wf, $ml, $f_id, $cost_enabled;

  if ($wf['f_format'] == "None") echo "<b>Created:</b> ";
  else echo "<b>Uploaded:</b> ";
  echo "$wf[f_time] by ";
  echo "<a href='files.php?suid=$wf[u_id]'>$wf[u_name]</a>";

  echo "<br><b>Total files size on disk:</b> ";
  $r = mysqli_query($ml, "SELECT SUM(j_size) as size FROM jobs WHERE f_id=$f_id");
  $w = mysqli_fetch_assoc($r);
  echo human_filesize($w['size'], 2);

  if ($wf['f_format'] == "MIDI") {
    echo "<br><b>Midi file duration:</b> " . gmdate("H:i:s", $wf['f_dur']);
    echo "<br><b>Midi file PPQ:</b> $wf[f_ppq] (notes start from track $wf[f_firsttrack])";
    if ($cost_enabled)
      echo "<br><b>One full processing cost:</b> $$wf[f_predict_cost] (discount 100%)";
  }
  if ($wf['f_format'] == "MusicXML") {
    if ($wf['f_encoder'] != '') echo "<br><b>Encoder:</b> $wf[f_encoder]";
    if ($wf['f_software'] != '' || $wf['f_encoding_description'] != '') echo "<br><b>Software:</b> $wf[f_software] $wf[f_encoding_description]";
    if ($wf['f_encoding_date'] != '') echo "<br><b>Encoding date:</b> $wf[f_encoding_date]";
    if ($wf['f_composer'] != '') echo "<br><b>Composer:</b> $wf[f_composer]";
    if ($wf['f_arranger'] != '') echo "<br><b>Arranger:</b> $wf[f_arranger]";
    if ($wf['f_rights'] != '') echo "<br><b>Rights:</b> $wf[f_rights]";
  }
  echo "<div style='line-height:50%'><br></div>";
}

function show_file_midi_actions() {
  GLOBAL $wf, $ml, $f_id, $ua, $uid;
  if ($wf['u_id'] == $uid || $ua['u_admin'] ) {
    if ($ua['u_verbose'] > 100) {
      echo "<a class=\"btn btn-outline-primary\" href='store.php?action=reload_inames&f_id=$f_id' role=\"button\">
    Reload instrument names from midi file</a> ";

      echo "<a class=\"btn btn-outline-danger\" href='store.php?action=remap_instruments&f_id=$f_id' role=\"button\">
    Remap instruments (overwrites manual mapping)</a> ";
    }
  }
  echo "<br>";
}

function show_job_diffs($wj) {
  $path = "share/" . $wj['j_folder'];
  $fname = $path . bfname($wj['f_name']) . ".pl";
  if (show_job_diff($wj, 1, $path . "config-log/config_1.pl", $fname)) return;
  if (show_job_diff($wj, 2, $path . "config-log/config_2.pl", $path . "config-log/config_1.pl")) return;
  if (show_job_diff($wj, 3, $path . "config-log/config_3.pl", $path . "config-log/config_2.pl")) return;
  if (show_job_diff($wj, 4, $path . "config-log/config_4.pl", $path . "config-log/config_3.pl")) return;
  if (show_job_diff($wj, 5, $path . "config-log/config_5.pl", $path . "config-log/config_4.pl")) return;
  if (show_job_diff($wj, 6, $path . "config-log/config_6.pl", $path . "config-log/config_5.pl")) return;
  if (show_job_diff($wj, 7, $path . "config-log/config_7.pl", $path . "config-log/config_6.pl")) return;
  if (show_job_diff($wj, 8, $path . "config-log/config_8.pl", $path . "config-log/config_7.pl")) return;
  if (show_job_diff($wj, 9, $path . "config-log/config_9.pl", $path . "config-log/config_8.pl")) return;
  if (show_job_diff($wj, 10, $path . "config-log/config_10.pl", $path . "config-log/config_9.pl")) return;
}

function show_job_diff($wj, $ver, $fname, $fname2) {
  GLOBAL $f_id, $ml;
  if (!file_exists($fname)) return 1;
  if (!file_exists($fname2)) return 1;
  $sa = file($fname);
  $sa2 = file($fname2);
  $sa3 = explode(" ", end($sa));
  echo "<b>Config changes since <a href='$fname' target='_blank'>$sa3[1] $sa3[2] (render $ver)</a>:</b><br>";
  get_diff($sa, $sa2, $added, $removed);
  show_diff_changed($added, $removed);
  return 0;
}

function show_similar_files() {
  GLOBAL $ml, $wf;
  $r = mysqli_query($ml, "SELECT * FROM files
    LEFT JOIN users USING (u_id) 
    WHERE (f_source='$wf[f_source]' OR h_id=$wf[h_id]) AND (f_deleted=0 OR f_id=$wf[f_id])
    ORDER BY f_time DESC");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  echo "<h4>Files with same name or same content, ordered by upload time</h4>";
  echo "<table class='table'>"; // table-striped table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th>File name";
  echo "<th>Content";
  echo "<th>Upload time";
  echo "<th>Uploaded by";
  echo "</thead>";
  echo "<tbody>";
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    if ($w['f_id'] == $wf['f_id']) $current_style = "<b>";
    else $current_style = "";
    echo "<td>";
    if ($w['f_deleted']) echo "<img data-toggle=tooltip data-placement=top title='This file was deleted' src='img/delete.png' height='26'> ";
    show_lock($w['f_private']);
    echo "<a href='file.php?f_id=$w[f_id]'>$current_style$w[f_source]</a> ";
    if ($w['f_store'] == 366000) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire (tracks MP3 will expire in one year)' src=img/infinity-green.png height=15> ";
    if ($w['f_store'] == 366001) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire' src=img/infinity-red.png height=15> ";
    if ($w['f_id'] == $wf['f_id']) echo " (this file)";
    echo "<td>";
    if ($w['h_id'] == $wf['h_id']) {
      if ($w['f_id'] == $wf['f_id']) echo "<span style='color: green'><b>This file";
      else echo "<span style='color: green'><b>Same";
    }
    else echo "<span data-toggle=tooltip data-placement=top title='Hash ID is displayed. If files have the same hash ID, this means that their content is the same' style='color: red'><b>Different #$w[h_id]";
    echo "<td>$current_style$w[f_time]";
    echo "<td><a href=files.php?suid=$w[u_id]>$current_style$w[u_name]";
  }
  echo "</tbody>";
  echo "</table>";
}

function show_replace_midi($wj) {
  if ($wj['f_format'] == "None") {
    //echo "<p><a class=\"btn btn-outline-primary\" href='create.php?j_id=$wj[j_id]' role=\"button\">Apply this config to new task</a> ";
  }
  else {
    echo "<p><a class=\"btn btn-outline-primary\" href='upload.php?j_id=$wj[j_id]' role=\"button\">Apply this config to new MIDI file</a> ";
  }
}

function show_job_changes($wj) {
  echo "<b>Pending task changes:</b><br>";
  $st = $wj['j_changes_st'];
  $sa = explode("\n", $st);
  echo "<ul>";
  for ($i=mycount($sa) - 1; $i>=0; --$i) {
    if ($sa[$i] == "") continue;
    echo "<li>$sa[$i]";
  }
  echo "</ul>";
}

function show_job_changes_all($wj) {
  echo "<b>All task changes:</b><br>";
  $st = $wj['j_log'];
  $sa = explode("\n", $st);
  echo "<ul>";
  for ($i=mycount($sa) - 1; $i>=0; --$i) {
    if ($sa[$i] == "") continue;
    echo "<li>$sa[$i]";
  }
  echo "</ul>";
}

function show_hover_sec($tlen) {
  ?>
  <div id="crosshair-v" style='height: 100%' class="hair"></div>
  <span id="mousepos"></span>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      // Setup our variables
      let cH = $('#crosshair-h'),
        cV = $('#crosshair-v'),
        mP = $('#mousepos');

      $(this).on('mousemove touchmove', function (e) {
        let x = e.pageX;
        let y = e.pageY;
        cH.css('top', e.pageY - $(window).scrollTop());
        cV.css('left', e.pageX - $(window).scrollLeft());

        mP.css({
          top: (e.pageY - 60) + 'px',
          left: e.pageX + 'px'
        }, 800);
        if (!isFinite(e.clientX) || !isFinite(e.clientY)) return;
        let elover = document.elementFromPoint(e.clientX, e.clientY);
        if (elover === null) return;
        let id = elover.id;
        if (id.substring(0, 11) === "jplayer_pos" ||
          id.substring(0, 6) === "mt_pos") {
          let rect = elover.getBoundingClientRect();
          let sec = Math.floor(((x - rect.left) * jplayer_dur) / rect.width);
          let minutes = Math.floor(sec / 60);
          sec = sec - minutes * 60;
          cV.show();
          mP.show();
          mP.text(minutes + ":" + sec.toString().padStart(2, '0'));
        }
        else {
          cV.hide();
          mP.hide();
        }
        e.stopPropagation();
      });

    });
  </script>
  <?php
}
