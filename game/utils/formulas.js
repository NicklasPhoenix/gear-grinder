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
    // Enhancement bonuses now scale with gear tier for meaningful progression
    const tierMult = 1 + tier * 0.3; // Higher tier = bigger enhancement bonuses
    const basePerPlus = {
        dmg: 3 + tier * 2,      // Base 3-15 dmg per + depending on tier
        hp: 8 + tier * 4,       // Base 8-32 HP per + depending on tier
        armor: 1 + tier * 0.5,  // Base 1-4 armor per + depending on tier
    };

    // Exponential scaling at higher enhancement levels
    const expBonus = plus >= 10 ? Math.pow(1.08, plus - 9) : 1;

    return {
        dmgBonus: Math.floor(plus * basePerPlus.dmg * expBonus),
        hpBonus: Math.floor(plus * basePerPlus.hp * expBonus),
        armorBonus: Math.floor(plus * basePerPlus.armor * expBonus),
        effectBonus: Math.floor(plus / 3) * 5, // More frequent, bigger effect boost
        // Damage multiplier at very high enhancement
        dmgMult: plus >= 15 ? 1 + (plus - 14) * 0.03 : 1, // +3% per level above +14
    };
};
