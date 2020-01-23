import {dataToMusicXml} from "../MusicXml/dataToMusicXml.js";
import {nd} from "../notes/NotesData.js";

export let aic = {
  state: 'ready',
  f_id: 0,
  openPdf: true
};

function setAicIcon(img) {
  if (document.getElementById("aici").src.endsWith(img)) return;
  console.log('Set icon');
  document.getElementById("aici").src = img;
}

function setAicState(state) {
  aic.state = state;
  if (state === 'ready') {
    setAicIcon('img/toolbar/aic.png');
    return;
  }
  let passed = (new Date() - aic.sendTime) / 1000;
  if (passed > 5) {
    if (state === 'sent') setAicIcon('img/progress/progress11c.gif');
    if (state === 'queued') setAicIcon('img/progress/progress9c.gif');
    return;
  }
  setAicIcon('img/progress/progress.gif');
}

export function sendToAic(openPdf=true) {
  aic.openPdf = openPdf;
  let xml;
  if (aic.state !== 'ready') {
    alertify.error('Please wait for analysis task to finish');
    return;
  }
  setAicState('sent');
  try {
    xml = dataToMusicXml();
  }
  catch (e) {
    alertify.alert("Error exporting MusicXML", e.toString());
    setAicState('ready');
    throw e;
  }
  $.ajax({
    type: 'POST',
    url: 'https://artinfuser.com/counterpoint/upload.php',
    data: {
      robot: 'robot_aih',
      token: 'xaJD5Bm9LwuQwRQ9',
      acode: 'CA3',
      fnm: nd.filename + '.xml',
      submit: 'submit',
      start_class: 3,
      fdt: xml,
    },
    dataType: 'html',
    success: function (data) {
      console.log('Aic success', data);
      getAicData(data);
      waitForAic();
    },
    error: function (error) {
      alertify.error('Error connecting to Artinfuser Counterpoint: ' + error.status);
      setAicState('ready');
    }
  });
}

function getAicData(data) {
  let spl = data.split('\n');
  //console.log(spl, spl.length < 3, spl[0] !== 'Upload successful', spl[1] !== 'Start successful', isNaN(Number(spl[2])));
  if (spl.length < 4 || spl[1] !== 'Upload successful' || spl[2] !== 'Start successful' || isNaN(Number(spl[3]))) {
    alertify.error('Error: ' + data);
    aic.f_id = 0;
    setAicState('ready');
    return;
  }
  aic.u_name = spl[0];
  aic.f_id = spl[3];
  aic.timeStarted = new Date();
  aic.warnedQueue = false;
  aic.sendTime = new Date();
  if (aic.u_name === 'robot_aih') {
    alertify.warning('<a href=https://artinfuser.com/counterpoint target=_blank>Login to Artinfuser</a> for more analysis options and history', 15);
  }
  else {
    alertify.message(`<a href=https://artinfuser.com/counterpoint/file.php?f_id=${aic.f_id} target=_blank>Analysing...</a>`, 5);
  }
}

function getAicUpdate(data) {
  //console.log(data);
  let spl = data.split('\n');
  if (spl.length < 7) {
    aic.f_id = 0;
    setAicState('ready');
    return;
  }
  aic.j_id = Number(spl[2]);
  aic.j_state = Number(spl[3]);
  aic.j_result = Number(spl[4]);
  aic.j_url = spl[5];
  aic.passedTime = spl[6];
  if (aic.j_state === 1) {
    setAicState('queued');
  }
  if (aic.j_state === 2) {
    setAicState('running');
  }
  if (aic.passedTime > 7 && aic.j_state === 1 && !aic.warnedQueue) {
    aic.warnedQueue = true;
    alertify.message('Please be patient. Analysis is <a href=https://artinfuser.com/counterpoint/status.php target=_blank>waiting</a> for other users', 20);
  }
}

function waitForAic() {
  console.log(aic);
  $.ajax({
    type: 'GET',
    url: 'https://artinfuser.com/counterpoint/robotstate.php',
    data: {
      f_id: aic.f_id,
      j_class: 3
    },
    dataType: 'html',
    success: function (data) {
      //console.log('Aic update', data);
      getAicUpdate(data);
      //console.log(aic);
      if (aic.j_state === 3) {
        finishAic();
        return;
      }
      setTimeout(waitForAic, 1000);
    },
    error: function (error) {
      alertify.error('Error connecting to Artinfuser Counterpoint: ' + error.status);
      setTimeout(waitForAic, 1000);
    }
  });
}

function finishAic() {
  setAicState('ready');
  if (aic.openPdf) {
    window.open('https://artinfuser.com/counterpoint/' + aic.j_url, '_blank');
  }
}
