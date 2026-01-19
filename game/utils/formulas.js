import { ENHANCE } from '../data/constants';

/**
 * Calculates the resource cost to enhance an item from its current plus level.
 * Costs scale exponentially with enhancement level.
 *
 * @param {number} currentPlus - The item's current enhancement level (0-30+)
 * @returns {Object} Cost object with gold, enhanceStone, blessedOrb, celestialShard
 */
export const getEnhanceCost = (currentPlus) => ({
    gold: Math.floor(ENHANCE.BASE_GOLD_COST * Math.pow(ENHANCE.GOLD_SCALING, currentPlus)),
    enhanceStone: Math.floor(ENHANCE.BASE_STONE_COST * Math.pow(ENHANCE.STONE_SCALING, currentPlus)),
    blessedOrb: currentPlus >= ENHANCE.ORB_THRESHOLD ? Math.floor(Math.pow(ENHANCE.ORB_SCALING, currentPlus - 9)) : 0,
    celestialShard: currentPlus >= ENHANCE.SHARD_THRESHOLD ? Math.floor(Math.pow(ENHANCE.SHARD_SCALING, currentPlus - 19)) : 0,
});

/**
 * Calculates the success rate for enhancing an item at its current plus level.
 * - +0 to +9: 100% success
 * - +10 to +19: Decreases from 100% to 50%
 * - +20 to +29: Decreases from 50% to 20%
 * - +30+: Fixed 20% success
 *
 * @param {number} currentPlus - The item's current enhancement level
 * @returns {number} Success rate as a percentage (0-100)
 */
export const getEnhanceSuccess = (currentPlus) => {
    if (currentPlus < ENHANCE.ORB_THRESHOLD) return ENHANCE.BASE_SUCCESS;
    if (currentPlus < ENHANCE.SHARD_THRESHOLD) {
        return Math.max(ENHANCE.MIN_SUCCESS_10_20, ENHANCE.BASE_SUCCESS - (currentPlus - 9) * ENHANCE.SUCCESS_DECREASE_PER_LEVEL);
    }
    if (currentPlus < 30) {
        return Math.max(ENHANCE.MIN_SUCCESS_20_PLUS, ENHANCE.MIN_SUCCESS_10_20 - (currentPlus - 19) * ENHANCE.SUCCESS_DECREASE_AFTER_20);
    }
    return ENHANCE.MIN_SUCCESS_20_PLUS;
};

/**
 * Calculates stat bonuses granted by an item's enhancement level.
 * Bonuses scale with both enhancement level and item tier.
 * High enhancement (+10+) provides exponential scaling.
 * Very high enhancement (+15+) provides a damage multiplier.
 *
 * @param {number} plus - The item's enhancement level (0-30+)
 * @param {number} [tier=0] - The item's tier (0-5), affects base bonus scaling
 * @returns {Object} Bonus object with dmgBonus, hpBonus, armorBonus, effectBonus, dmgMult
 */
export const getEnhanceBonus = (plus, tier = 0) => {
    const basePerPlus = {
        dmg: ENHANCE.BASE_DMG_PER_PLUS + tier * ENHANCE.DMG_TIER_SCALING,
        hp: ENHANCE.BASE_HP_PER_PLUS + tier * ENHANCE.HP_TIER_SCALING,
        armor: ENHANCE.BASE_ARMOR_PER_PLUS + tier * ENHANCE.ARMOR_TIER_SCALING,
    };

    // Exponential scaling at higher levels rewards high enhancement
    const expBonus = plus >= ENHANCE.EXP_BONUS_THRESHOLD ? Math.pow(ENHANCE.EXP_BONUS_BASE, plus - 9) : 1;

    return {
        dmgBonus: Math.floor(plus * basePerPlus.dmg * expBonus),
        hpBonus: Math.floor(plus * basePerPlus.hp * expBonus),
        armorBonus: Math.floor(plus * basePerPlus.armor * expBonus),
        effectBonus: Math.floor(plus / ENHANCE.EFFECT_BONUS_INTERVAL) * ENHANCE.EFFECT_BONUS_VALUE,
        dmgMult: plus >= ENHANCE.DAMAGE_MULT_THRESHOLD ? 1 + (plus - 14) * ENHANCE.DMG_MULT_PER_LEVEL : 1,
    };
};
