# Web game profiles

Each web game is defined by a JSON file in this directory. The profile ID is
the filename without the `.json` extension and is used to select the profile
when building the web app or MAME.

## Profile format

```json
{
  "id": "gng",
  "title": "Ghosts 'n Goblins",
  "driver": "gng",
  "rom": {
    "file": "gng.zip",
    "embedPath": "/roms/gng.zip"
  },
  "build": {
    "subtarget": "gng_web",
    "sources": ["src/mame/capcom/gng.cpp"],
    "outputJs": "gng_web.js"
  },
  "ui": {
    "aspectRatio": "4:3",
    "controls": [
      { "label": "Up", "mameKey": "ArrowUp", "defaultKey": "ArrowUp" }
    ]
  }
}
```

- `id` is the profile's filename and MAME driver short name.
- `title` is shown in the web app; `driver` is passed to MAME at startup.
- `rom.file` is relative to the repository's `roms/` directory, and
  `rom.embedPath` is its absolute path in Emscripten's virtual filesystem.
- `build.subtarget` is the MAME web subtarget, `build.sources` contains source
  paths relative to the repository root, and `build.outputJs` is the generated
  MAME JavaScript filename loaded by the app.
- `ui.aspectRatio` is written as `width:height`. Each control provides its
  visible `label`, MAME key, and initial browser key.

The validator checks the profile fields, ROM and source files, and that the
driver is registered in one of the listed source files:

```bash
cd web
npm run validate-profiles
node scripts/validate-game-profile.js gng
```

Build the web app for GNG with `npm run build`, or for Snow Bros with
`npm run build-snowbros`. The MAME build scripts accept the profile ID:

```bash
./build.sh gng
./build.sh snowbros
```

`build_snowbros.sh` remains as a compatibility wrapper for `build.sh snowbros`.
