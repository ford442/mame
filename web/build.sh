#!/bin/bash

# Build script for MAME web application
# This script builds both the MAME Emscripten binary and the web application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$SCRIPT_DIR"
MAME_ROOT="$(dirname "$WEB_DIR")"

echo "Building MAME Web Application"
echo "=============================="

# Check if node_modules exists, if not, install dependencies
if [ ! -d "$WEB_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$WEB_DIR"
    npm install
fi

# Build the web application
echo "Building web application..."
cd "$WEB_DIR"
npm run build

echo ""
echo "Web application built successfully!"
echo "Output directory: $WEB_DIR/dist"
echo ""
echo "To build MAME for Emscripten, run from the MAME root directory:"
echo "  emmake make SUBTARGET=<target> SOURCES=<sources>"
echo ""
echo "Then copy the generated .js and .wasm files to $WEB_DIR/dist/"
echo "and name them 'mame.js' and 'mame.wasm'"
