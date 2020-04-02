import {async_redraw, selected, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import { stop_advancing } from "./editScore.js";
import { enableKeys } from "../commands.js";

export function add_text() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  stop_advancing();
  enableKeys(false);
  alertify.success('You entered: ' + note.text);
  alertify.prompt('Text', 'Add text above note', note.text ? note.text : "",
    function(evt, value) {
      enableKeys(true);
      nd.set_text(el.voice, el.note, value);
      async_redraw();
    },
    function() {
      enableKeys(true);
    }
  );
}

export function add_lyric() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  let notes = nd.voices[el.voice].notes;
  let note = notes[el.note];
  stop_advancing();
  enableKeys(false);
  alertify.success('You entered: ' + note.lyric);
  alertify.prompt('Lyric', 'Add lyric below note', note.lyric ? note.lyric : "",
    function(evt, value) {
      enableKeys(true);
      nd.set_lyric(el.voice, el.note, value);
      async_redraw();
    },
    function() {
      enableKeys(true);
    }
  );
}
