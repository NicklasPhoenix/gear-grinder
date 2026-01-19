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

// ======= NEW INDIVIDUAL SPRITE MAPPINGS =======
// Matching armor sets use the same icon number across all pieces
// This ensures tier X helmet matches tier X armor matches tier X boots etc.
// 48 icons available, spread across 10 tiers (0-9)
const ARMOR_SET_ICONS = [
    1,   // Tier 0: Common
    6,   // Tier 1: Uncommon
    12,  // Tier 2: Rare
    18,  // Tier 3: Epic
    24,  // Tier 4: Legendary
    30,  // Tier 5: Mythic
    36,  // Tier 6: Divine
    40,  // Tier 7: Astral (prestige)
    44,  // Tier 8: Cosmic (prestige)
    48,  // Tier 9: Primordial (prestige)
];

// Boss set icons - distinct from regular tier icons (using different icon numbers)
// Each boss set gets its own unique look
const BOSS_SET_ICONS = {
    guardian: 3,     // Green forest guardian - distinct from tier 1 (6)
    lich: 9,         // Purple lich - distinct from tier 2 (12)
    dragon: 15,      // Red dragonborn - distinct from tier 3 (18)
    frost: 21,       // Cyan frostborn - distinct from tier 4 (24)
    demon: 27,       // Red demonheart - distinct from tier 5 (30)
    seraph: 33,      // Gold seraphic - distinct from tier 6 (36)
    void: 39,        // Purple voidwalker
    chaos: 42,       // Pink chaosborn
    eternal: 45,     // Orange eternal
    // Prestige boss sets use high-tier icons
    astral: 46,
    cosmic: 47,
    primordial: 48,
};

// Sword icons by tier (48 available)
const SWORD_ICONS = [1, 6, 12, 18, 24, 30, 36, 40, 44, 48];
// Boss sword icons - distinct from regular
const BOSS_SWORD_ICONS = {
    guardian: 4, lich: 10, dragon: 16, frost: 22, demon: 28,
    seraph: 34, void: 38, chaos: 41, eternal: 43,
    astral: 45, cosmic: 47, primordial: 48,
};
// Mace icons by tier (48 available)
const MACE_ICONS = [1, 6, 12, 18, 24, 30, 36, 40, 44, 48];

// Shield sprite options by tier (Icon1-36)
const SHIELD_SPRITES = [1, 5, 10, 15, 20, 24, 28, 32, 35, 36];
// Amulet sprite options by tier (Icon37-48 from the pack - only these exist!)
const AMULET_SPRITES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
// Boss amulet icons (must be in range 37-48)
const BOSS_AMULET_ICONS = {
    guardian: 37, lich: 38, dragon: 39, frost: 40, demon: 41,
    seraph: 42, void: 43, chaos: 44, eternal: 45,
    astral: 46, cosmic: 47, primordial: 48,
};
// Belt sprite options by tier (Icon1-48)
const BELT_SPRITES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
// Boss shield icons (must be in range 1-36)
const BOSS_SHIELD_ICONS = {
    guardian: 3, lich: 8, dragon: 12, frost: 16, demon: 20,
    seraph: 24, void: 28, chaos: 32, eternal: 35,
    astral: 34, cosmic: 35, primordial: 36,
};

// Magic gem icons for materials (48 available)
const GEM_ICONS = {
    enhanceStone: 1,    // Blue gem
    blessedOrb: 13,     // Purple gem
    celestialShard: 25, // Yellow/gold gem
    prestigeStone: 37,  // Pink gem
};

export default function ItemIcon({ item, size = "full" }) {
    const iconData = useMemo(() => {
        if (!item) return null;
        const tier = item.tier || 0;

        // Materials use magic gem sprites
        if (item.type === 'material') {
            const gemIcon = GEM_ICONS[item.id] || GEM_ICONS.enhanceStone;
            return { type: 'individual', url: `/assets/gems/Icon${gemIcon}.png` };
        }

        // Check if this is a boss item
        const bossSet = item.bossSet;
        const isBossItem = !!bossSet;

        // === WEAPONS - Use individual sprites ===
        if (item.slot === 'weapon') {
            const weaponType = item.weaponType || 'sword';

            // Swords (and similar)
            if (weaponType === 'sword' || weaponType === 'katana' || weaponType === 'greataxe') {
                // Boss weapons get distinct icons
                const iconNum = isBossItem && BOSS_SWORD_ICONS[bossSet]
                    ? BOSS_SWORD_ICONS[bossSet]
                    : SWORD_ICONS[Math.min(tier, SWORD_ICONS.length - 1)];
                return { type: 'individual', url: `/assets/swords/Icon${iconNum}.png` };
            }
            // Maces
            if (weaponType === 'mace') {
                const iconNum = isBossItem && BOSS_SET_ICONS[bossSet]
                    ? BOSS_SET_ICONS[bossSet]
                    : MACE_ICONS[Math.min(tier, MACE_ICONS.length - 1)];
                return { type: 'individual', url: `/assets/maces/Icon${iconNum}.png` };
            }
            // Staffs (using spear sprites)
            if (weaponType === 'staff') {
                const iconNum = isBossItem && BOSS_SET_ICONS[bossSet]
                    ? BOSS_SET_ICONS[bossSet]
                    : ARMOR_SET_ICONS[Math.min(tier, ARMOR_SET_ICONS.length - 1)];
                return { type: 'individual', url: `/assets/staffs/Icon${iconNum}.png` };
            }
            // Daggers - use sword with offset
            if (weaponType === 'dagger') {
                const iconNum = isBossItem && BOSS_SWORD_ICONS[bossSet]
                    ? BOSS_SWORD_ICONS[bossSet]
                    : Math.min(tier * 5 + 2, 48);
                return { type: 'individual', url: `/assets/swords/Icon${iconNum}.png` };
            }
            // Scythes - use staffs since they're long weapons
            if (weaponType === 'scythe') {
                const iconNum = isBossItem && BOSS_SET_ICONS[bossSet]
                    ? BOSS_SET_ICONS[bossSet]
                    : Math.min(tier * 5 + 3, 48);
                return { type: 'individual', url: `/assets/staffs/Icon${iconNum}.png` };
            }
            // Default to sword
            const iconNum = isBossItem && BOSS_SWORD_ICONS[bossSet]
                ? BOSS_SWORD_ICONS[bossSet]
                : SWORD_ICONS[Math.min(tier, SWORD_ICONS.length - 1)];
            return { type: 'individual', url: `/assets/swords/Icon${iconNum}.png` };
        }

        // === ARMOR PIECES - Use matching set icons ===
        // Boss items get distinct icons, regular items use tier-based icons
        const armorSetIcon = isBossItem && BOSS_SET_ICONS[bossSet]
            ? BOSS_SET_ICONS[bossSet]
            : ARMOR_SET_ICONS[Math.min(tier, ARMOR_SET_ICONS.length - 1)];

        if (item.slot === 'helmet') {
            return { type: 'individual', url: `/assets/helmets/Icon${armorSetIcon}.png` };
        }
        if (item.slot === 'armor') {
            return { type: 'individual', url: `/assets/armor/Icon${armorSetIcon}.png` };
        }
        if (item.slot === 'legs') {
            return { type: 'individual', url: `/assets/trousers/Icon${armorSetIcon}.png` };
        }
        if (item.slot === 'boots') {
            return { type: 'individual', url: `/assets/boots/Icon${armorSetIcon}.png` };
        }
        if (item.slot === 'gloves') {
            return { type: 'individual', url: `/assets/gloves/Icon${armorSetIcon}.png` };
        }

        // Use new individual sprites for shields (Icon1-36 only)
        if (item.slot === 'shield') {
            const iconNum = isBossItem && BOSS_SHIELD_ICONS[bossSet]
                ? BOSS_SHIELD_ICONS[bossSet]
                : SHIELD_SPRITES[Math.min(tier, SHIELD_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/shields/Icon${iconNum}.png` };
        }

        // Use new individual sprites for amulets (Icon37-48 only!)
        if (item.slot === 'amulet') {
            const iconNum = isBossItem && BOSS_AMULET_ICONS[bossSet]
                ? BOSS_AMULET_ICONS[bossSet]
                : AMULET_SPRITES[Math.min(tier, AMULET_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/amulets/Icon${iconNum}.png` };
        }

        // Use new individual sprites for belts
        if (item.slot === 'belt') {
            const iconNum = isBossItem && BOSS_SET_ICONS[bossSet]
                ? BOSS_SET_ICONS[bossSet]
                : BELT_SPRITES[Math.min(tier, BELT_SPRITES.length - 1)];
            return { type: 'individual', url: `/assets/belts/Icon${iconNum}.png` };
        }

        // Fallback to sprite sheet system for anything not covered
        let spriteKey = item.weaponType || item.slot || 'sword';
        const spriteData = ITEM_SPRITES[spriteKey] || ITEM_SPRITES.sword;

        return { type: 'sprite', spriteData };
    }, [item?.id, item?.slot, item?.weaponType, item?.tier, item?.type, item?.bossSet]);

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
