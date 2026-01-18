import React from 'react';
import { ASSET_BASE, ITEM_SPRITES, ITEM_SPRITE_CONFIG } from '../../assets/gameAssets';

// Approximate row counts for each sheet
const SHEET_ROWS = {
    shortwep: 5,
    medwep: 2,
    longwep: 7,
    shield: 1,
    armor_items: 9,
    amulet: 3,
    ring: 2,
    boot: 2,
    glove: 1,
    hat: 2,
    potion: 6,
};

// Map slots to their sprite definitions (use nice looking variants)
const SLOT_SPRITES = {
    weapon: { sheet: 'medwep', row: 0, col: 1 },      // Nice sword
    helmet: { sheet: 'hat', row: 0, col: 2 },         // Knight helmet
    armor: { sheet: 'armor_items', row: 0, col: 2 },  // Plate armor
    boots: { sheet: 'boot', row: 0, col: 2 },         // Nice boots
    accessory: { sheet: 'ring', row: 1, col: 0 },     // Single ring
    shield: { sheet: 'shield', row: 0, col: 2 },      // Nice shield
    gloves: { sheet: 'glove', row: 0, col: 2 },       // Gauntlets
    amulet: { sheet: 'amulet', row: 0, col: 2 },      // Nice amulet
};

export default function SlotIcon({ slot, size = 24 }) {
    const spriteData = SLOT_SPRITES[slot];
    if (!spriteData) return null;

    const { cols } = ITEM_SPRITE_CONFIG;
    const sheetName = spriteData.sheet;
    const sheetUrl = ASSET_BASE[sheetName];
    const rows = SHEET_ROWS[sheetName] || 2;

    const bgPosX = cols > 1 ? (spriteData.col / (cols - 1)) * 100 : 0;
    const bgPosY = rows > 1 ? (spriteData.row / (rows - 1)) * 100 : 0;

    return (
        <div
            className="bg-no-repeat"
            style={{
                width: size,
                height: size,
                backgroundImage: `url(${sheetUrl})`,
                backgroundSize: `${cols * 100}% ${rows * 100}%`,
                backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                imageRendering: 'pixelated',
            }}
        />
    );
}
