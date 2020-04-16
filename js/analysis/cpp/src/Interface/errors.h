#pragma once

#include "../includes.h"

struct JsError {
  int level;
  string message;
};

void clearErrors(int printErrors_=true);
void addError(int level_, string message_);
int getErrorLevel();
const vector<JsError>& getErrors();
void fatalError(string st);
