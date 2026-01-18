import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import SlotIcon from './SlotIcon';
import { MaterialIcon } from './MaterialIcons';
import { GEAR_SLOTS, TIERS, WEAPON_TYPES, PRESTIGE_WEAPONS, GEAR_BASES, SPECIAL_EFFECTS } from '../data/items';

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
                                        <div className="flex justify-center mb-0.5"><SlotIcon slot={slot} size={20} /></div>
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
