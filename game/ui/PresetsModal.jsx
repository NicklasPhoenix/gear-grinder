import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GEAR_SLOTS, TIERS, BOSS_SETS } from '../data/items';

const MAX_PRESETS = 5;

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

export default function PresetsModal({ onClose }) {
    const { state, gameManager } = useGame();
    const [presets, setPresets] = useState(state.equipmentPresets || []);
    const [editingPreset, setEditingPreset] = useState(null);
    const [presetName, setPresetName] = useState('');

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (editingPreset !== null) {
                    setEditingPreset(null);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, editingPreset]);

    // Save current equipment as a preset
    const handleSavePreset = (slotIndex) => {
        const currentGear = state.gear || {};

        // Create a minimal copy of equipped gear
        const gearSnapshot = {};
        for (const [slot, item] of Object.entries(currentGear)) {
            if (item) {
                gearSnapshot[slot] = {
                    slot: item.slot,
                    name: item.name,
                    tier: item.tier,
                    plus: item.plus || 0,
                    bossSet: item.bossSet || null,
                    isBossItem: item.isBossItem || false,
                    // Store a fingerprint to match items later
                    fingerprint: `${item.name}_${item.tier}_${item.plus || 0}_${item.bossSet || 'none'}`
                };
            }
        }

        const newPreset = {
            name: presetName || `Preset ${slotIndex + 1}`,
            gear: gearSnapshot,
            savedAt: Date.now()
        };

        const newPresets = [...presets];
        newPresets[slotIndex] = newPreset;
        setPresets(newPresets);

        // Save to game state
        gameManager.setState(prev => ({
            ...prev,
            equipmentPresets: newPresets
        }));

        setEditingPreset(null);
        setPresetName('');
    };

    // Load a preset
    const handleLoadPreset = (preset) => {
        if (!preset || !preset.gear) return;

        gameManager.setState(prev => {
            const newState = { ...prev };
            let newGear = { ...prev.gear };
            let newInventory = [...prev.inventory];
            let _equipped = 0;

            // First, unequip all current gear into inventory
            for (const [slot, item] of Object.entries(newGear)) {
                if (item) {
                    newInventory.push({ ...item, id: Date.now() + Math.random() });
                    newGear[slot] = null;
                }
            }

            // Then, try to equip items from inventory matching the preset
            for (const [slot, presetItem] of Object.entries(preset.gear)) {
                // Find a matching item in inventory
                const matchIndex = newInventory.findIndex(invItem => {
                    if (invItem.slot !== slot) return false;
                    // Match by fingerprint if available, otherwise by name and tier
                    const invFingerprint = `${invItem.name}_${invItem.tier}_${invItem.plus || 0}_${invItem.bossSet || 'none'}`;
                    return invFingerprint === presetItem.fingerprint ||
                        (invItem.name === presetItem.name && invItem.tier === presetItem.tier);
                });

                if (matchIndex >= 0) {
                    const matchedItem = newInventory[matchIndex];
                    newGear[slot] = { ...matchedItem };
                    delete newGear[slot].count;
                    newInventory.splice(matchIndex, 1);
                }
            }

            newState.gear = newGear;
            newState.inventory = newInventory;

            return newState;
        });

        gameManager.emit('floatingText', {
            text: `Loaded: ${preset.name}`,
            type: 'heal',
            target: 'player'
        });
    };

    // Delete a preset
    const handleDeletePreset = (slotIndex) => {
        const newPresets = [...presets];
        newPresets[slotIndex] = null;
        setPresets(newPresets);

        gameManager.setState(prev => ({
            ...prev,
            equipmentPresets: newPresets
        }));
    };

    // Get equipment summary for display
    const getGearSummary = (gear) => {
        if (!gear) return 'Empty';
        const items = Object.values(gear).filter(Boolean);
        if (items.length === 0) return 'Empty';
        return `${items.length} items`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6 max-w-lg w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Equipment Presets</h2>
                        <p className="text-sm text-slate-400">Save and load equipment configurations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Preset slots */}
                <div className="space-y-3">
                    {Array.from({ length: MAX_PRESETS }).map((_, index) => {
                        const preset = presets[index];
                        const isEditing = editingPreset === index;

                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    preset
                                        ? 'bg-slate-700/50 border-slate-600/50'
                                        : 'bg-slate-900/50 border-slate-700/30 border-dashed'
                                }`}
                            >
                                {isEditing ? (
                                    // Edit mode
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={presetName}
                                            onChange={(e) => setPresetName(e.target.value)}
                                            placeholder={`Preset ${index + 1}`}
                                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            autoFocus
                                            maxLength={20}
                                        />
                                        <button
                                            onClick={() => handleSavePreset(index)}
                                            className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingPreset(null);
                                                setPresetName('');
                                            }}
                                            className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : preset ? (
                                    // Saved preset
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{preset.name}</span>
                                                <span className="text-xs text-slate-400">
                                                    ({getGearSummary(preset.gear)})
                                                </span>
                                            </div>
                                            {/* Mini gear preview */}
                                            <div className="flex gap-1 mt-2">
                                                {GEAR_SLOTS.slice(0, 6).map(slot => {
                                                    const item = preset.gear[slot];
                                                    const tierInfo = item ? TIERS[item.tier] : null;
                                                    const setInfo = item?.bossSet ? BOSS_SETS[item.bossSet] : null;

                                                    return (
                                                        <div
                                                            key={slot}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-[8px] ${
                                                                item ? 'bg-slate-600' : 'bg-slate-800'
                                                            }`}
                                                            style={{
                                                                borderWidth: '2px',
                                                                borderColor: setInfo?.color || tierInfo?.color || '#374151'
                                                            }}
                                                            title={item ? `${item.name}${item.plus > 0 ? ` +${item.plus}` : ''}` : SLOT_LABELS[slot]}
                                                        >
                                                            {item ? (
                                                                item.plus > 0 ? `+${item.plus}` : 'x'
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleLoadPreset(preset)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingPreset(index);
                                                    setPresetName(preset.name);
                                                }}
                                                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDeletePreset(index)}
                                                className="px-3 py-1.5 bg-red-600/50 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Empty slot
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Empty Slot {index + 1}</span>
                                        <button
                                            onClick={() => {
                                                setEditingPreset(index);
                                                setPresetName('');
                                            }}
                                            className="px-3 py-1.5 bg-green-600/50 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors"
                                        >
                                            Save Current
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-center">
                    <p className="text-xs text-slate-500">
                        Presets save your currently equipped gear. Loading will swap with inventory.
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to check if presets feature is available.
 */
export function usePresetsAvailable() {
    const { state } = useGame();
    return Object.values(state.gear || {}).some(Boolean);
}
