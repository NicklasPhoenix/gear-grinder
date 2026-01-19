export const getEnhanceCost = (currentPlus) => ({
    gold: Math.floor(100 * Math.pow(1.4, currentPlus)),
    enhanceStone: Math.floor(2 * Math.pow(1.25, currentPlus)),
    blessedOrb: currentPlus >= 10 ? Math.floor(Math.pow(1.3, currentPlus - 9)) : 0,
    celestialShard: currentPlus >= 20 ? Math.floor(Math.pow(1.35, currentPlus - 19)) : 0,
});

export const getEnhanceSuccess = (currentPlus) => {
    if (currentPlus < 10) return 100;
    if (currentPlus < 20) return Math.max(50, 100 - (currentPlus - 9) * 5);
    if (currentPlus < 30) return Math.max(20, 50 - (currentPlus - 19) * 3);
    return 20;
};

export const getEnhanceBonus = (plus, tier = 0) => {
    // Enhancement bonuses balanced so +10 ≈ +0 next tier (slightly less)
    // Each tier is ~1.5x stronger, so +10 should add ~40% power
    // This means each + adds ~4% relative power
    const basePerPlus = {
        dmg: 0.5 + tier * 0.3,   // Small dmg per +, scales with tier
        hp: 2 + tier * 1,        // Small HP per +, scales with tier
        armor: 0.2 + tier * 0.1, // Small armor per +
    };

    // Slight exponential scaling at higher levels for rewarding high enhancement
    const expBonus = plus >= 10 ? Math.pow(1.04, plus - 9) : 1;

    return {
        dmgBonus: Math.floor(plus * basePerPlus.dmg * expBonus),
        hpBonus: Math.floor(plus * basePerPlus.hp * expBonus),
        armorBonus: Math.floor(plus * basePerPlus.armor * expBonus),
        effectBonus: Math.floor(plus / 4) * 3, // Effect boost every 4 levels
        // Small damage multiplier at very high enhancement
        dmgMult: plus >= 15 ? 1 + (plus - 14) * 0.02 : 1, // +2% per level above +14
    };
};
