<?php
require_once "sliderlib2.php";

function show_iset() {
  GLOBAL $wf, $wie, $wi, $uid, $f_id, $caa, $igroups, $inames, $ua,
         $igroup, $iname, $wfi, $tr, $disabled, $default_instr, $reverb_mixes,
         $pgroup;
  $igroup = $igroups[$tr];
  $iname = $inames[$tr];
  $w = $wie[$igroup][$iname];
  $iclass = $w['i_class'];
  $vol = icf($caa[jcRENDER], $tr, "Volume", $wie[$igroup][$iname]["volume"]);
  $pan = icf($caa[jcRENDER], $tr, "Pan", 50);
  $drng = icf($caa[jcRENDER], $tr, "dyn_range", "0-100");
  $reverb_mix = icf($caa[jcRENDER], $tr, "reverb_mix", -1);
  $drng1 = substr($drng, 0, strpos($drng, "-"));
  $drng2 = substr($drng, strpos($drng, "-") + 1);
  $trns = icf($caa[jcRENDER], $tr, "fix_transpose", 1000);

  echo "<link rel='stylesheet' type='text/css' href='plugin/bootstrap-slider-10.6.1/bootstrap-slider.min.css'>";
  echo "<script defer type='text/javascript' src='plugin/bootstrap-slider-10.6.1/bootstrap-slider.min.js'></script>";
  echo "<script type='text/javascript' src='js/vars.js'></script>";
  echo "<script defer type='text/javascript' src='js/lib.js'></script>";
  echo "<div class=container>";
  echo "<br><h2 align=center> ";
  show_lock($wf['f_private']);
  echo "<a href='file.php?f_id=$f_id'>$wf[f_source]</a></h2>";
  echo "<hr>";
  //echo $wfi[$tr + 1]['fi_found'];
  if ($uid == $wf['u_id']) {
    $disabled = "";
  }
  else {
    $disabled = "disabled";
  }
  if ($igroup == "") $igroup = $default_instr;
  if ($iname == "") $iname = $wi[$igroup][0]['i_name'];

  $vol_default = $wie[$igroup][$iname]["volume_default"];
  $db_max = $wie[$igroup][$iname]["db_max"];
  $db_coef = $wie[$igroup][$iname]["db_coef"];

  echo "<form class='form-inline' action=store.php method=post>";
  echo "<input type=hidden name=f_id value='$f_id'>";
  echo "<input type=hidden name=action value=f_instruments>";
  echo "<table align='center'>";
  echo "<tr><td><b>Track " . ($tr + 1);
  echo "<td>";
  show_iselect($tr, $igroup, $iname, 0);
  send_iselect_script();
  echo "<script>";
  echo "window.addEventListener('DOMContentLoaded', function() {\n";
  echo "  $('select.isel$tr').change(function(){ send_instrument($tr) });\n";
  echo "  $('select.csel$tr').change(function(){ send_instrument_config($tr) });\n";
  echo "});\n";
  echo "</script>";
  echo "</table>";
  echo "</form><br>";
  $pgroup = "";
  echo "<div style='width: 100%; height: 18px; border-bottom: 1px solid black; text-align: center'>";
  echo "<span style='font-size: 20px; background-color: white; padding: 0 20px;'>Main parameters</span></div>";

  /*
  echo "<form action=store.php method=post>";
  echo "<div class='form-group row'>";
  echo "<label class='col-sm-2 col-form-label'>Instrument:</label>";
  echo "<div class=col-sm-7>";
  echo "<input class='form-control' name=f_time value='";
  echo "$igroup/$iname, track " . ($tr + 1) . " ";

  echo "' readonly>";
  echo "</div>";
  echo "<div class=col-sm-3>";
  show_soundcheck($igroup, "$iname/__Default", "Example sound");
  echo get_inst_badges($wie[$igroup][$iname]);
  echo "</div></div>";
  echo "</form>";
  */
  echo "<br>";

  init_slider();

  $vol0 = vol2db($wie[$igroup][$iname]["volume"], $vol_default, $db_max, $db_coef);
  echo "<form action=store.php method=post>";
  echo "<div class='form-group row'>";
  echo "<label title='Default: $vol0 dB' data-toggle=tooltip data-placement=top class='col-sm-2 col-form-label'>Volume:</label>";
  echo "<div style='display: flex; align-items: center' class=col-sm-10>";
  show_slider($disabled, "Volume", $vol, ' dB', 0, 150, 1, 'red',
    '#FFAAAA', '#F6F6F6', "", "vol2db(value, $vol_default, $db_max, $db_coef)");
  echo "</div></div>";
  echo "</form>";

  /*
  echo "<form action=store.php method=post>";
  echo "<div class='form-group row'>";
  echo "<label title='Default: position on stage' data-toggle=tooltip data-placement=top class='col-sm-2 col-form-label'>Pan:</label>";
  echo "<div style='display: flex; align-items: center' class=col-sm-7>";
  show_slider($disabled, "Pan", $pan, 'NONE', 0, 100, 1, '#1155FF', '#AACCFF', '#AACCFF',
    "ticks: [0,50,100], ticks_labels: ['Left','Default','Right'],");
  // ticks: [0, 50, 100],
  echo "</div>";
  show_soundcheck2($igroup,
    "Left:$iname/Pan0,Default:$iname/__Default,Right:$iname/Pan100");
  echo "</div>";
  echo "</form>";
  */

  show_slider_form2("Dynamic range:", "dyn_range", '', '%', 0, 100, 1, 'green', '#AAFFAA',
    "ticks: [0,100], ticks_labels: ['ppp','fff'],",
    "ppp:$iname/Dyn0,mf:$iname/__Default,fff:$iname/Dyn100",
    "Any dynamics in score will be mapped inside this range.");

  $ticks = "1,";
  $slow_label = "";
  $harsh_label = "";
  $ticks_labels = "";
  if ($wie[$igroup][$iname]['slow_acc_vel'] > 0) {
    $ticks .= round($wie[$igroup][$iname]['slow_acc_vel']) . ",";
    $ticks_labels .= "'',";
    $slow_label = "soft";
  }
  if ($wie[$igroup][$iname]['harsh_acc_vel'] > 0) {
    $ticks .= round($wie[$igroup][$iname]['harsh_acc_vel']) . ",";
    $ticks_labels .= "'',";
    $harsh_label = "harsh";
  }
  $ticks .= "127";
  $ticks_labels .= "'$harsh_label'";
  show_slider_form2("Accent range:", "acc_range", '', 'NONE', 1, 127, 1, 'green', '#AAFFAA',
    "ticks: [$ticks], ticks_labels: ['$slow_label', $ticks_labels],", "0%:$iname/Acc0,10%:$iname/Acc10,20%:$iname/Acc20,30%:$iname/Acc30,40%:$iname/Acc40,50%:$iname/Acc50,60%:$iname/Acc60,70%:$iname/Acc70,80%:$iname/Acc80,90%:$iname/Acc90,100%:$iname/Acc100",
    "Note accents will be mapped inside this range.");

  if ($ua['u_verbose'] > 7) {
    if ($wie[$igroup][$iname]['reverb_fixed'] < 1) {
      echo "<form action=store.php method=post>";
      echo "<input type=hidden name=f_id value='$f_id'>";
      echo "<input type=hidden name=tr value='$tr'>";
      echo "<input type=hidden name=action value=setval>";
      echo "<input type=hidden name=param value=reverb_mix>";
      echo "<div class='form-group row'>";
      echo "<label title='Please avoid setting reverb for each instrument at all costs. Best way is to set single reverb for whole file in Settings.\nDefault: Use default file reverb' data-toggle=tooltip data-placement=top for=reverb_mix class='col-sm-2 col-form-label'>Reverb:</label>";
      echo "<div class=col-sm-10>";
      echo "<table style='display: inline-block'><tr><td>";
      //echo $wie[$igroup][$iname]['reverb_mix'];
      echo "<select $disabled class=\"custom-select\" id=reverb_mix name=data onChange='this.form.submit();'>";
      echo "<option value=-1";
      if ($reverb_mix == -1) echo " selected";
      echo ">Use default file reverb</option>";
      foreach ($reverb_mixes as $key => $val) {
        echo "<option value=$key";
        if ($key == $reverb_mix) echo " selected";
        echo ">$val</option>";
      }
      echo "</select>";
      echo "</table>";
      echo "</div></div>";
      echo "</form>";
    }

    echo "<form action=store.php method=post>";
    echo "<input type=hidden name=f_id value='$f_id'>";
    echo "<input type=hidden name=tr value='$tr'>";
    echo "<input type=hidden name=action value=setval>";
    echo "<input type=hidden name=param value=fix_transpose>";
    echo "<div class='form-group row'>";
    echo "<label title='This setting allows to transpose source notes up or down.\nDefault: AUTO' data-toggle=tooltip data-placement=top for=fix_transpose class='col-sm-2 col-form-label'>Transpose:</label>";
    echo "<div class=col-sm-10>";
    echo "<table style='display: inline-block'><tr><td>";
    echo "<select $disabled class=\"form-control custom-select\" id=fix_transpose name=data onChange='this.form.submit();'>";
    for ($i = 4; $i >= -4; --$i) {
      $val = $i * 12;
      echo "<option value='$val'";
      if ($trns == $val) echo " selected";
      echo ">";
      if ($i > 0) echo "+";
      echo "$i octaves</options>";
      if ($i == 0) {
        echo "<option value='1000'";
        if ($trns == 1000) echo " selected";
        echo ">AUTO</options>";
      }
    }
    echo "</select> ";
    echo "<td>&#160;&#160;&#160;&#160;";
    echo "<a target=_blank href=pianoroll.php?f_id=$f_id&strack=$tr>";
    if ($w['fi_found'] == 0) $tclass = "text-danger";
    echo "$w[fi_notes] notes ";
    if ($w['fi_notes']) {
      echo "(" . GetNoteName($w['fi_minnote']) . " - " . GetNoteName($w['fi_maxnote']) . ")";
    }
    echo " to instrument range (";
    echo $wie[$igroup][$iname]['n_min'] . " - " . $wie[$igroup][$iname]['n_max'];
    echo ")";
    echo "</a>";
    echo "</table>";
    echo "</div></div>";
    echo "</form>";

    $pgroup = "Articulations";

    if ($wie[$igroup][$iname]['stac_import'] == 1) {
      echo "<form action=store.php method=post>";
      echo "<input type=hidden name=f_id value='$f_id'>";
      echo "<input type=hidden name=tr value='$tr'>";
      echo "<input type=hidden name=action value=setcheck>";
      echo "<div style='' class='form-group row'>";
      echo "<label title='Choose which articulations should be imported from source MusicXML file.\nDefault: enabled' data-toggle=tooltip data-placement=top class='col-sm-2 col-form-label'>Import articulations:</label>";
      echo "<div style='display: flex; align-items: center' class=col-sm-10>";
      show_import_checkbox(0, $tr, "pedal", "Pedal", $disabled);
      show_import_checkbox(1, $tr, "mute", "Mute", $disabled);
      show_import_checkbox(2, $tr, "pizz", "Pizzicato", $disabled);
      show_import_checkbox(3, $tr, "stac", "Staccato", $disabled);
      show_import_checkbox(4, $tr, "trem", "Tremolo", $disabled);
      show_import_checkbox(5, $tr, "spic", "Spiccato", $disabled);
      show_import_checkbox(6, $tr, "tasto", "Sul tasto", $disabled);
      echo "</div></div>";
      echo "</form>";
    }

    show_slider_form("Auto staccato:", "stac_maxlen", '', ' ms (if shorter than)', 0, 800, 5, 'gray', '#AAAAAA', '#F0F0F0', "",
      "", "Set maximum note length which will be converted to staccato articulation.");
    show_slider_form("Staccato attenuation:", "stac_db", '', ' dB', -30, 0, 1, 'gray',
      '#AAAAAA', '#F0F0F0', "", "",
      "Decrease staccato volume by this value.");
    show_slider_form2("Staccato dyn. range:", "stac_dyn_range", '', '%', 1, 100, 1, 'gray', '#AAAAAA',
      "ticks: [1,100], ticks_labels: ['ppp','fff'],",
      "Staccato mf:Staccato/__Default",
      "Staccato dynamics will be mapped inside this range.");
    show_slider_form("Auto gliss:", "gliss_minlen", '', ' ms (if longer than)', 0, 1500, 5, 'gray', '#AAAAAA', '#F0F0F0', "", "",
      "Set minimum second note length in legato transition to convert to glissando.");

    if ($wie[$igroup][$iname]['trem_activate'] == "flutter") {
      show_slider_form("Auto flutter tongue:", "trem_maxlen", '', ' ms (if shorter than)', 0, 500, 5, 'gray', '#AAAAAA', '#F0F0F0', "", "",
        "Maximum length of note that can be converted to flutter tongue if repeated.");
      show_slider_form("Flutter tongue attenuation:", "trem_db", '', ' dB', -30, 0, 1, 'gray',
        '#AAAAAA', '#F0F0F0', "", "",
        "Decrease flutter tongue volume by this value.");
      show_slider_form2("Flutter tongue dyn. range:", "trem_dyn_range", '', '%', 0, 100, 1, 'gray', '#AAAAAA',
        "ticks: [0,100], ticks_labels: ['ppp','fff'],", "",
        "Flutter tongue dynamics will be mapped inside this range.");
    }
    else {
      show_slider_form("Auto tremolo:", "trem_maxlen", '', ' ms (if shorter than)', 0, 500, 5, 'gray', '#AAAAAA', '#F0F0F0', "", "",
        "Maximum length of note that can be converted to tremolo if repeated.");
      show_slider_form("Tremolo attenuation:", "trem_db", '', ' dB', -30, 0, 1, 'gray',
        '#AAAAAA', '#F0F0F0', "", "",
        "Decrease tremolo volume by this value.");
      show_slider_form2("Tremolo dyn. range:", "trem_dyn_range", '', '%', 0, 100, 1, 'gray', '#AAAAAA',
        "ticks: [0,100], ticks_labels: ['ppp','fff'],","",
        "Tremolo dynamics will be mapped inside this range.");
    }

    show_slider_form("Pizz attenuation:", "pizz_db", '', ' dB', -30, 0, 1, 'gray',
      '#AAAAAA', '#F0F0F0', "", "",
      "Decrease pizzicato volume by this value.");
    show_slider_form2("Pizz dyn. range:", "pizz_dyn_range", '', '%', 1, 100, 1, 'gray', '#AAAAAA',
      "ticks: [1,100], ticks_labels: ['ppp','fff'],",
      "Pizzicato mf:Pizzicato/__Default",
      "Pizzicato dynamics will be mapped inside this range.");
  }

  if ($ua['u_verbose'] > 7) {
    show_slider_form("Auto gliss probability:", "gliss_freq", 'gliss_leg_vel', '%', 0, 100, 1, 'gray', '#AAAAAA', '#F0F0F0', "", "No gliss:$iname/Gliss0,Gliss mf:$iname/Gliss100",
      "Probability of legato transition being replaced with glissando.");
    $pgroup = "Sound parameters";
    show_slider_form("Transition attenuation:", "transition attenuation", '', 'NONE', 0, 127, 1, 'violet', '#EEAAEE', '#F0F0F0', "ticks: [0,127], ticks_labels: ['0dB','-20dB'],", "0db:$iname/Trans_att0,-20db:$iname/Trans_att100",
      "Controls what happens in the short space between legato notes. If the transition sounds are getting in your way for some reason, use this control to duck the volume down temporarily while notes are transitioning.");
    show_slider_form("Bow noise reduction:", "bow noise reduction", '', 'NONE', 0, 127, 1, 'violet', '#EEAAEE', '#F0F0F0', "ticks: [0,127], ticks_labels: ['0dB','-20dB'],", "0db:$iname/Bow_noise0,-20db:$iname/Bow_noise100",
      "This control is a specific EQ profile that isolates the bow noise frequencies for each individual note. This effect is especially useful when using large reverb space.");

    show_slider_form("Harmonic structure:", "harmonic structure", '', 'NONE', 0, 127, 1, 'violet', '#EEAAEE', '#F0F0F0',
      "ticks: [0,127], ticks_labels: ['0%','100%'],",
      "0%:$iname/Harm_struct0,100%:$iname/Harm_struct100");
    show_slider_form("Breath noise:", "breath noise", '', 'NONE', 0, 127, 1, 'violet', '#EEAAEE', '#F0F0F0',
      "ticks: [0,127], ticks_labels: ['0%','100%'],",
      "0%:$iname/Breath_noise0,100%:$iname/Breath_noise100",
      "Controls breath noise intensity.");
    show_slider_form("Key noise:", "key noise", '', 'NONE', 0, 127, 1, 'violet', '#EEAAEE', '#F0F0F0',
      "ticks: [0,127], ticks_labels: ['0%','100%'],",
      "0%:$iname/Key_noise0,100%:$iname/Key_noise100",
      "Controls key noise intensity.");
    show_slider_form("Harmonic group 1:", "harm. group1 gain", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/HarmGroup1_0,Default:$iname/HarmGroup64,High:$iname/HarmGroup1_127");

    show_slider_form("Harmonic group 2:", "harm. group2 gain", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/HarmGroup2_0,Default:$iname/HarmGroup64,High:$iname/HarmGroup2_127");

    show_slider_form("Harmonic group 3:", "harm. group3 gain", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/HarmGroup3_0,Default:$iname/HarmGroup64,High:$iname/HarmGroup3_127");

    show_slider_form("EQ Bass:", "eq bass", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/#name#0,Default:$iname/#name#64,High:$iname/#name#127");

    show_slider_form("EQ Body:", "eq body", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/#name#0,Default:$iname/#name#64,High:$iname/#name#127");

    show_slider_form("EQ Air:", "eq air", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,64,127], ticks_labels: ['Low','Default','High'],",
      "Low:$iname/#name#0,Default:$iname/#name#64,High:$iname/#name#127");

    show_slider_form("Tonal depth:", "tonal depth amount", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "ticks: [0,127], ticks_labels: ['Low','High'],",
      "Low:$iname/tonal depth0,Middle:$iname/tonal depth64,High:$iname/tonal depth127");

    $pgroup = "Randomization parameters";
    show_slider_form("Intonation humanization:", "solo intonation", '', 'NONE', 0, 127, 1, '#DDDD00', '#FFFF44', '#F0F0F0', "ticks: [0,127], ticks_labels: ['0%','100%'],", "0%:$iname/Int0,10%:$iname/Int10,20%:$iname/Int20,40%:$iname/Int40,60%:$iname/Int60,80%:$iname/Int80,100%:$iname/Int100,",
      "Controls the tightness/randomness of pitch. Lower values sound quite natural and help to create a natural performance. Higher values will create more unpredictability in tuning, which could be beneficial in certain experimental/atonal styles.");

    show_slider_form("Random accent:", "rnd_vel", '', '% of note accent', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
      "Controls how much of initial note accent can be randomized.");

    show_slider_form("Random dynamics:", "rnd_dyn", '', '% of dynamics', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
      "Controls how much of initial note dynamics can be randomized.");

    show_slider_form("Random dynamics period:", "rnd_dyn_slow", '', ' (1 is ~300ms, 3 is ~1s)', 1, 10, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "1:$iname/#name#1,2:$iname/#name#2,3:$iname/#name#3,5:$iname/#name#5,7:$iname/#name#7",
      "Controls how fast random dynamics function changes. Higher values create slower changing random dynamics.");

    show_slider_form("Random vibrato intensity:", "rnd_vib", '', '% of vibrato intensity', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
      "Controls how much of note vibrato is randomized.");

    show_slider_form("Random vibrato intensity period:", "rnd_vib_slow", '', ' (1 is ~300ms, 3 is ~1s)', 1, 10, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "1:$iname/#name#1,2:$iname/#name#2,3:$iname/#name#3,5:$iname/#name#5,7:$iname/#name#7",
      "Controls how fast random vibrato intensity function changes. Higher values create slower changing random vibrato intensity.");

    show_slider_form("Random vibrato speed:", "rnd_vibf", '', '% of vibrato speed', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
      "Controls how much of note vibrato speed is randomized");
    show_slider_form("Random vibrato speed slowness:", "rnd_vibf_slow", '', ' (1 is ~3Hz, 3 is ~1Hz)', 1, 10, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "1:$iname/#name#1,2:$iname/#name#2,3:$iname/#name#3,5:$iname/#name#5,7:$iname/#name#7",
      "Controls how fast random vibrato speed function changes. Higher values create slower changing random vibrato speed.");

    show_slider_form("Random start:", "rand_start", '', '% of note length', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
      "Controls maximum random note start shift compared to note length.");

    show_slider_form("Random start limit:", "rand_start_max", '', ' ms', 0, 300, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
      "",
      "", "Absolute maximum random note start shift in ms.");
    // 0 ms:$iname/#name#0,10 ms:$iname/#name#10,20 ms:$iname/#name#20,30 ms:$iname/#name#30,50 ms:$iname/#name#50,70 ms:$iname/#name#70

    if ($wie[$igroup][$iname]['rand_end'] > 0) {
      show_slider_form("Random end:", "rand_end", '', '% of note length', 0, 70, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
        "",
        "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
        "Controls maximum random note end shift compared to note length.");
      show_slider_form("Random end limit:", "rand_end_max", '', ' ms', 0, 300, 1, '#DDDD00', '#FFFF44', '#F0F0F0',
        "",
        "0%:$iname/#name#0,10%:$iname/#name#10,20%:$iname/#name#20,30%:$iname/#name#30,50%:$iname/#name#50,70%:$iname/#name#70",
        "Absolute maximum random note end shift in ms.");
    }

  }
  if ($ua['u_verbose'] > 4) {
    if ($wie[$igroup][$iname]['cresc_mindur'] > -1) {
      $pgroup = "Automatic crescendo for long notes after pauses without accent";
      show_slider_form("Minimum note length:", "cresc_mindur", '', ' ms',
        0, 2000, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Minimum note length that can start with automatic crescendo.");
      show_slider_form("Starting cresc. dynamics:", "cresc_mul", '', '% of note dynamics',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "",
        "0%:$iname/#name#0,30%:$iname/#name#30,60%:$iname/#name#60,100%:$iname/#name#100",
        "Starting dynamics of crescendo compared to target dynamics of the note.");
      show_slider_form("Cresc. length:", "cresc_len", '', '% of note length',
        1, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "",
        "20%:$iname/#name#20,40%:$iname/#name#40,60%:$iname/#name#60,100%:$iname/#name#100",
        "Length of automatic crescendo compared to the note length.");
    }

    if ($wie[$igroup][$iname]['dim_mindur'] > -1) {
      $pgroup = "Automatic diminuendo for long notes before pauses";
      show_slider_form("Minimum note length:", "dim_mindur", '', ' ms',
        0, 2000, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Minimum note length that can finish with automatic diminuendo.");
      show_slider_form("Ending dim. dynamics:", "dim_mul", '', '% of note dynamics',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "",
        "0%:$iname/#name#0,30%:$iname/#name#30,60%:$iname/#name#60,100%:$iname/#name#100",
        "Ending dynamics of diminuendo compared to initial dynamics of the note.");
      show_slider_form("Dim. length:", "dim_len", '', '% of note length',
        1, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "",
        "20%:$iname/#name#20,40%:$iname/#name#40,60%:$iname/#name#60,100%:$iname/#name#100",
        "Length of automatic diminuendo compared to the note length.");
    }
  }

  if ($ua['u_verbose'] > 7) {
    if ($wie[$igroup][$iname]['rbell_freq'] > -1) {
      $pgroup = "Automatic diminuendo inside a long note";
      show_slider_form("Probability:", "rbell_freq", '', '%', 0, 100, 1,
        '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Probability of automatic diminuendo inside a long note.");
      show_slider_form2("Note length:", "rbell_dur", '', ' ms', 0, 3000, 1,
        '#1155FF', '#AACCFF',"", "",
        "Minimum note length that can have an automatic diminuendo inside. Maximum note length is used to select diminuendo dynamics (see docs).");
      show_slider_form2("Dim. dynamics:", "rbell_mul", '', '% of note dynamics for longer-shorter notes', 0, 100, 1,
        '#1155FF', '#AACCFF',"",
        "", "Percent of target dynamics of the note. Maximum diminuendo dynamics will be used for shorter notes and minimum - for longer notes (change minimum and maximum note length values to tweak diminuendo dynamics selection). This ensures that longer notes can have greater change in dynamics."); // 0%:$iname/#name#0,50%:$iname/#name#50
      show_slider_form2("Position inside note:", "rbell_pos", '', 'NONE', 0, 100, 1,
        '#1155FF', '#AACCFF',"ticks: [0,100], ticks_labels: ['start','end'],", "",
        "Position range of lowest dynamics of diminuendo-crescendo shape - position is selected randomly inside this range.");
    }

    if ($wie[$igroup][$iname]['vib_bell'] != "") {
      $pgroup = "Vibrato for short notes";
      show_slider_form2("Short note length:", "vib_bell_dur", '', ' ms (short range)', 0, 2000, 1, '#1155FF', '#AACCFF',
        "", "",
        "Notes having length within this range will be considered short. Vibrato parameters for short notes will be applied to them.");
      show_slider_form2("Peak intensity:", "vib_sbell", '', 'NONE', 0, 127, 1, '#1155FF', '#AACCFF',
        "ticks: [0,127], ticks_labels: ['Low','High'],",
        "Low:$iname/#name#0,Medium:$iname/#name#64,High:$iname/#name#127",
        "Peak vibrato intensity is selected based on dynamics inside this range (highest dynamics results in maximum value inside this range).");
      show_slider_form2("Peak speed:", "vibf_sbell", '', 'NONE', 0, 127, 1, '#1155FF', '#AACCFF',
        "ticks: [0,127], ticks_labels: ['Low','High'],",
        "Low:$iname/#name#0,Medium:$iname/#name#64,High:$iname/#name#127",
        "Peak vibrato speed is selected based on dynamics inside this range (highest dynamics results in maximum value inside this range).");
      show_slider_form2("Intensity peak position:", "vib_sbell_top", '', 'NONE', 0, 100, 1, '#1155FF', '#AACCFF',
        "ticks: [0,100], ticks_labels: ['start','end'],",
        "Start:$iname/#name#0,Middle:$iname/#name#50,End:$iname/#name#100",
        "Position of vibrato intensity peak inside note is selected randomly within this range.");
      show_slider_form2("Speed peak position:", "vibf_sbell_top", '', 'NONE', 0, 100, 1, '#1155FF', '#AACCFF',
        "ticks: [0,100], ticks_labels: ['start','end'],",
        "Start:$iname/#name#0,Middle:$iname/#name#50,End:$iname/#name#100",
        "Position of vibrato speed peak inside note is selected randomly within this range.");

      show_slider_form("Intensity start shape:", "vib_sbell_exp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of left part of vibrato intensity curve for note.");
      show_slider_form("Intensity end shape:", "vib_sbell_rexp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of right part of vibrato intensity curve for note.");
      show_slider_form("Speed start shape:", "vibf_sbell_exp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of left part of vibrato speed curve for note.");
      show_slider_form("Speed end shape:", "vibf_sbell_rexp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of right part of vibrato speed curve for note.");

      $pgroup = "Vibrato for longer notes";

      $vib_bell_dur = icf($caa[jcRENDER], $tr, "vib_bell_dur", $wie[$igroup][$iname]["vib_bell_dur"]);
      $vib_bell_dur1 = substr($vib_bell_dur, 0, strpos($vib_bell_dur, "-"));
      $vib_bell_dur2 = substr($vib_bell_dur, strpos($vib_bell_dur, "-") + 1);
      echo "<div class='form-group row'>";
      echo "<label title='Minimum note length that is considered to be long enough for this algorithm to control vibrato' data-toggle=tooltip data-placement=top class='col-sm-2 col-form-label'>Note length:</label>";
      echo "<div class=col-sm-10>";
      echo "<table style='display: inline-block'><tr><td>more than $vib_bell_dur2 ms (change using 'Short note length' slider)";
      echo "</table>";
      echo "</div></div>";

      show_slider_form2("Peak intensity:", "vib_bell", '', 'NONE', 0, 127, 1, '#1155FF', '#AACCFF',
        "ticks: [0,127], ticks_labels: ['Low','High'],",
        "Low:$iname/#name#0,Medium:$iname/#name#64,High:$iname/#name#127",
        "Peak vibrato intensity is selected based on dynamics inside this range (highest dynamics results in maximum value inside this range).");
      show_slider_form2("Peak speed:", "vibf_bell", '', 'NONE', 0, 127, 1, '#1155FF', '#AACCFF',
        "ticks: [0,127], ticks_labels: ['Low','High'],",
        "Low:$iname/#name#0,Medium:$iname/#name#64,High:$iname/#name#127",
        "Peak vibrato speed is selected based on dynamics inside this range (highest dynamics results in maximum value inside this range).");
      show_slider_form2("Intensity peak position:", "vib_bell_top", '', 'NONE', 0, 100, 1, '#1155FF', '#AACCFF',
        "ticks: [0,100], ticks_labels: ['start','end'],",
        "Start:$iname/#name#0,Middle:$iname/#name#50,End:$iname/#name#100",
        "Position of vibrato intensity peak inside note is selected randomly within this range.");
      show_slider_form2("Speed peak position:", "vibf_bell_top", '', 'NONE', 0, 100, 1, '#1155FF', '#AACCFF',
        "ticks: [0,100], ticks_labels: ['start','end'],",
        "Start:$iname/#name#0,Middle:$iname/#name#50,End:$iname/#name#100",
        "Position of vibrato speed peak inside note is selected randomly within this range.");

      show_slider_form("Intensity start shape:", "vib_bell_exp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of left part of vibrato intensity curve for note.");
      show_slider_form("Intensity end shape:", "vib_bell_rexp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of right part of vibrato intensity curve for note.");
      show_slider_form("Speed start shape:", "vibf_bell_exp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of left part of vibrato speed curve for note.");
      show_slider_form("Speed end shape:", "vibf_bell_rexp", '', 'NONE', 0.1, 3, 0.1, '#1155FF', '#AACCFF', '#F0F0F0',
        "ticks: [0.1,3], ticks_labels: ['fast','slow'],",
        "fast:$iname/#name#0.1,linear:$iname/#name#1,slow:$iname/#name#3",
        "Sets shape of right part of vibrato speed curve for note.");
    }
  }

  if ($ua['u_verbose'] > 9) {
    if ($wie[$igroup][$iname]['end_vib_freq'] > -1) {
      $pgroup = "Note endings";
      show_slider_form("Short fall probability:", "end_sfl_freq", '', '%',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Probability of note to have a short fall ending if its length is enough.");
      show_slider_form("Vibrato probability:", "end_vib_freq", '', '%',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Probability of note to have a vibrato ending if its length is enough.");
      show_slider_form("Alternative vibrato probability:", "end_vib2_freq", '', '%',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Probability of note to have an alternative vibrato ending if its length is enough.");
      show_slider_form("Pitch bend down probability:", "end_pbd_freq", '', '%',
        0, 100, 1, '#1155FF', '#AACCFF', '#F0F0F0', "", "",
        "Probability of note to have a pitch bend down ending if its length is enough.");
    }
  }

  echo "<br>";
  echo "<div class=row>";
  echo "<div class='col-sm-12 text-right'>";
  echo "<a onclick='return confirm(\"Do you really want to reset all parameters for this track instrument to defaults? Your current settings for this instruments will be deleted.\");' class=\"btn btn-outline-danger btn-lg\" href=\"store.php?action=resetinstrument&f_id=$f_id&tr=$tr\" role=\"button\">";
  echo "Reset all instrument parameters to defaults</a>";
  echo "</div>";
  echo "</div>";
  echo "<br>";
}

function show_import_checkbox($id, $tr, $param, $name, $disabled) {
  GLOBAL $wie, $igroup, $caa, $iname;
  if ($wie[$igroup][$iname]["{$param}_import"] == 1) {
    //print_r($wie[$igroup][$iname]);
    echo "<input type=hidden name='checkbox$id' value='{$param}_import'>";
    echo "<input $disabled onChange='this.form.submit();' type=checkbox name='{$param}_import' ";
    if (icf($caa[jcRENDER], $tr, "{$param}_import", $wie[$igroup][$iname]["{$param}_import"])) {
      echo "checked";
    }
    echo ">&#160;";
    $soundcheck = "share/soundcheck/$igroup/$name/__Default.mp3";
    if (file_exists($soundcheck)) {
      echo "<a title='Example sound' data-toggle=tooltip data-placement=top href='$soundcheck' target=_blank>";
    }
    echo "$name</a>";
    echo "&#160;&#160;&#160; ";
  }
}


?>