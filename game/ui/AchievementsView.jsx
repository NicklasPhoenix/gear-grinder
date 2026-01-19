import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, checkAchievements, applyAchievementReward } from '../data/achievements';
import { formatWithCommas } from '../utils/format';

export default function AchievementsView() {
    const { state, gameManager } = useGame();
    const unlockedAchievements = state.unlockedAchievements || [];

    // Check for new achievements
    useEffect(() => {
        const newlyUnlocked = checkAchievements(state, unlockedAchievements);

        if (newlyUnlocked.length > 0) {
            gameManager.setState(prev => {
                const newState = { ...prev };
                const newUnlocked = [...(prev.unlockedAchievements || [])];

                for (const achievement of newlyUnlocked) {
                    if (!newUnlocked.includes(achievement.id)) {
                        newUnlocked.push(achievement.id);
                        applyAchievementReward(newState, achievement.reward);

                        // Emit floating text for achievement
                        gameManager.emit('floatingText', {
                            text: `Achievement: ${achievement.name}!`,
                            type: 'achievement',
                            target: 'player'
                        });
                    }
                }

                newState.unlockedAchievements = newUnlocked;
                return newState;
            });
        }
    }, [state.kills, state.totalGold, state.level, state.prestigeLevel, state.inventory, state.gear, state.zoneKills]);

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;

    // Group achievements by category
    const achievementsByCategory = {};
    for (const achievement of ACHIEVEMENTS) {
        if (!achievementsByCategory[achievement.category]) {
            achievementsByCategory[achievement.category] = [];
        }
        achievementsByCategory[achievement.category].push(achievement);
    }

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Header */}
            <div className="game-panel">
                <div className="game-panel-header flex justify-between items-center">
                    <span className="text-sm">Achievements</span>
                    <span className="text-sm text-yellow-400">
                        {unlockedCount} / {totalCount} Unlocked
                    </span>
                </div>
            </div>

            {/* Achievement List */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 min-h-0 space-y-4">
                    {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                        <div key={category}>
                            <div
                                className="text-xs font-bold uppercase tracking-wider mb-2 px-2"
                                style={{ color: ACHIEVEMENT_CATEGORIES[category]?.color || '#94a3b8' }}
                            >
                                {ACHIEVEMENT_CATEGORIES[category]?.name || category}
                            </div>
                            <div className="space-y-1.5">
                                {achievements.map(achievement => {
                                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                                    return (
                                        <AchievementCard
                                            key={achievement.id}
                                            achievement={achievement}
                                            isUnlocked={isUnlocked}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AchievementCard({ achievement, isUnlocked }) {
    const categoryColor = ACHIEVEMENT_CATEGORIES[achievement.category]?.color || '#94a3b8';

    return (
        <div
            className={`p-3 rounded-lg border-2 transition-all ${
                isUnlocked
                    ? 'bg-slate-800/60 border-yellow-500/40'
                    : 'bg-slate-900/40 border-slate-700/30 opacity-60'
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        isUnlocked ? 'bg-yellow-500/20' : 'bg-slate-800'
                    }`}
                >
                    {isUnlocked ? achievement.icon : '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${isUnlocked ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {achievement.name}
                        </span>
                        {isUnlocked && (
                            <span className="text-xs text-green-400">Completed</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{achievement.description}</p>

                    {/* Rewards */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {achievement.reward.gold && (
                            <RewardBadge label={`+${formatWithCommas(achievement.reward.gold)}g`} color="#fbbf24" />
                        )}
                        {achievement.reward.enhanceStone && (
                            <RewardBadge label={`+${achievement.reward.enhanceStone} E.Stone`} color="#3b82f6" />
                        )}
                        {achievement.reward.blessedOrb && (
                            <RewardBadge label={`+${achievement.reward.blessedOrb} B.Orb`} color="#a855f7" />
                        )}
                        {achievement.reward.celestialShard && (
                            <RewardBadge label={`+${achievement.reward.celestialShard} C.Shard`} color="#ec4899" />
                        )}
                        {achievement.reward.statPoints && (
                            <RewardBadge label={`+${achievement.reward.statPoints} Stat Pts`} color="#22c55e" />
                        )}
                        {achievement.reward.prestigeStones && (
                            <RewardBadge label={`+${achievement.reward.prestigeStones} P.Stone`} color="#f472b6" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RewardBadge({ label, color }) {
    return (
        <span
            className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
            style={{ backgroundColor: `${color}20`, color }}
        >
            {label}
        </span>
    );
}
