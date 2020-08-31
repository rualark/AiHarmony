<?php
require_once "lib/mlib.php";
require_once "lib/config.php";
require_once "lib/auth.php";
require_once "lib/elib.php";

$id = secure_variable("id");

$title = "$site_name: Exercise";
$login_result = login();

require_once "template/menu.php";
echo "<div class=container><br>";

function compareHash($w, $wa, $key) {
  for ($i=0; $i<count($wa) - 1; ++$i) {
    if ($w[$key] == $wa[$i][$key]) return $i;
  }
  return -1;
}

$r = query("
  SELECT * FROM exercises
  LEFT JOIN users USING (u_id)
  WHERE root_eid='$id'
  ORDER BY eid
");
$n = mysqli_num_rows($r);
$wa = array();
for ($i=0; $i<$n; ++$i) {
  $w = mysqli_fetch_assoc($r);
  $uname = $w['u_name'] ? $w['u_name'] : $w['u_cookie'];
  $wa[$i] = $w;
  if (!$i) {
    echo "<h3><center>Exercise #$id. $w[title]</center></h3>";
  }
  echo "<hr>";
  show_elock($w['security']);
  echo "<b>Revision $w[eid]</b> ";
  echo "uploaded $w[publish_time] by $uname<br>";
  if ($w['security'] > 0 && !$login_result) {
    echo "<span style='color:red'>Accessing this revision requires authentication</span><br>";
    continue;
  }
  if ($w['security'] > 1 && !$ua['u_admin']) {
    echo "<span style='color:red'>This revision can be accessed by administrators only</span><br>";
    continue;
  }
  if ($w['title'] != $wa[0]['title']) {
    echo "<b>Exercise name changed:</b> $w[title]<br>";
  }
  if ($w['algo'] == 'CA3') {
    echo "<b>Counterpoint analysis:</b> ";
    if ($w['flags'] == 0) {
      echo "✅";
    } else {
      if (floor($w['flags'] / 10000)) {
        echo floor($w['flags'] / 10000) . "🚩 &nbsp;";
      }
      if ($w['flags'] % 10000) {
        echo ($w['flags'] % 10000) . "⚠️";
      }
    }
    echo "<br>";
  }
  if ($w['annotations'] != '') {
    $found = compareHash($w, $wa, "annotations");
    if ($found == -1) {
      if ($i) {
        echo "<b>Annotations changed</b><br>";
      }
    } else {
      echo "<b>Annotations are same</b> as in revision " . $wa[$found]['eid'] . "<br>";
    }
  }
  if ($i) {
    $found = compareHash($w, $wa, "music_hash");
    if ($found == -1) {
      echo "<b>Music changed</b><br>";
    } else {
      echo "<b>Music is same</b> as in revision " . $wa[$found]['eid'] . "<br>";
    }
  }
  echo "<a class='btn btn-outline-primary' target=_blank href='editor.html?state=$w[state]&rid=$w[root_eid]&eid=$w[eid]' role=button>Open revision</a> ";
}

require_once "template/footer.php";
