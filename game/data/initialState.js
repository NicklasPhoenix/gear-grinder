export const initialState = {
    gold: 50, ore: 5, leather: 5, enhanceStone: 3, blessedOrb: 0, celestialShard: 0,
    level: 1, xp: 0, currentZone: 0,
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
        helmet: null, armor: null, boots: null, accessory: null, shield: null, gloves: null, amulet: null
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
