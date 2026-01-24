#!/bin/bash
set -e

# Path to emsdk env script
EMSDK_ENV="${EMSDK_ENV:-/content/build_space/emsdk/emsdk_env.sh}"

if [ -f "$EMSDK_ENV" ]; then
    source "$EMSDK_ENV"
else
    echo "Warning: emsdk_env.sh not found at $EMSDK_ENV. Assuming environment is set."
fi

# Ensure roms path exists
ROM_PATH="$(pwd)/roms/gng.zip"
if [ ! -f "$ROM_PATH" ]; then
    echo "Error: ROM file not found at $ROM_PATH"
    # Fallback to checking relative path if user runs from different dir
    if [ -f "roms/gng.zip" ]; then
        ROM_PATH="roms/gng.zip"
    else
        echo "Please ensure roms/gng.zip exists."
        exit 1
    fi
fi

echo "--- STEP 2: COMPILE THE GAME ---"

# Extra flags requested by user
# -o gng_web.js: Output filename
# removed -sMODULARIZE -sEXPORT_ES6=1 to match App.tsx global usage
EXTRA_LDFLAGS="-o gng_web.js"

# Main build command
# Added -sASSERTIONS=1 for debugging
# Added -sGL_UNSAFE_OPTS=0 to fix GL emulation warnings/crashes
emmake make \
 SUBTARGET=gng_web \
 OSD=sdl \
 REGENIE=0 \
 TOOLS=0 \
 USE_QTDEBUG=0 \
 NOWERROR=1 \
 USE_BGFX=0 \
 SOURCES=src/mame/capcom/gng.cpp \
 LDFLAGS="-lGL -sASYNCIFY -sALLOW_MEMORY_GROWTH=1 -sDISABLE_EXCEPTION_CATCHING=0 -sLEGACY_GL_EMULATION=1 -sFORCE_FILESYSTEM=1 -sUSE_SDL=2 -sASSERTIONS=1 -sGL_UNSAFE_OPTS=0 --embed-file ${ROM_PATH}@/roms/gng.zip ${EXTRA_LDFLAGS}" \
 -j$(nproc)

echo "--- Moving files to public/ ---"
mkdir -p public

if [ -f "gng_web.js" ]; then
    mv gng_web.js public/
    echo "Moved gng_web.js to public/"
else
    echo "Warning: gng_web.js not found in current directory."
fi

if [ -f "gng_web.wasm" ]; then
    mv gng_web.wasm public/
    echo "Moved gng_web.wasm to public/"
else
    echo "Warning: gng_web.wasm not found in current directory."
fi

if [ -f "gng_web.data" ]; then
    mv gng_web.data public/
    echo "Moved gng_web.data to public/"
fi

echo "Build complete."
