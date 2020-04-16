#include "errors.h"

vector<JsError> errors;
int errorLevel = 0;
bool printErrors = true;

void clearErrors(int printErrors_) {
  errors.clear();
  errorLevel = 0;
  printErrors = printErrors_;
}

void addError(int level_, string message_) {
  errorLevel = max(errorLevel, level_);
  if (printErrors) {
    printf("addError %d %d %s\n", level_, errorLevel, message_.c_str());
  }
  errors.push_back({
    level_,
    message_
  });
}

int getErrorLevel() {
  return errorLevel;
}

const vector<JsError>& getErrors() {
  return errors;
}

void fatalError(string st) {
  printf("%s\n", st.c_str());
  throw runtime_error(st);
}
