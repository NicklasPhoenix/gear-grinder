import React, { useEffect } from 'react';
import { formatWithCommas } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';

export default function OfflineRewardsModal({ rewards, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Format time away
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds} seconds`;
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return `${mins} minute${mins !== 1 ? 's' : ''}`;
        }
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours < 24) {
            return `${hours}h ${mins}m`;
        }
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-500/50 p-6 max-w-md w-full mx-4 shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow: '0 0 60px rgba(251, 191, 36, 0.3), 0 0 100px rgba(251, 191, 36, 0.1)'
                }}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🌙</div>
                    <h2 className="text-2xl font-bold text-white mb-1">Welcome Back!</h2>
                    <p className="text-slate-400">
                        You were away for <span className="text-yellow-400 font-semibold">{formatTime(rewards.time)}</span>
                    </p>
                </div>

                {/* Rewards */}
                <div className="bg-slate-800/60 rounded-xl p-4 mb-6 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 text-center uppercase tracking-wider">
                        Offline Progress
                    </h3>

                    <div className="space-y-3">
                        {/* Kills */}
                        <div className="flex items-center justify-between bg-slate-700/40 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚔️</span>
                                <span className="text-slate-300">Enemies Defeated</span>
                            </div>
                            <span className="text-xl font-bold text-red-400">+{formatWithCommas(rewards.kills)}</span>
                        </div>

                        {/* Gold */}
                        <div className="flex items-center justify-between bg-slate-700/40 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <MaterialIcon type="gold" size={28} />
                                <span className="text-slate-300">Silver Earned</span>
                            </div>
                            <span className="text-xl font-bold text-yellow-400">+{formatWithCommas(rewards.gold)}</span>
                        </div>

                        {/* XP */}
                        <div className="flex items-center justify-between bg-slate-700/40 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">✨</span>
                                <span className="text-slate-300">Experience Gained</span>
                            </div>
                            <span className="text-xl font-bold text-blue-400">+{formatWithCommas(rewards.xp)}</span>
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                    Continue Playing
                </button>

                {/* Tip */}
                <p className="text-center text-xs text-slate-500 mt-4">
                    Press Enter or click anywhere to close
                </p>
            </div>
        </div>
    );
}
