import {next_note, prev_note} from "../ui/edit/select.js";
import {start_counter, stop_counter} from "../core/time.js";
import {readRemoteMusicXmlFile} from "../MusicXml/readRemoteMusicXml.js";
import {abcjs, async_redraw, selected, state} from "../abc/abchelper.js";
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
import {dataToMusicXml} from "../MusicXml/dataToMusicXml.js";
import {httpRequestNoCache} from "../core/remote.js";
import {data2plain} from "../state/state.js";
import {keysigs, showKeysigModal} from "../ui/modal/keysig.js";
import {dataToAbc} from "../abc/dataToAbc.js";
import {waitForVar, sleep} from "../core/promise.js";
import {json_stringify_circular, makePatch} from "../core/string.js";
import {sendToAis} from "../integration/aiStudio.js";
import {unicode_b64} from "../core/base64.js";
import {ares} from "../analysis/AnalysisResults.js";
import { showSettingsModal } from "../ui/modal/settingsModal.js";
import { showCantusModal2, shuffleArrangement } from "../ui/modal/cantusModal.js";
import { showClefsModal } from "../ui/modal/clefs.js";
import { showDownloadModal } from "../ui/modal/download.js";
import { showOpenModal } from "../ui/modal/openModal.js";
import { showPartModal } from "../ui/modal/partModal.js";
import { showRestoreModal } from "../ui/modal/restoreModal.js";
import { showShareModal } from "../ui/modal/shareModal.js";
import { showShortcutsModal } from "../ui/modal/shortcutsModal.js";
import { showTextModal } from "../ui/modal/textModal.js";
import { showTimesigModal, timesigs } from "../ui/modal/timesig.js";
import { settings } from "../state/settings.js";
import { element_click } from "../ui/selection.js";
import { commands } from "../ui/commands.js";
import { nclip } from "../notes/NotesClipboard.js";

export let testState = {
  testing: false
};

const ignore_commands = new Set(['logo', 'support', 'docs', 'aic', 'ais', 'Edit exercise header (name)', 'zoom-in', 'zoom-out']);

function console2html() {
  let old = console.log;
  let logger = document.getElementById('console');
  console.log = function () {
    for (let i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] == 'object') {
        //logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(arguments[i], null, 2) : arguments[i]) + '<br />';
      } else {
        //logger.innerHTML += arguments[i] + '<br />';
      }
    }
    old.apply(console, arguments);
  }
}

async function waitForState(stage, obj, vals, pause, timeout) {
  // Check for abc redraw error
  if (state.error != null) {
    throw {
      message: state.error
    };
  }
  try {
    await waitForVar(obj, 'state', vals, pause, timeout);
  }
  catch (e) {
    throw {
      message: `${stage}. Timeout ${timeout} waiting for state (current ${obj.state}) with pause ${pause}`
    };
  }
  //console.log(stage);
  //await sleep(500);
}

function assert2strings(stage, fname, st1, st2, max_diff=0) {
  if (st1 !== st2) {
    let patch = makePatch(st1, st2);
    let diff = st1.length - patch.p1 - patch.p2 - 1;
    if (diff <= max_diff) return;
    console.log(patch, st1, st2);
    throw {
      message: `${stage} (${fname}) does not match ${diff} chars`,
      fname: fname,
      data: st2
    };
  }
}

async function validate_ignore_commands() {
  // Check if all ignore_commands exist
  for (const id of ignore_commands) {
    let found = false;
    for (const command of commands) {
      if (id === command.id || id === command.name) {
        found = true;
        break;
      }
    }
    if (!found) {
      throw {
        message: `${id} ignore_command not found in commands`,
      };
    }
  }
}

async function validate_nd() {
  let voices_end = -1;
  for (let v=0; v<nd.voices.length; ++v) {
    let vc = nd.voices[v];
    const nt = vc.notes[vc.notes.length - 1];
    let voice_end = nt.step + nt.len;
    if (voice_end % nd.timesig.measure_len) {
      throw {
        message: `Voice ${v} has length ${voice_end}, not whole measures of ${nd.timesing.measure_len} steps`,
      };
    }
    if (voices_end !== -1 && voices_end !== voice_end) {
      throw {
        message: `Voice ${v} has length ${voice_end}, not ${voices_end}`,
      };
    }
    voices_end = voice_end;
  }
}

function rand0n(n) {
  return Math.floor(Math.random() * n);
}

function randomProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[ keys.length * Math.random() << 0]];
};

function random_selection() {
  const voice = rand0n(nd.voices.length);
  selected.note = {
    voice: voice,
    note: rand0n(nd.voices[voice].notes.length)
  };
}

async function random_command(test_command_number) {
  await waitForState('random_command', state, ['ready'], 50, 5000);
  for (let attempt=0; attempt<1000; ++attempt) {
    const i = rand0n(commands.length);
    const command = commands[i];
    //console.log('Try command number', i, command);
    if (command.separator) continue;
    if (command.event === 'onchange') continue;
    if (ignore_commands.has(command.id)) continue;
    if (ignore_commands.has(command.name)) continue;

    console.log(test_command_number, 'Executing', command.id, command.name);
    command.command();
    if (Math.random() < 0.4) {
      $('#Modal1').modal('hide');
    }
    await validate_nd();
    // If nothing is selected, make about 10 commands before reselecting
    if (!selected.note && Math.random() < 0.1) {
      await waitForState('set_selection', state, ['ready'], 50, 5000);
      random_selection();
      async_redraw();
    }
    // Change key signature periodically
    if (Math.random() < 0.03) {
      await waitForState('change_keysig', state, ['ready'], 50, 5000);
      nclip.clear();
      nd.set_keysig(randomProperty(keysigs));
      async_redraw();
    }
    // Change time signature periodically
    if (Math.random() < 0.02) {
      await waitForState('change_timesig', state, ['ready'], 50, 5000);
      selected.note = null;
      nd.set_timesig(timesigs[rand0n(timesigs.length)]);
      async_redraw();
    }
    // Transpose periodically
    if (Math.random() < 0.01) {
      await waitForState('change_timesig', state, ['ready'], 50, 5000);
      selected.note = null;
      nd.set_timesig(timesigs[rand0n(timesigs.length)]);
      async_redraw();
    }
    // Stop after successful attempt
    break;
  }
}

async function test_random() {
  await validate_ignore_commands();
  for (let i=1; i<1000; ++i) {
    await random_command(i);
  }
  location.reload();
}

async function test_startChar() {
  let engraver = abcjs[0].engraver;
  for (let line = 0; line < engraver.staffgroups.length; line++) {
    let voices = engraver.staffgroups[line].voices;
    for (let voice = 0; voice < voices.length; voice++) {
      let elems = voices[voice].children;
      for (let elem = 0; elem < elems.length; elem++) {
        element_click(elems[elem].abcelem, 0, "", {voice: voice}, {step: 0}, {shiftKey: 0});
        async_redraw();
        $('#Modal1').modal('hide');
      }
    }
  }
  for (let i=0; i<73; ++i) {
    await waitForState('undo', state, ['ready'], 50, 5000);
    undoState(false);
  }
  await waitForState('undo', state, ['ready'], 50, 5000);
  undoState();
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

  await waitForState('test_startChar', state, ['ready'], 50, 5000);
  await test_startChar();

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
  await waitForState('set_text', state, ['ready'], 50, 5000);
  let el = nd.abc_charStarts[selected.element.startChar];
  nd.set_text(el.voice, el.note, "Some text");
  await waitForState('set_lyric', state, ['ready'], 50, 5000);
  el = nd.abc_charStarts[selected.element.startChar];
  nd.set_lyric(el.voice, el.note, "Some lyric");
  await waitForState('set_note', state, ['ready'], 50, 5000);
  set_note(2);
  await waitForState('prev_note', state, ['ready'], 50, 5000);
  prev_note();
  await waitForState('prev_note', state, ['ready'], 50, 5000);
  prev_note();
  await waitForState('toggle_tie', state, ['ready'], 50, 5000);
  toggle_tie();
  await waitForState('voiceChange', state, ['ready'], 50, 5000);
  voiceChange(-1);
  await waitForState('addPart', state, ['ready'], 50, 5000);
  add_part();
  await waitForState('voiceChange', state, ['ready'], 50, 5000);
  voiceChange(1);
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
    throw { message: e };
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
    throw { message: 'This test should timeout'};
  }
}

function removeStateFromXml(xml) {
  return xml.replace(/<software>AIHS:.*<\/software>/, '');
}

async function test_modal() {
  await waitForState('showSettingsModal', state, ['ready'], 50, 5000);
  showClefsModal(0);
  await sleep(500);
  $('#Modal1').modal('hide');
  showDownloadModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showKeysigModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showOpenModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showPartModal(0);
  await sleep(500);
  $('#Modal1').modal('hide');
  showRestoreModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showSettingsModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showShareModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showShortcutsModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showTextModal(0, 0, 'lyric');
  await sleep(500);
  $('#Modal1').modal('hide');
  showTimesigModal();
  await sleep(500);
  $('#Modal1').modal('hide');
  showCantusModal2(0);
  await sleep(500);
  shuffleArrangement(0);
  await sleep(500);
  // This should show showCantusModal()
  $('#Modal1').modal('hide');
  await sleep(500);
  $('#Modal1').modal('hide');
}

async function test_do(test_level) {
  const STATE_IGNORE_SUFFIX = 16;
  console.log('START TEST level:', test_level);
  await test_framework();
  await waitForState('new_file', state, ['ready'], 50, 5000);
  new_file();
  await waitForState('readRemoteMusicXmlFile', state, ['ready'], 50, 5000);
  readRemoteMusicXmlFile('musicxml/ca3-examples/good-cp5-extract.xml');

  if (test_level == 2) {
    await test_random();
  }

  await waitForState('analysis', ares, ['ready'], 50, 5000);
  readRemoteMusicXmlFile('musicxml/ca3-examples/good-cp5-extract.xml');
  await waitForState('data2plain', state, ['ready'], 50, 5000);
  await waitForState('analysis', ares, ['ready'], 50, 5000);
  let loaded_plain = data2plain().slice(0, -STATE_IGNORE_SUFFIX);
  assert2strings('Loaded plain', 'test1.plain',
    await httpRequestNoCache('GET', 'test_data/test1.plain'),
    loaded_plain);
  assert2strings('Loaded abc', 'test1.abc',
    await httpRequestNoCache('GET', 'test_data/test1.abc'),
    dataToAbc());
  assert2strings('Loaded ca3', 'test1.ca3',
    await httpRequestNoCache('GET', 'test_data/test1.ca3'),
    $('#analysisConsole').html());
  assert2strings('Base64 compression', '', loaded_plain, LZString.decompressFromBase64(LZString.compressToBase64(loaded_plain)));
  assert2strings('UTF16 compression', '', loaded_plain, LZString.decompressFromUTF16(LZString.compressToUTF16(loaded_plain)));

  await test_actions();

  await waitForState('analysis', ares, ['ready'], 50, 5000);
  assert2strings('Edited plain', 'test2.plain',
    await httpRequestNoCache('GET', 'test_data/test2.plain'),
    data2plain().slice(0, -STATE_IGNORE_SUFFIX));
  assert2strings('Edited XML', 'test2.xml',
    removeStateFromXml(await httpRequestNoCache('GET', 'test_data/test2.xml')),
    removeStateFromXml(dataToMusicXml('NO DATE')));
  assert2strings('Edited ca3', 'test2.ca3',
    await httpRequestNoCache('GET', 'test_data/test2.ca3'),
    $('#analysisConsole').html());
  for (let i=0; i<35; ++i) {
    await waitForState('undo', state, ['ready'], 50, 5000);
    undoState();
  }
  assert2strings('Undo plain', '', loaded_plain, data2plain().slice(0, -STATE_IGNORE_SUFFIX));
  if (test_level > 2) {
    sendToAis(false);
    try {
      await waitForState('MP3', ais, ['ready'], 50, 10000);
    } catch (e) {
      console.log('Ais is probably busy, check for first response');
      await waitForState('MP3', ais, ['queued', 'running', 'ready'], 50, 5000);
    }
  }
  await test_modal();
  stop_counter();
}

export async function test(test_level) {
  testState.testing = true;
  console2html();
  start_counter('test');
  try {
    settings.settings2storage();
    settings.rule_verbose = 0;
    await test_do(test_level);
    settings.storage2settings();
  }
  catch (e) {
    if (e != null) {
      let st = '';
      if (e.message != null) {
        st = e.message.toString();
      }
      else {
        st = e.toString();
      }
      if (e.fname != null) {
        st += ` <a href="data:text/plain;base64,${unicode_b64(e.data)}" download="${e.fname}">Canonize this test</a>`;
      }
      document.getElementById("testResult").innerHTML = st;
    }
    console.trace();
    throw e;
  }
  console.log('TEST PASSED');
  document.getElementById("testResult").innerHTML = 'TEST PASSED';
}
