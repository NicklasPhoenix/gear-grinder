// Game configuration constants
// Extracted magic numbers for easier balancing and maintenance

// === PLAYER BASE STATS ===
export const PLAYER_BASE = {
    DAMAGE: 5,
    HP: 80,
    CRIT_CHANCE: 3,
    CRIT_DAMAGE: 150,
    DEFAULT_MAX_HP: 100,
    DEFAULT_DAMAGE: 10,
    DEFAULT_CRIT_CHANCE: 5,
};

// === STAT SCALING (per point) ===
export const STAT_SCALING = {
    // STR
    STR_DAMAGE: 2,

    // VIT
    VIT_HP: 8,
    VIT_ARMOR: 1,

    // AGI
    AGI_CRIT_CHANCE: 0.5,
    AGI_SPEED: 0.01,
    AGI_DODGE: 0.3,

    // LCK
    LCK_GOLD: 0.005,
    LCK_MAT: 0.005,
    LCK_CRIT_DAMAGE: 2,

    // INT
    INT_XP_BONUS: 1,
    INT_MAGIC_DAMAGE: 0.03,

    // Gear scaling
    GEAR_STAT_SCALING: 0.02, // +2% per matching stat point
    GEAR_HP_SCALING: 0.5,    // HP scales at half rate
};

// === LEVEL UP ===
export const LEVEL_UP = {
    BASE_XP: 50,
    XP_SCALING: 1.3,
    STAT_POINTS_PER_LEVEL: 3,
    DAMAGE_PER_LEVEL: 2,
    HP_PER_LEVEL: 8,
};

// === COMBAT ===
export const COMBAT = {
    ARMOR_CONSTANT: 250,      // Armor / (Armor + CONSTANT) = damage reduction
    ATTACKS_PER_SECOND: 6,    // Base attack speed
    LIFESTEAL_MAX_HEAL: 1000, // Cap on lifesteal per hit
    HEAL_ON_KILL: 0.03,       // 3% max HP healed on enemy kill
    DODGE_CAP: 80,            // Maximum dodge chance
};

// === DEATH PENALTIES ===
export const DEATH_PENALTY = {
    GOLD_LOSS: 0.25,    // Lose 25% gold on death
    STONE_LOSS: 0.10,   // Lose 10% enhance stones on death
};

// === BOSS DROPS ===
export const BOSS_DROPS = {
    GEAR_DROP_CHANCE: 0.24,     // 24% chance for boss gear
    BONUS_STONE_CHANCE: 0.30,   // 30% chance for bonus boss stone
};

// === ENHANCEMENT SYSTEM ===
export const ENHANCE = {
    // Cost scaling
    BASE_GOLD_COST: 100,
    GOLD_SCALING: 1.4,
    BASE_STONE_COST: 2,
    STONE_SCALING: 1.25,
    ORB_SCALING: 1.3,
    SHARD_SCALING: 1.35,

    // Success rates
    BASE_SUCCESS: 100,
    MIN_SUCCESS_10_20: 50,
    MIN_SUCCESS_20_PLUS: 20,
    SUCCESS_DECREASE_PER_LEVEL: 5,
    SUCCESS_DECREASE_AFTER_20: 3,

    // Thresholds
    ORB_THRESHOLD: 10,      // Need blessed orbs at +10
    SHARD_THRESHOLD: 20,    // Need celestial shards at +20
    DAMAGE_MULT_THRESHOLD: 15, // Damage multiplier starts at +15

    // Stat bonuses per plus
    BASE_DMG_PER_PLUS: 0.5,
    DMG_TIER_SCALING: 0.3,
    BASE_HP_PER_PLUS: 2,
    HP_TIER_SCALING: 1,
    BASE_ARMOR_PER_PLUS: 0.2,
    ARMOR_TIER_SCALING: 0.1,

    // Exponential bonus (for +10 and above)
    EXP_BONUS_BASE: 1.04,
    EXP_BONUS_THRESHOLD: 10,

    // Effect bonus (every 4 levels)
    EFFECT_BONUS_INTERVAL: 4,
    EFFECT_BONUS_VALUE: 3,

    // Damage multiplier (above +14)
    DMG_MULT_PER_LEVEL: 0.02,
};

// === SAVE SYSTEM ===
export const SAVE = {
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    SAVE_VERSION: 1,
};

// === DEFAULT STATE VALUES ===
export const DEFAULTS = {
    BASE_STATS: { str: 5, int: 5, vit: 5, agi: 5, lck: 5 },
    PLAYER_HP: 100,
    PLAYER_MAX_HP: 100,
    ENEMY_HP: 20,
    ENEMY_MAX_HP: 20,
    GOLD: 0,
    XP: 0,
    LEVEL: 1,
    KILLS: 0,
    CURRENT_ZONE: 0,
    STAT_POINTS: 0,
};

// === UI/RENDERING ===
export const UI = {
    COMBAT_LOG_MAX_ENTRIES: 4,
    POOL_MAX_SIZE: 100,  // Graphics pool size for particles
};
