import {dataToMusicXml} from "../MusicXml/dataToMusicXml.js";
import {nd} from "../notes/NotesData.js";

export let aic = {
  state: 'ready',
  f_id: 0
};

function setAicState(state) {
  if (state === 'running' && aic.state !== 'ready') return;
  aic.state = state;
  if (state === 'success' || state === 'ready') {
    document.getElementById("aici").src = 'img/toolbar/aic.png';
  }
  if (state === 'running') {
    document.getElementById("aici").src = 'img/progress.gif';
  }
}

export function sendToAic() {
  let xml;
  setAicState('running');
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
      alertify.alert('Error connecting to Artinfuser Counterpoint', 'Error ' + error.status);
      setAicState('ready');
    }
  });
}

function getAicData(data) {
  let spl = data.split('\n');
  console.log(spl, spl.length < 3, spl[0] !== 'Upload successful', spl[1] !== 'Start successful', isNaN(Number(spl[2])));
  if (spl.length < 3 || spl[0] !== 'Upload successful' || spl[1] !== 'Start successful' || isNaN(Number(spl[2]))) {
    aic.f_id = 0;
    setAicState('ready');
    return;
  }
  aic.f_id = spl[2];
}

function getAicUpdate(data) {
  let spl = data.split('\n');
  if (spl.length < 6) {
    aic.f_id = 0;
    setAicState('ready');
    return;
  }
  aic.j_id = Number(spl[2]);
  aic.j_state = Number(spl[3]);
  aic.j_result = Number(spl[4]);
  aic.j_url = spl[5];
}

function waitForAic() {
  console.log(aic);
  if (aic.state !== 'running') return;
  $.ajax({
    type: 'GET',
    url: 'https://artinfuser.com/counterpoint/robotstate.php',
    data: {
      f_id: aic.f_id,
      j_class: 3
    },
    dataType: 'html',
    success: function (data) {
      console.log('Aic update', data);
      getAicUpdate(data);
      console.log(aic);
      if (aic.j_state === 3) {
        finishAic();
        return;
      }
      setTimeout(waitForAic, 1000);
    },
    error: function (error) {
      alertify.error('Error connecting to Artinfuser Counterpoint' + error.status);
      setTimeout(waitForAic, 1000);
    }
  });
}

function finishAic() {
  setAicState('success');
  window.open('https://artinfuser.com/counterpoint/' + aic.j_url, '_blank');
}
