import React from 'react';
import { useGame } from '../context/GameContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { PRESTIGE_SKILLS } from '../data/skills';

export default function PrestigeView() {
    const { state, gameManager } = useGame();
    const { isMobile } = useIsMobile();

    // Calculate prestige stone reward: 10 base + level/2
    const stoneReward = 10 + Math.floor((state.level || 1) / 2);

    const handlePrestige = () => {
        if (window.confirm(`ASCEND NOW?\n\nThis will reset your level, silver, gear, and zone progress, but you will keep your Prestige Skills and earn ${stoneReward} Prestige Stones.`)) {
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

    const hasBeatenLastBoss = (state.zoneKills?.[39] || 0) >= 1;

    // Mobile layout
    if (isMobile) {
        return (
            <div className="flex flex-col gap-3">
                {/* Header / Stats */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h2 className="text-lg font-bold text-pink-500 uppercase">Prestige</h2>
                            <p className="text-slate-400 text-xs">Reset for permanent power</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-slate-900 px-3 py-2 rounded-lg border border-pink-500/30 text-center">
                                <div className="text-[10px] uppercase text-pink-400 font-bold">Level</div>
                                <div className="text-xl font-mono text-pink-500 font-bold">{state.prestigeLevel || 0}</div>
                            </div>
                            <div className="bg-slate-900 px-3 py-2 rounded-lg border border-blue-500/30 text-center">
                                <div className="text-[10px] uppercase text-blue-400 font-bold">Stones</div>
                                <div className="text-xl font-mono text-blue-500 font-bold">{state.prestigeStones || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Prestige Action */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="text-slate-400 text-xs mb-2">
                            Defeat the Dark Wolf King in Zone 39 to unlock. Current reward: <span className="text-pink-400 font-bold">+{stoneReward} Prestige Stones</span>
                        </p>
                        <p className="text-slate-500 text-[10px] mb-2">
                            Formula: 10 + Level/2. Extra stones drop from Prestige zones (40+).
                        </p>
                        <button
                            onClick={handlePrestige}
                            disabled={!hasBeatenLastBoss}
                            className={`w-full py-3 rounded-lg font-bold uppercase text-sm transition-all active:scale-95 ${hasBeatenLastBoss
                                    ? 'bg-pink-600 active:bg-pink-500 text-white'
                                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                                }`}
                        >
                            {hasBeatenLastBoss ? <><img src="/assets/ui-icons/star-ascend.png" alt="" className="w-5 h-5 inline-block mr-1" /> Ascend Now</> : 'Locked'}
                        </button>
                    </div>
                </div>

                {/* Prestige Skills */}
                <div>
                    <h3 className="text-yellow-500 font-bold uppercase text-xs mb-2 px-1">Permanent Upgrades</h3>
                    <div className="space-y-2">
                        {PRESTIGE_SKILLS.map(skill => {
                            const currentLevel = state.prestigeSkills?.[skill.id] || 0;
                            const isMaxed = currentLevel >= skill.maxLevel;
                            const cost = skill.cost(currentLevel);
                            const canAfford = (state.prestigeStones || 0) >= cost;

                            return (
                                <div key={skill.id} className={`p-3 rounded-lg border transition-all ${isMaxed ? 'bg-pink-900/10 border-pink-500/30' : 'bg-slate-800 border-slate-700'}`}>
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex-1">
                                            <div className="font-bold text-white text-sm">{skill.name}</div>
                                            <div className="text-xs text-slate-400">{skill.desc}</div>
                                        </div>
                                        <div className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">
                                            <span className="text-pink-400 font-mono font-bold">{currentLevel}</span>/{skill.maxLevel}
                                        </div>
                                    </div>

                                    {!isMaxed ? (
                                        <button
                                            onClick={() => handleUpgradeSkill(skill)}
                                            disabled={!canAfford}
                                            className={`w-full py-2 rounded text-sm font-bold transition-all active:scale-95 ${canAfford
                                                    ? 'bg-blue-600 active:bg-blue-500 text-white'
                                                    : 'bg-slate-700 text-slate-500 opacity-50'
                                                }`}
                                        >
                                            Upgrade ({cost} Stones)
                                        </button>
                                    ) : (
                                        <div className="w-full py-2 text-center text-xs font-bold text-pink-500 uppercase border border-pink-500/20 rounded">
                                            Max Level
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Prestige Info */}
                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <h4 className="text-xs text-slate-500 uppercase mb-2 font-bold">System Unlocks</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-[10px] text-slate-500">P1</div>
                            <div className="text-xs text-blue-400 font-bold">Astral</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-500">P2</div>
                            <div className="text-xs text-blue-400 font-bold">Cosmic</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-500">P3</div>
                            <div className="text-xs text-blue-400 font-bold">Primordial</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop layout
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
                            Requirement: Defeat the Dark Wolf King in Zone 39.
                            Resets all progress but rewards <span className="text-pink-400 font-bold">+{stoneReward} Prestige Stones</span> and increases Prestige Level.
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                            Formula: 10 + Level/2. Extra stones drop from Prestige zones (40+).
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
                        {hasBeatenLastBoss ? <><img src="/assets/ui-icons/star-ascend.png" alt="" className="w-6 h-6 inline-block mr-2" /> Ascend</> : 'Locked'}
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
