export const initialState = {
    gold: 50, enhanceStone: 5, blessedOrb: 0, celestialShard: 0,
    level: 1, xp: 0, currentZone: 0,
    // Display settings
    textSize: 'normal', // Text size: 'normal', 'large', 'xlarge'
    // Loot filter settings
    autoSalvage: false, // Auto-salvage dropped items
    autoSalvageTier: -1, // Max tier to auto-salvage (-1 = disabled, 0-9 = tier threshold)
    autoSalvageKeepEffects: true, // Keep items with special effects from auto-salvage
    autoSalvageBossItems: false, // Include boss set items in auto-salvage (dangerous!)
    inventorySort: 'none', // Inventory sort: 'none', 'slot', 'tier', 'score'
    combatPaused: false, // Pause combat to take a breather
    // Boss stones - dropped by bosses, needed to enhance boss gear past +10
    bossStones: {
        crow: 0, cerberus: 0, demon: 0, spider: 0, shadow: 0,
        abyss: 0, behemoth: 0, darkwolf: 0,
        tyrant: 0, inferno: 0, scorpion: 0,
    },
    // Base stats - player can allocate points
    stats: { str: 5, int: 5, vit: 5, agi: 5, lck: 5 },
    statPoints: 0, // Points available to allocate (3 per level up)
    gear: {
        weapon: {
            id: 'starter_sword',
            slot: 'weapon',
            tier: 0,
            weaponType: 'sword',
            name: 'Rusty Sword',
            plus: 0,
            effects: []
        },
        helmet: null, armor: null, legs: null, boots: null, belt: null, shield: null, gloves: null, amulet: null
    },
    inventory: [], unlockedSkills: [], combatLog: [],
    enemyHp: 20, enemyMaxHp: 20, playerHp: 100, playerMaxHp: 100,
    kills: 0, totalGold: 0, enhanceFails: 0, enhanceFailStreak: 0, // failStreak for pity system
    zoneKills: {}, // Track kills per zone: { 0: 50, 1: 30, ... }
    // Prestige system
    prestigeLevel: 0,
    prestigeStones: 0,
    prestigeSkills: {}, // { skillId: level }
    totalPrestiges: 0,
    // Achievement stat points - persists through prestige
    achievementStatPoints: 0, // Total stat points earned from achievements (never reset)
};
