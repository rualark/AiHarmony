<?php
header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
http_response_code(404);
$url_404 = "https://artinfuser.com/404";
?>

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>404 - not found</title>
  <link rel="stylesheet" href="<?=$url_404?>/bootstrap.min.css">
</head>

<body>
<script defer type='text/javascript' src='<?=$url_404?>/jquery-3.4.1.min.js'></script>
<script defer src="<?=$url_404?>/bootstrap.bundle.min.js"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-56489282-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date());
  gtag('config', 'UA-56489282-1');
</script>

<main role="main">
  <!-- Main jumbotron for a primary marketing message or call to action -->
  <div class="jumbotron jumbotron-fluid jumbotron_warn" style='background-image:url(<?=$url_404?>/caption.jpg);'>
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto;">
          <h1 style='color: white' align=center>404 - page not found</h1>
        </div>
      </div>
    </div>
  </div>

  <div class="jumbotron jumbotron-fluid jumbotron2" style='background-color:#fff;'>
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="margin: 0 auto; text-align: center">
          <h3 style='color: black' align=center>This is not the page you are looking for</h3>
          <a class="btn btn-success btn-lg" href="https://<?=$_SERVER['HTTP_HOST']?>" role="button">Go to home page</a>
          <br>
          <br>
          <br>
          <br>
        </div>
      </div>
      <br>
      <br>
      <div class="row">
        <div class="col-md-12" style="margin: 0 auto;">
          <img class="img-fluid mx-auto d-block" alt='This is not the page you are looking for' src="<?=$url_404?>/oops.png">
        </div>
      </div>
    </div>
  </div>


</main>

