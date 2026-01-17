import React, { useState, useEffect } from 'react';
import { ASSET_BASE } from '../../assets/gameAssets';
import { loadAndProcessImage } from '../utils/assetLoader';

// Shared cache
let processedItemsUrl = null;
let processingPromise = null;

// Item Spritesheet Mapping ... 
// (Keep mapping constant)
const ICON_MAP = {
    weapon: {
        sword: { row: 0 },
        staff: { row: 1 },
        dagger: { row: 2, colOffset: 0 },
        bow: { row: 2, colOffset: 4 },
        mace: { row: 0, colOffset: 4 },
        axe: { row: 0, colOffset: 6 },
        scythe: { row: 1, colOffset: 4 },
        katana: { row: 0, colOffset: 2 },
        greataxe: { row: 0, colOffset: 5 }
    },
    armor: {
        helmet: { row: 4 },
        armor: { row: 3 },
        boots: { row: 5, colOffset: 0 },
        gloves: { row: 5, colOffset: 4 },
        shield: { row: 3, colOffset: 5 },
        amulet: { row: 6, colOffset: 4 },
        accessory: { row: 6, colOffset: 0 }
    },
    material: {
        ore: { row: 7, colOffset: 3 },
        leather: { row: 7, colOffset: 7 },
        enhanceStone: { row: 7, colOffset: 4 },
        default: { row: 7, colOffset: 0 }
    }
};

export default function ItemIcon({ item, size = "full" }) {
    const [textureUrl, setTextureUrl] = useState(processedItemsUrl || ASSET_BASE.items); // Default to raw while loading

    useEffect(() => {
        if (processedItemsUrl) return;

        if (!processingPromise) {
            processingPromise = loadAndProcessImage(ASSET_BASE.items)
                .then(url => {
                    processedItemsUrl = url;
                    return url;
                })
                .catch(err => console.error("Item processing failed", err));
        }

        processingPromise.then(url => {
            if (url) setTextureUrl(url);
        });
    }, []);

    if (!item) return null;

    let row = 0;
    let col = 0;

    // Determine grid position
    // ...
    // ... (Keep existing logic)
    if (item.type === 'material') {
        const mat = ICON_MAP.material[item.id] || ICON_MAP.material.default;
        row = mat.row;
        col = mat.colOffset || 0;
    } else {
        if (item.slot === 'weapon') {
            const def = ICON_MAP.weapon[item.weaponType] || ICON_MAP.weapon.sword;
            row = def.row;
            col = (def.colOffset || 0) + (item.tier % 4);
        } else {
            const def = ICON_MAP.armor[item.slot] || ICON_MAP.armor.armor;
            row = def.row;
            col = (def.colOffset || 0) + (item.tier % 4);
        }
    }

    row = row % 8;
    col = col % 8;

    const style = {
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: '800% 800%',
        backgroundPosition: `${col * (100 / 7)}% ${row * (100 / 7)}%`,
        imageRendering: 'pixelated'
    };

    return (
        <div className={`w-full h-full ${size === 'sm' ? 'p-0' : 'p-1'}`}>
            <div className={`w-full h-full bg-no-repeat`} style={style} />
        </div>
    );
}
