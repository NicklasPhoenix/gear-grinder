import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { calculatePlayerStats } from '../systems/PlayerSystem';
import { PRIMARY_STATS, SECONDARY_STATS } from '../data/stats';
import { DEFAULTS } from '../data/constants';
import { getZoneById } from '../data/zones';
import { COMBAT } from '../data/constants';
import { formatPercent, formatMultiplier, formatBonus, formatWithCommas, formatTime } from '../utils/format';

export default function StatsView() {
    const { state, gameManager } = useGame();
    const { isMobile } = useIsMobile();
    const calculated = calculatePlayerStats(state);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [activeSection, setActiveSection] = useState('primary'); // 'primary' or 'secondary' for mobile
    const currentZone = getZoneById(state.currentZone);

    // Calculate damage breakdown
    const avgDamage = calculated.damage;
    const critChance = calculated.critChance / 100;
    const critDamage = calculated.critDamage / 100;
    const avgCritDamage = avgDamage * critDamage;
    const effectiveDPS = avgDamage * (1 - critChance) + avgCritDamage * critChance;
    const attacksPerSecond = calculated.speedMult * COMBAT.ATTACKS_PER_SECOND;
    const trueDPS = Math.floor(effectiveDPS * attacksPerSecond);

    // Enemy damage reduction from armor + flat damage reduction
    const armorReduction = calculated.armor / (calculated.armor + COMBAT.ARMOR_CONSTANT);
    const flatDR = (calculated.damageReduction || 0) / 100;
    const afterArmor = Math.floor(currentZone.enemyDmg * (1 - armorReduction));
    const reducedEnemyDmg = Math.max(1, Math.floor(afterArmor * (1 - flatDR)));
    const totalReduction = 1 - (1 - armorReduction) * (1 - flatDR);
    const effectiveHP = Math.floor(calculated.maxHp / (1 - totalReduction));

    const handlePrimaryStatUp = (key, amount = 1) => {
        const toAdd = Math.min(amount, state.statPoints);
        if (toAdd > 0) {
            gameManager.setState(prev => ({
                ...prev,
                statPoints: prev.statPoints - toAdd,
                stats: { ...prev.stats, [key]: prev.stats[key] + toAdd }
            }));
        }
    };

    const handleSecondaryStatUp = (key, amount = 1) => {
        const toAdd = Math.min(amount, state.statPoints);
        if (toAdd > 0) {
            gameManager.setState(prev => ({
                ...prev,
                statPoints: prev.statPoints - toAdd,
                secondaryStats: { ...prev.secondaryStats, [key]: (prev.secondaryStats?.[key] || 0) + toAdd }
            }));
        }
    };

    const handleManualSave = async () => {
        try {
            const data = await gameManager.save();
            await window.storage.set('gear-grinder-save', data);
            console.log('Manual save completed:', {
                zone: gameManager.state.currentZone,
                level: gameManager.state.level,
                gold: gameManager.state.gold,
                kills: gameManager.state.kills,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleResetStats = () => {
        // Calculate total allocated primary stats (current stats - base stats of 5 each)
        const basePrimary = DEFAULTS.BASE_PRIMARY_STATS;
        const allocatedPrimary = Object.entries(state.stats).reduce((total, [key, val]) => {
            return total + (val - (basePrimary[key] || 0));
        }, 0);

        // Calculate total allocated secondary stats (all start at 0)
        const allocatedSecondary = Object.values(state.secondaryStats || {}).reduce((total, val) => total + val, 0);

        const totalAllocated = allocatedPrimary + allocatedSecondary;

        if (totalAllocated === 0) return;

        if (confirm(`Reset all stat allocations?\n\nYou will get back ${totalAllocated} stat points.`)) {
            gameManager.setState(prev => ({
                ...prev,
                stats: { ...basePrimary },
                secondaryStats: { ...DEFAULTS.BASE_SECONDARY_STATS },
                statPoints: prev.statPoints + totalAllocated
            }));
        }
    };

    // Render stat allocation button group
    const StatButtons = ({ onStatUp, statKey, isPrimary = true }) => (
        <div className="flex gap-1 flex-shrink-0">
            <button
                onClick={() => onStatUp(statKey, 1)}
                disabled={state.statPoints <= 0}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    state.statPoints > 0
                        ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-500 text-white active:scale-95'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
                +1
            </button>
            <button
                onClick={() => onStatUp(statKey, 10)}
                disabled={state.statPoints <= 0}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    state.statPoints >= 10
                        ? 'bg-green-600 hover:bg-green-500 active:bg-green-500 text-white active:scale-95'
                        : state.statPoints > 0
                            ? 'bg-green-600/50 hover:bg-green-500/50 active:bg-green-500/50 text-green-200 active:scale-95'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
                +10
            </button>
            <button
                onClick={() => onStatUp(statKey, state.statPoints)}
                disabled={state.statPoints <= 0}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    state.statPoints > 0
                        ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-500 text-white active:scale-95'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
            >
                MAX
            </button>
        </div>
    );

    // Mobile layout
    if (isMobile) {
        return (
            <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-10">
                    <span className="text-sm font-bold text-slate-300">Stats</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-green-400">
                            <span className="font-bold text-lg">{state.statPoints}</span> pts
                        </span>
                        <button
                            onClick={handleManualSave}
                            className="px-3 py-2 text-xs bg-blue-600/40 active:bg-blue-600/60 text-blue-200 rounded font-bold active:scale-95 transition-transform"
                        >
                            SAVE
                        </button>
                        <button
                            onClick={handleResetStats}
                            className="px-3 py-2 text-xs bg-orange-600/40 active:bg-orange-600/60 text-orange-200 rounded font-bold active:scale-95 transition-transform"
                        >
                            RESPEC
                        </button>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveSection('primary')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${
                            activeSection === 'primary'
                                ? 'text-red-400 border-b-2 border-red-400'
                                : 'text-slate-500'
                        }`}
                    >
                        Primary
                    </button>
                    <button
                        onClick={() => setActiveSection('secondary')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${
                            activeSection === 'secondary'
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-slate-500'
                        }`}
                    >
                        Secondary
                    </button>
                    <button
                        onClick={() => setActiveSection('combat')}
                        className={`flex-1 py-2 text-sm font-bold transition-colors ${
                            activeSection === 'combat'
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-slate-500'
                        }`}
                    >
                        Combat
                    </button>
                </div>

                {/* Primary Stats Section */}
                {activeSection === 'primary' && (
                    <div className="p-2">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2 px-1">Primary Stats (Weapon Scaling)</div>
                        <div className="space-y-2">
                            {Object.entries(PRIMARY_STATS).map(([key, stat]) => (
                                <div key={key} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: stat.color }}>
                                            {stat.name}
                                        </span>
                                        <span className="text-lg font-mono font-bold text-white ml-auto">
                                            {state.stats[key] || 0}
                                        </span>
                                        <StatButtons onStatUp={handlePrimaryStatUp} statKey={key} isPrimary={true} />
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        {stat.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Secondary Stats Section */}
                {activeSection === 'secondary' && (
                    <div className="p-2">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2 px-1">Secondary Stats (Combat Specialization)</div>
                        <div className="space-y-2">
                            {Object.entries(SECONDARY_STATS).map(([key, stat]) => (
                                <div key={key} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: stat.color }}>
                                            {stat.name}
                                        </span>
                                        <span className="text-lg font-mono font-bold text-white ml-auto">
                                            {state.secondaryStats?.[key] || 0}
                                        </span>
                                        <StatButtons onStatUp={handleSecondaryStatUp} statKey={key} isPrimary={false} />
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        {stat.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Combat Stats Section */}
                {activeSection === 'combat' && (
                    <div className="p-2">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2 px-1">Combat Stats</div>
                        <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 p-3">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <MobileStatRow label="Damage" value={calculated.damage} color="text-red-300" />
                                <MobileStatRow label="Armor" value={calculated.armor} color="text-blue-300" />
                                <MobileStatRow label="Crit %" value={formatPercent(calculated.critChance)} color="text-yellow-300" />
                                {calculated.ascendedCrit > 0 && (
                                    <MobileStatRow label="  Ascend" value={formatPercent(calculated.ascendedCrit)} color="text-cyan-400" />
                                )}
                                <MobileStatRow label="Crit DMG" value={formatPercent(calculated.critDamage, 0)} color="text-orange-300" />
                                {calculated.annihilate > 0 && (
                                    <MobileStatRow label="  Annihi" value={formatPercent(calculated.annihilate)} color="text-orange-400" />
                                )}
                                <MobileStatRow label="Speed" value={formatMultiplier(calculated.speedMult)} color="text-cyan-300" />
                                {calculated.frenzy > 0 && (
                                    <MobileStatRow label="  Frenzy" value={formatPercent(calculated.frenzy)} color="text-purple-400" />
                                )}
                                <MobileStatRow label="Dodge" value={formatPercent(calculated.dodge)} color="text-green-300" />
                                {calculated.phantom > 0 && (
                                    <MobileStatRow label="  Phantom" value={formatPercent(calculated.phantom)} color="text-violet-400" />
                                )}
                                <MobileStatRow label="Lifesteal" value={formatPercent(calculated.lifesteal)} color="text-pink-300" />
                                {calculated.overheal > 0 && (
                                    <MobileStatRow label="  Overheal" value={formatPercent(calculated.overheal)} color="text-cyan-400" />
                                )}
                                <MobileStatRow label="Thorns" value={formatPercent(calculated.thorns)} color="text-purple-300" />
                                {calculated.vengeance > 0 && (
                                    <MobileStatRow label="  Venge" value={formatPercent(calculated.vengeance)} color="text-rose-400" />
                                )}
                                <MobileStatRow label="HP Regen" value={`${(calculated.hpRegen || 0).toFixed(1)}%/s`} color="text-emerald-300" />
                                {calculated.secondWind > 0 && (
                                    <MobileStatRow label="  2ndWind" value={`${calculated.secondWind.toFixed(0)}%`} color="text-emerald-400" />
                                )}
                                <MobileStatRow label="Dmg Red." value={formatPercent(calculated.damageReduction || 0)} color="text-sky-300" />
                                {calculated.immunity > 0 && (
                                    <MobileStatRow label="  Immune" value={formatPercent(calculated.immunity)} color="text-amber-400" />
                                )}
                            </div>
                            <div className="border-t border-slate-700/50 mt-2 pt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                                <MobileStatRow label="Silver %" value={formatBonus((calculated.goldMult - 1) * 100)} color="text-slate-300" />
                                <MobileStatRow label="XP %" value={formatBonus(calculated.xpBonus || 0)} color="text-purple-400" />
                            </div>
                        </div>

                        {/* Damage Breakdown Toggle */}
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="w-full mt-2 py-3 px-4 bg-slate-800/50 active:bg-slate-700/50 rounded-lg border border-slate-700/50 flex items-center justify-between text-sm transition-all active:scale-[0.98]"
                        >
                            <span className="text-slate-400 font-medium">Damage Breakdown</span>
                            <span className={`text-slate-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}>
                                &#9660;
                            </span>
                        </button>

                        {/* Damage Breakdown Panel */}
                        {showBreakdown && (
                            <div className="mt-2 p-3 bg-slate-900/70 rounded-lg border border-slate-700/50 text-sm space-y-4">
                                {/* Damage Calculation */}
                                <div>
                                    <div className="text-slate-500 uppercase text-xs font-bold mb-2">Damage Output</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Base Hit</span>
                                            <span className="text-red-300 font-mono font-bold">{avgDamage}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Critical ({formatPercent(calculated.critChance)})</span>
                                            <span className="text-yellow-300 font-mono font-bold">{Math.floor(avgCritDamage)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Avg Damage/Hit</span>
                                            <span className="text-orange-300 font-mono font-bold">{Math.floor(effectiveDPS)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                                            <span className="text-slate-200 font-semibold">True DPS</span>
                                            <span className="text-green-400 font-mono font-bold text-base">{formatWithCommas(trueDPS)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Defense Calculation */}
                                <div>
                                    <div className="text-slate-500 uppercase text-xs font-bold mb-2">vs {currentZone.name}</div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Enemy Base Dmg</span>
                                            <span className="text-red-400 font-mono font-bold">{currentZone.enemyDmg}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Armor Reduction</span>
                                            <span className="text-blue-300 font-mono font-bold">-{formatPercent(armorReduction * 100, 1, false)}</span>
                                        </div>
                                        {flatDR > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Dmg Reduction</span>
                                                <span className="text-sky-300 font-mono font-bold">-{formatPercent(flatDR * 100, 1, false)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                                            <span className="text-slate-200 font-semibold">You Take</span>
                                            <span className="text-cyan-400 font-mono font-bold text-base">{reducedEnemyDmg}/hit</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Time to Kill */}
                                <div className="pt-2 border-t border-slate-700/50">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-slate-400">Enemy HP</span>
                                        <span className="text-slate-300 font-mono font-bold">{currentZone.enemyHp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Est. Kill Time</span>
                                        <span className="text-green-300 font-mono font-bold">{formatTime(trueDPS > 0 ? currentZone.enemyHp / trueDPS : 0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Desktop layout
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
                {/* Left Column: Primary + Secondary Stats */}
                <div className="w-1/2 flex flex-col gap-2 min-h-0">
                    {/* Primary Stats */}
                    <div className="game-panel flex flex-col min-h-0" style={{ flex: '0 0 auto' }}>
                        <div className="game-panel-header text-sm text-red-400">Primary Stats</div>
                        <div className="p-2 space-y-1.5">
                            {Object.entries(PRIMARY_STATS).map(([key, stat]) => (
                                <div key={key} className="p-2 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: stat.color }}>
                                            {stat.name}
                                        </span>
                                        <span className="text-lg font-mono font-bold text-white ml-auto">
                                            {state.stats[key] || 0}
                                        </span>
                                        <StatButtons onStatUp={handlePrimaryStatUp} statKey={key} isPrimary={true} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                                        {stat.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="game-panel flex flex-col min-h-0 flex-1">
                        <div className="game-panel-header text-sm text-yellow-400">Secondary Stats</div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
                            {Object.entries(SECONDARY_STATS).map(([key, stat]) => (
                                <div key={key} className="p-2 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold flex-shrink-0" style={{ color: stat.color }}>
                                            {stat.name}
                                        </span>
                                        <span className="text-lg font-mono font-bold text-white ml-auto">
                                            {state.secondaryStats?.[key] || 0}
                                        </span>
                                        <StatButtons onStatUp={handleSecondaryStatUp} statKey={key} isPrimary={false} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                                        {stat.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Combat Stats */}
                <div className="w-1/2 game-panel flex flex-col min-h-0">
                    <div className="game-panel-header text-sm">Combat</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0">
                        <div className="space-y-1">
                            <StatRow label="Damage" value={calculated.damage} color="text-red-300" />
                            <StatRow label="Armor" value={calculated.armor} color="text-blue-300" />
                            <StatRow label="Crit %" value={formatPercent(calculated.critChance)} color="text-yellow-300" />
                            {calculated.ascendedCrit > 0 && (
                                <StatRow label="  Ascended" value={formatPercent(calculated.ascendedCrit)} color="text-cyan-400" />
                            )}
                            <StatRow label="Crit DMG" value={formatPercent(calculated.critDamage, 0)} color="text-orange-300" />
                            {calculated.annihilate > 0 && (
                                <StatRow label="  Annihilate" value={formatPercent(calculated.annihilate)} color="text-orange-400" />
                            )}
                            <StatRow label="Speed" value={formatMultiplier(calculated.speedMult)} color="text-cyan-300" />
                            {calculated.frenzy > 0 && (
                                <StatRow label="  Frenzy" value={formatPercent(calculated.frenzy)} color="text-purple-400" />
                            )}
                            <StatRow label="Dodge" value={formatPercent(calculated.dodge)} color="text-green-300" />
                            {calculated.phantom > 0 && (
                                <StatRow label="  Phantom" value={formatPercent(calculated.phantom)} color="text-violet-400" />
                            )}
                            <StatRow label="Lifesteal" value={formatPercent(calculated.lifesteal)} color="text-pink-300" />
                            {calculated.overheal > 0 && (
                                <StatRow label="  Overheal" value={formatPercent(calculated.overheal)} color="text-cyan-400" />
                            )}
                            <StatRow label="Thorns" value={formatPercent(calculated.thorns)} color="text-purple-300" />
                            {calculated.vengeance > 0 && (
                                <StatRow label="  Vengeance" value={formatPercent(calculated.vengeance)} color="text-rose-400" />
                            )}
                            <StatRow label="HP Regen" value={`${(calculated.hpRegen || 0).toFixed(1)}%/s`} color="text-emerald-300" />
                            {calculated.secondWind > 0 && (
                                <StatRow label="  Second Wind" value={`${calculated.secondWind.toFixed(0)}% heal`} color="text-emerald-400" />
                            )}
                            <StatRow label="Dmg Reduction" value={formatPercent(calculated.damageReduction || 0)} color="text-sky-300" />
                            {calculated.immunity > 0 && (
                                <StatRow label="  Immunity" value={formatPercent(calculated.immunity)} color="text-amber-400" />
                            )}
                            <div className="border-t border-slate-700/50 my-2 pt-2">
                                <StatRow label="Silver %" value={formatBonus((calculated.goldMult - 1) * 100)} color="text-slate-300" />
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
                                            <span className="text-blue-300 font-mono">-{formatPercent(armorReduction * 100, 1, false)}</span>
                                        </div>
                                        {flatDR > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Dmg Reduction</span>
                                                <span className="text-sky-300 font-mono">-{formatPercent(flatDR * 100, 1, false)}</span>
                                            </div>
                                        )}
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

function MobileStatRow({ label, value, color = "text-slate-200" }) {
    return (
        <div className="flex justify-between py-1">
            <span className="text-sm text-slate-400">{label}</span>
            <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}
