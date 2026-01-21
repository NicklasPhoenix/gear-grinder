import React from 'react';

/**
 * MobileTabBar - Horizontal tab navigation for mobile
 *
 * Touch-friendly with minimum 44px tap targets
 */

const TAB_CONFIG = {
    inventory: {
        label: 'Inv',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
    },
    stats: {
        label: 'Stats',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    enhance: {
        label: 'Enh',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    skills: {
        label: 'Skills',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
    },
    zone: {
        label: 'Map',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
        ),
    },
    more: {
        label: 'More',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        ),
    },
};

export default function MobileTabBar({ tabs, activeTab, onTabChange, moreSubTab, onBackFromMore }) {
    // If we're in a sub-tab (prestige/achievements/settings), show back button
    if (moreSubTab) {
        return (
            <div className="bg-slate-900 border-y border-slate-800">
                <button
                    onClick={onBackFromMore}
                    className="flex items-center gap-2 px-4 py-3 text-blue-400 active:bg-slate-800 w-full"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                    <span className="text-slate-500 ml-2 capitalize">{moreSubTab}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border-y border-slate-800">
            <div className="flex">
                {tabs.map((tabId) => {
                    const config = TAB_CONFIG[tabId];
                    if (!config) return null;

                    const isActive = activeTab === tabId;

                    return (
                        <button
                            key={tabId}
                            onClick={() => onTabChange(tabId)}
                            className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[56px] transition-all active:scale-95 active:bg-slate-800 ${
                                isActive
                                    ? 'text-blue-400 bg-slate-800/50'
                                    : 'text-slate-500'
                            }`}
                        >
                            <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                                {config.icon}
                            </div>
                            <span className={`text-[0.625rem] mt-1 font-medium ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                                {config.label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
