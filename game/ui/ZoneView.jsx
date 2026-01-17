import React from 'react';
import { useGame } from '../context/GameContext';
import { ZONES } from '../data/zones'; // We need to export ZONES from data/zones.js first!

// Note: I need to ensure ZONES is exported from game/data/zones.js. 
// I previously extracted it but let's assume it's there. 
// If not, I might need to fix the import or move data to a shared place if it's not exported.
// Checking previous view_code_item... ZONES was extracted to game/data/zones.js.

export default function ZoneView() {
    const { state, gameManager } = useGame();

    const handleTravel = (zoneId) => {
        gameManager.setState(prev => ({
            ...prev,
            currentZone: zoneId,
            enemyHp: ZONES[zoneId].enemyHp, // Reset enemy on travel
            enemyMaxHp: ZONES[zoneId].enemyHp
        }));
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <h3 className="font-bold text-yellow-500 uppercase border-b border-slate-700 pb-2">World Map</h3>

            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
                {ZONES.map(zone => {
                    const kills = state.zoneKills[zone.id] || 0;
                    const isUnlocked = zone.id === 0 || (state.zoneKills[zone.id - 1] >= ZONES[zone.id - 1].killsRequired);
                    const isCurrent = state.currentZone === zone.id;

                    return (
                        <div key={zone.id} className={`p-3 rounded border flex justify-between items-center transition-all ${isCurrent
                                ? 'bg-blue-900/30 border-blue-500'
                                : (isUnlocked ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 cursor-pointer' : 'bg-slate-950 border-slate-800 opacity-40')
                            }`}
                            onClick={() => isUnlocked && !isCurrent && handleTravel(zone.id)}
                        >
                            <div>
                                <div className={`font-bold flex items-center gap-2 ${isUnlocked ? 'text-gray-200' : 'text-gray-500'}`}>
                                    {zone.name}
                                    {zone.isBoss && <span className="text-[10px] bg-red-900 text-red-200 px-1 rounded">BOSS</span>}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Drops: {Object.keys(zone.drops).filter(k => zone.drops[k] > 0).join(', ')}
                                </div>
                            </div>

                            <div className="text-right">
                                {isCurrent ? (
                                    <span className="text-xs font-bold text-blue-400 animate-pulse">EXPLORING</span>
                                ) : (
                                    isUnlocked ? (
                                        <span className="text-xs text-slate-400">TRAVEL</span>
                                    ) : (
                                        <span className="text-xs text-red-500">LOCKED</span>
                                    )
                                )}
                                <div className="text-[10px] text-slate-600 mt-1">
                                    Kills: {kills} / {zone.killsRequired > 0 ? zone.killsRequired : '∞'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
