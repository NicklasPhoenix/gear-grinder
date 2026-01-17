import React from 'react';
import { useGame } from '../context/GameContext';
import { SKILLS } from '../data/skills';

export default function SkillsView() {
    const { state, gameManager } = useGame();

    const handleUnlock = (skill) => {
        // Logic should be in manager, but direct state update for now
        if (state.level >= skill.unlockLevel && !state.unlockedSkills.includes(skill.id)) {
            gameManager.setState(prev => ({
                ...prev,
                unlockedSkills: [...prev.unlockedSkills, skill.id]
            }));
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2">Combat Skills</h3>
            <div className="grid grid-cols-1 gap-2">
                {SKILLS.map(skill => {
                    const isUnlocked = state.unlockedSkills.includes(skill.id);
                    const canUnlock = state.level >= skill.unlockLevel;

                    return (
                        <div key={skill.id} className={`p-3 rounded border flex justify-between items-center ${isUnlocked
                                ? 'bg-slate-800 border-green-500/50'
                                : (canUnlock ? 'bg-slate-900 border-slate-600' : 'bg-slate-950 border-slate-800 opacity-50')
                            }`}>
                            <div>
                                <div className={`font-bold ${isUnlocked ? 'text-green-400' : 'text-gray-400'}`}>{skill.name}</div>
                                <div className="text-xs text-gray-500">{skill.desc}</div>
                            </div>

                            {isUnlocked ? (
                                <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-900/20 rounded">ACTIVE</span>
                            ) : (
                                <div className="text-right">
                                    <div className="text-xs text-red-400 mb-1">Req Lv.{skill.unlockLevel}</div>
                                    {canUnlock && (
                                        <button
                                            onClick={() => handleUnlock(skill)}
                                            className="text-xs bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            UNLOCK
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
