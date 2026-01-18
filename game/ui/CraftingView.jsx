import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { GEAR_SLOTS, TIERS, WEAPON_TYPES, PRESTIGE_WEAPONS, GEAR_BASES, SPECIAL_EFFECTS } from '../data/items';

const SLOT_DISPLAY = {
    weapon: { name: 'Weapon', icon: '⚔️' },
    helmet: { name: 'Helmet', icon: '🪖' },
    armor: { name: 'Armor', icon: '🛡️' },
    boots: { name: 'Boots', icon: '👢' },
    accessory: { name: 'Ring', icon: '💍' },
    shield: { name: 'Shield', icon: '🔰' },
    gloves: { name: 'Gloves', icon: '🧤' },
    amulet: { name: 'Amulet', icon: '📿' },
};

export default function CraftingView() {
    const { state, gameManager } = useGame();
    const [selectedSlot, setSelectedSlot] = useState(GEAR_SLOTS[0]);
    const [selectedWeaponType, setSelectedWeaponType] = useState(WEAPON_TYPES[0].id);
    const [selectedTier, setSelectedTier] = useState(0);

    // Get available weapon types based on prestige level
    const availableWeapons = [
        ...WEAPON_TYPES,
        ...PRESTIGE_WEAPONS.filter(w => state.prestigeLevel >= w.prestigeReq)
    ];

    const tierData = TIERS[selectedTier];
    const gearBase = GEAR_BASES[selectedSlot];

    // Check if tier is unlocked
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

    // Calculate preview stats
    const weaponDef = selectedSlot === 'weapon'
        ? availableWeapons.find(w => w.id === selectedWeaponType)
        : null;
    const baseStats = weaponDef || gearBase;
    const previewDmg = Math.floor((baseStats.baseDmg || 0) * tierData.statMult);
    const previewHp = Math.floor((baseStats.baseHp || 0) * tierData.statMult);
    const previewArmor = Math.floor((baseStats.baseArmor || 0) * tierData.statMult);

    const handleCraft = () => {
        if (!canCraft) return;

        // Roll for random effect (higher tier = better chance)
        let effects = [];
        const effectChance = 0.1 + selectedTier * 0.1; // 10% to 100%
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
            name: `${tierData.name} ${weaponInfo ? weaponInfo.name : SLOT_DISPLAY[selectedSlot].name}`,
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
        <div className="h-full flex flex-col gap-4">
            {/* Header */}
            <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        Blacksmith Forge
                    </h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <MaterialIcon type="gold" size={18} />
                            <span className="text-yellow-400 font-bold">{state.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MaterialIcon type="ore" size={18} />
                            <span className="text-slate-300 font-bold">{state.ore}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MaterialIcon type="leather" size={18} />
                            <span className="text-amber-500 font-bold">{state.leather}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left: Controls */}
                <div className="w-1/2 glass-card rounded-xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50">
                        <h3 className="font-bold text-orange-400 text-sm uppercase tracking-wider">Configuration</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                        {/* Gear Type */}
                        <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Gear Type</div>
                            <div className="grid grid-cols-4 gap-2">
                                {GEAR_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-2 rounded-lg text-center transition-all border ${
                                            selectedSlot === slot
                                                ? 'bg-orange-600/30 border-orange-500 text-orange-300'
                                                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="text-lg mb-1">{SLOT_DISPLAY[slot].icon}</div>
                                        <div className="text-[10px] uppercase">{slot}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weapon Type */}
                        {selectedSlot === 'weapon' && (
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Weapon Class</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableWeapons.map(w => (
                                        <button
                                            key={w.id}
                                            onClick={() => setSelectedWeaponType(w.id)}
                                            className={`p-2.5 rounded-lg text-left transition-all border ${
                                                selectedWeaponType === w.id
                                                    ? 'bg-red-600/30 border-red-500'
                                                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                            }`}
                                        >
                                            <div className={`font-bold text-sm ${selectedWeaponType === w.id ? 'text-red-300' : 'text-slate-300'}`}>
                                                {w.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{w.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quality Tier */}
                        <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Quality Tier</div>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {TIERS.map(tier => {
                                    const unlocked = state.currentZone >= tier.zoneReq &&
                                        (!tier.prestigeReq || state.prestigeLevel >= tier.prestigeReq);
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => unlocked && setSelectedTier(tier.id)}
                                            disabled={!unlocked}
                                            className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-center justify-between ${
                                                selectedTier === tier.id
                                                    ? 'border-2'
                                                    : unlocked
                                                        ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-500'
                                                        : 'bg-slate-900/30 border-slate-800/30 opacity-50 cursor-not-allowed'
                                            }`}
                                            style={selectedTier === tier.id ? {
                                                backgroundColor: `${tier.color}15`,
                                                borderColor: tier.color
                                            } : {}}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: tier.color }}
                                                />
                                                <span className="font-bold" style={{ color: unlocked ? tier.color : '#64748b' }}>
                                                    {tier.name}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {tier.prestigeReq ? `P${tier.prestigeReq}+` : `Zone ${tier.zoneReq}+`}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Preview & Craft */}
                <div className="flex-1 glass-card rounded-xl p-5 flex flex-col">
                    {/* Preview */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        {/* Item Preview */}
                        <div
                            className="w-28 h-28 rounded-xl border-2 flex items-center justify-center mb-4 relative"
                            style={{
                                borderColor: tierData.color,
                                background: `linear-gradient(135deg, ${tierData.color}10, transparent)`
                            }}
                        >
                            <div className="w-20 h-20">
                                <ItemIcon item={previewItem} />
                            </div>
                            <div
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900"
                                style={{ backgroundColor: tierData.color }}
                            />
                        </div>

                        {/* Item Name */}
                        <div className="text-center mb-4">
                            <div className="font-bold text-xl" style={{ color: tierData.color }}>
                                {tierData.name} {selectedSlot === 'weapon'
                                    ? availableWeapons.find(w => w.id === selectedWeaponType)?.name
                                    : SLOT_DISPLAY[selectedSlot].name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {tierData.statMult}x stat multiplier
                            </div>
                        </div>

                        {/* Stats Preview */}
                        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
                            {previewDmg > 0 && (
                                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                                    <div className="text-[10px] text-red-400 uppercase">DMG</div>
                                    <div className="text-lg font-bold text-red-300">+{previewDmg}</div>
                                </div>
                            )}
                            {previewHp > 0 && (
                                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                                    <div className="text-[10px] text-green-400 uppercase">HP</div>
                                    <div className="text-lg font-bold text-green-300">+{previewHp}</div>
                                </div>
                            )}
                            {previewArmor > 0 && (
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                                    <div className="text-[10px] text-blue-400 uppercase">Armor</div>
                                    <div className="text-lg font-bold text-blue-300">+{previewArmor}</div>
                                </div>
                            )}
                        </div>

                        {/* Effect Chance */}
                        <div className="text-xs text-slate-500 mb-4">
                            <span className="text-purple-400">{Math.min(100, Math.floor((0.1 + selectedTier * 0.1) * 100))}%</span> chance for bonus effect
                        </div>
                    </div>

                    {/* Cost Display */}
                    <div className="p-4 rounded-xl bg-slate-900/50 mb-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 text-center">Crafting Cost</div>
                        <div className="flex justify-center gap-6">
                            <div className={`flex items-center gap-2 ${state.gold >= tierData.goldCost ? 'text-yellow-400' : 'text-red-400'}`}>
                                <MaterialIcon type="gold" size={22} />
                                <span className="font-bold text-lg">{tierData.goldCost.toLocaleString()}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${state.ore >= tierData.oreCost ? 'text-slate-300' : 'text-red-400'}`}>
                                <MaterialIcon type="ore" size={22} />
                                <span className="font-bold text-lg">{tierData.oreCost}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${state.leather >= tierData.leatherCost ? 'text-amber-500' : 'text-red-400'}`}>
                                <MaterialIcon type="leather" size={22} />
                                <span className="font-bold text-lg">{tierData.leatherCost}</span>
                            </div>
                        </div>
                    </div>

                    {/* Craft Button */}
                    <button
                        disabled={!canCraft}
                        onClick={handleCraft}
                        className={`w-full py-4 font-bold text-lg rounded-xl uppercase tracking-widest transition-all transform ${
                            canCraft
                                ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white shadow-lg hover:scale-[1.02]'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {tierUnlocked ? 'Forge Item' : `Unlock at Zone ${tierData.zoneReq}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
