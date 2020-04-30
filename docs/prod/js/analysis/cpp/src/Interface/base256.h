#pragma once
#include "../includes.h"

int b256_ui(const uint8_t* buf, size_t& pos, size_t chars);
string b256_safeString(const uint8_t* buf, size_t& pos, size_t sizeCharacters);
void ui_b256(vector<uint8_t>& vec, int num, size_t chars, bool atEnd=true);
void safeString_b256(vector<uint8_t>& vec, string st, size_t sizeCharacters);
uint8_t* vector2byteArray(vector<uint8_t>& v);
