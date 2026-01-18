import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { GEAR_SLOTS, TIERS, MATERIALS, WEAPON_TYPES } from '../data/items';

export default function CraftingView() {
    const { state, gameManager } = useGame();
    const [selectedSlot, setSelectedSlot] = useState(GEAR_SLOTS[0]);
    const [selectedWeaponType, setSelectedWeaponType] = useState(WEAPON_TYPES[0].id);
    const [selectedTier, setSelectedTier] = useState(0);

    const tierData = TIERS[selectedTier];
    const canCraft = state.gold >= tierData.goldCost &&
        state.ore >= tierData.oreCost &&
        state.leather >= tierData.leatherCost;

    const previewItem = {
        slot: selectedSlot,
        weaponType: selectedWeaponType,
        tier: selectedTier,
        plus: 0
    };

    const handleCraft = () => {
        if (!canCraft) return;

        // Construct new item
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            slot: selectedSlot,
            tier: selectedTier,
            name: `${tierData.name} ${selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)}`,
            plus: 0,
            effects: [] // Roll random effects here later
        };

        if (selectedSlot === 'weapon') {
            newItem.weaponType = selectedWeaponType;
            newItem.name = `${tierData.name} ${WEAPON_TYPES.find(w => w.id === selectedWeaponType).name}`;
        }

        // Deduct costs and add item
        gameManager.setState(prev => ({
            ...prev,
            gold: prev.gold - tierData.goldCost,
            ore: prev.ore - tierData.oreCost,
            leather: prev.leather - tierData.leatherCost,
            inventory: [...prev.inventory, newItem]
        }));

        gameManager.emit('floatingText', { x: 400, y: 225, text: "CRAFTED!", color: "#22c55e" });
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2">Blacksmith Forge</h3>

            {/* Controls */}
            <div className="bg-slate-800 p-4 rounded grid gap-4">
                {/* Slot Selection */}
                <div>
                    <div className="text-xs text-slate-400 uppercase mb-1">Gear Type</div>
                    <div className="flex flex-wrap gap-2">
                        {GEAR_SLOTS.map(slot => (
                            <button key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-2 py-1 text-xs uppercase rounded ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weapon Specific */}
                {selectedSlot === 'weapon' && (
                    <div>
                        <div className="text-xs text-slate-400 uppercase mb-1">Weapon Class</div>
                        <div className="flex gap-2">
                            {WEAPON_TYPES.map(w => (
                                <button key={w.id}
                                    onClick={() => setSelectedWeaponType(w.id)}
                                    className={`px-2 py-1 text-xs uppercase rounded ${selectedWeaponType === w.id ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    {w.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tier Selection */}
                <div>
                    <div className="text-xs text-slate-400 uppercase mb-1">Quality Tier</div>
                    <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 p-2 rounded text-white"
                    >
                        {TIERS.map(tier => (
                            <option key={tier.id} value={tier.id} disabled={state.currentZone < tier.zoneReq}>
                                {tier.name} (Req Zone {tier.zoneReq})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Preview & Cost */}
            <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded flex items-center justify-between">

                {/* Icon Preview */}
                <div className="w-24 h-24 bg-slate-800 border-2 border-slate-600 rounded flex items-center justify-center relative">
                    <div className="w-16 h-16">
                        <ItemIcon item={previewItem} />
                    </div>
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: tierData.color }} />
                </div>

                {/* Costs */}
                <div className="flex-1 ml-6">
                    <div className="font-bold text-lg text-white mb-2">{tierData.name} {selectedSlot}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={state.gold >= tierData.goldCost ? 'text-yellow-400' : 'text-red-500'}>
                            🪙 {tierData.goldCost.toLocaleString()} Gold
                        </div>
                        <div className={state.ore >= tierData.oreCost ? 'text-slate-300' : 'text-red-500'}>
                            {MATERIALS.ore.icon} {tierData.oreCost} Ore
                        </div>
                        <div className={state.leather >= tierData.leatherCost ? 'text-orange-300' : 'text-red-500'}>
                            {MATERIALS.leather.icon} {tierData.leatherCost} Leather
                        </div>
                    </div>
                </div>

                {/* Button */}
                <button
                    disabled={!canCraft}
                    onClick={handleCraft}
                    className={`px-6 py-4 font-bold text-lg rounded uppercase tracking-wider ${canCraft
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg transform hover:scale-105 transition-all'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Forge Item
                </button>
            </div>
        </div>
    );
}
