import {b256_safeString, b256_ui, safeString_b256, ui_b256} from "../core/base256.js";
import {engraverParams} from "../abc/abchelper.js";
import {applyShortcutsLayout} from "../ui/shortcutsLayouts.js";

const SETTINGS_ENCODING_VERSION = 2;

class Settings {
  constructor() {
    this.show_min_severity = 49;
    this.show_allowed_flags = 0;
    this.show_ignored_flags = 0;
    this.harm_notation = 3;
    // 0 - Show only rule name up to colon. Show only subrules starting with colon, 1 - Add subrules without colon, 2 - Add rule comments
    this.rule_verbose = 1;
  }

  reset() {
    this.setShortcutsLayout('AiHarmony');
  }

  setShortcutsLayout(layout) {
    this.shortcutsLayout = layout;
    applyShortcutsLayout(this.shortcutsLayout);
  }

  settings2plain() {
    let st = '';
    st += ui_b256(SETTINGS_ENCODING_VERSION, 1);
    st += ui_b256(this.rule_verbose, 1);
    st += ui_b256(engraverParams.scale * 1000, 2);
    st += safeString_b256(this.shortcutsLayout, 1);
    return st;
  }

  plain2settings(st, pos) {
    let saved_encoding_version = b256_ui(st, pos, 1);
    if (saved_encoding_version !== SETTINGS_ENCODING_VERSION) {
      throw('version');
    }
    this.rule_verbose = b256_ui(st, pos, 1);
    engraverParams.scale = b256_ui(st, pos, 2) / 1000;
    this.setShortcutsLayout(b256_safeString(st, pos, 1));
  }

  storage2settings() {
    try {
      let utf16 = localStorage.getItem('aihset');
      if (utf16 == null) {
        throw "No previous settings stored in this browser";
      }
      let plain = LZString.decompressFromUTF16(utf16);
      this.plain2settings(plain, [0]);
    }
    catch (e) {
      console.log(e);
      this.reset();
      this.settings2storage();
    }
  }

  settings2storage() {
    let plain = this.settings2plain();
    let utf16 = LZString.compressToUTF16(plain);
    localStorage.setItem('aihset', utf16);
  }
}

export let settings = new Settings();
