# Optional: Modify Emscripten Build to Skip HTML Generation

If you want to modify the MAME build system to skip generating the default Emscripten HTML file, you can apply this patch to `scripts/toolchain.lua`.

## Current Behavior

Currently, the Emscripten build generates a `.html` file with a default template:

```lua
configuration { "asmjs" }
    postbuildcommands {
        "$(SILENT) echo Running asmjs finalize.",
        "$(SILENT) $(EMSCRIPTEN)/emcc -O2 -s TOTAL_MEMORY=268435456 \"$(TARGET)\" -o \"$(TARGET)\".html"
        -- ALLOW_MEMORY_GROWTH
    }
```

## Recommended Change

To output only the JavaScript file (which the custom web app will load), change line 643 in `scripts/toolchain.lua`:

```diff
 configuration { "asmjs" }
     postbuildcommands {
         "$(SILENT) echo Running asmjs finalize.",
-        "$(SILENT) $(EMSCRIPTEN)/emcc -O2 -s TOTAL_MEMORY=268435456 \"$(TARGET)\" -o \"$(TARGET)\".html"
+        "$(SILENT) $(EMSCRIPTEN)/emcc -O2 -s TOTAL_MEMORY=268435456 \"$(TARGET)\" -o \"$(TARGET)\".js"
         -- ALLOW_MEMORY_GROWTH
     }
```

## Why This Change?

- The custom web application (`web/src/index.html` and `App.tsx`) provides the HTML/UI
- Emscripten's default HTML template is not needed
- This avoids confusion about which HTML file to use
- Makes it clearer that the custom web app is the intended interface

## What This Affects

- The build will no longer generate a `.html` file
- Only `.js` (and `.wasm` if using WebAssembly) files will be generated
- You must use the custom web application to run MAME

## Alternative: Keep Both Options

If you want to support both the default HTML and custom web app, you can:

1. Keep the current configuration (generates .html)
2. Use the custom web app as an alternative interface
3. Users can choose which interface to use

This gives flexibility but requires maintaining awareness of which interface is being used.

## Note on Target Extension

In `scripts/src/main.lua` (line 74), the target extension is set to `.html`:

```lua
configuration { "asmjs" }
    targetextension ".html"
```

If you make the above change to `toolchain.lua`, you may also want to update this to:

```lua
configuration { "asmjs" }
    targetextension ".js"
```

This ensures consistency in the build output expectations.
