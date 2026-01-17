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
        if (confirm("Are you sure you want to delete your save? This cannot be undone.")) {
            await window.storage.remove('gear-grinder-save');
            location.reload();
        }
    };

    return (
        <div className="flex flex-col h-full gap-2">

            {/* Header / Controls */}
            <div className="flex justify-between items-center p-2 bg-slate-800 rounded border border-slate-700">
                <div className="text-sm bg-slate-900 px-3 py-1 rounded text-white border border-slate-600">
                    Unspent Points: <span className="text-green-400 font-bold">{state.statPoints}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleManualSave} className="text-xs bg-blue-900 border border-blue-700 hover:bg-blue-800 text-blue-200 px-3 py-1 rounded transition-colors">
                        💾 Save Game
                    </button>
                    <button onClick={handleReset} className="text-xs bg-red-900 border border-red-700 hover:bg-red-800 text-red-200 px-3 py-1 rounded transition-colors">
                        ♻️ Reset Save
                    </button>
                </div>
            </div>

            <div className="flex h-full gap-4">
                {/* Attributes Column */}
                <div className="w-1/2 p-4 bg-slate-800 rounded flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2 mb-2">Base Attributes</h3>

                    {Object.entries(state.stats).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded hover:bg-slate-900 transition-colors">
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: STATS[key].color }}>{STATS[key].name}</span>
                                <span className="text-[10px] text-gray-500">{STATS[key].desc}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-mono w-8 text-right text-white">{val}</span>
                                <button
                                    onClick={() => handleStatUp(key)}
                                    disabled={state.statPoints <= 0}
                                    className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${state.statPoints > 0
                                        ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 text-white shadow-lg transform hover:scale-105'
                                        : 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Combat Stats Column */}
                <div className="w-1/2 p-4 bg-slate-800 rounded flex flex-col gap-2 overflow-y-auto custom-scrollbar text-xs text-white">
                    <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2 mb-2">Combat Statistics</h3>
                    <div className="space-y-2">
                        <StatRow label="Damage" value={calculated.damage} />
                        <StatRow label="Armor / Def" value={calculated.armor} />
                        <StatRow label="Crit Chance" value={`${calculated.critChance.toFixed(1)}%`} />
                        <StatRow label="Crit Multiplier" value={`${calculated.critDamage.toFixed(0)}%`} />
                        <StatRow label="Attack Speed" value={`${calculated.speedMult.toFixed(2)}x`} />
                        <StatRow label="Dodge Chance" value={`${calculated.dodge.toFixed(1)}%`} />
                        <StatRow label="Lifesteal" value={`${calculated.lifesteal.toFixed(1)}%`} />
                        <StatRow label="Thorns Dmg" value={calculated.thorns || 0} />
                        <div className="pt-2 mt-2 border-t border-slate-700">
                            <StatRow label="Gold Find" value={`+${((calculated.goldMult - 1) * 100).toFixed(0)}%`} />
                            <StatRow label="XP Bonus" value={`+${((calculated.xpMult - 1) * 100).toFixed(0)}%`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between border-b border-slate-700/50 pb-1 hover:bg-slate-700/30 px-1 rounded">
            <span className="text-gray-400">{label}</span>
            <span className="font-mono text-blue-200">{value}</span>
        </div>
    );
}
