import React from 'react';
import { useGame } from '../context/GameContext';
import { generateWeaponIcon, generateArmorIcon } from '../../assets/gameAssets';
import { TIERS } from '../data/items';

export default function InventoryView() {
    const { state, gameManager } = useGame();

    // Helper to trigger equip
    const handleEquip = (item) => {
        // We need to implement equip action in GameManager or expose it
        // Currently logic is in gear-grinder.jsx. 
        // We need to move logic to GameManager.
        // BUT for now, let's assume we can add actions to GameManager.
        gameManager.setState(prev => {
            // Simple swap logic replicated for immediate feedback
            const oldGear = prev.gear[item.slot];
            const newInventory = prev.inventory.filter(i => i.id !== item.id);
            if (oldGear) {
                const { isEquipped, ...cleanOld } = oldGear;
                newInventory.push(cleanOld);
            }
            const { isEquipped, ...cleanItem } = item;
            return {
                ...prev,
                gear: { ...prev.gear, [item.slot]: cleanItem },
                inventory: newInventory
            };
        });
    };

    const handleSalvage = (item) => {
        gameManager.setState(prev => {
            // Simplified salvage provided for UI demo
            // Real logic should be in a System
            return {
                ...prev,
                gold: prev.gold + 50, // placeholder
                inventory: prev.inventory.filter(i => i.id !== item.id)
            };
        });
    };

    return (
        <div className="flex h-full gap-4 text-xs">
            {/* Equipped Gear */}
            <div className="w-1/3 p-2 bg-slate-800 rounded flex flex-col gap-2">
                <h3 className="font-bold text-yellow-500 uppercase">Equipped</h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(state.gear).map(([slot, item]) => (
                        <div key={slot} className="relative aspect-square bg-slate-900 border border-slate-700 rounded p-1 group">
                            <div className="absolute top-0 left-1 text-[10px] text-slate-500 uppercase">{slot}</div>
                            {item ? (
                                <>
                                    <img src={slot === 'weapon' ? generateWeaponIcon(item.weaponType, item.tier) : generateArmorIcon(slot, item.tier)}
                                        alt={item.name} className="w-full h-full object-contain pixelated" />
                                    <div className="absolute bottom-0 right-0 bg-black/50 px-1 text-white">+{item.plus || 0}</div>
                                    {/* Hover Tooltip (Basic) */}
                                    <div className="hidden group-hover:block absolute bottom-full left-0 w-48 bg-black border border-white p-2 z-50">
                                        <div style={{ color: TIERS[item.tier].color }}>{item.name}</div>
                                        <div>Tier {item.tier}</div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700 text-2xl">+</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="flex-1 p-4 bg-slate-900/50 rounded-lg overflow-y-auto custom-scrollbar">
                <div className="flex justify-between mb-2 border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-white uppercase tracking-wider">Backpack ({state.inventory.length}/50)</h3>
                    <span className="text-xs text-slate-400">Click to Equip</span>
                </div>
                <div className="grid grid-cols-6 gap-3 content-start">
                    {state.inventory.map(item => (
                        <div key={item.id} className="relative aspect-square bg-slate-800 border-2 border-slate-700 hover:border-yellow-400 hover:bg-slate-700 cursor-pointer group transition-all rounded shadow-sm"
                            onClick={() => handleEquip(item)}>
                            <img src={item.slot === 'weapon' ? generateWeaponIcon(item.weaponType, item.tier) : generateArmorIcon(item.slot, item.tier)}
                                alt={item.name} className="w-full h-full object-contain pixelated p-1" />
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: TIERS[item.tier].color }} />

                            {/* Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-full right-0 w-48 bg-slate-900 border border-slate-500 p-2 z-50 pointer-events-none">
                                <div className="font-bold border-b border-gray-700 pb-1 mb-1" style={{ color: TIERS[item.tier].color }}>{item.plus ? `+${item.plus} ` : ''}{item.name}</div>
                                {item.effects && item.effects.map((e, i) => (
                                    <div key={i} className="text-green-400">
                                        {e.name}: {e.value}
                                    </div>
                                ))}
                                <div className="text-gray-500 mt-1 italic">Click to Equip</div>
                            </div>
                        </div>
                    ))}
                    {/* Empty Slots Filler */}
                    {Array.from({ length: Math.max(0, 20 - state.inventory.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-slate-900/50 border border-slate-800" />
                    ))}
                </div>
            </div>
        </div>
    );
}
