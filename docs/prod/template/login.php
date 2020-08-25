<div class=container>
<div style="margin: 0 auto; max-width: 650px">
  <form action=login.php method=post>
    <input type="hidden" name=ru value="<?=$ru?>">
    <br>
    <h4>Login to <?=$site_name;?></h4>
    <?php
    echo "<br><p class=text-danger><b>$auth_error</b></p>";
    ?>
    <div class="form-group">
      <label for="login"><b>Email address</b></label>
      <input type="email" class="form-control" id="login" name=login placeholder="Enter email" required>
    </div>
    <div class="form-group">
      <label for="password"><b>Password</b></label>
      <input type="password" class="form-control" id="password" name=password placeholder="Password" required>
    </div>
    <button type=submit value=login name=log_in class="btn btn-primary">Login</button>
  </form>
  <br>
  <p><a href="pass_reset.php">Forgot your password?</a></p>
  <p>New to <?=$site_name ?>? <a href="reg.php">Create an account.</a></p>
</div>
