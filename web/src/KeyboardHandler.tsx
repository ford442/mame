import { useEffect } from 'react';

// SDL Scancode constants (from SDL2)
const SDL_SCANCODES: { [key: string]: number } = {
  // Letters
  A: 4, B: 5, C: 6, D: 7, E: 8, F: 9, G: 10, H: 11,
  I: 12, J: 13, K: 14, L: 15, M: 16, N: 17, O: 18, P: 19,
  Q: 20, R: 21, S: 22, T: 23, U: 24, V: 25, W: 26, X: 27,
  Y: 28, Z: 29,
  
  // Numbers
  '1': 30, '2': 31, '3': 32, '4': 33, '5': 34,
  '6': 35, '7': 36, '8': 37, '9': 38, '0': 39,
  
  // Arrow keys
  ArrowUp: 82,
  ArrowDown: 81,
  ArrowRight: 79,
  ArrowLeft: 80,
  
  // Special keys
  ' ': 44,      // Space
  Enter: 40,
  Escape: 41,
  Shift: 225,   // Right Shift
  Control: 224, // Left Control
  Alt: 226,     // Left Alt
};

// Helper function to get SDL scancode from browser key
const getScancode = (key: string): number | null => {
  // Convert single letter keys to uppercase
  const upperKey = /^[a-zA-Z0-9]$/.test(key) ? key.toUpperCase() : key;
  return SDL_SCANCODES[upperKey] ?? null;
};

// Game control keys that should prevent default browser behavior
const GAME_KEYS = ['w', 'a', 's', 'd', 'k', 'l', '1', '5', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

// Helper function to prevent default for game control keys
const shouldPreventDefault = (key: string): boolean => {
  return GAME_KEYS.includes(key.toLowerCase());
};

interface KeyboardHandlerProps {
  enabled: boolean;
}

const KeyboardHandler = ({ enabled }: KeyboardHandlerProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser behavior for game keys
      if (shouldPreventDefault(event.key)) {
        event.preventDefault();
      }

      const scancode = getScancode(event.key);
      if (scancode !== null && window.JSMAME?.sdl_sendkeyboardkey) {
        window.JSMAME.sdl_sendkeyboardkey(0x80, scancode); // 0x80 = key pressed
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Prevent default browser behavior for game keys (consistency with keydown)
      if (shouldPreventDefault(event.key)) {
        event.preventDefault();
      }

      const scancode = getScancode(event.key);
      if (scancode !== null && window.JSMAME?.sdl_sendkeyboardkey) {
        window.JSMAME.sdl_sendkeyboardkey(0x00, scancode); // 0x00 = key released
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  return null; // This component doesn't render anything
};

export default KeyboardHandler;
