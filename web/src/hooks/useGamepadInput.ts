import { useEffect, useRef } from 'react';

// Configuration for mapping
const AXIS_THRESHOLD = 0.5;

interface GamepadMapping {
  buttons: { [index: number]: string };
  axes: {
    [index: number]: {
      negative?: string;
      positive?: string;
    };
  };
}

// Player 1 Mapping (Index 0)
// Matches App.tsx defaults: Attack='k', Jump='l', Start='1', Coin='5'
const P1_MAPPING: GamepadMapping = {
  buttons: {
    0: 'k', // Attack / Ctrl
    1: 'l', // Jump / Alt
    8: '5', // Coin
    9: '1', // Start
  },
  axes: {
    0: { negative: 'ArrowLeft', positive: 'ArrowRight' },
    1: { negative: 'ArrowUp', positive: 'ArrowDown' },
  },
};

// Player 2 Mapping (Index 2)
// Matches Standard MAME P2 defaults: Arrows=R/F/D/G, Buttons=A/S/Q/W
const P2_MAPPING: GamepadMapping = {
  buttons: {
    0: 'a',
    1: 's',
    2: 'q',
    3: 'w',
    8: '6', // Coin 2
    9: '2', // Start 2
  },
  axes: {
    0: { negative: 'd', positive: 'g' }, // Left/Right
    1: { negative: 'r', positive: 'f' }, // Up/Down
  },
};

const MAPPINGS: { [index: number]: GamepadMapping } = {
  0: P1_MAPPING,
  2: P2_MAPPING,
};

const useGamepadInput = (enabled: boolean = true) => {
  const reqRef = useRef<number>();

  // Store previous state to detect changes
  // Structure: { [gamepadIndex]: { buttons: boolean[], axesKeys: { [key: string]: boolean } } }
  const stateRef = useRef<{
    [index: number]: {
      buttons: boolean[];
      axesKeys: { [key: string]: boolean };
    };
  }>({});

  useEffect(() => {
    if (!enabled) return;

    const simulateKey = (key: string, type: 'keydown' | 'keyup') => {
      // Dispatch event to window so KeyboardHandler can catch it
      window.dispatchEvent(new KeyboardEvent(type, { key: key, bubbles: true }));
    };

    const updateLoop = () => {
      // Standard HTML5 Gamepad API
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        // Strict filtering: Only allow indices 0 and 2 (as requested)
        if (gp.index !== 0 && gp.index !== 2) continue;

        const mapping = MAPPINGS[gp.index];
        if (!mapping) continue;

        // Initialize state for this gamepad if it's new
        if (!stateRef.current[gp.index]) {
          stateRef.current[gp.index] = {
            buttons: new Array(gp.buttons.length).fill(false),
            axesKeys: {},
          };
        }
        const state = stateRef.current[gp.index];

        // --- 1. Process Buttons ---
        gp.buttons.forEach((btn, btnIdx) => {
          const isPressed = btn.pressed;
          const wasPressed = state.buttons[btnIdx];
          const key = mapping.buttons[btnIdx];

          if (key) {
            if (isPressed && !wasPressed) {
              simulateKey(key, 'keydown');
            } else if (!isPressed && wasPressed) {
              simulateKey(key, 'keyup');
            }
          }
          state.buttons[btnIdx] = isPressed;
        });

        // --- 2. Process Axes ---
        // Treat axes as digital directional keys
        gp.axes.forEach((val, axisIdx) => {
          const axisMap = mapping.axes[axisIdx];
          if (!axisMap) return;

          // Check Negative Direction
          if (axisMap.negative) {
            const key = axisMap.negative;
            const isActive = val < -AXIS_THRESHOLD;
            const wasActive = state.axesKeys[key] || false;

            if (isActive && !wasActive) {
              simulateKey(key, 'keydown');
            } else if (!isActive && wasActive) {
              simulateKey(key, 'keyup');
            }
            state.axesKeys[key] = isActive;
          }

          // Check Positive Direction
          if (axisMap.positive) {
            const key = axisMap.positive;
            const isActive = val > AXIS_THRESHOLD;
            const wasActive = state.axesKeys[key] || false;

            if (isActive && !wasActive) {
              simulateKey(key, 'keydown');
            } else if (!isActive && wasActive) {
              simulateKey(key, 'keyup');
            }
            state.axesKeys[key] = isActive;
          }
        });
      }

      reqRef.current = requestAnimationFrame(updateLoop);
    };

    // Auto-start polling when devices are connected
    const onConnected = () => {
        if (!reqRef.current) updateLoop();
    };

    window.addEventListener('gamepadconnected', onConnected);

    // Also start immediately
    updateLoop();

    return () => {
      window.removeEventListener('gamepadconnected', onConnected);
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      reqRef.current = undefined;
    };
  }, [enabled]);
};

export default useGamepadInput;
