import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getEnhanceCost, getEnhanceSuccess, getEnhanceBonus } from '../utils/formulas';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { TIERS } from '../data/items';

export default function EnhancementView() {
    const { state, gameManager } = useGame();
    const [selectedItem, setSelectedItem] = useState(null);
    const [autoEnhanceTarget, setAutoEnhanceTarget] = useState(null);
    const [autoEnhancing, setAutoEnhancing] = useState(false);
    const autoEnhanceRef = useRef(null);

    // Combine equipped and inventory for selection
    const allItems = [
        ...Object.values(state.gear).filter(i => i),
        ...state.inventory
    ];

    // Find the current version of selected item in state
    useEffect(() => {
        if (selectedItem) {
            const updated = allItems.find(i => i.id === selectedItem.id);
            if (updated && (updated.plus !== selectedItem.plus)) {
                setSelectedItem(updated);
            }
        }
    }, [state.gear, state.inventory]);

    // Auto-enhance logic
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
                gameManager.emit('floatingText', { text: `TARGET +${autoEnhanceTarget} REACHED!`, type: 'levelup', target: 'player' });
                return;
            }

            const costs = getEnhanceCost(currentItem.plus);
            if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NOT ENOUGH RESOURCES!', type: 'death', target: 'player' });
                return;
            }

            // Perform enhancement
            doEnhance(currentItem, costs);
        };

        autoEnhanceRef.current = setInterval(runAutoEnhance, 200);

        return () => {
            if (autoEnhanceRef.current) {
                clearInterval(autoEnhanceRef.current);
            }
        };
    }, [autoEnhancing, selectedItem, autoEnhanceTarget, state.gold, state.enhanceStone]);

    const doEnhance = (item, costs) => {
        const successChance = getEnhanceSuccess(item.plus);
        const roll = Math.random() * 100;
        const success = roll < successChance;

        let newState = {
            ...state,
            gold: state.gold - costs.gold,
            enhanceStone: state.enhanceStone - costs.enhanceStone,
            blessedOrb: state.blessedOrb - (costs.blessedOrb || 0),
            celestialShard: state.celestialShard - (costs.celestialShard || 0)
        };

        if (success) {
            const newItem = { ...item, plus: item.plus + 1 };

            if (state.inventory.find(i => i.id === newItem.id)) {
                newState.inventory = state.inventory.map(i => i.id === newItem.id ? newItem : i);
            } else {
                newState.gear = { ...state.gear, [newItem.slot]: newItem };
            }

            gameManager.setState(newState);
            gameManager.emit('floatingText', { text: `+${newItem.plus} SUCCESS!`, type: 'heal', target: 'player' });
            setSelectedItem(newItem);
        } else {
            const newPlus = Math.max(0, item.plus - 1);
            const newItem = { ...item, plus: newPlus };

            if (state.inventory.find(i => i.id === newItem.id)) {
                newState.inventory = state.inventory.map(i => i.id === newItem.id ? newItem : i);
            } else {
                newState.gear = { ...state.gear, [newItem.slot]: newItem };
            }

            newState.enhanceFails = (state.enhanceFails || 0) + 1;
            gameManager.setState(newState);
            gameManager.emit('floatingText', { text: `FAILED! +${newPlus}`, type: 'death', target: 'player' });
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
        <div className="h-full flex flex-col gap-4">
            {/* Header */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Enhancement Forge
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <MaterialIcon type="gold" size={18} />
                            <span className="text-yellow-400 font-bold">{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MaterialIcon type="enhanceStone" size={18} />
                            <span className="text-blue-400 font-bold">{state.enhanceStone}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left: Item Selector */}
                <div className="w-2/5 glass-card rounded-xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
                        <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wider">Select Item</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {allItems.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <p>No items to enhance</p>
                                <p className="text-xs mt-1">Craft or find gear first!</p>
                            </div>
                        ) : (
                            allItems.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedItem?.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            stopAutoEnhance();
                                            setSelectedItem(item);
                                        }}
                                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-all ${
                                            isSelected
                                                ? 'bg-blue-900/40 border-blue-500'
                                                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900/50 flex-shrink-0">
                                            <ItemIcon item={item} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate" style={{ color: tierInfo.color }}>
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="capitalize">{item.slot}</span>
                                                <span className="text-yellow-400 font-bold">+{item.plus}</span>
                                            </div>
                                        </div>
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: tierInfo.color }}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Enhancement Interface */}
                <div className="flex-1 glass-card rounded-xl p-5 flex flex-col">
                    {selectedItem ? (
                        <>
                            {/* Item Display */}
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                                        <ItemIcon item={selectedItem} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg" style={{ color: TIERS[selectedItem.tier].color }}>
                                            {selectedItem.name}
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-yellow-400 font-bold">+{selectedItem.plus}</span>
                                            <span className="text-slate-500 mx-2">&rarr;</span>
                                            <span className="text-green-400 font-bold">+{selectedItem.plus + 1}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Rate */}
                            <div className="mb-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                                <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 text-center">Success Chance</div>
                                <div className="flex items-center justify-center gap-3">
                                    <div className={`text-4xl font-bold ${
                                        successChance > 80 ? 'text-green-400' :
                                        successChance > 50 ? 'text-yellow-400' :
                                        successChance > 20 ? 'text-orange-400' : 'text-red-400'
                                    }`}>
                                        {successChance}%
                                    </div>
                                    <div className="flex-1 max-w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                successChance > 80 ? 'bg-green-500' :
                                                successChance > 50 ? 'bg-yellow-500' :
                                                successChance > 20 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${successChance}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stat Preview */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                                    <div className="text-xs text-slate-500 uppercase mb-1">Current Bonus</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">DMG</span>
                                            <span className="text-red-300 font-mono">+{currentStats.dmgBonus}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">HP</span>
                                            <span className="text-green-300 font-mono">+{currentStats.hpBonus}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                                    <div className="text-xs text-green-400 uppercase mb-1">Next Level</div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">DMG</span>
                                            <span className="text-red-300 font-mono">+{nextStats.dmgBonus}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">HP</span>
                                            <span className="text-green-300 font-mono">+{nextStats.hpBonus}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cost Display */}
                            <div className="flex justify-center gap-6 mb-4 p-3 rounded-lg bg-slate-900/50">
                                <div className={`flex items-center gap-2 ${state.gold >= costs.gold ? 'text-yellow-400' : 'text-red-400'}`}>
                                    <MaterialIcon type="gold" size={20} />
                                    <span className="font-bold">{costs.gold.toLocaleString()}</span>
                                </div>
                                <div className={`flex items-center gap-2 ${state.enhanceStone >= costs.enhanceStone ? 'text-blue-400' : 'text-red-400'}`}>
                                    <MaterialIcon type="enhanceStone" size={20} />
                                    <span className="font-bold">{costs.enhanceStone}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto space-y-3">
                                {autoEnhancing ? (
                                    <button
                                        onClick={stopAutoEnhance}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        STOP AUTO (+{autoEnhanceTarget})
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleEnhance}
                                            disabled={!canAfford}
                                            className={`w-full py-4 font-bold uppercase tracking-widest rounded-lg transition-all transform ${
                                                canAfford
                                                    ? 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white shadow-lg'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Enhance
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startAutoEnhance(selectedItem.plus + 3)}
                                                disabled={!canAfford}
                                                className={`flex-1 py-2 text-sm font-bold uppercase rounded-lg transition-all ${
                                                    canAfford
                                                        ? 'bg-purple-600/50 hover:bg-purple-600 text-purple-200'
                                                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                Auto +{selectedItem.plus + 3}
                                            </button>
                                            <button
                                                onClick={() => startAutoEnhance(selectedItem.plus + 5)}
                                                disabled={!canAfford}
                                                className={`flex-1 py-2 text-sm font-bold uppercase rounded-lg transition-all ${
                                                    canAfford
                                                        ? 'bg-orange-600/50 hover:bg-orange-600 text-orange-200'
                                                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                Auto +{selectedItem.plus + 5}
                                            </button>
                                            <button
                                                onClick={() => startAutoEnhance(selectedItem.plus + 10)}
                                                disabled={!canAfford}
                                                className={`flex-1 py-2 text-sm font-bold uppercase rounded-lg transition-all ${
                                                    canAfford
                                                        ? 'bg-pink-600/50 hover:bg-pink-600 text-pink-200'
                                                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                Auto +{selectedItem.plus + 10}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="mt-4 pt-3 border-t border-slate-700/30 text-center">
                                <span className="text-xs text-slate-500">
                                    Total Fails: <span className="text-red-400">{state.enhanceFails || 0}</span>
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-slate-500">
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p className="text-lg">Select an item to enhance</p>
                                <p className="text-sm mt-1">Choose from the list on the left</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
