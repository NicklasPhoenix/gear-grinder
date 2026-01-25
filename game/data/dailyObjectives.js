// Daily/Weekly Objectives - Rotating tasks with rewards

// Objective templates - randomly selected each day/week
export const DAILY_OBJECTIVE_TEMPLATES = [
    {
        id: 'kill_enemies',
        name: 'Slayer',
        description: 'Defeat {target} enemies',
        targetRange: [50, 200],
        getProgress: (state, startState) => (state.kills || 0) - (startState?.kills || 0),
        reward: { silver: 1000, enhanceStone: 5 }
    },
    {
        id: 'kill_boss',
        name: 'Boss Hunter',
        description: 'Defeat a boss {target} times',
        targetRange: [1, 3],
        getProgress: (state, startState) => {
            const currentBossKills = Object.entries(state.zoneKills || {})
                .filter(([zoneId]) => {
                    const id = parseInt(zoneId);
                    // Boss zones: 4,9,14,19,24,29,34,39 (regular) + 41,43,45 (prestige)
                    return [4,9,14,19,24,29,34,39,41,43,45].includes(id);
                })
                .reduce((sum, [, kills]) => sum + kills, 0);
            const startBossKills = Object.entries(startState?.zoneKills || {})
                .filter(([zoneId]) => {
                    const id = parseInt(zoneId);
                    return [4,9,14,19,24,29,34,39,41,43,45].includes(id);
                })
                .reduce((sum, [, kills]) => sum + kills, 0);
            return currentBossKills - startBossKills;
        },
        reward: { silver: 2000, blessedOrb: 3 }
    },
    {
        id: 'earn_silver',
        name: 'Treasure Hunter',
        description: 'Earn {target} silver',
        targetRange: [5000, 20000],
        getProgress: (state, startState) => (state.totalGold || 0) - (startState?.totalGold || 0),
        reward: { enhanceStone: 10 }
    },
    {
        id: 'salvage_items',
        name: 'Recycler',
        description: 'Salvage {target} items',
        targetRange: [10, 30],
        progressKey: 'dailySalvaged', // Tracked separately
        getProgress: (state, startState) => (state.dailySalvaged || 0) - (startState?.dailySalvaged || 0),
        reward: { silver: 1500, enhanceStone: 8 }
    },
    {
        id: 'enhance_success',
        name: 'Blacksmith',
        description: 'Successfully enhance {target} times',
        targetRange: [3, 8],
        progressKey: 'dailyEnhanceSuccess',
        getProgress: (state, startState) => (state.dailyEnhanceSuccess || 0) - (startState?.dailyEnhanceSuccess || 0),
        reward: { blessedOrb: 2, celestialShard: 1 }
    },
    {
        id: 'equip_items',
        name: 'Fashion Show',
        description: 'Equip {target} different items',
        targetRange: [5, 15],
        progressKey: 'dailyEquipped',
        getProgress: (state, startState) => (state.dailyEquipped || 0) - (startState?.dailyEquipped || 0),
        reward: { silver: 1000, enhanceStone: 5 }
    },
    {
        id: 'level_up',
        name: 'Growth Spurt',
        description: 'Gain {target} levels',
        targetRange: [1, 5],
        getProgress: (state, startState) => (state.level || 1) - (startState?.level || 1),
        reward: { silver: 2000, enhanceStone: 10 }
    },
    {
        id: 'collect_materials',
        name: 'Gatherer',
        description: 'Collect {target} enhancement materials',
        targetRange: [20, 50],
        getProgress: (state, startState) => {
            const current = (state.enhanceStone || 0) + (state.blessedOrb || 0) * 10 + (state.celestialShard || 0) * 50;
            const start = (startState?.enhanceStone || 0) + (startState?.blessedOrb || 0) * 10 + (startState?.celestialShard || 0) * 50;
            return Math.max(0, current - start);
        },
        reward: { silver: 1500, blessedOrb: 2 }
    }
];

export const WEEKLY_OBJECTIVE_TEMPLATES = [
    {
        id: 'weekly_kills',
        name: 'Massacre',
        description: 'Defeat {target} enemies this week',
        targetRange: [500, 1500],
        getProgress: (state, startState) => (state.kills || 0) - (startState?.kills || 0),
        reward: { silver: 10000, enhanceStone: 50, blessedOrb: 10 }
    },
    {
        id: 'weekly_bosses',
        name: 'Boss Slayer',
        description: 'Defeat bosses {target} times this week',
        targetRange: [10, 25],
        getProgress: (state, startState) => {
            const currentBossKills = Object.entries(state.zoneKills || {})
                .filter(([zoneId]) => [4,9,14,19,24,29,34,39,41,43,45].includes(parseInt(zoneId)))
                .reduce((sum, [, kills]) => sum + kills, 0);
            const startBossKills = Object.entries(startState?.zoneKills || {})
                .filter(([zoneId]) => [4,9,14,19,24,29,34,39,41,43,45].includes(parseInt(zoneId)))
                .reduce((sum, [, kills]) => sum + kills, 0);
            return currentBossKills - startBossKills;
        },
        reward: { silver: 15000, celestialShard: 5, prestigeStones: 5 }
    },
    {
        id: 'weekly_enhance',
        name: 'Master Smith',
        description: 'Successfully enhance {target} times this week',
        targetRange: [15, 40],
        progressKey: 'weeklySalvaged',
        getProgress: (state, startState) => (state.weeklyEnhanceSuccess || 0) - (startState?.weeklyEnhanceSuccess || 0),
        reward: { celestialShard: 3, blessedOrb: 15 }
    },
    {
        id: 'weekly_silver',
        name: 'Wealthy',
        description: 'Earn {target} silver this week',
        targetRange: [50000, 150000],
        getProgress: (state, startState) => (state.totalGold || 0) - (startState?.totalGold || 0),
        reward: { enhanceStone: 100, blessedOrb: 20 }
    },
    {
        id: 'weekly_prestige',
        name: 'Ascendant',
        description: 'Prestige {target} times this week',
        targetRange: [1, 2],
        getProgress: (state, startState) => (state.totalPrestiges || 0) - (startState?.totalPrestiges || 0),
        reward: { prestigeStones: 20, celestialShard: 10 }
    }
];

/**
 * Generate a random daily objective
 * @param {number} seed - Random seed (use day number for consistency)
 * @returns {Object} Generated objective
 */
export function generateDailyObjective(seed) {
    // Use seed for deterministic random selection
    const rng = seededRandom(seed);
    const templateIndex = Math.floor(rng() * DAILY_OBJECTIVE_TEMPLATES.length);
    const template = DAILY_OBJECTIVE_TEMPLATES[templateIndex];

    const target = Math.floor(
        template.targetRange[0] + rng() * (template.targetRange[1] - template.targetRange[0])
    );

    return {
        ...template,
        target,
        description: template.description.replace('{target}', target.toLocaleString()),
        generatedAt: Date.now()
    };
}

/**
 * Generate a random weekly objective
 * @param {number} seed - Random seed (use week number for consistency)
 * @returns {Object} Generated objective
 */
export function generateWeeklyObjective(seed) {
    const rng = seededRandom(seed);
    const templateIndex = Math.floor(rng() * WEEKLY_OBJECTIVE_TEMPLATES.length);
    const template = WEEKLY_OBJECTIVE_TEMPLATES[templateIndex];

    const target = Math.floor(
        template.targetRange[0] + rng() * (template.targetRange[1] - template.targetRange[0])
    );

    return {
        ...template,
        target,
        description: template.description.replace('{target}', target.toLocaleString()),
        generatedAt: Date.now()
    };
}

/**
 * Seeded random number generator for consistent objectives
 */
function seededRandom(seed) {
    let state = seed;
    return function() {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return state / 0x7fffffff;
    };
}

/**
 * Get current day number (days since epoch, UTC)
 */
export function getCurrentDayNumber() {
    return Math.floor(Date.now() / (24 * 60 * 60 * 1000));
}

/**
 * Get current week number (weeks since epoch, UTC)
 */
export function getCurrentWeekNumber() {
    return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Get time until next daily reset (midnight UTC)
 * @returns {number} Milliseconds until reset
 */
export function getTimeUntilDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
}

/**
 * Get time until next weekly reset (Monday midnight UTC)
 * @returns {number} Milliseconds until reset
 */
export function getTimeUntilWeeklyReset() {
    const now = new Date();
    const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(0, 0, 0, 0);
    return nextMonday.getTime() - now.getTime();
}

/**
 * Format time remaining as human-readable string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string
 */
export function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Apply objective reward to state
 * @param {Object} state - Game state (will be mutated)
 * @param {Object} reward - Reward object
 */
export function applyObjectiveReward(state, reward) {
    if (reward.silver) state.gold = (state.gold || 0) + reward.silver;
    if (reward.enhanceStone) state.enhanceStone = (state.enhanceStone || 0) + reward.enhanceStone;
    if (reward.blessedOrb) state.blessedOrb = (state.blessedOrb || 0) + reward.blessedOrb;
    if (reward.celestialShard) state.celestialShard = (state.celestialShard || 0) + reward.celestialShard;
    if (reward.prestigeStones) state.prestigeStones = (state.prestigeStones || 0) + reward.prestigeStones;
}

/**
 * Check and update objective state
 * @param {Object} state - Game state
 * @returns {Object} { daily: { objective, progress, complete }, weekly: { ... } }
 */
export function checkObjectives(state) {
    const currentDay = getCurrentDayNumber();
    const currentWeek = getCurrentWeekNumber();

    // Initialize or reset daily objective
    if (!state.dailyObjective || state.dailyObjectiveDay !== currentDay) {
        state.dailyObjective = generateDailyObjective(currentDay);
        state.dailyObjectiveDay = currentDay;
        state.dailyObjectiveStartState = {
            kills: state.kills || 0,
            totalGold: state.totalGold || 0,
            level: state.level || 1,
            zoneKills: { ...(state.zoneKills || {}) },
            enhanceStone: state.enhanceStone || 0,
            blessedOrb: state.blessedOrb || 0,
            celestialShard: state.celestialShard || 0,
            dailySalvaged: 0,
            dailyEnhanceSuccess: 0,
            dailyEquipped: 0
        };
        state.dailyObjectiveClaimed = false;
    }

    // Initialize or reset weekly objective
    if (!state.weeklyObjective || state.weeklyObjectiveWeek !== currentWeek) {
        state.weeklyObjective = generateWeeklyObjective(currentWeek);
        state.weeklyObjectiveWeek = currentWeek;
        state.weeklyObjectiveStartState = {
            kills: state.kills || 0,
            totalGold: state.totalGold || 0,
            totalPrestiges: state.totalPrestiges || 0,
            zoneKills: { ...(state.zoneKills || {}) },
            weeklyEnhanceSuccess: 0
        };
        state.weeklyObjectiveClaimed = false;
    }

    // Calculate progress
    const dailyProgress = state.dailyObjective.getProgress(state, state.dailyObjectiveStartState);
    const weeklyProgress = state.weeklyObjective.getProgress(state, state.weeklyObjectiveStartState);

    return {
        daily: {
            objective: state.dailyObjective,
            progress: dailyProgress,
            target: state.dailyObjective.target,
            complete: dailyProgress >= state.dailyObjective.target,
            claimed: state.dailyObjectiveClaimed,
            timeRemaining: getTimeUntilDailyReset()
        },
        weekly: {
            objective: state.weeklyObjective,
            progress: weeklyProgress,
            target: state.weeklyObjective.target,
            complete: weeklyProgress >= state.weeklyObjective.target,
            claimed: state.weeklyObjectiveClaimed,
            timeRemaining: getTimeUntilWeeklyReset()
        }
    };
}
