import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS, getItemScore, getSalvageReturns, BOSS_SETS, addItemToInventory, removeOneFromStack, getEnhanceStage } from '../data/items';

const SLOT_NAMES = {
    weapon: 'WPN',
    helmet: 'HEAD',
    armor: 'BODY',
    boots: 'FEET',
    shield: 'OFF',
    gloves: 'HAND',
    amulet: 'NECK',
    accessory: 'RING',
};

export default function InventoryView({ onHover }) {
    const { state, gameManager } = useGame();
    const [selectedForSalvage, setSelectedForSalvage] = useState(new Set());

    const handleEquipBest = () => {
        let newGear = { ...state.gear };
        let newInv = [...state.inventory];
        let equipped = 0;

        for (const slot of GEAR_SLOTS) {
            const slotItems = newInv.filter(item => item.slot === slot);
            if (slotItems.length === 0) continue;

            const bestInvItem = slotItems.reduce((best, item) => {
                return getItemScore(item) > getItemScore(best) ? item : best;
            }, slotItems[0]);

            const currentEquipped = newGear[slot];
            const currentScore = getItemScore(currentEquipped);
            const bestScore = getItemScore(bestInvItem);

            if (bestScore > currentScore) {
                newInv = newInv.filter(i => i.id !== bestInvItem.id);
                if (currentEquipped) {
                    newInv.push(currentEquipped);
                }
                newGear[slot] = bestInvItem;
                equipped++;
            }
        }

        if (equipped > 0) {
            gameManager.setState(prev => ({ ...prev, gear: newGear, inventory: newInv }));
            gameManager.emit('floatingText', { text: `EQUIPPED ${equipped}!`, type: 'heal', target: 'player' });
        }
    };

    const toggleSalvageSelection = (itemId) => {
        setSelectedForSalvage(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };

    const handleSalvage = () => {
        if (selectedForSalvage.size === 0) return;
        let totalGold = 0, totalStones = 0;
        const itemsToSalvage = state.inventory.filter(item => selectedForSalvage.has(item.id));
        for (const item of itemsToSalvage) {
            const returns = getSalvageReturns(item);
            totalGold += returns.gold;
            totalStones += returns.enhanceStone;
        }
        const newInv = state.inventory.filter(item => !selectedForSalvage.has(item.id));
        gameManager.setState(prev => ({
            ...prev, inventory: newInv,
            gold: (prev.gold || 0) + totalGold,
            enhanceStone: (prev.enhanceStone || 0) + totalStones,
        }));
        setSelectedForSalvage(new Set());
        gameManager.emit('floatingText', { text: `+${totalGold}g`, type: 'heal', target: 'player' });
    };

    const handleSalvageAll = () => {
        if (state.inventory.length === 0) return;
        let totalGold = 0, totalStones = 0;
        for (const item of state.inventory) {
            const returns = getSalvageReturns(item);
            totalGold += returns.gold;
            totalStones += returns.enhanceStone;
        }
        gameManager.setState(prev => ({
            ...prev, inventory: [],
            gold: (prev.gold || 0) + totalGold,
            enhanceStone: (prev.enhanceStone || 0) + totalStones,
        }));
        setSelectedForSalvage(new Set());
        gameManager.emit('floatingText', { text: `+${totalGold}g`, type: 'heal', target: 'player' });
    };

    const handleEquip = (item) => {
        let newGear = { ...state.gear };
        const oldItem = newGear[item.slot];
        let newInv = removeOneFromStack(state.inventory, item.id);
        const equippedItem = { ...item };
        delete equippedItem.count;
        newGear[item.slot] = equippedItem;
        if (oldItem) {
            newInv = addItemToInventory(newInv, { ...oldItem, id: Date.now() });
        }
        gameManager.setState(prev => ({ ...prev, gear: newGear, inventory: newInv }));
    };

    const handleUnequip = (item) => {
        if (!item) return;
        gameManager.setState(prev => ({
            ...prev,
            gear: { ...prev.gear, [item.slot]: null },
            inventory: addItemToInventory(prev.inventory, { ...item, id: Date.now() })
        }));
    };

    const toggleAutoSalvage = () => {
        gameManager.setState(prev => ({ ...prev, autoSalvage: !prev.autoSalvage }));
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Equipped Gear - Compact 2x4 grid */}
            <div className="game-panel">
                <div className="game-panel-header flex justify-between items-center">
                    <span>Equipped</span>
                    <button
                        onClick={handleEquipBest}
                        className="px-2 py-0.5 text-[9px] bg-green-600/40 hover:bg-green-600/60 text-green-300 rounded transition-colors"
                    >
                        EQUIP BEST
                    </button>
                </div>
                <div className="p-2">
                    <div className="grid grid-cols-4 gap-1">
                        {GEAR_SLOTS.map(slot => {
                            const item = state.gear[slot];
                            const tierInfo = item ? TIERS[item.tier] : null;
                            const setInfo = item?.bossSet ? BOSS_SETS[item.bossSet] : null;
                            const stage = item?.plus > 0 ? getEnhanceStage(item.plus) : null;

                            return (
                                <div
                                    key={slot}
                                    className="relative aspect-square bg-slate-900/80 border border-slate-700/50 rounded cursor-pointer hover:border-blue-500/50 transition-colors"
                                    style={item && setInfo ? {
                                        borderColor: setInfo.color,
                                        boxShadow: `inset 0 0 8px ${setInfo.color}30`
                                    } : undefined}
                                    onClick={() => item && handleUnequip(item)}
                                    onMouseEnter={(e) => onHover && item && onHover(item, { x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => onHover && onHover(null)}
                                >
                                    {item ? (
                                        <>
                                            <div className="absolute inset-1">
                                                <ItemIcon item={item} />
                                            </div>
                                            {/* Enhancement badge */}
                                            {item.plus > 0 && stage && (
                                                <div
                                                    className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[11px] font-bold rounded flex items-center"
                                                    style={{
                                                        backgroundColor: stage.bgColor,
                                                        color: stage.color,
                                                        boxShadow: stage.glow
                                                    }}
                                                >
                                                    {stage.icon && <span className="text-[9px] mr-0.5">{stage.icon}</span>}
                                                    +{item.plus}
                                                </div>
                                            )}
                                            {/* Set indicator */}
                                            {setInfo && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: setInfo.color }} />
                                            )}
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[8px] text-slate-600 font-bold">{SLOT_NAMES[slot]}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Inventory Grid - Fixed height with internal scroll */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="game-panel-header flex justify-between items-center">
                    <span>Inventory ({state.inventory.length}/50)</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleAutoSalvage}
                            className={`px-2 py-0.5 text-[9px] rounded transition-colors ${
                                state.autoSalvage
                                    ? 'bg-green-600/50 text-green-300'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                            }`}
                        >
                            AUTO
                        </button>
                        {selectedForSalvage.size > 0 && (
                            <button
                                onClick={handleSalvage}
                                className="px-2 py-0.5 text-[9px] bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded"
                            >
                                SALVAGE ({selectedForSalvage.size})
                            </button>
                        )}
                        {state.inventory.length > 0 && (
                            <button
                                onClick={handleSalvageAll}
                                className="px-2 py-0.5 text-[9px] bg-orange-600/40 hover:bg-orange-600/60 text-orange-300 rounded"
                            >
                                ALL
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {state.inventory.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                            Empty
                        </div>
                    ) : (
                        <div className="grid grid-cols-8 gap-1">
                            {state.inventory.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedForSalvage.has(item.id);
                                const setInfo = item.bossSet ? BOSS_SETS[item.bossSet] : null;
                                const stage = item.plus > 0 ? getEnhanceStage(item.plus) : null;

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative aspect-square bg-slate-900/60 border rounded cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-red-500 bg-red-500/20'
                                                : 'border-slate-700/40 hover:border-blue-500/50'
                                        }`}
                                        style={!isSelected && setInfo ? {
                                            borderColor: setInfo.color,
                                            boxShadow: `inset 0 0 6px ${setInfo.color}30`
                                        } : undefined}
                                        onClick={() => handleEquip(item)}
                                        onContextMenu={(e) => { e.preventDefault(); toggleSalvageSelection(item.id); }}
                                        onMouseEnter={(e) => onHover && onHover(item, { x: e.clientX, y: e.clientY }, true)}
                                        onMouseLeave={() => onHover && onHover(null)}
                                    >
                                        <div className="absolute inset-0.5">
                                            <ItemIcon item={item} size="sm" />
                                        </div>

                                        {/* Tier indicator dot */}
                                        <div
                                            className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: tierInfo?.color || '#666' }}
                                        />

                                        {/* Enhancement badge */}
                                        {item.plus > 0 && stage && (
                                            <div
                                                className="absolute -top-1 -right-1 px-1 py-0.5 text-[9px] font-bold rounded flex items-center"
                                                style={{
                                                    backgroundColor: stage.bgColor,
                                                    color: stage.color,
                                                    boxShadow: stage.glow
                                                }}
                                            >
                                                {stage.icon && <span className="text-[7px] mr-0.5">{stage.icon}</span>}
                                                +{item.plus}
                                            </div>
                                        )}

                                        {/* Stack count */}
                                        {(item.count || 1) > 1 && (
                                            <div className="absolute bottom-0 left-0 text-[7px] font-bold text-white bg-blue-600/90 px-0.5 rounded-tr">
                                                x{item.count}
                                            </div>
                                        )}

                                        {/* Selection X */}
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                                                <span className="text-red-400 text-lg font-bold">×</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-2 py-1 border-t border-slate-700/30 text-[9px] text-slate-500 text-center">
                    Click to equip · Right-click to salvage
                </div>
            </div>
        </div>
    );
}
