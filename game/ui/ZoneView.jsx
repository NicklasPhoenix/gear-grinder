import React from 'react';
import { useGame } from '../context/GameContext';
import { ZONES, PRESTIGE_ZONES, getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS } from '../data/items';
import { MaterialIcon } from './MaterialIcons';

export default function ZoneView() {
    const { state, gameManager } = useGame();

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
                    <span>World Map</span>
                    <span className="text-[10px] text-slate-400">Zone {state.currentZone + 1}/{allZones.length}</span>
                </div>
            </div>

            {/* Zone List */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0 space-y-1.5">
                    {allZones.map((zone, index) => {
                        const kills = state.zoneKills?.[zone.id] || 0;
                        const prevZone = index > 0 ? allZones[index - 1] : null;
                        const isUnlocked = zone.id === 0 ||
                            (prevZone && (state.zoneKills?.[prevZone.id] || 0) >= prevZone.killsRequired);
                        const isCurrent = state.currentZone === zone.id;
                        const progress = zone.killsRequired > 0 ? Math.min(100, (kills / zone.killsRequired) * 100) : 100;

                        return (
                            <div
                                key={zone.id}
                                onClick={() => isUnlocked && !isCurrent && handleTravel(zone.id)}
                                className={`
                                    relative rounded p-2 transition-all border
                                    ${isCurrent
                                        ? 'bg-yellow-900/30 border-yellow-500/60'
                                        : isUnlocked
                                            ? 'bg-slate-800/40 border-slate-700/40 hover:border-blue-500/50 cursor-pointer'
                                            : 'bg-slate-900/30 border-slate-800/30 opacity-50 cursor-not-allowed'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Zone number */}
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                        zone.isBoss ? 'bg-red-600/50 text-red-200' :
                                        isCurrent ? 'bg-yellow-600/50 text-yellow-200' :
                                        isUnlocked ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'
                                    }`}>
                                        {zone.isBoss ? '!' : zone.id + 1}
                                    </div>

                                    {/* Zone info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-xs font-bold truncate ${zone.isBoss ? 'text-red-300' : 'text-white'}`}>
                                                {zone.name.replace(/[^a-zA-Z\s]/g, '').trim()}
                                            </span>
                                            {zone.prestigeReq > 0 && (
                                                <span className="px-1 text-[8px] bg-pink-500/30 text-pink-300 rounded">P{zone.prestigeReq}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                                            <span>HP:{formatNumber(zone.enemyHp)}</span>
                                            <span>DMG:{formatNumber(zone.enemyDmg)}</span>
                                            <span className="text-yellow-400">{zone.goldMin}-{zone.goldMax}g</span>
                                        </div>
                                    </div>

                                    {/* Drops */}
                                    <div className="flex items-center gap-1">
                                        {zone.drops.ore > 0 && <MaterialIcon type="ore" size={12} />}
                                        {zone.drops.leather > 0 && <MaterialIcon type="leather" size={12} />}
                                        {zone.drops.enhanceStone > 0 && <MaterialIcon type="enhanceStone" size={12} />}
                                        {zone.drops.blessedOrb > 0 && <MaterialIcon type="blessedOrb" size={12} />}
                                        {zone.drops.celestialShard > 0 && <MaterialIcon type="celestialShard" size={12} />}
                                    </div>

                                    {/* Status */}
                                    <div className="text-right">
                                        {isCurrent ? (
                                            <span className="text-[9px] text-yellow-400 font-bold">HERE</span>
                                        ) : isUnlocked ? (
                                            <span className="text-[9px] text-blue-400">GO</span>
                                        ) : (
                                            <span className="text-[9px] text-slate-600">🔒</span>
                                        )}
                                    </div>
                                </div>

                                {/* Boss set indicator */}
                                {zone.bossSet && (
                                    <div
                                        className="mt-1.5 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 w-fit"
                                        style={{
                                            backgroundColor: `${(BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet])?.color}20`,
                                            color: (BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet])?.color
                                        }}
                                    >
                                        ★ {(BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet])?.name} Set
                                    </div>
                                )}

                                {/* Progress bar */}
                                {zone.killsRequired > 0 && (
                                    <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Current zone glow */}
                                {isCurrent && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-400" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
}
