import React from 'react';
import GameRenderer from '../renderer/GameRenderer';
import { useGame } from '../context/GameContext';
import InventoryView from './InventoryView';
import StatsView from './StatsView';
import { useState } from 'react';

export default function GameLayout() {
    const { state } = useGame();
    const [activeTab, setActiveTab] = useState('inventory');

    if (!state) return null;

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-rajdhani">
            {/* Game Viewport (PixiJS) */}
            <div className="relative z-0">
                <GameRenderer />
            </div>

            {/* UI Overlay (HUD) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-4">
                {/* Top HUD: Zone Name & Resources */}
                <div className="flex justify-between items-start pointer-events-auto w-full max-w-4xl mx-auto">
                    <div className="bg-slate-900/90 border-2 border-slate-600 p-2 rounded text-white min-w-[200px]">
                        <h1 className="text-yellow-500 font-press-start text-xs uppercase mb-1">Zone {state.currentZone}</h1>
                        <div className="text-md font-bold tracking-wide">
                            {/* Zone name from data would be better, but we don't have direct access to ZONES array here without import. 
                                Let's just trust context or add it to state if needed. For now simplest: */}
                            Current Zone
                        </div>
                    </div>

                    <div className="bg-slate-900/90 border-2 border-slate-600 p-2 rounded text-white flex gap-4 font-mono text-sm">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <span className="text-lg">🪙</span>
                            <span>{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400">
                            <span className="text-lg">💎</span>
                            <span>{state.enhanceStone}</span>
                        </div>
                    </div>
                </div>

                {/* Bottom HUD: Player Stats & Menu */}
                <div className="flex justify-center pointer-events-auto pb-8">
                    <div className="bg-slate-900/95 border-2 border-slate-600 p-4 rounded-lg text-white w-[800px] h-[300px] flex flex-col shadow-2xl">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory</TabButton>
                            <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>Attributes</TabButton>
                            <TabButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')}>Skills</TabButton>
                            <TabButton active={activeTab === 'zone'} onClick={() => setActiveTab('zone')}>Travel</TabButton>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden">
                            {activeTab === 'inventory' && <InventoryView />}
                            {activeTab === 'stats' && <StatsView />}
                            {activeTab === 'skills' && <div className="flex items-center justify-center h-full text-gray-500">Skill Tree Coming Soon</div>}
                            {activeTab === 'zone' && <div className="flex items-center justify-center h-full text-gray-500">World Map Coming Soon</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-t font-bold text-sm tracking-wider uppercase transition-colors ${active
                    ? 'bg-slate-700 text-white border-t-2 border-white'
                    : 'bg-slate-900 text-gray-500 hover:bg-slate-800 hover:text-gray-300'
                }`}
        >
            {children}
        </button>
    )
}
