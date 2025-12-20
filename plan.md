# Plan: Optimized MAME Build for Ghost n' Goblins on Web

This plan documents the configuration and build process to create a minimal MAME WASM executable optimized for running Ghost n' Goblins (`gng`) on the web using WebGPU and enhanced graphics.

## Goal

Create a lightweight, web-ready MAME build capable of:
1.  Running Ghost n' Goblins (`gng`).
2.  Using the experimental WebGPU renderer via BGFX.
3.  Applying "even interpolation" (smoothing) using `xbr` shaders.
4.  Delivering high-quality audio.

## 1. Custom Build Subtarget (`gng`)

To reduce the size of the executable, we created a custom subtarget that includes only the necessary drivers and devices for GnG.

*   **Driver List:** `src/mame/gng.lst`
    *   Includes `gng` and its variants.
*   **Build Config:** `scripts/target/mame/gng.lua`
    *   **CPUs:** `M6809`, `Z80`
    *   **Sound:** `YM2203`, `SPEAKER`
    *   **Video:** `BUFSPRITE` (Buffered Spriteram)
    *   **Machines:** `TTL74259`, `GEN_LATCH`
    *   **Files:** `src/mame/capcom/gng.cpp`

## 2. Web Configuration

The Emscripten HTML template (`scripts/resources/emscripten/gng_web_template.html`) has been configured with the following runtime arguments:

*   **Video Backend:** `-video bgfx -bgfx_backend webgpu`
    *   Directs MAME to use the BGFX rendering engine and attempt to use the WebGPU backend.
*   **Shader Enhancements:** `-bgfx_screen_chains xbr/xbr-lv2-fast`
    *   Applies the xBR (Level 2 Fast) shader chain to provide smooth, high-quality interpolation of the pixel art.
*   **Audio:** `-samplerate 48000`
    *   Ensures consistent, high-quality audio output.
    *   *Note:* Audio latency is left at default to avoid underruns (crackling) common with low latency settings on the web.

## 3. Build Instructions

To build this optimized version, use the following command from the root of the MAME repository. This assumes you have the Emscripten SDK (`emcc`) available in your path.

```bash
make SUBTARGET=gng \
     OSD=sdl \
     TARGETOS=asmjs \
     GENIE_OPTIONS=--with-webgpu \
     -j4
```

*   `SUBTARGET=gng`: Tells the build system to use our custom `gng.lua` and `gng.lst`.
*   `OSD=sdl`: Uses the SDL OSD layer (standard for Emscripten builds).
*   `TARGETOS=asmjs`: Triggers the Emscripten/WASM build toolchain.
*   `GENIE_OPTIONS=--with-webgpu`: Enables the experimental WebGPU renderer in BGFX.

## 4. Deployment

The build will generate a `.html`, `.js`, and `.wasm` file (e.g., `gng.html`).

1.  **ROMs:** Place the `gng.zip` ROM file in a directory served by your web server (e.g., `/roms`).
2.  **Shaders:** Ensure the `bgfx` shader chains (`.json`) and compiled shaders (`.bin` or SPIR-V) are accessible or preloaded into the Emscripten virtual file system. The build process typically handles embedding essential data, but verification of shader path availability is recommended.
3.  **Browser:** Use a browser with WebGPU support enabled (e.g., Chrome/Edge stable or Canary, Firefox Nightly).

## Notes on WebGPU Support

WebGPU support in BGFX and MAME is experimental. If the WebGPU backend fails to initialize, MAME may fall back to WebGL 2.0 or Canvas 2D depending on browser compatibility. The shader chains configured (`xbr`) require a capable GPU backend.
