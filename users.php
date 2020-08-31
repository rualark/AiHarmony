<?php
require_once "lib/mlib.php";
require_once "lib/elib.php";
require_once "lib/config.php";
require_once "lib/auth.php";

if (!login()) {
  die ("<script language=javascript>location.replace('login.php?ru=user.php?suid=$suid');</script>");
}

if (!$ua['u_admin']) {
  die ("<span style='color:red'>You do not have access to this page");
}

$title = "$site_name: Users";

require_once "template/menu.php";
echo "<div class=container><br>";

echo "<h3><center>Users</center></h3>";

$r = query("
  SELECT
    u_id,
    COUNT(*) AS cnt,
    COUNT(IF(security=3,1,NULL)) AS private_cnt,
    MAX(publish_time) as last_publish_time,
    MIN(u_name) AS u_name,
    MIN(u_login) AS u_login,
    MIN(u_lastact) AS u_lastact
  FROM exercises
  LEFT JOIN users USING (u_id)
  WHERE u_id>0
  GROUP BY u_id
  ORDER BY u_name
");
$n = mysqli_num_rows($r);
echo "<p><table class='table table-striped table-bordered' style='max-width:1100px'>"; // table-hover
echo "<thead>";
echo "<tr>";
echo "<th scope=col>User</th>";
echo "<th scope=col>Email</th>";
echo "<th scope=col>Exercises</th>";
echo "<th scope=col>Last publish</th>";
echo "<th scope=col>Last active</th>";
echo "</tr>\n";
echo "</thead>";
echo "<tbody>";
for ($i=0; $i<$n; ++$i) {
  $w = mysqli_fetch_assoc($r);
  echo "<tr>";
  echo "<td><a href=user.php?suid=$w[u_id]>$w[u_name]";
  echo "<td>$w[u_login]";
  $cnt = $w['cnt'] - $w['private_cnt'];
  echo "<td>$cnt";
  if ($w['private_cnt']) {
    echo ", $w[private_cnt] ";
    show_elock(3);
  }
  echo "<td>$w[last_publish_time]";
  echo "<td>$w[u_lastact]";
}
echo "</table>";

require_once "template/footer.php";
