import { ENHANCE } from '../data/constants';

export const getEnhanceCost = (currentPlus) => ({
    gold: Math.floor(ENHANCE.BASE_GOLD_COST * Math.pow(ENHANCE.GOLD_SCALING, currentPlus)),
    enhanceStone: Math.floor(ENHANCE.BASE_STONE_COST * Math.pow(ENHANCE.STONE_SCALING, currentPlus)),
    blessedOrb: currentPlus >= ENHANCE.ORB_THRESHOLD ? Math.floor(Math.pow(ENHANCE.ORB_SCALING, currentPlus - 9)) : 0,
    celestialShard: currentPlus >= ENHANCE.SHARD_THRESHOLD ? Math.floor(Math.pow(ENHANCE.SHARD_SCALING, currentPlus - 19)) : 0,
});

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

export const getEnhanceBonus = (plus, tier = 0) => {
    // Enhancement bonuses balanced so +10 ≈ +0 next tier (slightly less)
    // Each tier is ~1.5x stronger, so +10 should add ~40% power
    const basePerPlus = {
        dmg: ENHANCE.BASE_DMG_PER_PLUS + tier * ENHANCE.DMG_TIER_SCALING,
        hp: ENHANCE.BASE_HP_PER_PLUS + tier * ENHANCE.HP_TIER_SCALING,
        armor: ENHANCE.BASE_ARMOR_PER_PLUS + tier * ENHANCE.ARMOR_TIER_SCALING,
    };

    // Slight exponential scaling at higher levels for rewarding high enhancement
    const expBonus = plus >= ENHANCE.EXP_BONUS_THRESHOLD ? Math.pow(ENHANCE.EXP_BONUS_BASE, plus - 9) : 1;

    return {
        dmgBonus: Math.floor(plus * basePerPlus.dmg * expBonus),
        hpBonus: Math.floor(plus * basePerPlus.hp * expBonus),
        armorBonus: Math.floor(plus * basePerPlus.armor * expBonus),
        effectBonus: Math.floor(plus / ENHANCE.EFFECT_BONUS_INTERVAL) * ENHANCE.EFFECT_BONUS_VALUE,
        // Small damage multiplier at very high enhancement
        dmgMult: plus >= ENHANCE.DAMAGE_MULT_THRESHOLD ? 1 + (plus - 14) * ENHANCE.DMG_MULT_PER_LEVEL : 1,
    };
};
