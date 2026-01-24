import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameRenderer from '../renderer/GameRenderer';
import { useGame } from '../context/GameContext';
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
import DailyRewardsModal, { useDailyRewardAvailable } from './DailyRewardsModal';
import GuideModal from './GuideModal';
import OfflineRewardsModal from './OfflineRewardsModal';
import { ToastContainer } from './ToastNotification';
import GameTooltip from './GameTooltip';
import { MaterialIcon, BossStoneIcon } from './MaterialIcons';
import { BOSS_STONES } from '../data/items';
import { getZoneById } from '../data/zones';
import { calculatePlayerStats } from '../systems/PlayerSystem';
import { formatWithCommas } from '../utils/format';
import { audioManager } from '../systems/AudioManager';
import { useIsMobilePortrait } from '../hooks/useIsMobile';
import MobileGameLayout from './MobileGameLayout';

// Icons for tabs
const TabIcons = {
    inventory: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    stats: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    enhance: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    skills: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    ),
    zone: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    shop: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    prestige: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    achievements: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
    settings: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    progress: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
};

// Tab order for keyboard navigation
const TABS = ['inventory', 'stats', 'enhance', 'skills', 'zone', 'shop', 'prestige', 'achievements', 'progress', 'settings'];

// Router component - decides which layout to show
export default function GameLayout() {
    const isMobilePortrait = useIsMobilePortrait();

    // Render completely separate components to avoid hook issues
    if (isMobilePortrait) {
        return <MobileGameLayout />;
    }

    return <DesktopGameLayout />;
}

// Desktop layout as its own component with all its hooks
function DesktopGameLayout() {
    const { state, offlineRewards, clearOfflineRewards, toasts, dismissToast } = useGame();
    const [activeTab, setActiveTab] = useState('inventory');
    const [tooltipUser, setTooltipUser] = useState(null);
    const [levelUpAnimation, setLevelUpAnimation] = useState(null);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [showDailyRewards, setShowDailyRewards] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [menuCollapsed, setMenuCollapsed] = useState(false);
    const dailyRewardAvailable = useDailyRewardAvailable();
    const prevLevelRef = useRef(state?.level || 1);

    // Keyboard navigation for tabs
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't intercept if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Number keys 1-9 for tab switching, 0 for last tab (Settings)
            if (e.key >= '1' && e.key <= '9') {
                const tabIndex = parseInt(e.key) - 1;
                if (tabIndex < TABS.length) {
                    setActiveTab(TABS[tabIndex]);
                }
                return;
            }
            if (e.key === '0') {
                setActiveTab(TABS[TABS.length - 1]); // Settings (last tab)
                return;
            }

            // Arrow keys for tab navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const currentIndex = TABS.indexOf(activeTab);
                let newIndex;
                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
                } else {
                    newIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
                }
                setActiveTab(TABS[newIndex]);
                return;
            }

            // ? key for keyboard shortcuts help
            if (e.key === '?') {
                setShowKeyboardHelp(prev => !prev);
            }

            // M key to toggle menu collapse
            if (e.key === 'm' || e.key === 'M') {
                setMenuCollapsed(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab]);

    // Detect level up
    useEffect(() => {
        if (!state) return;
        const currentLevel = state.level || 1;
        if (currentLevel > prevLevelRef.current) {
            // Level up detected!
            setLevelUpAnimation({ level: currentLevel, startTime: Date.now() });
            // Auto-hide after animation
            setTimeout(() => setLevelUpAnimation(null), 3000);
        }
        prevLevelRef.current = currentLevel;
    }, [state?.level]);

    // Music based on current zone
    useEffect(() => {
        if (!state) return;
        const zone = getZoneById(state.currentZone);
        if (!zone) return;

        // Initialize audio on first interaction
        const handleFirstInteraction = () => {
            audioManager.init();
            audioManager.resume();

            // Play music - AudioManager auto-selects category based on zone
            if (zone.isBoss) {
                audioManager.playMusic('boss', state.currentZone);
            } else {
                audioManager.playMusic('zone', state.currentZone);
            }

            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);

        // If audio already initialized, play music immediately
        if (audioManager.audioContext?.state === 'running') {
            if (zone.isBoss) {
                audioManager.playMusic('boss', state.currentZone);
            } else {
                audioManager.playMusic('zone', state.currentZone);
            }
        }

        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [state?.currentZone]);

    const handleHover = (item, position, isInventoryItem = false) => {
        if (!item) {
            setTooltipUser(null);
        } else {
            setTooltipUser({ item, position, gear: state.gear, isInventoryItem });
        }
    };

    if (!state) return (
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="spinner mx-auto mb-4" />
                <p className="text-slate-400">Loading game...</p>
            </div>
        </div>
    );

    const currentZone = getZoneById(state.currentZone);
    const playerStats = useMemo(() => calculatePlayerStats(state), [state]);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col lg:flex-row">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Left Panel: Game Viewport - no padding, canvas fills the space */}
            <div className="h-[40vh] lg:h-full lg:flex-1 relative flex flex-col">
                {/* Top Info Bar - overlaid on canvas */}
                <div className="absolute top-2 left-2 right-2 lg:top-4 lg:left-4 lg:right-4 flex justify-between items-start z-10">
                    {/* Zone Info + Stats */}
                    <div className="flex flex-col gap-1 lg:gap-2">
                        <div className="glass-card rounded-lg lg:rounded-xl p-2 lg:p-4 animate-fadeIn">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                    {currentZone.isBoss ? (
                                        <span className="text-base lg:text-lg">&#128293;</span>
                                    ) : (
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] lg:text-xs text-slate-400 uppercase tracking-wider hidden sm:block">Current Zone</p>
                                    <h2 className={`font-bold text-sm lg:text-lg ${currentZone.isBoss ? 'text-red-400' : 'text-white'}`}>
                                        {currentZone.name}
                                    </h2>
                                </div>
                            </div>
                            {currentZone.isBoss && (
                                <div className="mt-1 lg:mt-2 px-2 py-0.5 lg:py-1 bg-red-500/20 rounded text-[10px] lg:text-xs text-red-400 font-bold uppercase tracking-wider text-center">
                                    Boss
                                </div>
                            )}
                        </div>
                        {/* Stats below zone - hidden on small mobile */}
                        <div className="glass-card rounded-lg lg:rounded-xl px-2 lg:px-4 py-1 lg:py-2 animate-fadeIn hidden sm:block">
                            <div className="flex items-center gap-3 lg:gap-6">
                                <StatMini label="ATK" value={Math.floor(playerStats.damage || 10)} color="text-red-400" />
                                <StatMini label="DEF" value={Math.floor(playerStats.armor || 5)} color="text-blue-400" />
                                <StatMini label="Kills" value={state.kills || 0} color="text-green-400" />
                                {state.prestigeLevel > 0 && (
                                    <StatMini label="Prestige" value={state.prestigeLevel} color="text-pink-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Currency Display - All Materials */}
                    <div className="glass-card rounded-lg lg:rounded-xl p-2 lg:p-3 animate-fadeIn min-w-[280px] lg:min-w-[320px]">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <MaterialDisplay type="gold" value={state.gold} color="text-slate-200" />
                            <MaterialDisplay type="enhanceStone" value={state.enhanceStone} color="text-blue-400" />
                            <MaterialDisplay type="blessedOrb" value={state.blessedOrb} color="text-purple-400" className="hidden sm:flex" />
                            <MaterialDisplay type="celestialShard" value={state.celestialShard} color="text-yellow-300" className="hidden sm:flex" />
                        </div>
                        {/* Boss Stones - compact grid */}
                        {state.bossStones && Object.entries(state.bossStones).some(([_, v]) => v > 0) && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                <p className="text-[8px] text-slate-500 uppercase mb-1">Boss Stones</p>
                                <div className="grid grid-cols-5 lg:grid-cols-6 gap-1">
                                    {Object.entries(BOSS_STONES).map(([key, info]) => {
                                        const count = state.bossStones?.[key] || 0;
                                        if (count === 0) return null;
                                        return (
                                            <BossStoneDisplay
                                                key={key}
                                                bossSet={key}
                                                value={count}
                                                info={info}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Canvas Area - fills the entire left panel */}
                <div className="flex-1 w-full">
                    <GameRenderer />
                </div>

                {/* Combat Pause Button - bottom left overlay */}
                <div className="absolute bottom-16 left-4 z-10">
                    <CombatToggle />
                </div>

                {/* Bottom XP Bar - full width footer */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <XPBar level={state.level || 1} xp={state.xp || 0} />
                </div>
            </div>

            {/* Menu Collapse Toggle Button */}
            <button
                onClick={() => setMenuCollapsed(prev => !prev)}
                className={`hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-6 h-16 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-l-lg transition-all ${
                    menuCollapsed ? 'right-0' : 'right-[550px]'
                }`}
                title={menuCollapsed ? 'Expand Menu (M)' : 'Collapse Menu (M)'}
            >
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${menuCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Right Panel: UI Sidebar */}
            <div className={`w-full h-[60vh] lg:h-full flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800/50 bg-slate-900/80 backdrop-blur-sm shadow-2xl z-20 transition-all duration-300 ${
                menuCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-l-0' : 'lg:w-[550px]'
            }`}>
                {/* Tab Navigation */}
                <div className="flex overflow-x-auto custom-scrollbar bg-slate-950/80 border-b border-slate-800/50" role="tablist" aria-label="Game sections">
                    {TABS.map((tab, index) => (
                        <TabButton
                            key={tab}
                            active={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            icon={TabIcons[tab]}
                            shortcut={index + 1}
                        >
                            {tab === 'zone' ? 'Map' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </TabButton>
                    ))}
                </div>

                {/* Content Area - Fixed height, no outer scroll */}
                <div className="flex-1 overflow-hidden p-3">
                    <div className="h-full animate-fadeIn">
                        {activeTab === 'inventory' && <InventoryView onHover={handleHover} />}
                        {activeTab === 'stats' && <StatsView />}
                        {activeTab === 'enhance' && <EnhancementView />}
                        {activeTab === 'skills' && <SkillsView />}
                        {activeTab === 'zone' && <ZoneView />}
                        {activeTab === 'shop' && <ShopView />}
                        {activeTab === 'prestige' && <PrestigeView />}
                        {activeTab === 'achievements' && <AchievementsView />}
                        {activeTab === 'progress' && <ProgressView />}
                        {activeTab === 'settings' && <SettingsView />}
                    </div>
                </div>

                {/* Footer with Speed Control */}
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <span>Gear Grinder v1.0</span>
                            <ResetButton />
                        </div>
                        <SpeedControl />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowGuide(true)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-all font-semibold"
                                title="Game Guide"
                            >
                                <span>📖</span>
                                <span>Guide</span>
                            </button>
                            <button
                                onClick={() => setShowDailyRewards(true)}
                                className={`relative px-2 py-1 rounded text-xs transition-all ${
                                    dailyRewardAvailable
                                        ? 'bg-yellow-500/30 text-yellow-300 hover:bg-yellow-500/40'
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                                }`}
                            >
                                Daily
                                {dailyRewardAvailable && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                                )}
                            </button>
                            <button
                                onClick={() => setShowKeyboardHelp(true)}
                                className="text-slate-600 hover:text-slate-400 transition-colors"
                                aria-label="Keyboard shortcuts"
                            >
                                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono">?</kbd>
                            </button>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Auto-saving
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip Layer - outside panels to avoid stacking context issues */}
            {tooltipUser && <GameTooltip tooltip={tooltipUser} />}

            {/* Level Up Animation Overlay */}
            {levelUpAnimation && <LevelUpOverlay level={levelUpAnimation.level} />}

            {/* Keyboard Shortcuts Help */}
            {showKeyboardHelp && <KeyboardHelpModal onClose={() => setShowKeyboardHelp(false)} />}

            {/* Daily Rewards Modal */}
            {showDailyRewards && <DailyRewardsModal onClose={() => setShowDailyRewards(false)} />}

            {/* Game Guide Modal */}
            {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

            {/* Offline Rewards Modal */}
            {offlineRewards && <OfflineRewardsModal rewards={offlineRewards} onClose={clearOfflineRewards} />}

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

function TabButton({ children, active, onClick, icon, shortcut }) {
    return (
        <button
            onClick={onClick}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset ${
                active
                    ? 'text-white bg-gradient-to-b from-blue-600/20 to-transparent'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
        >
            <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                {icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">{children}</span>
            {shortcut && (
                <span className="absolute top-1 right-1 text-[8px] text-slate-600 font-mono">{shortcut}</span>
            )}
            {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
            )}
        </button>
    );
}

function StatMini({ label, value, color }) {
    return (
        <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{typeof value === 'number' ? formatWithCommas(value) : value}</p>
        </div>
    );
}

const MATERIAL_NAMES = {
    gold: 'Silver',
    enhanceStone: 'E.Stone',
    blessedOrb: 'B.Orb',
    celestialShard: 'C.Shard',
    prestigeStone: 'P.Stone',
};

function MaterialDisplay({ type, value, color, className = '' }) {
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <div className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 flex items-center justify-center">
                <MaterialIcon type={type} size={20} />
            </div>
            <div className="min-w-[70px] lg:min-w-[90px]">
                <p className="text-[8px] text-slate-500 uppercase">{MATERIAL_NAMES[type]}</p>
                <p className={`text-sm lg:text-base font-bold ${color} leading-none tabular-nums`}>
                    {typeof value === 'number' ? formatWithCommas(value) : value}
                </p>
            </div>
        </div>
    );
}

function BossStoneDisplay({ bossSet, value, info }) {
    return (
        <div
            className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800/60"
            title={info.name}
        >
            <BossStoneIcon bossSet={bossSet} size={14} />
            <span className="text-[10px] font-bold tabular-nums min-w-[1.5rem]" style={{ color: info.color }}>
                {formatWithCommas(value)}
            </span>
        </div>
    );
}

const SPEED_OPTIONS = [1, 2, 5];

function SpeedControl() {
    const { gameManager } = useGame();
    const [speed, setSpeed] = useState(1);

    useEffect(() => {
        if (!gameManager) return;
        return gameManager.subscribeSpeed(setSpeed);
    }, [gameManager]);

    const handleSpeedChange = (newSpeed) => {
        if (gameManager) {
            gameManager.setSpeed(newSpeed);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <span className="text-slate-400 mr-1">Speed:</span>
            {SPEED_OPTIONS.map(s => (
                <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        speed === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                >
                    {s}x
                </button>
            ))}
        </div>
    );
}

function ResetButton() {
    const { gameManager } = useGame();
    const [confirming, setConfirming] = useState(false);

    const handleReset = () => {
        if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
            return;
        }
        if (gameManager) {
            gameManager.resetGame();
        }
        setConfirming(false);
    };

    return (
        <button
            onClick={handleReset}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                confirming
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-red-600/50 hover:text-red-300'
            }`}
        >
            {confirming ? 'Confirm?' : 'Reset'}
        </button>
    );
}

function CombatToggle() {
    const { gameManager, state } = useGame();
    const isPaused = state?.combatPaused || false;

    const handleToggle = () => {
        if (gameManager) {
            gameManager.toggleCombat();
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
                isPaused
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600/80 hover:bg-red-500 text-white'
            }`}
            title={isPaused ? 'Resume Combat' : 'Pause Combat'}
        >
            {isPaused ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Fight
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                    Rest
                </>
            )}
        </button>
    );
}

function XPBar({ level, xp }) {
    const xpForLevel = (lvl) => Math.floor(50 * Math.pow(1.3, lvl - 1));
    const xpNeeded = xpForLevel(level);
    const progress = Math.min(100, (xp / xpNeeded) * 100);

    return (
        <div className="bg-slate-950/90 backdrop-blur-sm border-t border-slate-800/50 px-4 py-2">
            <div className="flex items-center gap-4">
                {/* Level display */}
                <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-sm text-slate-400 uppercase">Lv.</span>
                    <span className="text-2xl font-bold text-purple-400">{level}</span>
                </div>
                {/* XP bar */}
                <div className="flex-1">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>XP</span>
                        <span className="font-semibold">{formatWithCommas(xp)} / {formatWithCommas(xpNeeded)}</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LevelUpOverlay({ level }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Radial flash */}
            <div
                className="absolute inset-0 animate-levelup-flash"
                style={{
                    background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.4) 0%, rgba(147, 51, 234, 0) 70%)'
                }}
            />

            {/* Rays emanating from center */}
            <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 bg-gradient-to-t from-purple-500/80 to-transparent animate-levelup-ray"
                        style={{
                            height: '50vh',
                            transformOrigin: 'bottom center',
                            transform: `rotate(${i * 30}deg)`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative flex flex-col items-center animate-levelup-content">
                {/* Glow ring */}
                <div className="absolute w-64 h-64 rounded-full border-4 border-purple-500/50 animate-levelup-ring" />
                <div className="absolute w-80 h-80 rounded-full border-2 border-yellow-400/30 animate-levelup-ring-slow" />

                {/* Stars burst */}
                <div className="absolute">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-yellow-400 text-2xl animate-levelup-star"
                            style={{
                                transform: `rotate(${i * 45}deg) translateY(-100px)`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        >
                            ★
                        </div>
                    ))}
                </div>

                {/* Text */}
                <div className="text-center relative">
                    <div
                        className="text-6xl font-black tracking-wider animate-levelup-text"
                        style={{
                            color: '#fbbf24',
                            textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(147, 51, 234, 0.6), 0 4px 0 #b45309'
                        }}
                    >
                        LEVEL UP!
                    </div>
                    <div
                        className="text-8xl font-black mt-2 animate-levelup-number"
                        style={{
                            color: '#ffffff',
                            textShadow: '0 0 30px rgba(147, 51, 234, 1), 0 0 60px rgba(147, 51, 234, 0.8), 0 6px 0 #7c3aed'
                        }}
                    >
                        {level}
                    </div>
                    <div className="text-lg text-purple-300 mt-2 animate-levelup-subtitle">
                        +3 Stat Points
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes levelup-flash {
                    0% { opacity: 0; transform: scale(0.5); }
                    20% { opacity: 1; transform: scale(1.5); }
                    100% { opacity: 0; transform: scale(2); }
                }
                @keyframes levelup-ray {
                    0% { opacity: 0; height: 0; }
                    30% { opacity: 1; height: 50vh; }
                    100% { opacity: 0; height: 60vh; }
                }
                @keyframes levelup-content {
                    0% { opacity: 0; transform: scale(0.5); }
                    20% { opacity: 1; transform: scale(1.1); }
                    30% { transform: scale(1); }
                    80% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(0.9); }
                }
                @keyframes levelup-ring {
                    0% { opacity: 0; transform: scale(0.3); }
                    30% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.5); }
                }
                @keyframes levelup-ring-slow {
                    0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
                    30% { opacity: 0.8; transform: scale(1) rotate(180deg); }
                    100% { opacity: 0; transform: scale(1.3) rotate(360deg); }
                }
                @keyframes levelup-star {
                    0% { opacity: 0; transform: rotate(var(--rotation, 0deg)) translateY(-50px) scale(0); }
                    30% { opacity: 1; transform: rotate(var(--rotation, 0deg)) translateY(-120px) scale(1.2); }
                    100% { opacity: 0; transform: rotate(var(--rotation, 0deg)) translateY(-180px) scale(0); }
                }
                @keyframes levelup-text {
                    0% { opacity: 0; transform: translateY(30px) scale(0.5); }
                    20% { opacity: 1; transform: translateY(-10px) scale(1.1); }
                    30% { transform: translateY(0) scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes levelup-number {
                    0% { opacity: 0; transform: scale(3); }
                    25% { opacity: 1; transform: scale(0.9); }
                    35% { transform: scale(1.05); }
                    45% { transform: scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes levelup-subtitle {
                    0% { opacity: 0; transform: translateY(20px); }
                    40% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-levelup-flash { animation: levelup-flash 3s ease-out forwards; }
                .animate-levelup-ray { animation: levelup-ray 2.5s ease-out forwards; }
                .animate-levelup-content { animation: levelup-content 3s ease-out forwards; }
                .animate-levelup-ring { animation: levelup-ring 2s ease-out forwards; }
                .animate-levelup-ring-slow { animation: levelup-ring-slow 3s ease-out forwards; }
                .animate-levelup-star { animation: levelup-star 2s ease-out forwards; }
                .animate-levelup-text { animation: levelup-text 3s ease-out forwards; }
                .animate-levelup-number { animation: levelup-number 3s ease-out forwards; }
                .animate-levelup-subtitle { animation: levelup-subtitle 3s ease-out forwards; }
            `}</style>
        </div>
    );
}

function KeyboardHelpModal({ onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === '?') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const shortcuts = [
        { keys: ['1', '2', '...', '0'], action: 'Switch tabs (1-9 for first 9 tabs, 0 for Settings)' },
        { keys: ['\u2190', '\u2192'], action: 'Navigate between tabs' },
        { keys: ['M'], action: 'Toggle menu collapse (expand canvas)' },
        { keys: ['Shift'], action: 'Hold while hovering item to show max possible rolls' },
        { keys: ['Middle Click'], action: 'Lock/unlock item in inventory' },
        { keys: ['?'], action: 'Toggle this help menu' },
        { keys: ['Esc'], action: 'Close modals and menus' },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-help-title"
        >
            <div
                className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="keyboard-help-title" className="text-xl font-bold text-white">
                        Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <kbd
                                        key={i}
                                        className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm font-mono text-slate-300"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                            <span className="text-slate-400 text-sm">{shortcut.action}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                    <p className="text-slate-500 text-xs">
                        Press <kbd className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] font-mono">?</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] font-mono">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}
