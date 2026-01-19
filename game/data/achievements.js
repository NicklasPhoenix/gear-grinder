/**
 * Achievement definitions for player milestones.
 * Each achievement has an id, name, description, condition check, and reward.
 */

export const ACHIEVEMENTS = [
    // Kill milestones
    {
        id: 'kills_100',
        name: 'First Blood',
        description: 'Defeat 100 enemies',
        icon: '💀',
        category: 'combat',
        check: (state) => state.kills >= 100,
        reward: { gold: 500 },
    },
    {
        id: 'kills_1000',
        name: 'Warrior',
        description: 'Defeat 1,000 enemies',
        icon: '⚔️',
        category: 'combat',
        check: (state) => state.kills >= 1000,
        reward: { gold: 2000, statPoints: 5 },
    },
    {
        id: 'kills_10000',
        name: 'Slayer',
        description: 'Defeat 10,000 enemies',
        icon: '🗡️',
        category: 'combat',
        check: (state) => state.kills >= 10000,
        reward: { gold: 10000, statPoints: 10 },
    },
    {
        id: 'kills_100000',
        name: 'Legend',
        description: 'Defeat 100,000 enemies',
        icon: '👑',
        category: 'combat',
        check: (state) => state.kills >= 100000,
        reward: { gold: 50000, statPoints: 25 },
    },

    // Gold milestones
    {
        id: 'gold_1000',
        name: 'Pocket Change',
        description: 'Earn 1,000 total gold',
        icon: '🪙',
        category: 'wealth',
        check: (state) => (state.totalGold || 0) >= 1000,
        reward: { enhanceStone: 10 },
    },
    {
        id: 'gold_10000',
        name: 'Wealthy',
        description: 'Earn 10,000 total gold',
        icon: '💰',
        category: 'wealth',
        check: (state) => (state.totalGold || 0) >= 10000,
        reward: { enhanceStone: 50, blessedOrb: 5 },
    },
    {
        id: 'gold_100000',
        name: 'Rich',
        description: 'Earn 100,000 total gold',
        icon: '💎',
        category: 'wealth',
        check: (state) => (state.totalGold || 0) >= 100000,
        reward: { enhanceStone: 200, blessedOrb: 20 },
    },
    {
        id: 'gold_1000000',
        name: 'Millionaire',
        description: 'Earn 1,000,000 total gold',
        icon: '🏆',
        category: 'wealth',
        check: (state) => (state.totalGold || 0) >= 1000000,
        reward: { celestialShard: 50, statPoints: 20 },
    },

    // Level milestones
    {
        id: 'level_10',
        name: 'Apprentice',
        description: 'Reach level 10',
        icon: '📈',
        category: 'progress',
        check: (state) => state.level >= 10,
        reward: { gold: 1000 },
    },
    {
        id: 'level_25',
        name: 'Journeyman',
        description: 'Reach level 25',
        icon: '📊',
        category: 'progress',
        check: (state) => state.level >= 25,
        reward: { gold: 5000, statPoints: 5 },
    },
    {
        id: 'level_50',
        name: 'Expert',
        description: 'Reach level 50',
        icon: '⭐',
        category: 'progress',
        check: (state) => state.level >= 50,
        reward: { gold: 15000, statPoints: 10 },
    },
    {
        id: 'level_100',
        name: 'Master',
        description: 'Reach level 100',
        icon: '🌟',
        category: 'progress',
        check: (state) => state.level >= 100,
        reward: { gold: 50000, statPoints: 25 },
    },

    // Zone milestones
    {
        id: 'zone_5',
        name: 'Explorer',
        description: 'Unlock zone 5',
        icon: '🗺️',
        category: 'exploration',
        check: (state) => Object.keys(state.zoneKills || {}).length >= 5,
        reward: { gold: 2000 },
    },
    {
        id: 'zone_10',
        name: 'Adventurer',
        description: 'Unlock zone 10',
        icon: '🧭',
        category: 'exploration',
        check: (state) => Object.keys(state.zoneKills || {}).length >= 10,
        reward: { gold: 10000, enhanceStone: 50 },
    },
    {
        id: 'zone_15',
        name: 'Veteran',
        description: 'Unlock zone 15',
        icon: '🏔️',
        category: 'exploration',
        check: (state) => Object.keys(state.zoneKills || {}).length >= 15,
        reward: { gold: 25000, blessedOrb: 25 },
    },
    {
        id: 'zone_20',
        name: 'Conqueror',
        description: 'Unlock zone 20',
        icon: '🏰',
        category: 'exploration',
        check: (state) => Object.keys(state.zoneKills || {}).length >= 20,
        reward: { celestialShard: 25, statPoints: 15 },
    },

    // Enhancement milestones
    {
        id: 'enhance_plus5',
        name: 'Upgrader',
        description: 'Enhance any item to +5',
        icon: '🔧',
        category: 'crafting',
        check: (state) => {
            const allGear = [...(state.inventory || []), ...Object.values(state.gear || {})];
            return allGear.some(item => item && item.plus >= 5);
        },
        reward: { enhanceStone: 25 },
    },
    {
        id: 'enhance_plus10',
        name: 'Artisan',
        description: 'Enhance any item to +10',
        icon: '⚒️',
        category: 'crafting',
        check: (state) => {
            const allGear = [...(state.inventory || []), ...Object.values(state.gear || {})];
            return allGear.some(item => item && item.plus >= 10);
        },
        reward: { blessedOrb: 15, enhanceStone: 100 },
    },
    {
        id: 'enhance_plus15',
        name: 'Blacksmith',
        description: 'Enhance any item to +15',
        icon: '🔨',
        category: 'crafting',
        check: (state) => {
            const allGear = [...(state.inventory || []), ...Object.values(state.gear || {})];
            return allGear.some(item => item && item.plus >= 15);
        },
        reward: { celestialShard: 10, blessedOrb: 50 },
    },
    {
        id: 'enhance_plus20',
        name: 'Master Smith',
        description: 'Enhance any item to +20',
        icon: '🌠',
        category: 'crafting',
        check: (state) => {
            const allGear = [...(state.inventory || []), ...Object.values(state.gear || {})];
            return allGear.some(item => item && item.plus >= 20);
        },
        reward: { celestialShard: 50, statPoints: 20 },
    },

    // Boss milestones
    {
        id: 'boss_first',
        name: 'Boss Slayer',
        description: 'Defeat your first boss',
        icon: '👹',
        category: 'combat',
        check: (state) => {
            const bossZones = [4, 9, 14, 19]; // Boss zone IDs
            return bossZones.some(z => (state.zoneKills?.[z] || 0) >= 1);
        },
        reward: { gold: 5000, enhanceStone: 25 },
    },
    {
        id: 'boss_all',
        name: 'Champion',
        description: 'Defeat all bosses',
        icon: '🏅',
        category: 'combat',
        check: (state) => {
            const bossZones = [4, 9, 14, 19];
            return bossZones.every(z => (state.zoneKills?.[z] || 0) >= 1);
        },
        reward: { celestialShard: 25, statPoints: 15 },
    },

    // Prestige milestones
    {
        id: 'prestige_first',
        name: 'Reborn',
        description: 'Prestige for the first time',
        icon: '🔄',
        category: 'prestige',
        check: (state) => (state.prestigeLevel || 0) >= 1,
        reward: { prestigeStones: 10 },
    },
    {
        id: 'prestige_5',
        name: 'Transcendent',
        description: 'Reach prestige level 5',
        icon: '✨',
        category: 'prestige',
        check: (state) => (state.prestigeLevel || 0) >= 5,
        reward: { prestigeStones: 50 },
    },
];

export const ACHIEVEMENT_CATEGORIES = {
    combat: { name: 'Combat', color: '#ef4444' },
    wealth: { name: 'Wealth', color: '#fbbf24' },
    progress: { name: 'Progress', color: '#a855f7' },
    exploration: { name: 'Exploration', color: '#22c55e' },
    crafting: { name: 'Crafting', color: '#3b82f6' },
    prestige: { name: 'Prestige', color: '#ec4899' },
};

/**
 * Check all achievements and return newly unlocked ones.
 * @param {Object} state - Current game state
 * @param {string[]} unlockedAchievements - Array of already unlocked achievement IDs
 * @returns {Object[]} Array of newly unlocked achievement objects
 */
export function checkAchievements(state, unlockedAchievements = []) {
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
        if (!unlockedAchievements.includes(achievement.id)) {
            try {
                if (achievement.check(state)) {
                    newlyUnlocked.push(achievement);
                }
            } catch (e) {
                // Silently ignore check errors
            }
        }
    }

    return newlyUnlocked;
}

/**
 * Apply achievement rewards to game state.
 * @param {Object} state - Current game state (modified in place)
 * @param {Object} reward - Reward object from achievement
 */
export function applyAchievementReward(state, reward) {
    if (reward.gold) state.gold += reward.gold;
    if (reward.enhanceStone) state.enhanceStone += reward.enhanceStone;
    if (reward.blessedOrb) state.blessedOrb += reward.blessedOrb;
    if (reward.celestialShard) state.celestialShard += reward.celestialShard;
    if (reward.prestigeStones) state.prestigeStones = (state.prestigeStones || 0) + reward.prestigeStones;
    if (reward.statPoints) state.statPoints = (state.statPoints || 0) + reward.statPoints;
}
