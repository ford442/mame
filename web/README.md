# **web** #

Contains web application part of MAME

Licensed under [The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)

## Building the Web Application

This directory contains a modern React/TypeScript web application for running MAME in the browser using Emscripten.

### Prerequisites

- Node.js 16 or later
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

This will start a webpack dev server on http://localhost:8080

### Production Build

To build the web application for production:

```bash
npm run build
```

This will create optimized production files in the `dist/` directory.

### Building MAME for Web

To compile MAME for the web using Emscripten:

```bash
# From the MAME root directory
emmake make SUBTARGET=pacmantest SOURCES=src/mame/pacman/pacman.cpp
```

The compiled MAME JavaScript and WebAssembly files should be placed in the `web/dist/` directory alongside the built web application.

### File Structure

- `src/` - Source files for the web application
  - `App.tsx` - Main React component
  - `index.tsx` - Entry point
  - `index.html` - HTML template
- `package.json` - NPM dependencies and scripts
- `project.json` - Project configuration
- `tsconfig.json` - TypeScript configuration
- `webpack.config.js` - Webpack build configuration

### Integration with MAME

The web application is designed to load and run MAME compiled with Emscripten. It:

1. Provides a canvas element for MAME to render to
2. Sets up the Emscripten Module configuration
3. Loads the compiled MAME JavaScript file
4. Provides UI controls for interacting with MAME (reset buttons, etc.)
5. Handles keyboard input and maps it to MAME's SDL keyboard system

### Keyboard Controls

The application includes a keyboard handler that maps browser keyboard events to MAME's SDL input system. See [KEYBOARD.md](KEYBOARD.md) for detailed information about:

- Keyboard control mappings
- SDL scancode reference
- Customization guide

**Default controls for Ghosts n Goblins:**
- Movement: W/A/S/D or Arrow Keys
- Attack: K
- Jump: L
- Start: 5
- Coin: 1

### Custom HTML Template

Instead of using Emscripten's default HTML output, this custom web application provides:

- Modern React-based UI
- Custom styling and layout
- Better control integration
- Improved user experience
