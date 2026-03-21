#!/bin/bash

# 1. Error Handling: Stop the script immediately if any command fails
set -e

# 2. Configuration Variables
WORKSPACE="/content/build_space"
MAME_DIR="${WORKSPACE}/mame"
EMSDK_ENV="${WORKSPACE}/emsdk/emsdk_env.sh"
ROM_PATH="${MAME_DIR}/roms/gng.zip"
CORES=2  # Adjusted for lower memory systems. Increase if you have >16GB RAM and more CPU cores

# Common flags shared between both steps
COMMON_FLAGS=(
    "SUBTARGET=gng_web"
    "OSD=sdl"
    "TOOLS=0"
    "USE_QTDEBUG=0"
    "NOWERROR=1"
    "USE_BGFX=0"
    "SOURCES=src/mame/capcom/gng.cpp"
)

echo "--- [SETUP] Initializing Environment ---"
source "${EMSDK_ENV}"

if [ ! -d "${MAME_DIR}" ]; then
    echo "Error: MAME directory not found at ${MAME_DIR}"
    exit 1
fi

cd "${MAME_DIR}"

echo "--- [SETUP] Updating Source and Cleaning ---"
git pull
make clean

# --- STEP 1: GENERATE PROJECT FILES (HOST BUILD) ---
# We use standard 'make' (GCC/Clang) here, NOT emmake.
# This builds the 'genie' tool and generates the makefiles.
echo "--- [STEP 1] Generating Project Files ---"
make -j${CORES} \
    "${COMMON_FLAGS[@]}" \
    REGENIE=1 \
    generate

# --- STEP 2: COMPILE THE GAME (TARGET BUILD) ---
# We use 'emmake' to wrap the build for Emscripten.
# REGENIE=0 prevents it from trying to rebuild the build tools with Emscripten.
echo "--- [STEP 2] Compiling MAME for Web ---"

# Define LDFLAGS specifically for the web build
WEB_LDFLAGS="-lGL -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sDISABLE_EXCEPTION_CATCHING=0 -sLEGACY_GL_EMULATION=1 -sFORCE_FILESYSTEM=1 -sUSE_SDL=2 -sASSERTIONS=0 --embed-file ${ROM_PATH}@/roms/gng.zip"

emmake make -j${CORES} \
    "${COMMON_FLAGS[@]}" \
    REGENIE=0 \
    LDFLAGS="${WEB_LDFLAGS}"

echo "--- Build Complete ---"
