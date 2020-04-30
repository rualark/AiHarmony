#include "Plain2data.h"
#include "base256.h"
#include "../Util/noteHelper.h"

#define ENCODING_VERSION 13

int contig2alter(int con) {
  if (con == 0) return 10;
  return con - 3;
}

Plain2data::Plain2data() {
}

void Plain2data::plain2data(const uint8_t* buf, int sz) {
  size_t pos = 0;
  int saved_encoding_version = b256_ui(buf, pos, 1);
  if (ENCODING_VERSION != saved_encoding_version) {
    addError(100, "Wrong plain state encoding version");
    return;
  }
  algo = b256_safeString(buf, pos, 1);
  algoMode = b256_ui(buf, pos, 1);
  int pcount = b256_ui(buf, pos, 1);
  phrases.clear();
  for (int i = 0; i < pcount; ++i) {
    phrases.push_back(b256_ui(buf, pos, 2));
  }
  int packed = b256_ui(buf, pos, 1);
  setFifths(packed % 16 - 10);
  keysig.mode = packed / 16;
  int mcount = b256_ui(buf, pos, 1);
  modes.clear();
  for (int i = 0; i < mcount; ++i) {
    int step = b256_ui(buf, pos, 2);
    int packed = b256_ui(buf, pos, 1);
    modes.push_back({
      step,
      packed % 16 - 10,
      packed / 16
      });
  }
  timesig.beats_per_measure = b256_ui(buf, pos, 1);
  timesig.beat_type = b256_ui(buf, pos, 1);
  timesig.measure_len = timesig.beats_per_measure * 16 / timesig.beat_type;
  int vcount = b256_ui(buf, pos, 1);
  voices.clear();
  for (int v = 0; v < vcount; ++v) {
    JsVoice voice;
    int packed = b256_ui(buf, pos, 1);
    voice.species = packed % 16;
    voice.clef = b256_safeString(buf, pos, 1);
    for (int n = 0; n < 1000000; ++n) {
      JsNote note;
      int packed = b256_ui(buf, pos, 1);
      // Detect end of voice
      if (packed == 1) break;
      note.d = b256_ui(buf, pos, 1);
      if (note.d) note.d += 7;
      note.len = b256_ui(buf, pos, 1);
      note.alter = contig2alter(packed / 4);
      note.startsTie = (packed % 4) > 0;
      note.text = b256_safeString(buf, pos, 1);
      note.lyric = b256_safeString(buf, pos, 1);
      voice.notes.push_back(std::move(note));
    }
    voices.push_back(voice);
  }
}

void Plain2data::printData() {
  // Ending of plain state is not imported
  if (phrases.size()) {
    printf("Phrases %lu %d %d\n", phrases.size(), phrases[0], algoMode);
  }
  printf("Keysig %d %d\n", keysig.fifths, keysig.mode);
  if (modes.size()) {
    printf("Modes %lu %d %d %d\n", modes.size(), modes[0].step, modes[0].fifths, modes[0].mode);
  }
  printf("Timesig %d %d %d\n", timesig.beats_per_measure, timesig.beat_type, timesig.measure_len);
  for (int v = 0; v < voices.size(); ++v) {
    printf("Voice %d: clef %s, species %d\n", v, voices[v].clef.c_str(), voices[v].species);
    for (int n = 0; n < voices[v].notes.size(); ++n) {
      printf("Note %d/%d: d %d, alter %d, len %d, tie %d\n", v, n,
        voices[v].notes[n].d, voices[v].notes[n].alter, voices[v].notes[n].len, voices[v].notes[n].startsTie);
    }
  }
}

void Plain2data::setFifths(int fifths_) {
  keysig.fifths = fifths_;
  imprint = keysigImprint(keysig.fifths);
}

// Middle C: 60 in MIDI (c), 35 in diatonic (d), starts octave 4 in MusicXml, "C" in ABC notation

// https://i.imgur.com/86u2JM2.png
vector<int> Plain2data::keysigImprint(int fifths) {
  vector<int> imprint(7);
  for (int f=1; f<=fifths; ++f) {
    imprint[(76 + f * 4) % 7] = 1;
  }
  for (int f=fifths; f<0; ++f) {
    imprint[(76 + (f + 1) * 4) % 7] = -1;
  }
  return imprint;
}

int Plain2data::c(int v, int n) const {
  const auto& note = voices[v].notes[n];
  int d = note.d;
  //printf("Note v %d, n %d, d %d\n", v, n, d);
  if (!d) return 0;
  int c = maj_D_C(d, 0);
  int alter = note.alter;
  int real_alter = alter;
  if (alter == 10) {
    real_alter = imprint[d % 7];
  }
  //printf("d2c: d %d, c %d, alter %d\n", d, c, real_alter);
  return c + real_alter;
}
