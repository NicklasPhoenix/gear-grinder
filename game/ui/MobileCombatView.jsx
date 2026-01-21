import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/format';
import { MaterialIcon, BossStoneIcon } from './MaterialIcons';
import { BOSS_STONES } from '../data/items';
import GameRenderer from '../renderer/GameRenderer';

/**
 * MobileCombatView - Uses the real GameRenderer in a compact mobile layout
 *
 * The actual PIXI.js game canvas with sprites, backgrounds, and animations
 * is rendered here - just sized for mobile.
 */
export default function MobileCombatView({ currentZone, state, gameManager }) {
    const isPaused = state?.combatPaused || false;
    const [showMaterials, setShowMaterials] = useState(false);

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

    // Get boss stones that have > 0 count
    const bossStones = state?.bossStones || {};
    const ownedBossStones = Object.entries(bossStones).filter(([_, count]) => count > 0);

    return (
        <div className="bg-slate-950 border-b border-slate-800">
            {/* Header: Zone + Currency */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-slate-900/80">
                <div className="flex items-center gap-2">
                    {currentZone?.isBoss && (
                        <img src="/assets/ui-icons/fire-shield-boss.png" alt="" className="w-5 h-5" />
                    )}
                    <span className={`font-bold text-sm ${currentZone?.isBoss ? 'text-red-400' : 'text-white'}`}>
                        {currentZone?.name || 'Unknown'}
                    </span>
                    {currentZone?.isBoss && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                            BOSS
                        </span>
                    )}
                </div>
                {/* Tappable currency display */}
                <button
                    onClick={() => setShowMaterials(!showMaterials)}
                    className="flex items-center gap-3 active:scale-95 transition-transform"
                >
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
                    <svg
                        className={`w-4 h-4 text-slate-500 transition-transform ${showMaterials ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Expandable Materials Panel */}
            {showMaterials && (
                <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800/50 space-y-2">
                    {/* Main currencies */}
                    <div className="grid grid-cols-2 gap-2">
                        <MaterialRow icon="gold" label="Silver" value={state?.gold || 0} color="text-slate-300" />
                        <MaterialRow icon="enhanceStone" label="E. Stones" value={state?.enhanceStone || 0} color="text-blue-400" />
                        <MaterialRow icon="blessedOrb" label="Blessed Orbs" value={state?.blessedOrb || 0} color="text-purple-400" />
                        <MaterialRow icon="celestialShard" label="Celestial Shards" value={state?.celestialShard || 0} color="text-pink-400" />
                        <MaterialRow icon="prestigeStone" label="Prestige Stones" value={state?.prestigeStones || 0} color="text-fuchsia-400" />
                    </div>

                    {/* Boss Stones - only show if player has any */}
                    {ownedBossStones.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/50">
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Boss Stones</div>
                            <div className="flex flex-wrap gap-2">
                                {ownedBossStones.map(([bossKey, count]) => (
                                    <div key={bossKey} className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded">
                                        <BossStoneIcon bossSet={bossKey} size={14} />
                                        <span className="text-xs text-slate-300 capitalize">{bossKey}</span>
                                        <span className="text-xs text-slate-400 font-mono">x{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

/**
 * Helper component for material rows in the expanded panel
 */
function MaterialRow({ icon, label, value, color }) {
    return (
        <div className="flex items-center justify-between bg-slate-800/30 px-2 py-1.5 rounded">
            <div className="flex items-center gap-2">
                <MaterialIcon type={icon} size={16} />
                <span className="text-xs text-slate-400">{label}</span>
            </div>
            <span className={`text-sm font-bold font-mono ${color}`}>
                {formatNumber(value)}
            </span>
        </div>
    );
}
