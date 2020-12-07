import {nd} from "../../notes/NotesData.js";
import {async_redraw, selected, highlightNote, MAX_ABC_NOTE, MIN_ABC_NOTE, state} from "../../abc/abchelper.js";
import {saveState} from "../../state/history.js";
import {stop_advancing} from "./editScore.js";
import {move_to_next_note, move_to_previous_note, select_note, select_range} from "./select.js";
import {set_len} from "./editLen.js";
import {clefs} from "../modal/clefs.js";
import { settings } from "../../state/settings.js";
import { copy_selection, paste_selection, select_from_to } from "./editSelection.js";
import { nclip } from "../../notes/NotesClipboard.js";
import { play_note } from "../../audio/audio.js";

export let future = {
  advancing: false,
  alteration: 10,
  len: 0
};

export function is_locked() {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return false;
  if (nd.voices[el.voice].locked) return true;
  return false;
}

export function check_voice_locked(el) {
  if (nd.voices[el.voice].locked) {
    alertify.error('Note editing is prohibited in this part. Please click part name and disable protection.', 10);
    // Redraw is needed because abcjs immediately moves note before redraw to improve user experience
    // We need to redraw to move note back to initial position
    async_redraw();
    return true;
  }
  return false;
}

export function set_note(dc) {
  if (state.state !== 'ready') return;
  if (!selected.note) return;
  const el = selected.note;
  //if (check_voice_locked(el)) return;
  const voice = nd.voices[el.voice];
  const notes = voice.notes;
  const note = notes[el.note];
  // Choose reference diatonic
  let pd = clefs[voice.clef].middleD;
  if (note.d && !future.advancing) {
    pd = note.d;
  }
  else if (el.note && notes[el.note - 1].d) {
    pd = notes[el.note - 1].d;
  }
  else if (el.note < notes.length - 1 && notes[el.note + 1].d) {
    pd = notes[el.note + 1].d;
  }
  // Choose diatonic closest to reference
  let d = dc;
  while (pd - d > 3) d += 7;
  while (d - pd > 3) d -= 7;
  // If we are advancing, get future alteration
  // If pause is selected, get future alteration
  if (!note.d || future.advancing) {
    if (future.alteration == 10) {
      note.alter = nd.inherited_alter(el.voice, el.note, d);
    } else {
      note.alter = future.alteration;
    }
  } else if (note.d != d) {
    // Reset alteration only if seleted note is changed
    //note.alter = 10;
  }
  nd.set_note(el.voice, el.note, d, false);
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len, false);
  } else {
    // Fix 5/4 note
    if (note.len == 20) {
      set_len(12, false);
    }
  }
  saveState();
  // Advance
  future.advancing = true;
  future.alteration = 10;
  future.len = note.len;
  play_note(selected.note.voice, selected.note.note);
  move_to_next_note();
  async_redraw();
}

export function repeat_element() {
  if (state.state !== 'ready') return;
  if (selected.note == null) return;

  if (selected.note.n11 == null) {
    if (!selected.element || !selected.element.duration) return;
    let el = nd.abc_charStarts[selected.element.startChar];
    if (!el) return;
    let notes = nd.voices[el.voice].notes;
    let n = el.note;
    stop_advancing();
    select_from_to(el.voice, el.voice, n, n);
  }
  const v1 = selected.note.v1;
  const n12 = selected.note.n12;
  console.log(selected);
  if (copy_selection(true)) {
    if (n12 >= nd.voices[v1].notes.length - 1) {
      nd.append_measure(false);
      nd.update_note_steps();
    }
    select_note(v1, n12 + 1);
    paste_selection(false);
    async_redraw();
  }
}

export function delete_selection() {
  if (state.state !== 'ready') return;
  if (!selected.note || !selected.note.n12) return;
  const v1 = selected.note.v1;
  const v2 = selected.note.v2;
  // Check if voices are locked
  if (nd.voicesAreLocked(v1, v2)) {
    alertify.error('Note editing is prohibited in this part. Please click part name and disable protection.', 10);
    return;
  }
  const s1 = selected.note.s1;
  const s2 = selected.note.s2;
  for (let v=v1; v<=v2; ++v) {
    const vc = nd.voices[v];
    const notes = vc.notes;
    const n1 = nd.getClosestNote(v, s1);
    const n2 = nd.getClosestNote(v, s2);
    for (let n=n1; n<=n2; n++) {
      nd.set_rest(v, n, false);
      if (n) {
        notes[n - 1].startsTie = false;
      }
    }
  }
  saveState();
  async_redraw();
}

export function increment_selection(dnote) {
  if (state.state !== 'ready') return;
  if (!selected.note || !selected.note.n12) return;
  const v1 = selected.note.v1;
  const v2 = selected.note.v2;
  // Check if voices are locked
  if (nd.voicesAreLocked(v1, v2)) {
    alertify.error('Note editing is prohibited in this part. Please click part name and disable protection.', 10);
    return;
  }
  const s1 = selected.note.s1;
  const s2 = selected.note.s2;
  for (let v=v1; v<=v2; ++v) {
    const vc = nd.voices[v];
    const notes = vc.notes;
    const n1 = nd.getClosestNote(v, s1);
    const n2 = nd.getClosestNote(v, s2);
    for (let n=n1; n<=n2; n++) {
      const note = notes[n];
      const d = note.d;
      // Skip rests
      if (!d) continue;
      // Skip too high/low notes
      if (d + dnote >= MAX_ABC_NOTE || d + dnote <= MIN_ABC_NOTE) continue;
      note.alter = nd.inherited_alter(v, n, d + dnote);
      nd.set_note(v, n, d + dnote, false);
    }
  }
  saveState();
  async_redraw();
}

export function set_rest(advance) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  if (check_voice_locked(el)) return;
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  nd.set_rest(el.voice, el.note, false);
  if (el.note) {
    notes[el.note - 1].startsTie = false;
  }
  if (future.advancing && future.len) {
    future.advancing = false;
    set_len(future.len, false);
  }
  saveState();
  if (advance) {
    // Advance
    future.advancing = true;
    future.alteration = 10;
    future.len = note.len;
    move_to_next_note();
  }
  async_redraw();
}

export function can_increment_note(dnote) {
  if (!selected.element || !selected.element.duration) return false;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return false;
  if (nd.voices[el.voice].locked) return false;
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let note = nd.voices[el.voice].notes[n];
  let d = note.d;
  return d && d + dnote < MAX_ABC_NOTE && d + dnote > MIN_ABC_NOTE;
}

export function increment_octave(doct) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  if (!can_increment_note(doct * 7)) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  if (check_voice_locked(el)) return;
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let notes = nd.voices[el.voice].notes;
  let note = notes[n];
  let d = note.d;
  nd.set_note(el.voice, n, d + 7 * doct);
  play_note(el.voice, n);
  async_redraw();
}

export function increment_note(dnote) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  if (check_voice_locked(el)) return;
  if (!can_increment_note(dnote)) return;
  let n = el.note;
  if (future.advancing && el.note) {
    n = n - 1;
  }
  let notes = nd.voices[el.voice].notes;
  let note = notes[n];
  let d = note.d;
  note.alter = nd.inherited_alter(el.voice, n, d + dnote);
  nd.set_note(el.voice, n, d + dnote);
  play_note(el.voice, n);
  async_redraw();
}

export function toggle_alter(alt) {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  if (!el) return;
  if (check_voice_locked(el)) return;
  let n = el.note;
  if (future.advancing && el.note && !settings.alter_before_note) {
    n = n - 1;
  }
  let note = nd.voices[el.voice].notes[n];
  if (settings.alter_before_note && (!note.d || future.advancing)) {
    future.advancing = true;
    if (future.alteration === alt) future.alteration = 10;
    else future.alteration = alt;
  }
  else {
    if (note.alter === alt) {
      nd.set_alter(el.voice, n, 10);
    } else {
      nd.set_alter(el.voice, n, alt);
    }
    play_note(selected.note.voice, selected.note.note);
  }
  async_redraw();
}
