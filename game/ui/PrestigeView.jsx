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
        <div className="flex flex-col h-full gap-4">
            {/* Header / Stats */}
            <div className="flex flex-col gap-4 p-5 bg-slate-800 rounded-xl border-2 border-slate-700 shadow-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-pink-500 tracking-tight uppercase">Prestige System</h2>
                        <p className="text-slate-400 text-sm mt-1">Reset progress for permanent power</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900 px-5 py-3 rounded-lg border-2 border-pink-500/30 text-center min-w-[120px]">
                            <div className="text-xs uppercase text-pink-400 font-bold">Prestige Level</div>
                            <div className="text-3xl font-mono text-pink-500 font-bold">{state.prestigeLevel || 0}</div>
                        </div>
                        <div className="bg-slate-900 px-5 py-3 rounded-lg border-2 border-blue-500/30 text-center min-w-[120px]">
                            <div className="text-xs uppercase text-blue-400 font-bold">Prestige Stones</div>
                            <div className="text-3xl font-mono text-blue-500 font-bold">{state.prestigeStones || 0}</div>
                        </div>
                    </div>
                </div>

                {/* Prestige Action */}
                <div className="bg-slate-950 p-5 rounded-lg border-2 border-slate-800 flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">Perform Ascension</h3>
                        <p className="text-slate-500 text-sm max-w-md">
                            Requirement: Defeat the Eternal One in Zone 20.
                            Resets all progress but rewards <span className="text-pink-400 font-bold">10 Prestige Stones</span> and increases Prestige Level.
                        </p>
                    </div>
                    <button
                        onClick={handlePrestige}
                        disabled={!hasBeatenLastBoss}
                        className={`px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-lg transition-all ${hasBeatenLastBoss
                                ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.5)]'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700'
                            }`}
                    >
                        {hasBeatenLastBoss ? '🌟 Ascend' : 'Locked'}
                    </button>
                </div>
            </div>

            {/* Prestige Skills */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <h3 className="text-yellow-500 font-bold uppercase text-sm mb-4 tracking-widest">Permanent Upgrades</h3>
                <div className="grid grid-cols-2 gap-4">
                    {PRESTIGE_SKILLS.map(skill => {
                        const currentLevel = state.prestigeSkills?.[skill.id] || 0;
                        const isMaxed = currentLevel >= skill.maxLevel;
                        const cost = skill.cost(currentLevel);
                        const canAfford = (state.prestigeStones || 0) >= cost;

                        return (
                            <div key={skill.id} className={`p-4 rounded-lg border-2 transition-all ${isMaxed ? 'bg-pink-900/10 border-pink-500/30' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold text-white text-base">{skill.name}</div>
                                        <div className="text-sm text-slate-500">{skill.desc}</div>
                                    </div>
                                    <div className="text-sm bg-slate-900 px-3 py-1.5 rounded-lg text-slate-400 border-2 border-slate-700">
                                        Lv. <span className="text-pink-400 font-mono font-bold">{currentLevel}</span> / {skill.maxLevel}
                                    </div>
                                </div>

                                {!isMaxed ? (
                                    <button
                                        onClick={() => handleUpgradeSkill(skill)}
                                        disabled={!canAfford}
                                        className={`w-full py-2.5 rounded-lg text-sm font-bold mt-2 transition-all ${canAfford
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        Upgrade ({cost} Stones)
                                    </button>
                                ) : (
                                    <div className="w-full py-2.5 text-center text-sm font-bold text-pink-500 uppercase tracking-widest mt-2 border-2 border-pink-500/20 rounded-lg">
                                        Max Level
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Prestige Info */}
            <div className="p-4 bg-slate-950/50 rounded-lg border-2 border-slate-800/50">
                <h4 className="text-sm text-slate-500 uppercase tracking-widest mb-3 font-bold">System Unlocks</h4>
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Prestige 1</div>
                        <div className="text-base text-blue-400 font-bold">Astral Realm</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Prestige 2</div>
                        <div className="text-base text-blue-400 font-bold">Cosmic Realm</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Prestige 3</div>
                        <div className="text-base text-blue-400 font-bold">Primordial Realm</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
