import {abcjs} from "../abc/abchelper.js";
import {dataToAbc} from "../abc/dataToAbc.js";

let synthControl = {};

export function play() {
  let synth = new ABCJS.synth.CreateSynth();
  let myContext = new AudioContext();
  synth.init({
    audioContext: myContext,
    visualObj: abcjs[0],
    millisecondsPerMeasure: 2000
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
    synthControl.load("#audio", undefined, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
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
