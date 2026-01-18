import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getEnhanceCost, getEnhanceSuccess, getEnhanceBonus } from '../utils/formulas';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { TIERS, addItemToInventory, removeOneFromStack, getEnhanceStage } from '../data/items';

export default function EnhancementView() {
    const { state, gameManager } = useGame();
    const [selectedItem, setSelectedItem] = useState(null);
    const [autoEnhanceTarget, setAutoEnhanceTarget] = useState(null);
    const [autoEnhancing, setAutoEnhancing] = useState(false);
    const autoEnhanceRef = useRef(null);

    const allItems = [
        ...Object.values(state.gear).filter(i => i),
        ...state.inventory
    ];

    useEffect(() => {
        if (selectedItem) {
            const updated = allItems.find(i => i.id === selectedItem.id);
            if (updated && (updated.plus !== selectedItem.plus)) {
                setSelectedItem(updated);
            }
        }
    }, [state.gear, state.inventory]);

    useEffect(() => {
        if (!autoEnhancing || !selectedItem || autoEnhanceTarget === null) {
            if (autoEnhanceRef.current) {
                clearInterval(autoEnhanceRef.current);
                autoEnhanceRef.current = null;
            }
            return;
        }

        const runAutoEnhance = () => {
            const currentItem = allItems.find(i => i.id === selectedItem.id);
            if (!currentItem) {
                setAutoEnhancing(false);
                return;
            }

            if (currentItem.plus >= autoEnhanceTarget) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: `+${autoEnhanceTarget} DONE!`, type: 'levelup', target: 'player' });
                return;
            }

            const costs = getEnhanceCost(currentItem.plus);
            if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NO RESOURCES!', type: 'death', target: 'player' });
                return;
            }

            doEnhance(currentItem, costs);
        };

        autoEnhanceRef.current = setInterval(runAutoEnhance, 200);
        return () => { if (autoEnhanceRef.current) clearInterval(autoEnhanceRef.current); };
    }, [autoEnhancing, selectedItem, autoEnhanceTarget, state.gold, state.enhanceStone]);

    const doEnhance = (item, costs) => {
        const successChance = getEnhanceSuccess(item.plus);
        const success = Math.random() * 100 < successChance;
        const isInventoryItem = state.inventory.find(i => i.id === item.id);

        let newState = {
            ...state,
            gold: state.gold - costs.gold,
            enhanceStone: state.enhanceStone - costs.enhanceStone,
            blessedOrb: state.blessedOrb - (costs.blessedOrb || 0),
            celestialShard: state.celestialShard - (costs.celestialShard || 0)
        };

        const newPlus = success ? item.plus + 1 : Math.max(0, item.plus - 1);
        const newItem = { ...item, plus: newPlus, id: Date.now() };
        delete newItem.count; // Remove count for single enhanced item

        if (isInventoryItem) {
            // Remove one from stack and add enhanced item with stacking
            let updatedInventory = removeOneFromStack(state.inventory, item.id);
            updatedInventory = addItemToInventory(updatedInventory, newItem);
            newState.inventory = updatedInventory;
        } else {
            // Equipped item - just update in place
            newState.gear = { ...state.gear, [newItem.slot]: newItem };
        }

        if (!success) {
            newState.enhanceFails = (state.enhanceFails || 0) + 1;
        }

        gameManager.setState(newState);

        if (success) {
            gameManager.emit('floatingText', { text: `+${newItem.plus}!`, type: 'heal', target: 'player' });
        } else {
            gameManager.emit('floatingText', { text: `FAIL`, type: 'death', target: 'player' });
        }

        // Find the new item in inventory for selection
        if (isInventoryItem) {
            const updatedItem = newState.inventory.find(i =>
                i.slot === newItem.slot &&
                i.tier === newItem.tier &&
                i.plus === newItem.plus &&
                i.bossSet === newItem.bossSet
            );
            setSelectedItem(updatedItem || newItem);
        } else {
            setSelectedItem(newItem);
        }
    };

    const handleEnhance = () => {
        if (!selectedItem) return;
        const costs = getEnhanceCost(selectedItem.plus);
        if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) return;
        doEnhance(selectedItem, costs);
    };

    const startAutoEnhance = (target) => {
        if (!selectedItem) return;
        setAutoEnhanceTarget(target);
        setAutoEnhancing(true);
    };

    const stopAutoEnhance = () => {
        setAutoEnhancing(false);
        setAutoEnhanceTarget(null);
    };

    const costs = selectedItem ? getEnhanceCost(selectedItem.plus) : null;
    const successChance = selectedItem ? getEnhanceSuccess(selectedItem.plus) : 0;
    const currentStats = selectedItem ? getEnhanceBonus(selectedItem.plus, selectedItem.tier) : null;
    const nextStats = selectedItem ? getEnhanceBonus(selectedItem.plus + 1, selectedItem.tier) : null;
    const canAfford = costs && state.gold >= costs.gold && state.enhanceStone >= costs.enhanceStone;

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Header */}
            <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Enhance
                    </h2>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <MaterialIcon type="gold" size={16} />
                            <span className="text-yellow-400 font-bold">{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MaterialIcon type="enhanceStone" size={16} />
                            <span className="text-blue-400 font-bold">{state.enhanceStone}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-3 min-h-0">
                {/* Left: Item Selector */}
                <div className="w-2/5 glass-card rounded-xl overflow-hidden flex flex-col min-h-0">
                    <div className="px-3 py-2 border-b border-slate-700/50 bg-slate-900/50">
                        <h3 className="font-bold text-blue-400 text-xs uppercase tracking-wider">Items</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {allItems.length === 0 ? (
                            <div className="text-center text-slate-500 py-4 text-xs">No items</div>
                        ) : (
                            allItems.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedItem?.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { stopAutoEnhance(); setSelectedItem(item); }}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${
                                            isSelected
                                                ? 'bg-blue-900/40 border-blue-500'
                                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded overflow-hidden bg-slate-900/50 flex-shrink-0">
                                            <ItemIcon item={item} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-xs truncate" style={{ color: tierInfo.color }}>
                                                {item.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                                {(() => {
                                                    const stage = getEnhanceStage(item.plus);
                                                    return (
                                                        <span
                                                            className="px-1 rounded flex items-center gap-0.5"
                                                            style={{
                                                                color: stage.color,
                                                                backgroundColor: stage.bgColor,
                                                                boxShadow: stage.glow
                                                            }}
                                                        >
                                                            {stage.icon && <span className="text-[8px]">{stage.icon}</span>}
                                                            +{item.plus}
                                                        </span>
                                                    );
                                                })()}
                                                {(item.count || 1) > 1 && (
                                                    <span className="text-blue-400 bg-blue-500/20 px-1 rounded">x{item.count}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Enhancement Interface */}
                <div className="flex-1 glass-card rounded-xl p-3 flex flex-col min-h-0">
                    {selectedItem ? (
                        <>
                            {/* Item + Success in one row */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-600">
                                    <ItemIcon item={selectedItem} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate" style={{ color: TIERS[selectedItem.tier].color }}>
                                        {selectedItem.name}
                                    </div>
                                    <div className="text-xs flex items-center gap-1">
                                        {(() => {
                                            const currentStage = getEnhanceStage(selectedItem.plus);
                                            const nextStage = getEnhanceStage(selectedItem.plus + 1);
                                            const isNewStage = currentStage.stage !== nextStage.stage;
                                            return (
                                                <>
                                                    <span
                                                        className="px-1.5 py-0.5 rounded flex items-center gap-0.5"
                                                        style={{
                                                            color: currentStage.color,
                                                            backgroundColor: currentStage.bgColor,
                                                            boxShadow: currentStage.glow
                                                        }}
                                                    >
                                                        {currentStage.icon && <span className="text-[9px]">{currentStage.icon}</span>}
                                                        +{selectedItem.plus}
                                                    </span>
                                                    <span className="text-slate-500">&rarr;</span>
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isNewStage ? 'animate-pulse' : ''}`}
                                                        style={{
                                                            color: nextStage.color,
                                                            backgroundColor: nextStage.bgColor,
                                                            boxShadow: nextStage.glow
                                                        }}
                                                    >
                                                        {nextStage.icon && <span className="text-[9px]">{nextStage.icon}</span>}
                                                        +{selectedItem.plus + 1}
                                                    </span>
                                                    {isNewStage && nextStage.name && (
                                                        <span className="text-[9px] ml-1 px-1 py-0.5 rounded animate-pulse" style={{ color: nextStage.color, backgroundColor: nextStage.bgColor }}>
                                                            {nextStage.name}!
                                                        </span>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-500">Success</div>
                                    <div className={`text-xl font-bold ${
                                        successChance > 80 ? 'text-green-400' :
                                        successChance > 50 ? 'text-yellow-400' :
                                        successChance > 20 ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                        {successChance}%
                                    </div>
                                </div>
                            </div>

                            {/* Stats side by side */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="p-2 rounded bg-slate-800/30 border border-slate-700/30">
                                    <div className="text-[10px] text-slate-500 mb-1">Current</div>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-red-300">DMG +{currentStats.dmgBonus}</span>
                                        <span className="text-green-300">HP +{currentStats.hpBonus}</span>
                                    </div>
                                </div>
                                <div className="p-2 rounded bg-green-900/20 border border-green-500/30">
                                    <div className="text-[10px] text-green-400 mb-1">Next</div>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-red-300">DMG +{nextStats.dmgBonus}</span>
                                        <span className="text-green-300">HP +{nextStats.hpBonus}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="flex justify-center gap-4 mb-3 p-2 rounded bg-slate-900/50">
                                <div className={`flex items-center gap-1 ${state.gold >= costs.gold ? 'text-yellow-400' : 'text-red-400'}`}>
                                    <MaterialIcon type="gold" size={16} />
                                    <span className="font-bold text-sm">{costs.gold.toLocaleString()}</span>
                                </div>
                                <div className={`flex items-center gap-1 ${state.enhanceStone >= costs.enhanceStone ? 'text-blue-400' : 'text-red-400'}`}>
                                    <MaterialIcon type="enhanceStone" size={16} />
                                    <span className="font-bold text-sm">{costs.enhanceStone}</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-auto space-y-2">
                                {autoEnhancing ? (
                                    <button
                                        onClick={stopAutoEnhance}
                                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-sm rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        STOP (+{autoEnhanceTarget})
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleEnhance}
                                            disabled={!canAfford}
                                            className={`w-full py-3 font-bold uppercase text-sm rounded-lg transition-all ${
                                                canAfford
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Enhance
                                        </button>
                                        <div className="flex gap-2">
                                            {[3, 5, 10].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => startAutoEnhance(selectedItem.plus + n)}
                                                    disabled={!canAfford}
                                                    className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${
                                                        canAfford
                                                            ? 'bg-purple-600/50 hover:bg-purple-600 text-purple-200'
                                                            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    +{selectedItem.plus + n}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-slate-500 text-sm">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Select an item
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
