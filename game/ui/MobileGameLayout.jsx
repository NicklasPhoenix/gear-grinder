import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getZoneById } from '../data/zones';
import { calculatePlayerStats } from '../systems/PlayerSystem';
import { formatWithCommas } from '../utils/format';
import { MaterialIcon } from './MaterialIcons';

// Import tab content views (reuse from desktop)
import InventoryView from './InventoryView';
import StatsView from './StatsView';
import SkillsView from './SkillsView';
import ZoneView from './ZoneView';
import EnhancementView from './EnhancementView';
import PrestigeView from './PrestigeView';
import AchievementsView from './AchievementsView';
import SettingsView from './SettingsView';
import DailyRewardsModal from './DailyRewardsModal';
import GameTooltip from './GameTooltip';

// Import sub-components (will create these)
import MobileCombatView from './MobileCombatView';
import MobileTabBar from './MobileTabBar';
import MobileBottomBar from './MobileBottomBar';

// Main mobile tabs (simplified from 8 to 6)
const MOBILE_TABS = ['inventory', 'stats', 'enhance', 'skills', 'zone', 'more'];

export default function MobileGameLayout() {
    const { state, gameManager } = useGame();
    const [activeTab, setActiveTab] = useState('inventory');
    const [tooltipData, setTooltipData] = useState(null);
    const [showDailyRewards, setShowDailyRewards] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [moreSubTab, setMoreSubTab] = useState(null); // 'prestige' | 'achievements' | 'settings'

    const handleHover = (item, position, isInventoryItem = false) => {
        if (!item) {
            setTooltipData(null);
        } else {
            setTooltipData({ item, position, gear: state.gear, isInventoryItem });
        }
    };

    // Handle "More" tab selection
    const handleMoreSelect = (subTab) => {
        setMoreSubTab(subTab);
        setShowMoreMenu(false);
    };

    // Back from sub-tab to main tabs
    const handleBackFromMore = () => {
        setMoreSubTab(null);
        setActiveTab('inventory');
    };

    if (!state) {
        return (
            <div className="w-screen h-[100dvh] bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-12 h-12 text-slate-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    const currentZone = getZoneById(state.currentZone);

    // Render content based on active tab or more sub-tab
    const renderContent = () => {
        // If a "more" sub-tab is active, show that
        if (moreSubTab) {
            switch (moreSubTab) {
                case 'prestige':
                    return <PrestigeView />;
                case 'achievements':
                    return <AchievementsView />;
                case 'settings':
                    return <SettingsView />;
                default:
                    return null;
            }
        }

        // Main tabs
        switch (activeTab) {
            case 'inventory':
                return <InventoryView onHover={handleHover} />;
            case 'stats':
                return <StatsView />;
            case 'enhance':
                return <EnhancementView />;
            case 'skills':
                return <SkillsView />;
            case 'zone':
                return <ZoneView />;
            case 'more':
                // Show more menu inline
                return (
                    <MoreMenuContent
                        onSelect={handleMoreSelect}
                        onDailyRewards={() => setShowDailyRewards(true)}
                    />
                );
            default:
                return <InventoryView onHover={handleHover} />;
        }
    };

    return (
        <div className="w-screen h-[100dvh] bg-slate-950 flex flex-col overflow-hidden">
            {/* Safe area top padding for notch */}
            <div className="bg-slate-950" style={{ paddingTop: 'env(safe-area-inset-top)' }} />

            {/* Combat View - Fixed height top section */}
            <MobileCombatView
                currentZone={currentZone}
                state={state}
                gameManager={gameManager}
            />

            {/* Tab Navigation */}
            <MobileTabBar
                tabs={MOBILE_TABS}
                activeTab={moreSubTab ? 'more' : activeTab}
                onTabChange={(tab) => {
                    if (tab === 'more') {
                        setMoreSubTab(null);
                    }
                    setActiveTab(tab);
                }}
                moreSubTab={moreSubTab}
                onBackFromMore={handleBackFromMore}
            />

            {/* Tab Content - Flexible, scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900/50">
                <div className="p-2">
                    {renderContent()}
                </div>
            </div>

            {/* Bottom XP Bar */}
            <MobileBottomBar
                level={state.level || 1}
                xp={state.xp || 0}
            />

            {/* Safe area bottom padding for home indicator */}
            <div className="bg-slate-950" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />

            {/* Tooltip Layer */}
            {tooltipData && <GameTooltip tooltip={tooltipData} />}

            {/* Daily Rewards Modal */}
            {showDailyRewards && <DailyRewardsModal onClose={() => setShowDailyRewards(false)} />}
        </div>
    );
}

/**
 * More menu content - shows when "More" tab is selected
 */
function MoreMenuContent({ onSelect, onDailyRewards }) {
    const menuItems = [
        { id: 'prestige', label: 'Prestige', icon: 'prestige', description: 'Reset for permanent bonuses' },
        { id: 'achievements', label: 'Achievements', icon: 'achievements', description: 'Track your progress' },
        { id: 'settings', label: 'Settings', icon: 'settings', description: 'Game options' },
    ];

    const MenuIcon = ({ type }) => {
        switch (type) {
            case 'prestige':
                return (
                    <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                );
            case 'achievements':
                return (
                    <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                    </svg>
                );
            case 'settings':
                return (
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-2">
            {/* Daily Rewards Button */}
            <button
                onClick={onDailyRewards}
                className="w-full p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7h-1.5C18.5 4.5 16 2 12 2S5.5 4.5 5.5 7H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM12 4c2.2 0 4 1.8 4 4H8c0-2.2 1.8-4 4-4zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm3-5c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3z"/>
                </svg>
                <div className="text-left">
                    <div className="font-bold text-yellow-400">Daily Rewards</div>
                    <div className="text-sm text-slate-400">Claim your daily bonus</div>
                </div>
            </button>

            {/* Menu Items */}
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                    <MenuIcon type={item.icon} />
                    <div className="text-left">
                        <div className="font-bold text-white">{item.label}</div>
                        <div className="text-sm text-slate-400">{item.description}</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            ))}
        </div>
    );
}
