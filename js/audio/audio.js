import {abcjs} from "../abc/abchelper.js";
import { d2midi } from "../notes/noteHelper.js";
import { nd } from "../notes/NotesData.js";
import { settings } from "../state/settings.js";

let play_state = {
  state: 'stopped'
};

function setPlayIcon(img) {
  if (document.getElementById("playi").src.endsWith(img)) return;
  document.getElementById("playi").src = img;
}

export function play() {
  if (play_state.state === 'playing') {
    play_state.state = 'stopped';
    setPlayIcon('img/toolbar/play.png');
    play_state.synth.stop();
  } else {
    play_state.synth = new ABCJS.synth.CreateSynth();
    let AudioContext = window.AudioContext          // Default
      || window.webkitAudioContext;  // Safari and old versions of Chrome
    let myContext = new AudioContext();
    play_state.synth.init({
      audioContext: myContext,
      visualObj: abcjs[0],
    }).then(() => {
      play_state.synth.prime(() => {
      }).then(() => {
        play_state.synth.start();
        setPlayIcon('img/pause.png');
        play_state.state = 'playing';
      });
    });
  }
}

export function play_pitch(pitch, velocity) {
  ABCJS.synth.playEvent(
    [{
      "cmd": "note",
      "pitch": pitch,
      "volume": velocity,
      "start": 0,
      "duration": 5,
      "instrument": 0,
      "gap": 0
    }],
    [],
    1000 // a measure takes one second
  ).then(function (response) {
    //console.log("note played");
  }).catch(function (error) {
    console.error("Error playing note:", error);
  });
}

export function play_note(v, n) {
  if (!settings.editPlayVelocity) return;
  const d = nd.voices[v].notes[n].d;
  if (!d) return;
  play_pitch(d2midi(d) + nd.get_realAlter(v, n), settings.editPlayVelocity);
}
