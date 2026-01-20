import React, { useEffect, useState } from 'react';
import { ACHIEVEMENT_CATEGORIES } from '../data/achievements';
import { formatWithCommas } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';

/**
 * Toast notification component for achievements and skill unlocks.
 * Displays at the bottom of the screen with auto-dismiss.
 */
export default function ToastNotification({ toast, onDismiss }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-dismiss after 4 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onDismiss, 300); // Wait for exit animation
        }, 4000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleClick = () => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
    };

    if (toast.type === 'achievement') {
        return (
            <AchievementToast
                achievement={toast.data}
                isVisible={isVisible}
                isExiting={isExiting}
                onClick={handleClick}
            />
        );
    }

    if (toast.type === 'skill') {
        return (
            <SkillToast
                skill={toast.data}
                isVisible={isVisible}
                isExiting={isExiting}
                onClick={handleClick}
            />
        );
    }

    return null;
}

function AchievementToast({ achievement, isVisible, isExiting, onClick }) {
    const category = ACHIEVEMENT_CATEGORIES[achievement.category];
    const reward = achievement.reward;

    return (
        <div
            onClick={onClick}
            className={`
                fixed bottom-6 left-1/2 z-50 cursor-pointer
                transform transition-all duration-300 ease-out
                ${isVisible && !isExiting ? '-translate-x-1/2 translate-y-0 opacity-100' : '-translate-x-1/2 translate-y-8 opacity-0'}
            `}
        >
            <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 shadow-2xl min-w-[320px] max-w-[450px]"
                style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    borderColor: category?.color || '#fbbf24',
                    boxShadow: `0 0 30px ${category?.color || '#fbbf24'}40, 0 10px 40px rgba(0,0,0,0.5)`
                }}
            >
                {/* Icon */}
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${category?.color || '#fbbf24'}30` }}
                >
                    🏆
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider font-bold mb-0.5" style={{ color: category?.color || '#fbbf24' }}>
                        Achievement Unlocked!
                    </div>
                    <div className="text-white font-bold text-lg truncate">
                        {achievement.name}
                    </div>
                    <div className="text-slate-400 text-sm truncate">
                        {achievement.description}
                    </div>
                </div>

                {/* Rewards */}
                <div className="flex flex-col gap-1 text-right flex-shrink-0">
                    {reward.silver && (
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-yellow-400">+{formatWithCommas(reward.silver)}</span>
                            <MaterialIcon type="gold" size={16} />
                        </div>
                    )}
                    {reward.enhanceStone && (
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-blue-400">+{reward.enhanceStone}</span>
                            <MaterialIcon type="enhanceStone" size={16} />
                        </div>
                    )}
                    {reward.blessedOrb && (
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-purple-400">+{reward.blessedOrb}</span>
                            <MaterialIcon type="blessedOrb" size={16} />
                        </div>
                    )}
                    {reward.celestialShard && (
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-yellow-300">+{reward.celestialShard}</span>
                            <MaterialIcon type="celestialShard" size={16} />
                        </div>
                    )}
                    {reward.statPoints && (
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-sm font-bold text-green-400">+{reward.statPoints} SP</span>
                            <span className="text-green-400">⭐</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkillToast({ skill, isVisible, isExiting, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`
                fixed bottom-6 left-1/2 z-50 cursor-pointer
                transform transition-all duration-300 ease-out
                ${isVisible && !isExiting ? '-translate-x-1/2 translate-y-0 opacity-100' : '-translate-x-1/2 translate-y-8 opacity-0'}
            `}
        >
            <div
                className="flex items-center gap-4 px-5 py-4 rounded-xl border-2 shadow-2xl min-w-[320px] max-w-[450px]"
                style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    borderColor: '#a855f7',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.4), 0 10px 40px rgba(0,0,0,0.5)'
                }}
            >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 bg-purple-500/30">
                    ✨
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider font-bold mb-0.5 text-purple-400">
                        Skill Unlocked!
                    </div>
                    <div className="text-white font-bold text-lg truncate">
                        {skill.name}
                    </div>
                    <div className="text-slate-400 text-sm truncate">
                        {skill.description}
                    </div>
                </div>

                {/* Skill effect preview */}
                <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-bold text-purple-300">
                        {skill.effect}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Toast container that manages multiple toasts with a queue.
 */
export function ToastContainer({ toasts, onDismiss }) {
    // Only show the first toast, queue the rest
    const currentToast = toasts[0];

    if (!currentToast) return null;

    return (
        <ToastNotification
            key={currentToast.id}
            toast={currentToast}
            onDismiss={() => onDismiss(currentToast.id)}
        />
    );
}
