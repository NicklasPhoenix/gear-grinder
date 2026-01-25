import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { DAILY_REWARDS, getDailyReward, isNewDay, shouldResetStreak, applyDailyReward, getTimeUntilNextReward } from '../data/dailyRewards';
import { formatWithCommas } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';

export default function DailyRewardsModal({ onClose }) {
    const { state, gameManager } = useGame();
    const [countdown, setCountdown] = useState(getTimeUntilNextReward());

    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(getTimeUntilNextReward());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const dailyStreak = state.dailyStreak || 0;
    const lastDailyReward = state.lastDailyReward || 0;
    const canClaim = isNewDay(lastDailyReward);
    const streakReset = shouldResetStreak(lastDailyReward);

    // Calculate what day they'll claim
    const claimDay = streakReset ? 1 : dailyStreak + 1;
    const todayReward = getDailyReward(claimDay);

    const handleClaim = () => {
        if (!canClaim) return;

        gameManager.setState(prev => {
            const newState = { ...prev };

            // Reset streak if missed a day
            const newStreak = streakReset ? 1 : (prev.dailyStreak || 0) + 1;
            newState.dailyStreak = newStreak;
            newState.lastDailyReward = Date.now();

            // Apply rewards
            const reward = getDailyReward(newStreak);
            applyDailyReward(newState, reward.rewards);

            return newState;
        });

        // Show floating text for each reward
        const reward = getDailyReward(claimDay);
        if (reward.rewards.gold) {
            gameManager.emit('floatingText', { text: `+${formatWithCommas(reward.rewards.gold)}g`, type: 'heal', target: 'player' });
        }

        onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6 max-w-lg w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Daily Rewards</h2>
                        <p className="text-sm text-slate-400">
                            {dailyStreak > 0 ? (
                                <span>Current streak: <span className="text-yellow-400 font-bold">{dailyStreak} days</span></span>
                            ) : (
                                <span>Start your streak today!</span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Streak warning */}
                {streakReset && dailyStreak > 0 && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                        <p className="text-sm text-red-300">
                            You missed a day! Your streak will reset to 1.
                        </p>
                    </div>
                )}

                {/* Weekly rewards preview */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {DAILY_REWARDS.map((reward, index) => {
                        const dayNum = index + 1;
                        const isPast = dayNum <= (streakReset ? 0 : dailyStreak);
                        const isToday = dayNum === (claimDay <= 7 ? claimDay : ((claimDay - 1) % 7) + 1);
                        const isWeekly = reward.isWeeklyBonus;

                        return (
                            <div
                                key={dayNum}
                                className={`relative p-2 rounded-lg text-center transition-all ${
                                    isPast
                                        ? 'bg-green-600/30 border border-green-500/50'
                                        : isToday && canClaim
                                            ? 'bg-yellow-500/30 border-2 border-yellow-400 animate-pulse'
                                            : 'bg-slate-700/50 border border-slate-600/50'
                                } ${isWeekly ? 'ring-2 ring-purple-500/50' : ''}`}
                            >
                                <div className="text-[10px] text-slate-400 mb-1">Day {dayNum}</div>
                                <div className="text-lg">
                                    {isPast ? (
                                        <span className="text-green-400">✓</span>
                                    ) : isWeekly ? (
                                        <img src="/assets/ui-icons/chest-daily-rewards.png" alt="" className="w-5 h-5" />
                                    ) : (
                                        <img src="/assets/ui-icons/chest-gems-daily-alt.png" alt="" className="w-5 h-5" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Today's reward details */}
                <div className={`p-4 rounded-xl mb-4 ${canClaim ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 'bg-slate-700/50 border border-slate-600/50'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-bold text-white">
                                {canClaim ? `Day ${claimDay} Reward` : 'Already Claimed Today'}
                            </h3>
                            <p className="text-sm text-slate-400">{todayReward.description}</p>
                            {todayReward.multiplier && (
                                <span className="text-xs text-purple-400 font-bold">{todayReward.multiplier} bonus!</span>
                            )}
                        </div>
                        {todayReward.isWeeklyBonus && (
                            <div className="px-2 py-1 bg-purple-500/30 rounded text-xs text-purple-300 font-bold">
                                WEEKLY BONUS
                            </div>
                        )}
                    </div>

                    {/* Rewards display */}
                    <div className="grid grid-cols-3 gap-2">
                        {todayReward.rewards.gold && (
                            <RewardItem type="gold" value={todayReward.rewards.gold} />
                        )}
                        {todayReward.rewards.enhanceStone && (
                            <RewardItem type="enhanceStone" value={todayReward.rewards.enhanceStone} />
                        )}
                        {todayReward.rewards.blessedOrb && (
                            <RewardItem type="blessedOrb" value={todayReward.rewards.blessedOrb} />
                        )}
                        {todayReward.rewards.celestialShard && (
                            <RewardItem type="celestialShard" value={todayReward.rewards.celestialShard} />
                        )}
                        {todayReward.rewards.statPoints && (
                            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg p-2">
                                <span className="text-xl">⭐</span>
                                <div>
                                    <p className="text-xs text-slate-400">Stat Points</p>
                                    <p className="text-sm font-bold text-green-400">+{todayReward.rewards.statPoints}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Claim button or countdown */}
                {canClaim ? (
                    <button
                        onClick={handleClaim}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Claim Reward!
                    </button>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-slate-400 mb-1">Next reward in:</p>
                        <p className="text-2xl font-mono font-bold text-yellow-400">
                            {String(countdown.hours).padStart(2, '0')}:
                            {String(countdown.minutes).padStart(2, '0')}:
                            {String(countdown.seconds).padStart(2, '0')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function RewardItem({ type, value }) {
    const COLORS = {
        gold: 'text-yellow-400',
        enhanceStone: 'text-blue-400',
        blessedOrb: 'text-purple-400',
        celestialShard: 'text-yellow-300',
    };

    const NAMES = {
        gold: 'Silver',
        enhanceStone: 'E.Stone',
        blessedOrb: 'B.Orb',
        celestialShard: 'C.Shard',
    };

    return (
        <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg p-2">
            <MaterialIcon type={type} size={24} />
            <div>
                <p className="text-xs text-slate-400">{NAMES[type]}</p>
                <p className={`text-sm font-bold ${COLORS[type]}`}>+{formatWithCommas(value)}</p>
            </div>
        </div>
    );
}

/**
 * Hook to check if daily reward is available.
 * Returns true if player can claim today's reward.
 */
export function useDailyRewardAvailable() {
    const { state } = useGame();
    return isNewDay(state.lastDailyReward);
}
