import React from 'react';
import { useGame } from '../context/GameContext';
import { PRESTIGE_SKILLS } from '../data/skills';
import { MATERIALS } from '../data/items';

export default function PrestigeView() {
    const { state, gameManager } = useGame();

    const handlePrestige = () => {
        if (confirm("ASCEND NOW?\n\nThis will reset your level, gold, and gear, but you will keep your Prestige Skills and earn 10 Prestige Stones.")) {
            gameManager.performPrestige();
        }
    };

    const handleUpgradeSkill = (skill) => {
        const currentLevel = state.prestigeSkills?.[skill.id] || 0;
        const cost = skill.cost(currentLevel);
        if (state.prestigeStones >= cost) {
            gameManager.upgradePrestigeSkill(skill.id, cost);
        }
    };

    const hasBeatenLastBoss = (state.zoneKills?.[20] || 0) >= 1;

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Header / Stats */}
            <div className="flex flex-col gap-4 p-4 bg-slate-800 rounded border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-pink-500 tracking-tighter uppercase">Prestige System</h2>
                        <p className="text-slate-400 text-xs">Reset progress for permanent power</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900 px-4 py-2 rounded border border-pink-500/30 text-center">
                            <div className="text-[10px] uppercase text-pink-400 font-bold">Prestige Level</div>
                            <div className="text-2xl font-mono text-pink-500">{state.prestigeLevel || 0}</div>
                        </div>
                        <div className="bg-slate-900 px-4 py-2 rounded border border-blue-500/30 text-center">
                            <div className="text-[10px] uppercase text-blue-400 font-bold">Prestige Stones</div>
                            <div className="text-2xl font-mono text-blue-500">{state.prestigeStones || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Prestige Action */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="text-white font-bold mb-1">Perform Ascension</h3>
                        <p className="text-slate-500 text-xs max-w-md">
                            Requirement: Defeat the Eternal One in Zone 20.
                            Resets all progress but rewards <span className="text-pink-400 font-bold">10 Prestige Stones</span> and increases Prestige Level.
                        </p>
                    </div>
                    <button
                        onClick={handlePrestige}
                        disabled={!hasBeatenLastBoss}
                        className={`px-8 py-4 rounded font-bold uppercase tracking-widest transition-all ${hasBeatenLastBoss
                                ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            }`}
                    >
                        {hasBeatenLastBoss ? '🌟 Ascend' : 'Locked'}
                    </button>
                </div>
            </div>

            {/* Prestige Skills */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <h3 className="text-yellow-500 font-bold uppercase text-xs mb-4 tracking-widest">Permanent Upgrades</h3>
                <div className="grid grid-cols-2 gap-3">
                    {PRESTIGE_SKILLS.map(skill => {
                        const currentLevel = state.prestigeSkills?.[skill.id] || 0;
                        const isMaxed = currentLevel >= skill.maxLevel;
                        const cost = skill.cost(currentLevel);
                        const canAfford = (state.prestigeStones || 0) >= cost;

                        return (
                            <div key={skill.id} className={`p-3 rounded border transition-all ${isMaxed ? 'bg-pink-900/10 border-pink-500/30' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-white text-sm">{skill.name}</div>
                                        <div className="text-[10px] text-slate-500">{skill.desc}</div>
                                    </div>
                                    <div className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">
                                        Lv. <span className="text-pink-400 font-mono">{currentLevel}</span> / {skill.maxLevel}
                                    </div>
                                </div>

                                {!isMaxed ? (
                                    <button
                                        onClick={() => handleUpgradeSkill(skill)}
                                        disabled={!canAfford}
                                        className={`w-full py-2 rounded text-xs font-bold mt-2 transition-all ${canAfford
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        Upgrade ({cost} Stones)
                                    </button>
                                ) : (
                                    <div className="w-full py-2 text-center text-[10px] font-bold text-pink-500 uppercase tracking-widest mt-2 border border-pink-500/20 rounded">
                                        Max Level
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Prestige Info */}
            <div className="p-4 bg-slate-950/50 rounded border border-slate-800/50">
                <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">System Unlocks</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-[10px] text-slate-500 mb-1">Prestige 1</div>
                        <div className="text-xs text-blue-400 font-bold">Astral Realm</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 mb-1">Prestige 2</div>
                        <div className="text-xs text-blue-400 font-bold">Cosmic Realm</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 mb-1">Prestige 3</div>
                        <div className="text-xs text-blue-400 font-bold">Primordial Realm</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
