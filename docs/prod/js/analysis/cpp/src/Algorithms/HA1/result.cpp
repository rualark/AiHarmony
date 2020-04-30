#include "result.h"
#include "base256.h"

#define ARES_ENCODING_VERSION 2

uint8_t* result = nullptr;
long long start_time = 0;

uint8_t* buildResult(CGenHA1& gen) {
  if (result) {
    delete[] result;
    result = nullptr;
  }
  vector<uint8_t> vec;
  auto& errors = getErrors();
  ui_b256(vec, ARES_ENCODING_VERSION, 1);
  ui_b256(vec, errors.size(), 2);
  for (int i=0; i<errors.size(); ++i) {
    ui_b256(vec, errors[i].level, 1);
    safeString_b256(vec, errors[i].message, 2);
  }
  ui_b256(vec, gen.av_cnt, 1);
  ui_b256(vec, gen.s_start, 2);
  ui_b256(vec, gen.c_len, 2);
  ui_b256(vec, gen.mode, 1);
  ui_b256(vec, 0, 2);
  for (int v = 0; v < gen.av_cnt; ++v) {
    gen.v = v;
    ui_b256(vec, gen.vid[v], 1);
    ui_b256(vec, gen.vsp[v], 1);
    ui_b256(vec, gen.vocra[v], 1);
    for (int s = 0; s < gen.c_len; ++s) {
      ui_b256(vec, gen.flag[v][s].size(), 1);
      gen.s = s;
      for (int f = 0; f < gen.flag[v][s].size(); ++f) {
        gen.GetFlag(f);
        ui_b256(vec, gen.fl, 2);
        ui_b256(vec, gen.fvl[v][s][f], 1);
        ui_b256(vec, gen.fsl[v][s][f], 2);
        ui_b256(vec, gen.accept[gen.sp][gen.vc][gen.vp][gen.fl] + 10, 1);
        ui_b256(vec, gen.severity[gen.sp][gen.vc][gen.vp][gen.fl], 1);
        safeString_b256(vec, gen.ruleinfo[gen.fl].RuleClass, 1);
        safeString_b256(vec, gen.GetRuleName(gen.fl, gen.sp, gen.vc, gen.vp), 2);
        safeString_b256(vec, gen.GetSubRuleName(gen.fl, gen.sp, gen.vc, gen.vp), 2);
        safeString_b256(vec, gen.GetRuleComment(gen.fl, gen.sp, gen.vc, gen.vp), 2);
        safeString_b256(vec, gen.GetSubRuleComment(gen.fl, gen.sp, gen.vc, gen.vp), 2);
      }
    }
  }
  result = vector2byteArray(vec);
  printf("Finished in %lld ms\n", CGLib::time() - start_time);
  return result;
}

void resultStartTime() {
  start_time = CGLib::time();
}
