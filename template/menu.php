<!doctype html>
<html lang="en">
<head>
  <?php
  share_header("$url_share",
    $site_name,
    $site_descr,
    "$url_share/img/$og_img");
  ?>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="description" content="<?=$site_descr?>">
  <meta name="author" content="">
  <?php
  echo "<link rel=icon href='$favicon'>";
  ?>
  <!-- <link rel="canonical" href="<?=$url_main?>"> -->

  <title><?=$title ?></title>

  <!-- Bootstrap core CSS -->
  <link rel="stylesheet" href="plugin/bootstrap-4.3.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="css/main.css">

  <!-- Custom styles for this template -->
  <link href="css/main.css" rel="stylesheet">
</head>
<style>
body{padding-top:3.5rem; background-color:white}
</style>

<body>
<?php
require_once __DIR__ . "/../lib/analytics.php";
show_chatovod("artquiz");
?>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
  <div class="container">
    <table><tr><td>
      <a href='https://artinfuser.com'><img width=38 style='max-width: 8vw' src=img/logo-green.png alt='Artinfuser'></a> <a href='https://artinfuser.com'><img style='max-width: 22vw' src=https://artinfuser.com/artinfuser/img/logo-artinfuser-green.png alt='Artinfuser'></a><a href='https://artinfuser.com/exercise'><img style='max-width: 30vw' src=img/logo-exercise.png alt='Artinfuser Exercise'></a><style>.container{max-width:1350px}</style>    </table>
    &nbsp;&nbsp;&nbsp;
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarsExampleDefault">
      <ul class="navbar-nav mr-auto">
        <li class=nav-item><a class=nav-link href='editor.html'><b>Start</b></a></li>
        <li class=nav-item><a class=nav-link href='docs.php'>Docs</a></li>
        <li class=nav-item><a class=nav-link href=contact.php>Contact</a></li></ul>
    </div>
  </div>
</nav>

<script type='text/javascript' src='plugin/jquery-3.4.1/jquery-3.4.1.min.js'></script>
