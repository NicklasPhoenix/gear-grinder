/**
 * Daily Login Rewards system.
 * Players earn escalating rewards for consecutive daily logins.
 * Streak resets if a day is missed.
 */

// Rewards for each consecutive day (cycles after day 7)
export const DAILY_REWARDS = [
    // Day 1
    {
        day: 1,
        rewards: { gold: 500, enhanceStone: 10 },
        description: 'Welcome back!',
    },
    // Day 2
    {
        day: 2,
        rewards: { gold: 1000, enhanceStone: 20 },
        description: 'Keep it up!',
    },
    // Day 3
    {
        day: 3,
        rewards: { gold: 2000, enhanceStone: 30, blessedOrb: 5 },
        description: 'Three in a row!',
    },
    // Day 4
    {
        day: 4,
        rewards: { gold: 3000, enhanceStone: 50, blessedOrb: 10 },
        description: 'Halfway there!',
    },
    // Day 5
    {
        day: 5,
        rewards: { gold: 5000, enhanceStone: 75, blessedOrb: 15, celestialShard: 5 },
        description: 'Five day streak!',
    },
    // Day 6
    {
        day: 6,
        rewards: { gold: 7500, enhanceStone: 100, blessedOrb: 20, celestialShard: 10 },
        description: 'Almost there!',
    },
    // Day 7 - Weekly bonus
    {
        day: 7,
        rewards: { gold: 15000, enhanceStone: 200, blessedOrb: 50, celestialShard: 25, statPoints: 5 },
        description: 'Weekly Bonus!',
        isWeeklyBonus: true,
    },
];

/**
 * Get the reward for a specific streak day.
 * After day 7, cycles back with increased multiplier.
 * @param {number} streakDay - Current streak day (1-indexed)
 * @returns {Object} Reward data for that day
 */
export function getDailyReward(streakDay) {
    const weekNum = Math.floor((streakDay - 1) / 7);
    const dayInWeek = ((streakDay - 1) % 7) + 1;
    const baseReward = DAILY_REWARDS[dayInWeek - 1];

    // After first week, multiply rewards by week number
    const multiplier = 1 + (weekNum * 0.5); // 1x, 1.5x, 2x, 2.5x...

    const scaledRewards = {};
    for (const [key, value] of Object.entries(baseReward.rewards)) {
        scaledRewards[key] = Math.floor(value * multiplier);
    }

    return {
        ...baseReward,
        day: streakDay,
        rewards: scaledRewards,
        multiplier: multiplier > 1 ? `${multiplier}x` : null,
    };
}

/**
 * Check if a new day has started since the last login.
 * Uses UTC to ensure consistent day boundaries worldwide.
 * @param {number} lastLoginTimestamp - Unix timestamp of last login
 * @returns {boolean} True if it's a new day
 */
export function isNewDay(lastLoginTimestamp) {
    if (!lastLoginTimestamp) return true;

    const now = new Date();
    const lastLogin = new Date(lastLoginTimestamp);

    // Compare UTC dates
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastUTC = Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate());

    return nowUTC > lastUTC;
}

/**
 * Check if the streak should be reset (missed more than 1 day).
 * @param {number} lastLoginTimestamp - Unix timestamp of last login
 * @returns {boolean} True if streak should reset
 */
export function shouldResetStreak(lastLoginTimestamp) {
    if (!lastLoginTimestamp) return false;

    const now = new Date();
    const lastLogin = new Date(lastLoginTimestamp);

    // Calculate days between logins
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastUTC = Date.UTC(lastLogin.getUTCFullYear(), lastLogin.getUTCMonth(), lastLogin.getUTCDate());

    const daysDiff = Math.floor((nowUTC - lastUTC) / (1000 * 60 * 60 * 24));

    // Reset if more than 1 day has passed
    return daysDiff > 1;
}

/**
 * Apply daily rewards to game state.
 * @param {Object} state - Current game state (modified in place)
 * @param {Object} rewards - Reward object from daily reward
 */
export function applyDailyReward(state, rewards) {
    if (rewards.gold) state.gold += rewards.gold;
    if (rewards.enhanceStone) state.enhanceStone += rewards.enhanceStone;
    if (rewards.blessedOrb) state.blessedOrb += rewards.blessedOrb;
    if (rewards.celestialShard) state.celestialShard += rewards.celestialShard;
    if (rewards.prestigeStones) state.prestigeStones = (state.prestigeStones || 0) + rewards.prestigeStones;
    if (rewards.statPoints) state.statPoints = (state.statPoints || 0) + rewards.statPoints;
}

/**
 * Get time remaining until next daily reward.
 * @returns {Object} { hours, minutes, seconds }
 */
export function getTimeUntilNextReward() {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1
    ));

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
}
