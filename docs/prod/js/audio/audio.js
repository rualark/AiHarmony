import {abcjs, selected, state} from "../abc/abchelper.js";
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

function seekToSelection() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  const el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  const notes = nd.voices[el.voice].notes;
  const note = notes[el.note];
  const s = note.step;
  const last_s = notes[notes.length - 1].step + notes[notes.length - 1].len;
  play_state.synth.seek(s / last_s);
}

function stop() {
  play_state.state = 'stopped';
  setPlayIcon('img/toolbar/play.png');
  play_state.synth.stop();
}

function play(fromSelection) {
  play_state.synth = new ABCJS.synth.CreateSynth();
  let AudioContext = window.AudioContext          // Default
    || window.webkitAudioContext;  // Safari and old versions of Chrome
  let myContext = new AudioContext();
  play_state.synth.init({
    audioContext: myContext,
    visualObj: abcjs[0],
    options: {
      onEnded: stop
    }
  }).then(() => {
    play_state.synth.prime(() => {
    }).then(() => {
      if (fromSelection) {
        seekToSelection();
      }
      play_state.synth.start();
      setPlayIcon('img/stop.png');
      play_state.state = 'playing';
    });
  });
}

export function togglePlay(fromSelection) {
  if (play_state.state === 'playing') {
    stop();
  } else {
    play(fromSelection);
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
