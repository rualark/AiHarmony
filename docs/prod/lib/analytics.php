<?
  insert_analytics_hit('hits', $_SERVER['HTTP_HOST'],
    $_SERVER['SCRIPT_NAME'], $qstring, $uid);
  if ($sentry_enabled) {
    ?>
    <script src="https://browser.sentry-cdn.com/5.2.1/bundle.min.js" crossorigin="anonymous"></script>
    <script>
      Sentry.init({
        dsn: 'https://9e37322c5a51433fa6532f4ffc4661c6@sentry.io/1461179',
        release: '2019-05-16'
      });
      Sentry.configureScope((scope) => {
        scope.setUser({
          "email": "<?=$ua['u_login']?>"
        });
      });
    </script>
    <?php
  }
?>
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-56489282-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date());

  gtag('config', 'UA-56489282-1');

  function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  }
  <?
  $qstring = substr($qstring, 0, 250);
  echo "httpGetAsync(\"$url_main/hit.php?u_id=$uid&hitserver=$_SERVER[HTTP_HOST]&hitscript=$_SERVER[SCRIPT_NAME]&hitquery=$qstring\");";
  ?>
</script>
