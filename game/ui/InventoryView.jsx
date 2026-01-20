import React, { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, getItemScore, getSalvageReturns, BOSS_SETS, PRESTIGE_BOSS_SETS, addItemToInventory, removeOneFromStack, getEnhanceStage } from '../data/items';
import { getEnhanceBonus } from '../utils/formulas';
import PresetsModal from './PresetsModal';
import { useIsMobile } from '../hooks/useIsMobile';

// Calculate item stats for display
function calculateItemStats(item) {
    if (!item) return { dmg: 0, hp: 0, armor: 0 };
    const tierData = TIERS[item.tier] || TIERS[0];
    const gearBase = GEAR_BASES[item.slot] || { baseDmg: 0, baseHp: 0, baseArmor: 0 };
    let weaponBase = gearBase;
    if (item.slot === 'weapon' && item.weaponType) {
        const weaponDef = WEAPON_TYPES.find(w => w.id === item.weaponType) || PRESTIGE_WEAPONS.find(w => w.id === item.weaponType);
        if (weaponDef) weaponBase = { ...gearBase, ...weaponDef };
    }
    const tierMult = tierData.statMult || 1;
    const bossBonus = item.isBossItem && item.statBonus ? item.statBonus : 1;
    const enhanceBonus = getEnhanceBonus(item.plus || 0, item.tier);
    return {
        dmg: Math.floor((weaponBase.baseDmg || 0) * tierMult * bossBonus) + (enhanceBonus.dmgBonus || 0),
        hp: Math.floor((weaponBase.baseHp || 0) * tierMult * bossBonus) + (enhanceBonus.hpBonus || 0),
        armor: Math.floor((weaponBase.baseArmor || 0) * tierMult * bossBonus) + (enhanceBonus.armorBonus || 0),
    };
}

const SLOT_LABELS = {
    weapon: 'Weapon',
    helmet: 'Head',
    armor: 'Chest',
    legs: 'Legs',
    boots: 'Feet',
    belt: 'Belt',
    shield: 'Shield',
    gloves: 'Hands',
    amulet: 'Neck',
};

export default function InventoryView({ onHover }) {
    const { state, gameManager } = useGame();
    const [selectedForSalvage, setSelectedForSalvage] = useState(new Set());
    const [showPresets, setShowPresets] = useState(false);
    const { isMobile } = useIsMobile();
    const longPressTimerRef = useRef(null);

    // Long press handler for mobile salvage selection
    const handleTouchStart = useCallback((itemId) => {
        longPressTimerRef.current = setTimeout(() => {
            // Haptic feedback if available
            if (navigator.vibrate) navigator.vibrate(50);
            setSelectedForSalvage(prev => {
                const newSet = new Set(prev);
                if (newSet.has(itemId)) newSet.delete(itemId);
                else newSet.add(itemId);
                return newSet;
            });
        }, 500); // 500ms long press
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

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

    // Equipment slot component for the paper doll
    const EquipSlot = ({ slot, className = '' }) => {
        const item = state.gear[slot];
        const tierInfo = item ? TIERS[item.tier] : null;
        const setInfo = item?.bossSet ? BOSS_SETS[item.bossSet] : null;
        const stage = item?.plus > 0 ? getEnhanceStage(item.plus) : null;

        // Determine border color: boss set > tier color > default
        const getBorderStyle = () => {
            if (!item) return {};
            if (setInfo) {
                return {
                    borderColor: setInfo.color,
                    boxShadow: `inset 0 0 12px ${setInfo.color}40, 0 0 8px ${setInfo.color}20`
                };
            }
            if (tierInfo && item.tier > 0) {
                return {
                    borderColor: tierInfo.color,
                    boxShadow: `inset 0 0 8px ${tierInfo.color}30`
                };
            }
            return {};
        };

        return (
            <div
                className={`relative bg-slate-900/80 border-2 border-slate-700/60 rounded-lg cursor-pointer
                    hover:border-blue-500/70 hover:bg-slate-800/60 transition-all active:scale-95 ${className}
                    ${isMobile ? 'w-14 h-14' : 'w-20 h-20'}`}
                style={getBorderStyle()}
                onClick={() => item && handleUnequip(item)}
                onMouseEnter={(e) => !isMobile && onHover && item && onHover(item, { x: e.clientX, y: e.clientY })}
                onMouseLeave={() => !isMobile && onHover && onHover(null)}
            >
                {item ? (
                    <>
                        <div className="absolute inset-1">
                            <ItemIcon item={item} />
                        </div>
                        {/* Enhancement badge */}
                        {item.plus > 0 && stage && (
                            <div
                                className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold rounded flex items-center border-2 border-black/50 z-10"
                                style={{
                                    backgroundColor: stage.bgColor,
                                    color: stage.color,
                                    boxShadow: `${stage.glow}, 0 2px 4px rgba(0,0,0,0.5)`,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                }}
                            >
                                {stage.icon && <span className="text-[10px] mr-0.5">{stage.icon}</span>}
                                +{item.plus}
                            </div>
                        )}
                        {/* Set indicator */}
                        {setInfo && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b" style={{ backgroundColor: setInfo.color }} />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-600 font-medium uppercase">{SLOT_LABELS[slot]}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Equipment Paper Doll Layout */}
            <div className="game-panel" onMouseLeave={() => onHover && onHover(null)}>
                <div className="game-panel-header flex justify-between items-center">
                    <span className="text-sm">Equipment</span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowPresets(true)}
                            className="px-2 py-1 text-xs bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded transition-colors"
                        >
                            PRESETS
                        </button>
                        <button
                            onClick={handleEquipBest}
                            className="px-2 py-1 text-xs bg-green-600/40 hover:bg-green-600/60 text-green-300 rounded transition-colors"
                        >
                            EQUIP BEST
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    {/* Paper Doll Grid - compact 3-column layout */}
                    <div className="flex justify-center">
                        <div className={`grid grid-cols-3 ${isMobile ? 'gap-1' : 'gap-2'}`}>
                            {/* Row 1: Amulet - Helmet - (empty) */}
                            <EquipSlot slot="amulet" />
                            <EquipSlot slot="helmet" />
                            <div className={isMobile ? 'w-14 h-14' : 'w-20 h-20'} /> {/* spacer */}

                            {/* Row 2: Weapon - Armor - Shield */}
                            <EquipSlot slot="weapon" />
                            <EquipSlot slot="armor" />
                            <EquipSlot slot="shield" />

                            {/* Row 3: Gloves - Legs - Belt */}
                            <EquipSlot slot="gloves" />
                            <EquipSlot slot="legs" />
                            <EquipSlot slot="belt" />

                            {/* Row 4: (empty) - Boots - (empty) */}
                            <div className={isMobile ? 'w-14 h-14' : 'w-20 h-20'} /> {/* spacer */}
                            <EquipSlot slot="boots" />
                            <div className={isMobile ? 'w-14 h-14' : 'w-20 h-20'} /> {/* spacer */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Grid - Fixed height with internal scroll */}
            <div className="flex-1 game-panel flex flex-col min-h-0" onMouseLeave={() => onHover && onHover(null)}>
                <div className="game-panel-header flex justify-between items-center">
                    <span className="text-sm">Inventory ({state.inventory.length}/50)</span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={toggleAutoSalvage}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
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
                                className="px-2 py-1 text-xs bg-red-600/40 hover:bg-red-600/60 text-red-300 rounded"
                            >
                                SALVAGE ({selectedForSalvage.size})
                            </button>
                        )}
                        {state.inventory.length > 0 && (
                            <button
                                onClick={handleSalvageAll}
                                className="px-2 py-1 text-xs bg-orange-600/40 hover:bg-orange-600/60 text-orange-300 rounded"
                            >
                                ALL
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {state.inventory.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-base">
                            Empty
                        </div>
                    ) : isMobile ? (
                        /* MOBILE: Full item cards with all stats */
                        <div className="space-y-2">
                            {state.inventory.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedForSalvage.has(item.id);
                                const setInfo = item.bossSet ? (BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet]) : null;
                                const stage = item.plus > 0 ? getEnhanceStage(item.plus) : null;
                                const stats = calculateItemStats(item);
                                const effects = item.effects || [];

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative bg-slate-900/80 rounded-lg border-2 overflow-hidden ${
                                            isSelected ? 'border-red-500 bg-red-900/30' : 'border-slate-700/60'
                                        }`}
                                        style={!isSelected && tierInfo ? { borderColor: tierInfo.color + '80' } : {}}
                                    >
                                        {/* Header: Icon + Name + Tier */}
                                        <div className="flex items-center gap-2 p-2 border-b border-slate-700/50" style={{ background: `linear-gradient(135deg, ${tierInfo?.color || '#666'}15, transparent)` }}>
                                            <div className="w-10 h-10 flex-shrink-0">
                                                <ItemIcon item={item} size="sm" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate" style={{ color: tierInfo?.color || '#fff' }}>
                                                    {item.name}
                                                    {item.plus > 0 && stage && (
                                                        <span className="ml-1 text-xs px-1 rounded" style={{ backgroundColor: stage.bgColor, color: stage.color }}>
                                                            +{item.plus}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <span style={{ color: tierInfo?.color }}>{tierInfo?.name}</span>
                                                    <span>·</span>
                                                    <span className="capitalize">{item.slot}</span>
                                                    {item.weaponType && <><span>·</span><span className="capitalize">{item.weaponType}</span></>}
                                                </div>
                                            </div>
                                            <div className="text-right text-[10px] text-slate-500">
                                                PWR<br/><span className="text-sm font-bold text-slate-300">{getItemScore(item)}</span>
                                            </div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex gap-1 p-2 text-[10px]">
                                            {stats.dmg > 0 && (
                                                <div className="flex-1 bg-red-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-red-400">DMG</div>
                                                    <div className="font-bold text-red-300">+{stats.dmg}</div>
                                                </div>
                                            )}
                                            {stats.hp > 0 && (
                                                <div className="flex-1 bg-green-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-green-400">HP</div>
                                                    <div className="font-bold text-green-300">+{stats.hp}</div>
                                                </div>
                                            )}
                                            {stats.armor > 0 && (
                                                <div className="flex-1 bg-blue-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-blue-400">ARM</div>
                                                    <div className="font-bold text-blue-300">+{stats.armor}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Effects */}
                                        {effects.length > 0 && (
                                            <div className="px-2 pb-1 flex flex-wrap gap-1">
                                                {effects.map((eff, i) => (
                                                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                                                        {eff.name} +{eff.value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Set Bonus Info */}
                                        {setInfo && (
                                            <div className="px-2 pb-1">
                                                <div className="text-[9px] px-1.5 py-0.5 rounded inline-block" style={{ backgroundColor: setInfo.color + '20', color: setInfo.color }}>
                                                    {setInfo.name} Set
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex border-t border-slate-700/50">
                                            <button
                                                onClick={() => handleEquip(item)}
                                                className="flex-1 py-2 text-xs font-bold text-green-400 bg-green-500/10 active:bg-green-500/30"
                                            >
                                                EQUIP
                                            </button>
                                            <button
                                                onClick={() => toggleSalvageSelection(item.id)}
                                                className={`flex-1 py-2 text-xs font-bold border-l border-slate-700/50 ${
                                                    isSelected ? 'text-white bg-red-500' : 'text-red-400 bg-red-500/10 active:bg-red-500/30'
                                                }`}
                                            >
                                                {isSelected ? 'SELECTED' : 'SALVAGE'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* DESKTOP: Compact grid with tooltips */
                        <div className="grid gap-1.5 grid-cols-7">
                            {state.inventory.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedForSalvage.has(item.id);
                                const setInfo = item.bossSet ? BOSS_SETS[item.bossSet] : null;
                                const stage = item.plus > 0 ? getEnhanceStage(item.plus) : null;

                                const getItemBorderStyle = () => {
                                    if (isSelected) return {};
                                    if (setInfo) return { borderColor: setInfo.color, boxShadow: `inset 0 0 6px ${setInfo.color}30` };
                                    if (tierInfo && item.tier > 0) return { borderColor: tierInfo.color, boxShadow: `inset 0 0 4px ${tierInfo.color}25` };
                                    return {};
                                };

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative aspect-square bg-slate-900/60 border-2 rounded-lg cursor-pointer transition-all active:scale-95 ${
                                            isSelected ? 'border-red-500 bg-red-500/20' : 'border-slate-700/40 hover:border-blue-500/50'
                                        }`}
                                        style={getItemBorderStyle()}
                                        onClick={() => handleEquip(item)}
                                        onContextMenu={(e) => { e.preventDefault(); toggleSalvageSelection(item.id); }}
                                        onMouseEnter={(e) => onHover && onHover(item, { x: e.clientX, y: e.clientY }, true)}
                                        onMouseLeave={() => onHover && onHover(null)}
                                    >
                                        <div className="absolute inset-1">
                                            <ItemIcon item={item} size="sm" />
                                        </div>
                                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ backgroundColor: tierInfo?.color || '#666' }} />
                                        {item.plus > 0 && stage && (
                                            <div className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[11px] font-bold rounded flex items-center border border-black/60"
                                                style={{ backgroundColor: stage.bgColor, color: stage.color, boxShadow: `${stage.glow}, 0 1px 3px rgba(0,0,0,0.5)` }}>
                                                {stage.icon && <span className="text-[9px] mr-0.5">{stage.icon}</span>}+{item.plus}
                                            </div>
                                        )}
                                        {(item.count || 1) > 1 && (
                                            <div className="absolute bottom-0 left-0 text-[10px] font-bold text-white bg-blue-600/90 px-1 rounded-tr">x{item.count}</div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                                                <span className="text-red-400 text-xl font-bold">×</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-3 py-1.5 border-t border-slate-700/30 text-xs text-slate-500 text-center">
                    {isMobile ? 'Tap to equip · Long-press to salvage' : 'Click to equip · Right-click to salvage'}
                </div>
            </div>

            {/* Presets Modal */}
            {showPresets && <PresetsModal onClose={() => setShowPresets(false)} />}
        </div>
    );
}
