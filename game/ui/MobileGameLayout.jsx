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
import ShopView from './ShopView';
import ProgressView from './ProgressView';
import DailyRewardsModal from './DailyRewardsModal';
import GuideModal from './GuideModal';
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
    const [showGuide, setShowGuide] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [moreSubTab, setMoreSubTab] = useState(null); // 'shop' | 'prestige' | 'achievements' | 'settings'

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
                    <img src="/assets/ui-icons/sword-loading.png" alt="" className="w-12 h-12 mb-4 animate-bounce mx-auto" />
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
                case 'shop':
                    return <ShopView />;
                case 'prestige':
                    return <PrestigeView />;
                case 'achievements':
                    return <AchievementsView />;
                case 'settings':
                    return <SettingsView />;
                case 'progress':
                    return <ProgressView />;
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
                        onGuide={() => setShowGuide(true)}
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

            {/* Game Guide Modal */}
            {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
        </div>
    );
}

/**
 * More menu content - shows when "More" tab is selected
 */
function MoreMenuContent({ onSelect, onDailyRewards, onGuide }) {
    const menuItems = [
        { id: 'shop', label: 'Shop', icon: <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, description: 'Exchange resources' },
        { id: 'prestige', label: 'Prestige', icon: <img src="/assets/ui-icons/star-prestige.png" alt="" className="w-8 h-8" />, description: 'Reset for permanent bonuses' },
        { id: 'achievements', label: 'Achievements', icon: <img src="/assets/ui-icons/crown-achievements.png" alt="" className="w-8 h-8" />, description: 'Track your progress' },
        { id: 'progress', label: 'Progress', icon: <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, description: 'Objectives, Collections & Endless' },
        { id: 'settings', label: 'Settings', icon: <img src="/assets/ui-icons/compass-settings.png" alt="" className="w-8 h-8" />, description: 'Game options' },
    ];

    return (
        <div className="space-y-2">
            {/* Top Row: Guide + Daily */}
            <div className="flex gap-2">
                <button
                    onClick={onGuide}
                    className="flex-1 p-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <span className="text-2xl">📖</span>
                    <div className="text-left">
                        <div className="font-bold text-blue-400">Guide</div>
                        <div className="text-xs text-slate-400">Learn the game</div>
                    </div>
                </button>
                <button
                    onClick={onDailyRewards}
                    className="flex-1 p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl flex items-center gap-3 active:scale-[0.98] transition-transform"
                >
                    <span className="text-2xl">🎁</span>
                    <div className="text-left">
                        <div className="font-bold text-yellow-400">Daily</div>
                        <div className="text-xs text-slate-400">Claim bonus</div>
                    </div>
                </button>
            </div>

            {/* Menu Items */}
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                    <span className="w-8 h-8 flex items-center justify-center">{item.icon}</span>
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
