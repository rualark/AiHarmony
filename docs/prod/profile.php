<?php
require_once "lib/mlib.php";
require_once "lib/config.php";
require_once "lib/auth.php";
require_once "lib/reports.php";

$act = secure_variable("act");
$name = secure_variable("name");
$login = secure_variable("login");
$verbose = secure_variable("verbose");

$title = "$site_name: Profile";

if (!login()) {
  die ("<script language=javascript>location.replace('login.php?ru=profile.php');</script>");
}

if ($act == "save") {
  $q = "UPDATE users SET u_login='$login', u_name='$name', u_verbose='$verbose',
    u_notify_mail='".(isset($_GET['notify_mail'])?1:0)."'
    WHERE u_id='$uid'";
  //echo $q;
  mysqli_query($ml,$q);
  echo mysqli_error($ml);
  //exit;
  die ("<script language=javascript>location.replace('profile.php');</script>");
}

require_once "template/menu.php";
show_maintenance();

echo "<div class=container>";

echo "<br>";
echo "<h3>My profile</h3>";
echo "<hr>";
?>

<form action=profile.php method=get>
  <input type="hidden" name="act" value="save">
  <div class="form-group">
    <label for="name"><b>Full name</b></label>
    <input type="text" class="form-control" id="name" name=name value="<?=$ua['u_name'];?>" placeholder="Enter your full name" required>
  </div>
  <div class="form-group">
    <label for="login"><b>Email address</b></label>
    <input type="email" class="form-control" id="login" name=login value="<?=$ua['u_login'];?>" aria-describedby="emailHelp" placeholder="Enter email" required>
    <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
  </div>
  <div class="form-check">
    <input type="checkbox" class="form-check-input" name="notify_mail" onChange='this.form.submit();' id="notify_mail" <? if ($ua['u_notify_mail']) echo "checked";?>>
    <label class="form-check-label" for="notify_mail">Send me email when support specialist answers my support request</label>
  </div>
  <br>

  <button type=submitButton value=submitButton name=submitButton class="btn btn-primary">Save changes</button>
</form>
<br>

<?php
echo "<a href='pass_reset.php?login=$ua[u_login]&reset=reset' target='_blank'>Change my password</a><br>";

require_once "template/footer.php";
?>
