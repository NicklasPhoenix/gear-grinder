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

    return (
        <div className="flex h-full gap-4">
            {/* Attributes */}
            <div className="w-1/2 p-2 bg-slate-800 rounded">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-yellow-500 uppercase">Attributes</h3>
                    <div className="text-sm bg-slate-900 px-2 py-1 rounded text-white border border-slate-600">
                        Points: <span className="text-green-400 font-bold">{state.statPoints}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {Object.entries(state.stats).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded">
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: STATS[key].color }}>{STATS[key].name}</span>
                                <span className="text-[10px] text-gray-500">{STATS[key].desc}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-mono w-6 text-right text-white">{val}</span>
                                <button
                                    onClick={() => handleStatUp(key)}
                                    disabled={state.statPoints <= 0}
                                    className={`w-6 h-6 flex items-center justify-center rounded border ${state.statPoints > 0
                                            ? 'bg-blue-600 border-blue-400 hover:bg-blue-500 text-white'
                                            : 'bg-slate-700 border-slate-600 text-slate-500'
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
            <div className="w-1/2 p-2 bg-slate-800 rounded text-xs text-white">
                <h3 className="font-bold text-yellow-500 uppercase mb-4">Combat Stats</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <StatRow label="Damage" value={calculated.damage} />
                    <StatRow label="Defense" value={calculated.armor} />
                    <StatRow label="Crit Chance" value={`${calculated.critChance.toFixed(1)}%`} />
                    <StatRow label="Crit Dmg" value={`${calculated.critDamage.toFixed(0)}%`} />
                    <StatRow label="Atk Speed" value={`${calculated.speedMult.toFixed(2)}x`} />
                    <StatRow label="Dodge" value={`${calculated.dodge.toFixed(1)}%`} />
                    <StatRow label="Lifesteal" value={`${calculated.lifesteal.toFixed(1)}%`} />
                    <StatRow label="Gold Find" value={`+${((calculated.goldMult - 1) * 100).toFixed(0)}%`} />
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between border-b border-slate-700 pb-1">
            <span className="text-gray-400">{label}</span>
            <span className="font-mono">{value}</span>
        </div>
    );
}
