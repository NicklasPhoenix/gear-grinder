import React, { useMemo } from 'react';
import { generateWeaponIcon, generateArmorIcon, generateMaterialIcon } from '../../assets/gameAssets';

export default function ItemIcon({ item, size = "full" }) {
    // Generate icon URL using procedural canvas generation
    const iconUrl = useMemo(() => {
        if (!item) return null;

        if (item.type === 'material') {
            return generateMaterialIcon(item.id || 'ore');
        }

        if (item.slot === 'weapon') {
            return generateWeaponIcon(item.weaponType || 'sword', item.tier || 0);
        }

        // Armor slots
        return generateArmorIcon(item.slot || 'armor', item.tier || 0);
    }, [item?.id, item?.slot, item?.weaponType, item?.tier, item?.type]);

    if (!item || !iconUrl) return null;

    const sizeClass = size === 'sm' ? 'p-0' : 'p-1';

    return (
        <div className={`w-full h-full ${sizeClass} flex items-center justify-center`}>
            <img
                src={iconUrl}
                alt={item.name || 'Item'}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
}
