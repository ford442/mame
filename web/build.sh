#!/bin/bash

# 1. Error Handling: Stop the script immediately if any command fails
set -e

# 2. Configuration Variables
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="${WORKSPACE:-/content/build_space}"
MAME_DIR="${MAME_DIR:-${WORKSPACE}/mame}"
EMSDK_ENV="${EMSDK_ENV:-${WORKSPACE}/emsdk/emsdk_env.sh}"
GAME_ID="${1:-gng}"
CORES="${CORES:-55}"

if [ ! -d "${MAME_DIR}" ]; then
    echo "Error: MAME directory not found at ${MAME_DIR}"
    exit 1
fi

cd "${MAME_DIR}"

echo "--- [SETUP] Updating Source ---"
git pull

PROFILE_JSON="$(node "${SCRIPT_DIR}/scripts/validate-game-profile.js" "${GAME_ID}" "${MAME_DIR}" --json)"
mapfile -t PROFILE_VALUES < <(node -e 'const profile = JSON.parse(process.argv[1]); console.log(profile.build.subtarget); console.log(profile.build.sources.join(",")); console.log(profile.rom.file); console.log(profile.rom.embedPath);' "${PROFILE_JSON}")
SUBTARGET="${PROFILE_VALUES[0]}"
SOURCES="${PROFILE_VALUES[1]}"
ROM_PATH="${MAME_DIR}/roms/${PROFILE_VALUES[2]}"
EMBED_PATH="${PROFILE_VALUES[3]}"

# Common flags shared between both steps
COMMON_FLAGS=(
    "SUBTARGET=${SUBTARGET}"
    "OSD=sdl"
    "TOOLS=0"
    "USE_QTDEBUG=0"
    "NOWERROR=1"
    "USE_BGFX=0"
    "SOURCES=${SOURCES}"
)

echo "--- [SETUP] Initializing Environment ---"
if [ ! -f "${EMSDK_ENV}" ]; then
    echo "Error: Emscripten environment not found at ${EMSDK_ENV}"
    exit 1
fi
source "${EMSDK_ENV}"

echo "--- [SETUP] Cleaning ---"
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
WEB_LDFLAGS="-lGL -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sDISABLE_EXCEPTION_CATCHING=0 -sLEGACY_GL_EMULATION=1 -sFORCE_FILESYSTEM=1 -sUSE_SDL=2 -sASSERTIONS=0 --embed-file ${ROM_PATH}@${EMBED_PATH}"

emmake make -j${CORES} \
    "${COMMON_FLAGS[@]}" \
    REGENIE=0 \
    LDFLAGS="${WEB_LDFLAGS}"

echo "--- Build Complete ---"
