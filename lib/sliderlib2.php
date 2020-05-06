<?php
function init_slider() {
  GLOBAL $f_id, $mtime, $tr;
  ?>
  <script>
    function send_value(param, val) {
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: {action: 'setval', f_id: '<?=$f_id ?>', tr: <?=$tr ?>, param: param,
          data: val, nc: '<?=$mtime ?>'},
        dataType: 'html',
        success: function(data) {
          //$.notify("Saved track " + ii, "success");
          location.reload();
          //alert(data);
        },
        error: function (error) {
          $.notify("Error saving track " + ii, "error");
        }
      });
    }
  </script>
  <?php
}

function show_slider($disabled, $name, $val, $units, $min, $max, $step, $color1, $color2, $color3, $params, $converter='') {
  GLOBAL $bheight;
  $id = $name;
  $id = str_replace(" ", "_", $id);
  $id = str_replace(".", "_", $id);
  echo "<input $disabled id=$id data-slider-id='{$id}Slider' type=text data-slider-min=$min 
    data-slider-max=$max data-slider-step=$step data-slider-value='$val'/>&#160;&#160;&#160;&#160;&#160;&#160;&#160;<span id='{$id}Span'></span>";
  echo "<style>
#{$id}Slider.slider-horizontal{
  width:300px; 
}
#{$id}Slider .slider-selection {
	background: $color2;
}
#{$id}Slider .slider-handle {
	background: $color1;
}
#{$id}Slider .slider-track-high {
	background: $color3;
}
#{$id}Slider .slider-tick-label {
  color: #BBBBBB;
}
#{$id}Slider .slider-tick {
	background: $color3;
}
</style>
";
  echo "  
<script>
  window.addEventListener('DOMContentLoaded', function() {
  $('#$id').slider({
    $params
    formatter: function(value) {
  ";
  if ($units != "NONE") {
    if ($converter != '') {
      echo "\$('#{$id}Span').text('' + $converter + '$units');";
    }
    else {
      echo "\$('#{$id}Span').text('' + value + '$units');";
    }
  }
  echo "
      return ' ' + value;
    }
  });  ";
  if ($disabled) echo "$('#$id').slider('disable');\n";
  echo "
  var {$id}0;

  $('#$id').slider().on('slideStart', function(ev){
    {$id}0 = $('#$id').data('slider').getValue();
  });
  $('#$id').slider().on('slideStop', function(ev){
    var newVal = $('#$id').data('slider').getValue();
    if({$id}0 !== newVal) {
      //$.notify(\"New value \" + newVal, \"success\");
      send_value('$name', newVal);
    }
  });
});
</script>";
}

function show_slider2($disabled, $name, $val, $val2, $units, $min, $max, $step, $color1, $color2, $params) {
  echo "<input $disabled id=$name data-slider-id='{$name}Slider' type=text data-slider-min=$min 
    data-slider-max=$max data-slider-step=$step data-slider-value='[$val,$val2]'/>&#160;&#160;&#160;&#160;&#160;&#160;&#160;<span  id='{$name}Span'></span>";
  echo "<style>
#{$name}Slider.slider-horizontal{
  width:300px; 
}
#{$name}Slider .slider-selection {
	background: $color2;
}
#{$name}Slider .slider-handle {
	background: $color1;
}
#{$name}Slider .slider-tick {
	background: #EEEEEE;
}
#{$name}Slider .slider-tick-label {
  color: #BBBBBB;
}
</style>
";
  echo "  
<script>
  window.addEventListener('DOMContentLoaded', function() {
  $('#$name').slider({
    $params
  });  ";
  if ($disabled) echo "$('#$name').slider('disable');\n";
  echo "
  var {$name}0;

  ";
  if ($units != "NONE") echo "
  var val = $('#$name').data('slider').getValue();
  $('#{$name}Span').text(val[0] + ' - ' + val[1] + '$units');
  $('#$name').slider().on('slide', function(ev){
    var val = $('#$name').data('slider').getValue();
    $('#{$name}Span').text(val[0] + ' - ' + val[1] + '$units');
  });
  ";
  echo "
  $('#$name').slider().on('slideStart', function(ev){
    {$name}0 = $('#$name').data('slider').getValue();
  });
  $('#$name').slider().on('slideStop', function(ev){
    var newVal = $('#$name').data('slider').getValue();
    if({$name}0 !== newVal) {
      //$.notify(\"New value \" + newVal, \"success\");
      send_value('$name', newVal[0] + '-' + newVal[1]);
    }
  });
});
</script>";
}

function show_slider_form($text, $name, $name2, $units, $min, $max, $step, $color1, $color2, $color3, $params, $schecks="", $comment="") {
  GLOBAL $igroup, $iname, $wie, $caa, $tr, $disabled, $bheight, $pgroup, $cur_pgroup;
  $schecks = str_replace("#name#", $name, $schecks);
  $def = $wie[$igroup][$iname][$name];
  if ($name2 == "") $name2 = $name;
  if ($comment != "") $comment .= "\n";
  if ($wie[$igroup][$iname][$name2] > -100) {
    if ($pgroup != "" && $pgroup != $cur_pgroup) {
      echo "<div style='width: 100%; height: 18px; border-bottom: 1px solid black; text-align: center'>";
      echo "<span style='font-size: 20px; background-color: white; padding: 0 20px;'>$pgroup</span></div><br>";
      $cur_pgroup = $pgroup;
    }
    echo "<form action=store.php method=post>";
    echo "<div class='form-group row'>";
    if ($comment != "") $comment .= "<br>";
    echo "<label title='{$comment}Default: $def";
    if ($units != "NONE") echo "$units";
    echo "' data-toggle=tooltip data-html=true data-placement=top class='col-sm-2 col-form-label'>$text</label>";
    echo "<div style='display: flex; align-items: center' class=col-sm-7>";
    show_slider($disabled, $name,
      icf($caa[jcRENDER], $tr, $name, $def),
      $units, $min, $max, $step, $color1, $color2, $color3, $params);
    echo "</div>";
    $sa = explode(",", $schecks);
    foreach ($sa as $key => $val) {
      $sa2 = explode(":", $val);
      show_soundcheck($igroup, "$sa2[1]", $sa2[0]);
    }
    /*
    echo "<div class='col-sm-2'>";
    echo "<div class=dropdown>";
    echo "<button class='btn btn-secondary dropdown-toggle' type=button data-toggle=dropdown aria-haspopup=true aria-expanded=false>";
    echo "Example";
    echo "</button>";
    echo "<div class='dropdown-menu' aria-labelledby='dropdownMenuButton'>";
    echo "<a class='dropdown-item' target=_blank href=''>0%</a>";
    echo "<a class='dropdown-item' target=_blank href=''>100%</a>";
    echo "</div>";
    echo "</div> ";
    //echo "<a class='imgmo' title='0%' data-toggle=tooltip data-placement=top href='' target=_blank><img src='img/play.png' height=$bheight></a> ";
    echo "</div>";
    */
    echo "</div>";
    echo "</form>";
  }
}

function show_slider_form2($text, $name, $name2, $units, $min, $max, $step, $color1, $color2, $params, $schecks="", $comment="") {
  GLOBAL $igroup, $iname, $wie, $tr, $caa, $disabled, $pgroup, $cur_pgroup;
  $schecks = str_replace("#name#", $name, $schecks);
  $def = $wie[$igroup][$iname][$name];
  if ($name2 == "") $name2 = $name;
  if ($comment != "") $comment .= "\n";
  if ($wie[$igroup][$iname][$name2] != "") {
    if ($pgroup != "" && $pgroup != $cur_pgroup) {
      echo "<div style='width: 100%; height: 18px; border-bottom: 1px solid black; text-align: center'>";
      echo "<span style='font-size: 20px; background-color: white; padding: 0 20px;'>$pgroup</span></div><br>";
      $cur_pgroup = $pgroup;
    }
    echo "<form action=store.php method=post>";
    echo "<div class='form-group row'>";
    if ($comment != "") $comment .= "<br>";
    echo "<label title='{$comment}Default: $def' data-html=true data-toggle=tooltip data-placement=top class='col-sm-2 col-form-label'>$text</label>";
    echo "<div style='display: flex; align-items: center' class=col-sm-7>";
    $drng = icf($caa[jcRENDER], $tr, $name, $def);
    $drng1 = substr($drng, 0, strpos($drng, "-"));
    $drng2 = substr($drng, strpos($drng, "-") + 1);
    show_slider2($disabled, $name, $drng1, $drng2,
      $units, $min, $max, $step, $color1, $color2, $params);
    echo "</div>";
    show_soundcheck2($igroup, $schecks);
    echo "</div>";
    echo "</form>";
  }
}

function show_soundcheck2($igroup, $schecks) {
  $sa = explode(",", $schecks);
  foreach ($sa as $key => $val) {
    $sa2 = explode(":", $val);
    show_soundcheck($igroup, "$sa2[1]", $sa2[0]);
  }
}

