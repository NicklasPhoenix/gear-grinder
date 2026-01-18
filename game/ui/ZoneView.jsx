import React from 'react';
import { useGame } from '../context/GameContext';
import { ZONES, PRESTIGE_ZONES, getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS } from '../data/items';
import { MaterialIcon } from './MaterialIcons';

const ZONE_COLORS = {
    Beast: 'from-green-600/20 to-green-900/30',
    Humanoid: 'from-amber-600/20 to-amber-900/30',
    Undead: 'from-purple-600/20 to-purple-900/30',
    Dragon: 'from-red-600/20 to-red-900/30',
    Demon: 'from-rose-600/20 to-rose-900/30',
    Elemental: 'from-cyan-600/20 to-cyan-900/30',
    Celestial: 'from-yellow-600/20 to-yellow-900/30',
    Abyssal: 'from-indigo-600/20 to-indigo-900/30',
    Chaos: 'from-pink-600/20 to-pink-900/30',
    Void: 'from-slate-600/20 to-slate-900/30',
    Boss: 'from-red-700/30 to-red-950/40',
};

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
        <div className="h-full flex flex-col gap-4">
            {/* Header */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        World Map
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">
                            Zone {state.currentZone + 1}/{allZones.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Zone List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {allZones.map((zone, index) => {
                    const kills = state.zoneKills?.[zone.id] || 0;
                    const prevZone = index > 0 ? allZones[index - 1] : null;
                    const isUnlocked = zone.id === 0 ||
                        (prevZone && (state.zoneKills?.[prevZone.id] || 0) >= prevZone.killsRequired);
                    const isCurrent = state.currentZone === zone.id;
                    const progress = zone.killsRequired > 0 ? Math.min(100, (kills / zone.killsRequired) * 100) : 100;
                    const bgColor = ZONE_COLORS[zone.isBoss ? 'Boss' : zone.enemyType] || ZONE_COLORS.Beast;

                    return (
                        <div
                            key={zone.id}
                            onClick={() => isUnlocked && !isCurrent && handleTravel(zone.id)}
                            className={`
                                relative rounded-xl overflow-hidden transition-all duration-200
                                ${isCurrent
                                    ? 'ring-2 ring-yellow-500/70 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                                    : isUnlocked
                                        ? 'hover:scale-[1.02] cursor-pointer'
                                        : 'opacity-40 cursor-not-allowed'
                                }
                            `}
                        >
                            {/* Background gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${bgColor}`} />

                            {/* Glass overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

                            {/* Content */}
                            <div className="relative p-4">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left side - Zone info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {zone.isBoss && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/30 text-red-300 uppercase tracking-wider">
                                                    Boss
                                                </span>
                                            )}
                                            {zone.prestigeReq > 0 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/30 text-pink-300 uppercase tracking-wider">
                                                    P{zone.prestigeReq}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className={`font-bold text-base truncate ${zone.isBoss ? 'text-red-300' : 'text-white'}`}>
                                            {zone.name.replace(/[^a-zA-Z\s]/g, '').trim()}
                                        </h4>

                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                {formatNumber(zone.enemyHp)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {formatNumber(zone.enemyDmg)}
                                            </span>
                                            <span className="flex items-center gap-1 text-yellow-400">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                                                </svg>
                                                {zone.goldMin}-{zone.goldMax}
                                            </span>
                                        </div>

                                        {/* Drop rates */}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {zone.drops.ore > 0 && (
                                                <DropBadge icon="ore" rate={zone.drops.ore} />
                                            )}
                                            {zone.drops.leather > 0 && (
                                                <DropBadge icon="leather" rate={zone.drops.leather} />
                                            )}
                                            {zone.drops.enhanceStone > 0 && (
                                                <DropBadge icon="enhanceStone" rate={zone.drops.enhanceStone} />
                                            )}
                                            {zone.drops.blessedOrb > 0 && (
                                                <DropBadge icon="blessedOrb" rate={zone.drops.blessedOrb} />
                                            )}
                                            {zone.drops.celestialShard > 0 && (
                                                <DropBadge icon="celestialShard" rate={zone.drops.celestialShard} />
                                            )}
                                            {zone.drops.prestigeStone > 0 && (
                                                <DropBadge icon="prestigeStone" rate={zone.drops.prestigeStone} />
                                            )}
                                        </div>

                                        {/* Boss set info */}
                                        {zone.bossSet && (
                                            <div className="mt-2">
                                                <BossSetBadge setName={zone.bossSet} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side - Status */}
                                    <div className="text-right flex flex-col items-end gap-2">
                                        {isCurrent ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 animate-pulse">
                                                EXPLORING
                                            </span>
                                        ) : isUnlocked ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                                                TRAVEL
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-500">
                                                LOCKED
                                            </span>
                                        )}

                                        <div className="text-[10px] text-slate-500">
                                            {kills} / {zone.killsRequired > 0 ? zone.killsRequired : '---'} kills
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {zone.killsRequired > 0 && (
                                    <div className="mt-3">
                                        <div className="h-1 bg-slate-800/80 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    progress >= 100
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                        : 'bg-gradient-to-r from-blue-600 to-blue-400'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Current zone indicator line */}
                            {isCurrent && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Completed
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Current
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Boss
                    </span>
                </div>
            </div>
        </div>
    );
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function DropBadge({ icon, rate }) {
    const percent = Math.round(rate * 100);
    const rateColor = rate >= 0.3 ? 'text-green-400' : rate >= 0.1 ? 'text-yellow-400' : 'text-slate-400';

    return (
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/60 text-[10px]">
            <MaterialIcon type={icon} size={12} />
            <span className={rateColor}>{percent}%</span>
        </div>
    );
}

function BossSetBadge({ setName }) {
    const bossSet = BOSS_SETS[setName] || PRESTIGE_BOSS_SETS[setName];
    if (!bossSet) return null;

    return (
        <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold"
            style={{
                backgroundColor: `${bossSet.color}20`,
                borderLeft: `2px solid ${bossSet.color}`,
                color: bossSet.color
            }}
        >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{bossSet.name} Set</span>
            <span className="opacity-60">(20% drop)</span>
        </div>
    );
}
