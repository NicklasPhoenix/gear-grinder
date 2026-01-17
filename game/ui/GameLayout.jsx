import React from 'react';
import GameRenderer from '../renderer/GameRenderer';
import { useGame } from '../context/GameContext';

export default function GameLayout() {
    const { state } = useGame();

    if (!state) return null;

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
            {/* Game Viewport (PixiJS) */}
            <div className="relative z-0">
                <GameRenderer />
            </div>

            {/* UI Overlay (HUD) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4">
                {/* Top HUD: Zone Name & Resources */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-slate-900/80 border-2 border-slate-700 p-2 rounded text-white font-rajdhani">
                        <h1 className="text-xl text-yellow-500 font-press-start text-xs uppercase mb-1">Zone {state.currentZone}</h1>
                        <div className="text-lg font-bold">Zone Name Placeholder</div>
                    </div>

                    <div className="bg-slate-900/80 border-2 border-slate-700 p-2 rounded text-white flex gap-4">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <span>🪙</span>
                            <span>{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                            <span>⛏️</span>
                            <span>{state.ore}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom HUD: Player Stats & Menu */}
                <div className="flex justify-center pointer-events-auto">
                    <div className="bg-slate-900/80 border-2 border-slate-700 p-4 rounded-t-lg text-white w-[800px] h-[200px]">
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Inventory</button>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Stats</button>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Skills</button>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Zone</button>
                        </div>
                        <div className="mt-4 text-gray-400 text-sm">
                            {/* Placeholder for tab content */}
                            Select a menu... (UI Migration in progress)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
