<?php
require_once "CsvDb.php";

$rw = array();
$trw = array();
$rule_overwrites = array();

// Set;Rid;Species;Severity;Class;Group;Rule;Subrule;Accept;Comment;Subcomment;Viztype;VI;V2;VT;FQ;CF;GF;IF;DEU;MEI;ER;UE;R
function load_rules($cur_species) {
  GLOBAL $rw, $trw, $max_rid;
  $rdb = new CsvDb;
  $fname = "algo/configs/rules/rules.csv";
  echo $rdb->Open($fname);
//print_r($rdb->header);
  echo $rdb->Select();
  //$max_len = 0;
  $max_rid = 0;
  for ($i=0; $i<mycount($rdb->result); ++$i) {
    $species = $rdb->result[$i]['Species'];
    $rid = $rdb->result[$i]['Rid'];
    if ($rid > $max_rid) $max_rid = $rid;
    // Skip strict rule
    if (!$rid) continue;
    // Skip other species
    if ($species != "" &&
      strpos($species, "$cur_species") === false) continue;
    // Process severity
    if ($rdb->result[$i]['Accept'] == 1 || $rdb->result[$i]['Accept'] == -1) {
      $rdb->result[$i]['Severity'] = 0;
    }
    else if ($rdb->result[$i]['Severity'] == 0) {
      $rdb->result[$i]['Severity'] = 1;
    }
    // Minify
    $ra = array();
    $ra['se'] = $rdb->result[$i]['Severity'];
    $ra['cl'] = $rdb->result[$i]['Class'];
    $ra['gr'] = $rdb->result[$i]['Group'];
    $ra['ru'] = $rdb->result[$i]['Rule'];
    $ra['sr'] = $rdb->result[$i]['Subrule'];
    $ra['ac'] = $rdb->result[$i]['Accept'];
    $ra['co'] = $rdb->result[$i]['Comment'];
    $ra['sc'] = $rdb->result[$i]['Subcomment'];
    $rw[$rid] = $ra;
    $trw[$rdb->result[$i]['Class']][$rdb->result[$i]['Group']][$rdb->result[$i]['Rule']][$rid] = $rdb->result[$i];
    /*
    if (strlen($ra['ru']) > $max_len) {
      $max_len = strlen($ra['ru']);
      echo $ra['ru'] . "<br>";
    }
    */
  }
}

function apply_rule_changes($ca) {
  GLOBAL $rw, $rule_overwrites;
  foreach ($ca as $key => $val) {
    if (substr($key, 0, 15) != "rule_overwrite_") continue;
    $rid = substr($key, 15);
    $sa = explode(";", $val);
    $accept = $sa[0];
    $sev = $sa[1];
    // Process severity
    if ($accept== 1 || $accept == -1) {
      $sev = 0;
    }
    else if ($sev == 0) {
      $sev = 1;
    }
    if ($rw[$rid]['se'] == $sev) continue;
    // Save change
    $rule_overwrites[$rid]['old'] = $rw[$rid]['se'];
    $rule_overwrites[$rid]['new'] = $sev;
    // Overwrite
    $rw[$rid]['se'] = $sev;
  }
}

function init_rules_tree() {
  echo "<link rel=stylesheet href='plugin/jstree-3.3.8/themes/default/style.min.css'>";
  echo "<script defer src='plugin/jstree-3.3.8/jstree.min.js'></script>";
}

function show_rules_overwrites() {
  GLOBAL $rule_overwrites, $rw;
  if (!mycount($rule_overwrites)) return;
  start_collapse_container(101, "Rule changes...");
  foreach ($rule_overwrites as $rid => $ro) {
    echo "Severity changed from <b>$ro[old]</b> to <b>$ro[new]</b> for rule ";
    echo "<a href=# onclick=\"jstree.jstree('deselect_all'); jstree.jstree('select_node', 's$rid'); return false;\">";
    echo $rw[$rid]['ru'] . ' / ' . $rw[$rid]['sr'] . "</a><br>";
  }
  end_collapse_container(101, "Rule changes", "none");
  echo "<div style='line-height:50%'><br></div>";
}

function show_rules_tree($editable) {
  GLOBAL $rw, $trw, $f_id, $mtime, $max_rid;
  echo "<form onsubmit='return false;'>";
  echo "<div class='input-group'>";
  echo "<input type=text id=input_search_rule class='form-control' placeholder='Search for rule' aria-label='Search for rule'>";
  echo "<div class='input-group-append'>";
  echo "<button onclick='searchRule();' style='margin-top:0px!important;margin-bottom:0px!important;' class='btn btn-outline-secondary' type='submit'>Search</button>";
  echo "</div>";
  echo "</div>";
  echo "</form>";
  echo "<div class=row>";
  echo "<div class=col-xl-9>";
  echo "<div style='display: none' id=jstree>";
  echo "<ul>";
  foreach ($trw as $class => $dc) {
    echo "<li>$class";
    echo "<ul>";
    foreach ($dc as $group => $dg) {
      echo "<li>$group";
      echo "<ul>";
      foreach ($dg as $rname => $dr) {
        echo "<li";
        if (is_array($dr)) echo " id='r" . array_values($dr)[0]['Rid'] . "'";
        echo ">";
        echo "<ul>";
        foreach ($dr as $rid => $ds) {
          echo "<li id='s$rid'>";
          echo "<ul>";
          echo "</ul>";
        }
        echo "</ul>";
      }
      echo "</ul>";
    }
    echo "</ul>";
  }
  echo "</ul>";
  echo "</div>";
  echo "</div>";
  // Build search order
  foreach ($rw as $rid => $d) {
    $rw_order[] = $rid;
  }
?>
<div class=col-xl-3 style='display: flex; justify-content: left; align-items: center;'>
  <span id=rule_span class='p-2 shadow' style='display: none; border: 1px solid #dddddd; border-radius: 10px'>
    <span id=rule_details></span>
    <br>
    <span id=sev_span><b>Severity:</b>
      <select id=severity name=severity class=custom-select>
      <option value='0'>Disabled</option>
      <option value='1'>1</option>
      <option value='10'>10</option>
      <option value='20'>20</option>
      <option value='30'>30</option>
      <option value='40'>40</option>
      <option value='50'>50</option>
      <option value='60'>60</option>
      <option value='70'>70</option>
      <option value='80'>80</option>
      <option value='90'>90</option>
      <option value='100'>100</option>
      </select>
    </span>
  </span>
</div>
</div>
<br>
<script>
  let jstree;
  let current_rid = 0;
  let rw = [];
  let rw_order = [];
  let max_rid = <?=$max_rid?>;
  window.addEventListener('DOMContentLoaded', function() {
    jstree = $('#jstree');
    rw = JSON.parse(
      '<?=str_replace("\u0022","\\\\\"",json_encode($rw, JSON_HEX_QUOT))?>');
    rw_order = JSON.parse(
      '<?=str_replace("\u0022","\\\\\"",json_encode($rw_order, JSON_HEX_QUOT))?>');
    jstree.jstree();

    window.searchRule = function() {
      let st = document.getElementById("input_search_rule").value;
      if (st == "") return;
      console.log(max_rid);
      let current_order = -1;
      // Find position in ordered list
      for (let i=0; i<rw_order.length; ++i) {
        if (rw_order[i] != current_rid) continue;
        current_order = i;
        break;
      }
      for (let i = 0; i < rw_order.length; ++i) {
        let order = (i + current_order + 1) % rw_order.length;
        let rid = rw_order[order];
        if (rw[rid]['ru'].indexOf(st) === -1 && rw[rid]['sr'].indexOf(st) === -1 &&
          rw[rid]['co'].indexOf(st) === -1 && rw[rid]['sc'].indexOf(st) === -1 &&
          rw[rid]['cl'].indexOf(st) === -1 && rw[rid]['gr'].indexOf(st) === -1) continue;
        // Found
        jstree.jstree('deselect_all');
        jstree.jstree('select_node', 's' + rid);
        break;
      }
    };
    //setTimeout(function () {jstree.jstree('select_node', 's70');}, 500);
    function update_severity(rid) {
      let ra = rw[rid];
      if (ra['se'] > 70) {
        jstree.jstree().set_icon('s' + rid, 'img/file_red.png');
      }
      else if (ra['se'] > 30) {
        jstree.jstree().set_icon('s' + rid, 'img/file_yellow.png');
      }
      else if (ra['se'] > 0) {
        jstree.jstree().set_icon('s' + rid, 'img/file_green.png');
      }
      else {
        jstree.jstree().set_icon('s' + rid, 'img/file.png');
      }
    }
    jstree.bind('ready.jstree', function(event, data) {
      $(jstree.jstree().get_json('#', {
        flat: true
      }))
        .each(function(index, value) {
          let node = jstree.jstree().get_node(this.id);
          let lvl = node.parents.length;
          let rid = this.id.substr(1);
          //console.log('node id = ' + this.id + ' level = ' + lvl);
          if (lvl == 1) jstree.jstree().set_icon(this.id, 'img/folder2.png');
          if (lvl == 2) jstree.jstree().set_icon(this.id, 'img/folder2.png');
          if (lvl == 3) {
            let ra = rw[rid];
            jstree.jstree('set_text', this.id, ra['ru']);
            jstree.jstree().set_icon(this.id, 'img/rules.png');
          }
          if (lvl == 4) {
            let ra = rw[rid];
            jstree.jstree('set_text', this.id, ra['sr']);
            //$("#"+this.id).css("color", "red");
            update_severity(rid);
          }
        });
      jstree.show();
    });
    jstree.on('show_node.jstree', function (e, data) {
      console.log(data.node.id);
    });
    jstree.on('changed.jstree', function (e, data) {
      if (data.selected.length == 0) return;
      let el = data.instance.get_node(data.selected[0]);
      let div = document.getElementById("rule_details");
      let sev_el = document.getElementById("severity");
      let rid = el.id.substr(1);
      current_rid = rid;
      let ra = rw[rid];
      div.innerHTML = "";
      //sev_el.style.display = 'none';
      $('#rule_span').hide();
      $('#sev_span').hide();
      // Skip class and group
      if (el.id.substr(0, 1) === 'j') return;
      $('#rule_span').show();
      div.innerHTML += "<b>Group:</b> " + ra['cl'] + ' / ' + ra['gr'];
      div.innerHTML += "<br><b>Rule:</b> " + ra['ru'];
      if (ra['co']) div.innerHTML += "<br>" + ra['co'];
      // Skip if not subrule
      if (el.id.substr(0, 1) === 'r') return;
      div.innerHTML += "<br><b>Subrule:</b> " + ra['sr'];
      if (ra['sc']) div.innerHTML += "<br>" + ra['sc'];
      div.innerHTML += "<br>";
      sev_el.value = ra['se'];
      //sev_el.style.display = 'block';
      <?php
        if ($editable) {
          echo "$('#sev_span').show();";
        }
        else {
          echo "div.innerHTML += '<br><b>Severity:</b> ' + ra['se'];";
        }
      ?>
    });
    $('#severity').change(function(){
      let sev = $('#severity').val();
      rw[current_rid]['se'] = sev;
      update_severity(current_rid);
      let accept;
      if (sev > 0) {
        accept = 0;
        if (sev === 1) sev = 0;
      }
      else {
        accept = -1;
      }
      $.ajax({
        type: 'POST',
        url: 'store.php',
        data: {
          action: 'setgval_all',
          f_id: '<?=$f_id ?>',
          param: 'rule_overwrite_' + current_rid,
          data: accept + ';' + sev + ';;;;',
          nc: '<?=$mtime ?>'
        },
        dataType: 'html',
        success: function(data) {
          $.notify("Saved severity", "success");
          start_blink();
        },
        error: function (error) {
          $.notify("Error saving severity", "error");
        }
      });
    });
  });
</script>

<?php
}
