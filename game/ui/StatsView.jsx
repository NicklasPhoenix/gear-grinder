import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { calculatePlayerStats } from '../systems/PlayerSystem';
import { STATS } from '../data/stats';
import { getZoneById } from '../data/zones';
import { COMBAT } from '../data/constants';
import { formatPercent, formatMultiplier, formatBonus, formatWithCommas, formatTime } from '../utils/format';

export default function StatsView() {
    const { state, gameManager } = useGame();
    const calculated = calculatePlayerStats(state);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const currentZone = getZoneById(state.currentZone);

    // Calculate damage breakdown
    const avgDamage = calculated.damage;
    const critChance = calculated.critChance / 100;
    const critDamage = calculated.critDamage / 100;
    const avgCritDamage = avgDamage * critDamage;
    const effectiveDPS = avgDamage * (1 - critChance) + avgCritDamage * critChance;
    const attacksPerSecond = calculated.speedMult * COMBAT.ATTACKS_PER_SECOND;
    const trueDPS = Math.floor(effectiveDPS * attacksPerSecond);

    // Enemy damage reduction from armor
    const damageReduction = calculated.armor / (calculated.armor + COMBAT.ARMOR_CONSTANT);
    const reducedEnemyDmg = Math.max(1, Math.floor(currentZone.enemyDmg * (1 - damageReduction)));
    const effectiveHP = Math.floor(calculated.maxHp / (1 - damageReduction));

    const handleStatUp = (key, amount = 1) => {
        const toAdd = Math.min(amount, state.statPoints);
        if (toAdd > 0) {
            gameManager.setState(prev => ({
                ...prev,
                statPoints: prev.statPoints - toAdd,
                stats: { ...prev.stats, [key]: prev.stats[key] + toAdd }
            }));
        }
    };

    const handleManualSave = async () => {
        await gameManager.save();
        const data = JSON.stringify(gameManager.state);
        await window.storage.set('gear-grinder-save', data);
    };

    const handleResetStats = () => {
        // Calculate total allocated points (current stats - base stats of 5 each)
        const baseStats = { str: 5, int: 5, vit: 5, agi: 5, lck: 5 };
        const allocatedPoints = Object.entries(state.stats).reduce((total, [key, val]) => {
            return total + (val - baseStats[key]);
        }, 0);

        if (allocatedPoints === 0) return;

        if (confirm(`Reset all stat allocations?\n\nYou will get back ${allocatedPoints} stat points.`)) {
            gameManager.setState(prev => ({
                ...prev,
                stats: { ...baseStats },
                statPoints: prev.statPoints + allocatedPoints
            }));
        }
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Header */}
            <div className="game-panel">
                <div className="game-panel-header flex justify-between items-center">
                    <span className="text-sm">Stats</span>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-green-400">
                            Points: <span className="font-bold text-lg">{state.statPoints}</span>
                        </span>
                        <button onClick={handleManualSave} className="px-3 py-1 text-xs bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded font-bold">
                            SAVE
                        </button>
                        <button onClick={handleResetStats} className="px-3 py-1 text-xs bg-orange-600/40 hover:bg-orange-600/60 text-orange-200 rounded font-bold">
                            RESPEC
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-2 min-h-0">
                {/* Base Attributes */}
                <div className="w-1/2 game-panel flex flex-col min-h-0">
                    <div className="game-panel-header text-sm">Attributes</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0 space-y-1.5">
                        {Object.entries(state.stats).map(([key, val]) => (
                            <div key={key} className="p-2 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors">
                                {/* Top row: Name, Value, Buttons */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold flex-shrink-0" style={{ color: STATS[key].color }}>
                                        {STATS[key].name}
                                    </span>
                                    <span className="text-lg font-mono font-bold text-white ml-auto">
                                        {val}
                                    </span>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => handleStatUp(key, 1)}
                                            disabled={state.statPoints <= 0}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                                                state.statPoints > 0
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            +1
                                        </button>
                                        <button
                                            onClick={() => handleStatUp(key, 10)}
                                            disabled={state.statPoints <= 0}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                                                state.statPoints >= 10
                                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                                    : state.statPoints > 0
                                                        ? 'bg-green-600/50 hover:bg-green-500/50 text-green-200'
                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            +10
                                        </button>
                                        <button
                                            onClick={() => handleStatUp(key, state.statPoints)}
                                            disabled={state.statPoints <= 0}
                                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                                                state.statPoints > 0
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                                {/* Bottom row: Description */}
                                <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                                    {STATS[key].desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Combat Stats */}
                <div className="w-1/2 game-panel flex flex-col min-h-0">
                    <div className="game-panel-header text-sm">Combat</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0">
                        <div className="space-y-1">
                            <StatRow label="Damage" value={calculated.damage} color="text-red-300" />
                            <StatRow label="Armor" value={calculated.armor} color="text-blue-300" />
                            <StatRow label="Crit %" value={formatPercent(calculated.critChance)} color="text-yellow-300" />
                            <StatRow label="Crit DMG" value={formatPercent(calculated.critDamage, 0)} color="text-orange-300" />
                            <StatRow label="Speed" value={formatMultiplier(calculated.speedMult)} color="text-cyan-300" />
                            <StatRow label="Dodge" value={formatPercent(calculated.dodge)} color="text-green-300" />
                            <StatRow label="Lifesteal" value={formatPercent(calculated.lifesteal)} color="text-pink-300" />
                            <StatRow label="Thorns" value={calculated.thorns || 0} color="text-purple-300" />
                            <div className="border-t border-slate-700/50 my-2 pt-2">
                                <StatRow label="Gold %" value={formatBonus((calculated.goldMult - 1) * 100)} color="text-yellow-400" />
                                <StatRow label="XP %" value={formatBonus(calculated.xpBonus || 0)} color="text-purple-400" />
                            </div>
                        </div>

                        {/* Damage Breakdown Toggle */}
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full mt-3 py-2 px-3 bg-slate-800/50 hover:bg-slate-700/50 rounded border border-slate-700/50 flex items-center justify-between text-sm transition-colors"
                        >
                            <span className="text-slate-400">Damage Breakdown</span>
                            <span className={`text-slate-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>
                                &#9660;
                            </span>
                        </button>

                        {/* Damage Breakdown Panel */}
                        {showBreakdown && (
                            <div className="mt-2 p-3 bg-slate-900/70 rounded border border-slate-700/50 text-xs space-y-3">
                                {/* Damage Calculation */}
                                <div>
                                    <div className="text-slate-500 uppercase text-[10px] mb-1.5">Damage Output</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Base Hit</span>
                                            <span className="text-red-300 font-mono">{avgDamage}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Critical Hit ({formatPercent(calculated.critChance)})</span>
                                            <span className="text-yellow-300 font-mono">{Math.floor(avgCritDamage)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Avg Damage/Hit</span>
                                            <span className="text-orange-300 font-mono">{Math.floor(effectiveDPS)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-700/50 pt-1 mt-1">
                                            <span className="text-slate-300 font-semibold">True DPS</span>
                                            <span className="text-green-400 font-mono font-bold">{formatWithCommas(trueDPS)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Defense Calculation */}
                                <div>
                                    <div className="text-slate-500 uppercase text-[10px] mb-1.5">vs {currentZone.name}</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Enemy Base Dmg</span>
                                            <span className="text-red-400 font-mono">{currentZone.enemyDmg}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Armor Reduction</span>
                                            <span className="text-blue-300 font-mono">-{formatPercent(damageReduction, 1, false)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-700/50 pt-1 mt-1">
                                            <span className="text-slate-300 font-semibold">You Take</span>
                                            <span className="text-cyan-400 font-mono font-bold">{reducedEnemyDmg}/hit</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Time to Kill */}
                                <div className="pt-2 border-t border-slate-700/50">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Enemy HP</span>
                                        <span className="text-slate-300 font-mono">{currentZone.enemyHp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Est. Kill Time</span>
                                        <span className="text-green-300 font-mono">{formatTime(trueDPS > 0 ? currentZone.enemyHp / trueDPS : 0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value, color = "text-slate-200" }) {
    return (
        <div className="flex justify-between py-1.5 px-2 hover:bg-slate-800/30 rounded">
            <span className="text-sm text-slate-400">{label}</span>
            <span className={`text-base font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}
