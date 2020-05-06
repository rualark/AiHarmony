<div class=container>
  <div style="margin: 0 auto; max-width: 650px">
  <form action=reg.php method=post>
    <br>
    <h4>Join <?=$site_name;?></h4>
    <?php
    echo "<br><p class=text-danger><b>$auth_error</b></p>";
    ?>
    <div class="form-group">
      <label for="name"><b>Full name</b></label>
      <input type="text" class="form-control" id="name" name=name value="<?=$name;?>" placeholder="Enter your full name" required>
    </div>
    <div class="form-group">
      <label for="login"><b>Email address</b></label>
      <input type="email" class="form-control" id="login" name=login value="<?=$login;?>" aria-describedby="emailHelp" placeholder="Enter email" required>
      <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="password"><b>Password</b></label>
      <input type="password" class="form-control" id="password" name=password aria-describedby="passHelp" placeholder="Password" required>
      <small id="passHelp" class="form-text text-muted">Use at least one lowercase letter, one numeral, and seven characters.</small>
    </div>
    <div>
      <hr><p>By clicking on "Create an account" below, you are agreeing to the <a href="tos.php" target="_blank">Terms and Conditions of Use</a> and the <a href="privacy.php" target="_blank">Privacy Policy</a>.</p>
    </div>
    <button type=submit value=register name=register class="btn btn-primary">Create an account</button>
  </form>
</div>