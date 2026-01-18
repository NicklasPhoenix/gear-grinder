import React from 'react';

// SVG-based material icons that fit the material names
export const MaterialIcons = {
    ore: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2L4 8v8l8 6 8-6V8l-8-6z" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5"/>
            <path d="M12 8l-4 3v4l4 3 4-3v-4l-4-3z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1"/>
            <path d="M8 11l4 3 4-3" stroke="#64748b" strokeWidth="1"/>
            <circle cx="12" cy="12" r="2" fill="#e2e8f0"/>
        </svg>
    ),
    leather: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 6c0-1 1-2 2-2h12c1 0 2 1 2 2v12c0 1-1 2-2 2H6c-1 0-2-1-2-2V6z" fill="#d97706" stroke="#b45309" strokeWidth="1.5"/>
            <path d="M6 8h12M6 12h12M6 16h12" stroke="#92400e" strokeWidth="1" strokeLinecap="round"/>
            <path d="M8 6v12M16 6v12" stroke="#92400e" strokeWidth="0.75" strokeDasharray="2 2"/>
        </svg>
    ),
    enhanceStone: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1 3-6z" fill="url(#enhanceGrad)" stroke="#3b82f6" strokeWidth="1.5"/>
            <path d="M12 7l1.5 3 3 0.5-2 2.5 0.5 3-3-1.5-3 1.5 0.5-3-2-2.5 3-0.5L12 7z" fill="#93c5fd"/>
            <defs>
                <linearGradient id="enhanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
            </defs>
        </svg>
    ),
    blessedOrb: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="9" fill="url(#orbGrad)" stroke="#a855f7" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="5" fill="#d8b4fe" opacity="0.6"/>
            <circle cx="10" cy="9" r="2" fill="white" opacity="0.8"/>
            <path d="M6 12a6 6 0 0112 0" stroke="#7c3aed" strokeWidth="1" fill="none" opacity="0.5"/>
            <defs>
                <radialGradient id="orbGrad" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#d8b4fe"/>
                    <stop offset="100%" stopColor="#a855f7"/>
                </radialGradient>
            </defs>
        </svg>
    ),
    celestialShard: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" fill="url(#shardGrad)" stroke="#fbbf24" strokeWidth="1.5"/>
            <path d="M12 6l1 3.5h3.5L13.5 12l1 3.5L12 13.5l-2.5 2L10.5 12 8 9.5h3.5L12 6z" fill="#fef08a"/>
            <defs>
                <linearGradient id="shardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a"/>
                    <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
            </defs>
        </svg>
    ),
    prestigeStone: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M12 2l2.5 4.5L20 8l-4 4.5L17 19l-5-2.5L7 19l1-6.5L4 8l5.5-1.5L12 2z" fill="url(#prestigeGrad)" stroke="#f472b6" strokeWidth="1.5"/>
            <circle cx="12" cy="11" r="3" fill="#fce7f3"/>
            <path d="M12 8v6M9 11h6" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
                <linearGradient id="prestigeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbcfe8"/>
                    <stop offset="100%" stopColor="#f472b6"/>
                </linearGradient>
            </defs>
        </svg>
    ),
    gold: ({ size = 16, className = '' }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
            <circle cx="12" cy="12" r="9" fill="url(#goldGrad)" stroke="#d97706" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="6" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1"/>
            <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">G</text>
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a"/>
                    <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
            </defs>
        </svg>
    ),
};

export function MaterialIcon({ type, size = 16, className = '' }) {
    const IconComponent = MaterialIcons[type];
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} />;
}

export default MaterialIcons;
