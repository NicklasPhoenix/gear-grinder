import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS, getItemScore, getSalvageReturns, BOSS_SETS } from '../data/items';

const SLOT_ICONS = {
    weapon: '&#9876;',
    helmet: '&#9681;',
    armor: '&#9635;',
    boots: '&#8982;',
    shield: '&#9974;',
    gloves: '&#9758;',
    amulet: '&#9688;',
    accessory: '&#9733;',
};

const SLOT_NAMES = {
    weapon: 'Weapon',
    helmet: 'Helmet',
    armor: 'Armor',
    boots: 'Boots',
    shield: 'Shield',
    gloves: 'Gloves',
    amulet: 'Amulet',
    accessory: 'Ring',
};

export default function InventoryView({ onHover }) {
    const { state, gameManager } = useGame();
    const [selectedForSalvage, setSelectedForSalvage] = useState(new Set());

    // Equip Best - automatically equip highest scored item for each slot
    const handleEquipBest = () => {
        let newGear = { ...state.gear };
        let newInv = [...state.inventory];
        let equipped = 0;

        for (const slot of GEAR_SLOTS) {
            // Get all items for this slot (in inventory)
            const slotItems = newInv.filter(item => item.slot === slot);
            if (slotItems.length === 0) continue;

            // Find the best item
            const bestInvItem = slotItems.reduce((best, item) => {
                return getItemScore(item) > getItemScore(best) ? item : best;
            }, slotItems[0]);

            // Compare with currently equipped
            const currentEquipped = newGear[slot];
            const currentScore = getItemScore(currentEquipped);
            const bestScore = getItemScore(bestInvItem);

            if (bestScore > currentScore) {
                // Swap items
                newInv = newInv.filter(i => i.id !== bestInvItem.id);
                if (currentEquipped) {
                    newInv.push(currentEquipped);
                }
                newGear[slot] = bestInvItem;
                equipped++;
            }
        }

        if (equipped > 0) {
            gameManager.setState(prev => ({
                ...prev,
                gear: newGear,
                inventory: newInv
            }));
            gameManager.emit('floatingText', { text: `EQUIPPED ${equipped}!`, type: 'heal', target: 'player' });
        }
    };

    // Toggle item selection for salvage
    const toggleSalvageSelection = (itemId) => {
        setSelectedForSalvage(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Salvage selected items
    const handleSalvage = () => {
        if (selectedForSalvage.size === 0) return;

        let totalGold = 0;
        let totalOre = 0;
        let totalLeather = 0;
        let totalStones = 0;

        const itemsToSalvage = state.inventory.filter(item => selectedForSalvage.has(item.id));

        for (const item of itemsToSalvage) {
            const returns = getSalvageReturns(item);
            totalGold += returns.gold;
            totalOre += returns.ore;
            totalLeather += returns.leather;
            totalStones += returns.enhanceStone;
        }

        const newInv = state.inventory.filter(item => !selectedForSalvage.has(item.id));

        gameManager.setState(prev => ({
            ...prev,
            inventory: newInv,
            gold: (prev.gold || 0) + totalGold,
            ore: (prev.ore || 0) + totalOre,
            leather: (prev.leather || 0) + totalLeather,
            enhanceStone: (prev.enhanceStone || 0) + totalStones,
        }));

        setSelectedForSalvage(new Set());
        gameManager.emit('floatingText', { text: `+${totalGold} GOLD`, type: 'heal', target: 'player' });
    };

    // Salvage all items in inventory
    const handleSalvageAll = () => {
        if (state.inventory.length === 0) return;

        let totalGold = 0;
        let totalOre = 0;
        let totalLeather = 0;
        let totalStones = 0;

        for (const item of state.inventory) {
            const returns = getSalvageReturns(item);
            totalGold += returns.gold;
            totalOre += returns.ore;
            totalLeather += returns.leather;
            totalStones += returns.enhanceStone;
        }

        gameManager.setState(prev => ({
            ...prev,
            inventory: [],
            gold: (prev.gold || 0) + totalGold,
            ore: (prev.ore || 0) + totalOre,
            leather: (prev.leather || 0) + totalLeather,
            enhanceStone: (prev.enhanceStone || 0) + totalStones,
        }));

        setSelectedForSalvage(new Set());
        gameManager.emit('floatingText', { text: `SALVAGED ALL! +${totalGold}g`, type: 'heal', target: 'player' });
    };

    const handleEquip = (item) => {
        let newGear = { ...state.gear };
        let newInv = [...state.inventory];
        const oldItem = newGear[item.slot];

        newInv = newInv.filter(i => i.id !== item.id);
        newGear[item.slot] = item;

        if (oldItem) {
            newInv.push(oldItem);
        }

        gameManager.setState(prev => ({
            ...prev,
            gear: newGear,
            inventory: newInv
        }));

        gameManager.emit('floatingText', { text: "EQUIPPED!", type: 'heal', target: 'player' });
    };

    const handleUnequip = (item) => {
        if (!item) return;
        gameManager.setState(prev => ({
            ...prev,
            gear: { ...prev.gear, [item.slot]: null },
            inventory: [...prev.inventory, item]
        }));
        gameManager.emit('floatingText', { text: "UNEQUIPPED", type: 'damage', target: 'player' });
    };

    // Toggle auto-salvage
    const toggleAutoSalvage = () => {
        gameManager.setState(prev => ({
            ...prev,
            autoSalvage: !prev.autoSalvage
        }));
    };

    const getTierGlow = (tier) => {
        if (tier < 2) return '';
        const glowClasses = [
            '', '',
            'shadow-[0_0_10px_rgba(59,130,246,0.4)]',
            'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
            'shadow-[0_0_15px_rgba(249,115,22,0.5)]',
            'shadow-[0_0_15px_rgba(236,72,153,0.5)]',
            'shadow-[0_0_18px_rgba(251,191,36,0.5)]',
            'shadow-[0_0_18px_rgba(56,189,248,0.5)]',
            'shadow-[0_0_20px_rgba(129,140,248,0.5)]',
            'shadow-[0_0_25px_rgba(244,114,182,0.6)]',
        ];
        return glowClasses[tier] || '';
    };

    return (
        <div className="flex flex-col h-full gap-5">
            {/* Equipped Section */}
            <div className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        Equipped Gear
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEquipBest}
                            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-600/30 hover:bg-green-600/50 text-green-400 rounded transition-colors"
                        >
                            Equip Best
                        </button>
                        <span className="text-xs text-slate-400">{Object.values(state.gear).filter(Boolean).length}/{GEAR_SLOTS.length}</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {GEAR_SLOTS.map(slot => {
                        const item = state.gear[slot];
                        const tierInfo = item ? TIERS[item.tier] : null;
                        const setInfo = item?.bossSet ? BOSS_SETS[item.bossSet] : null;
                        return (
                            <div
                                key={slot}
                                className={`
                                    relative aspect-square rounded-lg overflow-hidden
                                    bg-gradient-to-br from-slate-800/80 to-slate-900/80
                                    border-2 transition-all duration-200 cursor-pointer group
                                    ${item
                                        ? setInfo
                                            ? ''
                                            : `border-slate-600/50 hover:border-blue-500/70 ${getTierGlow(item.tier)}`
                                        : 'border-slate-700/30 border-dashed hover:border-slate-500/50'
                                    }
                                `}
                                style={item && setInfo ? {
                                    borderColor: setInfo.color,
                                    boxShadow: `0 0 15px ${setInfo.color}60, inset 0 0 10px ${setInfo.color}25`
                                } : undefined}
                                onClick={() => item && handleUnequip(item)}
                                onMouseEnter={(e) => onHover && item && onHover(item, { x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => onHover && onHover(null)}
                            >
                                {item ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                            <ItemIcon item={item} />
                                        </div>

                                        {/* Set indicator - star icon for set items */}
                                        {setInfo && (
                                            <div
                                                className="absolute top-0.5 left-0.5 w-4 h-4 flex items-center justify-center"
                                                style={{ color: setInfo.color }}
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Enhancement level */}
                                        {item.plus > 0 && (
                                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-yellow-400">
                                                +{item.plus}
                                            </div>
                                        )}

                                        {/* Tier indicator */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-1 opacity-80"
                                            style={{ backgroundColor: setInfo?.color || tierInfo?.color || '#666' }}
                                        />

                                        {/* Item name on hover */}
                                        <div className="absolute inset-x-0 bottom-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] px-1 py-0.5 bg-black/80 rounded text-white truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                                        <span className="text-lg opacity-30" dangerouslySetInnerHTML={{ __html: SLOT_ICONS[slot] || '?' }} />
                                        <span className="text-[9px] uppercase tracking-wider mt-1 opacity-50">{SLOT_NAMES[slot]}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="flex-1 glass-card rounded-xl p-5 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Backpack
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Auto-Salvage Toggle */}
                        <button
                            onClick={toggleAutoSalvage}
                            className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1 ${
                                state.autoSalvage
                                    ? 'bg-green-600/40 text-green-300 border border-green-500/50'
                                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-600/50'
                            }`}
                            title="Auto-salvage dropped items"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Auto
                            {state.autoSalvage && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            )}
                        </button>
                        {selectedForSalvage.size > 0 && (
                            <button
                                onClick={handleSalvage}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded transition-colors"
                            >
                                Salvage ({selectedForSalvage.size})
                            </button>
                        )}
                        {state.inventory.length > 0 && (
                            <button
                                onClick={handleSalvageAll}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-orange-600/30 hover:bg-orange-600/50 text-orange-400 rounded transition-colors"
                            >
                                Salvage All
                            </button>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                            {state.inventory.length}/50
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {state.inventory.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="text-sm">No items yet</p>
                                <p className="text-xs mt-1">Defeat enemies to get loot!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-6 gap-2 content-start">
                            {state.inventory.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedForSalvage.has(item.id);
                                const setInfo = item.bossSet ? BOSS_SETS[item.bossSet] : null;
                                return (
                                    <div
                                        key={item.id}
                                        className={`
                                            relative aspect-square rounded-lg overflow-hidden
                                            bg-gradient-to-br from-slate-800/60 to-slate-900/60
                                            border-2
                                            ${isSelected
                                                ? 'border-red-500 bg-red-500/20'
                                                : setInfo
                                                    ? 'hover:scale-105'
                                                    : 'border-slate-700/40 hover:border-blue-500/60'
                                            }
                                            hover:scale-105
                                            cursor-pointer transition-all duration-150
                                            ${setInfo ? '' : getTierGlow(item.tier)}
                                        `}
                                        style={!isSelected && setInfo ? {
                                            borderColor: setInfo.color,
                                            boxShadow: `0 0 12px ${setInfo.color}50, inset 0 0 8px ${setInfo.color}20`
                                        } : undefined}
                                        onClick={() => handleEquip(item)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            toggleSalvageSelection(item.id);
                                        }}
                                        onMouseEnter={(e) => onHover && onHover(item, { x: e.clientX, y: e.clientY }, true)}
                                        onMouseLeave={() => onHover && onHover(null)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <ItemIcon item={item} />
                                        </div>

                                        {/* Set indicator - star icon for set items */}
                                        {setInfo && (
                                            <div
                                                className="absolute top-0.5 left-0.5 w-4 h-4 flex items-center justify-center"
                                                style={{ color: setInfo.color }}
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Selection indicator */}
                                        {isSelected && !setInfo && (
                                            <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                                                <span className="text-white text-[8px]">X</span>
                                            </div>
                                        )}
                                        {isSelected && setInfo && (
                                            <div className="absolute top-0 left-0 right-0 bottom-0 bg-red-500/30 pointer-events-none" />
                                        )}

                                        {/* Tier dot */}
                                        <div
                                            className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor: tierInfo?.color || '#666',
                                                boxShadow: item.tier >= 3 ? `0 0 6px ${tierInfo?.color}` : 'none'
                                            }}
                                        />

                                        {/* Enhancement */}
                                        {item.plus > 0 && (
                                            <div className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-yellow-400 bg-black/60 px-1 rounded">
                                                +{item.plus}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Quick tip */}
                <div className="mt-3 pt-3 border-t border-slate-700/30 text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Left-click to equip | Right-click to select for salvage
                    </span>
                </div>
            </div>
        </div>
    );
}
