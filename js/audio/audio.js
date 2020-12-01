import {abcjs} from "../abc/abchelper.js";
import {dataToAbc} from "../abc/dataToAbc.js";
import { d2c, d2midi } from "../notes/noteHelper.js";
import { nd } from "../notes/NotesData.js";
import { settings } from "../state/settings.js";

let synthControl = {};

export function play() {
  let synth = new ABCJS.synth.CreateSynth();
  let AudioContext = window.AudioContext          // Default
    || window.webkitAudioContext;  // Safari and old versions of Chrome
  let myContext = new AudioContext();
  synth.init({
    audioContext: myContext,
    visualObj: abcjs[0],
  }).then(() => {
    synth.prime(() => {
    }).then(() => {
      synth.start();
    });
  });
}

export function play2() {
  ABCJS.renderMidi("midi1", dataToAbc(),
    {
      qpm: 320,
      program: 52,
    });

  ABCJS.midi.startPlaying(document.querySelector(".abcjs-inline-midi"));
}

export function play3() {
  if (ABCJS.synth.supportsAudio()) {
    synthControl = new ABCJS.synth.SynthController();
    synthControl.load("#audio", null, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
  } else {
    document.querySelector("#audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
  }
  let midiBuffer = new ABCJS.synth.CreateSynth();
  midiBuffer.init({ visualObj: abcjs[0] }).then(function (response) {
    if (synthControl) {
      synthControl.setTune(abcjs[0], false).then(function (response) {
        console.log("Audio successfully loaded.")
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    }
  }).catch(function (error) {
    console.warn("Audio problem:", error);
  });
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
