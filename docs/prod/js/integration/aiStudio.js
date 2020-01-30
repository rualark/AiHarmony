import {nd} from "../notes/NotesData.js";
import {dataToAbc} from "../abc/dataToAbc.js";
import {aic} from "./aiCounterpoint.js";
import {showMp3Player} from "../audio/mp3Player.js";

export let ais = {
  state: 'ready',
  f_id: 0,
  openMp3: true
};

function setAisIcon(img) {
  if (document.getElementById("aisi").src.endsWith(img)) return;
  console.log('Set icon');
  document.getElementById("aisi").src = img;
}

function setAisState(state) {
  ais.state = state;
  if (state === 'ready') {
    setAisIcon('img/toolbar/ais.png');
    return;
  }
  let passed = (new Date() - ais.sendTime) / 1000;
  if (passed > 5) {
    console.log(passed);
    if (state === 'sent') setAisIcon('img/progress/progress11c.gif');
    if (state === 'queued') setAisIcon('img/progress/progress9c.gif');
    return;
  }
  setAisIcon('img/progress/progress.gif');
}

export function sendToAis(openMp3=true) {
  ais.openMp3 = openMp3;
  ais.sendTime = new Date();
  let xml;
  if (ais.state !== 'ready') {
    alertify.notify('Rendering state: ' + ais.j_progress);
    return;
  }
  setAisState('sent');
  let midi = ABCJS.synth.getMidiFile(dataToAbc(), {midiOutputType: 'encoded'})[0];
  $.ajax({
    type: 'POST',
    url: 'https://artinfuser.com/studio/upload.php',
    data: {
      robot: 'robot_aih',
      token: 'xaJD5Bm9LwuQwRQ9',
      acode: 'MP1',
      fnm: nd.filename + '.mid',
      submit: 'submit',
      start_class: 9,
      fdt: midi,
    },
    dataType: 'html',
    success: function (data) {
      console.log('Ais success', data);
      getAisData(data);
      waitForAis();
    },
    error: function (error) {
      alertify.error('Error connecting to Artinfuser Studio: ' + error.status);
      setAisState('ready');
    }
  });
}

function getAisData(data) {
  let spl = data.split('\n');
  //console.log(spl, spl.length < 3, spl[0] !== 'Upload successful', spl[1] !== 'Start successful', isNaN(Number(spl[2])));
  if (spl.length < 4 || spl[1] !== 'Upload successful' || spl[2] !== 'Start successful' || isNaN(Number(spl[3]))) {
    alertify.error('Error: ' + data);
    ais.f_id = 0;
    setAisState('ready');
    return;
  }
  ais.u_name = spl[0];
  ais.f_id = spl[3];
  ais.warnedQueue = false;
  ais.sendTime = new Date();
  if (ais.u_name === 'robot_aih') {
    alertify.warning('<a href=https://artinfuser.com/studio target=_blank>Login to Artinfuser</a> for more playback options and history', 15);
  }
  else {
    alertify.message(`<a href=https://artinfuser.com/studio/file.php?f_id=${ais.f_id} target=_blank>Rendering...</a>`, 5);
  }
}

function getAisUpdate(data) {
  //console.log(data);
  let spl = data.split('\n');
  if (spl.length < 8) {
    ais.f_id = 0;
    setAisState('ready');
    return;
  }
  ais.j_id = Number(spl[2]);
  ais.j_state = Number(spl[3]);
  ais.j_result = Number(spl[4]);
  ais.j_url = 'https://artinfuser.com/studio/' + spl[5];
  ais.j_url_png = ais.j_url.replace('.mp3', '_.png');
  ais.passedTime = spl[6];
  ais.j_progress = spl[7];
  if (ais.j_state === 1) {
    setAisState('queued');
  }
  if (ais.j_state === 2) {
    setAisState('running');
  }
  if (ais.passedTime > 7 && ais.j_state === 1 && !ais.warnedQueue) {
    ais.warnedQueue = true;
    alertify.message('Please be patient. Rendering is <a href=https://artinfuser.com/studio/status.php target=_blank>waiting</a> for other users', 20);
  }
}

function waitForAis() {
  console.log(ais);
  $.ajax({
    type: 'GET',
    url: 'https://artinfuser.com/studio/robotstate.php',
    data: {
      f_id: ais.f_id,
      j_class: 9
    },
    dataType: 'html',
    success: function (data) {
      //console.log('Ais update', data);
      getAisUpdate(data);
      //console.log(ais);
      if (ais.j_state === 3) {
        finishAis();
        return;
      }
      setTimeout(waitForAis, 1000);
    },
    error: function (error) {
      alertify.error('Error connecting to Artinfuser Studio: ' + error.status);
      setTimeout(waitForAis, 1000);
    }
  });
}

function finishAis() {
  setAisState('ready');
  if (ais.openMp3) {
    showMp3Player();
  }
}
