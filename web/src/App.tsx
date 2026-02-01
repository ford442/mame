import { useEffect, useRef, useState, useMemo } from 'react';
import './App.css';
import KeyboardHandler, { KeyMapping } from './KeyboardHandler';
import useGamepadInput from './hooks/useGamepadInput';
import GamepadVisualizer from './components/GamepadVisualizer';

interface MAMEModuleType {
  canvas: HTMLCanvasElement | null;
  onRuntimeInitialized?: () => void;
  arguments?: string[];
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}

interface JSMAMEType {
  sdl_sendkeyboardkey?: (state: number, scancode: number) => void;
  soft_reset?: () => void;
  hard_reset?: () => void;
}

declare global {
  interface Window {
    Module: MAMEModuleType;
    JSMAME?: JSMAMEType;
  }
}

// Configuration - path to the compiled MAME JavaScript file
const MAME_JS_PATH = process.env.REACT_APP_MAME_JS_PATH || 'gng_web.js';

// Default Controls for GNG
const CONTROLS = [
  { label: 'Up', mameKey: 'ArrowUp', defaultKey: 'ArrowUp' },
  { label: 'Down', mameKey: 'ArrowDown', defaultKey: 'ArrowDown' },
  { label: 'Left', mameKey: 'ArrowLeft', defaultKey: 'ArrowLeft' },
  { label: 'Right', mameKey: 'ArrowRight', defaultKey: 'ArrowRight' },
  { label: 'Attack', mameKey: 'k', defaultKey: 'k' },
  { label: 'Jump', mameKey: 'l', defaultKey: 'l' },
  { label: 'Start', mameKey: '1', defaultKey: '1' },
  { label: 'Coin', mameKey: '5', defaultKey: '5' },
];

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config State
  const [userKeys, setUserKeys] = useState<{ [mameKey: string]: string }>({});
  const [listeningFor, setListeningFor] = useState<string | null>(null);
  const [startFullscreen, setStartFullscreen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Initialize gamepad support
  useGamepadInput(true);

  // Initialize default keys
  useEffect(() => {
    const defaults: { [key: string]: string } = {};
    CONTROLS.forEach(c => defaults[c.mameKey] = c.defaultKey);
    setUserKeys(defaults);
  }, []);

  // Compute keyMappings for KeyboardHandler (Physical -> MAME)
  const keyMappings = useMemo(() => {
    const map: KeyMapping = {};
    Object.entries(userKeys).forEach(([mameKey, physicalKey]) => {
      map[physicalKey] = mameKey;
    });
    return map;
  }, [userKeys]);

  // Resize handler for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!gameStarted || !canvas || !canvas.parentElement) return;

    const container = canvas.parentElement;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const parent = canvas.parentElement;
        const maxWidth = parent.clientWidth;
        const maxHeight = parent.clientHeight;

        let targetWidth = maxWidth;
        let targetHeight = targetWidth * 3 / 4;

        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = targetHeight * 4 / 3;
        }

        // Apply calculated dimensions to style (for display)
        canvas.style.width = `${targetWidth}px`;
        canvas.style.height = `${targetHeight}px`;

        // Match buffer size to display size (1:1 pixel mapping)
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
    };

    // Initial resize
    resizeCanvas();

    // Watch for size changes on the CONTAINER
    const resizeObserver = new ResizeObserver(() => {
        // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded" error
        requestAnimationFrame(() => {
            resizeCanvas();
        });
    });

    if (canvasRef.current && canvasRef.current.parentElement) {
        resizeObserver.observe(canvasRef.current.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [gameStarted]);

  // Load MAME when game starts
  useEffect(() => {
    if (!gameStarted) return;

    if (canvasRef.current) {
      window.Module = {
        canvas: canvasRef.current,
        arguments: [
            'gng',
            '-rompath', '/roms',
            '-window',
            '-verbose',
            '-skip_gameinfo',
            '-samplerate', '48000',
            '-audio_latency', '1'
        ],
        print: (text: string) => console.log(text),
        printErr: (text: string) => console.error(text),
        onRuntimeInitialized: () => {
          console.log('MAME Runtime Initialized');
          setIsLoading(false);
          setIsReady(true);
        },
      };

      // Load the MAME JavaScript file
      const script = document.createElement('script');
      script.src = MAME_JS_PATH;
      script.async = true;
      script.onload = () => {
        console.log('MAME script loaded');
      };
      script.onerror = () => {
        setError('Failed to load MAME');
        setIsLoading(false);
      };
      document.body.appendChild(script);
      scriptRef.current = script;

      // Global error handler for runtime crashes
      const originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('MAME Error:', message);
        setError(`Error: ${message}`);
        if (originalOnError) originalOnError(message, source, lineno, colno, error);
        return false;
      };

      return () => {
        // Clean up the Module to prevent issues on hot reloads
        window.Module = { canvas: null };
        if (scriptRef.current && document.body.contains(scriptRef.current)) {
          document.body.removeChild(scriptRef.current);
        }
        window.onerror = originalOnError;
      };
    }
  }, [gameStarted]);

  // Handle Key Binding
  useEffect(() => {
    if (!listeningFor) return;

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      // Only accept 'valid' keys (not just modifiers unless intentional, but let's allow everything for now)
      setUserKeys(prev => ({ ...prev, [listeningFor]: e.key }));
      setListeningFor(null);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listeningFor]);

  const handleStartGame = () => {
    if (startFullscreen && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen failed", e));
    }
    setGameStarted(true);
  };

  const handleSoftReset = () => {
    if (window.JSMAME && window.JSMAME.soft_reset) {
      window.JSMAME.soft_reset();
    }
  };

  const handleHardReset = () => {
    if (window.JSMAME && window.JSMAME.hard_reset) {
      window.JSMAME.hard_reset();
    }
  };

  return (
    <div className="app">
      <KeyboardHandler enabled={isReady} keyMappings={keyMappings} />
      {showDebug && <GamepadVisualizer />}
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>MAME Web - Ghosts 'n Goblins</h1>
            <button
                onClick={() => setShowDebug(!showDebug)}
                style={{ padding: '0.5rem', fontSize: '0.9rem', backgroundColor: '#4b5563' }}
            >
                {showDebug ? 'Close Debugger' : 'Controller Setup'}
            </button>
        </div>
        <div className="controls">
          {isReady && (
            <>
              <button onClick={handleSoftReset}>Soft Reset</button>
              <button onClick={handleHardReset}>Hard Reset</button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        {!gameStarted ? (
            <div className="config-container">
                <h2>Game Configuration</h2>
                <div className="key-config">
                    <h3>Controls</h3>
                    <div className="key-grid">
                        {CONTROLS.map(control => (
                            <div key={control.mameKey} className="key-row">
                                <span className="key-label">{control.label}:</span>
                                <button
                                    className={`key-button ${listeningFor === control.mameKey ? 'listening' : ''}`}
                                    onClick={() => setListeningFor(control.mameKey)}
                                >
                                    {listeningFor === control.mameKey ? 'Press any key...' : userKeys[control.mameKey] || '...'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="start-options">
                    <label>
                        <input
                            type="checkbox"
                            checked={startFullscreen}
                            onChange={e => setStartFullscreen(e.target.checked)}
                        />
                        Start in Fullscreen
                    </label>
                </div>

                <button className="start-button" onClick={handleStartGame}>Start Game</button>
            </div>
        ) : (
            <>
                {isLoading && <div className="loading">Loading MAME...</div>}
                {error && <div className="error">{error}</div>}
                <div className="canvas-container">
                  <canvas ref={canvasRef} id="canvas" onContextMenu={e => e.preventDefault()} />
                </div>
            </>
        )}
      </main>
      <footer className="app-footer">
        <p>MAME - Multiple Arcade Machine Emulator</p>
      </footer>
    </div>
  );
};

export default App;
