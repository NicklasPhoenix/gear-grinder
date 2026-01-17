import React from 'react';
import { ASSET_BASE } from '../../assets/gameAssets';

// Item Spritesheet Mapping
// 8x8 Grid
// Row 0: Swords
// Row 1: Staffs
// Row 2: Daggers/Bows (Mixed)
// Row 3: Armor
// Row 4: Helms
// Row 5: Boots/Gloves
// Row 6: Rings
// Row 7: Potions/Mats

const ICON_MAP = {
    weapon: {
        sword: { row: 0 },
        staff: { row: 1 },
        dagger: { row: 2, colOffset: 0 },
        bow: { row: 2, colOffset: 4 },
        mace: { row: 0, colOffset: 4 }, // Fallback to sword row variants
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
        shield: { row: 3, colOffset: 5 }, // Fallback
        amulet: { row: 6, colOffset: 4 },
        accessory: { row: 6, colOffset: 0 } // Ring
    },
    material: {
        ore: { row: 7, colOffset: 3 },
        leather: { row: 7, colOffset: 7 },
        enhanceStone: { row: 7, colOffset: 4 }, // Gold/Gems
        default: { row: 7, colOffset: 0 }
    }
};

export default function ItemIcon({ item, size = "full" }) {
    if (!item) return null;

    let row = 0;
    let col = 0;

    // Determine grid position
    if (item.type === 'material') {
        const mat = ICON_MAP.material[item.id] || ICON_MAP.material.default;
        row = mat.row;
        col = mat.colOffset || 0;
    } else {
        // Gear
        if (item.slot === 'weapon') {
            const def = ICON_MAP.weapon[item.weaponType] || ICON_MAP.weapon.sword;
            row = def.row;
            // Tier determines column somewhat, or specific weapon type
            // Let's cycle columns based on Tier to show progression
            // 8 columns. 
            const offset = def.colOffset || 0;
            // distinct icon per tier is hard with just 8 cols if we share rows.
            // Let's just use tier % 4 + offset
            col = offset + (item.tier % 4);
        } else {
            const def = ICON_MAP.armor[item.slot] || ICON_MAP.armor.armor;
            row = def.row;
            const offset = def.colOffset || 0;
            col = offset + (item.tier % 4);
        }
    }

    // Safety clamp
    row = row % 8;
    col = col % 8;

    const style = {
        backgroundImage: `url(${ASSET_BASE.items})`,
        backgroundPosition: `-${col * 100}% -${row * 100}%`, // Assuming CSS background sprite logic
        // Wait, percentages in background-position work differently.
        // If 8x8, each is 12.5%.
        // Pos = index * (100 / (cols - 1)) ? No.
        // Standard pixel offset is safer if we don't know exact CSS size.
        // Let's try separate image logic or improved calc.
        backgroundSize: '800% 800%', // 8x scale
        backgroundPosition: `${col * (100 / 7)}% ${row * (100 / 7)}%`,
        imageRendering: 'pixelated'
    };

    return (
        <div className={`w-full h-full ${size === 'sm' ? 'p-0' : 'p-1'}`}>
            <div className="w-full h-full bg-no-repeat" style={style} />
        </div>
    );
}
