import React from 'react';
import { useGame } from '../context/GameContext';
import { calculatePlayerStats } from '../systems/PlayerSystem';
import { STATS } from '../data/stats';

export default function StatsView() {
    const { state, gameManager } = useGame();
    const calculated = calculatePlayerStats(state);

    const handleStatUp = (key) => {
        if (state.statPoints > 0) {
            gameManager.setState(prev => ({
                ...prev,
                statPoints: prev.statPoints - 1,
                stats: { ...prev.stats, [key]: prev.stats[key] + 1 }
            }));
        }
    };

    const handleManualSave = async () => {
        await gameManager.save();
        const data = JSON.stringify(gameManager.state);
        await window.storage.set('gear-grinder-save', data);
    };

    const handleReset = async () => {
        if (confirm("Delete save? Cannot be undone.")) {
            await window.storage.remove('gear-grinder-save');
            location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Header */}
            <div className="game-panel">
                <div className="game-panel-header flex justify-between items-center">
                    <span>Stats</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-green-400">
                            Points: <span className="font-bold">{state.statPoints}</span>
                        </span>
                        <button onClick={handleManualSave} className="px-2 py-0.5 text-[9px] bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded">
                            SAVE
                        </button>
                        <button onClick={handleReset} className="px-2 py-0.5 text-[9px] bg-red-600/40 hover:bg-red-600/60 text-red-200 rounded">
                            RESET
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-2 min-h-0">
                {/* Base Attributes */}
                <div className="w-1/2 game-panel flex flex-col min-h-0">
                    <div className="game-panel-header">Attributes</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0 space-y-1">
                        {Object.entries(state.stats).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-1.5 bg-slate-900/50 rounded hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <div className="text-[11px] font-bold" style={{ color: STATS[key].color }}>{STATS[key].name}</div>
                                    <div className="text-[8px] text-slate-500">{STATS[key].desc}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono font-bold text-white w-6 text-right">{val}</span>
                                    <button
                                        onClick={() => handleStatUp(key)}
                                        disabled={state.statPoints <= 0}
                                        className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-all ${
                                            state.statPoints > 0
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Combat Stats */}
                <div className="w-1/2 game-panel flex flex-col min-h-0">
                    <div className="game-panel-header">Combat</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                        <div className="space-y-0.5 text-[11px]">
                            <StatRow label="Damage" value={calculated.damage} color="text-red-300" />
                            <StatRow label="Armor" value={calculated.armor} color="text-blue-300" />
                            <StatRow label="Crit %" value={`${calculated.critChance.toFixed(1)}%`} color="text-yellow-300" />
                            <StatRow label="Crit DMG" value={`${calculated.critDamage.toFixed(0)}%`} color="text-orange-300" />
                            <StatRow label="Speed" value={`${calculated.speedMult.toFixed(2)}x`} color="text-cyan-300" />
                            <StatRow label="Dodge" value={`${calculated.dodge.toFixed(1)}%`} color="text-green-300" />
                            <StatRow label="Lifesteal" value={`${calculated.lifesteal.toFixed(1)}%`} color="text-pink-300" />
                            <StatRow label="Thorns" value={calculated.thorns || 0} color="text-purple-300" />
                            <div className="border-t border-slate-700/50 my-1 pt-1">
                                <StatRow label="Gold %" value={`+${((calculated.goldMult - 1) * 100).toFixed(0)}%`} color="text-yellow-400" />
                                <StatRow label="XP %" value={`+${(calculated.xpBonus || 0).toFixed(0)}%`} color="text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value, color = "text-slate-200" }) {
    return (
        <div className="flex justify-between py-0.5 px-1 hover:bg-slate-800/30 rounded">
            <span className="text-slate-400">{label}</span>
            <span className={`font-mono font-bold ${color}`}>{value}</span>
        </div>
    );
}
