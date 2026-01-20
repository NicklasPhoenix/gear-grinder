import React, { useState, useEffect, useRef } from 'react';
import { useGame, useHpState } from '../context/GameContext';
import { formatNumber, formatWithCommas } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';

/**
 * MobileCombatView - Compact horizontal battle scene for mobile portrait
 *
 * Layout:
 * ┌─────────────────────────────────┐
 * │ Zone Name              Currency │
 * ├─────────────────────────────────┤
 * │  [HERO]              [ENEMY]    │
 * │  ▓▓▓▓▓▓              ▓▓▓▓░░░░   │
 * │  850/1K              2.8K/5.5K  │
 * ├─────────────────────────────────┤
 * │ [Rest/Fight]    [1x] [2x] [5x] │
 * └─────────────────────────────────┘
 */
export default function MobileCombatView({ currentZone, state, gameManager }) {
    const hpState = useHpState();
    const [floatingTexts, setFloatingTexts] = useState([]);
    const floatingIdRef = useRef(0);

    // Subscribe to floating text events
    useEffect(() => {
        if (!gameManager) return;

        const unsubscribe = gameManager.on('floatingText', ({ text, type, target }) => {
            const id = floatingIdRef.current++;
            const isPlayer = target === 'player';

            setFloatingTexts(prev => [...prev, {
                id,
                text,
                type,
                isPlayer,
                startTime: Date.now()
            }]);

            // Remove after animation
            setTimeout(() => {
                setFloatingTexts(prev => prev.filter(t => t.id !== id));
            }, 1000);
        });

        return unsubscribe;
    }, [gameManager]);

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
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
            {/* Header: Zone + Currency */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50">
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

            {/* Battle Area */}
            <div className="relative h-32 flex items-center justify-around px-4">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-transparent" />

                {/* Hero Side */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        {/* Hero sprite placeholder - will use actual sprite later */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-700/30 rounded-lg border-2 border-blue-500/50 flex items-center justify-center">
                            <span className="text-3xl">⚔️</span>
                        </div>
                        {/* Hit flash overlay */}
                        {floatingTexts.some(t => t.isPlayer && t.type === 'playerDmg') && (
                            <div className="absolute inset-0 bg-red-500/50 rounded-lg animate-ping" />
                        )}
                    </div>
                    {/* Player HP Bar */}
                    <div className="mt-2 w-20">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-200"
                                style={{ width: `${Math.min(100, (hpState.playerHp / hpState.playerMaxHp) * 100)}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-center text-slate-400 mt-0.5">
                            {formatNumber(hpState.playerHp)}/{formatNumber(hpState.playerMaxHp)}
                        </div>
                    </div>
                    {/* Player floating damage */}
                    {floatingTexts.filter(t => t.isPlayer).map(t => (
                        <FloatingText key={t.id} text={t.text} type={t.type} />
                    ))}
                </div>

                {/* VS indicator */}
                <div className="relative z-10 text-slate-600 font-bold text-lg">
                    VS
                </div>

                {/* Enemy Side */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        {/* Enemy sprite placeholder */}
                        <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${
                            currentZone?.isBoss
                                ? 'bg-gradient-to-br from-red-500/30 to-red-700/30 border-red-500/50'
                                : 'bg-gradient-to-br from-slate-500/30 to-slate-700/30 border-slate-500/50'
                        }`}>
                            <span className="text-3xl">{currentZone?.isBoss ? '👹' : '👾'}</span>
                        </div>
                        {/* Hit flash overlay */}
                        {floatingTexts.some(t => !t.isPlayer && (t.type === 'damage' || t.type === 'crit')) && (
                            <div className="absolute inset-0 bg-yellow-500/50 rounded-lg animate-ping" />
                        )}
                    </div>
                    {/* Enemy HP Bar */}
                    <div className="mt-2 w-20">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-200 ${
                                    currentZone?.isBoss
                                        ? 'bg-gradient-to-r from-red-600 to-red-400'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-400'
                                }`}
                                style={{ width: `${Math.min(100, (hpState.enemyHp / hpState.enemyMaxHp) * 100)}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-center text-slate-400 mt-0.5">
                            {formatNumber(hpState.enemyHp)}/{formatNumber(hpState.enemyMaxHp)}
                        </div>
                    </div>
                    {/* Enemy floating damage */}
                    {floatingTexts.filter(t => !t.isPlayer).map(t => (
                        <FloatingText key={t.id} text={t.text} type={t.type} />
                    ))}
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/50">
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
 * Floating damage text animation
 */
function FloatingText({ text, type }) {
    const colorClass = {
        damage: 'text-yellow-400',
        crit: 'text-orange-400 font-bold',
        playerDmg: 'text-red-400',
        heal: 'text-green-400',
        xp: 'text-purple-400',
        gold: 'text-yellow-300',
    }[type] || 'text-white';

    return (
        <div
            className={`absolute -top-6 left-1/2 -translate-x-1/2 ${colorClass} text-sm font-bold pointer-events-none animate-float-up`}
            style={{
                animation: 'floatUp 1s ease-out forwards',
            }}
        >
            {type === 'crit' && '💥'}{text}
        </div>
    );
}

// Add CSS animation via style tag (will be in global CSS later)
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
        }
    }
`;
if (typeof document !== 'undefined' && !document.getElementById('mobile-combat-styles')) {
    style.id = 'mobile-combat-styles';
    document.head.appendChild(style);
}
