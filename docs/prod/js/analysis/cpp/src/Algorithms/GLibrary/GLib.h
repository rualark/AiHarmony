#pragma once

#include "../../Interface/errors.h"
#include "../../Util/noteHelper.h"

// Letters in harmonies
const int hvt[] = { 1, 0, 1, 0, 0, 1, 0 };
const int hvd[] = { 0, 0, 1, 0, 1, 0, 1 };
const int hvs[] = { 0, 1, 0, 1, 0, 1, 0 };

const int int_meaning[] = { 0, -1, 0, -1, 0, 1, -1 };
//                           C     D     E  F     G     A     B
const int diatonic[] =     { 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1 };
const int m_diatonic[] = { 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0 };
const int m_diatonic_full[] = { 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1 };

const int note_base[][12] = {
	{ 0, -1, 2, -1, 4, 5, -1, 7, -1, 9, -1, 11 },
	{ 0, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11, -1 },
	{ -1, 0, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11 },
	{ 0, -1, 2, 4, -1, 5, -1, 7, 9, -1, 11, -1 },
	{ -1, 0, -1, 2, 4, -1, 5, -1, 7, 9, -1, 11 },
	{ 0, -1, 2, -1, 4, 5, -1, 7, -1, 9, 11, -1 },
	{ -1, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11, 0 },
	{ 0, -1, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11 },
	{ 0, 2, -1, 4, -1, 5, -1, 7, 9, -1, 11, -1 },
	{ -1, 0, 2, -1, 4, -1, 5, -1, 7, 9, -1, 11 },
	{ 0, -1, 2, 4, -1, 5, -1, 7, -1, 9, 11, -1 },
	{ -1, 0, -1, 2, 4, -1, 5, -1, 7, -1, 9, 11 }
};

const int note_base_m[][12] = {
	{ 0, -1, 2, 4, -1, 5, -1, 7, 9, -1, 11, -1 },
	{ -1, 0, -1, 2, 4, -1, 5, -1, 7, 9, -1, 11 },
	{ 0, -1, 2, -1, 4, 5, -1, 7, -1, 9, 11, -1 },
	{ -1, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11, 0 },
	{ 0, -1, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11 },
	{ 0, 2, -1, 4, -1, 5, -1, 7, 9, -1, 11, -1 },
	{ -1, 0, 2, -1, 4, -1, 5, -1, 7, 9, -1, 11 },
	{ 0, -1, 2, 4, -1, 5, -1, 7, -1, 9, 11, -1 },
	{ -1, 0, -1, 2, 4, -1, 5, -1, 7, -1, 9, 11 },
	{ 0, -1, 2, -1, 4, 5, -1, 7, -1, 9, -1, 11 },
	{ 0, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11, -1 },
	{ -1, 0, 2, -1, 4, -1, 5, 7, -1, 9, -1, 11 }
};

const string NoteName[] = {
	"C", // 0
	"C#", // 1
	"D", // 2
	"D#", // 3
	"E", // 4
	"F", // 5
	"F#", // 6
	"G", // 7
	"G#", // 8
	"A", // 9
	"A#", // 10
	"B" // 11
};

const string NoteName2[] = {
	"C", // 0
	"Db", // 1
	"D", // 2
	"Eb", // 3
	"E", // 4
	"F", // 5
	"Gb", // 6
	"G", // 7
	"Ab", // 8
	"A", // 9
	"Bb", // 10
	"B" // 11
};

const string LyMajorKey[] = {
  "c", // 0
  "df", // 1
  "d", // 2
  "ef", // 3
  "e", // 4
  "f", // 5
  "gf", // 6
  "g", // 7
  "af", // 8
  "a", // 9
  "bf", // 10
  "b" // 11
};

const string LyMinorKey[] = {
  "c", // 0
  "cs", // 1
  "d", // 2
  "ef", // 3
  "e", // 4
  "f", // 5
  "fs", // 6
  "g", // 7
  "gs", // 8
  "a", // 9
  "bf", // 10
  "b" // 11
};

const string mode_name[] = {
  "major", // 0
  "", // 1
  "dorian", // 2
  "", // 3
  "phrygian", // 4
  "lydian", // 5
  "", // 6
  "mixolydian", // 7
  "", // 8
  "minor", // 9
  "", // 10
  "locrian" // 11
};

const string mode_name2[] = {
  "ionian", // 0
  "", // 1
  "dorian", // 2
  "", // 3
  "phrygian", // 4
  "lydian", // 5
  "", // 6
  "mixolydian", // 7
  "", // 8
  "aeolian", // 9
  "", // 10
  "locrian" // 11
};

#define SQR(x) pow((x), 2)
#define SQRT(x) pow((x), 0.5)

class CGLib {
public:
	static void GetVint(const string& st, vector<int> &res);
  static void GetMovingMax(vector<int>& arr, int k, vector<int>& lmax);
	static int GetNoteI(string &st);
	static int GetPC(string &st);
	static int MatchVectors(vector <int> &v1, vector <int> &v2, int i1, int i2);
	static void vfill(vector<int> &v, int value);
	static int vsum(vector<int> &v);
	template<typename T> void vpop_front(vector<T>& v, size_t count);
	template<typename T> void vpush_front(vector<T>& v, T element, size_t count);
	template<typename T> static T vmax(vector<T> &v);
	template<typename T> static T vmin(vector<T> &v);
	template<typename T> void verase(vector<T>& v, size_t i);

public:
	CGLib();
	virtual ~CGLib();

	static int NumDigits(int number);
	static long long time();

	static void start_time();

	static long long abstime();

	static void WriteLog(int i, string st);

protected:
  static int GetRed(int col) { return (col >> 16) & 0xff; }
  static int GetGreen(int col) { return (col >> 8) & 0xff; }
  static int GetBlue(int col) { return col & 0xff; }
  static int GetAlpha(int col) { return (col >> 24) & 0xff; }
  static int MakeColor(int alpha, int red, int green, int blue) {
    return (alpha << 24) + (red << 16) + (green << 8) + blue;
  }
  static void GetRealNote(int no, int key, int mi, int & no2, int & oct, int & alter);
  string GetAlterName(int alter);
  string GetRealNoteName(int no, int key, int mi);
	// Time
	static long long first_time;
};

// Pop front vector elements
template<typename T> void CGLib::vpop_front(vector<T> &v, size_t count) {
	// Copy vector back
	for (size_t i = 0; i + count < v.size(); ++i) v[i] = v[i + count];
	// Remove last elements
	for (size_t i = 0; i < count; ++i) v.pop_back();
}

// Push front vector elements
template<typename T> void CGLib::vpush_front(vector<T> &v, T element, size_t count) {
	// Grow vector (actually, elements are loaded, but it is not important which elements because they will be overwritten in the next step)
	for (size_t i = 0; i < count; ++i) v.push_back(element);
	// Copy vector forward
	for (size_t i = v.size() - count - 1; i < v.size(); --i) v[i + count] = v[i];
	// Assign new elements
	for (size_t i = 0; i < count; ++i) v[i] = element;
}

// Maximum in vector
template<typename T> T CGLib::vmax(vector<T> &v) {
	T res = v[0];
	size_t x2 = v.size();
	for (size_t x = 1; x < x2; ++x) if (v[x] > res) res = v[x];
	return res;
}

// Minimum in vector
template<typename T> T CGLib::vmin(vector<T> &v) {
	T res = v[0];
	size_t x2 = v.size();
	for (size_t x = 1; x < x2; ++x) if (v[x] < res) res = v[x];
	return res;
}

// Erase element in vector
template<typename T> void CGLib::verase(vector<T> &v, size_t i) {
	v.erase(v.begin() + i);
}
