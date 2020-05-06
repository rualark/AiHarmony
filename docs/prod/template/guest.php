<main role="main">
  <!-- Main jumbotron for a primary marketing message or call to action -->
  <div class="jumbotron jumbotron-fluid jumbotron1">
    <div class="container">
      <div class="row">
        <div class="col-md-8" style="margin: 0 auto;">
          <h1 style='color: white' align=center>Get MP3 performance of your music piece</h1>
          <p style='color: white' class=lead align="center">Upload your MIDI file and get MP3 with best realistic virtual instruments available. Tweak parameters to get better results.
            You can even get multitrack performance with every instrument in a separate file.
            </p>
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
      <a target=_blank href='https://www.youtube.com/watch?v=q2m4WOEwP8c'>
        <img style='max-width: 100%' src='img/video/studio.png'>
      </a>
      <a target=_blank href='https://www.youtube.com/watch?v=q2m4WOEwP8c'>
        <img onmouseover="this.src='img/youtube.png';" onmouseout="this.src='img/youtube_gray.png';" style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);' src=img/youtube_gray.png>
      </a>
      <br>
      <b>Walkthrough Demonstration</b>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div itemscope itemtype="http://schema.org/ImageObject" class="container">
      <div class="row">
        <div class="col-md-12" style="margin: 0 auto;">
          <picture>
            <source type="image/webp" srcset="img/performworkflow.webp">
            <source type="image/png" srcset="img/performworkflow.png">
            <img itemprop="contentUrl" class='img-fluid mx-auto d-block' alt='Perform MIDI file' src="img/performworkflow.png">
          </picture>
        </div>
      </div>
      <br>
      <br>
      <br>
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h2 style='color: black' align=center>Audio demos</h2>
        </div>
      </div>
      <br>
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <iframe width="100%" height="400" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/775845912&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
        </div>
      </div>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2">
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h1 style='color: black' align=center>Supported instruments</h1>
          <p style='color: black' class=lead align="center">
            Currently orchestra instruments, piano, organ and jazz drum kit are supported. You can also choose articulations, including: staccato, pizzicato, tremolo, flutter tongue, mutes, sul ponticello, harmonics, sul tasto.
            <br><br>
            <a class='btn btn-primary' href="docs.php?d=re_instruments">See details</a>
            </p>
        </div>
      </div>
    </div>
  </div>

  <br>

</main>
