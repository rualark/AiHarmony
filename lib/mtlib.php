<?php

// Number of tracks in multitrack player
$mtracks = 0;

function show_mtrack_header($wj) {
  GLOBAL $ua, $voa, $uid;
  echo "<table width='100%'><tr><td>";
  echo "<div id='mt_container'>";
  echo "<b>Multitrack:</b> ";
  echo "<a data-toggle=tooltip data-placement=top title='Play multitrack without reverb' class='btn btn-success' id='mt-play' href='#' onclick='play(); return false;'><img src='img/play5.png' height=15></a> ";
  echo "<a class='btn btn-success' id='mt-pause' href='#' onclick='pause(); return false;'><img src='img/pause3.png' height='15'></a> ";
  echo "<a class='btn btn-success' id='mt-stop' href='#' onclick='stop(); return false;'><img src='img/stop2.png' height='15'></a> ";
  echo "<span id='mt-current-time'>0:00</span> <span id='mt-duration'></span> ";
  echo "<span id='mt-status'></span>";
  echo "</div>";
  echo "<td align=right>";
  if (mycount($voa) && ($wj['u_id'] == $uid || $ua['u_admin'])) {
    echo "<a id='save_volume' style='display: none' class=\"btn btn-success\" href=# onclick='save_volume(); return false;' role=\"button\">
      Save volume and pan</a><br>";
  }
  echo "</table>";
  echo "<div style='line-height:50%'><br></div>";
  echo "<script>";
  echo "window.addEventListener('DOMContentLoaded', function() {";
  echo "$('#mt-pause').hide();";
  echo "$('#mt-stop').hide();";
  echo "});";
  echo "</script>";
}

function show_mt_warning($wj) {
  echo "<div id='mt_large_warning' style='display: none' class='card text-white bg-warning mb-3'>";
  //echo "<div class='card-header'>Header</div>";
  echo "<div class='card-body'>";
  //echo "  <h5 class='card-title'>Danger card title</h5>";
  $hsize = human_filesize($wj['j_size'], 1);
  echo "  <p class='card-text' style='color: black'> Large amount of data is being loaded ($hsize). If you experiece errors or if you want to improve load time, please refer to <a href='docs.php?d=re_player'><b>recommendations in docs</b></a>.</p>";
  echo "</div></div>";
}

function show_multitrack($wj) {
  GLOBAL $voa, $votr, $stem_fname, $disabled,
         $mtracks, $uid, $ua, $wie, $wi, $caa, $xca;
  echo "<script>\n";
  echo "let mt_tasksize = $wj[j_size];\n";
  echo "let track_name = [];\n";
  echo "let track_urls = [], hvol = [], cvol = [], src_id = [], sta = [];\n";
  echo "let pan = [], hpan = [], cpan = [], dpan = [];\n";
  echo "let dlen = [];\n";
  echo "let j_id = $wj[j_id], f_id = $wj[f_id], avol = [];\n";
  echo "let vol_default = [], db_max = [], db_coef = [], dvol = [];\n";
  echo "let disabled = '$disabled'; ";
  echo "</script>";
  //echo "<link rel='stylesheet' type='text/css' href='plugin/bootstrap-slider-10.6.1/bootstrap-slider.min.css'>";
  //echo "<script defer type='text/javascript' src='plugin/bootstrap-slider-10.6.1/bootstrap-slider.min.js'></script>";
  echo "<script defer language='JavaScript' type='text/javascript' src='js/include/notify.min.js'></script>";
  echo "<script defer language='JavaScript' type='text/javascript' src='js/buffer-loader.js'></script>\n";
  echo "<script defer language='JavaScript' type='text/javascript' src='js/multitrack.js'></script>\n";
  //echo "<link type='text/css' rel='stylesheet' href='css/simple-slider.css'>";
  show_mt_warning($wj);
  show_mtrack_header($wj);
  // Load previous config
  $ca2 = parse_job_config("share/" . $wj['j_folder'] . "config-log/config_1.pl");
  if (isset($ca2['StagePanInvert'])) $hstage_pan_invert = $ca2['StagePanInvert'];
  else $hstage_pan_invert = 1;
  if (isset($caa[jcRENDER]['StagePanInvert'])) $stage_pan_invert = $caa[jcRENDER]['StagePanInvert'];
  else $stage_pan_invert = 1;
  //echo "$stage_pan_invert $hstage_pan_invert";
  //print_r($ca2);
  // Scan folders
  $stem_shown = array();
  foreach ($voa as $v => $w) {
    $sta = $w['stage'];
    $tr = $w['track'];
    $src_id = $w['src_id'] - 1;
    if ($stem_shown[$sta][$tr]) continue;
    $stem_shown[$sta][$tr] = 1;
    $fname = $stem_fname[$sta][$tr];
    $v = $votr[$sta][$tr];
    $w = $voa[$v];

    $igroup = $w['i_group'];
    $iname = $w['i_name'];
    $str = $w['src_id'] - 1;
    if (isset($wie[$igroup][$iname])) {
      $vol_default = $wie[$igroup][$iname]["volume_default"];
      $db_max = $wie[$igroup][$iname]["db_max"];
      $db_coef = $wie[$igroup][$iname]["db_coef"];
      $dvol = $wie[$igroup][$iname]["volume"];
      $dpan = $wie[$igroup][$iname]["pan_default"];
    }
    else if (isset($wi[$igroup][0])) {
      $vol_default = $wi[$igroup][0]["volume_default"];
      $db_max = $wi[$igroup][0]["db_max"];
      $db_coef = $wi[$igroup][0]["db_coef"];
      $dvol = $wi[$igroup][0]["volume"];
      $dpan = $wi[$igroup][0]["pan_default"];
    }
    else {
      $vol_default = 127;
      $db_max = 0;
      $db_coef = 3;
      $dvol = 100;
      $dpan = 50;
    }

    if ($hstage_pan_invert && $sta % 2 == 1) $hdpan = 100 - $dpan;
    else $hdpan = $dpan;
    if ($stage_pan_invert && $sta % 2 == 1) $cdpan = 100 - $dpan;
    else $cdpan = $dpan;
    $vol = icf($caa[jcRENDER], $str, "Volume", $dvol);
    $pan = icf_sta($caa[jcRENDER], $str, $sta, "Pan", $cdpan);
    $hvol = icf($ca2, $str, "Volume", $dvol);
    $hpan = icf_sta($ca2, $sta, $str, "Pan", $hdpan);
    if ($wj['f_format'] == 'MIDI') $tr_name = $w['src_name'];
    else $tr_name = $xca->voice[$v]->unique_name;
    $vol_st = vol2db($vol, $vol_default, $db_max, $db_coef) . " dB";
    $name = "$w[src_id]. <b>$tr_name ($igroup/$iname)</b>";
    // DTR$tr
    $fname3 = str_replace(".png", ".mp3", $fname);
    echo "<script>";
    echo "src_id[$mtracks] = $w[src_id];";
    echo "sta[$mtracks] = $sta;";
    echo "vol_default[$mtracks] = $vol_default;";
    echo "dvol[$mtracks] = $dvol;";
    echo "db_max[$mtracks] = $db_max;";
    echo "db_coef[$mtracks] = $db_coef;";
    echo "dpan[$mtracks] = $cdpan;";
    echo "track_name[$mtracks] = '$w[src_id]. $tr_name ($w[i_group]/$w[i_name]), voice $v, stage $sta';";
    echo "</script>";
    show_mtrack($igroup, $iname, $str, $fname, $name, "Voice $v, stage $sta", $fname3,
      $wj, $v, $vol, $hvol, $pan, $hpan, $src_id);
  }
  if ($ua['u_verbose'] > 3) {
    echo "<br><p align='right'><a data-toggle=tooltip data-placement=top class=\"btn btn-outline-danger\" href=# onclick='reset_volume(); return false;' role=\"button\">
      Reset all tracks volume to default</a> ";
    echo "<a data-toggle=tooltip data-placement=top class=\"btn btn-outline-danger\" href=# onclick='reset_pan(); return false;' role=\"button\">
      Reset all tracks panning to default</a> ";
  }
}

function show_mtrack($igroup, $iname, $str, $png_name, $name, $title, $mp3_name, $wj, $v, $vol, $hvol, $pan, $hpan, $src_id) {
  GLOBAL $mtracks, $ua, $disabled, $delay_controls_enabled, $master_mp3;
  $thumb_name = str_replace(".png", "_.png", $png_name);
  if (!file_exists($thumb_name)) return;
  $dlen = round(filesize($mp3_name) / filesize($master_mp3) * 100);
  echo "<div class='tiicontainer'>";
  echo "<img width=$dlen% height=120 class='jplayer_waveform' id='mt_waveform$mtracks' style='image-rendering: -webkit-optimize-contrast; -webkit-transform: translateZ(0); transform: translateZ(0); border: 1px solid #DDDDDD;' src='$thumb_name" . "?nc=$wj[j_finished]'>";
  echo "<img class='mt_progress' id='mt_progress$mtracks' src=img/black.png height=400 width=100% style='opacity: 0.2; position: absolute; top: 0px; left: 0px;'></a>";
  echo "<img class='mt_load' id='mt_load$mtracks' src=img/black.png height=400 width=100% style='opacity: 0.3; position: absolute; top: 0px; right: 0px;'></a>";
  echo "<input class='mt_pos_input' id='mt_pos_input$mtracks' type=image name=icor src='img/red.png' width='100%' height='100%' style='position: absolute; top: 0px; left: 0px; opacity: 0; cursor: url(img/aim40_32.png) 17  18, auto;'>";
  echo "<div style='position: absolute; top: 0px; left: 5px;'>";
  if ($v > -1 && $ua['u_verbose'] > 3) {
    echo "<a title='$title' href='pianoroll.php?j_id=$wj[j_id]&v=$v' target='_blank'>";
    echo "<font color='black'>";
  }
  echo "$name</a>";
  if ($ua['u_verbose'] > 3) {
    echo " <a target=_blank href='$mp3_name?nc=$wj[j_finished]'><img style='opacity: 0.5' title='Download MP3 file' src='img/download.png' height='17'></a>";
  }
  echo " <a href='iset.php?f_id=$wj[f_id]&tr=$src_id'><img style='opacity: 0.5' title='Change instrument settings' src='img/cog2.png' height='17'></a>";
  show_finale_track_warning($str, $igroup, $iname, 20);
  echo "</div>"; // <a href='$png_name' target='_blank'>

  echo "<div style='position: absolute; bottom: 5px; left: 5px;'>";
  echo "<a title='Solo' class='btn btn-outline-secondary btn-sm' id='mt-solo$mtracks' href='#' onclick='solo($mtracks); return false;' oncontextmenu='solo2(); return false;'>S</a> ";
  echo "<a title='Mute' class='btn btn-outline-secondary btn-sm' id='mt-mute$mtracks' href='#' onclick='mute($mtracks); return false;' oncontextmenu='mute2(); return false;'>M</a> ";
  echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Pan: ";
  if ($pan < 50) $bclass = "btn-secondary";
  else $bclass = "btn-outline-secondary";
  echo "<a title='Pan left' class='btn $bclass btn-sm' id='mt-panl$mtracks' href='#' onclick='swapPan($mtracks); return false;'>L</a> ";
  if ($pan < 50) $bclass = "btn-outline-secondary";
  else $bclass = "btn-secondary";
  echo "<a title='Pan right' class='btn $bclass btn-sm' id='mt-panr$mtracks' href='#' onclick='swapPan($mtracks); return false;'>R</a> ";
  //echo "&nbsp;&nbsp;&nbsp;<img id='pan_img$mtracks' onclick='swapPan($mtracks); return false;' style='opacity: 0.5' src=img/";
  //if ($pan < 50) echo "lspeaker.png";
  //else echo "rspeaker.png";
  //echo " height=20>&nbsp;&nbsp; ";
  echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img src=img/lspeaker.png style='opacity:0.5' height=20> ";
  echo "<input type='range' max='150' value='$vol' id='mt_range$mtracks' oninput='changeVolume($mtracks, mt_range$mtracks.value);'> ";
  echo "<span id='mt-vol$mtracks'></span> ";
  if ($delay_controls_enabled) {
    echo "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <img src=img/time3.png title='Delay instrument' style='opacity:0.7' height=20> ";
    echo "<input type='range' style='width: 400px' min='-150' max='150' id='mt_drange$mtracks' onchange='changeDelay($mtracks, mt_drange$mtracks.value);' oninput='inputDelay($mtracks, mt_drange$mtracks.value);'> ";
    echo "<span id='mt-delay$mtracks'>0 ms</span> ";
  }
  //show_pan_slider($disabled, "Pan$mtracks", $pan, 'NONE', 0, 100, 1, '#1155FF', '#AACCFF', '#AACCFF', "ticks: [0,45,55,100],");
  echo "</div>"; // <a href='$png_name' target='_blank'>
  echo "</div>";
  echo "<script>";
  echo "track_urls[$mtracks] = '$mp3_name?nc=$wj[j_finished]'; ";
  echo "hvol[$mtracks] = $hvol; ";
  echo "cvol[$mtracks] = $vol; ";
  echo "hpan[$mtracks] = $hpan; ";
  echo "cpan[$mtracks] = $pan; ";
  echo "dlen[$mtracks] = $dlen; ";
  echo "</script>";
  ++$mtracks;
}
