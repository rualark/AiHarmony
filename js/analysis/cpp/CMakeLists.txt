cmake_minimum_required(VERSION 3.15)
project(AiHarmony)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS
  "-O3")
# -fsanitize=address -s TOTAL_MEMORY=128MB
# -s WASM=1 -g4 -s ASSERTIONS=1 -s SAFE_HEAP=1 -s STACK_OVERFLOW_CHECK=2 -s DEMANGLE_SUPPORT=1 -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=1
#  --source-map-base https://artinfuser.com/harmony-dev/js/analysis/modules/CA3
# -g4
# -O1
# -s DISABLE_EXCEPTION_CATCHING=0
# -s ASSERTIONS=1
# -s ASSERTIONS=2
# -s SAFE_HEAP=1
# -s STACK_OVERFLOW_CHECK=1
# -s STACK_OVERFLOW_CHECK=2
# -s DEMANGLE_SUPPORT=1
# -fsanitize=address
# -s ALLOW_MEMORY_GROWTH
# -s DISABLE_EXCEPTION_CATCHING=0

include_directories(.)
include_directories(src/Algorithms)
include_directories(src/Export)
include_directories(src/Interface)

add_executable(CA3
        src/Algorithms/CA3/Configs/harm.h
        src/Algorithms/CA3/Configs/harmNotation.h
        src/Algorithms/CA3/Configs/intnames.h
        src/Algorithms/CA3/Configs/rules.h
        src/Algorithms/CA3/Configs/vranges.h
        src/Algorithms/GLibrary/GLib.cpp
        src/Algorithms/GLibrary/GLib.h
        src/Algorithms/CA3/CP2D.cpp
        src/Algorithms/CA3/CP2D.h
        src/Algorithms/CA3/CP2R.cpp
        src/Algorithms/CA3/CP2R.h
        src/Algorithms/CA3/GenCA3.cpp
        src/Algorithms/CA3/GenCA3.h
        src/Export/CA3.cpp
        src/Interface/base256.cpp
        src/Interface/base256.h
        src/Interface/Plain2data.cpp
        src/Interface/Plain2data.h
        src/Interface/errors.cpp
        src/Interface/errors.h
        src/Algorithms/CA3/result.cpp
        src/Algorithms/CA3/result.h
        src/includes.h
        src/Util/noteHelper.h
        src/Util/noteHelper.cpp
        src/Util/stringUtil.cpp
        src/Util/stringUtil.h src/Algorithms/CA3/CA3A.cpp src/Algorithms/CA3/CA3A.h)

add_executable(HA1
        src/Algorithms/HA1/Configs/harm.h
        src/Algorithms/HA1/Configs/harmNotation.h
        src/Algorithms/HA1/Configs/intnames.h
        src/Algorithms/HA1/Configs/rules.h
        src/Algorithms/HA1/Configs/vranges.h
        src/Algorithms/GLibrary/GLib.cpp
        src/Algorithms/GLibrary/GLib.h
        src/Algorithms/HA1/CP2D.cpp
        src/Algorithms/HA1/CP2D.h
        src/Algorithms/HA1/CP2R.cpp
        src/Algorithms/HA1/CP2R.h
        src/Algorithms/HA1/GenHA1.cpp
        src/Algorithms/HA1/GenHA1.h
        src/Export/HA1.cpp
        src/Interface/base256.cpp
        src/Interface/base256.h
        src/Interface/Plain2data.cpp
        src/Interface/Plain2data.h
        src/Interface/errors.cpp
        src/Interface/errors.h
        src/Algorithms/HA1/result.cpp
        src/Algorithms/HA1/result.h
        src/includes.h
        src/Util/noteHelper.h
        src/Util/noteHelper.cpp
        src/Util/stringUtil.cpp
        src/Util/stringUtil.h src/Algorithms/HA1/HA1A.cpp src/Algorithms/HA1/HA1A.h)
