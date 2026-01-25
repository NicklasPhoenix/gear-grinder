// Collection/Completion Goals - Track progress on collecting various game content
import { BOSS_SETS, PRESTIGE_BOSS_SETS, WEAPON_TYPES, PRESTIGE_WEAPONS, SPECIAL_EFFECTS, GEAR_SLOTS, TIERS } from './items';
import { ZONES, PRESTIGE_ZONES } from './zones';

// All boss set IDs
export const ALL_BOSS_SETS = [
    ...Object.keys(BOSS_SETS),
    ...Object.keys(PRESTIGE_BOSS_SETS)
];

// All weapon type IDs
export const ALL_WEAPON_TYPES = [
    ...WEAPON_TYPES.map(w => w.id),
    ...PRESTIGE_WEAPONS.map(w => w.id)
];

// All effect IDs
export const ALL_EFFECTS = SPECIAL_EFFECTS.map(e => e.id);

// All zone IDs
export const ALL_ZONES = [
    ...ZONES.map(z => z.id),
    ...PRESTIGE_ZONES.map(z => z.id)
];

// Collection categories
export const COLLECTION_CATEGORIES = [
    {
        id: 'bossSets',
        name: 'Boss Sets',
        description: 'Collect all pieces from each boss set',
        icon: '👑',
        getItems: () => ALL_BOSS_SETS.map(setId => {
            const set = BOSS_SETS[setId] || PRESTIGE_BOSS_SETS[setId];
            return {
                id: setId,
                name: set.name,
                color: set.color,
                pieces: GEAR_SLOTS.length, // 9 pieces per set
                isPrestige: !!PRESTIGE_BOSS_SETS[setId]
            };
        }),
        getProgress: (state, itemId) => {
            // Count how many pieces of this set we've ever owned
            const collected = state.collectedBossSetPieces?.[itemId] || {};
            return Object.keys(collected).length;
        },
        getTotal: () => GEAR_SLOTS.length,
        checkPiece: (item, itemId) => item.bossSet === itemId
    },
    {
        id: 'weaponTypes',
        name: 'Weapon Types',
        description: 'Find each type of weapon',
        icon: '⚔️',
        getItems: () => ALL_WEAPON_TYPES.map(typeId => {
            const weapon = WEAPON_TYPES.find(w => w.id === typeId) || PRESTIGE_WEAPONS.find(w => w.id === typeId);
            return {
                id: typeId,
                name: weapon.name,
                color: weapon.prestigeReq ? '#f472b6' : '#9ca3af',
                isPrestige: !!weapon.prestigeReq
            };
        }),
        getProgress: (state, itemId) => state.collectedWeaponTypes?.[itemId] ? 1 : 0,
        getTotal: () => 1,
        checkPiece: (item, itemId) => item.slot === 'weapon' && item.weaponType === itemId
    },
    {
        id: 'effects',
        name: 'Special Effects',
        description: 'Discover all special effects on gear',
        icon: '✨',
        getItems: () => ALL_EFFECTS.map(effectId => {
            const effect = SPECIAL_EFFECTS.find(e => e.id === effectId);
            return {
                id: effectId,
                name: effect.name,
                color: effect.color
            };
        }),
        getProgress: (state, itemId) => state.collectedEffects?.[itemId] ? 1 : 0,
        getTotal: () => 1,
        checkPiece: (item, itemId) => item.effects?.some(e => e.id === itemId)
    },
    {
        id: 'tiers',
        name: 'Gear Tiers',
        description: 'Find gear of each rarity tier',
        icon: '💎',
        getItems: () => TIERS.map((tier, idx) => ({
            id: idx,
            name: tier.name,
            color: tier.color,
            isPrestige: idx >= 7
        })),
        getProgress: (state, itemId) => state.collectedTiers?.[itemId] ? 1 : 0,
        getTotal: () => 1,
        checkPiece: (item, itemId) => item.tier === itemId
    },
    {
        id: 'zones',
        name: 'Zones Cleared',
        description: 'Defeat enemies in every zone',
        icon: '🗺️',
        getItems: () => ALL_ZONES.map(zoneId => {
            const zone = [...ZONES, ...PRESTIGE_ZONES].find(z => z.id === zoneId);
            return {
                id: zoneId,
                name: zone.name,
                color: zone.isBoss ? '#ef4444' : '#9ca3af',
                isBoss: zone.isBoss,
                isPrestige: zoneId >= 40
            };
        }),
        getProgress: (state, itemId) => (state.zoneKills?.[itemId] || 0) >= 1 ? 1 : 0,
        getTotal: () => 1,
        checkPiece: null // Uses zoneKills directly
    },
    {
        id: 'enhanceLevels',
        name: 'Enhancement Mastery',
        description: 'Enhance gear to each milestone level',
        icon: '🔧',
        getItems: () => [
            { id: 5, name: '+5 Enhanced', color: '#22c55e' },
            { id: 10, name: '+10 Enhanced', color: '#3b82f6' },
            { id: 15, name: '+15 Enhanced', color: '#a855f7' },
            { id: 20, name: '+20 Enhanced', color: '#fbbf24' },
            { id: 25, name: '+25 Enhanced', color: '#ef4444' },
        ],
        getProgress: (state, itemId) => state.collectedEnhanceLevels?.[itemId] ? 1 : 0,
        getTotal: () => 1,
        checkPiece: (item, itemId) => (item.plus || 0) >= itemId
    }
];

/**
 * Check an item for collection progress and update state
 * Call this when items are obtained (drops, boss loot)
 * @param {Object} state - Game state (will be mutated)
 * @param {Object} item - The item to check
 */
export function updateCollectionProgress(state, item) {
    if (!item) return;

    // Initialize collection tracking objects if needed
    if (!state.collectedBossSetPieces) state.collectedBossSetPieces = {};
    if (!state.collectedWeaponTypes) state.collectedWeaponTypes = {};
    if (!state.collectedEffects) state.collectedEffects = {};
    if (!state.collectedTiers) state.collectedTiers = {};
    if (!state.collectedEnhanceLevels) state.collectedEnhanceLevels = {};

    // Track boss set pieces
    if (item.bossSet) {
        if (!state.collectedBossSetPieces[item.bossSet]) {
            state.collectedBossSetPieces[item.bossSet] = {};
        }
        state.collectedBossSetPieces[item.bossSet][item.slot] = true;
    }

    // Track weapon types
    if (item.slot === 'weapon' && item.weaponType) {
        state.collectedWeaponTypes[item.weaponType] = true;
    }

    // Track effects discovered
    if (item.effects) {
        item.effects.forEach(effect => {
            state.collectedEffects[effect.id] = true;
        });
    }

    // Track tiers found
    if (item.tier !== undefined) {
        state.collectedTiers[item.tier] = true;
    }

    // Track enhancement levels
    if (item.plus) {
        [5, 10, 15, 20, 25].forEach(milestone => {
            if (item.plus >= milestone) {
                state.collectedEnhanceLevels[milestone] = true;
            }
        });
    }
}

/**
 * Get overall collection completion percentage
 * @param {Object} state - Game state
 * @returns {Object} { completed, total, percentage }
 */
export function getOverallCollectionProgress(state) {
    let completed = 0;
    let total = 0;

    COLLECTION_CATEGORIES.forEach(category => {
        const items = category.getItems();
        items.forEach(item => {
            total += category.getTotal();
            completed += category.getProgress(state, item.id);
        });
    });

    return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
}

/**
 * Get collection progress for a specific category
 * @param {Object} state - Game state
 * @param {string} categoryId - Category ID
 * @returns {Object} { completed, total, percentage, items }
 */
export function getCategoryProgress(state, categoryId) {
    const category = COLLECTION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return null;

    const items = category.getItems();
    let completed = 0;
    let total = 0;

    const itemsWithProgress = items.map(item => {
        const progress = category.getProgress(state, item.id);
        const itemTotal = category.getTotal();
        completed += progress;
        total += itemTotal;
        return {
            ...item,
            progress,
            total: itemTotal,
            isComplete: progress >= itemTotal
        };
    });

    return {
        ...category,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        items: itemsWithProgress
    };
}
