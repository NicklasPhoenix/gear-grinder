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
    // STR - Melee damage scaling (now mirrors INT for balance)
    STR_DAMAGE: 2,
    STR_MELEE_DAMAGE: 0.02,  // +2% damage per STR for melee weapons

    // VIT - Tank/regen build enabler
    VIT_HP: 8,
    VIT_ARMOR: 1,
    VIT_HP_REGEN: 0.15,      // +0.15% max HP regen per second per VIT point
    VIT_DAMAGE_REDUCTION: 0.3, // +0.3% damage reduction per VIT point

    // AGI - Evasion and speed (now with damage scaling for daggers)
    AGI_CRIT_CHANCE: 0.5,
    AGI_SPEED: 0.01,
    AGI_DODGE: 0.3,
    AGI_PRECISION_DAMAGE: 0.02, // +2% damage per AGI for agility weapons

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
    HEAL_ON_KILL: 0.03,       // 3% max HP healed on enemy kill
    DODGE_CAP: 80,            // Maximum dodge chance

    // HP Regeneration (alternative to lifesteal for VIT builds)
    BASE_HP_REGEN: 0.5,       // Base 0.5% max HP regen per second
    HP_REGEN_CAP: 15,         // Cap at 15% max HP per second

    // Damage Reduction (flat % reduction after armor, enables tank builds)
    DAMAGE_REDUCTION_CAP: 75, // Cap at 75% damage reduction

    // Lifesteal soft cap (diminishing returns above threshold)
    LIFESTEAL_SOFT_CAP: 10,   // First 10% is 100% effective
    LIFESTEAL_FALLOFF: 0.5,   // Above soft cap, only 50% as effective
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

    // Pity system - increases success chance after consecutive failures
    PITY_BONUS_PER_FAIL: 3,   // +3% success per consecutive fail
    PITY_MAX_BONUS: 60,       // Cap at +60% bonus (so 20% base can reach 80%)

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
