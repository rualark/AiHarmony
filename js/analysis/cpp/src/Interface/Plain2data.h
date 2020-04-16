#pragma once
#include "errors.h"

struct JsNote {
	int d = 0;
	int alter = 10;
	int len;
	bool startsTie = 0;
	string text;
	string lyric;
};

struct JsVoice {
	string clef;
	string name;
	int species;
	vector<JsNote> notes;
};

struct JsKeysig {
	int fifths;
	int mode;
};

struct JsTimesig {
	int beats_per_measure;
	int beat_type;
	int measure_len;
};

struct JsMode {
	int step;
	int fifths;
	int mode;
};

class Plain2data {
public:
	Plain2data();
	void plain2data(const uint8_t* buf, int sz);
	void setFifths(int fifths_);
	int c(int v, int n) const;
	void printData();

	JsKeysig keysig;
	JsTimesig timesig;
	vector<JsMode> modes;
	vector<JsVoice> voices;
	string algo;
	int algoMode;

private:
  vector<int> keysigImprint(int fifths);

  vector<int> phrases;
  vector<int> imprint;
};
