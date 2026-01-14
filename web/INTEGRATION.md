# MAME Web Application Integration Guide

This guide explains how to build and deploy the custom MAME web application instead of using the default Emscripten HTML output.

## Overview

The MAME web application provides a modern React-based interface for running MAME in the browser. Instead of using Emscripten's default HTML template, this custom application offers:

- Modern UI with React and TypeScript
- Better control over the user experience
- Custom styling and layout
- Enhanced control integration (reset buttons, etc.)
- Easier customization and extension

## Building the Complete Web Application

### Step 1: Install Node.js Dependencies

```bash
cd web
npm install
```

### Step 2: Build the Web Application

```bash
cd web
npm run build
```

This creates the web application in `web/dist/` with optimized HTML, CSS, and JavaScript.

### Step 3: Build MAME with Emscripten

From the MAME root directory, build MAME for a specific system or subset of systems:

```bash
# Set up Emscripten environment (if not already done)
source /path/to/emsdk/emsdk_env.sh

# Build MAME for a specific system (example: Pac-Man)
emmake make SUBTARGET=pacman SOURCES=src/mame/pacman/pacman.cpp
```

The build will output files to the `asmjs/bin` directory (or similar, depending on your configuration).

### Step 4: Copy MAME Build Output to Web App

Use the provided helper script:

```bash
cd web
./copy-mame-build.sh ../asmjs/bin/mame.js
```

Or manually copy the files:

```bash
cp ../asmjs/bin/mame.js web/dist/mame.js
cp ../asmjs/bin/mame.wasm web/dist/mame.wasm  # If using WebAssembly
```

### Step 5: Serve the Application

You can serve the application using any static file server. For example:

```bash
cd web/dist
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Customizing the Emscripten Build

To avoid generating the default HTML file from Emscripten, you can modify the postbuild command in `scripts/toolchain.lua`. 

Current configuration (line 643):
```lua
"$(SILENT) $(EMSCRIPTEN)/emcc -O2 -s TOTAL_MEMORY=268435456 \"$(TARGET)\" -o \"$(TARGET)\".html"
```

You can change this to output only the .js file (without .html):
```lua
"$(SILENT) $(EMSCRIPTEN)/emcc -O2 -s TOTAL_MEMORY=268435456 \"$(TARGET)\" -o \"$(TARGET)\".js"
```

This prevents Emscripten from generating its default HTML template, since you're using the custom React application instead.

## Development Workflow

For development, you can use the webpack dev server:

```bash
cd web
npm run dev
```

This starts a development server at http://localhost:8080 with hot module reloading.

Note: You'll still need to build MAME with Emscripten and copy the output files to test the full integration.

## Project Structure

```
web/
├── src/
│   ├── App.tsx           # Main React component
│   ├── App.css           # Styling for the main component
│   ├── index.tsx         # Application entry point
│   ├── index.css         # Global styles
│   └── index.html        # HTML template
├── dist/                 # Build output (created by webpack)
├── package.json          # NPM dependencies and scripts
├── project.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── webpack.config.js     # Webpack build configuration
├── build.sh              # Build script
├── copy-mame-build.sh    # Helper script to copy MAME build
└── README.md             # Web app documentation
```

## Customization

### Modifying the UI

Edit `web/src/App.tsx` to customize the user interface. The component includes:

- Canvas element for MAME rendering
- Control buttons (soft reset, hard reset)
- Loading states
- Error handling

### Adding More Controls

You can add more control buttons by extending the JSMAME interface. Available functions include:

- `JSMAME.soft_reset()` - Soft reset
- `JSMAME.hard_reset()` - Hard reset
- `JSMAME.exit()` - Exit emulation
- `JSMAME.save(filename)` - Save state
- `JSMAME.load(filename)` - Load state
- `JSMAME.ui_set_show_fps(ui, show)` - Toggle FPS display
- `JSMAME.sound_manager_mute(sound, mute, attenuation)` - Mute sound

See `scripts/resources/emscripten/emscripten_post.js` for the complete list.

### Styling

Modify `web/src/App.css` and `web/src/index.css` to change the appearance.

## Troubleshooting

### Build Errors

If you encounter build errors, ensure:
- Node.js 16 or later is installed
- All dependencies are installed (`npm install`)
- TypeScript compilation succeeds (`npm run type-check`)

### MAME Loading Issues

If MAME fails to load in the browser:
- Check browser console for errors
- Ensure MAME .js and .wasm files are in the correct location
- Verify the files are served with correct MIME types
- Check that CORS headers are set correctly if serving from a different domain

### Memory Issues

If you encounter memory errors:
- Increase the TOTAL_MEMORY parameter in the Emscripten build command
- Consider building with a smaller subset of MAME systems
- Use WebAssembly instead of asm.js for better memory handling

## Additional Resources

- [Emscripten Documentation](https://emscripten.org/docs/)
- [MAME Documentation](https://docs.mamedev.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
