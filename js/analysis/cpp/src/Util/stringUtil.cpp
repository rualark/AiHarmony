#include "stringUtil.h"

// trim from start (in place)
void ltrim(std::string &s) {
  s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](int ch) {
    return !std::isspace(ch);
  }));
}

// trim from end (in place)
void rtrim(std::string &s) {
  s.erase(std::find_if(s.rbegin(), s.rend(), [](int ch) {
    return !std::isspace(ch);
  }).base(), s.end());
}

// trim from both ends (in place)
string& trim(std::string &s) {
  ltrim(s);
  rtrim(s);
  return s;
}

vector<string> split(const char* str, char c = ' ') {
  vector<string> result;
  do {
    const char* begin = str;
    while (*str != c && *str)
      str++;
    result.push_back(string(begin, str));
  } while (0 != *str++);
  return result;
}

vector<string> split(const string& s, char delimiter = ' ') {
  vector<string> tokens;
  string token;
  istringstream tokenStream(s);
  while (getline(tokenStream, token, delimiter)) {
    tokens.push_back(token);
  }
  if (!s.empty() && s.back() == delimiter)
    tokens.push_back("");
  return tokens;
}

void replaceAll(string& data, string toSearch, string replaceStr) {
  // Get the first occurrence
  size_t pos = data.find(toSearch);
  // Repeat till end is reached
  while( pos != string::npos) {
    // Replace this occurrence of Sub String
    data.replace(pos, toSearch.size(), replaceStr);
    // Get the next occurrence from the current position
    pos =data.find(toSearch, pos + replaceStr.size());
  }
}

template<typename ... Args>
string spf2( const string& format, Args ... args ) {
  size_t size = snprintf( nullptr, 0, format.c_str(), args ... ) + 1; // Extra space for '\0'
  if (size <= 0) {
    throw runtime_error( "Error during formatting." );
  }
  unique_ptr<char[]> buf( new char[ size ] );
  snprintf(buf.get(), size, format.c_str(), args ... );
  return string(buf.get(), buf.get() + size - 1 ); // We don't want the '\0' inside
}

#ifdef __llvm__
__attribute__ (( format( printf, 1, 2 ) ))
#endif
std::string spf(const char *fmt, ...) {
  std::string ret;
  // Deal with varargs
  va_list args;
  va_start(args, fmt);
  // Resize our string based on the arguments
  ret.resize(vsnprintf(0, 0, fmt, args));
  // End the varargs and restart because vsnprintf mucked up our args
  va_end(args);
  va_start(args, fmt);
  // Fill the string
  if(!ret.empty())
  {
    vsnprintf(&ret.front(), ret.size() + 1, fmt, args);
  }
  // End of variadic section
  va_end(args);
  // Return the string
  return ret;
}

void stoupper(string& str) {
  transform(str.begin(), str.end(),str.begin(), ::toupper);
}

int atoi(const string& st) {
  return atoi(st.c_str());
}
