extern "C" {
  extern int sendState(int state);
}

#define EMSCRIPTEN_KEEPALIVE __attribute__((used))

#include "src/Algorithms/HA1/result.h"
#include "../Algorithms/HA1/GenHA1.h"

CGenHA1 gen;

EMSCRIPTEN_KEEPALIVE
uint8_t* analyse(uint8_t* buf, int sz) {
  resultStartTime();
  clearErrors();
  gen.clear();
  Plain2data plain2data;
  plain2data.plain2data(buf, sz);
  if (getErrorLevel() > 40) return buildResult(gen);
  gen.analyse(plain2data);
  return buildResult(gen);
}

int main() {
  return 0;
}
