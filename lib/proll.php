<?php

require_once "noteinfo.php";

$hzoom = 10; // ms per pixel
$nheight = 4; // note height in pixels
$ccheight = 80; // cc lane height in pixels
$dur = 60;

$colors = array("red", "green", "blue", "orange", "purple", "gray");
$ch_colors = array();

function get_ch_color($ch) {
  GLOBAL $ch_colors, $colors;
  if (!isset($ch_colors[$ch])) {
    if (mycount($ch_colors) < mycount($colors)) {
      $ch_colors[$ch] = $colors[mycount($ch_colors)];
    } else {
      $ch_colors[$ch] = $colors[mycount($colors) - 1];
    }
  }
  return $ch_colors[$ch];
}

function midi_ticks_to_time($tr) {
  GLOBAL $midiclass, $track_count, $track_name, $midi_duration, $first_track, $has_track_names,
    $midi_ppq, $mftype, $track_notes, $track_minnote, $track_maxnote, $mevents, $onoff, $cc, $vels,
    $dur;
  $track_count = $midiclass->getTrackCount();
  // Get needed track number
  // Cycle through noteon/noteoff events, convert to time
  $midi_ppq = $midiclass->getTimebase();
  if (!$midi_ppq) return;
  $tempo = 100;
  $pass = 0;
  $first_track = -1;
  $last_time = 0;
  $last_tick = 0;
  $last_tempo = 500000;
  $time = 0;
  merge_track_with_tempo($tr);
  $last_on_note = -1;
  foreach ($mevents as $tick => $events) {
    foreach ($events as $i => $event) {
      //echo "$event<br>";
      $sa = explode(" ", $event);
      $tr = $sa[0];
      if ($sa[2] == "Tempo") {
        if ($sa[3] > 0) $tempo = $sa[3];
        else $tempo = $last_tempo;
        //echo "$event: Ticks ($last_tick -> $tick) Tempo ($last_tempo -> $tempo) Time ($last_time -> $time) $pass<br>";
      }
      $pass = ($tick - $last_tick) * $last_tempo / 1000 / $midi_ppq;
      $time = $last_time + $pass;
      $last_tick = $tick;
      $last_time = $time;
      $last_tempo = $tempo;
      //$mevents[$tick][$i] = round($time) . " " . $event;
      if ($time > $dur * 1000) break;
      if ($sa[4] != "n=0" && ($sa[2] == "On" || $sa[2] == "Off")) {
        //echo "$event<br>";
        $ch = substr($sa[3], 3);
        $note = substr($sa[4], 2);
        $vel = substr($sa[5], 2);
        if ($sa[2] == "Off") $vel = 0;
        $overlap = 0;
        if ($vel) $last_on_note = $note;
        else {
          if ($last_on_note > -1 && $last_on_note != $note) {
            $overlap = 1;
          }
        }
        $onoff[$note][round($time)] = "$ch $vel $tick $overlap";
        $vels[round($time)][] = "$ch $vel";
      }
      if ($sa[2] == "Par") {
        //echo "$event<br>";
        $ch = substr($sa[3], 3);
        $c = substr($sa[4], 2);
        $vel = substr($sa[5], 2);
        $cc[$c][round($time)] = "$ch $vel $tick";
      }
    }
  }
  //echo "<pre>";
  //print_r($onoff);
  //print_r($mevents);
}

function show_proll($wj) {
  GLOBAL $wf, $ua, $mevents, $onoff, $major, $cc, $vels, $nheight, $ccheight,
    $nin, $cc_names, $cc_ids, $strack, $sta, $tr, $igroup, $iname, $voice, $hzoom,
    $f_id, $dur, $show_all_cc, $ksw_names;
  start_time();
  //$path = "share/$wj[f_folder]$wj[f_name]";
  //$path = "share/upload/2018/06-28/1-435/Eine-Kleine-Nachtmusik.mid";
  //$path = "share/upload/2018/02-18/1-232/Stravinsky_Rite_of_spring2.mid";
  $cc = array();
  if (isset($strack)) {
    $path = "share/" . $wf['f_folder'] . $wf['f_name'];
    $tr2 = intval($tr) + $wf['f_firsttrack'];
  }
  else {
    load_cc($igroup, $iname);
    load_ksw($igroup, $iname);
    $path = "share/" . $wj['j_folder'] . bfname($wj['f_name']) . "_$sta.midi";
    //echo $path;
    $mp3_name = find_mp3($wj, $tr, $sta);
    if (!file_exists($mp3_name)) {
      $mp3_name = "share/" . $wj['j_folder'] . bfname($wj['f_name']) . ".mp3";;
    }
    $tr2 = $tr + 1;
    //echo "TR$tr STA$sta<br>";
    if ($ua['u_verbose'] > 4)
      get_noteinfo($tr, $sta);
  }
  $png_name = str_replace(".mp3", ".png", $mp3_name);
  //echo "$path track $tr: $igroup / $iname<br>";
  if (load_midifile($path)) {
    return 1;
  }
  midi_ticks_to_time($tr2);
  $total_ms = $dur * 1000;
  $total_width_precise = $total_ms / $hzoom;
  $total_width = $total_width_precise + 50;

  // Which cc to show
  $cc_show = array();
  if (isset($strack) || $show_all_cc) {
    foreach ($cc as $c => $events) $cc_show[] = $c;
  }
  else {
    if ($cc_ids['Dynamics'] && is_array([$cc_ids['Dynamics']]))
      $cc_show[] = $cc_ids['Dynamics'];
    if ($cc_ids['Vibrato intensity'] && is_array([$cc_ids['Vibrato intensity']]))
      $cc_show[] = $cc_ids['Vibrato intensity'];
    if ($cc_ids['Vibrato speed'] && is_array([$cc_ids['Vibrato speed']]))
      $cc_show[] = $cc_ids['Vibrato speed'];
  }

  // Show form
  echo "<form action=pianoroll.php method=get>";
  echo "<input type=hidden name=f_id value=$f_id>";
  echo "<input type=hidden name=j_id value=$wj[j_id]>";
  echo "<input type=hidden name=v value=$voice>";
  if (isset($strack)) echo "<input type=hidden name=strack value=$strack>";
  echo "Hzoom: ";
  echo "<select name=hzoom onChange='this.form.submit();'>";
  show_option(1, $hzoom);
  show_option(2, $hzoom);
  show_option(3, $hzoom);
  show_option(5, $hzoom);
  show_option(7, $hzoom);
  show_option(10, $hzoom);
  show_option(15, $hzoom);
  show_option(20, $hzoom);
  show_option(30, $hzoom);
  show_option(50, $hzoom);
  echo "</select> ";
  echo "Duration: ";
  echo "<select name=dur onChange='this.form.submit();'>";
  show_option2(10, "0:10", $dur);
  show_option2(20, "0:20", $dur);
  show_option2(30, "0:30", $dur);
  show_option2(60, "1:00", $dur);
  show_option2(90, "1:30", $dur);
  show_option2(120, "2:00", $dur);
  show_option2(180, "3:00", $dur);
  show_option2(300, "5:00", $dur);
  show_option2(420, "7:00", $dur);
  show_option2(600, "10:00", $dur);
  echo "</select> ";
  if (!isset($strack)) {
    echo "<input onChange='this.form.submit();' type=checkbox name=show_all_cc ";
    if ($show_all_cc == "on") echo "checked";
    echo "/> Show all CC ";
  }
  //echo "<input onChange='this.form.submit();' type=checkbox name=verbosity ";
  //if ($verbosity == "on") echo "checked";
  //echo "/> Hide information in popups (KSW name, Note position, CC value, other)";
  echo "</form>";

  if (file_exists($png_name)) {
    show_proll_player($wj, $mp3_name, $png_name, $total_width_precise);
  }
  echo "<table style='border-collapse: collapse;' border=1><td>";


  echo "<div style='width: {$total_width}px'>";

  if (!is_array($onoff) || !mycount($onoff)) {
    echo "No notes in this track";
    return 1;
  }
  $min_note = min(array_keys($onoff));
  $max_note = max(array_keys($onoff));
  for ($note = $max_note; $note >= $min_note; --$note) {
    $last_vel = 0;
    $last_ms = 0;
    $last_px = 0;
    $last_tick = 0;
    $first = 1;
    $ms = 0;
    if (is_array($onoff[$note]))
      foreach ($onoff[$note] as $ms => $event) {
        //if ($note == 71) echo "($note $ms $event)<br>";
        $sa = explode(" ", $event);
        $ch = $sa[0];
        $vel = $sa[1];
        $tick = $sa[2];
        $overlap = $sa[3];
        if ($last_vel) {
          $col = get_ch_color($ch);
          if ($ua['u_verbose'] > 4 &&
            $ksw_names[GetNoteName($note)] != "") $ksw = $ksw_names[GetNoteName($note)] . " ";
          else $ksw = "";
          //if ($overlap) $overlap_st = "Ends with overlap";
          //else $overlap_st = "Ends without overlap";
          $title = " title='{$ksw}Note " . GetNoteName($note) . " ($note), Vel $last_vel, Ch $ch";
          if ($ua['u_verbose'] > 4) {
            $title .= ", ticks $last_tick-$tick, $last_ms-$ms ms";
            //echo "$last_tick/$note";
            //echo "Checking nin $last_tick $note<br>";
            if (isset($nin[$last_tick][$note])) {
              $title .= "\nDelta ms: " . $nin[$last_tick][$note]->dstime . ", " . $nin[$last_tick][$note]->detime;
              $title .= "\nArticulation: " . $nin[$last_tick][$note]->artic;
              $title .= "\nStart: " . $nin[$last_tick][$note]->comment_start;
              $title .= "\nEnd: " . $nin[$last_tick][$note]->comment_start;
            }
          }
          $title .= "'";
          $style = " style='opacity: " . round(0.2 + $last_vel / 127 * 0.8, 1) . "'";
        }
        else {
          if ($major[$note % 12]) $col = "white";
          else $col = "llgray";
          $style = "";
          // Detect multiple note offs
          if ($vel == 0) {
            $col = get_ch_color($ch);
            $style = " style='opacity: " . round(0.2 + 20 / 127 * 0.8, 1) . "'";
          }
          if ($ua['u_verbose'] > 4 &&
            $ksw_names[GetNoteName($note)] != "") $ksw = $ksw_names[GetNoteName($note)] . " ";
          else $ksw = "";
          $title = " title='$ksw'";
        }
        $real_ms = $last_px * $hzoom;
        $width = max(1, round(($ms - $real_ms) / $hzoom));
        $px = $last_px + $width;
        if ($vel && $last_vel && $width > 1) {
          echo "<img$title$style src=img/$col.png width=" . ($width-1) . " height=$nheight>";
          echo "<img src=img/white.png width=1 height=$nheight>";
        }
        else if (!$vel && !$last_vel && $width > 1 && !$first) {
          echo "<img src=img/white.png width=1 height=$nheight>";
          echo "<img$title$style src=img/$col.png width=" . ($width-1) . " height=$nheight>";
        }
        else if ($overlap && $width > 1 && $last_vel) {
          echo "<img$title$style src=img/$col.png width=" . ($width-1) . " height=$nheight>";
          echo "<img src=img/black.png width=1 height=$nheight>";
        }
        else {
          echo "<img$title$style src=img/$col.png width=$width height=$nheight>";
        }
        $last_vel = $vel;
        $last_ms = $ms;
        $last_tick = $tick;
        $last_px = $px;
        $first = 0;
      }
    if ($major[$note % 12]) $col = "white";
    else $col = "llgray";
    $width = ($total_ms - $ms) / $hzoom;
    if ($ksw_names[GetNoteName($note)] != "") $ksw = $ksw_names[GetNoteName($note)] . " ";
    else $ksw = "";
    $title = " title='$ksw'";
    echo "<img$title src=img/$col.png width=$width height=$nheight>";
    echo "<br>";
    if ($note % 12 == 0) {
      $width = $total_ms / $hzoom;
      echo "<img src=img/gray.png width=$width height=1>";
      echo "<br>";
    }
    if ($note % 12 == 5) {
      $width = $total_ms / $hzoom;
      echo "<img src=img/lgray.png width=$width height=1>";
      echo "<br>";
    }
  }
  echo "<img src=img/black.png width=$total_width height=1>";
  echo "<br>";
  echo "</div>";
  echo "<style>";
  echo ".cc_container { width: {$total_width}px; height: " . ($ccheight + 1) . "px; position: relative; }";
  echo "</style>";
  echo "<div style='width: {$total_width}px'>";
  foreach ($cc_show as $c) {
    $events = $cc[$c];
    $last_px = 0;
    $last_vel = 0;
    $height = 0;
    echo "<div class=cc_container>";
    echo "<div class=cc_div>&nbsp;&nbsp;CC $c";
    if ($cc_names[$c] != "") echo " - $cc_names[$c]";
    echo "</div>";
    echo "<div class=cc_div>";
    if (is_array($events))
      foreach ($events as $ms => $event) {
        $sa = explode(" ", $event);
        $ch = $sa[0];
        $vel = $sa[1];
        $tick = $sa[2];
        $col = get_ch_color($ch);
        $height0 = $height;
        $real_ms = $last_px * $hzoom;
        $width = round(($ms - $real_ms) / $hzoom);
        $px = $last_px + $width;
        $height = round($ccheight * $vel / 127);
        if ($ua['u_verbose'] > 4) $title = " title='$last_vel ($ms ms, tick $tick)' ";
        else $title = "";
        if ($width > 1) {
          echo "<img$title src=img/l$col.png width=" . ($width - 1) . " height=$height0>";
        }
        if ($width > 0 || !$last_px) {
          if ($ua['u_verbose'] > 4) $title = " title='$vel ($ms ms, tick $tick)' ";
          else $title = "";
          echo "<img$title src=img/$col.png width=1 height=$height>";
        }
        $last_vel = $vel;
        $last_px = $px;
      }
    echo "<img src=img/white.png width=1 height=$ccheight><br>";
    echo "<img src=img/black.png width=$total_width height=1>";
    echo "</div>";
    echo "</div>";
  }
  echo "<div class=cc_container>";
  echo "<div class=cc_div>&nbsp;&nbsp;Velocity</div>";
  echo "<div class=cc_div>";
  $last_px = 0;
  foreach ($vels as $ms => $arr) {
    foreach ($arr as $id => $event) {
      //if (!$ms) echo "$ms<br>";
      $sa = explode(" ", $event);
      $ch = $sa[0];
      $vel = $sa[1];
      $col = get_ch_color($ch);
      $real_ms = $last_px * $hzoom;
      $width = max(1, round(($ms - $real_ms) / $hzoom));
      $px = $last_px + $width;
      $height = round($ccheight * $vel / 127);
      $title = " title='$vel' ";
      if ($width > 1) {
        echo "<img src=img/white.png width=" . ($width - 1) . " height=1>";
      }
      echo "<img $title src=img/$col.png width=1 height=$height>";
      $last_px = $px;
    }
  }
  echo "<img src=img/white.png width=1 height=$ccheight><br>";
  echo "</div>";
  echo "</div>";
  echo "</table>";
  echo "<br>";
  echo "Script RAM usage: " . round(memory_get_usage() / 1024 / 1024) . " Mb<br>";
  echo "Events: " . mycount($mevents) . "<br>";
  echo "Note color means channel. Note opacity means velocity. Black line at the end of note means legato overlap.<br>";
  stop_time();
}

function show_crosshair() {
  GLOBAL $hzoom;
?>
<div id="crosshair-h" class="hair"></div>
<div id="crosshair-v" class="hair"></div>
<span id="mousepos"></span>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    // Setup our variables
    var cH = $('#crosshair-h'),
      cV = $('#crosshair-v');

    $(this).on('mousemove touchmove', function (e) {
      var x = e.pageX;
      var y = e.pageY;
      cH.css('top', e.pageY - $(window).scrollTop());
      cV.css('left', e.pageX - $(window).scrollLeft());

      $('#mousepos').css({
        top: (e.pageY - 60) + 'px',
        left: e.pageX + 'px'
      }, 800);
      var sec = ((x - 8) * <?=$hzoom ?>) / 1000;
      let minutes = Math.floor(sec / 60);
      sec = (sec - minutes * 60).toFixed(2);
      if (!isFinite(e.clientX) || !isFinite(e.clientY)) return;
      let elover = document.elementFromPoint(e.clientX, e.clientY);
      $('#mousepos').text(minutes + ":" + sec + "\xa0sec");
      e.stopPropagation();
    });

  });
</script>
<?php
}

