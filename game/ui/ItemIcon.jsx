import React, { useMemo } from 'react';
import { ASSET_BASE, ITEM_SPRITES, ITEM_SPRITE_CONFIG, generateMaterialIcon } from '../../assets/gameAssets';

// Approximate row counts for each sheet (for background-position calculation)
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

// Shield sprite options by tier (Icon1-36)
const SHIELD_SPRITES = [1, 5, 10, 15, 20, 24, 28, 32, 35, 36];
// Amulet sprite options by tier (Icon37-48 from the pack)
const AMULET_SPRITES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
// Belt sprite options by tier (Icon1-48)
const BELT_SPRITES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];

export default function ItemIcon({ item, size = "full" }) {
    const iconData = useMemo(() => {
        if (!item) return null;

        // Materials use procedural generation
        if (item.type === 'material') {
            return { type: 'procedural', url: generateMaterialIcon(item.id || 'ore') };
        }

        // Use new individual sprites for shields
        if (item.slot === 'shield') {
            const tier = item.tier || 0;
            const iconNum = SHIELD_SPRITES[Math.min(tier, SHIELD_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/shields/Icon${iconNum}.png` };
        }

        // Use new individual sprites for amulets
        if (item.slot === 'amulet') {
            const tier = item.tier || 0;
            const iconNum = AMULET_SPRITES[Math.min(tier, AMULET_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/amulets/Icon${iconNum}.png` };
        }

        // Use new individual sprites for belts
        if (item.slot === 'belt') {
            const tier = item.tier || 0;
            const iconNum = BELT_SPRITES[Math.min(tier, BELT_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/belts/Icon${iconNum}.png` };
        }

        // Get sprite data based on weapon type or slot
        let spriteKey = item.weaponType || item.slot || 'sword';
        const spriteData = ITEM_SPRITES[spriteKey] || ITEM_SPRITES.sword;

        return { type: 'sprite', spriteData };
    }, [item?.id, item?.slot, item?.weaponType, item?.tier, item?.type]);

    if (!item || !iconData) return null;

    const sizeClass = size === 'sm' ? 'p-0' : 'p-1';

    // Procedural icon (materials only)
    if (iconData.type === 'procedural') {
        return (
            <div className={`w-full h-full ${sizeClass} flex items-center justify-center`}>
                <img
                    src={iconData.url}
                    alt={item.name || 'Item'}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
        );
    }

    // Individual sprite file (shields, amulets)
    if (iconData.type === 'individual') {
        return (
            <div className={`w-full h-full ${sizeClass} flex items-center justify-center`}>
                <img
                    src={iconData.url}
                    alt={item.name || 'Item'}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>
        );
    }

    // Sprite sheet icon
    const { cols } = ITEM_SPRITE_CONFIG;
    const { spriteData } = iconData;
    const sheetName = spriteData.sheet || 'medwep';
    const sheetUrl = ASSET_BASE[sheetName];
    const rows = SHEET_ROWS[sheetName] || 2;

    // Calculate background position (percentage-based for CSS)
    const bgPosX = cols > 1 ? (spriteData.col / (cols - 1)) * 100 : 0;
    const bgPosY = rows > 1 ? (spriteData.row / (rows - 1)) * 100 : 0;

    return (
        <div className={`w-full h-full ${sizeClass} flex items-center justify-center`}>
            <div
                className="w-full h-full bg-no-repeat"
                style={{
                    backgroundImage: `url(${sheetUrl})`,
                    backgroundSize: `${cols * 100}% ${rows * 100}%`,
                    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                    imageRendering: 'pixelated',
                }}
            />
        </div>
    );
}
