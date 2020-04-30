#pragma once

#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include <cstdarg>

using namespace std;

template<typename ... Args> std::string spf2( const std::string& format, Args ... args );
#ifdef __llvm__
__attribute__ (( format( printf, 1, 2 ) )) 
#endif
std::string spf(const char *fmt, ...);
vector<string> split(const char* str, char c);
vector<string> split(const string& s, char delimiter);
void ltrim(string &s);
void rtrim(string &s);
string& trim(string &s);
void replaceAll(string& data, string toSearch, string replaceStr);
void stoupper(string& str);
int atoi(const string& st);
