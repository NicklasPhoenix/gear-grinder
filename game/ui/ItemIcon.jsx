import React from 'react';
import { ASSET_BASE, ITEM_SPRITES, SPRITE_CONFIG } from '../../assets/gameAssets';

export default function ItemIcon({ item, size = "full" }) {
    if (!item) return null;

    // Get sprite position from the items sprite sheet
    let spriteData = null;

    if (item.type === 'material') {
        spriteData = ITEM_SPRITES[item.id] || ITEM_SPRITES.ore;
    } else if (item.slot === 'weapon') {
        spriteData = ITEM_SPRITES[item.weaponType] || ITEM_SPRITES.sword;
    } else {
        spriteData = ITEM_SPRITES[item.slot] || ITEM_SPRITES.armor;
    }

    const { tileSize, cols, rows } = SPRITE_CONFIG;

    // Calculate background position percentage
    const bgPosX = (spriteData.col / (cols - 1)) * 100;
    const bgPosY = (spriteData.row / (rows - 1)) * 100;

    const sizeClass = size === 'sm' ? 'p-0' : 'p-1';

    return (
        <div className={`w-full h-full ${sizeClass} flex items-center justify-center`}>
            <div
                className="w-full h-full bg-no-repeat"
                style={{
                    backgroundImage: `url(${ASSET_BASE.items})`,
                    backgroundSize: `${cols * 100}% ${rows * 100}%`,
                    backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                    imageRendering: 'pixelated',
                }}
            />
        </div>
    );
}
