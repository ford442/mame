#!/bin/bash

# Helper script to copy MAME Emscripten build output to web app dist directory
# Usage: ./copy-mame-build.sh <path-to-mame-js-file>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-mame-js-file>"
    echo "Example: $0 ../asmjs/bin/mame.js"
    exit 1
fi

MAME_JS_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Extract directory and base name
MAME_DIR="$(dirname "$MAME_JS_FILE")"
MAME_BASE="$(basename "$MAME_JS_FILE" .js)"

if [ ! -f "$MAME_JS_FILE" ]; then
    echo "Error: File not found: $MAME_JS_FILE"
    exit 1
fi

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

echo "Copying MAME build files to web dist directory..."

# Copy JS file
cp "$MAME_JS_FILE" "$DIST_DIR/mame.js"
echo "  Copied: mame.js"

# Copy WASM file if it exists
if [ -f "$MAME_DIR/${MAME_BASE}.wasm" ]; then
    cp "$MAME_DIR/${MAME_BASE}.wasm" "$DIST_DIR/mame.wasm"
    echo "  Copied: mame.wasm"
fi

# Copy data file if it exists
if [ -f "$MAME_DIR/${MAME_BASE}.data" ]; then
    cp "$MAME_DIR/${MAME_BASE}.data" "$DIST_DIR/mame.data"
    echo "  Copied: mame.data"
fi

echo ""
echo "Done! MAME files copied to $DIST_DIR"
echo "You can now serve the web application from the dist directory"
