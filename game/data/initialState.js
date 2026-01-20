export const initialState = {
    gold: 50, enhanceStone: 5, blessedOrb: 0, celestialShard: 0,
    level: 1, xp: 0, currentZone: 0,
    autoSalvage: false, // Auto-salvage dropped items
    combatPaused: false, // Pause combat to take a breather
    // Boss stones - dropped by bosses, needed to enhance boss gear past +10
    bossStones: {
        guardian: 0, lich: 0, dragon: 0, frost: 0, demon: 0,
        seraph: 0, void: 0, chaos: 0, eternal: 0,
        astral: 0, cosmic: 0, primordial: 0,
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
    kills: 0, totalGold: 0, enhanceFails: 0,
    zoneKills: {}, // Track kills per zone: { 0: 50, 1: 30, ... }
    // Prestige system
    prestigeLevel: 0,
    prestigeStones: 0,
    prestigeSkills: {}, // { skillId: level }
    totalPrestiges: 0,
};
