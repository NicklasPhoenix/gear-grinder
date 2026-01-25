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
    // PRIMARY STATS - Weapon damage + one basic bonus
    // STR - Base damage + STR weapon scaling
    STR_DAMAGE: 1,           // +1 flat damage per point
    STR_WEAPON_DAMAGE: 0.03, // +3% damage per STR for STR weapons (sword, scythe, greataxe)

    // INT - Base damage + INT weapon scaling
    INT_DAMAGE: 1,           // +1 flat damage per point
    INT_WEAPON_DAMAGE: 0.03, // +3% damage per INT for INT weapons (staff)

    // VIT - HP + VIT weapon scaling
    VIT_HP: 10,              // +10 HP per point
    VIT_WEAPON_DAMAGE: 0.02, // +2% damage per VIT for VIT weapons (mace)

    // AGI - Speed + AGI weapon scaling
    AGI_SPEED: 0.01,         // +1% attack speed per point
    AGI_WEAPON_DAMAGE: 0.02, // +2% damage per AGI for AGI weapons (dagger, katana)

    // SECONDARY STATS - Must be skilled separately
    CRIT_CHANCE: 1,          // +1% crit chance per point
    CRIT_DAMAGE: 5,          // +5% crit damage per point
    DODGE: 1,                // +1% dodge per point
    ARMOR: 3,                // +3 armor per point
    HP_REGEN: 0.2,           // +0.2% HP regen/sec per point
    DMG_REDUCTION: 0.5,      // +0.5% damage reduction per point
    XP_BONUS: 2,             // +2% XP per point
    SILVER_FIND: 0.01,       // +1% silver find per point
    DROP_RATE: 0.01,         // +1% drop rate per point

    // Gear scaling
    GEAR_STAT_SCALING: 0.02, // +2% per matching stat point
    GEAR_HP_SCALING: 0.5,    // HP scales at half rate
};

// === LEVEL UP ===
export const LEVEL_UP = {
    BASE_XP: 100,      // XP needed for level 1→2 (was 50)
    XP_SCALING: 1.25,  // Multiplier per level (was 1.3, slightly reduced for smoother curve)
    STAT_POINTS_PER_LEVEL: 3,
    DAMAGE_PER_LEVEL: 2,
    HP_PER_LEVEL: 8,
};

// === COMBAT ===
export const COMBAT = {
    ARMOR_CONSTANT: 250,      // Armor / (Armor + CONSTANT) = damage reduction
    ATTACKS_PER_SECOND: 1,    // Base player attack speed (1 attack per second)
    TICK_RATE: 20,            // Combat ticks per second (50ms per tick)
    BASE_ENEMY_ATTACK_SPEED: 0.5, // Base enemy attacks per second (halved for testing)
    ENEMY_SPEED_SCALING: 0.015,   // Enemy attack speed increase per zone
    MAX_ENEMY_ATTACK_SPEED: 3.0,  // Cap enemy attack speed
    HEAL_ON_KILL: 0.03,       // 3% max HP healed on enemy kill
    DODGE_CAP: 80,            // Maximum dodge chance

    // HP Regeneration (alternative to lifesteal for VIT builds)
    BASE_HP_REGEN: 0.5,       // Base 0.5% max HP regen per second
    HP_REGEN_CAP: 25,         // Cap at 25% max HP per second

    // Damage Reduction (flat % reduction after armor, enables tank builds)
    DAMAGE_REDUCTION_CAP: 75, // Cap at 75% damage reduction

    // Lifesteal soft cap (diminishing returns above threshold)
    LIFESTEAL_SOFT_CAP: 15,   // First 15% is 100% effective
    LIFESTEAL_FALLOFF: 0.7,   // Above soft cap, 70% as effective
};

// === DEATH PENALTIES ===
export const DEATH_PENALTY = {
    GOLD_LOSS: 0.25,    // Lose 25% silver on death
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

// === INVENTORY ===
export const INVENTORY = {
    BASE_SLOTS: 50,           // Starting inventory slots
    MAX_SLOTS: 200,           // Maximum purchasable slots
    SLOTS_PER_UPGRADE: 10,    // Slots gained per upgrade
    BASE_UPGRADE_COST: 500,   // Silver cost for first upgrade
    COST_MULTIPLIER: 1.5,     // Cost multiplier per upgrade
};

// === DEFAULT STATE VALUES ===
export const DEFAULTS = {
    // Primary stats - weapon scaling + basic bonus
    BASE_PRIMARY_STATS: { str: 5, int: 5, vit: 5, agi: 5 },
    // Secondary stats - specialized combat stats (start at 0)
    BASE_SECONDARY_STATS: {
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
    // Legacy support
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
