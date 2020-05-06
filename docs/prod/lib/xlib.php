<?php

$ca3_playback_modes = array(
  "Piano" => 'Perform all parts on piano',
  "Bass vocal,Tenor vocal,Alto vocal,Soprano vocal" => 'Perform all parts with vocals',
  "Contrabass/Non-staccato,Cello/Non-staccato,Viola/Non-staccato,Violin/Non-staccato" => 'Perform all parts with strings',
  "Contrabasses section/Non-staccato,Cellos section/Non-staccato,Violas section/Non-staccato,Violins section/Non-staccato" => 'Perform all parts with strings sections',
  "Bassoon,Clarinet,English Horn,Oboe" => 'Perform all parts with woodwinds',
  "Trombone,Horn,Horn,Trumpet" => 'Perform all parts with brass',
  "Organ,Organ,Organ,Organ" => 'Perform all parts with organ'
);

$ca3_species = array(
  0 => 'Cantus firmus',
  1 => 'Counterpoint species 1',
  2 => 'Counterpoint species 2',
  3 => 'Counterpoint species 3',
  4 => 'Counterpoint species 4',
  5 => 'Counterpoint species 5'
);

require_once "xca.php";
$xca = new XCA;

function AnalyseCP() {
  GLOBAL $wf, $caa, $xca, $waj, $uid;
  $xca->AnalyseCP("share/$wf[f_folder]$wf[f_name]", $caa[jcANALYSE]['voices_order_pitch']);
  // Load species
  if ($caa[jcANALYSE]['species'] != '') {
    $vcount = strlen($caa[jcANALYSE]['species']);
    for ($i=0; $i<$vcount; ++$i) {
      $xca->voice[$i]->species = $caa[jcANALYSE]['species'][$i];
    }
  }
  // Save species
  else {
    $sp = "";
    for ($i=0; $i<mycount($xca->voice); ++$i) {
      $sp .= $xca->voice[$i]->species;
    }
    $date = date("Y-m-d H:i:s");
    inject_config($waj[jcANALYSE], "species", $sp, "Automatic species analysis");
    inject_config($waj[jcRENDER], "species", $sp, "Automatic species analysis");
  }
}

function show_spselect($vi) {
  GLOBAL $xca, $ca3_species;
  GLOBAL $disabled;
  $vc = $xca->voice[$vi];
  echo "<tr>";
  echo "<td>" . ($vi + 1);
  $tclass = "";
  //if ($wfi[$id + 1]['fi_found'] == 0) $tclass = "text-danger";
  echo "<td data-html=true data-toggle=tooltip data-placement=top title='";
  echo "{$vc->display} (instrument {$vc->part_id})<br>{$vc->notes_count} notes ";
  if ($vc->notes_count) {
    echo GetNoteName($vc->minnote) . " - " . GetNoteName($vc->maxnote);
  }
  //echo " to instrument range (";
  //echo $wie[$igroup][$iname]['n_min'] . " - " . $wie[$igroup][$iname]['n_max'];
  //echo ")";
  echo "'><p class='$tclass'>";
  echo $vc->unique_name;
  if (!mycount($xca->species_in_xml) && mycount($xca->voice) > 1) {
    echo "<td>";
    echo "<select ";
    echo "$disabled class=\"form-control custom-select spsel$vi\" id='spsel$vi' name='spsel$vi'>\n";
    $iclass = "";
    foreach ($ca3_species as $key => $val) {
      echo "<option value='$key'";
      if ($key == $vc->species) echo " selected";
      echo ">$val</option>";
    }
    echo "</select>\n";
  }
}

function show_spselects() {
  GLOBAL $f_id, $mtime, $xca;
  echo "<table class='table'>"; // table-striped table-hover
  echo "<tr>";
  echo "<th scope=col data-toggle=tooltip data-placement=top title='Source part number'>#</th>";
  echo "<th scope=col>Part</th>";
  if (!mycount($xca->species_in_xml) && mycount($xca->voice) > 1) {
    echo "<th scope=col>Counterpoint species";
    echo "</th>";
  }
  echo "</tr>\n";
  foreach ($xca->voice as $vi => $voice) {
    show_spselect($vi);
  }
  echo "</table>";
  // Send scripts
  echo "\n";
  ?>
  <script>
    function send_species(ii) {
      let sp = '';
      let cf_used = 0;
      // Remove all cf except current
      if (document.getElementById('spsel' + ii).value == 0) {
        for (let i=0; i<100; ++i) {
          let el = document.getElementById('spsel' + i);
          if (!el) break;
          // Prohibit multiple cantus firmus
          if (i !== ii && el.value == 0) {
            $.notify("Multiple cantus firmus replaced with species 1", "success");
            el.value = 1;
          }
        }
      }
      // Build species string
      for (let i=0; i<100; ++i) {
        let el = document.getElementById('spsel' + i);
        if (!el) break;
        sp = sp + el.value;
      }
      //$.notify("Concatenated species: " + sp, "success");
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: {action: "setgval3", f_id: '<?=$f_id ?>', param: "species",
          data: sp, nc: '<?=$mtime ?>'},
        dataType: 'html',
        success: function(data) {
          $.notify("Saved species", "success");
        },
        error: function (error) {
          $.notify("Error saving species", "error");
        }
      });
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: {action: "setgval", f_id: '<?=$f_id ?>', param: "species",
          data: sp, nc: '<?=$mtime ?>'},
        dataType: 'html',
        success: function(data) {
          //$.notify("Saved species", "success");
        },
        error: function (error) {
          $.notify("Error saving species", "error");
        }
      });
    }
  <?php
  echo "window.addEventListener('DOMContentLoaded', function() {\n";
  foreach ($xca->voice as $vi => $voice) {
    echo "  $('select.spsel$vi').change(function(){ send_species($vi) });\n";
  }
  echo "});\n";
  echo "</script>";
}

function show_osmd($url) {
?>
<div id="osmdCanvas"></div>
<script defer src="js/include/opensheetmusicdisplay.min.js"></script>
<script>
  function show_osmd() {
    let openSheetMusicDisplay = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdCanvas");
    openSheetMusicDisplay
      .load("<?=$url?>")
      .then(
        function() {
          openSheetMusicDisplay.render();
        },
        function(e) {
            console.log(e);
        }
      );
  }
<?php
  if (filesize($url) > 50000) {
    echo "</script>";
    echo "<center><button class='btn btn-primary' onclick='show_osmd(); this.style.visibility = \"hidden\";'>Show score</button></center>";
  }
  else {
    echo "show_osmd();";
    echo "</script>";
  }
}

function show_osmd2($url) {
?>
<div id="osmdCanvas"></div>
<script defer src="js/include/opensheetmusicdisplay.min.js"></script>
<script>
let osmd_initialized = 0;
function show_osmd() {
  $('#osmdCanvas').show();
  if (osmd_initialized) return;
  osmd_initialized = 1;
  let openSheetMusicDisplay = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmdCanvas");
  openSheetMusicDisplay
    .load("<?=$url?>")
    .then(
      function() {
        openSheetMusicDisplay.render();
      },
      function(e) {
          console.log(e);
      }
    );
}
function hide_osmd() {
  $('#osmdCanvas').hide();
}
</script>
<?php
}