import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, getItemScore, getSalvageReturns, BOSS_SETS, PRESTIGE_BOSS_SETS, addItemToInventory, removeOneFromStack, getEnhanceStage, SPECIAL_EFFECTS } from '../data/items';
import { getEnhanceBonus } from '../utils/formulas';
import { INVENTORY } from '../data/constants';
import PresetsModal from './PresetsModal';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatNumber } from '../utils/format';

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

// Slot order for sorting by slot
const SLOT_ORDER = ['weapon', 'helmet', 'armor', 'legs', 'boots', 'belt', 'shield', 'gloves', 'amulet'];

// Sort inventory based on sort mode
function sortInventory(inventory, sortMode, playerStats) {
    if (!inventory || sortMode === 'none') return inventory;

    const sorted = [...inventory];
    switch (sortMode) {
        case 'slot':
            sorted.sort((a, b) => {
                const slotDiff = SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot);
                if (slotDiff !== 0) return slotDiff;
                // Within same slot, sort by tier descending
                return (b.tier || 0) - (a.tier || 0);
            });
            break;
        case 'tier':
            sorted.sort((a, b) => {
                const tierDiff = (b.tier || 0) - (a.tier || 0);
                if (tierDiff !== 0) return tierDiff;
                // Within same tier, sort by score
                return getItemScore(b, playerStats) - getItemScore(a, playerStats);
            });
            break;
        case 'score':
            sorted.sort((a, b) => getItemScore(b, playerStats) - getItemScore(a, playerStats));
            break;
        default:
            break;
    }
    return sorted;
}

export default function InventoryView({ onHover }) {
    const { state, gameManager } = useGame();
    const [selectedForSalvage, setSelectedForSalvage] = useState(new Set());
    const [showPresets, setShowPresets] = useState(false);
    const { isMobile } = useIsMobile();
    const longPressTimerRef = useRef(null);

    // Get sorted inventory based on settings
    const sortedInventory = sortInventory(state.inventory, state.inventorySort || 'none', state.stats);

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
        // Pass player stats to getItemScore for smart weapon selection
        const playerStats = state.stats;

        for (const slot of GEAR_SLOTS) {
            const slotItems = newInv.filter(item => item.slot === slot);
            if (slotItems.length === 0) continue;

            const bestInvItem = slotItems.reduce((best, item) => {
                return getItemScore(item, playerStats) > getItemScore(best, playerStats) ? item : best;
            }, slotItems[0]);

            const currentEquipped = newGear[slot];
            const currentScore = getItemScore(currentEquipped, playerStats);
            const bestScore = getItemScore(bestInvItem, playerStats);

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
        // Don't allow selecting locked items for salvage
        const item = state.inventory.find(i => i.id === itemId);
        if (item?.locked) return;
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
        const itemsToSalvage = state.inventory.filter(item => !item.locked);
        const lockedItems = state.inventory.filter(item => item.locked);
        if (itemsToSalvage.length === 0) return; // Nothing to salvage (all locked)
        for (const item of itemsToSalvage) {
            const returns = getSalvageReturns(item);
            totalGold += returns.gold;
            totalStones += returns.enhanceStone;
        }
        gameManager.setState(prev => ({
            ...prev, inventory: lockedItems, // Keep only locked items
            gold: (prev.gold || 0) + totalGold,
            enhanceStone: (prev.enhanceStone || 0) + totalStones,
        }));
        setSelectedForSalvage(new Set());
        gameManager.emit('floatingText', { text: `+${totalGold}g`, type: 'heal', target: 'player' });
    };

    const toggleItemLock = (itemId) => {
        gameManager.setState(prev => ({
            ...prev,
            inventory: prev.inventory.map(item =>
                item.id === itemId ? { ...item, locked: !item.locked } : item
            )
        }));
    };

    const handleEquip = (item) => {
        let newGear = { ...state.gear };
        const oldItem = newGear[item.slot];
        let newInv = removeOneFromStack(state.inventory, item.id);
        const equippedItem = { ...item };
        delete equippedItem.count;
        newGear[item.slot] = equippedItem;
        if (oldItem) {
            const maxSlots = state.inventorySlots || 50;
            const result = addItemToInventory(newInv, { ...oldItem, id: Date.now() }, maxSlots);
            newInv = result.inventory; // Should succeed since we just removed an item
        }
        gameManager.setState(prev => ({ ...prev, gear: newGear, inventory: newInv }));
    };

    const handleUnequip = (item) => {
        if (!item) return;
        const maxSlots = state.inventorySlots || 50;
        if (state.inventory.length >= maxSlots) {
            // Can't unequip - inventory full
            return;
        }
        gameManager.setState(prev => {
            const result = addItemToInventory(prev.inventory, { ...item, id: Date.now() }, prev.inventorySlots || 50);
            if (!result.added) return prev; // Don't unequip if can't add to inventory
            return {
                ...prev,
                gear: { ...prev.gear, [item.slot]: null },
                inventory: result.inventory
            };
        });
    };

    const toggleAutoSalvage = () => {
        gameManager.setState(prev => ({ ...prev, autoSalvage: !prev.autoSalvage }));
    };

    const setAutoSalvageTier = (tier) => {
        gameManager.setState(prev => ({ ...prev, autoSalvageTier: tier }));
    };

    const toggleKeepEffects = () => {
        gameManager.setState(prev => ({ ...prev, autoSalvageKeepEffects: !prev.autoSalvageKeepEffects }));
    };

    const toggleSalvageBossItems = () => {
        gameManager.setState(prev => ({ ...prev, autoSalvageBossItems: !prev.autoSalvageBossItems }));
    };

    // Inventory upgrade calculations
    const currentSlots = state.inventorySlots || INVENTORY.BASE_SLOTS;
    const upgradesPurchased = Math.floor((currentSlots - INVENTORY.BASE_SLOTS) / INVENTORY.SLOTS_PER_UPGRADE);
    const upgradeCost = Math.floor(INVENTORY.BASE_UPGRADE_COST * Math.pow(INVENTORY.COST_MULTIPLIER, upgradesPurchased));
    const canUpgrade = currentSlots < INVENTORY.MAX_SLOTS && state.gold >= upgradeCost;
    const isMaxed = currentSlots >= INVENTORY.MAX_SLOTS;

    const handleUpgradeInventory = () => {
        if (!canUpgrade) return;
        gameManager.setState(prev => ({
            ...prev,
            gold: prev.gold - upgradeCost,
            inventorySlots: (prev.inventorySlots || INVENTORY.BASE_SLOTS) + INVENTORY.SLOTS_PER_UPGRADE
        }));
    };

    // Loot filter state
    const autoSalvageTier = state.autoSalvageTier ?? -1;
    const autoSalvageKeepEffects = state.autoSalvageKeepEffects ?? true;
    const autoSalvageBossItems = state.autoSalvageBossItems ?? false;
    // Stat filter - array of effect IDs to keep (empty = keep all effects)
    const autoSalvageWantedStats = state.autoSalvageWantedStats ?? [];
    const [showStatFilter, setShowStatFilter] = useState(false);

    const toggleStatFilter = (effectId) => {
        gameManager.setState(prev => {
            const current = prev.autoSalvageWantedStats ?? [];
            if (current.includes(effectId)) {
                return { ...prev, autoSalvageWantedStats: current.filter(id => id !== effectId) };
            } else {
                return { ...prev, autoSalvageWantedStats: [...current, effectId] };
            }
        });
    };

    const clearStatFilters = () => {
        gameManager.setState(prev => ({ ...prev, autoSalvageWantedStats: [] }));
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

    // Calculate active set bonuses
    const getActiveSetBonuses = () => {
        const setCounts = {};
        Object.values(state.gear).forEach(item => {
            if (item?.bossSet) {
                setCounts[item.bossSet] = (setCounts[item.bossSet] || 0) + 1;
            }
        });
        return setCounts;
    };
    const activeSetCounts = getActiveSetBonuses();

    // Mobile Equipment Card component
    const MobileEquipCard = ({ slot }) => {
        const item = state.gear[slot];
        if (!item) {
            return (
                <div className="flex items-center gap-2 p-2 bg-slate-800/40 rounded border border-slate-700/40">
                    <div className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center">
                        <span className="text-[8px] text-slate-500 uppercase">{SLOT_LABELS[slot]}</span>
                    </div>
                    <span className="text-xs text-slate-500 italic">Empty</span>
                </div>
            );
        }
        const tierInfo = TIERS[item.tier];
        const stats = calculateItemStats(item);
        const setInfo = item.bossSet ? (BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet]) : null;
        const stage = item.plus > 0 ? getEnhanceStage(item.plus) : null;
        const effects = item.effects || [];

        return (
            <div
                className="bg-slate-800/60 rounded border border-slate-700/60 overflow-hidden"
                style={{ borderColor: tierInfo?.color + '60' }}
                onClick={() => handleUnequip(item)}
            >
                <div className="flex items-center gap-2 p-1.5">
                    <div className="w-8 h-8 flex-shrink-0">
                        <ItemIcon item={item} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate" style={{ color: tierInfo?.color }}>
                            {item.name}
                            {stage && <span className="ml-1 text-[9px]" style={{ color: stage.color }}>+{item.plus}</span>}
                        </div>
                        <div className="flex gap-1 text-[9px]">
                            {stats.dmg > 0 && <span className="text-red-400">+{stats.dmg} DMG</span>}
                            {stats.hp > 0 && <span className="text-green-400">+{stats.hp} HP</span>}
                            {stats.armor > 0 && <span className="text-blue-400">+{stats.armor} ARM</span>}
                        </div>
                    </div>
                    {effects.length > 0 && (
                        <div className="text-[8px] text-purple-400">
                            {effects.map(e => e.name).join(', ')}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-2">
            {/* Equipment Section - Different layout for mobile vs desktop */}
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

                {isMobile ? (
                    /* MOBILE: List view with full stats */
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                        {GEAR_SLOTS.map(slot => (
                            <MobileEquipCard key={slot} slot={slot} />
                        ))}

                        {/* Active Set Bonuses */}
                        {Object.keys(activeSetCounts).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50">
                                <div className="text-[10px] text-slate-400 mb-1">ACTIVE SET BONUSES</div>
                                {Object.entries(activeSetCounts).map(([setId, count]) => {
                                    const setInfo = BOSS_SETS[setId] || PRESTIGE_BOSS_SETS[setId];
                                    if (!setInfo) return null;
                                    return (
                                        <div key={setId} className="mb-2">
                                            <div className="text-[10px] font-bold mb-0.5" style={{ color: setInfo.color }}>
                                                {setInfo.name} ({count}/8)
                                            </div>
                                            <div className="space-y-0.5">
                                                {setInfo.setBonuses?.map((bonus, i) => {
                                                    const isActive = count >= bonus.pieces;
                                                    if (bonus.secret && !isActive) return null;
                                                    return (
                                                        <div key={i} className={`text-[9px] flex gap-1 ${isActive ? 'text-green-400' : 'text-slate-600'}`}>
                                                            <span className="font-bold">{bonus.pieces}pc:</span>
                                                            <span>{bonus.desc}</span>
                                                            {isActive && <span className="text-green-500">✓</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* DESKTOP: Paper Doll Grid */
                    <div className="p-4">
                        <div className="flex justify-center">
                            <div className="grid grid-cols-3 gap-2">
                                <EquipSlot slot="amulet" />
                                <EquipSlot slot="helmet" />
                                <div className="w-20 h-20" />
                                <EquipSlot slot="weapon" />
                                <EquipSlot slot="armor" />
                                <EquipSlot slot="shield" />
                                <EquipSlot slot="gloves" />
                                <EquipSlot slot="legs" />
                                <EquipSlot slot="belt" />
                                <div className="w-20 h-20" />
                                <EquipSlot slot="boots" />
                                <div className="w-20 h-20" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Inventory Grid - Fixed height with internal scroll */}
            <div className="flex-1 game-panel flex flex-col min-h-0" onMouseLeave={() => onHover && onHover(null)}>
                <div className="game-panel-header flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Inventory ({state.inventory.length}/{currentSlots})</span>
                        {!isMaxed && (
                            <button
                                onClick={handleUpgradeInventory}
                                disabled={!canUpgrade}
                                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                    canUpgrade
                                        ? 'bg-yellow-600/50 text-yellow-300 hover:bg-yellow-600/70'
                                        : 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                }`}
                                title={`+${INVENTORY.SLOTS_PER_UPGRADE} slots for ${formatNumber(upgradeCost)}g`}
                            >
                                +{INVENTORY.SLOTS_PER_UPGRADE} ({formatNumber(upgradeCost)}g)
                            </button>
                        )}
                        {isMaxed && (
                            <span className="text-[10px] text-green-400">MAX</span>
                        )}
                    </div>
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

                {/* Loot Filter - shows when auto-salvage is enabled */}
                {state.autoSalvage && (
                    <div className="px-2 py-1.5 bg-slate-800/50 border-b border-slate-700 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs text-slate-400 mr-1">Filter:</span>
                            <button
                                onClick={() => setAutoSalvageTier(-1)}
                                className={`px-1.5 py-0.5 text-xs rounded transition-all ${
                                    autoSalvageTier === -1
                                        ? 'bg-slate-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                                }`}
                            >
                                ALL
                            </button>
                            {TIERS.map((tier, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAutoSalvageTier(idx)}
                                    className={`px-1.5 py-0.5 text-xs rounded transition-all ${
                                        autoSalvageTier === idx
                                            ? 'ring-1 ring-white'
                                            : 'hover:brightness-125'
                                    }`}
                                    style={{
                                        backgroundColor: tier.color + '30',
                                        color: tier.color,
                                    }}
                                    title={tier.name}
                                >
                                    {tier.name.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-400">Keep effects:</span>
                            <button
                                onClick={toggleKeepEffects}
                                className={`px-1.5 py-0.5 text-xs rounded transition-all ${
                                    autoSalvageKeepEffects
                                        ? 'bg-green-600/40 text-green-300'
                                        : 'bg-red-600/40 text-red-300'
                                }`}
                            >
                                {autoSalvageKeepEffects ? 'ON' : 'OFF'}
                            </button>
                            {autoSalvageKeepEffects && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatFilter(!showStatFilter)}
                                        className={`px-1.5 py-0.5 text-xs rounded transition-all ${
                                            autoSalvageWantedStats.length > 0
                                                ? 'bg-purple-600/40 text-purple-300'
                                                : 'bg-slate-600/40 text-slate-300'
                                        }`}
                                        title="Filter: only keep items with these stats"
                                    >
                                        Stats: {autoSalvageWantedStats.length > 0 ? autoSalvageWantedStats.length : 'All'} ▾
                                    </button>
                                    {showStatFilter && (
                                        <>
                                            {/* Backdrop to close dropdown */}
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowStatFilter(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl min-w-[200px]">
                                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-700">
                                                    <span className="text-xs text-slate-300 font-bold">Keep items with:</span>
                                                    <button
                                                        onClick={() => { clearStatFilters(); setShowStatFilter(false); }}
                                                        className="text-[10px] text-slate-400 hover:text-white"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {SPECIAL_EFFECTS.map(effect => {
                                                        const isSelected = autoSalvageWantedStats.includes(effect.id);
                                                        return (
                                                            <button
                                                                key={effect.id}
                                                                onClick={() => toggleStatFilter(effect.id)}
                                                                className={`px-2 py-1 text-[10px] rounded transition-all text-left ${
                                                                    isSelected
                                                                        ? 'ring-1 ring-white'
                                                                        : 'opacity-50 hover:opacity-80'
                                                                }`}
                                                                style={{
                                                                    backgroundColor: effect.color + '30',
                                                                    color: effect.color,
                                                                }}
                                                            >
                                                                {effect.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-700">
                                                    {autoSalvageWantedStats.length === 0
                                                        ? 'All items with effects are kept'
                                                        : 'Only items with selected stats are kept'}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            <span className="text-xs text-slate-400 ml-2">Salvage boss:</span>
                            <button
                                onClick={toggleSalvageBossItems}
                                className={`px-1.5 py-0.5 text-xs rounded transition-all ${
                                    autoSalvageBossItems
                                        ? 'bg-orange-600/40 text-orange-300'
                                        : 'bg-slate-600/40 text-slate-300'
                                }`}
                                title="Warning: Enabling this will auto-salvage boss set items!"
                            >
                                {autoSalvageBossItems ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {state.inventory.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 text-base">
                            Empty
                        </div>
                    ) : isMobile ? (
                        /* MOBILE: Full item cards with all stats */
                        <div className="space-y-2">
                            {sortedInventory.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedForSalvage.has(item.id);
                                const setInfo = item.bossSet ? (BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet]) : null;
                                const stage = item.plus > 0 ? getEnhanceStage(item.plus) : null;
                                const stats = calculateItemStats(item);
                                const effects = item.effects || [];

                                // Compare to equipped item
                                const equippedItem = state.gear[item.slot];
                                const equippedStats = equippedItem ? calculateItemStats(equippedItem) : { dmg: 0, hp: 0, armor: 0 };
                                const itemScore = getItemScore(item);
                                const equippedScore = equippedItem ? getItemScore(equippedItem) : 0;
                                const scoreDiff = itemScore - equippedScore;
                                const isUpgrade = scoreDiff > 0;

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative bg-slate-900/80 rounded-lg border-2 overflow-hidden ${
                                            isSelected ? 'border-red-500 bg-red-900/30' : 'border-slate-700/60'
                                        }`}
                                        style={!isSelected && tierInfo ? { borderColor: tierInfo.color + '80' } : {}}
                                    >
                                        {/* Upgrade/Downgrade indicator */}
                                        {equippedItem && (
                                            <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[8px] font-bold ${
                                                isUpgrade ? 'bg-green-500 text-white' : 'bg-red-500/80 text-white'
                                            }`}>
                                                {isUpgrade ? '↑ UPGRADE' : '↓ DOWNGRADE'}
                                            </div>
                                        )}
                                        {!equippedItem && (
                                            <div className="absolute top-0 right-0 px-1.5 py-0.5 text-[8px] font-bold bg-blue-500 text-white">
                                                EMPTY SLOT
                                            </div>
                                        )}

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
                                                PWR<br/><span className="text-sm font-bold text-slate-300">{itemScore}</span>
                                            </div>
                                        </div>

                                        {/* Stats Row with comparison */}
                                        <div className="flex gap-1 p-2 text-[10px]">
                                            {(stats.dmg > 0 || equippedStats.dmg > 0) && (
                                                <div className="flex-1 bg-red-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-red-400">DMG</div>
                                                    <div className="font-bold text-red-300">+{stats.dmg}</div>
                                                    {equippedItem && (
                                                        <div className={`text-[9px] ${stats.dmg - equippedStats.dmg > 0 ? 'text-green-400' : stats.dmg - equippedStats.dmg < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                            {stats.dmg - equippedStats.dmg > 0 ? '+' : ''}{stats.dmg - equippedStats.dmg}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {(stats.hp > 0 || equippedStats.hp > 0) && (
                                                <div className="flex-1 bg-green-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-green-400">HP</div>
                                                    <div className="font-bold text-green-300">+{stats.hp}</div>
                                                    {equippedItem && (
                                                        <div className={`text-[9px] ${stats.hp - equippedStats.hp > 0 ? 'text-green-400' : stats.hp - equippedStats.hp < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                            {stats.hp - equippedStats.hp > 0 ? '+' : ''}{stats.hp - equippedStats.hp}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {(stats.armor > 0 || equippedStats.armor > 0) && (
                                                <div className="flex-1 bg-blue-500/20 rounded px-1.5 py-1 text-center">
                                                    <div className="text-blue-400">ARM</div>
                                                    <div className="font-bold text-blue-300">+{stats.armor}</div>
                                                    {equippedItem && (
                                                        <div className={`text-[9px] ${stats.armor - equippedStats.armor > 0 ? 'text-green-400' : stats.armor - equippedStats.armor < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                            {stats.armor - equippedStats.armor > 0 ? '+' : ''}{stats.armor - equippedStats.armor}
                                                        </div>
                                                    )}
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

                                        {/* Set Bonus Info - Full details */}
                                        {setInfo && (
                                            <div className="px-2 pb-2 border-t border-slate-700/30 mt-1 pt-1">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-[9px] font-bold" style={{ color: setInfo.color }}>
                                                        {setInfo.name} Set
                                                    </span>
                                                    <span className="text-[8px] text-slate-500">
                                                        ({activeSetCounts[item.bossSet] || 0}/8 equipped)
                                                    </span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    {setInfo.setBonuses?.slice(0, 4).map((bonus, i) => {
                                                        const currentCount = activeSetCounts[item.bossSet] || 0;
                                                        const wouldBeActive = (currentCount + 1) >= bonus.pieces;
                                                        const isActive = currentCount >= bonus.pieces;
                                                        if (bonus.secret && !isActive) return null;
                                                        return (
                                                            <div key={i} className={`text-[8px] flex gap-1 ${isActive ? 'text-green-400' : wouldBeActive ? 'text-yellow-400' : 'text-slate-600'}`}>
                                                                <span className="font-bold w-6">{bonus.pieces}pc:</span>
                                                                <span className="flex-1">{bonus.desc}</span>
                                                                {isActive && <span>✓</span>}
                                                                {!isActive && wouldBeActive && <span>+</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex border-t border-slate-700/50">
                                            <button
                                                onClick={() => toggleItemLock(item.id)}
                                                className={`px-3 py-2 text-xs font-bold border-r border-slate-700/50 ${
                                                    item.locked ? 'text-yellow-400 bg-yellow-500/20' : 'text-slate-400 bg-slate-500/10 active:bg-slate-500/30'
                                                }`}
                                                title={item.locked ? 'Unlock item' : 'Lock item (protected from salvage)'}
                                            >
                                                {item.locked ? '🔒' : '🔓'}
                                            </button>
                                            <button
                                                onClick={() => handleEquip(item)}
                                                className="flex-1 py-2 text-xs font-bold text-green-400 bg-green-500/10 active:bg-green-500/30"
                                            >
                                                EQUIP
                                            </button>
                                            <button
                                                onClick={() => toggleSalvageSelection(item.id)}
                                                disabled={item.locked}
                                                className={`flex-1 py-2 text-xs font-bold border-l border-slate-700/50 ${
                                                    item.locked ? 'text-slate-600 bg-slate-800 cursor-not-allowed' :
                                                    isSelected ? 'text-white bg-red-500' : 'text-red-400 bg-red-500/10 active:bg-red-500/30'
                                                }`}
                                            >
                                                {item.locked ? 'LOCKED' : isSelected ? 'SELECTED' : 'SALVAGE'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* DESKTOP: Compact grid with tooltips */
                        <div className="grid gap-1.5 grid-cols-7">
                            {sortedInventory.map(item => {
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
                                        className={`group relative aspect-square bg-slate-900/60 border-2 rounded-lg cursor-pointer transition-all active:scale-95 ${
                                            item.locked ? 'border-yellow-500/60 bg-yellow-500/10' :
                                            isSelected ? 'border-red-500 bg-red-500/20' : 'border-slate-700/40 hover:border-blue-500/50'
                                        }`}
                                        style={!item.locked && !isSelected ? getItemBorderStyle() : {}}
                                        onClick={() => handleEquip(item)}
                                        onContextMenu={(e) => { e.preventDefault(); toggleSalvageSelection(item.id); }}
                                        onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); toggleItemLock(item.id); } }}
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
                                        {/* Lock button - always visible on hover, highlighted when locked */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleItemLock(item.id); }}
                                            className={`absolute bottom-0 right-0 text-[10px] px-1 rounded-tl transition-all ${
                                                item.locked
                                                    ? 'bg-yellow-600/90 opacity-100'
                                                    : 'bg-slate-700/80 opacity-0 group-hover:opacity-100 hover:bg-yellow-600/70'
                                            }`}
                                            title={item.locked ? 'Unlock item' : 'Lock item (protected from salvage)'}
                                        >
                                            {item.locked ? '🔒' : '🔓'}
                                        </button>
                                        {isSelected && !item.locked && (
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
                    {isMobile ? 'Tap to equip · Long-press to salvage · Use lock button to protect' : 'Click to equip · Right-click to salvage · Hover for lock button'}
                </div>
            </div>

            {/* Presets Modal */}
            {showPresets && <PresetsModal onClose={() => setShowPresets(false)} />}
        </div>
    );
}
