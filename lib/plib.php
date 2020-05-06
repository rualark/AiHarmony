<?php
require_once "lib.php";

$wavesurfer_id = 0;
$minutes_per_page = 40;

function show_jplayer($wj, $fname) {
  GLOBAL $ua;
  if (!file_exists($fname)) return;
?>
<script defer type="text/javascript" src="plugin/jplayer/dist/jplayer/jquery.jplayer.min.js"></script>
<script>
let my_jPlayer;
let jpData;
let jp_freq = 70;
//<![CDATA[
window.addEventListener('DOMContentLoaded', function() {

  // Local copy of jQuery selectors, for performance.
  my_jPlayer = $("#jquery_jplayer");

  // Change the time format
  $.jPlayer.timeFormat.padMin = false;
  $.jPlayer.timeFormat.padSec = true;
  $.jPlayer.timeFormat.sepMin = ":";
  $.jPlayer.timeFormat.sepSec = " ";

  // Innce jPlayer
  my_jPlayer.jPlayer({
    ready: function () {
    },
    timeupdate: function(event) {
    },
    play: function(event) {
    },
    pause: function(event) {
    },
    ended: function(event) {
    },
    loadedmetadata: function(event) {
      jplayer_loaded();
    },
    swfPath: "plugin/jplayer/dist/jplayer",
    cssSelectorAncestor: "#jp_container",
    supplied: "mp3",
    wmode: "window"
  });
  my_jPlayer.jPlayer("setMedia", {
    mp3: jplayer_tracks[0]
  });

  jpData = my_jPlayer.data('jPlayer');
  setInterval(function() {
    let x = jpData.htmlElement.audio.currentTime;
    let d = jplayer_dur;
    let img_waveform = document.getElementById('jplayer_waveform0');
    if (img_waveform == null) return;
    let width = img_waveform.clientWidth;
    for (let i=0; i < jplayer_tracks.length; ++i) {
      let img_progress = document.getElementById('jplayer_progress' + i);
      img_progress.style.width = 2 + Math.max(0, x / d * (width - 2)) + 'px';
      if (i === jplayer_curtrack) {
        img_progress.style.opacity = 0.3;
      }
      else {
        img_progress.style.opacity = 0.06;
      }
    }
    //console.log("currentTime: " + x);
  }, jp_freq);

});
//]]>
</script>
<div id="jquery_jplayer"></div>

<!-- Using the cssSelectorAncestor option with the default cssSelector class names to enable control association of standard functions using built in features -->

<?php
}

function show_stems3($wj) {
  GLOBAL $caa, $volan, $voa, $votr, $stem_fname, $submix_fname, $mix_fname,
    $uid, $ua, $wie, $caa, $xca, $jplayer_tracks;
  // Scan folders
  load_instruments();
  load_finstruments();
  $caa[jcRENDER] = parse_job_config("share/" . $wj['j_folder'] . bfname($wj['f_name']) . ".pl");
  get_tr_inst();
  echo "<script>\n";
  echo "let jtrack_name = [];\n";
  echo "</script>";
  //load_volume_analysis();
  $dur = 480;
  $stem_shown = array();
  if ($wj['f_dur']) $dur = $wj['f_dur'];
  foreach ($voa as $v => $w) {
    $sta = $w['stage'];
    $tr = $w['track'];
    $src_id = $w['src_id'] - 1;
    if ($stem_shown[$sta][$tr]) continue;
    $stem_shown[$sta][$tr] = 1;
    $fname = $stem_fname[$sta][$tr];
    $sugg = "";
    $v = $votr[$sta][$tr];
    $w = $voa[$v];
    $igroup = $w['i_group'];
    $iname = $w['i_name'];
    $vol_default = $wie[$igroup][$iname]["volume_default"];
    $db_max = $wie[$igroup][$iname]["db_max"];
    $db_coef = $wie[$igroup][$iname]["db_coef"];

    $str = $w['src_id'] - 1;
    $vol = icf($caa[jcRENDER], $str, "Volume", $wie[$igroup][$iname]["volume"]);
    $vol_st = vol2db($vol, $vol_default, $db_max, $db_coef) . " dB";
    if ($wj['f_format'] == 'MIDI') $tr_name = $w['src_name'];
    else $tr_name = $xca->voice[$v]->unique_name;
    $name = "$w[src_id]. <b>$tr_name ($w[i_group]/$w[i_name])</b>"; // $vol_st$sugg
    $fname3 = str_replace(".png", ".mp3", $fname);
    show_autovolume_track($wj, $fname, $name,
      "$w[src_id]. $tr_name ($w[i_group]/$w[i_name]), voice $v, stage $sta",
      "Voice $v, stage $sta", $fname3, $wj['j_id'], $v, $src_id);
  }
  foreach ($submix_fname as $x => $fname) {
    $fname3 = str_replace(".png", ".mp3", $fname);
    show_autovolume_track($wj, $fname, "<b>Submix</b> of stage #$x",
      "Submix of stage $x",
      "", $fname3, $wj['j_id'], -1);
  }
}

function show_autovolume_track($wj, $png_name, $name, $name2, $title, $mp3_name, $j_id, $v, $src_id=-1) {
  GLOBAL $jplayer_tracks, $ua, $master_mp3;
  $thumb_name = str_replace(".png", "_.png", $png_name);
  if (!file_exists($thumb_name)) return;
  $dlen = round(filesize($mp3_name) / filesize($master_mp3) * 100);
  echo "<script>";
  echo "jtrack_name[$jplayer_tracks] = '$name2';";
  echo "</script>";
  echo "<div class='tiicontainer'>";
  //echo "<a target=_blank href='pianoroll.php?j_id=$j_id&v=$v'>";
  //echo "<a href='stems.php?j_id=$j_id&trf=$tr'>";
  echo "<img width=$dlen% height=120 class='jplayer_waveform' id='jplayer_waveform$jplayer_tracks' style='image-rendering: -webkit-optimize-contrast; -webkit-transform: translateZ(0); transform: translateZ(0); border: 1px solid #DDDDDD;' src='$thumb_name" . "?nc=$wj[j_finished]'>";
  echo "<img class='jplayer_progress' id='jplayer_progress$jplayer_tracks' src=img/black.png height=400 width=0 style='opacity: 0.25; position: absolute; top: 0px; left: 0px;'></a>";
  echo "<input class='jplayer_pos_input' id='jplayer_pos_input$jplayer_tracks' type=image name=icor src='img/red.png' width='100%' height='100%' style='position: absolute; top: 0px; left: 0px; opacity: 0; cursor: url(img/aim40_32.png) 17  18, auto'>";
  echo "<div class='tiitext'>";
  if ($v > -1) echo "<a title='$title' href='pianoroll.php?j_id=$j_id&v=$v' target='_blank'>";
  echo "$name</a>";
  echo " <a href='$mp3_name?nc=$wj[j_finished]'><img title='Download MP3 file' src='img/download.png' height='15'></a>";
  if ($src_id > -1) echo " <a target=_blank href='iset.php?f_id=$wj[f_id]&tr=$src_id'><img title='Change instrument settings' src='img/cog2.png' height='17'></a>";
  echo "</div>"; // <a href='$png_name' target='_blank'>
  echo "</div>";
  echo "<script> jplayer_tracks.push('$mp3_name?nc=$wj[j_finished]'); </script>";
  ++$jplayer_tracks;
}

function show_proll_player($wj, $mp3_name, $png_name, $total_width_precise) {
  GLOBAL $hzoom;
  show_jplayer($wj, $mp3_name);
  echo "<div style='width: {$total_width_precise}px; position: relative; overflow: hidden'>";
  echo "<!--suppress CssInvalidPropertyValue -->
<img width=0 height=120 style='image-rendering: -webkit-optimize-contrast; -webkit-transform: translateZ(0); transform: translateZ(0); border: 1px solid #DDDDDD;' class='jplayer_waveform' id='jplayer_waveform0' src='$png_name?nc=$wj[j_finished]'>";
  echo "<img class='jplayer_progress' id='jplayer_progress0' src=img/black.png height=130 width=0 style='opacity: 0.25; position: absolute; top: 0px; left: 0px;'></a>";
  echo "<input class='jplayer_pos_input' id='jplayer_pos_input0' type=image name=icor src='img/red.png' width='100%' height='100%' style='position: absolute; top: 0px; left: 0px; opacity: 0; cursor: url(img/aim40_32.png) 17  18, auto'>";
  $jplayer_tracks = 1;
  ?>
<script>
  let jplayer_curtrack = 0;
  jplayer_tracks.push('<?="$mp3_name?nc=$wj[j_finished]" ?>');
  window.addEventListener('DOMContentLoaded', function() {

    window.jplayer_loaded = function() {
      let img_waveform = document.getElementById('jplayer_waveform0');
      jplayer_dur = my_jPlayer.data('jPlayer').status.duration;
      img_waveform.style.width = jplayer_dur * 1000 / <?=$hzoom?>;
    };

    window.jplayer_setpos = function(tid, e) {
      let img_waveform = document.getElementById('jplayer_waveform' + tid);
      if (img_waveform == null) return;
      let img_progress = document.getElementById('jplayer_progress' + tid);
      let rect = e.target.getBoundingClientRect();
      let pos = e.pageX - rect.left - $(window).scrollLeft();
      my_jPlayer.jPlayer("playHead", pos / (img_waveform.clientWidth) * 100);
      my_jPlayer.jPlayer("play");
    };

    $(document).on("click", ".jplayer_pos_input", function (e) {
      last_player = "jPlayer";
      let id = $(this).attr('id');
      let tid = parseInt(id.slice(17 - id.length));
      jplayer_setpos(tid, e);
      return false;
    });

    $(document).on("dblclick", ".jplayer_pos_input", function (e) {
      last_player = "jPlayer";
      my_jPlayer.jPlayer("pause");
      return false;
    });

    $(document).on("contextmenu", ".jplayer_pos_input", function (e) {
      last_player = "jPlayer";
      my_jPlayer.jPlayer("pause");
      return false;
    });

    window.onkeydown = function (e) {
      if (e.keyCode === 32) {
        last_player = "jPlayer";
        if (my_jPlayer.data().jPlayer.status.paused) my_jPlayer.jPlayer("play");
        else my_jPlayer.jPlayer("pause");
        return false;
      }
      return true;
    };
  });
</script>
  <?
  echo "</div>";
}

function show_state_start($wj, $multitask) {
  GLOBAL $f_id;
  echo "<td align=right>";
  show_task_icons($f_id);
  if ($multitask) {
    show_multijob_start();
    echo "</table>";
  }
  else {
    show_job_start($wj);
    echo "</table>";
  }
  if ($wj['f_site'] != "studio") echo "</table>";
}

function show_master_player($wj, $multitask) {
  GLOBAL $f_id, $master_mp3_exist, $jplayer_tracks, $ua, $master_mp3, $track, $time;
  $master_mp3 = "share/$wj[j_folder]" . basename2($wj['f_name']) . ".mp3";
  $master_mp3_exist = file_exists($master_mp3);
  echo "<table width='100%'><tr><td>";
  if (file_exists($master_mp3)) {
    show_jplayer($wj, $master_mp3);
?>
<div id="jp_container">
  <b>Master mix:</b>
  <span style='white-space:nowrap;'>
  <a data-toggle=tooltip data-placement=top title='Play master track (includes reverb)' class="btn btn-primary jp-play" href="#"><img src='img/play5.png' height=15></a>
  <a class="btn btn-primary jp-pause" href="#"><img src="img/pause3.png" height="15"></a>
  <a class="btn btn-primary jp-stop" href="#"><img src="img/stop2.png" height="15"></a>
  </span>
  <span class="jp-current-time"></span> of <span class="jp-duration"></span>
  <?php
  if ($ua['u_verbose'] > 2)
    echo "<a target=_blank href='$master_mp3?nc=$wj[j_finished]'><img data-toggle=tooltip data-placement=top title='Download master MP3 file' src='img/download2.png' height='28'></a>&nbsp;&nbsp; ";
  ?>
</div>
<script>
  // Initial hide
  window.addEventListener('DOMContentLoaded', function() {
    $("#jp_container .jp-pause").hide();
  });

  window.jplayer_loaded = function() {
  };
</script>
<?php
  }
  show_state_start($wj, $multitask);
  if (file_exists("share/$wj[j_folder]" . basename2($wj['f_name']) . "_.png")) {
    echo "<div style='line-height:50%'><br></div>";
    //echo "<a target=_blank href='share/$wj[j_folder]" . basename2($wj['f_name']) . ".png?nc=$wj[j_finished]'>";
    echo "<div style='position: relative; overflow: hidden'>";
    echo "<img width=100% height=120 class='jplayer_waveform' style='border: 1px solid #DDDDDD;' id='jplayer_waveform0' src='share/$wj[j_folder]" . basename2($wj['f_name']) . "_.png?nc=$wj[j_finished]'>";
    echo "<img class='jplayer_progress' id='jplayer_progress0' src=img/black.png height=400 width=0 style='opacity: 0.25; position: absolute; top: 0px; left: 0px;'></a>";
    echo "<input class='jplayer_pos_input' id='jplayer_pos_input0' type=image name=icor src='img/red.png' width='100%' height='100%' style='position: absolute; top: 0px; left: 0px; opacity: 0; cursor: url(img/aim40_32.png) 17  18, auto'>";
    $jplayer_tracks = 1;
    ?>
  <script>
    let jplayer_curtrack = 0;
    let jplayer_pos_after_load = 0;
    let jplayer_sec_after_load = 0;
    let jplayer_tid = 0;
    jplayer_tracks.push('<?="$master_mp3?nc=$wj[j_finished]" ?>');
    window.addEventListener('DOMContentLoaded', function() {

      window.jplayer_loaded = function() {
        if (jplayer_pos_after_load) {
          my_jPlayer.jPlayer("playHead", jplayer_pos_after_load);
          my_jPlayer.jPlayer("play");
          jplayer_pos_after_load = 0;
        }
        if (jplayer_sec_after_load) {
          my_jPlayer.jPlayer("play", jplayer_sec_after_load);
          jplayer_sec_after_load = 0;
        }
        if (jplayer_dur) return;
        let img_waveform = document.getElementById('jplayer_waveform0');
        jplayer_dur = my_jPlayer.data('jPlayer').status.duration;
      };

      window.jplayer_setpos = function(tid, e) {
        jplayer_tid = tid;
        let img_waveform = document.getElementById('jplayer_waveform' + tid);
        if (img_waveform == null) return;
        let img_progress = document.getElementById('jplayer_progress' + tid);
        let rect = e.target.getBoundingClientRect();
        let pos = e.pageX - rect.left - $(window).scrollLeft();
        if (jplayer_curtrack !== tid) {
          my_jPlayer.jPlayer("setMedia", {mp3: jplayer_tracks[tid]});
          jplayer_curtrack = tid;
          jplayer_pos_after_load = pos / (img_waveform.clientWidth) * 100;
        } else {
          my_jPlayer.jPlayer("playHead", pos / (img_waveform.clientWidth) * 100);
          my_jPlayer.jPlayer("play");
        }
      };

      $(document).on("click", ".jplayer_pos_input", function (e) {
        // Pause multitrack
        pause();
        last_player = "jPlayer";
        let id = $(this).attr('id');
        let tid = parseInt(id.slice(17 - id.length));
        jplayer_setpos(tid, e);
        return false;
      });

      $(document).on("dblclick", ".jplayer_pos_input", function (e) {
        last_player = "jPlayer";
        my_jPlayer.jPlayer("pause");
        return false;
      });

      $(document).on("contextmenu", ".jplayer_pos_input", function (e) {
        // Pause multitrack
        pause();
        last_player = "jPlayer";
        jplayer_setpos(0, e);
        return false;
      });
    });
  </script>
    <?
    echo "</div>";
    if ($time != 0) {
      /** @noinspection SyntaxError */
      echo "<script>window.addEventListener('DOMContentLoaded', function() { ";
      echo "$(function() {";
      echo "  jplayer_sec_after_load = $time;";
      if ($track) {
        echo "  jplayer_curtrack = $track;";
        echo "  my_jPlayer.jPlayer('setMedia', {mp3: jplayer_tracks[$track]});";
      }
      echo "});";
      echo "});</script>";
    }
  }

  if ($wj['j_cleaned'] == 2 && $wj['j_state'] == 3) {
    echo "<p align='center'><img height=120 data-toggle=tooltip data-placement=top title='Results of this task were removed due to expiration. Please restart task.' src='img/expired.png'></p>";
  }
}