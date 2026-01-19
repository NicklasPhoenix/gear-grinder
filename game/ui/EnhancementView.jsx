import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getEnhanceCost, getEnhanceSuccess, getEnhanceBonus } from '../utils/formulas';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { TIERS, BOSS_STONES, addItemToInventory, removeOneFromStack, getEnhanceStage } from '../data/items';

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

            const baseCosts = getEnhanceCost(currentItem.plus);
            const needsBossStone = currentItem.bossSet && currentItem.plus >= 10;
            const costs = { ...baseCosts, bossStone: needsBossStone ? 1 : 0 };

            if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NO RESOURCES!', type: 'death', target: 'player' });
                return;
            }

            // Check boss stone requirement
            if (needsBossStone && (state.bossStones?.[currentItem.bossSet] || 0) < 1) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NEED BOSS STONE!', type: 'death', target: 'player' });
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

        // Deduct boss stone if required (boss gear +10 and above)
        if (item.bossSet && item.plus >= 10 && costs.bossStone) {
            newState.bossStones = {
                ...state.bossStones,
                [item.bossSet]: (state.bossStones?.[item.bossSet] || 0) - costs.bossStone
            };
        }

        const newPlus = success ? item.plus + 1 : Math.max(0, item.plus - 1);
        const newItem = { ...item, plus: newPlus, id: Date.now() };
        delete newItem.count;

        if (isInventoryItem) {
            let updatedInventory = removeOneFromStack(state.inventory, item.id);
            updatedInventory = addItemToInventory(updatedInventory, newItem);
            newState.inventory = updatedInventory;
        } else {
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

        if (isInventoryItem) {
            const updatedItem = newState.inventory.find(i =>
                i.slot === newItem.slot && i.tier === newItem.tier &&
                i.plus === newItem.plus && i.bossSet === newItem.bossSet
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

    const baseCosts = selectedItem ? getEnhanceCost(selectedItem.plus) : null;
    // Add boss stone cost for boss gear +10 and above
    const needsBossStone = selectedItem?.bossSet && selectedItem.plus >= 10;
    const bossStoneInfo = needsBossStone ? BOSS_STONES[selectedItem.bossSet] : null;
    const costs = baseCosts ? {
        ...baseCosts,
        bossStone: needsBossStone ? 1 : 0,
        bossStoneType: selectedItem?.bossSet
    } : null;

    const successChance = selectedItem ? getEnhanceSuccess(selectedItem.plus) : 0;
    const currentStats = selectedItem ? getEnhanceBonus(selectedItem.plus, selectedItem.tier) : null;
    const nextStats = selectedItem ? getEnhanceBonus(selectedItem.plus + 1, selectedItem.tier) : null;

    const hasBossStone = !needsBossStone || (state.bossStones?.[selectedItem?.bossSet] || 0) >= 1;
    const canAfford = costs && state.gold >= costs.gold && state.enhanceStone >= costs.enhanceStone && hasBossStone;

    return (
        <div className="h-full flex gap-2">
            {/* Left: Item List */}
            <div className="w-1/3 game-panel flex flex-col min-h-0">
                <div className="game-panel-header">Select Item</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 min-h-0">
                    {allItems.length === 0 ? (
                        <div className="text-center text-slate-600 py-4 text-xs">No items</div>
                    ) : (
                        <div className="space-y-1">
                            {allItems.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedItem?.id === item.id;
                                const stage = getEnhanceStage(item.plus);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { stopAutoEnhance(); setSelectedItem(item); }}
                                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border transition-all ${
                                            isSelected
                                                ? 'bg-blue-900/50 border-blue-500/70'
                                                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-500/50'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded bg-slate-900/50 flex-shrink-0 relative">
                                            <ItemIcon item={item} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-bold truncate" style={{ color: tierInfo.color }}>
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className="text-[9px] px-1 rounded"
                                                    style={{ color: stage.color, backgroundColor: stage.bgColor }}
                                                >
                                                    {stage.icon && <span className="mr-0.5">{stage.icon}</span>}
                                                    +{item.plus}
                                                </span>
                                                {(item.count || 1) > 1 && (
                                                    <span className="text-[9px] text-blue-400">x{item.count}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Enhancement Panel */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="game-panel-header">Enhance</div>

                {selectedItem ? (
                    <div className="flex-1 flex flex-col p-3 min-h-0">
                        {/* Selected Item Display */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-16 h-16 rounded bg-slate-900/80 border border-slate-600 relative">
                                <ItemIcon item={selectedItem} />
                                {selectedItem.plus > 0 && (
                                    <div
                                        className="absolute -top-1 -right-1 px-1 text-[9px] font-bold rounded"
                                        style={{
                                            color: getEnhanceStage(selectedItem.plus).color,
                                            backgroundColor: getEnhanceStage(selectedItem.plus).bgColor,
                                            boxShadow: getEnhanceStage(selectedItem.plus).glow
                                        }}
                                    >
                                        +{selectedItem.plus}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-sm" style={{ color: TIERS[selectedItem.tier].color }}>
                                    {selectedItem.name}
                                </div>
                                {/* Enhancement transition */}
                                <div className="flex items-center gap-2 mt-1">
                                    {(() => {
                                        const current = getEnhanceStage(selectedItem.plus);
                                        const next = getEnhanceStage(selectedItem.plus + 1);
                                        const isNewStage = current.stage !== next.stage;
                                        return (
                                            <>
                                                <span className="text-sm px-1.5 py-0.5 rounded" style={{ color: current.color, backgroundColor: current.bgColor }}>
                                                    {current.icon}{current.icon && ' '}+{selectedItem.plus}
                                                </span>
                                                <span className="text-slate-500">→</span>
                                                <span
                                                    className={`text-sm px-1.5 py-0.5 rounded ${isNewStage ? 'animate-pulse' : ''}`}
                                                    style={{ color: next.color, backgroundColor: next.bgColor, boxShadow: next.glow }}
                                                >
                                                    {next.icon}{next.icon && ' '}+{selectedItem.plus + 1}
                                                </span>
                                                {isNewStage && next.name && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded animate-pulse" style={{ color: next.color }}>
                                                        {next.name}!
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Success Rate - Visual Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                <span>SUCCESS RATE</span>
                                <span className={successChance > 80 ? 'text-green-400' : successChance > 50 ? 'text-yellow-400' : successChance > 20 ? 'text-orange-400' : 'text-red-400'}>
                                    {successChance}%
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded overflow-hidden">
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

                        {/* Stats Preview */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-slate-500 text-[9px] uppercase mb-1">Current</div>
                                <div className="text-red-300">DMG +{currentStats.dmgBonus}</div>
                                <div className="text-green-300">HP +{currentStats.hpBonus}</div>
                            </div>
                            <div className="bg-blue-900/30 rounded p-2 border border-blue-500/30">
                                <div className="text-blue-400 text-[9px] uppercase mb-1">Next</div>
                                <div className="text-red-300">DMG +{nextStats.dmgBonus}</div>
                                <div className="text-green-300">HP +{nextStats.hpBonus}</div>
                            </div>
                        </div>

                        {/* Cost */}
                        <div className="flex justify-center flex-wrap gap-3 mb-3 py-2 bg-slate-900/50 rounded">
                            <div className={`flex items-center gap-1 ${state.gold >= costs.gold ? 'opacity-100' : 'opacity-40'}`}>
                                <MaterialIcon type="gold" size={16} />
                                <span className="text-sm font-bold text-yellow-400">{costs.gold.toLocaleString()}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${state.enhanceStone >= costs.enhanceStone ? 'opacity-100' : 'opacity-40'}`}>
                                <MaterialIcon type="enhanceStone" size={16} />
                                <span className="text-sm font-bold text-blue-400">{costs.enhanceStone}</span>
                            </div>
                            {costs.blessedOrb > 0 && (
                                <div className={`flex items-center gap-1 ${state.blessedOrb >= costs.blessedOrb ? 'opacity-100' : 'opacity-40'}`}>
                                    <MaterialIcon type="blessedOrb" size={16} />
                                    <span className="text-sm font-bold text-purple-400">{costs.blessedOrb}</span>
                                </div>
                            )}
                            {needsBossStone && bossStoneInfo && (
                                <div className={`flex items-center gap-1 ${hasBossStone ? 'opacity-100' : 'opacity-40'}`}>
                                    <img
                                        src={`/assets/gems/Icon${bossStoneInfo.gemIcon}.png`}
                                        alt={bossStoneInfo.name}
                                        className="w-4 h-4"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <span className="text-sm font-bold" style={{ color: bossStoneInfo.color }}>
                                        1 ({state.bossStones?.[selectedItem.bossSet] || 0})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Boss Stone Warning */}
                        {needsBossStone && !hasBossStone && (
                            <div className="mb-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-center">
                                <span className="text-xs text-red-300">
                                    Requires {bossStoneInfo?.name} to enhance past +10
                                </span>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-auto space-y-2">
                            {autoEnhancing ? (
                                <button
                                    onClick={stopAutoEnhance}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-sm rounded flex items-center justify-center gap-2"
                                >
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    STOP (+{autoEnhanceTarget})
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEnhance}
                                        disabled={!canAfford}
                                        className={`w-full py-2.5 font-bold uppercase text-sm rounded transition-all ${
                                            canAfford
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        ENHANCE
                                    </button>
                                    <div className="flex gap-1">
                                        {[3, 5, 10].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => startAutoEnhance(selectedItem.plus + n)}
                                                disabled={!canAfford}
                                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                                                    canAfford
                                                        ? 'bg-purple-600/40 hover:bg-purple-600/60 text-purple-200'
                                                        : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                AUTO +{selectedItem.plus + n}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-600">
                        <div className="text-center">
                            <div className="text-3xl mb-2 opacity-30">⚡</div>
                            <div className="text-sm">Select an item</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
