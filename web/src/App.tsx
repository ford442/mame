import React, { useEffect, useRef, useState } from 'react';
import './App.css';

interface MAMEModuleType {
  canvas: HTMLCanvasElement | null;
  onRuntimeInitialized?: () => void;
}

declare global {
  interface Window {
    Module: MAMEModuleType;
    JSMAME?: any;
  }
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      script.src = 'mame.js'; // This will be the compiled MAME JS file
      script.async = true;
      script.onload = () => {
        console.log('MAME script loaded');
      };
      script.onerror = () => {
        setError('Failed to load MAME');
        setIsLoading(false);
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>MAME Web</h1>
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
        {isLoading && <div className="loading">Loading MAME...</div>}
        {error && <div className="error">{error}</div>}
        <div className="canvas-container">
          <canvas ref={canvasRef} id="canvas" />
        </div>
      </main>
      <footer className="app-footer">
        <p>MAME - Multiple Arcade Machine Emulator</p>
      </footer>
    </div>
  );
};

export default App;
