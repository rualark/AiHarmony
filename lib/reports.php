<?php

require_once "layout.php";
require_once "sliderlib.php";

function get_job_queue_place($wj) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT COUNT(*) as cnt FROM jobs 
      WHERE (j_state=1 OR j_state=2) AND 
      (j_priority < '$wj[j_priority]' OR j_id < '$wj[j_id]')");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  return $w['cnt'];
}

function get_job_queue_wait($wj) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT TIMESTAMPDIFF(SECOND, j_queued, NOW()) as pass 
    FROM jobs WHERE j_id='$wj[j_id]'");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  return $w['pass'];
}

function show_job_icon($w, $t=0, $bheight=24) {
  GLOBAL $jclasses;
  if ($w['j_class'] == jcRENDER) {
    $fname = "share/" . bjurl($w) . ".mp3";
    $ftype = "MP3";
  }
  else {
    $fname = "share/" . bjurl($w) . ".pdf";
    $ftype = "PDF";
  }
  if (!$w['j_id']) return "-";
  $jclass = $jclasses[$w['j_class']];
  if ($t == 0) {
    if ($w['j_deleted'] && !$w['j_state'])
      return "<a title='$jclass: This task was archived and did not start' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/delete.png></a>";
    if ($w['j_state'] == 0)
      return "<a title='$jclass: Need to manually start this task' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/draft.png></a>";
    if ($w['j_state'] == 1)
      return "<a title='$jclass: Will run after ".get_job_queue_place($w)." jobs\nWaiting in queue for ".
        human_pass(get_job_queue_wait($w))." already' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/wait8_2.gif></a>";
    if ($w['j_state'] == 2)
      return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/progress26.gif></a>";
    if ($w['j_state'] == 3 && $w['j_result']) {
      if (file_exists($fname)) {
        if ($w['j_result'] && $w['j_result'] < 3) $style = "color: red; ";
        else if ($w['j_result']) $style = "color: orange; ";
        return "<a target=_blank style='$style' title='$jclass: $w[j_progress]' href='$fname'><b>$ftype</b></a>";
      }
      else {
        if ($w['j_result'] && $w['j_result'] < 3)
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/stop.png></a>";
        else if ($w['j_result'])
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/warning.png></a>";
      }
    }
    if ($w['j_cleaned'] == 2) {
      return "<img title='$jclass: Task expired. Please restart'height=$bheight src=img/expired.png>";
    }
    if ($w['j_class'] == jcRENDER) {
      return "<a target=_blank title='$jclass: Task completed' href='$fname'><b>MP3</b></a>";
    }
    else {
      return "<a target=_blank title='$jclass: Task completed' href='$fname'><b>PDF</b></a>";
    }
  }
  if ($t == 1) {
    if ($w['j_deleted'] && !$w['j_state'])
      return "<a title='$jclass: This task was archived and did not start' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/delete.png></a>";
    if ($w['j_state'] == 0)
      return "<a title='$jclass: Need to manually start this task' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/draft.png></a>";
    if ($w['j_state'] == 1)
      return "<a title='$jclass: Will run after ".get_job_queue_place($w)." jobs\nWaiting in queue for ".
        human_pass(get_job_queue_wait($w))." already' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/wait8_2.gif></a>";
    if ($w['j_state'] == 2)
      return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/progress26.gif></a>";
    if ($w['j_state'] == 3 && $w['j_result']) {
      if ($w['j_class'] == jcRENDER) {
        if (file_exists($fname)) {
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/warning.png></a>";
        }
        else {
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/stop.png></a>";
        }
      }
      else {
        if (file_exists($fname)) {
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/warning.png></a>";
        }
        else {
          return "<a title='$jclass: $w[j_progress]' href='file.php?f_id=$w[f_id]'><img height=$bheight src=img/stop.png></a>";
        }
      }
    }
    return "<a title='$jclass: Task completed OK' href='file.php?f_id=$w[f_id]'><img height=$bheight src='img/ok.png'></a>";
  }
  if ($t == 2) {
    if ($w['j_state'] < 3) return "-";
    if ($w['j_cleaned'] == 2) {
      return "<img title='$jclass: Task expired. Please restart'height=$bheight src=img/expired.png>";
    }
    $status_text = "Task completed";
    if ($w['j_result'] && $w['j_result'] < 3) {
      $style = "color: red; ";
      $status_text = $w['j_progress'];
    }
    else if ($w['j_result']) {
      $style = "color: orange; ";
      $status_text = $w['j_progress'];
    }
    if ($w['j_class'] == jcRENDER) {
      if (file_exists($fname)) {
        return "<a style='$style' target=_blank title='$jclass: $status_text' href='$fname'><b>MP3</b></a>";
      }
      else return "-";
    }
    else {
      if (file_exists($fname)) {
        return "<a style='$style' target=_blank title='$jclass: $status_text' href='$fname'><b>PDF</b></a>";
      }
      else return "-";
    }
  }
  return "-";
}

function show_uploads($site_folder) {
  GLOBAL $ml, $uid, $suid, $ua, $bheight, $show_deleted, $url_root, $f_site, $algo;
  echo "<table class='table'>"; // table-striped table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col style='text-align: center;'>Uploaded</th>";
  if (!$uid) echo "<th scope=col style='text-align: center;'>User</th>";
  echo "<th scope=col style='text-align: left;'>Project</th>";
  echo "<th scope=col style='text-align: left;'>File</th>";
  //echo "<th scope=col style='text-align: center;'>Analyser</th>";
  echo "<th scope=col style='text-align: center;'>Analysis</th>";
  //echo "<th scope=col style='text-align: center;'>Correction</th>";
  echo "<th scope=col style='text-align: center;'>MP3</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  if ($suid) {
    if ($uid == $suid || $ua['u_admin']) {
      $cond = " AND u_id='$suid'";
    }
    else {
      $cond = " AND u_id='$suid' AND f_private=0 ";
    }
  }
  else $cond = " AND f_private=0 ";
  if (!$ua['u_admin']) {
    $cond .= " AND f_site='$f_site' ";
  }
  $r = mysqli_query($ml, "SELECT * FROM files 
    LEFT JOIN users USING (u_id)
    WHERE f_deleted<='$show_deleted' $cond
    ORDER BY f_time DESC
    LIMIT 1000");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    echo "<td align='center'>$w[f_time]</td>";
    if (!$uid) echo "<td align='center'><a href='files.php?suid=$w[u_id]'>$w[u_name]</td>";
    echo "<td align='left'>" . $algo[$w['f_gen']]['name'];
    echo "<td align='left'>";
    show_lock($w['f_private']);
    if ($w['f_deleted']) echo "<img data-toggle=tooltip data-placement=top title='This file was deleted' src='img/delete.png' height='$bheight'> ";
    echo "<a href='$url_root/$w[f_site]/file.php?f_id=$w[f_id]'>";
    echo "$w[f_source]</a>";
    if ($w['f_store'] == 366000) echo " <img data-toggle=tooltip data-placement=top title='This file will never expire (tracks MP3 will expire in one year)' src=img/infinity-green.png height=10> ";
    if ($w['f_store'] == 366001) {
      echo " <img data-toggle=tooltip data-placement=top title='This file will never expire' src=img/infinity-red.png height=10> ";
      //if ($w['f_stems'] == 0) echo " NO STEMS";
    }
    echo "</td>";
    //echo "<td align='center'>".$ftypes2[$w['f_gen']]."</td>";
    $r2 = mysqli_query($ml, "SELECT * FROM jobs WHERE f_id='$w[f_id]' AND j_deleted=0 ORDER BY j_added");
    echo mysqli_error($ml);
    $n2 = mysqli_num_rows($r2);
    $wa = array();
    $wa[jcANALYSE]['j_id'] = 0;
    $wa[jcRENDER]['j_id'] = 0;
    for ($x=0; $x<$n2; ++$x) {
      $wj = mysqli_fetch_assoc($r2);
      $wa[$wj['j_class']] = $wj;
      $wa[$wj['j_class']]['f_name'] = $w['f_name'];
    }
    echo "<td align=center>";
    if ($wa[jcANALYSE]['j_id']) {
      echo "<div id='jc".$wa[jcANALYSE]['j_id']."'>";
      echo show_job_icon($wa[jcANALYSE], 0, 24);
    }
    else if ($wa[jcCORRECT]['j_id']) {
      echo "<div id='jc".$wa[jcCORRECT]['j_id']."'>";
      echo show_job_icon($wa[jcCORRECT], 0, 24);
    }
    else if ($wa[jcGENERATE]['j_id']) {
      echo "<div id='jc".$wa[jcGENERATE]['j_id']."'>";
      echo show_job_icon($wa[jcGENERATE], 0, 24);
    }
    //echo "<td align=center><div id='jc".$wa[1]['j_id']."'>";
    //echo show_job_icon($wa[1]);
    echo "<td align=center><div id='jc".$wa[jcRENDER]['j_id']."'>";
    if ($wa[jcRENDER]['j_id']) echo show_job_icon($wa[jcRENDER], 0, 24);
    echo "</tr>\n";
  }
  echo "</tbody>";
  echo "</table>";
}

function show_iselects2() {
  GLOBAL $f_id, $caa, $wfi;
  echo "<form class='form-inline' action=store.php method=post>";
  echo "<input type=hidden name=f_id value='$f_id'>";
  echo "<input type=hidden name=action value=f_instruments>";
  load_finstruments();
  $caa[jcRENDER]['Instruments'] = change_ilist_len($caa[jcRENDER]['Instruments'], mycount($wfi));
  show_iselects($caa[jcRENDER]['Instruments']);
  echo "</form>";
}

function send_settings_scripts() {
  GLOBAL $f_id, $mtime;
  ?>
  <script>
    function send_gval(action, param, name, reload, change) {
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: {action: action, f_id: '<?=$f_id ?>', param: param,
          data: $('select.' + param).val(), nc: '<?=$mtime ?>'},
        dataType: 'html',
        success: function(data) {
          if (reload) location.reload();
          else {
            $.notify("Saved parameter: " + name, "success");
            if (change) start_blink();
          }
        },
        error: function (error) {
          $.notify("Error saving parameter: " + param, "error");
        }
      });
    }
    function send_action(action, param, name, reload, change) {
      var dataVars = {};
      dataVars['action'] = action;
      dataVars['f_id'] = '<?=$f_id ?>';
      dataVars[param] = $('select.' + param).val();
      dataVars['nc'] = '<?=$mtime ?>';
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: dataVars,
        dataType: 'html',
        success: function(data) {
          if (reload) location.reload();
          else {
            $.notify("Saved parameter: " + name, "success");
            if (change) start_blink();
          }
        },
        error: function (error) {
          $.notify("Error saving parameter: " + param, "error");
        }
      });
    }
  </script>
  <?php
}

function start_collapse_container($id, $name) {
  echo "<div class='collapse-container$id' style='width: 100%'>";
  echo "<div class='collapse-header$id'  align=left><span>$name</span></div>";
  echo "<div class='collapse-content$id'>";
}

function end_collapse_container($id, $header, $visible) {
  echo "</div>";
  echo "</div>";
?>
<script>
window.addEventListener('DOMContentLoaded', function() {
  $(".collapse-header<?=$id ?>").click(function () {
    $header = $(this);
    //getting the next element
    $content = $header.next();
    //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
    $content.slideToggle(500, function () {
      //execute this after slideToggle is done
      //change text of header based on visibility of content div
      $header.text(function () {
        //change text based on condition
        return $content.is(":visible") ? "<?=$header ?>" : "<?=$header ?>...";
      });
    });
  });
});
</script>
<style>
  .collapse-container<?=$id ?> {
    border:1px solid #d3d3d3;
  }
  .collapse-container<?=$id ?> div {
  }
  .collapse-container<?=$id ?> .collapse-header<?=$id ?> {
    background-color:#d3d3d3;
    padding: 5px;
    cursor: pointer;
    font-weight: bold;
  }
  .collapse-container<?=$id ?> .collapse-content<?=$id ?> {
    background-color: #f9f9f9;
    display: <?=$visible ?>;
    padding : 5px;
  }
</style>
<?
}

function start_gval_select($name, $width, $param, $reload, $func, $action, $change, $style='', $link='', $comment='') {
  GLOBAL $disabled;
  echo "<div class='form-group row'>";
  echo "<label title='$comment' data-toggle=tooltip data-placement=top for='$param' class='col-sm-2 col-form-label'>";
  if ($link != "") {
    echo "<a href='$link'>";
  }
  echo "$name:";
  echo "</a></label>";
  echo "<div class=col-sm-$width>";
  echo "<script>\n";
  echo "window.addEventListener('DOMContentLoaded', function() {\n";
  echo "  $('select.$param').change(function(){ send_$func('$action', '$param', '$name', $reload, $change) });\n";
  echo "});\n";
  echo "</script>\n";
  echo "<select $disabled class=\"custom-select $param\" id='$param' style='$style' name=data>";
}

function show_finale_track_warning($id, $igroup, $iname, $height) {
  GLOBAL $wie, $wfi, $caa;
  if (isset($caa[jcRENDER]) && $caa[jcRENDER]['MidiFileType'] == "Finale") {
    if (!$wfi[$id + 1]['fi_cc7']) {
      echo " <a href='docs.php?d=re_finale'><img src=img/warning_red.png height=$height data-html=true data-toggle=tooltip data-placement=top title='<b><u>Error exporting from Finale</u></b><br>Click to read how to export correctly. If this file is not from Finale, choose Other in settings.'></a>";
    }
    else if ($wie[$igroup][$iname]['i_class'] != "Keyboard" && $wie[$igroup][$iname]['i_class'] != "Unpitched percussion" && $wie[$igroup][$iname]['i_class'] != "Pitched percussion" && $igroup != "Harp") {
      if (!$wfi[$id + 1]['fi_cc1']) {
        echo " <a href='docs.php?d=re_finale'><img src=img/warning_orange.png height=$height data-html=true data-toggle=tooltip data-placement=top title='<b><u>Error exporting from Finale</u></b><br>This track was not exported as $igroup for Garritan instruments. Click to read how to export correctly. If this file is not from Finale, choose Other in settings.'></a>";
      }
    }
  }
}

function show_file_warning() {
  GLOBAL $wf, $caa;
  if ($wf['f_site'] == 'studio') {
    if ($wf['f_midi_type'] == 2) {
      echo "<div style='line-height:50%'><br></div>";
      echo "<div id='mt_large_warning' class='card text-white bg-danger mb-3'>";
      echo "<div class='card-body p-2'>";
      echo "  <p align=center class='card-text' style='color: black'><b>This is MIDI file Type $wf[f_midi_type], which is not supported. Please upload MIDI file Type 1</b>";
      echo "</div></div>";
    }
    else if (0 && $wf['f_midi_type'] == 0 && $wf['f_t0_channels'] > 1) {
      echo "<div style='line-height:50%'><br></div>";
      echo "<div id='mt_large_warning' class='card text-white bg-danger mb-3'>";
      echo "<div class='card-body p-2'>";
      echo "  <p align=center class='card-text' style='color: black'><b>This is multichannel MIDI file Type $wf[f_midi_type], which is not supported. Please upload MIDI file Type 1</b>";
      echo "</div></div>";
    }
    else if (isset($caa[jcRENDER]) && $caa[jcRENDER]['MidiFileType'] != "Other" && $wf['f_midi_type'] == 0) {
      $mftype = $caa[jcRENDER]['MidiFileType'];
      echo "<div style='line-height:50%'><br></div>";
      echo "<div id='mt_large_warning' class='card text-white bg-danger mb-3'>";
      echo "<div class='card-body p-2'>";
      echo "  <p align=center class='card-text' style='color: black'><b>This is MIDI file Type $wf[f_midi_type], which seems to be exported from $mftype. This is not recommended. Please upload MIDI file Type 1. If this file is not from $mftype, choose Other in settings.</b>";
      echo "</div></div>";
    }
  }
}

function show_iselect($id, $igroup, $iname, $verbosity) {
  GLOBAL $wi, $wig, $wie, $wfi, $disabled, $f_id, $ua, $caa;
  if ($verbosity) {
    echo "<tr>";
    echo "<td>";
    echo ($id + 1);
    //$tclass = "";
    $w = $wfi[$id + 1];
    //if ($wfi[$id + 1]['fi_found'] == 0) $tclass = "text-danger";
    show_finale_track_warning($id, $igroup, $iname, 26);
    echo "<td data-toggle=tooltip data-placement=top title='$w[fi_notes] notes ";
    if ($w['fi_notes']) {
      echo GetNoteName($w['fi_minnote']) . " - " . GetNoteName($w['fi_maxnote']);
    }
    echo " to instrument range (";
    echo $wie[$igroup][$iname]['n_min'] . " - " . $wie[$igroup][$iname]['n_max'];
    echo ")";
    echo "'><a target=_blank href='pianoroll.php?f_id=$f_id&strack=" . $id . "'>"; // <p class='$tclass'>
    echo trim($wfi[$id + 1]['fi_name']);
    if (trim($wfi[$id + 1]['fi_name']) == "") echo "[NO NAME]";
    echo "</a><td>";
    echo " <a href='iset.php?f_id=$f_id&tr=$id'><img title='Change instrument settings' src='img/cog2.png' height='25'></a> ";
  }
  //show_imixer($id, $igroup, $iname);
  //echo "<div class='col-sm-1'>$id</div>";
  //echo "<div class='col-sm-3'>".$wfi[$id+1]['fi_name']."</div>";
  echo "<select ";
  if (!isset($wie[$igroup]) || !isset($wie[$igroup][$iname])) {
    echo "style='background-color: #FFBBBB' data-toggle=tooltip data-placement=top title='Not found instrument $igroup/$iname'";
  }
  else if ($wfi[$id + 1]['fi_found'] == 0) {
    echo "style='background-color: #FFBBBB' data-toggle=tooltip data-placement=top title='Could not automatically detect instrument for this instrument name. Set to default instrument (Piano)'";
  }
  echo "$disabled class=\"form-control custom-select isel$id\" id='isel$id' name='isel$id'>\n";
  $iclass = "";
  foreach ($wig as $key => $val) {
    if ($iclass != $val['i_class']) {
      if ($iclass != "") echo "</optgroup>";
      echo "<optgroup label=\"$val[i_class]\">";
      $iclass = $val['i_class'];
    }
    echo "<option value='$val[i_group]'";
    if ($val['i_group'] == $igroup) echo " selected";
    echo ">$val[i_group]</option>";
  }
  echo "</optgroup>";
  echo "</select>\n";
  show_soundcheck($igroup, "$iname/__Default", "Example sound");
  if (mycount($wi[$igroup]) > 1 && (!$verbosity || $ua['u_verbose'] > 3)) {
    echo " <select $disabled class=\"form-control custom-select csel$id\" id='csel$id' name='csel$id'>\n";
    foreach ($wi[$igroup] as $key => $val) {
      echo "<option value='$val[i_name]'";
      if ($val['i_name'] == $iname) echo " selected";
      echo ">$val[i_name]</option>";
    }
    echo "</optgroup>";
    echo "</select>\n";
  }
  if ($ua['u_verbose'] > 6)
    echo get_inst_badges($wie[$igroup][$iname], 0);
}

function show_soundcheck($igroup, $config, $title) {
  GLOBAL $bheight, $ua, $mtime;
  if ($ua['u_verbose'] < 3) return;
  $soundcheck = "share/soundcheck/$igroup/$config.mp3";
  if (file_exists($soundcheck)) {
    // ?nc=$mtime
    echo "<a class='imgmo' title='Example sound: $title' data-toggle=tooltip data-placement=top href='$soundcheck' target=_blank><img src='img/play.png' height=$bheight></a> ";
  }
}

function show_iselects($ilist) {
  GLOBAL $wi, $bheight;
  $iused = array();
  if ($ilist != "") {
    echo "<table class='table'>"; // table-striped table-hover
    echo "<tr>";
    echo "<th scope=col data-toggle=tooltip data-placement=top title='Source track number'>#</th>";
    echo "<th scope=col>Track name</th>";
    echo "<th scope=col>Instrument";
    echo " <a href='docs.php?d=re_instruments'><img src='img/question.png' height='$bheight'></a> ";
    echo "</th>";
    echo "</tr>\n";
    $ia = explode(",", $ilist);
    $id = 0;
    foreach ($ia as $key => $val) {
      $val = trim($val);
      if (strpos($val, "/") !== false) {
        $igroup = substr($val, 0, strpos($val, "/"));
        $iname = substr($val, strpos($val, "/") + 1);
      } else {
        $igroup = $val;
        $iname = $wi[$val][0]['i_name'];
      }
      show_iselect($id, $igroup, $iname, 1);
      ++$id;
      ++$iused[$igroup];
    }
    echo "</table>";
    send_iselect_script();
    echo "<script>";
    $id = 0;
    echo "window.addEventListener('DOMContentLoaded', function() {\n";
    foreach ($ia as $key => $val) {
      echo "  $('select.isel$id').change(function(){ send_instrument($id) });\n";
      echo "  $('select.csel$id').change(function(){ send_instrument_config($id) });\n";
      ++$id;
    }
    echo "});\n";
    echo "</script>";
  }
}

function send_iselect_script() {
  GLOBAL $f_id, $mtime;
  echo "\n";
?>
<script>
  function send_instrument(ii) {
    $.ajax({
      type: 'POST',
      url: 'store.php',
      data: {
        action: 'f_instrument', f_id: '<?=$f_id ?>', inst_id: ii,
        inst: $('select.isel' + ii).val(), iconf: '', nc: '<?=$mtime ?>'
      },
      dataType: 'html',
      success: function (data) {
        location.reload();
      },
      error: function (error) {
        $.notify("Error saving track " + ii, "error");
      }
    });
  }

  function send_instrument_config(ii) {
    $.ajax({
      type: 'POST',
      url: 'store.php',
      data: {
        action: 'f_instrument', f_id: '<?=$f_id ?>', inst_id: ii,
        iconf: $('select.csel' + ii).val(), inst: '', nc: '<?=$mtime ?>'
      },
      dataType: 'html',
      success: function (data) {
        location.reload();
      },
      error: function (error) {
        $.notify("Error saving track " + ii, "error");
      }
    });
  }
</script>
<?php
}

function show_jobs_header($f_id, $j_id) {
  echo "<thead>";
  echo "<tr>";
  if (!$f_id && !$j_id) {
    echo "<th scope=col style='text-align: center;'>Queued</th>";
    echo "<th scope=col style='text-align: center;'>User</th>";
    echo "<th scope=col style='text-align: left;'>Project</th>";
    echo "<th scope=col style='text-align: left;'>File</th>";
  }
  echo "<th scope=col style='text-align: center;'>Task</th>";
  //echo "<th scope=col style='text-align: center;'>Analyser</th>";
  echo "<th scope=col style='text-align: center;'>State</th>";
  if (!$f_id && !$j_id) {
    //echo "<th scope=col style='text-align: center;'>Task started</th>";
  }
  else {
    echo "<th scope=col style='text-align: center;'>Result</th>";
    //echo "<th scope=col style='text-align: center;'>Task created</th>";
  }
  echo "</tr>\n";
  echo "</thead>";
}

function show_jobs($f_id, $j_id=0) {
  GLOBAL $ml, $jclasses, $ua, $algo, $url_root;
  load_instruments();
  echo "<table class='table'>"; // table-striped table-hover
  show_jobs_header($f_id, $j_id);
  $order = "j_deleted, j_added DESC, j_id DESC, j_class ";
  $cond = "";
  if ($f_id) $cond = " AND f_id='$f_id'";
  else if ($j_id) $cond = " AND j_id='$j_id'";
  else {
    if (!$ua['u_admin'])
      $cond .= " AND f_private=0";
    $order = "j_queued DESC, j_id DESC";
  }
  $r = mysqli_query($ml, "SELECT * FROM jobs
    INNER JOIN files USING (f_id) 
    LEFT JOIN users USING (u_id)
    WHERE f_deleted=0 $cond 
    ORDER BY $order
    LIMIT 200");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  $no_deleted = 1;
  for ($i=0; $i<$n; ++$i) {
    $wj = mysqli_fetch_assoc($r);
    if ($f_id && $wj['j_deleted'] && $no_deleted) {
      echo "</table>";
      echo "<hr><br><h3>Archived tasks:</h3><br>";
      echo "<table class='table'>"; // table-striped table-hover
      show_jobs_header($f_id, $j_id);
      $no_deleted = 0;
    }
    echo "<tr>";
    $class = "";
    if ($wj['j_deleted']) $class = "class=table-secondary";
    echo "<td $class align=center style='white-space:nowrap;'>$wj[j_queued]";
    if (!$f_id && !$j_id) {
      echo "<td $class align=left";
      if ($ua['u_admin']) echo " title='$wj[u_login]' ";
      echo "><a href='files.php?suid=$wj[u_id]'>$wj[u_name]</a>";
      echo "<td $class align=left style='white-space:nowrap;'>" . $algo[$wj['f_gen']]['name'];
      echo "<td $class align=left>";
      show_lock($wj['f_private']);
      echo "<a href='$url_root/$wj[f_site]/file.php?f_id=$wj[f_id]'>";
      echo "$wj[f_source]</a>";
    }
    echo "<td $class align='center'>";
    //if ($wj['lj_id'] > 0) echo "$wj[lj_id]. ";
    echo $jclasses[$wj['j_class']]."</td>";
    //$jconfig = load_job_config("share/" . $wj['j_folder'] . bfname($wj['f_name']) . ".pl");
    //$jcp = parse_job_config("share/" . $wj['j_folder'] . bfname($wj['f_name']) . ".pl");
    //echo "<td $class align='center'>".get_iabbr_list($jcp['Instruments'])."</td>";
    //echo "<td $class align='center'>".$ftypes2[$wj['j_gen']]."</td>";
    echo "<td $class align=center><div id='js$wj[j_id]'>";
    echo show_job_icon($wj, 1, 24);
    echo "</div>";
    if (!$f_id && !$j_id) {
      //echo "<td $class align='center' title='$wj[j_cause]'>";
      //if ($wj['j_started'][0] == '0') echo "-";
      //else echo "$wj[j_started]</td>";
    }
    else {
      echo "<td $class align=center><div id='jr$wj[j_id]'>";
      echo show_job_icon($wj, 2, 24);
      echo "</div>";
      //echo "<td $class align='center' title='$wj[j_cause]'>$wj[j_added]</td>";
    }
    echo "</tr>\n";
  }
  echo "</table>";
}

function show_maintenance() {
  GLOBAL $ml, $site_name, $site_folder;
  show_aiharmony();
  $r = mysqli_query($ml, "SELECT TIMESTAMPDIFF(SECOND, last_update, NOW()) as pass
    FROM s_status WHERE s_maintenance_mode=0 
    HAVING pass<150");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  if (!$n) {
    echo "<div class='text-white bg-warning mb-3'>";
    echo "<div class='p-2'>";
    echo "  <p align=center class='card-text' style='color: black'><b>Currently all $site_name servers are in maintenance mode. You can experience longer processing times. Please contact support if this does not resolve soon.</b>";
    echo "</div></div>";
  }
}

function show_status($s_id = 0) {
  GLOBAL $ml, $bheight2;
  echo "<div class=container>";
  // Show servers
  if ($s_id) echo "<br><h2 align=center>Processing server #$s_id</h2><br>";
  else echo "<br><h2>Processing servers:</h2><br>"; //  align=center
  echo "<div class=row>";
  $cond = "";
  if ($s_id) $cond = " WHERE s_id='$s_id'";
  $r = mysqli_query($ml, "SELECT *, 
    TIMESTAMPDIFF(SECOND, last_update, NOW()) as pass 
    FROM s_status
    $cond
    ORDER BY pass>5, server_age DESC");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    if ($s_id) {
      echo "<div class=col-sm-8 style='margin: 0 auto;'>";
      //show_screenshot_link($w['s_id'], $w['screenshot_id']);
    }
    else {
      echo "<div class=col-sm-4>";
      echo "<a href='status.php?s_id=$w[s_id]'>";
    }
    //show_screenshot($w['s_id'], $w['screenshot_id']);
    /*
    if ($s_id) {
      echo "<div class=row>";
      echo "<div class=col-sm-12 style='margin: 0 auto;'><p align='center'>";
      for ($x=1; $x<9; $x++) {
        $scr_id = ($w['screenshot_id'] + 10 - $x) % 10;
        echo "<a title='$x seconds ago' href='share/screen$w[s_id]-$scr_id.png?nc=$mtime' target=_blank><img height=$bheight2 src='share/screen$w[s_id]-$scr_id.png?nc=$mtime'></a> ";
      }
      echo "</div>";
      echo "</div>";
    }
    */
    echo "<br>";
    echo "<a href='status.php?s_id=$w[s_id]'>#$w[s_id]: $w[s_host]</a>";
    if ($w['pass'] < 5) {
      if ($w['j_id']) echo "<br>Job running: <a href='job.php?j_id=$w[j_id]'>#$w[j_id]</a>";
      if ($w['s_maintenance_mode'] == 1) {
        echo "<p data-toggle=tooltip data-placement=top title='Last update $w[pass] seconds ago' class=text-warning><b>Online (maintenance) for ".human_pass($w['server_age'])."</b></p>";
      }
      else {
        echo "<p data-toggle=tooltip data-placement=top title='Last update $w[pass] seconds ago' class=text-success><b>Online for ".human_pass($w['server_age'])."</b></p>";
      }
      if ($w['reaper_age'] > 0) echo "<img data-toggle=tooltip data-placement=top title='DAW online for ".human_pass($w['reaper_age'])."' src='img/daw.png' height=$bheight2> ";
      else echo "<img data-toggle=tooltip data-placement=top title='DAW offline' src='img/daw_gray.png' height=$bheight2> ";
      if ($w['ahk_age'] > 0) echo "<img data-toggle=tooltip data-placement=top title='AutoHotkey online for ".human_pass($w['ahk_age'])."' src='img/ahk.png' height=$bheight2> ";
      else echo "<img data-toggle=tooltip data-placement=top title='AutoHotkey offline' src='img/ahk_gray.png' height=$bheight2> ";
      if ($w['mgen_age'] > 0) echo "<img data-toggle=tooltip data-placement=top title='Algorithm online for ".human_pass($w['mgen_age'])."' src='img/algo.png' height=$bheight2> ";
      else echo "<img data-toggle=tooltip data-placement=top title='Algorithm offline' src='img/algo_gray.png' height=$bheight2> ";
      if ($w['ly_age'] > 0) echo "<img data-toggle=tooltip data-placement=top title='Engraver online for ".human_pass($w['ly_age'])."' src='img/pdf2.png' height=$bheight2> ";
      else echo "<img data-toggle=tooltip data-placement=top title='Engraver offline' src='img/pdf2_gray.png' height=$bheight2> ";
    }
    else echo "<p data-toggle=tooltip data-placement=top title='Was online $w[last_update]' class=text-danger><b>Offline for ".human_pass($w['pass'])."</b></p>";
    if ($s_id) {
      if ($w['pass'] < 5) echo "<p>" . human_pass($w['os_age']) . " since OS restart</p>";
    }
    echo "<p></p></div>";
  }
  echo "</div>";
  if ($s_id) {
    show_server_logs($s_id);
  }
  $r = mysqli_query($ml, "SELECT COUNT(*) as cnt FROM jobs WHERE j_state=1");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  echo "<br><hr>";
  echo "<p class='lead'><img src='img/wait8_2.gif' height='$bheight2'> Tasks waiting in queue: $w[cnt]</p>"; //  align=center

  $r = mysqli_query($ml, "SELECT COUNT(*) as cnt FROM jobs WHERE j_state=2");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  echo "<p class='lead'><img src='img/progress26.gif' height='$bheight2'> Tasks running: $w[cnt]</p>"; //  align=center
}

function show_server_logs($s_id) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT * FROM j_logs WHERE s_id='$s_id'
    ORDER BY l_id DESC LIMIT 100");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  if ($n) {
    echo "<hr><h4>Server logs:</h4>";
    echo "<pre>";
    for ($i=0; $i<$n; ++$i) {
      $w = mysqli_fetch_assoc($r);
      if ($w['j_id']) echo "<a href='job.php?j_id=$w[j_id]'>";
      echo "$w[l_time] $w[l_text]</a>\n";
    }
    echo "</pre>";
  }
}

function show_voices($wj) {
  GLOBAL $caa, $voa, $f_id;
  if (!mycount($voa)) return;
  echo "<table class='table'>"; // table-striped table-hover
  echo "<tr>";
  echo "<th scope=col>Source track</th>";
  echo "<th scope=col>Voice</th>";
  echo "<th scope=col>Instrument</th>";
  echo "<th scope=col>Config</th>";
  echo "<th scope=col data-toggle=tooltip data-placement=top title='Stage:Destination DAW track'>Stage : track</th>";
  echo "<th scope=col>Reverb</th>";
  foreach ($voa as $v => $w) {
    echo "<tr>";
    echo "<td>";
    if ($wj['f_format'] == "MIDI")
      echo "<a target=_blank href='pianoroll.php?f_id=$f_id&strack=" . ($w['src_id'] - 1) . "'>";
    echo "$w[src_id]. $w[src_name]</a>";
    echo "<td>$v";
    echo "<td><a target=_blank href='pianoroll.php?j_id=$wj[j_id]&v=$v'>$w[i_group]</a>";
    echo "<td>$w[i_name]";
    $fname = 1;
    echo "<td>$w[stage]:$w[track]";
    if ($w['reverb'] == $caa[jcRENDER]['reverb_mix']) echo "<td>$w[reverb]%";
    else echo "<td><b>$w[reverb]%";
  }
  echo "</table>";
}

function show_multijob_start() {
  GLOBAL $wf, $uid, $ua, $waj, $ml;
  ?>
<script>
  let start_blinker_active = 0;
  let init_start_blink = 0;
  window.addEventListener('DOMContentLoaded', function() {
    window.start_blinker = function() {
      start_blinker_active = 1;
      let el = $('#start_btn');
      el.fadeTo(600, 0.4);
      el.fadeTo(600, 1);
      el = $('#start_btn_dropdown');
      el.fadeTo(600, 0.4);
      el.fadeTo(600, 1);
      setTimeout(start_blinker, 1200);
    };

    window.start_blink = function() {
      if (start_blinker_active) return;
      let el = $('#start_btn');
      if (el.text().trim().substr(0, 13) === 'Process again')
        el.html(el.text() + ' to apply changes');
      start_blinker();
    };
    if (init_start_blink) start_blink();
  });
</script>
  <?php
  echo "<div class='btn-group'>";
  if ($wf['u_id'] != $uid && !$ua['u_admin']) {
    echo "<a id=start_btn class=\"btn btn-secondary disabled\" href='#' role=\"button\">Cannot start - this file belongs to other user</a> ";
  }
  else {
    $acol = "success";
    $ast = "";
    if ($wf['u_id'] != $uid && $ua['u_admin']) {
      $ast = " for this user (using admin rights)";
      $acol = "danger";
    }
    $r = mysqli_query($ml, "SELECT * FROM jobs WHERE f_id='$wf[f_id]' AND j_deleted=0");
    echo mysqli_error($ml);
    $n = mysqli_num_rows($r);
    $stc = array();
    $changes = 0;
    for ($i=0; $i<$n; ++$i) {
      $w = mysqli_fetch_assoc($r);
      ++$stc[$w['j_state']];
      $changes += $w['j_changes'];
    }
    if ($stc[1] + $stc[2] + $stc[3] == 0) $act = "Process";
    else if ($stc[1] + $stc[2] == 0) $act = "Process again";
    else {
      echo "<a id=start_btn class=\"btn btn-secondary disabled\" href='#' role=\"button\">Processing...</a> ";
      return;
    }
    echo "<button id=start_btn type='button' class='btn btn-$acol' onclick='if (check_job_restart()) window.location = \"store.php?action=startfile&f_id=$wf[f_id]\";'>$act$ast</button>";
    if ($ua['u_verbose'] > 5) {
      echo "<button id=start_btn_dropdown type='button' class='btn btn-$acol dropdown-toggle dropdown-toggle-split' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>";
      echo "  <span class='sr-only'>Toggle Dropdown</span>";
      echo "</button>";
      echo "<div class='dropdown-menu dropdown-menu-right'>";
      if ($waj[jcANALYSE]['j_state'] == 0) {
        echo "  <a onclick='return check_job_restart();' class='dropdown-item' href='store.php?action=startjob&j_id={$waj[jcANALYSE]['j_id']}'>Process PDF</a>";
      }
      if ($waj[jcANALYSE]['j_state'] == 3) {
        echo "  <a onclick='return check_job_restart();' class='dropdown-item' href='store.php?action=startjob&j_id={$waj[jcANALYSE]['j_id']}'>Process PDF again</a>";
      }
      if ($waj[jcRENDER]['j_state'] == 0) {
        echo "  <a onclick='return check_job_restart();' class='dropdown-item' href='store.php?action=startjob&j_id={$waj[jcRENDER]['j_id']}'>Process MP3</a>";
      }
      if ($waj[jcRENDER]['j_state'] == 3) {
        echo "  <a onclick='return check_job_restart();' class='dropdown-item' href='store.php?action=startjob&j_id={$waj[jcRENDER]['j_id']}'>Process MP3 again</a>";
      }
      echo "</div>";
    }
    echo "</div>";
    if ($act != "") {
      if ($changes) {
        echo "<script>init_start_blink = 1;</script>";
      }
    }
  }
}

function show_job_start($wj) {
  GLOBAL $ml, $uid, $ua;
  ?>
<script>
  let start_blinker_active = 0;
  let init_start_blink = 0;
  window.addEventListener('DOMContentLoaded', function() {
    window.start_blinker = function() {
      start_blinker_active = 1;
      let el = $('#start_btn');
      el.fadeTo(600, 0.4);
      el.fadeTo(600, 1);
      setTimeout(start_blinker, 1200);
    };

    window.start_blink = function() {
      if (start_blinker_active) return;
      let el = $('#start_btn');
      //console.log(el.text().substr(0, 13));
      if (el.text().trim().substr(0, 13) === 'Process again')
        el.html(el.text() + ' to apply changes');
      start_blinker();
    };
    if (init_start_blink) start_blink();
  });
</script>
  <?php
  if ($wj['u_id'] != $uid && !$ua['u_admin']) {
    echo "<a id=start_btn class=\"btn btn-secondary disabled\" href='#' role=\"button\">Cannot process - this file belongs to other user</a> ";
  }
  else {
    $acol = "success";
    $ast = "";
    if ($wj['u_id'] != $uid && $ua['u_admin']) {
      $ast = " for this user (using admin rights)";
      $acol = "danger";
    }
    if ($wj['j_state'] == 0) {
      echo "<a onclick='return check_job_restart();' id=start_btn class=\"btn btn-$acol\" href='store.php?action=startjob&j_id=$wj[j_id]' role=\"button\">
        Process$ast</a> ";
      if ($wj['j_changes']) {
        echo "<script>init_start_blink = 1;</script>";
      }
    }
    else if ($wj['j_state'] == 3) {
      echo "<a onclick='return check_job_restart();' id=start_btn class=\"btn btn-$acol\" href='store.php?action=startjob&j_id=$wj[j_id]' role=\"button\">
        Process again$ast</a> ";
      if ($wj['j_changes']) {
        echo "<script>init_start_blink = 1;</script>";
      }
    }
    else
      echo  "<a id=start_btn class=\"btn btn-secondary disabled\" href='#' role=\"button\">Processing...</a> ";
  }
}

function show_job_general($wj, $ca) {
  GLOBAL $ml, $uid, $ua;
  $w_started = get_job_starter($wj);
  echo "<b>Task progress:</b> <span id='jp$wj[j_id]'>$wj[j_progress]</span>";
  echo "<br><b>Task created:</b> $wj[j_added] by $wj[u_name] ($wj[j_cause])";
  echo "<br><b>Task queued:</b> ";
  if ($wj['j_queued'] + 0) echo "$wj[j_queued] by $w_started[u_name]";
  echo "<br><b>Task started:</b> $wj[j_started] ";
  if ($wj['s_id']) echo "on server <a href='status.php?s_id=$wj[s_id]'>#$wj[s_id]</a>";
  else echo "-";
  echo "<br><b>Total task run duration:</b> ";
  if ($wj['j_duration'] + 0) {
    echo human_pass3($wj['j_duration']);
    if ($wj['j_dur_algo'] + 0) {
      echo "<br><b>Algorithm run duration:</b> ";
      echo human_pass3($wj['j_dur_algo'] / 1000);
    }
    if ($wj['j_dur_render'] != "") {
      echo "<br><b>Stages render duration:</b> ";
      $sa = explode(",", $wj['j_dur_render']);
      $total_render_dur = 0;
      $dur = $wj['f_dur'];
      if ($ca['toload_time']) $dur = min($ca['toload_time'], $dur);
      for ($i=0; $i<mycount($sa); ++$i) {
        $total_render_dur += $sa[$i];
        if ($i) echo ", ";
        echo human_pass3($sa[$i]);
        if ($sa[$i] > 0 && $dur) {
          echo " (<b>";
          $coef = $dur / $sa[$i];
          if ($coef > 5) echo round($coef);
          else echo round($coef, 1);
          echo "x</b>)";
        }
      }
      echo "<br><b>Waveform and service run duration:</b> ";
      echo human_pass3($wj['j_duration'] - $total_render_dur - $wj['j_dur_algo'] / 1000);
    }
  }
  else echo "-";
  if ($wj['j_state'] == 2) {
    $r = mysqli_query($ml, "SELECT *, 
      TIMESTAMPDIFF(SECOND, last_update, NOW()) as pass 
      FROM s_status
      WHERE s_id='$wj[s_id]'");
    echo mysqli_error($ml);
    $w = mysqli_fetch_assoc($r);
    if ($w['pass'] < 5) {
      //echo "<div id='jsc$j_id' class=col-sm-6>";
      //show_screenshot_link($w['s_id'], $w['screenshot_id']);
      //show_screenshot($w['s_id'], $w['screenshot_id']);
      //echo "</div><br>";
    }
  }
}

function show_job_log($wj, $fname, $name) {
  if (file_exists("share/$wj[j_folder]$fname")) {
    $sa = file("share/$wj[j_folder]$fname");
    if (mycount($sa)) {
      if ($name != "") echo "<h4>$name:</h4>";
      echo "<pre>";
      for ($i = 0; $i < mycount($sa); ++$i) {
        $st = $sa[$i];
        if (strpos($st, " ! ") !== false) {
          echo "<span style='color:red'><b>$st</b></span>";
        } else echo "$st";
      }
      echo "</pre>";
    }
  }
}

function show_job_log_pretty($wj, $fname, $name) {
  if (!file_exists("share/$wj[j_folder]$fname")) return;
  $sa = file("share/$wj[j_folder]$fname");
  if (!mycount($sa)) return;
  if ($name != "") echo "<h4>$name:</h4>";
  echo "<pre>";
  // First show all red logs
  $line_count = 0;
  $more = 0;
  for ($i = 0; $i < mycount($sa); ++$i) {
    $st = $sa[$i];
    if (strpos($st, " ! ") !== false) {
      echo "<span style='color:red'><b>$st</b></span>";
      ++$line_count;
    }
  }
  for ($i = 0; $i < mycount($sa); ++$i) {
    $st = $sa[$i];
    if (strpos($st, " ! ") === false) {
      if ($line_count >= 3 && !$more) {
        $more = 1;
        echo "<span style='display: none' id='prettylog_more'>";
      }
      echo "$st";
      ++$line_count;
    }
  }
  if ($more) {
    echo "</span>";
    echo "<a id='prettylog_link' href=# onclick='prettylog_func(); return false;'><b>Show all logs</b></a>";
  }
  echo "</pre>";
?>
<script>
function prettylog_func() {
  let moreText = document.getElementById("prettylog_more");
  let moreLink = document.getElementById("prettylog_link");
  moreText.style.display = "inline";
  moreLink.style.display = 'none';
}
</script>
<?
}

function show_job_log_task($wj) {
  GLOBAL $ml;
  $r = mysqli_query($ml, "SELECT * FROM j_logs WHERE j_id='$wj[j_id]'
    ORDER BY l_id DESC LIMIT 100");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  if ($n) {
    echo "<hr><h4>Server log</h4>";
    echo "<pre>";
    for ($i=0; $i<$n; ++$i) {
      $w = mysqli_fetch_assoc($r);
      echo "$w[l_time] $w[l_text]\n";
    }
    echo "</pre>";
  }
  echo "<hr>";
}

function show_job_log_daw($wj) {
  $fa = array();
  for ($i=0; $i<100; ++$i) {
    $fname = "share/$wj[j_folder]log-daw_$i.log";
    if (!file_exists($fname)) break;
    $fa2 = file($fname);
    $fa = array_merge($fa2, $fa);
  }
  if (mycount($fa)) {
    echo "<h4>DAW log:</h4>";
    echo "<pre>";
    for ($i = 0; $i < mycount($fa); ++$i) {
      $st = $fa[$i];
      if (strpos($st, " ! ") !== false) {
        echo "<span style='color:red'><b>$st</b></span>";
      } else echo "$st";
    }
    echo "</pre><hr>";
  }
}

function show_job_midi($wj) {
  GLOBAL $ua;
  if ($ua['u_verbose'] < 5) return;
  $fname = "share/$wj[j_folder]" . basename2($wj['f_name']) . ".midi";
  if (file_exists($fname)) {
    echo "<p><a target=_blank class='btn btn-outline-primary' role='button' href='$fname'>Download adapted MIDI file</a> ";
    echo "<a target=_blank class='btn btn-outline-primary' role='button' href='midi_explorer.php?f_id=$wj[f_id]&j_id=$wj[j_id]'>Explore adapted MIDI file</a> ";
  }
}

function show_job_ly($wj) {
  GLOBAL $ua;
  if ($ua['u_verbose'] < 5) return;
  $fname = "share/$wj[j_folder]" . basename2($wj['f_name']) . ".ly";
  if (file_exists($fname) && filesize($fname)) {
    echo "<p><a class='btn btn-outline-primary' role='button' target='_blank' href='$fname'>Download generated Lilypond script</a>";
  }
}

function show_job_mp3($wj) {
  GLOBAL $wf;
  $fname = "share/$wj[j_folder]" . basename2($wj['f_name']) . ".mp3";
  if (file_exists($fname) && filesize($fname)) {
    echo "<p><a class='btn btn-outline-primary' role='button' target='_blank' href='$fname'>Download master MP3 file</a>";
  }
}

function show_file_source() {
  GLOBAL $wf, $ua;
  if ($wf['f_format'] != "None") {
    echo "<p><a target=_blank class='btn btn-outline-primary' role='button' href='share/$wf[f_folder]/$wf[f_name]'>Download source file</a> ";
    if ($wf['f_format'] == "MIDI" && $ua['u_verbose'] > 6) {
      echo "<a target=_blank class='btn btn-outline-primary' role='button' href='midi_explorer.php?f_id=$wf[f_id]&type=source'>Explore source MIDI file</a> ";
    }
    if ($wf['f_site'] == "counterpoint" && $ua['u_verbose'] > 3) {
      echo "<a class=\"btn btn-outline-primary\" href='store.php?action=reload_species&f_id=$wf[f_id]' role=\"button\">
       Reload species from XML file</a> ";
    }
    if ($ua['u_verbose'] > 1) {
      echo " <a data-toggle=tooltip data-placement=top title='Delete this source file with all resulting files' onclick='return confirm(\"Do you really want to delete this file?\");' class=\"btn btn-outline-danger\" href='store.php?action=delfile&f_id=$wf[f_id]' role='button'>
        Delete source file</a>   ";
    }
  }
  else {
    echo "<p><a data-toggle=tooltip data-placement=top title='Delete this task with all resulting files' onclick='return confirm(\"Do you really want to delete this task?\");' class=\"btn btn-outline-danger\" href='store.php?action=delfile&f_id=$wf[f_id]' role='button'>
        Delete this task</a>   ";
  }
}

function show_job_advanced($wj) {
  GLOBAL $ua;
  if ($ua['u_verbose'] < 8) return;
  $bname = basename2($wj['f_name']);
  echo "<br><b>Task finished:</b> $wj[j_finished]";
  echo "<br><b>Task timeouts:</b> Algorithm soft $wj[j_timeout], Algorithm hard $wj[j_timeout2], Engrave $wj[j_engrave], Render $wj[j_render]";
  echo "<br><b>Task algorithm:</b> $wj[j_gen]";
  echo "<br><b>Task priority:</b> $wj[j_priority]";
  echo "<br><b>Task size on disk:</b> " . human_filesize($wj['j_size'], 2);
  echo "<br><b>Master volume increase:</b> ";
  if ($wj['j_master_vol'] > 0) echo "+";
  echo "$wj[j_master_vol]% ";
  if ($wj['j_master_vol_increased']) echo "(applied)";
  else echo "(not applied)";
  show_job_log_task($wj);
  show_job_log_daw($wj);
  show_job_log($wj, "log-algorithm.log", "Algorithm log");
  show_job_log($wj, "log-debug.log", "Algorithm debug log");
  show_job_log($wj, "$bname.log", "Lilypond log");
  show_job_log($wj, "$bname.txt", "Algorithm conclusion");
}

function show_duplicate_config($class) {
  GLOBAL $duplicate_caa;
  if (!is_array($duplicate_caa[$class])) return;
  echo "<span style='color: red'>";
  foreach ($duplicate_caa[$class] as $key => $vals) {
    if (startsWith($key, "rule_overwrite_")) continue;
    echo "Parameter <b>$key</b> in config is assigned multiple times to: ";
    $first = 1;
    foreach ($vals as $key2 => $val) {
      if (!$first) {
        echo ", ";
      }
      $first = 0;
      echo "<b>$val</b>";
    }
    echo "<br>";
  }
  echo "</span>";
}

function init_editor() {
  GLOBAL $waj;
  $cm_theme = "material";
  echo "<link rel='stylesheet' type='text/css' href='plugin/codemirror/lib/codemirror.css'>";
  echo "<link rel='stylesheet' type='text/css' href='plugin/codemirror/theme/$cm_theme.css'>";
  echo "<link rel='stylesheet' type='text/css' href='plugin/codemirror/addon/dialog/dialog.css'>";
  echo "<link rel='stylesheet' type='text/css' href='plugin/codemirror/addon/search/matchesonscrollbar.css'>";
  echo "<link rel='stylesheet' type='text/css' href='plugin/codemirror/addon/display/fullscreen.css'>";
  echo "
  <script defer type='text/javascript' src='plugin/codemirror/lib/codemirror.js'></script>
  <script defer type='text/javascript' src='plugin/codemirror/addon/dialog/dialog.js'></script>
  <script defer type='text/javascript' src='plugin/codemirror/addon/search/search.js'></script>
  <script defer type='text/javascript' src='plugin/codemirror/addon/search/searchcursor.js'></script>
  <script defer type='text/javascript' src='plugin/codemirror/addon/search/matchesonscrollbar.js'></script>
  <script defer type='text/javascript' src='plugin/codemirror/addon/display/fullscreen.js'></script>
  <script defer src='plugin/codemirror/mode/perl/perl.js'></script>";
?>
<script>
  function reload_editor(edt, fname) {
    // Do not reload config if it was already changed (if user returns from another tab after changing config)
    if (editor_changed) return;
    edt.setValue('Loading config...');
    edt.refresh();
    editor_changed = 0;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", fname + '?nc=' + new Date().getTime(), true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          edt.setValue(xhr.responseText);
          editor_changed = 0;
        } else {
          edt.setValue('Cannot load config! Please reload page');
          editor_changed = 0;
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      edt.setValue('Cannot load config! Please reload page');
      editor_changed = 0;
      console.error(xhr.statusText);
    };
    xhr.send(null);
  }
<?
  echo "function refresh_editors() {";
  if (isset($waj[jcANALYSE])) {
    $fname = "share/" . $waj[jcANALYSE]['j_folder'] . bfname($waj[jcANALYSE]['f_name']) . ".pl";
    echo "reload_editor(editor{$waj[jcANALYSE]['j_id']}, '$fname');\n";
  }
  if (isset($waj[jcCORRECT])) {
    $fname = "share/" . $waj[jcCORRECT]['j_folder'] . bfname($waj[jcCORRECT]['f_name']) . ".pl";
    echo "reload_editor(editor{$waj[jcCORRECT]['j_id']}, '$fname');\n";
  }
  if (isset($waj[jcRENDER])) {
    $fname = "share/" . $waj[jcRENDER]['j_folder'] . bfname($waj[jcRENDER]['f_name']) . ".pl";
    echo "reload_editor(editor{$waj[jcRENDER]['j_id']}, '$fname');\n";
  }
  echo "}";
  echo "</script>";
}

function show_editor_footer() {
  GLOBAL $bheight;
  echo "<br><br><a href='docs.php?d=re_config'><img src='img/question.png' height='$bheight'></a> ";
  echo " <a target='_blank' class='btn btn-outline-primary' href='algo/configs' role='button'>
    Example and include configs</a>";
  echo " <a target='_blank' class='btn btn-outline-primary' href='algo/instruments' role='button'>
    Instrument configs</a>";
}

function show_job_editor($wj) {
  GLOBAL $jconfig, $cm_theme, $uid, $bheight, $ua;
  $cm_theme = "material";

  if ($wj['u_id'] == $uid || $ua['u_admin']) {
    $cm_readonly = "false";
  }
  else {
    $cm_readonly = "true";
  }
  echo "<form id='preview-form' method='post' action='store.php'>";
  echo "<input type=hidden name=action value=jconfig>";
  echo "<input type=hidden name=j_id value='$wj[j_id]'>";
  echo "<textarea class='codemirror-textarea$wj[j_id]' name='jconfig' id='jconfig$wj[j_id]'>";
  echo $jconfig;
  echo "</textarea>";
  echo "<div style='line-height:50%'><br></div>";
  echo "<div class='btn-grid'>";
  if ($wj['u_id'] != $uid) {
    if ($ua['u_admin']) {
      echo "<button data-toggle=tooltip data-placement=top title='Please inform user that you changed his/her config' type=submit name=jctype value=1 class='btn btn-danger' onclick='editor_changed=0'>Save config as admin for this user</button> ";
    }
    else {
      echo "<p class='text-danger'>You cannot change config because this file belongs to other user.</p>";
    }
  }
  else {
    echo "<button data-toggle=tooltip data-placement=top type=submit name=jctype value=1 class='btn btn-success' onclick='editor_changed=0'>Save config</button> ";
  }
  echo "</div>";
  echo "</form>";
  echo "<div style='line-height:50%'><br></div>";

  echo "
  <!--suppress JSAnnotator -->
<script>
    let editor$wj[j_id];
    window.addEventListener('DOMContentLoaded', function() {
      let code = $(\".codemirror-textarea$wj[j_id]\")[0];
      editor$wj[j_id] = CodeMirror.fromTextArea(code, {
        lineNumbers : false,
        matchBrackets: true,
        mode: 'perl',
        lineWrapping: true,
        styleActiveLine: true,
        indentUnit: 2,
        readOnly: $cm_readonly,
        theme: '$cm_theme',
        extraKeys: {
          \"Alt-F\": \"findPersistent\",
          \"F11\": function(cm) {
            cm.setOption(\"fullScreen\", !cm.getOption(\"fullScreen\"));
          },
          \"Esc\": function(cm) {
            if (cm.getOption(\"fullScreen\")) cm.setOption(\"fullScreen\", false);
          }
        }
      });
      editor$wj[j_id].display.wrapper.style.fontSize = \"16px\";
      editor$wj[j_id].setSize(\"100%\", 500);
      let charWidth = editor$wj[j_id].defaultCharWidth(), basePadding = 4;
      editor$wj[j_id].on(\"change\", function(cm, change) {
        ++editor_changed;
        //$.notify('Changed: ' + editor_changed, 'success');
      });
      editor$wj[j_id].on(\"renderLine\", function(cm, line, elt) {
        //var off = CodeMirror.countColumn(line.text, null, cm.getOption(\"tabSize\")) * charWidth;
        elt.style.textIndent = \"-\" + (charWidth*2) + \"px\";
        elt.style.paddingLeft = (basePadding + charWidth*2) + \"px\";
      });
      editor$wj[j_id].refresh();
    });
  </script>";
}

function notify_job_finish() {
  GLOBAL $url_main, $site_name;
  ?>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('notify_j_id') !== null) {
      sessionStorage.removeItem('notify_j_id');
      NotifyBrowser('Task finished', 'Your task is finished at <?=$site_name?>', '<?=$url_main?>/img/package.png');
    }
  });
</script>
  <?php
}