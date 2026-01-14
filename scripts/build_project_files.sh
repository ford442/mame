#!/bin/bash
set -e

# Path to emsdk env script - adaptable
EMSDK_ENV="${EMSDK_ENV:-/content/build_space/emsdk/emsdk_env.sh}"

if [ -f "$EMSDK_ENV" ]; then
    source "$EMSDK_ENV"
else
    echo "Warning: emsdk_env.sh not found at $EMSDK_ENV. Assuming environment is set."
fi

echo "--- STEP 1: GENERATE PROJECT FILES ---"
# We use standard 'make' (not emmake) and NO web flags.
# This builds the 'genie' tool using GCC without crashing.

make -j$(nproc) \
 SUBTARGET=gng_web \
 OSD=sdl \
 REGENIE=1 \
 TOOLS=0 \
 USE_QTDEBUG=0 \
 NOWERROR=1 \
 USE_BGFX=0 \
 SOURCES=src/mame/capcom/gng.cpp \
 generate
