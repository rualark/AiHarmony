#include "base256.h"
#include "errors.h"

void ui_b256(vector<uint8_t>& vec, int num, size_t chars, bool atEnd) {
  int i = num;
  if (i < 0) {
    fatalError(
      spf("ui_b256 can convert to Base256 only non-negative numbers, but got %d", i));
  }
  for (int c = 0; c < chars; ++c) {
    if (atEnd) {
      vec.insert(vec.end() - c, i % 256);
    }
    else {
      vec.insert(vec.begin(), i % 256);
    }
    i /= 256;
  }
  if (i > 0) {
    fatalError(
      spf("ui_b256 cannot convert number %d to %lu base256 characters due to overflow",
        num, chars));
  }
}

void safeString_b256(vector<uint8_t>& vec, string st, size_t sizeCharacters) {
  ui_b256(vec, st.size(), sizeCharacters);
  for (int i=0; i<st.size(); ++i) {
    vec.push_back(st[i]);
  }
}

int b256_ui(const uint8_t* buf, size_t& pos, size_t chars) {
  int res = 0;
  int pow = 1;
  for (size_t c = 0; c < chars; ++c) {
    int data = buf[pos + chars - 1 - c];
    res += data * pow;
    pow *= 256;
  }
  pos += chars;
  //printf("b256_ui %zu %zu %d\n", pos - chars, chars, res);
  return res;
}

string b256_safeString(const uint8_t *buf, size_t &pos, size_t sizeCharacters) {
  int chars = b256_ui(buf, pos, sizeCharacters);
  string res(buf + pos, buf + pos + sizeCharacters + chars);
  pos += chars;
  return res;
}

uint8_t* vector2byteArray(vector<uint8_t>& vec) {
  int sizeChars = log(vec.size()) / log(256) + 1;
  ui_b256(vec, vec.size(), sizeChars, false);
  uint8_t* result = new uint8_t[vec.size() + 1];
  result[0] = sizeChars;
  for (int i=0; i<vec.size(); ++i) {
    result[i + 1] = vec[i];
  }
  return result;
}