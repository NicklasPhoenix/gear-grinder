import React from 'react';
import { useGame } from '../context/GameContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { SKILLS } from '../data/skills';

export default function SkillsView() {
    const { state, gameManager, addToast } = useGame();
    const { isMobile } = useIsMobile();

    const handleUnlock = (skill) => {
        // Logic should be in manager, but direct state update for now
        if (state.level >= skill.unlockLevel && !state.unlockedSkills.includes(skill.id)) {
            gameManager.setState(prev => ({
                ...prev,
                unlockedSkills: [...prev.unlockedSkills, skill.id]
            }));

            // Show toast notification for skill unlock
            addToast('skill', {
                name: skill.name,
                description: `Unlocked at level ${skill.unlockLevel}`,
                effect: skill.desc
            });
        }
    };

    // Mobile layout
    if (isMobile) {
        return (
            <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-10">
                    <span className="font-bold text-yellow-500 uppercase text-sm">Combat Skills</span>
                    <span className="text-xs text-slate-500">Level {state.level}</span>
                </div>

                {/* Skills List */}
                <div className="p-2 space-y-2">
                    {SKILLS.map(skill => {
                        const isUnlocked = state.unlockedSkills.includes(skill.id);
                        const canUnlock = state.level >= skill.unlockLevel;

                        return (
                            <div
                                key={skill.id}
                                className={`p-3 rounded-lg border ${
                                    isUnlocked
                                        ? 'bg-slate-800 border-green-500/50'
                                        : canUnlock
                                            ? 'bg-slate-900 border-slate-600'
                                            : 'bg-slate-950 border-slate-800 opacity-60'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${isUnlocked ? 'text-green-400' : 'text-gray-300'}`}>
                                            {skill.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            {skill.desc}
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                        {isUnlocked ? (
                                            <span className="text-xs font-bold text-green-500 px-3 py-1.5 bg-green-900/30 rounded-lg">
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <div className="text-right">
                                                <div className="text-xs text-red-400 mb-1.5">
                                                    Lv.{skill.unlockLevel}
                                                </div>
                                                {canUnlock && (
                                                    <button
                                                        onClick={() => handleUnlock(skill)}
                                                        className="text-sm font-bold bg-yellow-600 active:bg-yellow-500 text-white px-4 py-2 rounded-lg active:scale-95 transition-transform"
                                                    >
                                                        UNLOCK
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="h-full flex flex-col gap-4 min-h-0">
            <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2 flex-shrink-0">Combat Skills</h3>
            <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
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
