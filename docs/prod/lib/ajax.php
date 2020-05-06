<?php

function periodic_update($cond, $url, $ms, $reload) {
  GLOBAL $ml, $mtime, $url_main;
?>

<script>
let jstate = {};
function update_element(element) {
  let d = element.split('|');
  if (d[0].substr(0, 2) === 'ji') {
    let j_id = d[0].substr(2);
    if (jstate.hasOwnProperty(j_id)) {
      if (d[1] === '3' && <?=$reload?> === 1) {
        if (jstate[j_id] !== 3) {
          //console.log(JSON.stringify(jstate));
          //console.log(element);
          sessionStorage.setItem('notify_j_id', j_id);
          location.reload();
        }
      }
      jstate[j_id] = parseInt(d[1]);
    }
  }
  let div = document.getElementById(d[0]);
  if (div !== null) div.innerHTML = d[1];
}

window.addEventListener('DOMContentLoaded', function() {
  (function periodic_update() {
    $.ajax({
      url: '<?="$url?nc=$mtime" ?>',
      success: function(data) {
        let data2 = data.split('^');
        if (data2.length>0) {
          data2.forEach(update_element);
        }
        //$('[data-toggle="tooltip"]').tooltip();
      },
      complete: function() {
        // Schedule the next request when the current one is complete
        setTimeout(periodic_update, <?=$ms ?>);
      },
      error: function (error) {
        //$.notify("Error updating page: " + error, "error");
      }
    });
  })();
});

<?php
  if ($cond != "") {
    $r = mysqli_query($ml, "SELECT j_id, j_state FROM jobs WHERE $cond");
    echo mysqli_error($ml);
    $n = mysqli_num_rows($r);
    for ($i=0; $i<$n; ++$i) {
      $w = mysqli_fetch_assoc($r);
      echo "jstate['$w[j_id]']=$w[j_state];";
    }
  }
  echo "</script>";
}
?>
