<?php

function show_upload_xml_header() {
  GLOBAL $wf, $bheight, $ua;
  echo "<h2 align=center>";
  if ($wf['f_deleted']) echo "<img data-toggle=tooltip data-placement=top title='This file was deleted' src='img/delete.png' height='$bheight'> ";
  if ($ua['u_verbose'] > 2)
    echo "<a href='share/$wf[f_folder]$wf[f_name]'><img data-toggle=tooltip data-placement=top title='Download source XML file' src='img/XML.png' height='$bheight'></a> ";
  show_lock($wf['f_private']);
  echo "<span data-html=true data-toggle=tooltip data-placement=bottom title='";
  if ($wf['f_encoder'] != '') echo "Encoder: $wf[f_encoder]<br>";
  if ($wf['f_software'] != '' || $wf['f_encoding_description'] != '') echo "Software: $wf[f_software] $wf[f_encoding_description]<br>";
  if ($wf['f_encoding_date'] != '') echo "Encoding date: $wf[f_encoding_date]<br>";
  if ($wf['f_composer'] != '') echo "Composer: $wf[f_composer]<br>";
  if ($wf['f_arranger'] != '') echo "Arranger: $wf[f_arranger]<br>";
  if ($wf['f_rights'] != '') echo "Rights: $wf[f_rights]<br>";
  echo "'>";
  echo "$wf[f_source]</span>";
  if ($wf['f_store'] == 366000) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire (tracks MP3 will expire in one year)' src=img/infinity-green.png height=15> ";
  if ($wf['f_store'] == 366001) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire' src=img/infinity-red.png height=15> ";
  echo "</h2>";
  echo "<h5 align=center>$wf[f_work_title]</h5>";
  //echo "<hr>";
}

function show_xml_tabs() {
  GLOBAL $waj, $ua, $tab;
  echo "<div style='line-height:50%'><br></div>";
  echo "<div id=tabs>";
  echo "<ul class='nav nav-tabs' id='myTabs' role='tablist'>";
  show_tab("settings", "Settings", "warn_editor_changed(); hide_osmd()");
  if (stems_exist()) {
    //show_tab("multitrack", "Parts", "hide_osmd()");
  }
  show_tab("score", "Score", "show_osmd()");
  show_tab("files", "Files", "hide_osmd()");
  if ($waj[jcRENDER]['j_state'] > 1 && $ua['u_verbose'] > 6) {
    show_tab("instruments", "MIDI", "hide_osmd()");
  }
  if (stems_exist() && $ua['u_verbose'] > 0) {
    show_tab("stems", "Solo parts", "hide_osmd()");
  }
  if ($ua['u_verbose'] > 8) {
    show_tab("config", "Config", "hide_osmd(); setTimeout(function () {refresh_editors();}, 500);");
  }
  if ($ua['u_verbose'] > 6) {
    show_tab("info", "Info", "hide_osmd()");
  }
  if ($ua['u_verbose'] > 8) {
    show_tab("similar", "Similar", "");
  }
  echo "</ul>";
  echo "</div>";
  if ($tab == "") $tab = "settings";
  echo "<script>window.addEventListener('DOMContentLoaded', function() { $('#$tab-tab').click(); } );</script>";
  echo "<div style='line-height:50%'><br></div>";
}

function show_xml_settings() {
  GLOBAL $caa, $wf, $vtypes, $store_periods, $ua, $page_breakings,
         $reverb_mixes, $ca3_playback_modes, $rule_variants,
         $harm_notations, $rule_verbosities, $min_severities, $export_types;
  echo "<div class=row>";
  echo "<div class=col-sm-12>";
  echo "<form class='form-inline' action=store.php method=post>";
  echo "<input type=hidden name=f_id value='$wf[f_id]'>";
  echo "<input type=hidden name=action value=f_instruments>";
  show_spselects();
  echo "</form>";
  echo "</div>";
  echo "</div>";

  if ($ua['u_verbose'] > 3) {
    start_collapse_container(2, "Analysis settings");

    start_gval_select('7th chords', 10, 'rule_overwrite_194', 0, 'gval', 'setgval3', 1, '', '',
      'Allowing 7th chords will let algorithm to detect 7th chords if there are no other ways to explain current harmony');
    $variants = array(
      "" => "Auto",
      "0;50;;;;" => "Allow, but show error",
      "0;100;;;;" => "Prohibit"
    );
    foreach ($variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_194']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Cambiata', 10, 'rule_overwrite_256', 0, 'gval', 'setgval3', 1, '', '',
      'Prohibit to prevent detecting this melodic shape');
    foreach ($rule_variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_256']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Double-neighbor tone', 10, 'rule_overwrite_258', 0, 'gval', 'setgval3', 1, '', '',
      'Prohibit to prevent detecting this melodic shape');
    foreach ($rule_variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_258']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Passing dissonance on downbeat', 10, 'rule_overwrite_282', 0, 'gval', 'setgval3', 1, '', '',
      'Prohibit to prevent detecting this melodic shape');
    foreach ($rule_variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_282']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Anticipation', 10, 'rule_overwrite_287', 0, 'gval', 'setgval3', 1, '', '',
      'Prohibit to prevent detecting this melodic shape');
    foreach ($rule_variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_287']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    start_gval_select('Neighbor dissonance, not surrounded by chord tones', 10, 'rule_overwrite_170', 0, 'gval', 'setgval3', 1, '', '',
      'Prohibit to prevent detecting this melodic shape');
    foreach ($rule_variants as $key => $val) {
      echo "<option value='$key'";
      if ($key == $caa[jcANALYSE]['rule_overwrite_170']) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>";
    echo "</div>";
    echo "</div>";

    if ($ua['u_verbose'] > 7) {
      echo "<div style=\"width: 100%; height: 18px; border-bottom: 1px solid black; text-align: center\">
    <span style=\"font-size: 20px; background-color: #f9f9f9; padding: 0 20px;\">
    Advanced technical settings (changing these settings is not recommended):
    </span>
    </div><br>";
      echo "<p><b></b>";
      start_gval_select('Harmonic notation', 10, 'harm_notation', 0, 'gval', 'setgval3', '', 'docs.php?d=re_harm_notations', 1);
      foreach ($harm_notations as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcANALYSE]['harm_notation']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";

      start_gval_select('Mistakes verbosity', 10, 'ly_rule_verbose', 0, 'gval', 'setgval3', 1, '', '',
        'Increase miskate verbosity to understand mistakes better. Warning: this can show additional technical non-musical information.');
      foreach ($rule_verbosities as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcANALYSE]['ly_rule_verbose']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";

      start_gval_select('Show mistakes', 10, 'show_min_severity', 0, 'gval', 'setgval3', 1, '', '',
        'Warning: informational (green) mistakes are often not real mistakes, but some observations of the algorithm');
      foreach ($min_severities as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcANALYSE]['show_min_severity']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";

      start_gval_select('Page layout', 10, 'ly_page_breaking', 0, 'gval', 'setgval3', 1, '', '',
        'Switch to sparse page layout only if you face problems with overlapping text and notes');
      foreach ($page_breakings as $key => $val) {
        echo "<option value='$key'";
        if ($key == $caa[jcANALYSE]['ly_page_breaking']) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</div>";
      echo "</div>";
    }

    end_collapse_container(2, "Analysis settings", "block");
  }

  echo "<div style='line-height:50%'><br></div>";
  start_collapse_container(1, "Playback settings");

  start_gval_select('Playback', 10, 'Instruments', 0, 'gval', 'setgval', 1, '', '',
    'Soprano voices are played with highest instrument in group, Bass voices are played with lowest instrument in group.');
  if (!isset($caa[jcRENDER]['Instruments'])) $caa[jcRENDER]['Instruments'] = "Piano";
  foreach ($ca3_playback_modes as $key => $val) {
    echo "<option value='$key'";
    if ($key == $caa[jcRENDER]['Instruments']) echo " selected";
    echo ">$val</option>";
  }
  echo "</select>";
  echo "</div></div>";

  if ($ua['u_verbose'] > 3) {
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
    echo "</select>";
    echo "</div></div>";
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

function show_file_xml_actions() {
  GLOBAL $wf, $ml, $f_id, $ua, $uid;
  if ($wf['u_id'] == $uid || $ua['u_admin']) {
  }
}

function show_pdf_link($wj) {
  $fname = "share/" . bjurl($wj) . ".pdf";
  if (file_exists($fname)) {
    echo "<a data-toggle=tooltip data-placement=top title='Open pdf file with analysis results' href='$fname?nc=$wj[j_finished]' target=_blank><img src='img/pdf.svg' height='80'></a>";
  }
  else if ($wj['j_cleaned'] == 2 && $wj['j_state'] == 3) {
    echo "<img height=70 data-toggle=tooltip data-placement=top title='Results of this task were removed due to expiration. Please restart task.' src='img/expired.png'>";
  }
}
