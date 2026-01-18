import React, { useState, useMemo } from 'react';
import GameRenderer from '../renderer/GameRenderer';
import { useGame } from '../context/GameContext';
import InventoryView from './InventoryView';
import StatsView from './StatsView';
import SkillsView from './SkillsView';
import ZoneView from './ZoneView';
import CraftingView from './CraftingView';
import EnhancementView from './EnhancementView';
import PrestigeView from './PrestigeView';
import GameTooltip from './GameTooltip';
import { getZoneById } from '../data/zones';
import { calculatePlayerStats } from '../systems/PlayerSystem';

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
    forge: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
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
    prestige: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
};

export default function GameLayout() {
    const { state } = useGame();
    const [activeTab, setActiveTab] = useState('inventory');
    const [tooltipUser, setTooltipUser] = useState(null);

    const handleHover = (item, position) => {
        if (!item) {
            setTooltipUser(null);
        } else {
            setTooltipUser({ item, position: position });
        }
    };

    if (!state) return (
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <div className="spinner mx-auto mb-4" />
                <p className="text-slate-400 font-rajdhani">Loading game...</p>
            </div>
        </div>
    );

    const currentZone = getZoneById(state.currentZone);
    const playerStats = useMemo(() => calculatePlayerStats(state), [state]);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex font-rajdhani">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Left Panel: Game Viewport */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                {/* Top Info Bar */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                    {/* Zone Info */}
                    <div className="glass-card rounded-xl p-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                {currentZone.isBoss ? (
                                    <span className="text-lg">&#128293;</span>
                                ) : (
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Current Zone</p>
                                <h2 className={`font-bold text-lg ${currentZone.isBoss ? 'text-red-400' : 'text-white'}`}>
                                    {currentZone.name.replace(/[^a-zA-Z\s]/g, '').trim()}
                                </h2>
                            </div>
                        </div>
                        {currentZone.isBoss && (
                            <div className="mt-2 px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 font-bold uppercase tracking-wider text-center">
                                Boss Battle
                            </div>
                        )}
                    </div>

                    {/* Currency Display */}
                    <div className="glass-card rounded-xl p-4 animate-fadeIn">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/30 to-amber-500/30 flex items-center justify-center">
                                    <span className="text-yellow-400 text-sm">&#9733;</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Gold</p>
                                    <p className="text-lg font-bold text-yellow-400">{state.gold.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                                    <span className="text-blue-400 text-sm">&#9830;</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Stones</p>
                                    <p className="text-lg font-bold text-blue-400">{state.enhanceStone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Canvas Area */}
                <div className="relative mt-16">
                    <GameRenderer />
                </div>

                {/* Bottom Stats Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                    <div className="glass-card rounded-xl px-6 py-3 flex items-center gap-8 animate-fadeIn">
                        <StatMini label="Level" value={state.level || 1} color="text-purple-400" />
                        <StatMini label="ATK" value={Math.floor(playerStats.damage || 10)} color="text-red-400" />
                        <StatMini label="DEF" value={Math.floor(playerStats.armor || 5)} color="text-blue-400" />
                        <StatMini label="Kills" value={state.kills || 0} color="text-green-400" />
                        {state.prestigeLevel > 0 && (
                            <StatMini label="Prestige" value={state.prestigeLevel} color="text-pink-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: UI Sidebar */}
            <div className="w-[550px] h-full flex flex-col border-l border-slate-800/50 bg-slate-900/80 backdrop-blur-sm shadow-2xl z-20">
                {/* Tab Navigation */}
                <div className="flex bg-slate-950/80 border-b border-slate-800/50">
                    {['inventory', 'stats', 'forge', 'enhance', 'skills', 'zone', 'prestige'].map((tab) => (
                        <TabButton
                            key={tab}
                            active={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            icon={TabIcons[tab]}
                        >
                            {tab === 'zone' ? 'Map' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </TabButton>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-auto custom-scrollbar p-5">
                        <div className="animate-fadeIn">
                            {activeTab === 'inventory' && <InventoryView onHover={handleHover} />}
                            {activeTab === 'stats' && <StatsView />}
                            {activeTab === 'forge' && <CraftingView />}
                            {activeTab === 'enhance' && <EnhancementView />}
                            {activeTab === 'skills' && <SkillsView />}
                            {activeTab === 'zone' && <ZoneView />}
                            {activeTab === 'prestige' && <PrestigeView />}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Gear Grinder v1.0</span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Auto-saving
                        </span>
                    </div>
                </div>

                {/* Tooltip Layer */}
                {tooltipUser && <GameTooltip tooltip={tooltipUser} />}
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200 relative group ${
                active
                    ? 'text-white bg-gradient-to-b from-blue-600/20 to-transparent'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
        >
            <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                {icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider">{children}</span>
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
            <p className={`text-lg font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
    );
}
