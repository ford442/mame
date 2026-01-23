import { useEffect, useRef, useState } from 'react';
import './App.css';
import KeyboardHandler from './KeyboardHandler';
import { joy } from '../1joy/index';

interface MAMEModuleType {
  canvas: HTMLCanvasElement | null;
  onRuntimeInitialized?: () => void;
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
const MAME_JS_PATH = process.env.REACT_APP_MAME_JS_PATH || 'mame.js';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setup Emscripten Module
    if (canvasRef.current) {
      window.Module = {
        canvas: canvasRef.current,
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

      return () => {
        // Clean up the Module to prevent issues on hot reloads
        window.Module = { canvas: null };
        if (scriptRef.current && document.body.contains(scriptRef.current)) {
          document.body.removeChild(scriptRef.current);
        }
      };
    }
  }, []);

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

  const handle1joy = () => {
    joy();
    console.log('1joy button clicked');
  };

  return (
    <div className="app">
      <KeyboardHandler enabled={isReady} />
      <header className="app-header">
        <h1>MAME Web</h1>
        <div className="controls">
          {isReady && (
            <>
              <button onClick={handleSoftReset}>Soft Reset</button>
              <button onClick={handleHardReset}>Hard Reset</button>
              <button onClick={handle1joy}>1joy</button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        {isLoading && <div className="loading">Loading MAME...</div>}
        {error && <div className="error">{error}</div>}
        <div className="canvas-container">
          <canvas ref={canvasRef} id="canvas" />
        </div>
        {isReady && (
          <div className="keyboard-info" role="complementary" aria-label="Game Controls">
            <h3>Controls (Ghosts n Goblins):</h3>
            <dl>
              <dt>Movement:</dt>
              <dd>W/A/S/D or Arrow Keys</dd>
              <dt>Attack:</dt>
              <dd>K</dd>
              <dt>Jump:</dt>
              <dd>L</dd>
              <dt>Start:</dt>
              <dd>5</dd>
              <dt>Coin:</dt>
              <dd>1</dd>
            </dl>
          </div>
        )}
      </main>
      <footer className="app-footer">
        <p>MAME - Multiple Arcade Machine Emulator</p>
      </footer>
    </div>
  );
};

export default App;

