import React, { useState, useMemo, useEffect, useRef } from 'react';
import GameRenderer from '../renderer/GameRenderer';
import { useGame } from '../context/GameContext';
import InventoryView from './InventoryView';
import StatsView from './StatsView';
import SkillsView from './SkillsView';
import ZoneView from './ZoneView';
import EnhancementView from './EnhancementView';
import PrestigeView from './PrestigeView';
import GameTooltip from './GameTooltip';
import { MaterialIcon } from './MaterialIcons';
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
    const [levelUpAnimation, setLevelUpAnimation] = useState(null);
    const prevLevelRef = useRef(state?.level || 1);

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

                    {/* Currency Display - All Materials */}
                    <div className="glass-card rounded-xl p-3 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3">
                            <MaterialDisplay type="gold" value={state.gold} color="text-yellow-400" />
                            <MaterialDisplay type="enhanceStone" value={state.enhanceStone} color="text-blue-400" />
                            <MaterialDisplay type="blessedOrb" value={state.blessedOrb} color="text-purple-400" />
                            <MaterialDisplay type="celestialShard" value={state.celestialShard} color="text-yellow-300" />
                            {state.prestigeLevel > 0 && (
                                <MaterialDisplay type="prestigeStone" value={state.prestigeStones} color="text-pink-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Game Canvas Area */}
                <div className="relative mt-16">
                    <GameRenderer />
                </div>

                {/* Bottom Stats Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                    <div className="glass-card rounded-xl px-6 py-3 animate-fadeIn">
                        <div className="flex items-center gap-8">
                            <StatMini label="Level" value={state.level || 1} color="text-purple-400" />
                            <StatMini label="ATK" value={Math.floor(playerStats.damage || 10)} color="text-red-400" />
                            <StatMini label="DEF" value={Math.floor(playerStats.armor || 5)} color="text-blue-400" />
                            <StatMini label="Kills" value={state.kills || 0} color="text-green-400" />
                            {state.prestigeLevel > 0 && (
                                <StatMini label="Prestige" value={state.prestigeLevel} color="text-pink-400" />
                            )}
                        </div>
                        <XPBar level={state.level || 1} xp={state.xp || 0} />
                    </div>
                </div>
            </div>

            {/* Right Panel: UI Sidebar */}
            <div className="w-[550px] h-full flex flex-col border-l border-slate-800/50 bg-slate-900/80 backdrop-blur-sm shadow-2xl z-20">
                {/* Tab Navigation */}
                <div className="flex bg-slate-950/80 border-b border-slate-800/50">
                    {['inventory', 'stats', 'enhance', 'skills', 'zone', 'prestige'].map((tab) => (
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

                {/* Content Area - Fixed height, no outer scroll */}
                <div className="flex-1 overflow-hidden p-3">
                    <div className="h-full animate-fadeIn">
                        {activeTab === 'inventory' && <InventoryView onHover={handleHover} />}
                        {activeTab === 'stats' && <StatsView />}
                        {activeTab === 'enhance' && <EnhancementView />}
                        {activeTab === 'skills' && <SkillsView />}
                        {activeTab === 'zone' && <ZoneView />}
                        {activeTab === 'prestige' && <PrestigeView />}
                    </div>
                </div>

                {/* Footer with Speed Control */}
                <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-950/50">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Gear Grinder v1.0</span>
                        <SpeedControl />
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Auto-saving
                        </span>
                    </div>
                </div>
            </div>

            {/* Tooltip Layer - outside panels to avoid stacking context issues */}
            {tooltipUser && <GameTooltip tooltip={tooltipUser} />}

            {/* Level Up Animation Overlay */}
            {levelUpAnimation && <LevelUpOverlay level={levelUpAnimation.level} />}
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

const MATERIAL_NAMES = {
    gold: 'Gold',
    enhanceStone: 'E.Stone',
    blessedOrb: 'B.Orb',
    celestialShard: 'C.Shard',
    prestigeStone: 'P.Stone',
};

function MaterialDisplay({ type, value, color }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 flex items-center justify-center">
                <MaterialIcon type={type} size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] text-slate-500 uppercase truncate">{MATERIAL_NAMES[type]}</p>
                <p className={`text-sm font-bold ${color} leading-none`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>
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

function XPBar({ level, xp }) {
    const xpForLevel = (lvl) => Math.floor(50 * Math.pow(1.3, lvl - 1));
    const xpNeeded = xpForLevel(level);
    const progress = Math.min(100, (xp / xpNeeded) * 100);

    return (
        <div className="mt-2">
            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                <span>XP</span>
                <span>{xp.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
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
