import {next_note, prev_note} from "../ui/edit/move.js";
import {start_counter, stop_counter} from "../core/time.js";
import {readRemoteMusicXmlFile} from "../MusicXml/readRemoteMusicXml.js";
import {async_redraw, state} from "../abc/abchelper.js";
import {nd} from "../notes/NotesData.js";
import {set_len, toggle_dot} from "../ui/edit/editLen.js";
import {
  increment_note,
  increment_octave,
  repeat_element,
  set_note,
  set_rest,
  toggle_alter
} from "../ui/edit/editNote.js";
import {add_part, del_bar, new_file, voiceChange} from "../ui/edit/editScore.js";
import {toggle_tie} from "../ui/edit/editTie.js";
import {undoState} from "../state/history.js";
import {aic, sendToAic} from "../integration/aiCounterpoint.js";
import {dataToMusicXml} from "../MusicXml/dataToMusicXml.js";
import {httpRequestNoCache} from "../core/remote.js";
import {data2string, STATE_VOLATILE_SUFFIX} from "../state/state.js";
import {keysigs} from "../ui/modal/keysig.js";
import {dataToAbc} from "../abc/dataToAbc.js";
import {waitForVar} from "../core/promise.js";
import {makePatch} from "../core/string.js";

export let testState = {
  testing: false
};

function console2html() {
  let old = console.log;
  let logger = document.getElementById('console');
  console.log = function () {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == 'object') {
        logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], null, 2) : arguments[i]) + '<br />';
      } else {
        logger.innerHTML += arguments[i] + '<br />';
      }
    }
    old.apply(console, arguments);
  }
}

async function waitForState(stage, obj, vals, pause, timeout) {
  // Check for abc redraw error
  if (state.error != null) {
    throw state.error;
  }
  try {
    await waitForVar(obj, 'state', vals, pause, timeout);
  }
  catch (e) {
    throw `${stage}. Timeout ${timeout} waiting for state (current ${obj.state}) with pause ${pause}`;
  }
}

function assert2strings(stage, st1, st2) {
  if (st1 !== st2) {
    console.log(makePatch(st1, st2), st1, st2);
    throw stage + " does not match";
  }
}

async function test_actions() {
  next_note();
  await waitForState('toggle_alter', state, ['ready'], 50, 5000);
  toggle_alter(2);
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('increment_note', state, ['ready'], 50, 5000);
  increment_note(1);
  await waitForState('set_len', state, ['ready'], 50, 5000);
  set_len(2);
  await waitForState('toggle_alter', state, ['ready'], 50, 5000);
  toggle_alter(0);
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('set_note', state, ['ready'], 50, 5000);
  set_note(4);
  await waitForState('toggle_alter', state, ['ready'], 50, 5000);
  toggle_alter(-1);
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('increment_note', state, ['ready'], 50, 5000);
  increment_note(-1);
  await waitForState('toggle_dot', state, ['ready'], 50, 5000);
  toggle_dot();
  await waitForState('toggle_alter', state, ['ready'], 50, 5000);
  toggle_alter(-2);
  await waitForState('repeat_element', state, ['ready'], 50, 5000);
  repeat_element();
  await waitForState('toggle_alter', state, ['ready'], 50, 5000);
  toggle_alter(1);
  await waitForState('increment_octave', state, ['ready'], 50, 5000);
  increment_octave(1);
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('set_rest', state, ['ready'], 50, 5000);
  set_rest();
  await waitForState('repeat_element', state, ['ready'], 50, 5000);
  repeat_element();
  await waitForState('append_measure', state, ['ready'], 50, 5000);
  nd.append_measure();
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('next_note', state, ['ready'], 50, 5000);
  next_note();
  await waitForState('del_bar', state, ['ready'], 50, 5000);
  del_bar();
  await waitForState('voiceChange', state, ['ready'], 50, 5000);
  voiceChange(1);
  await waitForState('set_len', state, ['ready'], 50, 5000);
  set_len(1);
  await waitForState('set_note', state, ['ready'], 50, 5000);
  set_note(2);
  await waitForState('prev_note', state, ['ready'], 50, 5000);
  prev_note();
  await waitForState('prev_note', state, ['ready'], 50, 5000);
  prev_note();
  await waitForState('toggle_tie', state, ['ready'], 50, 5000);
  toggle_tie();
  await waitForState('addPart', state, ['ready'], 50, 5000);
  add_part();
  await waitForState('set_len', state, ['ready'], 50, 5000);
  set_len(1);
  await waitForState('set_keysig', state, ['ready'], 50, 5000);
  nd.set_keysig(keysigs['F#']);
  async_redraw();
  await waitForState('set_keysig', state, ['ready'], 50, 5000);
  nd.set_keysig(keysigs['Ebm']);
  async_redraw();
}

async function test_framework() {
  // Test that wait does not fire before
  testState.test = '0';
  setTimeout(() => { testState.test = '1' }, 100);
  try {
    console.log('+ Successfully tested waitForVar, ms: ' +
      await waitForVar(testState, 'test', ['1'], 50, 1000)
    );
  }
  catch (e) {
    throw e;
  }
  let timeouted = 0;
  try {
    await waitForVar(testState, 'test', ['2'], 50, 100);
  }
  catch (e) {
    timeouted = 1;
    console.log('+ Successfully timeouted waitForVar');
  }
  if (!timeouted) {
    throw 'This test should timeout';
  }
}

async function test_do(test_level) {
  console.log('START TEST');
  await test_framework();
  await waitForState('new_file', state, ['ready'], 50, 5000);
  new_file();
  await waitForState('readRemoteMusicXmlFile', state, ['ready'], 50, 5000);
  readRemoteMusicXmlFile('musicxml/good-cp5-extract.xml');
  await waitForState('next_note', state, ['ready'], 50, 5000);
  let loaded_plain = data2string().slice(0, -STATE_VOLATILE_SUFFIX);
  assert2strings('Loaded plain',
    await httpRequestNoCache('GET', 'test_data/test1.plain'),
    loaded_plain);
  assert2strings('Loaded abc',
    await httpRequestNoCache('GET', 'test_data/test1.abc'),
    dataToAbc());
  assert2strings('Base64 compression', loaded_plain, LZString.decompressFromBase64(LZString.compressToBase64(loaded_plain)));
  assert2strings('UTF16 compression', loaded_plain, LZString.decompressFromUTF16(LZString.compressToUTF16(loaded_plain)));
  await test_actions();
  assert2strings('Edited plain',
    await httpRequestNoCache('GET', 'test_data/test2.plain'),
    data2string().slice(0, -STATE_VOLATILE_SUFFIX));
  assert2strings('Edited XML',
    await httpRequestNoCache('GET', 'test_data/test2.xml'),
    dataToMusicXml('NO DATE'));
  for (let i=0; i<34; ++i) {
    await waitForState('undo', state, ['ready'], 50, 5000);
    undoState();
  }
  assert2strings('Undo plain', loaded_plain, data2string().slice(0, -STATE_VOLATILE_SUFFIX));
  if (test_level > 1) {
    sendToAic(false);
    try {
      await waitForState('PDF', aic, ['ready'], 50, 10000);
    } catch (e) {
      console.log('Aic is probably busy, check for first responce');
      await waitForState('PDF', aic, ['queued', 'running', 'ready'], 50, 5000);
    }
  }
  stop_counter();
}

export async function test(test_level) {
  testState.testing = true;
  console2html();
  start_counter('test');
  try {
    await test_do(test_level);
  }
  catch (e) {
    document.getElementById("testResult").innerHTML = e.toString();
    throw e;
  }
  console.log('TEST PASSED');
  document.getElementById("testResult").innerHTML = 'TEST PASSED';
}
