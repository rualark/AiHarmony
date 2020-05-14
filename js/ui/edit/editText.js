import {selected, state} from "../../abc/abchelper.js";
import {nd} from "../../notes/NotesData.js";
import { stop_advancing } from "./editScore.js";
import { showTextModal } from "../modal/textModal.js";

export function add_text() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  stop_advancing();
  showTextModal(el.voice, el.note, 'text');
}

export function add_lyric() {
  if (state.state !== 'ready') return;
  if (!selected.element || !selected.element.duration) return;
  let el = nd.abc_charStarts[selected.element.startChar];
  stop_advancing();
  showTextModal(el.voice, el.note, 'lyric');
}
