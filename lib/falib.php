<?php

$ca2_playback_modes = array(
  "Piano" => 'Piano',
  "Alto vocal,Tenor vocal" => 'Perform parts with vocals',
  "Violin/Non-staccato,Cello/Non-staccato" => 'Perform parts with strings',
  "Violins section/Non-staccato,Cellos section/Non-staccato" => 'Perform parts with strings sections',
  "Oboe,Clarinet" => 'Perform parts with woodwinds',
  "Trumpet,Horn" => 'Perform parts with brass',
  "Organ,Organ" => 'Perform parts with organ'
);

$ca1_playback_modes = array(
  "Piano" => 'Piano',
  "Alto vocal" => 'Alto vocal',
  "Viola/Non-staccato" => 'Viola',
  "Violas section/Non-staccato" => 'Violas section',
  "Clarinet" => 'Clarinet',
  "Horn" => 'Horn',
  "Organ" => 'Organ'
);

$species_cp1 = array(
  1 => "Counterpoint species 1 - one whole note agains one whole note in cantus firmus",
  2 => "Counterpoint species 2 - two half notes against one whole note in cantus firmus",
  3 => "Counterpoint species 3 - four quarter notes against one whole note in cantus firmus",
  4 => "Counterpoint species 4 - suspensions",
  5 => "Counterpoint species 5 - free rhythm"
);

function show_file_gen_header() {
  GLOBAL $wf, $bheight, $ua;
  echo "<h2 align=center>";
  if ($wf['f_deleted']) echo "<img data-toggle=tooltip data-placement=top title='This task was deleted' src='img/delete.png' height='$bheight'> ";
  show_lock($wf['f_private']);
  echo "$wf[f_source]";
  if ($wf['f_store'] == 366000) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire (tracks MP3 will expire in one year)' src=img/infinity-green.png height=15> ";
  if ($wf['f_store'] == 366001) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire' src=img/infinity-red.png height=15> ";
  echo "</h2>";
  echo "<h5 align=center>$wf[f_work_title]</h5>";
}

function show_gen_tabs() {
  GLOBAL $waj, $ua, $tab, $wf;
  echo "<div style='line-height:50%'><br></div>";
  echo "<div id=tabs>";
  echo "<ul class='nav nav-tabs' id='myTabs' role='tablist'>";
  show_tab("settings", "Settings", "return warn_editor_changed()");
  if (stems_exist()) {
    //show_tab("multitrack", "Parts", "");
  }
  show_tab("files", "Files", "");
  if ($waj[jcRENDER]['j_state'] > 1 && $ua['u_verbose'] > 6) {
    show_tab("instruments", "MIDI", "");
  }
  if (stems_exist() && $ua['u_verbose'] > 0) {
    show_tab("stems", "Solo parts", "");
  }
  if ($ua['u_verbose'] > 8) {
    show_tab("config", "Config", "setTimeout(function () {refresh_editors();}, 500);");
  }
  if ($ua['u_verbose'] > 6) {
    show_tab("info", "Info", "");
  }
  if ($ua['u_verbose'] > 8 && $wf['f_format'] != "None") {
    show_tab("similar", "Similar", "");
  }
  echo "</ul>";
  echo "</div>";
  if ($tab == "") $tab = "settings";
  echo "<script>window.addEventListener('DOMContentLoaded', function() { $('#$tab-tab').click(); } );</script>";
  echo "<div style='line-height:50%'><br></div>";
}

function show_cor_tabs() {
  GLOBAL $waj, $ua, $tab, $wf;
  echo "<div style='line-height:50%'><br></div>";
  echo "<div id=tabs>";
  echo "<ul class='nav nav-tabs' id='myTabs' role='tablist'>";
  show_tab("settings", "Settings", "warn_editor_changed()");
  if (stems_exist()) {
    //show_tab("multitrack", "Parts", "");
  }
  show_tab("files", "Files", "");
  if ($ua['u_verbose'] > 8) {
    show_tab("config", "Config", "setTimeout(function () {refresh_editors();}, 500);");
  }
  if ($ua['u_verbose'] > 6) {
    show_tab("info", "Info", "");
  }
  if ($ua['u_verbose'] > 8 && $wf['f_format'] != "None") {
    show_tab("similar", "Similar", "");
  }
  echo "</ul>";
  echo "</div>";
  if ($tab == "") $tab = "settings";
  echo "<script>window.addEventListener('DOMContentLoaded', function() { $('#$tab-tab').click(); } );</script>";
  echo "<div style='line-height:50%'><br></div>";
}

function show_gen_settings() {
  GLOBAL $caa, $wf, $vtypes, $store_periods, $ua,
         $reverb_mixes, $ca1_playback_modes, $ca2_playback_modes, $algo,
         $export_types, $species_cp1;

  if ($ua['u_verbose'] > 3) {
    start_collapse_container(2, "Generation settings");
    if ($wf['f_gen'] == 'CF1') {
      $opt_c_len = 250;
      if ($caa[jcRENDER]['c_len'] > $opt_c_len) $style = 'background-color: #FFBBBB';
      start_gval_select('Cantus length', 10, 'c_len', 0, 'gval', 'setgval', 1, $style, '',
        "Cantus length above $opt_c_len can lead to slow and low quality generation");
      $found = 0;
      for ($i=0; $i<350; ++$i) {
        echo "<option value='$i'";
        if ($i == $caa[jcRENDER]['c_len']) {
          echo " selected";
          $found = 1;
        }
        echo ">$i notes";
        if ($i > $opt_c_len) echo " (can be slow and return errors)";
        echo "</option>";
      }
      if (!$found) {
        echo "<option style='font-style: italic' value={$caa[jcRENDER]['c_len']} selected>{$caa[jcRENDER]['c_len']} notes</option>";
      }
      echo "</select>";
      echo "</div> </div>";
    }

    if ($wf['f_gen'] == 'CP3') {
      start_gval_select('Species', 10, 'species', 0, 'gval', 'setgval', 1, '', '',
        'Choose counterpoint species');
      foreach ($species_cp1 as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcRENDER]['species']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div></div>";
    }

    if ($wf['f_gen'] == 'CP1') {
      start_gval_select('Species', 10, 'species', 1, 'gval', 'setgval', 1, '', '',
        'Choose counterpoint species');
      foreach ($species_cp1 as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcRENDER]['species']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div></div>";

      $species = $caa[jcRENDER]['species'];
      if ($species == 1) {
        $opt_c_len = 40;
        $max_c_len = 60;
      } else if ($species == 2) {
        $opt_c_len = 25;
        $max_c_len = 60;
      } else if ($species == 3) {
        $opt_c_len = 13;
        $max_c_len = 20;
      } else if ($species == 4) {
        $opt_c_len = 25;
        $max_c_len = 60;
      } else {
        $opt_c_len = 11;
        $max_c_len = 20;
      }
      $style = "";
      if ($caa[jcRENDER]['c_len'] > $opt_c_len) $style = 'background-color: #FFBBBB';
      start_gval_select('Cantus length', 10, 'c_len', 1, 'gval', 'setgval', 1, $style, '',
        "For this species cantus length above $opt_c_len can lead to slow and low quality generation");
      $found = 0;
      for ($i = 3; $i <= 61; ++$i) {
        echo "<option value='$i'";
        if ($i == $caa[jcRENDER]['c_len']) echo " selected";
        echo ">$i notes";
        if ($i > $opt_c_len) echo " (can be slow and return errors)";
        echo "</option>";
        $found = 1;
      }
      if (!$found) {
        echo "<option style='font-style: italic' value={$caa[jcRENDER]['c_len']} selected>{$caa[jcRENDER]['c_len']} notes</option>";
      }
      echo "</select>";
      echo "</div> </div>";
    }

    if ($wf['f_gen'] == 'CP1' || $wf['f_gen'] == 'CP3') {
      start_gval_select('Cantus position', 10, 'cantus_high', 0, 'gval', 'setgval', 1, '', '',
        'Choose in which voice cantus firmus will be');
      echo "<option value='0'";
      if (0 == $caa[jcRENDER]['cantus_high']) echo " selected";
      echo ">Cantus firmus in lower voice";
      echo "</option>";
      echo "<option value='1'";
      if (1 == $caa[jcRENDER]['cantus_high']) echo " selected";
      echo ">Cantus firmus in higher voice";
      echo "</option>";
      echo "</select>";
      echo "</div> </div>";
    }

    if ($wf['f_gen'] == 'CF1' || $wf['f_gen'] == 'CP1') {
      start_gval_select('Key', 10, 'key', 0, 'gval', 'setgval', 1, '', '',
        'You can choose other keys in config, but do not forget to change first_note and last_note respectively');
      echo "<option value='C'";
      if ("C" == $caa[jcRENDER]['key']) echo " selected";
      echo ">C natural major";
      echo "</option>";
      echo "<option value='Cm'";
      if ("Cm" == $caa[jcRENDER]['key']) echo " selected";
      echo ">C melodic minor";
      echo "</option>";
      if ($caa[jcRENDER]['key'] != "C" && $caa[jcRENDER]['key'] != "Cm") {
        echo "<option style='font-style: italic' value={$caa[jcRENDER]['key']} selected>{$caa[jcRENDER]['key']}</option>";
      }
      echo "</select>";
      echo "</div> </div>";
    }
    end_collapse_container(2, "Generation settings", "block");
  }

  echo "<div style='line-height:50%'><br></div>";
  start_collapse_container(1, "Playback settings");

  if ($wf['f_gen'] == 'CF1') {
    start_gval_select('Playback', 10, 'Instruments', 0, 'gval', 'setgval', 1, '', '',
      'Choose instruments to perform generated music');
    if (!isset($caa[jcRENDER]['Instruments'])) $caa[jcRENDER]['Instruments'] = "Piano";
    foreach ($ca1_playback_modes as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcRENDER]['Instruments']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }
  if ($wf['f_gen'] == 'CP1' || $wf['f_gen'] == 'CP3') {
    start_gval_select('Playback', 10, 'Instruments', 0, 'gval', 'setgval', 1, '', '',
      'Choose instruments to perform generated music');
    if (!isset($caa[jcRENDER]['Instruments'])) $caa[jcRENDER]['Instruments'] = "Piano";
    foreach ($ca2_playback_modes as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcRENDER]['Instruments']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  if ($ua['u_verbose'] > 3) {
    start_gval_select('Tempo', 10, 'tempo', 0, 'gval', 'setgval', 1, '', '',
      'Increase tempo to make generated music play faster');
    $found = 0;
    for ($i=2; $i<30; ++$i) {
      $tempo = $i * 10;
      echo "<option value='$tempo-$tempo'";
      if ("$tempo-$tempo" == $caa[jcRENDER]['tempo']) {
        echo " selected";
        $found = 1;
      }
      echo ">$tempo";
      echo "</option>";
    }
    if (!$found) {
      echo "<option style='font-style: italic' value={$caa[jcRENDER]['tempo']} selected>{$caa[jcRENDER]['tempo']}</option>";
    }
    echo "</select>";
    echo "</div> </div>";

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

    start_gval_select('Reverb', 5, 'reverb_mix', 0, 'gval', 'setgval', 1, 1, '',
      'Increase reverb to emulate playing in a larger space');
    if (!isset($caa[jcRENDER]['reverb_mix'])) $caa[jcRENDER]['reverb_mix'] = 30;
    foreach ($reverb_mixes as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcRENDER]['reverb_mix']) echo " selected";
      echo ">$val</option>";
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
  }

  if ($ua['u_verbose'] > 0) {
    start_gval_select('Render separate tracks', 10, 'f_stems', 0, 'action', 'f_stems', 1, '', '',
      'Disable rendering separate tracks to make rendering faster. This will prevent you from downloading MP3 for each track and using multitrack player to solo multiple tracks, change volume and panning');
    foreach ($export_types as $key => $val) {
      echo "<option value='$key'";
      if ($key == $wf['f_stems']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  end_collapse_container(1, "Playback settings", "block");

  echo "<div style='line-height:50%'><br></div>";
  start_collapse_container(3, "General settings");

  if ($ua['u_verbose'] > 1) {
    start_gval_select('Store results', 10, 'f_store', 0, 'action', 'f_store', 0, '', '', 'How long resulting MP3 files will be stored');
    foreach ($store_periods as $key => $val) {
      if ($key > 366 && $wf['f_store'] != $key && !$ua['u_admin']) continue;
      echo "<option value='$key'";
      if ($key == $wf['f_store']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  start_gval_select('Visibility', 10, 'f_private', 0, 'action', 'f_private', 0, '', '', 'Set visibility of this file and its processing results');
  foreach ($vtypes as $key => $val) {
    echo "<option value='$key'";
    if ($key == $wf['f_private']) echo " selected";
    echo ">$val</option>";
  }
  echo "</select>";
  echo "</div></div>";
  echo "</p>";

  show_file_xml_actions();

  end_collapse_container(3, "General settings", "block");
  send_settings_scripts();
}

function show_cor_settings() {
  GLOBAL $caa, $wf, $vtypes, $store_periods, $ua, $cantus_highs,
         $reverb_mixes, $ca3_playback_modes, $algo, $species_name2,
         $export_types, $rule_verbosities, $harm_notations, $min_severities;

  if ($ua['u_verbose'] > 3) {
    start_collapse_container(2, "Correction settings");

    if ($wf['f_gen'] == 'CA2') {
      start_gval_select('Counterpoint species', 10, 'species', 0, 'gval', 'setgval2', 1, '', '',
        'Usually algorithm will be able to detect species automatically, but there can be situations, when detected cantus position will be wrong. In this case you can select cantus position manually in settings');
      foreach ($species_name2 as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcCORRECT]['species']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";

      start_gval_select('Cantus position', 10, 'cantus_high', 0, 'gval', 'setgval2', 1, '', '',
        'Usually algorithm will be able to detect cantus position automatically, but there can be situations, when detected cantus position will be wrong. In this case you can select cantus position manually here');
      foreach ($cantus_highs as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcCORRECT]['cantus_high']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";

    }
    start_gval_select('Time to correct', 10, 'max_correct_ms', 0, 'gval', 'setgval2', 1, '', '',
      'Increase allowed time for correction to fix more mistakes');
    $found = 0;
    for ($i=1; $i<120; ++$i) {
      $msec = $i * 1000;
      echo "<option value='$msec'";
      if ($msec == $caa[jcCORRECT]['max_correct_ms']) {
        echo " selected";
        $found = 1;
      }
      echo ">$i seconds";
      echo "</option>";
    }
    if (!$found) {
      echo "<option style='font-style: italic' value={$caa[jcCORRECT]['max_correct_ms']} selected>{$caa[jcCORRECT]['max_correct_ms']} ms</option>";
    }
    echo "</select>";
    echo "</div> </div>";

    start_gval_select('Mistakes verbosity', 10, 'ly_rule_verbose', 0, 'gval', 'setgval3', 1, '', '',
      'Increase miskate verbosity to understand mistakes better. Warning: this can show additional technical non-musical information.');
    foreach ($rule_verbosities as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcCORRECT]['ly_rule_verbose']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Show mistakes', 10, 'show_min_severity', 0, 'gval', 'setgval3', 1, '', '',
      'Warning: informational (green) mistakes are often not real mistakes, but some observations of the algorithm');
    foreach ($min_severities as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcCORRECT]['show_min_severity']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";
    end_collapse_container(2, "Correction settings", "block");
  }

  echo "<div style='line-height:50%'><br></div>";
  start_collapse_container(3, "General settings");

  if ($ua['u_verbose'] > 1) {
    start_gval_select('Store results', 10, 'f_store', 0, 'action', 'f_store', 0, '', '', 'How long resulting MP3 files will be stored');
    foreach ($store_periods as $key => $val) {
      if ($key > 366 && $wf['f_store'] != $key && !$ua['u_admin']) continue;
      echo "<option value='$key'";
      if ($key == $wf['f_store']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div></div>";
  }

  start_gval_select('Visibility', 10, 'f_private', 0, 'action', 'f_private', 0, '', '', 'Set visibility of this file and its processing results');
  foreach ($vtypes as $key => $val) {
    echo "<option value='$key'";
    if ($key == $wf['f_private']) echo " selected";
    echo ">$val</option>";
  }
  echo "</select>";
  echo "</div></div>";
  echo "</p>";

  show_file_xml_actions();

  end_collapse_container(3, "General settings", "block");
  send_settings_scripts();
}

function show_mid_link($wj) {
  $fname = "share/" . bjurl($wj) . ".mid";
  if (file_exists($fname)) {
    echo "&nbsp;<a data-toggle=tooltip data-placement=top title='Download MIDI file with generation results' href='$fname?nc=$wj[j_finished]' target=_blank><img src='img/midi.png' height='80'></a>";
  }
  else if ($wj['j_cleaned'] == 2 && $wj['j_state'] == 3) {
    echo "<img height=70 data-toggle=tooltip data-placement=top title='Results of this task were removed due to expiration. Please restart task.' src='img/expired.png'>";
  }
}
