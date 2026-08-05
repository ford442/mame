# Web Application Files Summary

This document provides an overview of the files added to build a custom web application for MAME instead of using the default Emscripten HTML output.

## Core Requirements Met

✅ **app.tsx** - Created as `src/App.tsx`
✅ **project.json** - Created in the web root directory
✅ **Other necessary files** - All supporting files created

## Complete File Structure

```
web/
├── src/
│   ├── App.tsx              # Main React component for MAME web interface
│   ├── App.css              # Styling for the main component
│   ├── index.tsx            # Application entry point
│   ├── index.css            # Global styles
│   └── index.html           # HTML template for the web app
│
├── package.json             # NPM dependencies and build scripts
├── project.json             # Project configuration
├── tsconfig.json            # TypeScript compiler configuration
├── webpack.config.js        # Webpack bundler configuration
│
├── build.sh                 # Build script for the web application
├── copy-mame-build.sh       # Helper script to copy MAME Emscripten output
│
├── README.md                # Web application documentation
├── INTEGRATION.md           # Comprehensive integration guide
└── TOOLCHAIN_MODIFICATION.md # Optional toolchain modifications
```

## File Descriptions

### Source Files

- **src/App.tsx**: React component that provides the UI for running MAME
  - Canvas element for MAME rendering
  - Control buttons (soft reset, hard reset)
  - Loading and error states
  - Integration with JSMAME API

- **src/index.tsx**: Entry point that renders the App component
  
- **src/index.html**: HTML template used by webpack
  - Contains root div for React
  - Minimal template (webpack injects scripts)

- **src/App.css**: Styling for the main MAME interface
  - Dark theme optimized for gaming
  - Responsive layout
  - Control button styling

- **src/index.css**: Global styles and CSS reset

### Configuration Files

- **package.json**: NPM package configuration
  - React and React DOM dependencies
  - TypeScript and build tool dependencies
  - Build scripts: `build`, `dev`, `type-check`

- **project.json**: Project metadata for build tools
  - Defines project structure
  - Build and serve targets
  - Output paths

- **tsconfig.json**: TypeScript compiler options
  - Target ES2020
  - JSX configuration for React
  - Strict type checking enabled

- **webpack.config.js**: Webpack bundler configuration
  - Entry point: src/index.tsx
  - Output: dist/ directory with content hashing
  - TypeScript loader (ts-loader)
  - CSS loaders (style-loader, css-loader)
  - HtmlWebpackPlugin for HTML generation
  - Dev server configuration

### Build Scripts

- **build.sh**: Automated build script
  - Installs dependencies if needed
  - Builds the web application
  - Provides instructions for MAME compilation

- **copy-mame-build.sh**: Helper script
  - Copies MAME Emscripten output to web/dist
  - Handles .js, .wasm, and .data files
  - Usage: `./copy-mame-build.sh path/to/mame.js`

### Documentation

- **README.md**: Basic web app documentation
  - Installation instructions
  - Build commands
  - File structure overview
  - Integration basics

- **INTEGRATION.md**: Comprehensive integration guide
  - Step-by-step build process
  - Emscripten configuration
  - Customization guide
  - Troubleshooting tips
  - Available JSMAME API functions

- **TOOLCHAIN_MODIFICATION.md**: Optional modifications
  - How to modify scripts/toolchain.lua
  - Skip default HTML generation
  - Output .js instead of .html

## How It Works

1. **Development**: The React/TypeScript application is built using webpack
2. **MAME Build**: MAME is compiled with Emscripten to generate .js and .wasm files
3. **Integration**: MAME build output is copied to the web/dist directory
4. **Deployment**: The complete application is served from web/dist

## Key Features

- **Modern Stack**: React 18, TypeScript 5, Webpack 5
- **Responsive UI**: Works on desktop and mobile browsers
- **Custom Controls**: Built-in reset buttons and extensible for more
- **JSMAME Integration**: Direct access to MAME functions via JavaScript
- **Developer-Friendly**: Hot module reloading for development
- **Production-Ready**: Optimized builds with code splitting

## Benefits Over Default Emscripten HTML

- Professional, customizable UI
- Better user experience
- Easier to extend with new features
- Modern development workflow
- Separate concerns (UI vs emulation)
- Better maintainability

## Build Commands Quick Reference

```bash
# Install dependencies
cd web && npm install

# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Type checking only
npm run type-check

# Build MAME for web (from MAME root)
emmake make SUBTARGET=target SOURCES=src/...

# Copy MAME build to web app
cd web && ./copy-mame-build.sh ../asmjs/bin/mame.js

# Serve the application
cd web/dist && python3 -m http.server 8000
```

## Next Steps

1. Install Node.js dependencies: `cd web && npm install`
2. Build the web application: `npm run build`
3. Build MAME with Emscripten
4. Copy MAME output to web/dist
5. Serve and test the application

For detailed instructions, see INTEGRATION.md.
