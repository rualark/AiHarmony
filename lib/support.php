<?php
require_once __DIR__ . "/../plugin/parsedown/parsedown.php";

$ticket_types = array(
  'General' => 'General',
  'File' => 'Problem with file'
);

function show_tickets() {
  GLOBAL $ml, $uid, $suid, $ua, $bheight;
  echo "<table class='table'>"; // table-striped table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col style='text-align: left;'>Id</th>";
  echo "<th scope=col style='text-align: left;'>Description</th>";
  echo "<th scope=col style='text-align: left;'>Created</th>";
  echo "<th scope=col style='text-align: left;'>Last activity</th>";
  echo "<th scope=col style='text-align: left;'>Status</th>";
  echo "</tr>\n";
  echo "</thead>";
  echo "<tbody>";
  $r = mysqli_query($ml, "SELECT *, 
    TIMESTAMPDIFF(SECOND, t_created, NOW()) as pass_created, 
    TIMESTAMPDIFF(SECOND, t_updated, NOW()) as pass_updated 
    FROM tickets 
    WHERE u_id=$uid
    ORDER BY t_state DESC, t_updated DESC
    LIMIT 200");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    echo "<td>$w[t_id]</td>";
    echo "<td><a href='ticket.php?t_id=$w[t_id]'>$w[t_subject]</td>";
    echo "<td title='$w[t_created]'>" . human_pass($w['pass_created']) . " ago";
    echo "<td title='$w[t_updated]'>" . human_pass($w['pass_updated']) . " ago";
    echo "<td>";
    if ($w['t_state'] == 0) {
      if ($w['pass_updated'] > 60 * 60 * 24 * 5) {
        echo "<span title='Request is considered to be solved if there is no responce from client within 5 days after solution was proposed' style='color: green'><b>Solved</b></span>";
      }
      else {
        echo "<span style='color: green'>Proposed solution</span>";
      }
    }
    else if ($w['t_state'] == 1) echo "Open";
    else if ($w['t_state'] == 2) echo "Awaiting client's reply";
    echo "</tr>\n";
  }
  echo "</tbody>";
  echo "</table>";
}

function show_ticket($t_id) {
  GLOBAL $ml, $uid, $ticket_types, $wf, $f_id, $ua;
  $r = mysqli_query($ml, "SELECT *, 
    TIMESTAMPDIFF(SECOND, t_created, NOW()) as pass_created, 
    TIMESTAMPDIFF(SECOND, t_updated, NOW()) as pass_updated 
    FROM tickets 
    LEFT JOIN users USING (u_id)
    WHERE t_id='$t_id'
  ");
  echo mysqli_error($ml);
  $w = mysqli_fetch_assoc($r);
  if ($w['f_id']) {
    $f_id = $w['f_id'];
    load_file();
  }
  if ($uid != $w['u_id']) {
    echo "<p class=text-danger><b>Sorry, you do not have access to this request, because it does not belong to you.</b></p>";
    return;
  }
  echo "<br>";
  echo "<p style='color: gray; text-align: center; margin: 0; padding: 0;'><a href='tickets.php'><b>My requests</b></a> > <b>Request #$t_id</b></p>";
  echo "<b>Category:</b> " . $ticket_types[$w['t_type']] . "<br>";
  echo "<b>State:</b> ";
  if ($w['t_state'] == 0) {
    if ($w['pass_updated'] > 60 * 60 * 24 * 5) {
      echo "<span title='Request is considered to be solved if there is no responce from client within 5 days after solution was proposed' style='color: green'><b>Solved</b></span>";
    }
    else {
      echo "Proposed solution";
    }
  }
  else if ($w['t_state'] == 1) echo "Open";
  else if ($w['t_state'] == 2) echo "Awaiting client's reply";
  if ($w['f_id']) echo "<br><b>File:</b> <a href='file.php?f_id=$w[f_id]'>$wf[f_source]</a>";
  if ($w['track']) echo "<br><b>Part:</b> $w[track_name]";
  if ($w['track_time'] != "") {
    echo "<br><b>Time in file:</b> ";
    $sa = explode(":", $w['track_time']);
    echo "<a href='file.php?f_id=$w[f_id]&time=" . max(0, $sa[0] * 60 + $sa[1] - 2);
    if ($w['track']) echo "&track=$w[track]&tab=stems";
    echo "'>$w[track_time]</a>";
  }
  echo "<hr>";
  echo "<i><b>$w[u_name]</b> at $w[t_created]</i><br>";
  // Parse
  $Parsedown = new Parsedown();
  $parsed = $Parsedown->text($w['t_descr']);
  // Bootstrap
  $parsed = str_replace("<table>", "<table class=table>", $parsed);
  echo $parsed;
  show_ticket_comments();
  textarea_ticket_comment();
}

function show_ticket_comments() {
  GLOBAL $ml, $t_id;
  $r = mysqli_query($ml, "SELECT *, 
    TIMESTAMPDIFF(SECOND, c_created, NOW()) as pass_created
    FROM ticket_comments 
    LEFT JOIN users USING (u_id) 
    WHERE t_id=$t_id
    ORDER BY c_created
    LIMIT 200");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i = 0; $i < $n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<hr>";
    echo "<i><b>$w[u_name]</b> at $w[c_created]</i><br>";
    // Parse
    $Parsedown = new Parsedown();
    $parsed = $Parsedown->text($w['c_text']);
    // Bootstrap
    $parsed = str_replace("<table>", "<table class=table>", $parsed);
    echo $parsed;
  }
}

function file_support_script() {
  GLOBAL $f_id;
  ?>
  <script>
    function new_file_ticket() {
      let current_time_st = "";
      let tid = 0;
      let tname = "";
      if (typeof my_jPlayer !== 'undefined') {
        let current_time = my_jPlayer.data('jPlayer').status.currentTime;
        if (current_time !== 'undefined') {
          let sec = Math.floor(current_time);
          let minutes = Math.floor(sec / 60);
          sec = sec - minutes * 60;
          current_time_st = minutes + ":" + sec.toString().padStart(2, '0');
          if (jplayer_tid) {
            tid = jplayer_tid;
            tname = jtrack_name[jplayer_tid];
          }
          else tname = "Master";
        }
      }
      window.location.href = 'ticket_new.php?t_url=<?=$_SERVER['REQUEST_URI']?>&t_type=File&f_id=<?=$f_id?>&time=' + current_time_st + '&track=' + tid + '&tname=' + tname;
      return false;
    }
  </script>
  <?php
}

function textarea_ticket_descr($descr) {
  $descr_min = 25;
  $descr_max = 1000;
  echo "<div class=form-group>";
  echo "<table width='100%'><tr><td>";
  echo "  <label for=descr><b>What can we help you with?</b></label>";
  echo "<td style='color: #bbbbbb' id=descr_remain align='right'>";
  echo "<td style='width: 1px; white-space: nowrap'>";
  echo " &nbsp;<a class=imgmo data-toggle=tooltip title='Styling with Markdown is supported' href=https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet target=_blank><img height=14 src=img/markdown.png></a>";
  echo "</table>";
  echo "  <textarea minlength=$descr_min maxlength=$descr_max rows=8 class=form-control id=descr name=descr placeholder=\"Type your question or a description of the problem you're trying to solve here (minimum of $descr_min characters)\" required>$descr</textarea>";
  echo "</div>";
  ?>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    function update_descr_remain() {
      let len = $('#descr').val().length;
      len = <?=$descr_max?> -len;
      $('#descr_remain').html(len + ' characters remaining');
    }

    $('#descr').keyup(function () {
      update_descr_remain();
    });
    $(function () {
      update_descr_remain();
    });
  });
</script>
  <?php
}

function textarea_ticket_comment() {
  GLOBAL $t_id;
  $comment_min = 5;
  $comment_max = 1000;
  echo "<hr>";
  echo "<form action=ticket.php method=post>";
  echo "<input type=hidden name=act value='comment'>";
  echo "<input type=hidden name=t_id value='$t_id'>";
  echo "<div class=form-group>";
  echo "<table width='100%'><tr><td>";
  echo "  <label for=comment><b></b></label>";
  echo "<td style='color: #bbbbbb' id=comment_remain align='right'>";
  echo "<td style='width: 1px; white-space: nowrap'>";
  echo " &nbsp;<a class=imgmo data-toggle=tooltip title='Styling with Markdown is supported' href=https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet target=_blank><img height=14 src=img/markdown.png></a>";
  echo "</table>";
  echo "  <textarea minlength=$comment_min maxlength=$comment_max rows=6 class='form-control' id=comment name=comment placeholder=\"Add a comment\" required></textarea>";
  echo "</div>";
  ?>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    function update_comment_remain() {
      let len = $('#comment').val().length;
      len = <?=$comment_max?> -len;
      $('#comment_remain').html(len + ' characters remaining');
    }

    $('#comment').keyup(function () {
      update_comment_remain();
    });
    $(function () {
      update_comment_remain();
    });
  });
</script>
  <?php
  echo "<button type=submit value=btnSubmit name=btnSubmit class='btn btn-primary'>Comment</button>";
  echo "</form>";
}

function show_file_presubmit() {
  GLOBAL $wf, $caa, $site_name;
  echo "<div style='background: #aaccee; border-color: black;' class='col-sm-12 rounded border border-primary'>";
  echo "<div style='line-height:50%'><br></div>";
  echo "<h5 style='text-align: center'>This usually helps if you have sound problems:</h5>";
  echo "<div style='line-height:50%'><br></div>";
  echo "<ul>";
  if ($wf['f_format'] == 'MIDI') {
    echo "<li>Did you export this file from <b>" . $caa[jcRENDER]['MidiFileType'] . "</b>? If not, choose correct notation software in file settings.";
    echo "<li>If something sounds not as expected in $site_name, first ensure that <b>everything sounds correctly in your notation software</b>.";
    /*
    if ($caa[jcRENDER]['MidiFileType'] == 'Finale') {
      echo "<li>Before exporting from Finale, ensure that all the <b>instruments have their correct names</b> (Window - Score manager - Full name) and Device for each instrument is set to Garritan Instruments (Window - Score manager - Device).";
      echo "<li>Before exporting from Finale, ensure that all the <b>instruments are assigned to their respective playback sounds</b> (MIDI/Audio - Reassign playback sounds). Verify your results (Window - Score Manager).";
    }
    */
    if ($caa[jcRENDER]['MidiFileType'] != 'Other') {
      echo "<li>Check <a href='docs.php?d=re_" . $caa[jcRENDER]['MidiFileType'] . "' target='_blank'>recommendations for exporting from " . $caa[jcRENDER]['MidiFileType'] . "</a>.";
    }
    echo "<li>Check <a href='docs.php?d=re_recommendations' target='_blank'>general recommendations.";
    echo "<li>Check <a href='docs.php?d=re_algorithms' target='_blank'>algorithm parameters that you can change to achieve different results</a>.";
  }
  echo "</div>";
  echo "<div style='line-height:90%'><br></div>";
}

function show_newticket() {
  GLOBAL $f_id, $act, $track, $time, $t_type, $ticket_types, $subject, $descr, $wf,
    $waj, $tname, $t_url, $caa;
  $subject = stripslashes(str_replace("\"", "'", trim($subject)));
  $descr = stripslashes(str_replace("\\r\\n", "\n", trim($descr)));
  echo "<br>";
  if ($f_id) {
    load_active_jobs();
    $caa = parse_jobs_config($waj);
  }
  echo "<h3>Submit a request</h3>";
  echo "<hr>";
  echo "<form action=ticket_new.php method=post>";
  echo "<input type=hidden name=t_url value='$t_url'>";
  echo "<input type=hidden name=f_id value='$f_id'>";
  echo "<input type=hidden name=track value='$track'>";
  echo "<input type=hidden name=tname value='$tname'>";
  echo "<input type=hidden name=time value='$time'>";
  if ($act == "" && $t_type == "File" && $wf['f_format'] == 'MIDI' && $time != "") {
    echo "<input type=hidden id=act name=act value=presubmit>";
  }
  else {
    echo "<input type=hidden id=act name=act value=submit>";
  }
  echo "<div class=form-group>";
  echo "  <label for=t_type><b>Category:</b></label>";
  echo "  <select class='form-control custom-select' name=t_type onChange=\"$('#act').val(''); this.form.submit();\">";
  show_option2("", "Please select", $t_type);
  foreach ($ticket_types as $key => $val) {
    show_option2($key, $val, $t_type);
  }
  echo "  </select> ";
  echo "</div>";
  if ($t_type == "File" && !$f_id) {
    echo "<div id='mt_large_warning' class='card text-white bg-warning mb-3'>";
    //echo "<div class='card-header'>Header</div>";
    echo "<div class='card-body p-2'>";
    echo "  <p align=center class='card-text' style='color: black'><b>If you want to report problem with specific uploaded file, please <a href='files.php'>choose file</a> and create support request from there.</b>";
    echo "</div></div>";
  }
  else if ($t_type != "") {
    if ($f_id) echo "<b>File:</b> <a href='file.php?f_id=$f_id'>$wf[f_source]</a><br>";
    if ($t_type == 'File' && $wf['f_format'] == 'MIDI') {
      if ($track) echo "<b>Part:</b> $tname<br>";
      if ($time == "0:00") {
        echo "<br>";
        echo "<div id='mt_large_warning' class='card text-white bg-warning mb-3'>";
        echo "<div class='card-body p-2'>";
        echo "  <p align=center class='card-text' style='color: black'>To get a faster response, specify exact time where sound problem occurs before creating support request. You can do it by double clicking on the track at that specific time. You can report a sound problem in a master track or in any instrument track (Solo parts tab).";
        echo "</div></div>";
      }
      else if ($time != "") {
        echo "<b>Time in file:</b> $time<br>";
        echo "<br>";
      }
      else {
        echo "<br>";
      }
    }
    else {
      echo "<br>";
    }
    if ($t_type == "File" && $wf['f_format'] == 'MIDI' && $time != "") {
      if ($act == "presubmit") {
        textarea_ticket_descr($descr);
        echo "<button type=submit value=btnSubmit name=btnSubmit class='btn btn-primary'>Submit</button>";
      } else {
        show_file_presubmit();
        echo "<button type=submit value=btnSubmit name=btnSubmit class='btn btn-primary'>I still need help, procede to request submission</button>";
      }
    }
    else {
      textarea_ticket_descr($descr);
      echo "<button type=submit value=btnSubmit name=btnSubmit class='btn btn-primary'>Submit</button>";
    }
    if ($t_type == "File" && $wf['f_private']) {
      echo "<br><br>By submitting this support request I agree that support specialist can access my file, change its configuration and restart processing if needed";
    }
  }
  echo "</form>";
}

function check_open_requests() {
  GLOBAL $ml, $wf;
  $r = mysqli_query($ml, "SELECT *
    FROM tickets 
    WHERE f_id=$wf[f_id] AND t_state>0 AND t_type='File'");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  if ($n) {
    echo "<script>let detected_file_open_requests = 1; </script>";
  }
}