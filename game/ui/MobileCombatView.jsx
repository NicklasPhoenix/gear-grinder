import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';
import GameRenderer from '../renderer/GameRenderer';

/**
 * MobileCombatView - Uses the real GameRenderer in a compact mobile layout
 *
 * The actual PIXI.js game canvas with sprites, backgrounds, and animations
 * is rendered here - just sized for mobile.
 */
export default function MobileCombatView({ currentZone, state, gameManager }) {
    const isPaused = state?.combatPaused || false;

    const handleToggleCombat = () => {
        if (gameManager) {
            gameManager.toggleCombat();
        }
    };

    const handleSpeedChange = (speed) => {
        if (gameManager) {
            gameManager.setSpeed(speed);
        }
    };

    // Get current speed
    const [currentSpeed, setCurrentSpeed] = useState(1);
    useEffect(() => {
        if (!gameManager) return;
        return gameManager.subscribeSpeed(setCurrentSpeed);
    }, [gameManager]);

    return (
        <div className="bg-slate-950 border-b border-slate-800">
            {/* Header: Zone + Currency */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-slate-900/80">
                <div className="flex items-center gap-2">
                    {currentZone?.isBoss && (
                        <span className="text-red-500 text-lg">🔥</span>
                    )}
                    <span className={`font-bold text-sm ${currentZone?.isBoss ? 'text-red-400' : 'text-white'}`}>
                        {currentZone?.name?.replace(/[^a-zA-Z\s]/g, '').trim() || 'Unknown'}
                    </span>
                    {currentZone?.isBoss && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                            BOSS
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <MaterialIcon type="gold" size={16} />
                        <span className="text-slate-200 text-sm font-bold">
                            {formatNumber(state?.gold || 0)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MaterialIcon type="enhanceStone" size={16} />
                        <span className="text-blue-400 text-sm font-bold">
                            {formatNumber(state?.enhanceStone || 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Game Canvas - The REAL renderer with sprites and animations */}
            <div className="relative h-44 w-full overflow-hidden">
                <GameRenderer />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/50 bg-slate-900/80">
                {/* Rest/Fight Toggle */}
                <button
                    onClick={handleToggleCombat}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                        isPaused
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600/80 text-white'
                    }`}
                >
                    {isPaused ? (
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Fight
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                            Rest
                        </>
                    )}
                </button>

                {/* Speed Controls */}
                <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-xs mr-1">Speed:</span>
                    {[1, 2, 5].map(speed => (
                        <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all active:scale-95 ${
                                currentSpeed === speed
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                            }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
