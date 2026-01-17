import React, { useState } from 'react';
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

    if (!state) return null;

    return (
        <div className="w-screen h-screen bg-black overflow-hidden flex font-rajdhani">
            {/* Left Panel: Game Viewport */}
            <div className="flex-1 relative bg-[#0f0f11] flex flex-col items-center justify-center">
                {/* Top Info Bar (Floating) */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between z-10 pointer-events-none">
                    <div className="bg-slate-900/90 border-2 border-slate-700 p-3 rounded shadow-lg text-white pointer-events-auto">
                        <h1 className="text-yellow-500 font-press-start text-xs uppercase mb-1">Zone {state.currentZone}</h1>
                        <div className="text-xl font-bold tracking-wide text-gray-200">
                            Current Zone
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border-2 border-slate-700 p-3 rounded shadow-lg text-white flex gap-6 font-mono font-bold pointer-events-auto">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <span className="text-xl">🪙</span>
                            <span className="text-xl">{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400">
                            <span className="text-xl">💎</span>
                            <span className="text-xl">{state.enhanceStone}</span>
                        </div>
                    </div>
                </div>

                {/* Pixi Canvas */}
                <div className="border-4 border-slate-800 hover:border-slate-700 transition-colors rounded-lg shadow-2xl relative">
                    <GameRenderer />
                    <div className="absolute -bottom-8 left-0 w-full text-center text-slate-500 text-xs uppercase tracking-widest">
                        Game Running - 60 FPS
                    </div>
                </div>
            </div>

            {/* Right Panel: UI HUD (Sidebar) */}
            <div className="w-[600px] h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20">
                {/* Header / Tabs */}
                <div className="flex bg-slate-950 border-b border-slate-800 p-2 gap-1 shadow-md">
                    <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory</TabButton>
                    <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>Attributes</TabButton>
                    <TabButton active={activeTab === 'forge'} onClick={() => setActiveTab('forge')}>Forge</TabButton>
                    <TabButton active={activeTab === 'enhance'} onClick={() => setActiveTab('enhance')}>Enhance</TabButton>
                    <TabButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>Skills</TabButton>
                    <TabButton active={activeTab === 'zone'} onClick={() => setActiveTab('zone')}>Map</TabButton>
                    <TabButton active={activeTab === 'prestige'} onClick={() => setActiveTab('prestige')}>Prestige</TabButton>
                </div>

                {/* Full Height Content */}
                <div className="flex-1 overflow-auto bg-slate-900 p-6 relative custom-scrollbar">
                    {activeTab === 'inventory' && <InventoryView onHover={handleHover} />}
                    {activeTab === 'stats' && <StatsView />}
                    {activeTab === 'forge' && <CraftingView />}
                    {activeTab === 'enhance' && <EnhancementView />}
                    {activeTab === 'skills' && <SkillsView />}
                    {activeTab === 'zone' && <ZoneView />}
                    {activeTab === 'prestige' && <PrestigeView />}
                </div>

                {/* Global Tooltip Layer */}
                {tooltipUser && <GameTooltip tooltip={tooltipUser} />}
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-4 font-bold text-sm tracking-wider uppercase transition-all duration-200 clip-path-slant ${active
                ? 'bg-gradient-to-t from-blue-900 to-slate-800 text-white border-b-2 border-blue-500 shadow-inner'
                : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-slate-800'
                }`}
        >
            {children}
        </button>
    )
}
