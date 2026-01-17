import React from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS } from '../data/items';

export default function InventoryView({ onHover }) {
    const { state, gameManager } = useGame();

    // Helper to trigger equip
    const handleEquip = (item) => {
        let newGear = { ...state.gear };
        let newInv = [...state.inventory];
        const oldItem = newGear[item.slot];

        // Remove from inventory
        newInv = newInv.filter(i => i.id !== item.id);

        // Equip
        newGear[item.slot] = item;

        // Return old item to inventory
        if (oldItem) {
            newInv.push(oldItem);
        }

        // Update state
        gameManager.setState(prev => ({
            ...prev,
            gear: newGear,
            inventory: newInv
        }));

        gameManager.emit('floatingText', { x: 400, y: 300, text: "EQUIPPED", color: "#ffffff" });
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Equipped Section */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h3 className="font-bold text-yellow-500 uppercase tracking-widest mb-4 text-xs">Equipped Gear</h3>
                <div className="grid grid-cols-4 gap-4">
                    {GEAR_SLOTS.map(slot => {
                        const item = state.gear[slot];
                        return (
                            <div key={slot} className="relative aspect-square bg-slate-900 border-2 border-slate-800 rounded flex items-center justify-center group hover:border-blue-500 transition-colors cursor-pointer"
                                onClick={() => item && handleEquip(item)}
                                onMouseEnter={(e) => onHover && item && onHover(item, { x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => onHover && onHover(null)}
                            >
                                {item ? (
                                    <>
                                        <div className="w-3/4 h-3/4">
                                            <ItemIcon item={item} />
                                        </div>
                                        <div className="absolute top-1 right-1 text-[10px] font-bold text-yellow-400">+{item.plus}</div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                                        <div className="absolute bottom-1 w-full text-center text-[8px] uppercase tracking-tighter text-slate-300 truncate px-1">
                                            {item.name}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-700 text-xs uppercase font-bold tracking-widest rotate-[-45deg]">{slot}</div>
                                )}
                            </div>
                        )
                    })}
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
                            onClick={() => handleEquip(item)}
                            onMouseEnter={(e) => onHover && onHover(item, { x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => onHover && onHover(null)}
                        >
                            <div className="w-full h-full p-1">
                                <ItemIcon item={item} />
                            </div>
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: TIERS[item.tier].color }} />
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
