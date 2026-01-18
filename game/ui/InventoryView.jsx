import React from 'react';
import { useGame } from '../context/GameContext';
import ItemIcon from './ItemIcon';
import { TIERS, GEAR_SLOTS } from '../data/items';

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
                    <span className="text-xs text-slate-400">{Object.values(state.gear).filter(Boolean).length}/{GEAR_SLOTS.length} slots</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {GEAR_SLOTS.map(slot => {
                        const item = state.gear[slot];
                        const tierInfo = item ? TIERS[item.tier] : null;
                        return (
                            <div
                                key={slot}
                                className={`
                                    relative aspect-square rounded-lg overflow-hidden
                                    bg-gradient-to-br from-slate-800/80 to-slate-900/80
                                    border-2 transition-all duration-200 cursor-pointer group
                                    ${item
                                        ? `border-slate-600/50 hover:border-blue-500/70 ${getTierGlow(item.tier)}`
                                        : 'border-slate-700/30 border-dashed hover:border-slate-500/50'
                                    }
                                `}
                                onClick={() => item && handleEquip(item)}
                                onMouseEnter={(e) => onHover && item && onHover(item, { x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => onHover && onHover(null)}
                            >
                                {item ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center p-2">
                                            <ItemIcon item={item} />
                                        </div>

                                        {/* Enhancement level */}
                                        {item.plus > 0 && (
                                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-yellow-400">
                                                +{item.plus}
                                            </div>
                                        )}

                                        {/* Tier indicator */}
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-1 opacity-80"
                                            style={{ backgroundColor: tierInfo?.color || '#666' }}
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
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                        {state.inventory.length}/50
                    </span>
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
                                return (
                                    <div
                                        key={item.id}
                                        className={`
                                            relative aspect-square rounded-lg overflow-hidden
                                            bg-gradient-to-br from-slate-800/60 to-slate-900/60
                                            border-2 border-slate-700/40
                                            hover:border-blue-500/60 hover:scale-105
                                            cursor-pointer transition-all duration-150
                                            ${getTierGlow(item.tier)}
                                        `}
                                        onClick={() => handleEquip(item)}
                                        onMouseEnter={(e) => onHover && onHover(item, { x: e.clientX, y: e.clientY })}
                                        onMouseLeave={() => onHover && onHover(null)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <ItemIcon item={item} />
                                        </div>

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
                        Click item to equip
                    </span>
                </div>
            </div>
        </div>
    );
}
