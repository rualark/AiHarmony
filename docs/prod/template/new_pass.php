<div class=container>
  <div style="margin: 0 auto; max-width: 650px">
  <form action=pass_reset.php method=post>
    <input type="hidden" name="h" value="<?=$h ?>">
    <input type="hidden" name="u_id" value="<?=$u_id ?>">
    <br>
    <h4>Change password for <?=$ua['u_login']; ?></h4>
    <?php
    echo "<br><p class=text-danger><b>$auth_error</b></p>";
    ?>
    <div class="form-group">
      <label for="password"><b>Password</b></label>
      <input type="password" class="form-control" id="password" name=password aria-describedby="passHelp" placeholder="Password" required>
      <small id="passHelp" class="form-text text-muted">Use at least one lowercase letter, one numeral, and seven characters.</small>
    </div>
    <button type=submit value=new_pass name=new_pass class="btn btn-primary">Change password</button>
  </form>
</div>