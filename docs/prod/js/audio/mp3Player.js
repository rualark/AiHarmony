import {ais} from "../integration/aiStudio.js";
import { initTooltips } from "../ui/lib/tooltips.js";

let my_jPlayer;
let jpData;
let jplayer_dur;

function show_jplayer() {
  let st = '';
  st += "<div style='line-height:50%'><br></div>";
  st += "<div style='position: relative; overflow: hidden'>";
  st += `<img width=100% height=120 class='jplayer_waveform' style='border-top: 1px solid #DDDDDD;border-bottom: 1px solid #DDDDDD;' id='jplayer_waveform'>`;
  st += "<img class='jplayer_progress' id='jplayer_progress' src=img/black.png height=400 width=0 style='opacity: 0.25; position: absolute; top: 0px; left: 0px;'></a>";
  st += "<input class='jplayer_pos_input' id='jplayer_pos_input' type=image name=icor src='img/red.png' width='100%' height='100%' style='position: absolute; top: 0px; left: 0px; opacity: 0; cursor: url(img/aim40_32.png) 17  18, auto'>";
  st += "</div>";
  st += `
  <div class=p-1 id="jp_container">
    <span style='white-space:nowrap;'>
      <a class="btn btn-primary jp-play" href="#"><img src='img/play5.png' height=15></a>
      <a class="btn btn-primary jp-pause" href="#"><img src="img/pause3.png" height="15"></a>
      <a class="btn btn-primary jp-stop" href="#"><img src="img/stop2.png" height="15"></a>
    </span>
    <span class="jp-current-time"></span> of <span class="jp-duration"></span>
    <a id=aisFileLink data-toggle=tooltip data-placement=top title='Fine tune sound' target=_blank href='#'><img class=imgmo height=40 src=img/multitrack.png></a>
  </div>
  `;
  document.getElementById("jplayer").innerHTML = st;
  my_jPlayer = $("#jquery_jplayer");
  $.jPlayer.timeFormat.padMin = false;
  $.jPlayer.timeFormat.padSec = true;
  $.jPlayer.timeFormat.sepMin = ":";
  $.jPlayer.timeFormat.sepSec = " ";

  my_jPlayer.jPlayer({
    ready: function () {
    },
    timeupdate: function(event) {
    },
    play: function(event) {
    },
    pause: function(event) {
    },
    ended: function(event) {
    },
    loadedmetadata: function(event) {
      if (jplayer_dur) return;
      jplayer_dur = my_jPlayer.data('jPlayer').status.duration;
    },
    swfPath: "plugin/jplayer/dist/jplayer",
    cssSelectorAncestor: "#jp_container",
    supplied: "mp3",
    wmode: "window"
  });
  my_jPlayer.jPlayer("setMedia", {
    mp3: ais.j_url
  });

  jpData = my_jPlayer.data('jPlayer');
  setInterval(function() {
    let x = jpData.htmlElement.audio.currentTime;
    let d = jplayer_dur;
    let img_waveform = document.getElementById('jplayer_waveform');
    if (img_waveform == null) return;
    let width = img_waveform.clientWidth;
    let img_progress = document.getElementById('jplayer_progress');
    img_progress.style.width = 2 + Math.max(0, x / d * (width - 2)) + 'px';
    img_progress.style.opacity = '0.3';
  }, 70);
  window.jplayer_setpos = function(e) {
    let img_waveform = document.getElementById('jplayer_waveform');
    if (img_waveform == null) return;
    let rect = e.target.getBoundingClientRect();
    let pos = e.pageX - rect.left - $(window).scrollLeft();
    my_jPlayer.jPlayer("playHead", pos / (img_waveform.clientWidth) * 100);
    my_jPlayer.jPlayer("play");
  };

  $(document).on("click", ".jplayer_pos_input", function (e) {
    jplayer_setpos(e);
    return false;
  });

  $(document).on("dblclick", ".jplayer_pos_input", function (e) {
    my_jPlayer.jPlayer("pause");
    return false;
  });

  $(document).on("contextmenu", ".jplayer_pos_input", function (e) {
    my_jPlayer.jPlayer("pause");
    return false;
  });
  $("#jp_container .jp-pause").hide();
  initTooltips(800, 100);
}

export function showMp3Player() {
  if (my_jPlayer == null) show_jplayer();
  $('#aisFileLink').attr('href', `https://artinfuser.com/studio/file.php?f_id=${ais.f_id}`);
  $('#jplayer_waveform').attr('src', ais.j_url_png);
  my_jPlayer.jPlayer('setMedia', {mp3: ais.j_url});
}
