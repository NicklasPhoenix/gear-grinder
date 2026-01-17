import React, { useEffect, useRef, useState } from 'react';
import { TIERS, GEAR_SLOTS } from '../data/items';

export default function GameTooltip({ tooltip }) {
    if (!tooltip || !tooltip.item) return null;

    const { item, position } = tooltip;
    const tierData = TIERS[item.tier] || TIERS[0];

    // Safety check for effects incase data is malformed
    const effects = item.effects || [];

    // Calculate position to keep on screen
    // Default: To the right of mouse, slightly down
    let style = {
        top: position.y + 10,
        left: position.x + 10,
    };

    // If too close to right edge, flip to left
    if (position.x > window.innerWidth - 300) {
        style.left = position.x - 220; // 200px width + padding
    }
    // If too close to bottom, flip up
    if (position.y > window.innerHeight - 300) {
        style.top = position.y - 150; // Approximated height
    }

    return (
        <div className="fixed z-[100] w-56 bg-slate-900 border-2 shadow-2xl rounded p-3 pointer-events-none"
            style={{ ...style, borderColor: tierData.color }}>

            {/* Header */}
            <div className="border-b border-slate-700 pb-2 mb-2">
                <div className="font-bold text-lg leading-tight" style={{ color: tierData.color }}>
                    {item.name} {item.plus > 0 && <span className="text-white">+{item.plus}</span>}
                </div>
                <div className="text-xs text-slate-400 uppercase font-bold mt-1">
                    {tierData.name} {item.slot}
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-1 text-sm text-slate-200">
                {/* Implicit base stats from tier/type would go here, 
                    but we might not have calculated them in the item object unless we processed it.
                    For now, show explicit effects. 
                */}

                {effects.length > 0 ? (
                    effects.map((eff, i) => (
                        <div key={i} className="flex justify-between">
                            <span className="text-slate-400">{eff.name}</span>
                            <span className="font-mono text-blue-300">+{eff.value}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-slate-600 italic">No special effects</div>
                )}
            </div>

            {/* Flavor / Footer */}
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
                {/* Only description we have is generic from slot */}
                Tier {item.tier} gear
            </div>
        </div>
    );
}
