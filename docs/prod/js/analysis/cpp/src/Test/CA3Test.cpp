#include <iostream>
#include "../Algorithms/CA3/GenCA3.h"
#include "../includes.h"
#include <random>

vector<int> allowed_len = { 1, 2, 4, 6, 8, 12 };
vector<JsTimesig> allowed_timesig = { 
  {2, 4, 8},
  {3, 4, 12},
  {2, 2, 16},
  {4, 4, 16},
  {5, 4, 20},
  {6, 4, 24},
  {3, 2, 24},
};

CGenCA3 gen;
random_device rd;
mt19937 mt(rd());
uniform_real_distribution<double> dist(0.0, 1.0);

double rand01() {
  return dist(mt);
}

int rand(int from, int to) {
  return round(rand01() * (to - from)) + from;
}

void makeData(Plain2data& pd) {
  pd.algo = "CA3";
  pd.algoMode = 0;
  pd.timesig = allowed_timesig[rand(0, allowed_timesig.size() - 1)];
  int npm = pd.timesig.measure_len;
  pd.setFifths(rand(-7, 7));
  pd.keysig.mode = 13;
  int c_len = rand(1, 200) * 2;
  int vcount = rand(2, 9);
  pd.voices.clear();
  for (int v = 0; v < vcount; ++v) {
    JsVoice voice;
    voice.species = rand(0, 5);
    int s = 0;
    for (int n = 0; n < c_len; ++n) {
      JsNote note;
      if (rand01() > 0.2) {
        note.d = rand(14, 28);
      }
      else {
        note.d = 0;
      }
      note.len = 2 * (allowed_len[rand(0, allowed_len.size() - 1)]);
      if (note.len > npm - s % npm) {
        note.len = npm - s % npm;
      }
      if (s + note.len > c_len) {
        note.len = c_len - s;
      }
      if (note.len % 2) {
        for (int i = 0; i < n; ++i) {
          cout << voice.notes[i].len << " ";
        }
        cout << note.len << endl;
        throw "Bad len";
      }
      if (rand01() > 0.8) {
        note.alter = rand(-2, 2);
      }
      note.startsTie = rand(0, 1);
      voice.notes.push_back(std::move(note));
      s += note.len;
      if (s == c_len) break;
    }
    pd.voices.push_back(voice);
  }
}

void printFlags(CGenCA3& gen) {
  for (int v = 0; v < gen.av_cnt; ++v) {
    gen.v = v;
    for (int s = 0; s < gen.c_len; ++s) {
      gen.s = s;
      for (int f = 0; f < gen.flag[v][s].size(); ++f) {
        gen.GetFlag(f);
        cout << gen.GetRuleName(gen.fl, gen.sp, gen.vc, gen.vp) << endl;
      }
    }
  }
}

int main() {
	cout << "Starting test" << endl;
	for (int i = 0; i < 100000000; ++i) {
    clearErrors(false);
    gen.clear();
    Plain2data plain2data;
    makeData(plain2data);
    //plain2data.printData();
    //break;
    gen.analyse(plain2data);
    //printFlags(gen);
    cout << getErrorLevel() << " ";
  }
}
