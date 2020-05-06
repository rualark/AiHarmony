<main role="main">
  <!-- Main jumbotron for a primary marketing message or call to action -->
  <div class="jumbotron jumbotron-fluid jumbotron1">
    <div class="container">
      <div class="row">
        <div class="col-md-8" style="margin: 0 auto;">
          <h1 style='color: white' align=center>Generate music with algorithms</h1>
          <p style='color: white' class=lead align="center">Use algorithms to generate melody and counterpoint. Discover recommendations to change your melody and counterpoint. Generate second voice to your melody.</p>
          <?php
          if (!$uid) {
            ?>
            <p style='color: white' align="center">
              <a class="btn btn-danger btn-lg" href="login.php?ru=<?=$_SERVER['REQUEST_URI']?>" role="button">Login</a>
              &nbsp;&nbsp;or&nbsp;&nbsp;
              <a class="btn btn-danger btn-lg" href="reg.php" role="button">Sign up</a>
            </p>
            <?php
          }
          ?>
        </div>
      </div>
    </div>
  </div>

  <br>
  <div class=container style='align-items: center; justify-content: center; display: flex;'>
    <div style='text-align: center; position: relative; display: inline-block'>
      <a target=_blank href='https://www.youtube.com/watch?v=lYUtyAJ5rB0'>
        <img style='max-width: 100%' src='img/video/algo.jpg'>
      </a>
      <a target=_blank href='https://www.youtube.com/watch?v=lYUtyAJ5rB0'>
        <img onmouseover="this.src='img/youtube.png';" onmouseout="this.src='img/youtube_gray.png';" style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);' src=img/youtube_gray.png>
      </a>
      <br>
      <b>Walkthrough Demonstration</b>
    </div>
  </div>


  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div itemscope itemtype="http://schema.org/ImageObject" class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h2 style='color: black' align=center>Generated music demos</h2>
        </div>
      </div>
      <br>
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <iframe width="100%" height="400" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/801476319&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
        </div>
      </div>
      <br>
      <p style='color: black' class=lead align="center">
        <a class='btn btn-success' href="docs.php?d=ge_examples">More examples of generated music</a>
      </p>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h1 style='color: black' align=center>Use different algorithms</h1>
          <p style='color: black' class=lead align="center">
<?php
echo $algo['CF1']['name'] . "<br>";
echo $algo['CP1']['name'] . "<br>";
echo $algo['CP3']['name'] . "<br>";
echo $algo['CA1']['name'] . "<br>";
echo $algo['CA2']['name'] . "<br>";
echo "Convert text typing into music<br>";
?>
            <br>
            <a class='btn btn-success' href="create.php">Try algorithms</a>
          </p>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h1 style='color: black' align=center>Fine tune algorithms</h1>
          <p style='color: black' class=lead align="center">
            Hundreds of rules are used to generate music. You can enable and disable rules, change their severity to influence the generation process.
            <br><br>
            <a class='btn btn-success' href="docs.php?d=al_rules">Explore the rules</a>
          </p>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h1 style='color: black' align=center>Get MP3 file of generated music</h1>
          <p style='color: black' class=lead align="center">
            After music generation, you will also get MP3 with performance by virtual instruments.
            If you need more control over virtual instruments selection and tuning, you can upload generated music to
            <a href="<?=$url_root?>/studio">Artinfuser Studio</a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <br>

</main>
