<?php

function show_tickets_admin() {
  GLOBAL $ml, $uid, $suid, $ua, $bheight;
  echo "<table class='table'>"; // table-striped table-hover
  echo "<thead>";
  echo "<tr>";
  echo "<th scope=col style='text-align: left;'>Id</th>";
  echo "<th scope=col style='text-align: left;'>Author</th>";
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
    LEFT JOIN users USING (u_id)
    ORDER BY t_state DESC, t_updated DESC
    LIMIT 200");
  echo mysqli_error($ml);
  $n = mysqli_num_rows($r);
  for ($i=0; $i<$n; ++$i) {
    $w = mysqli_fetch_assoc($r);
    echo "<tr>";
    echo "<td>$w[t_id]</td>";
    echo "<td><a href='files.php?suid=$w[u_id]'>$w[u_name]</td>";
    echo "<td><a href='ticket_admin.php?t_id=$w[t_id]'>$w[t_subject]</td>";
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
    else if ($w['t_state'] == 1) echo "<span style='color: red'><b>Open</b></span>";
    else if ($w['t_state'] == 2) echo "Awaiting client's reply";
    echo "</tr>\n";
  }
  echo "</tbody>";
  echo "</table>";
}

function show_ticket_admin($t_id) {
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
  if ($uid != $w['u_id'] && !$ua['u_admin']) {
    echo "<p class=text-danger><b>Sorry, you do not have access to this request, because it does not belong to you.</b></p>";
    return;
  }
  echo "<br>";
  echo "<p style='color: gray; text-align: center; margin: 0; padding: 0;'><a href='tickets_admin.php'><b>Support requests</b></a> > <b>Request #$t_id</b></p>";
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
  else if ($w['t_state'] == 1) echo "<span style='color: red'><b>Open</b></span>";
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
  textarea_ticket_comment_admin();
}

function textarea_ticket_comment_admin() {
  GLOBAL $t_id;
  $comment_min = 5;
  $comment_max = 2000;
  echo "<hr>";
  echo "<form action=ticket_admin.php method=post>";
  echo "<input type=hidden name=act value='comment'>";
  echo "<input type=hidden name=t_id value='$t_id'>";
  echo "<div class=form-group>";
  echo "<table width='100%'><tr><td>";
  echo "  <label for=comment><b></b></label>";
  echo "<td style='color: #bbbbbb' id=comment_remain align='right'>";
  echo "<td style='width: 1px; white-space: nowrap'>";
  echo " &nbsp;<a class=imgmo data-toggle=tooltip title='Styling with Markdown is supported' href=https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet target=_blank><img height=14 src=img/markdown.png></a>";
  echo "</table>";
  echo "  <textarea minlength=$comment_min maxlength=$comment_max rows=6 class='form-control' id=comment name=comment placeholder=\"Propose a solution or ask user a question\" required onkeydown='if (window.event.ctrlKey && window.event.keyCode === 13) { this.form.submit(); }'></textarea>";
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
  echo "<button type=submit value=btnSubmit name=btnSubmit class='btn btn-success'>Propose a solution or ask user a question</button> ";
  echo "<a data-toggle=tooltip data-placement=top title='Mark request as solved only if you are sure that user is satisfied' class='btn btn-outline-danger' href='ticket_admin.php?act=setsolved&t_id=$t_id' role=button>Mark request as solved</a> ";
  echo "</form>";
}

