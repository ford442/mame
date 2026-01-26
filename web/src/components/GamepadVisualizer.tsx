import { useEffect, useRef, useState } from 'react';

// Tailwind CSS classes are available via CDN in index.html

const GamepadVisualizer = () => {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
  const reqRef = useRef<number>();

  useEffect(() => {
    const updateLoop = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      // Convert to array and filter/copy to state
      setGamepads(Array.from(gps));
      reqRef.current = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 md:p-8 font-mono text-slate-200">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div>
             <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Controller Debugger
             </h1>
             <p className="text-slate-400 text-xs md:text-sm mt-1">Verify inputs for P1 (Index 0) and P2 (Index 2). Index 1 is usually ignored.</p>
          </div>
          <div className="text-xs text-slate-500 hidden md:block">
            Detected: {gamepads.filter(g => g).length} Devices
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gamepads.map((gp, i) => {
                if (!gp) return null;
                // Highlight P1 and P2 indices
                const isP1 = gp.index === 0;
                const isP2 = gp.index === 2;
                const isGhost = gp.index === 1;

                let statusColor = "border-slate-700";
                if (isP1) statusColor = "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                if (isP2) statusColor = "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
                if (isGhost) statusColor = "border-red-900/50 opacity-60";

                return (
                    <div key={gp.index} className={`bg-slate-800 p-6 rounded-xl border-2 ${statusColor} relative transition-all duration-300`}>
                        <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                             <div className="w-full">
                                <h2 className="text-lg md:text-xl font-bold truncate pr-4 text-white" title={gp.id}>{gp.id.split('(')[0]}</h2>
                                <div className="flex gap-2 mt-2 text-xs flex-wrap">
                                    <span className="bg-slate-900 px-2 py-1 rounded text-cyan-400 font-bold">IDX: {gp.index}</span>
                                    {isP1 && <span className="bg-green-900 text-green-400 px-2 py-1 rounded font-bold">PLAYER 1</span>}
                                    {isP2 && <span className="bg-blue-900 text-blue-400 px-2 py-1 rounded font-bold">PLAYER 2</span>}
                                    {isGhost && <span className="bg-red-900 text-red-400 px-2 py-1 rounded font-bold">IGNORED</span>}
                                    <span className="bg-slate-900 px-2 py-1 rounded text-slate-400">{gp.buttons.length} BTNS</span>
                                    <span className="bg-slate-900 px-2 py-1 rounded text-slate-400">{gp.axes.length} AXES</span>
                                </div>
                             </div>
                        </div>

                        {/* Visuals */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* Sticks */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Axes</h3>
                                <div className="space-y-6">
                                    {/* Left Stick (0,1) */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-24 h-24 bg-slate-900 rounded-full border border-slate-700 shadow-inner">
                                            <div
                                                className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] transition-transform duration-75"
                                                style={{
                                                    left: `${50 + (gp.axes[0] || 0) * 50}%`,
                                                    top: `${50 + (gp.axes[1] || 0) * 50}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-2 font-mono">
                                            L: {(gp.axes[0] || 0).toFixed(2)}, {(gp.axes[1] || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Right Stick (2,3) - Only if exists */}
                                    {gp.axes.length > 2 && (
                                        <div className="flex flex-col items-center">
                                             <div className="relative w-24 h-24 bg-slate-900 rounded-full border border-slate-700 shadow-inner">
                                                <div
                                                    className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] transition-transform duration-75"
                                                    style={{
                                                        left: `${50 + (gp.axes[2] || 0) * 50}%`,
                                                        top: `${50 + (gp.axes[3] || 0) * 50}%`,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-2 font-mono">
                                                R: {(gp.axes[2] || 0).toFixed(2)}, {(gp.axes[3] || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Buttons</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {gp.buttons.map((btn, idx) => (
                                        <div
                                            key={idx}
                                            className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all duration-75
                                                ${btn.pressed ? 'bg-green-500 text-green-900 shadow-[0_0_10px_#4ade80] scale-95' : 'bg-slate-700 text-slate-400 border border-slate-600'}
                                            `}
                                        >
                                            {idx}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {gamepads.every(gp => !gp) && (
                 <div className="col-span-1 md:col-span-2 text-center py-20 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                    <div className="text-4xl mb-4">🎮</div>
                    <p className="text-slate-300 font-bold">No controllers detected.</p>
                    <p className="text-xs text-slate-500 mt-2">Plug in a USB gamepad and press a button to wake it up.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GamepadVisualizer;
