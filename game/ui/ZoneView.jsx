import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ZONES, PRESTIGE_ZONES, getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, WEAPON_TYPES } from '../data/items';
import { MaterialIcon } from './MaterialIcons';
import { formatNumber } from '../utils/format';

export default function ZoneView() {
    const { state, gameManager } = useGame();
    const currentZoneRef = useRef(null);

    // Scroll to current zone on mount
    useEffect(() => {
        if (currentZoneRef.current) {
            currentZoneRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
    }, []);

    const handleTravel = (zoneId) => {
        const zone = getZoneById(zoneId);
        gameManager.setState(prev => ({
            ...prev,
            currentZone: zoneId,
            enemyHp: zone.enemyHp,
            enemyMaxHp: zone.enemyHp
        }));
    };

    const allZones = [...ZONES, ...PRESTIGE_ZONES.filter(z => (state.prestigeLevel || 0) >= (z.prestigeReq || 0))];

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Header */}
            <div className="game-panel">
                <div className="game-panel-header flex justify-between items-center">
                    <span className="text-sm">World Map</span>
                    <div className="flex items-center gap-3">
                        {/* Auto-progress toggle */}
                        <button
                            onClick={() => gameManager.toggleAutoProgress()}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold transition-all ${
                                state.autoProgress
                                    ? 'bg-green-600/40 text-green-300 hover:bg-green-600/50'
                                    : 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/50'
                            }`}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${state.autoProgress ? 'bg-green-400' : 'bg-slate-500'}`} />
                            Auto
                        </button>
                        <span className="text-sm text-slate-400">Zone {state.currentZone + 1}/{allZones.length}</span>
                    </div>
                </div>
            </div>

            {/* Zone List */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0 space-y-2">
                    {allZones.map((zone, index) => {
                        const kills = state.zoneKills?.[zone.id] || 0;
                        const prevZone = index > 0 ? allZones[index - 1] : null;
                        const nextZone = index < allZones.length - 1 ? allZones[index + 1] : null;
                        // Zone is unlocked if: it's zone 0, OR kills in previous zone >= this zone's requirement
                        const isUnlocked = zone.id === 0 ||
                            (prevZone && (state.zoneKills?.[prevZone.id] || 0) >= zone.killsRequired);
                        const isCurrent = state.currentZone === zone.id;
                        // Progress shows kills towards NEXT zone's requirement (not this zone's)
                        const nextZoneReq = nextZone?.killsRequired || 0;
                        const progress = nextZoneReq > 0 ? Math.min(100, (kills / nextZoneReq) * 100) : 100;

                        return (
                            <div
                                key={zone.id}
                                ref={isCurrent ? currentZoneRef : null}
                                onClick={() => isUnlocked && !isCurrent && handleTravel(zone.id)}
                                className={`
                                    relative rounded-lg p-3 transition-all border-2
                                    ${isCurrent
                                        ? 'bg-yellow-900/30 border-yellow-500/60'
                                        : isUnlocked
                                            ? 'bg-slate-800/40 border-slate-700/40 hover:border-blue-500/50 cursor-pointer active:scale-[0.98] active:bg-slate-700/40'
                                            : 'bg-slate-900/30 border-slate-800/30 opacity-50 cursor-not-allowed'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Zone number */}
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                        zone.isBoss ? 'bg-red-600/50 text-red-200' :
                                        isCurrent ? 'bg-yellow-600/50 text-yellow-200' :
                                        isUnlocked ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'
                                    }`}>
                                        {zone.isBoss ? '!' : zone.id + 1}
                                    </div>

                                    {/* Zone info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-base font-bold truncate ${zone.isBoss ? 'text-red-300' : 'text-white'}`}>
                                                {zone.name}
                                            </span>
                                            {zone.prestigeReq > 0 && (
                                                <span className="px-1.5 py-0.5 text-xs bg-pink-500/30 text-pink-300 rounded font-bold">P{zone.prestigeReq}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                            <span>HP:{formatNumber(zone.enemyHp)}</span>
                                            <span>DMG:{formatNumber(zone.enemyDmg)}</span>
                                            <span className="text-slate-300 font-semibold">{zone.goldMin}-{zone.goldMax}s</span>
                                        </div>
                                    </div>

                                    {/* Drops */}
                                    <div className="flex items-center gap-1.5">
                                        {zone.drops.ore > 0 && <MaterialIcon type="ore" size={18} />}
                                        {zone.drops.leather > 0 && <MaterialIcon type="leather" size={18} />}
                                        {zone.drops.enhanceStone > 0 && <MaterialIcon type="enhanceStone" size={18} />}
                                        {zone.drops.blessedOrb > 0 && <MaterialIcon type="blessedOrb" size={18} />}
                                        {zone.drops.celestialShard > 0 && <MaterialIcon type="celestialShard" size={18} />}
                                    </div>

                                    {/* Status */}
                                    <div className="text-right min-w-[50px]">
                                        {isCurrent ? (
                                            <span className="text-sm text-yellow-400 font-bold">HERE</span>
                                        ) : isUnlocked ? (
                                            <span className="text-sm text-blue-400 font-semibold">GO</span>
                                        ) : (
                                            <span className="text-base text-slate-600">🔒</span>
                                        )}
                                    </div>
                                </div>

                                {/* Boss set indicator */}
                                {zone.bossSet && (() => {
                                    const bossSet = BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet];
                                    const weaponType = WEAPON_TYPES.find(w => w.id === bossSet?.weaponType);
                                    return (
                                        <div
                                            className="mt-2 text-xs px-2 py-1 rounded flex items-center gap-2 w-fit font-semibold"
                                            style={{
                                                backgroundColor: `${bossSet?.color}20`,
                                                color: bossSet?.color
                                            }}
                                        >
                                            <span>★ {bossSet?.name} Set</span>
                                            {weaponType && (
                                                <span className="text-slate-400 font-normal">
                                                    • Drops: {weaponType.name}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Progress bar with requirements - shows progress to unlock NEXT zone */}
                                {nextZoneReq > 0 && (
                                    <div className="mt-2">
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className={`text-[10px] ${progress >= 100 ? 'text-green-400' : 'text-slate-500'}`}>
                                                {kills}/{nextZoneReq} kills
                                            </span>
                                            {progress < 100 && (
                                                <span className="text-[10px] text-slate-500">
                                                    {nextZoneReq - kills} to unlock next
                                                </span>
                                            )}
                                            {progress >= 100 && (
                                                <span className="text-[10px] text-green-400">Next unlocked!</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Current zone glow */}
                                {isCurrent && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-lg" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
