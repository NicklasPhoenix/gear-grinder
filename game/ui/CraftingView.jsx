import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { GEAR_SLOTS, TIERS, WEAPON_TYPES, PRESTIGE_WEAPONS, GEAR_BASES, SPECIAL_EFFECTS } from '../data/items';

// SVG icons for gear slots (no emojis)
const SlotIcons = {
    weapon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M6.92 5L5 7.86L6.91 10.73L9.5 10.27L10.23 8L11.5 9.5L13.5 7.5L12 6.23L14.27 5.5L14.73 2.91L11.86 1L9 2.91L9.46 5.5L7.86 5.77L6.92 5ZM19.5 12.5L17 15L19 17L21.5 14.5L19.5 12.5ZM14.5 17.5L12 20L14 22L16.5 19.5L14.5 17.5ZM5.5 17.5L3 20L5 22L7.5 19.5L5.5 17.5ZM17 7L7 17L9.12 19.12L19.12 9.12L17 7Z"/>
        </svg>
    ),
    helmet: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C9.24 2 7 4.24 7 7V12H17V7C17 4.24 14.76 2 12 2ZM5 13V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V13H5ZM12 4C13.66 4 15 5.34 15 7V10H9V7C9 5.34 10.34 4 12 4Z"/>
        </svg>
    ),
    armor: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 5C13.1 5 14 5.9 14 7S13.1 9 12 9 10 8.1 10 7 10.9 5 12 5ZM18 11C18 15.17 15.34 18.93 12 20.67C8.66 18.93 6 15.17 6 11V6.3L12 3.64L18 6.3V11Z"/>
        </svg>
    ),
    boots: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M2 22H22V20H18V17C18 15.9 17.1 15 16 15H14V12H16C17.1 12 18 11.1 18 10V4H13V10H15V15H9V10H11V4H6V10C6 11.1 6.9 12 8 12H10V15H8C6.9 15 6 15.9 6 17V20H2V22Z"/>
        </svg>
    ),
    accessory: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C14.21 2 16 3.79 16 6C16 8.21 14.21 10 12 10C9.79 10 8 8.21 8 6C8 3.79 9.79 2 12 2ZM12 4C10.9 4 10 4.9 10 6S10.9 8 12 8 14 7.1 14 6 13.1 4 12 4ZM12 22L8 18V14H16V18L12 22ZM10 16V17.17L12 19.17L14 17.17V16H10Z"/>
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM19 11C19 15.52 16.02 19.69 12 20.93C7.98 19.69 5 15.52 5 11V6.3L12 3.19L19 6.3V11Z"/>
        </svg>
    ),
    gloves: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19.5 3.5L18 2L15 5V1H13V6L10 3L8.5 4.5L12 8V13H7V8L3.5 11.5L2 10L5 7V1H3V8L1 10L4 13V21C4 21.55 4.45 22 5 22H19C19.55 22 20 21.55 20 21V13L23 10L21 8V1H19V7L22 10L20.5 11.5L17 8V3.5L19.5 3.5Z"/>
        </svg>
    ),
    amulet: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2L9 9H15L12 2ZM12 5.84L13 8H11L12 5.84ZM12 11C9.79 11 8 12.79 8 15C8 17.21 9.79 19 12 19C14.21 19 16 17.21 16 15C16 12.79 14.21 11 12 11ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13 14 13.9 14 15 13.1 17 12 17ZM12 20L9 22H15L12 20Z"/>
        </svg>
    ),
};

const SLOT_NAMES = {
    weapon: 'Weapon',
    helmet: 'Helmet',
    armor: 'Armor',
    boots: 'Boots',
    accessory: 'Ring',
    shield: 'Shield',
    gloves: 'Gloves',
    amulet: 'Amulet',
};

export default function CraftingView() {
    const { state, gameManager } = useGame();
    const [selectedSlot, setSelectedSlot] = useState(GEAR_SLOTS[0]);
    const [selectedWeaponType, setSelectedWeaponType] = useState(WEAPON_TYPES[0].id);
    const [selectedTier, setSelectedTier] = useState(0);

    const availableWeapons = [
        ...WEAPON_TYPES,
        ...PRESTIGE_WEAPONS.filter(w => state.prestigeLevel >= w.prestigeReq)
    ];

    const tierData = TIERS[selectedTier];
    const gearBase = GEAR_BASES[selectedSlot];

    const tierUnlocked = state.currentZone >= tierData.zoneReq &&
        (!tierData.prestigeReq || state.prestigeLevel >= tierData.prestigeReq);

    const canCraft = tierUnlocked &&
        state.gold >= tierData.goldCost &&
        state.ore >= tierData.oreCost &&
        state.leather >= tierData.leatherCost;

    const previewItem = {
        slot: selectedSlot,
        weaponType: selectedSlot === 'weapon' ? selectedWeaponType : null,
        tier: selectedTier,
        plus: 0
    };

    const weaponDef = selectedSlot === 'weapon'
        ? availableWeapons.find(w => w.id === selectedWeaponType)
        : null;
    const baseStats = weaponDef || gearBase;
    const previewDmg = Math.floor((baseStats.baseDmg || 0) * tierData.statMult);
    const previewHp = Math.floor((baseStats.baseHp || 0) * tierData.statMult);
    const previewArmor = Math.floor((baseStats.baseArmor || 0) * tierData.statMult);

    const handleCraft = () => {
        if (!canCraft) return;

        let effects = [];
        const effectChance = 0.1 + selectedTier * 0.1;
        if (Math.random() < effectChance) {
            const effect = SPECIAL_EFFECTS[Math.floor(Math.random() * SPECIAL_EFFECTS.length)];
            const tierBonus = 1 + selectedTier * 0.2;
            const value = Math.floor((effect.minVal + Math.random() * (effect.maxVal - effect.minVal)) * tierBonus);
            effects.push({ id: effect.id, name: effect.name, value });
        }

        const weaponInfo = selectedSlot === 'weapon'
            ? availableWeapons.find(w => w.id === selectedWeaponType)
            : null;

        const newItem = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            slot: selectedSlot,
            tier: selectedTier,
            name: `${tierData.name} ${weaponInfo ? weaponInfo.name : SLOT_NAMES[selectedSlot]}`,
            plus: 0,
            effects,
            weaponType: selectedSlot === 'weapon' ? selectedWeaponType : undefined,
        };

        gameManager.setState(prev => ({
            ...prev,
            gold: prev.gold - tierData.goldCost,
            ore: prev.ore - tierData.oreCost,
            leather: prev.leather - tierData.leatherCost,
            inventory: [...prev.inventory, newItem]
        }));

        const effectText = effects.length > 0 ? ` (${effects[0].name}!)` : '';
        gameManager.emit('floatingText', { text: `CRAFTED${effectText}`, type: 'heal', target: 'player' });
    };

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Header */}
            <div className="glass-card rounded-xl p-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        Forge
                    </h2>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <MaterialIcon type="gold" size={16} />
                            <span className="text-yellow-400 font-bold">{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MaterialIcon type="ore" size={16} />
                            <span className="text-slate-300 font-bold">{state.ore}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MaterialIcon type="leather" size={16} />
                            <span className="text-amber-500 font-bold">{state.leather}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-3 min-h-0">
                {/* Left: Controls */}
                <div className="w-1/2 glass-card rounded-xl overflow-hidden flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {/* Gear Type */}
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Gear Type</div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {GEAR_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-1.5 rounded-lg text-center transition-all border ${
                                            selectedSlot === slot
                                                ? 'bg-orange-600/30 border-orange-500 text-orange-300'
                                                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="flex justify-center mb-0.5">{SlotIcons[slot]}</div>
                                        <div className="text-[9px] uppercase truncate">{SLOT_NAMES[slot]}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weapon Type */}
                        {selectedSlot === 'weapon' && (
                            <div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Weapon</div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {availableWeapons.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => setSelectedWeaponType(w.id)}
                                            className={`p-2 rounded-lg text-left transition-all border ${
                                                selectedWeaponType === w.id
                                                    ? 'bg-red-600/30 border-red-500'
                                                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className={`font-bold text-xs ${selectedWeaponType === w.id ? 'text-red-300' : 'text-slate-300'}`}>
                                                {w.name}
                                            </div>
                                            <div className="text-[9px] text-slate-500 truncate">{w.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quality Tier */}
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Quality</div>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                {TIERS.map(tier => {
                                    const unlocked = state.currentZone >= tier.zoneReq &&
                                        (!tier.prestigeReq || state.prestigeLevel >= tier.prestigeReq);
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => unlocked && setSelectedTier(tier.id)}
                                            disabled={!unlocked}
                                            className={`w-full p-2 rounded text-left transition-all border flex items-center justify-between ${
                                                selectedTier === tier.id
                                                    ? 'border-2'
                                                    : unlocked
                                                        ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                                        : 'bg-slate-900/30 border-slate-800/30 opacity-40 cursor-not-allowed'
                                            }`}
                                            style={selectedTier === tier.id ? {
                                                backgroundColor: `${tier.color}15`,
                                                borderColor: tier.color
                                            } : {}}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                                                <span className="font-bold text-xs" style={{ color: unlocked ? tier.color : '#64748b' }}>
                                                    {tier.name}
                                                </span>
                                            </div>
                                            <div className="text-[9px] text-slate-500">
                                                {tier.prestigeReq ? `P${tier.prestigeReq}` : `Z${tier.zoneReq}`}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Preview & Craft */}
                <div className="flex-1 glass-card rounded-xl p-3 flex flex-col min-h-0">
                    {/* Item Preview */}
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-16 h-16 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                            style={{ borderColor: tierData.color, background: `linear-gradient(135deg, ${tierData.color}10, transparent)` }}
                        >
                            <div className="w-12 h-12">
                                <ItemIcon item={previewItem} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate" style={{ color: tierData.color }}>
                                {tierData.name} {selectedSlot === 'weapon'
                                    ? availableWeapons.find(w => w.id === selectedWeaponType)?.name
                                    : SLOT_NAMES[selectedSlot]}
                            </div>
                            <div className="text-[10px] text-slate-500">{tierData.statMult}x stats</div>
                        </div>
                    </div>

                    {/* Stats Preview */}
                    <div className="flex gap-2 mb-3">
                        {previewDmg > 0 && (
                            <div className="flex-1 p-1.5 rounded bg-red-500/10 border border-red-500/30 text-center">
                                <div className="text-[9px] text-red-400">DMG</div>
                                <div className="text-sm font-bold text-red-300">+{previewDmg}</div>
                            </div>
                        )}
                        {previewHp > 0 && (
                            <div className="flex-1 p-1.5 rounded bg-green-500/10 border border-green-500/30 text-center">
                                <div className="text-[9px] text-green-400">HP</div>
                                <div className="text-sm font-bold text-green-300">+{previewHp}</div>
                            </div>
                        )}
                        {previewArmor > 0 && (
                            <div className="flex-1 p-1.5 rounded bg-blue-500/10 border border-blue-500/30 text-center">
                                <div className="text-[9px] text-blue-400">ARM</div>
                                <div className="text-sm font-bold text-blue-300">+{previewArmor}</div>
                            </div>
                        )}
                    </div>

                    {/* Effect Chance */}
                    <div className="text-[10px] text-slate-500 text-center mb-3">
                        <span className="text-purple-400">{Math.min(100, Math.floor((0.1 + selectedTier * 0.1) * 100))}%</span> bonus effect chance
                    </div>

                    {/* Cost Display */}
                    <div className="p-2 rounded-lg bg-slate-900/50 mb-3">
                        <div className="flex justify-center gap-4">
                            <div className={`flex items-center gap-1 ${state.gold >= tierData.goldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                                <MaterialIcon type="gold" size={18} />
                                <span className="font-bold text-sm">{tierData.goldCost.toLocaleString()}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${state.ore >= tierData.oreCost ? 'text-slate-300' : 'text-red-400'}`}>
                                <MaterialIcon type="ore" size={18} />
                                <span className="font-bold text-sm">{tierData.oreCost}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${state.leather >= tierData.leatherCost ? 'text-amber-500' : 'text-red-400'}`}>
                                <MaterialIcon type="leather" size={18} />
                                <span className="font-bold text-sm">{tierData.leatherCost}</span>
                            </div>
                        </div>
                    </div>

                    {/* Craft Button */}
                    <button
                        disabled={!canCraft}
                        onClick={handleCraft}
                        className={`w-full py-3 font-bold text-sm rounded-lg uppercase tracking-widest transition-all mt-auto ${
                            canCraft
                                ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {tierUnlocked ? 'Forge' : `Zone ${tierData.zoneReq}+`}
                    </button>
                </div>
            </div>
        </div>
    );
}
