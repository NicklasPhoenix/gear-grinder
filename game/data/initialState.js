export const initialState = {
    gold: 50, enhanceStone: 5, blessedOrb: 0, celestialShard: 0,
    level: 1, xp: 0, currentZone: 0,
    // Display settings
    textSize: 'normal', // Text size: 'normal', 'large', 'xlarge'
    // Loot filter settings
    autoSalvage: false, // Auto-salvage dropped items
    autoSalvageTier: -1, // Max tier to auto-salvage (-1 = disabled, 0-9 = tier threshold)
    autoSalvageKeepEffects: true, // Keep items with special effects from auto-salvage
    autoSalvageMaxEffectsOnly: false, // Only keep items with at least one max-rolled effect
    autoSalvageBossItems: false, // Include boss set items in auto-salvage (dangerous!)
    inventorySort: 'none', // Inventory sort: 'none', 'slot', 'tier', 'score'
    inventorySlots: 50, // Max inventory slots (upgradable)
    combatPaused: false, // Pause combat to take a breather
    autoProgress: false, // Automatically advance to next zone when unlocked
    // Boss stones - dropped by bosses, needed to enhance boss gear past +10
    bossStones: {
        crow: 0, cerberus: 0, demon: 0, spider: 0, shadow: 0,
        abyss: 0, behemoth: 0, darkwolf: 0,
        tyrant: 0, inferno: 0, scorpion: 0,
    },
    // Primary stats - weapon scaling + basic bonus
    stats: { str: 5, int: 5, vit: 5, agi: 5 },
    // Secondary stats - specialized combat stats (must be skilled separately)
    secondaryStats: {
        critChance: 0,
        critDamage: 0,
        dodge: 0,
        armor: 0,
        hpRegen: 0,
        dmgReduction: 0,
        xpBonus: 0,
        silverFind: 0,
        dropRate: 0
    },
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

    // Collection tracking - what items/content has been discovered
    collectedBossSetPieces: {}, // { setId: { slot: true, ... } }
    collectedWeaponTypes: {},   // { weaponTypeId: true }
    collectedEffects: {},       // { effectId: true }
    collectedTiers: {},         // { tierIndex: true }
    collectedEnhanceLevels: {}, // { level: true } - for 5, 10, 15, 20, 25

    // Daily/Weekly objectives
    dailyObjective: null,
    dailyObjectiveDay: 0,
    dailyObjectiveStartState: null,
    dailyObjectiveClaimed: false,
    weeklyObjective: null,
    weeklyObjectiveWeek: 0,
    weeklyObjectiveStartState: null,
    weeklyObjectiveClaimed: false,
    // Objective progress trackers (reset on claim/new objective)
    dailySalvaged: 0,
    dailyEnhanceSuccess: 0,
    dailyEquipped: 0,
    weeklyEnhanceSuccess: 0,

    // Endless mode
    endlessActive: false,
    endlessWave: 0,
    endlessBestWave: 0,
    endlessKillsThisRun: 0,
    endlessGoldThisRun: 0,
    endlessXpThisRun: 0,
    endlessMilestonesClaimedThisRun: [],
    endlessReturnZone: 0,
    endlessEnemyHp: 0,
    endlessEnemyMaxHp: 0,
    endlessEnemyDmg: 0,
    endlessEnemyName: '',
    endlessRunHistory: [], // Last 10 runs
};
