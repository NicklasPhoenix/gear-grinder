import React, { useMemo } from 'react';
import { ASSET_BASE, ITEM_SPRITES, ITEM_SPRITE_CONFIG, generateWeaponIcon, generateArmorIcon, generateMaterialIcon } from '../../assets/gameAssets';

export default function ItemIcon({ item, size = "full" }) {
    const iconData = useMemo(() => {
        if (!item) return null;

        // Materials use procedural generation
        if (item.type === 'material') {
            return { type: 'procedural', url: generateMaterialIcon(item.id || 'ore') };
        }

        // Weapons use the sprite sheet
        if (item.slot === 'weapon') {
            const spriteData = ITEM_SPRITES[item.weaponType] || ITEM_SPRITES.sword;
            return { type: 'sprite', spriteData };
        }

        // Armor and accessories use procedural generation
        return { type: 'procedural', url: generateArmorIcon(item.slot || 'armor', item.tier || 0) };
    }, [item?.id, item?.slot, item?.weaponType, item?.tier, item?.type]);

    if (!item || !iconData) return null;

    const sizeClass = size === 'sm' ? 'p-0' : 'p-1';

    // Procedural icon (armor, accessories, materials)
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

    // Sprite sheet icon (weapons)
    const { cols, rows } = ITEM_SPRITE_CONFIG;
    const { spriteData } = iconData;
    const bgPosX = cols > 1 ? (spriteData.col / (cols - 1)) * 100 : 0;
    const bgPosY = rows > 1 ? (spriteData.row / (rows - 1)) * 100 : 0;

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
