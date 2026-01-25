// Endless Mode - Infinite scaling dungeon with personal bests

// Endless mode configuration
export const ENDLESS_CONFIG = {
    // Base stats for wave 1 enemies
    baseEnemyHp: 100,
    baseEnemyDmg: 15,

    // Scaling per wave (multiplicative)
    hpScalePerWave: 1.12,    // 12% more HP per wave
    dmgScalePerWave: 1.08,   // 8% more damage per wave

    // Bonus scaling every 10 waves (extra spike)
    bossWaveInterval: 10,
    bossHpMultiplier: 2.0,
    bossDmgMultiplier: 1.5,

    // Rewards per wave
    baseGoldPerWave: 50,
    goldScalePerWave: 1.05,
    baseXpPerWave: 25,
    xpScalePerWave: 1.03,

    // Material drops (chance per wave)
    enhanceStoneChance: 0.3,
    blessedOrbChance: 0.05,  // Increases after wave 20
    celestialShardChance: 0.01, // Increases after wave 50

    // Milestone rewards
    milestones: [
        { wave: 10, reward: { enhanceStone: 20 }, title: 'Survivor' },
        { wave: 25, reward: { blessedOrb: 5 }, title: 'Warrior' },
        { wave: 50, reward: { celestialShard: 3 }, title: 'Champion' },
        { wave: 75, reward: { blessedOrb: 15, celestialShard: 5 }, title: 'Legend' },
        { wave: 100, reward: { celestialShard: 10, prestigeStones: 10 }, title: 'Mythic' },
        { wave: 150, reward: { prestigeStones: 25 }, title: 'Immortal' },
        { wave: 200, reward: { prestigeStones: 50 }, title: 'Godslayer' },
    ]
};

// Enemy name pools for variety
const ENDLESS_ENEMY_NAMES = {
    normal: [
        'Shadow Crawler', 'Void Walker', 'Abyssal Fiend', 'Dark Sentinel',
        'Chaos Wraith', 'Nightmare Beast', 'Corrupted Guardian', 'Fel Stalker',
        'Doom Bringer', 'Soul Reaver', 'Phantom Terror', 'Cursed Abomination'
    ],
    boss: [
        'Abyssal Lord', 'Void Titan', 'Chaos Incarnate', 'Shadow Emperor',
        'Nightmare King', 'Doom Herald', 'Soul Devourer', 'Eternal Horror'
    ]
};

/**
 * Get enemy stats for a given wave
 * @param {number} wave - Wave number (1-indexed)
 * @returns {Object} { hp, damage, name, isBoss, goldReward, xpReward }
 */
export function getEndlessEnemyStats(wave) {
    const isBoss = wave % ENDLESS_CONFIG.bossWaveInterval === 0;

    // Calculate base scaling
    let hp = Math.floor(
        ENDLESS_CONFIG.baseEnemyHp * Math.pow(ENDLESS_CONFIG.hpScalePerWave, wave - 1)
    );
    let damage = Math.floor(
        ENDLESS_CONFIG.baseEnemyDmg * Math.pow(ENDLESS_CONFIG.dmgScalePerWave, wave - 1)
    );

    // Apply boss multipliers
    if (isBoss) {
        hp = Math.floor(hp * ENDLESS_CONFIG.bossHpMultiplier);
        damage = Math.floor(damage * ENDLESS_CONFIG.bossDmgMultiplier);
    }

    // Calculate rewards
    const goldReward = Math.floor(
        ENDLESS_CONFIG.baseGoldPerWave * Math.pow(ENDLESS_CONFIG.goldScalePerWave, wave - 1) * (isBoss ? 3 : 1)
    );
    const xpReward = Math.floor(
        ENDLESS_CONFIG.baseXpPerWave * Math.pow(ENDLESS_CONFIG.xpScalePerWave, wave - 1) * (isBoss ? 2 : 1)
    );

    // Pick a random name
    const namePool = isBoss ? ENDLESS_ENEMY_NAMES.boss : ENDLESS_ENEMY_NAMES.normal;
    const name = namePool[wave % namePool.length];

    return {
        hp,
        maxHp: hp,
        damage,
        name: isBoss ? `${name} (Wave ${wave})` : name,
        isBoss,
        goldReward,
        xpReward,
        wave
    };
}

/**
 * Roll for material drops after defeating an endless enemy
 * @param {number} wave - Current wave
 * @returns {Object} { enhanceStone, blessedOrb, celestialShard }
 */
export function rollEndlessDrops(wave) {
    const drops = {
        enhanceStone: 0,
        blessedOrb: 0,
        celestialShard: 0
    };

    // Enhance stones
    if (Math.random() < ENDLESS_CONFIG.enhanceStoneChance) {
        drops.enhanceStone = 1 + Math.floor(wave / 20);
    }

    // Blessed orbs (higher chance after wave 20)
    const orbChance = wave >= 20
        ? ENDLESS_CONFIG.blessedOrbChance * (1 + (wave - 20) / 50)
        : ENDLESS_CONFIG.blessedOrbChance;
    if (Math.random() < orbChance) {
        drops.blessedOrb = 1;
    }

    // Celestial shards (higher chance after wave 50)
    const shardChance = wave >= 50
        ? ENDLESS_CONFIG.celestialShardChance * (1 + (wave - 50) / 50)
        : ENDLESS_CONFIG.celestialShardChance;
    if (Math.random() < shardChance) {
        drops.celestialShard = 1;
    }

    return drops;
}

/**
 * Check if a milestone was just reached
 * @param {number} previousWave - Wave before this kill
 * @param {number} currentWave - Wave after this kill
 * @returns {Object|null} Milestone object if reached, null otherwise
 */
export function checkMilestone(previousWave, currentWave) {
    for (const milestone of ENDLESS_CONFIG.milestones) {
        if (previousWave < milestone.wave && currentWave >= milestone.wave) {
            return milestone;
        }
    }
    return null;
}

/**
 * Get the next milestone for display
 * @param {number} currentWave - Current wave
 * @returns {Object|null} Next milestone or null if all completed
 */
export function getNextMilestone(currentWave) {
    for (const milestone of ENDLESS_CONFIG.milestones) {
        if (currentWave < milestone.wave) {
            return milestone;
        }
    }
    return null;
}

/**
 * Get title for current wave
 * @param {number} wave - Current or best wave
 * @returns {string} Title
 */
export function getEndlessTitle(wave) {
    let title = 'Novice';
    for (const milestone of ENDLESS_CONFIG.milestones) {
        if (wave >= milestone.wave) {
            title = milestone.title;
        }
    }
    return title;
}

/**
 * Apply milestone reward to state
 * @param {Object} state - Game state (will be mutated)
 * @param {Object} reward - Milestone reward object
 */
export function applyMilestoneReward(state, reward) {
    if (reward.enhanceStone) state.enhanceStone = (state.enhanceStone || 0) + reward.enhanceStone;
    if (reward.blessedOrb) state.blessedOrb = (state.blessedOrb || 0) + reward.blessedOrb;
    if (reward.celestialShard) state.celestialShard = (state.celestialShard || 0) + reward.celestialShard;
    if (reward.prestigeStones) state.prestigeStones = (state.prestigeStones || 0) + reward.prestigeStones;
}

/**
 * Initialize or reset endless mode state
 * @param {Object} state - Game state (will be mutated)
 */
export function startEndlessRun(state) {
    state.endlessActive = true;
    state.endlessWave = 1;
    state.endlessKillsThisRun = 0;
    state.endlessGoldThisRun = 0;
    state.endlessXpThisRun = 0;
    state.endlessMilestonesClaimedThisRun = [];

    // Store the starting zone to return to after
    state.endlessReturnZone = state.currentZone;

    // Set up first enemy
    const enemy = getEndlessEnemyStats(1);
    state.endlessEnemyHp = enemy.hp;
    state.endlessEnemyMaxHp = enemy.maxHp;
    state.endlessEnemyDmg = enemy.damage;
    state.endlessEnemyName = enemy.name;

    // Also set the regular enemy HP used by combat system
    state.enemyHp = enemy.hp;
    state.enemyMaxHp = enemy.maxHp;
}

/**
 * End endless run and record stats
 * @param {Object} state - Game state (will be mutated)
 */
export function endEndlessRun(state) {
    // Update best wave
    if (!state.endlessBestWave || state.endlessWave > state.endlessBestWave) {
        state.endlessBestWave = state.endlessWave;
    }

    // Record run history (keep last 10 runs)
    if (!state.endlessRunHistory) state.endlessRunHistory = [];
    state.endlessRunHistory.unshift({
        wave: state.endlessWave,
        kills: state.endlessKillsThisRun,
        gold: state.endlessGoldThisRun,
        xp: state.endlessXpThisRun,
        date: Date.now()
    });
    if (state.endlessRunHistory.length > 10) {
        state.endlessRunHistory.pop();
    }

    // Return to previous zone
    state.currentZone = state.endlessReturnZone || 0;

    // Clear endless state
    state.endlessActive = false;
    state.endlessWave = 0;
    state.endlessEnemyHp = 0;
    state.endlessEnemyMaxHp = 0;
    state.endlessEnemyDmg = 0;
    state.endlessEnemyName = '';

    // Reset regular enemy HP so combat system re-initializes it for the zone
    state.enemyHp = NaN; // Forces re-initialization in tick()
    state.enemyMaxHp = NaN;
}

/**
 * Process endless enemy defeat
 * @param {Object} state - Game state (will be mutated)
 * @returns {Object} { gold, xp, drops, milestone }
 */
export function processEndlessKill(state) {
    const wave = state.endlessWave;
    const enemy = getEndlessEnemyStats(wave);

    // Add rewards
    state.gold = (state.gold || 0) + enemy.goldReward;
    state.totalGold = (state.totalGold || 0) + enemy.goldReward;
    state.xp = (state.xp || 0) + enemy.xpReward;
    state.endlessKillsThisRun = (state.endlessKillsThisRun || 0) + 1;
    state.endlessGoldThisRun = (state.endlessGoldThisRun || 0) + enemy.goldReward;
    state.endlessXpThisRun = (state.endlessXpThisRun || 0) + enemy.xpReward;

    // Roll for drops
    const drops = rollEndlessDrops(wave);
    state.enhanceStone = (state.enhanceStone || 0) + drops.enhanceStone;
    state.blessedOrb = (state.blessedOrb || 0) + drops.blessedOrb;
    state.celestialShard = (state.celestialShard || 0) + drops.celestialShard;

    // Check milestone
    const previousWave = wave;
    const nextWave = wave + 1;
    const milestone = checkMilestone(previousWave, nextWave);

    if (milestone && !state.endlessMilestonesClaimedThisRun?.includes(milestone.wave)) {
        applyMilestoneReward(state, milestone.reward);
        state.endlessMilestonesClaimedThisRun = [
            ...(state.endlessMilestonesClaimedThisRun || []),
            milestone.wave
        ];
    }

    // Advance to next wave
    state.endlessWave = nextWave;
    const nextEnemy = getEndlessEnemyStats(nextWave);
    state.endlessEnemyHp = nextEnemy.hp;
    state.endlessEnemyMaxHp = nextEnemy.maxHp;
    state.endlessEnemyDmg = nextEnemy.damage;
    state.endlessEnemyName = nextEnemy.name;

    // Also update the regular enemy HP used by combat system
    state.enemyHp = nextEnemy.hp;
    state.enemyMaxHp = nextEnemy.maxHp;

    return {
        gold: enemy.goldReward,
        xp: enemy.xpReward,
        drops,
        milestone
    };
}
