# Keyboard Controls for MAME Web

This document describes the keyboard integration for playing arcade games in MAME Web.

## Overview

The keyboard handler maps browser keyboard events to MAME's SDL keyboard input system, allowing you to play arcade games using your keyboard.

## Implementation

### KeyboardHandler Component

The `KeyboardHandler.tsx` component:
- Listens for browser `keydown` and `keyup` events
- Converts JavaScript KeyboardEvent keys to SDL scancodes
- Sends keyboard events to MAME via `JSMAME.sdl_sendkeyboardkey()`

### SDL Keyboard Events

MAME uses SDL scancodes (not keycodes) for keyboard input. The handler maps common keys:

```typescript
// Key states
0x80 = Key pressed/down
0x00 = Key released/up

// Example scancodes
SDL_SCANCODE_W = 26
SDL_SCANCODE_A = 4
SDL_SCANCODE_S = 22
SDL_SCANCODE_D = 7
SDL_SCANCODE_K = 14
SDL_SCANCODE_L = 15
```

## Ghosts n Goblins Controls

| Action | Key | Alternative |
|--------|-----|-------------|
| Move Up | W | Arrow Up |
| Move Down | S | Arrow Down |
| Move Left | A | Arrow Left |
| Move Right | D | Arrow Right |
| Attack (Button 1) | K | - |
| Jump (Button 2) | L | - |
| Insert Coin | 1 | - |
| Start Game | 5 | - |

## Technical Details

### How It Works

1. **Browser Events**: The component attaches global `keydown`/`keyup` listeners
2. **Scancode Mapping**: JavaScript key strings are mapped to SDL scancode integers
3. **SDL Communication**: The `JSMAME.sdl_sendkeyboardkey()` function sends events to MAME
4. **Default Prevention**: Game control keys prevent default browser behaviors (e.g., arrow key scrolling)

### JSMAME Interface

The MAME Emscripten build exposes keyboard functionality via:

```javascript
JSMAME.sdl_sendkeyboardkey = Module.cwrap('SDL_SendKeyboardKey', '', ['number', 'number']);
```

### TypeScript Types

```typescript
interface JSMAMEType {
  sdl_sendkeyboardkey?: (state: number, scancode: number) => void;
  soft_reset?: () => void;
  hard_reset?: () => void;
}
```

## Usage

The keyboard handler is automatically enabled when MAME is ready:

```tsx
<KeyboardHandler enabled={isReady} />
```

## Customization

To add support for different games or custom key mappings:

1. Edit the `SDL_SCANCODES` mapping in `KeyboardHandler.tsx`
2. Update the `shouldPreventDefault()` function to include new game keys
3. Modify the controls display in `App.tsx`

## References

- [SDL2 Scancodes](https://wiki.libsdl.org/SDL2/SDL_Scancode)
- [MAME Input System](https://docs.mamedev.org/usingmame/ui.html)
- [Emscripten Integration](../INTEGRATION.md)
