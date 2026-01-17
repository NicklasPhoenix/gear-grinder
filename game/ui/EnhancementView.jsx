import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getEnhanceCost, getEnhanceSuccess, getEnhanceBonus } from '../utils/formulas';
import ItemIcon from './ItemIcon';
import { TIERS, MATERIALS } from '../data/items';

export default function EnhancementView() {
    const { state, gameManager } = useGame();
    const [selectedItem, setSelectedItem] = useState(null);

    // Combine equipped and inventory for selection
    const allItems = [
        ...Object.values(state.gear).filter(i => i),
        ...state.inventory
    ];

    const handleEnhance = () => {
        if (!selectedItem) return;
        const costs = getEnhanceCost(selectedItem.plus);

        // Check costs
        if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) return;

        const successChance = getEnhanceSuccess(selectedItem.plus);
        const roll = Math.random() * 100;
        const success = roll < successChance;

        // Deduct materials
        let newState = {
            ...state,
            gold: state.gold - costs.gold,
            enhanceStone: state.enhanceStone - costs.enhanceStone,
            blessedOrb: state.blessedOrb - costs.blessedOrb,
            celestialShard: state.celestialShard - costs.celestialShard
        };

        if (success) {
            // Success Logic
            const newItem = { ...selectedItem, plus: selectedItem.plus + 1 };

            // Update in place
            if (state.inventory.find(i => i.id === newItem.id)) {
                newState.inventory = state.inventory.map(i => i.id === newItem.id ? newItem : i);
            } else {
                newState.gear = { ...state.gear, [newItem.slot]: newItem };
            }

            gameManager.setState(newState);
            gameManager.emit('floatingText', { x: 400, y: 225, text: "SUCCESS!", color: "#22c55e" });
            setSelectedItem(newItem); // Update selection
        } else {
            // Fail Logic
            const newItem = { ...selectedItem, plus: Math.max(0, selectedItem.plus - 1) };

            // Update in place
            if (state.inventory.find(i => i.id === newItem.id)) {
                newState.inventory = state.inventory.map(i => i.id === newItem.id ? newItem : i);
            } else {
                newState.gear = { ...state.gear, [newItem.slot]: newItem };
            }

            newState.enhanceFails = (state.enhanceFails || 0) + 1;
            gameManager.setState(newState);
            gameManager.emit('floatingText', { x: 400, y: 225, text: "FAILED", color: "#ef4444" });
            setSelectedItem(newItem);
        }
    };

    const costs = selectedItem ? getEnhanceCost(selectedItem.plus) : null;
    const successChance = selectedItem ? getEnhanceSuccess(selectedItem.plus) : 0;

    // Calculate stats preview
    const currentStats = selectedItem ? getEnhanceBonus(selectedItem.plus, selectedItem.tier) : null;
    const nextStats = selectedItem ? getEnhanceBonus(selectedItem.plus + 1, selectedItem.tier) : null;


    return (
        <div className="h-full flex flex-row gap-4">
            {/* Left: Item Selector */}
            <div className="w-1/3 bg-slate-900 border-r border-slate-700 flex flex-col">
                <h3 className="font-bold text-blue-400 p-2 border-b border-slate-700">Select Item</h3>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    {allItems.map(item => (
                        <div key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${selectedItem?.id === item.id ? 'bg-blue-900/50 border-blue-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                        >
                            <div className="w-8 h-8 rounded overflow-hidden">
                                <ItemIcon item={item} size="sm" />
                            </div>
                            <div className="text-xs">
                                <div style={{ color: TIERS[item.tier].color }} className="font-bold">{item.name} +{item.plus}</div>
                                <div className="text-slate-500 capitalize">{item.tier > 0 ? TIERS[item.tier].name : ''} {item.slot}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Enhancement Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {selectedItem ? (
                    <div className="w-full max-w-sm">

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="text-xl font-bold" style={{ color: TIERS[selectedItem.tier].color }}>
                                {selectedItem.name} <span className="text-white">+{selectedItem.plus}</span>
                            </div>
                            <div className="text-slate-400 text-sm">Target: +{selectedItem.plus + 1}</div>
                        </div>

                        {/* Success Rate Circle or Bar */}
                        <div className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-600 text-center">
                            <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Success Chance</div>
                            <div className={`text-3xl font-bold ${successChance > 80 ? 'text-green-500' : (successChance > 40 ? 'text-yellow-500' : 'text-red-500')}`}>
                                {successChance}%
                            </div>
                        </div>

                        {/* Stat Gain Preview */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-slate-500 text-xs">Bonus Stats</div>
                                <div className="text-white font-mono">
                                    DMG: +{currentStats.dmgBonus}<br />
                                    HP: +{currentStats.hpBonus}
                                </div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded border border-green-500/30">
                                <div className="text-green-500 text-xs">Next Level</div>
                                <div className="text-green-300 font-mono">
                                    DMG: +{nextStats.dmgBonus}<br />
                                    HP: +{nextStats.hpBonus}
                                </div>
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="flex justify-between items-center text-sm mb-6 bg-slate-950 p-2 rounded">
                            <div className={state.gold >= costs.gold ? 'text-yellow-500' : 'text-red-500'}>
                                {costs.gold.toLocaleString()} Gold
                            </div>
                            <div className={state.enhanceStone >= costs.enhanceStone ? 'text-blue-400' : 'text-red-500'}>
                                {costs.enhanceStone} {MATERIALS.enhanceStone.name}
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            onClick={handleEnhance}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest shadow-lg rounded transition-all transform hover:scale-105"
                        >
                            Enhance
                        </button>

                    </div>
                ) : (
                    <div className="text-slate-500 italic">Select an item to enhance...</div>
                )}
            </div>
        </div>
    );
}
