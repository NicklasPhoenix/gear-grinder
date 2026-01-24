import { TIERS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, BOSS_SETS, PRESTIGE_BOSS_SETS } from '../data/items';
import { SKILLS, PRESTIGE_SKILLS } from '../data/skills';
import { getEnhanceBonus } from '../utils/formulas';
import { PLAYER_BASE, STAT_SCALING, LEVEL_UP, COMBAT } from '../data/constants';

/**
 * Calculates all derived combat stats for the player based on current game state.
 * Combines base stats, gear bonuses, skills, set bonuses, and prestige bonuses.
 *
 * @param {Object} gameState - The current game state
 * @param {Object} gameState.stats - Base character stats (str, int, vit, agi, lck)
 * @param {Object} gameState.gear - Equipped gear by slot
 * @param {number} gameState.level - Current player level
 * @param {number[]} gameState.unlockedSkills - Array of unlocked skill IDs
 * @param {Object} gameState.prestigeSkills - Prestige skill levels by ID
 * @returns {Object} Calculated stats object with damage, maxHp, armor, critChance, etc.
 */
export const calculatePlayerStats = (gameState) => {
    const s = gameState.stats;
    // Base stats from character stats
    let baseDmg = PLAYER_BASE.DAMAGE + s.str * STAT_SCALING.STR_DAMAGE;
    let baseHp = PLAYER_BASE.HP + s.vit * STAT_SCALING.VIT_HP;
    let armor = s.vit * STAT_SCALING.VIT_ARMOR;
    // Reduced gold/mat multipliers - resources should feel scarce
    let dmgMult = 1, hpMult = 1;
    let goldMult = 1 + s.lck * STAT_SCALING.LCK_GOLD;
    let speedMult = 1 + s.agi * STAT_SCALING.AGI_SPEED;
    let matMult = 1 + s.lck * STAT_SCALING.LCK_MAT;
    let lifesteal = 0, thorns = 0;
    let critChance = PLAYER_BASE.CRIT_CHANCE + s.agi * STAT_SCALING.AGI_CRIT_CHANCE;
    let critDamage = PLAYER_BASE.CRIT_DAMAGE + s.lck * STAT_SCALING.LCK_CRIT_DAMAGE;
    let dodge = s.agi * STAT_SCALING.AGI_DODGE;
    let xpBonus = s.int * STAT_SCALING.INT_XP_BONUS;

    // Unique boss set effects
    let bleed = 0, burn = 0, poison = 0;           // DOT effects (% weapon damage)
    let multiStrike = 0, executeChance = 0, armorPen = 0;  // Attack modifiers
    let damageShield = 0, retaliate = 0, lastStand = 0;    // Defensive effects
    let silverOnHit = 0, itemFind = 0;             // Utility effects
    let rage = 0, vampiric = 0, frostbite = 0;     // Special mechanics
    let killHeal = 0;                              // Set bonus: heal on kill

    // Weapon-specific damage multipliers (all weapon types now have scaling)
    let magicDmgMult = 1 + s.int * STAT_SCALING.INT_MAGIC_DAMAGE;      // INT weapons (staff)
    let meleeDmgMult = 1 + s.str * STAT_SCALING.STR_MELEE_DAMAGE;      // STR weapons (sword, scythe, greataxe)
    let precisionDmgMult = 1 + s.agi * STAT_SCALING.AGI_PRECISION_DAMAGE; // AGI weapons (dagger, katana)
    let tankDmgMult = 1 + s.vit * STAT_SCALING.VIT_TANK_DAMAGE;        // VIT weapons (mace)

    // NEW: Defensive stats for tank/regen builds
    let hpRegen = COMBAT.BASE_HP_REGEN + s.vit * STAT_SCALING.VIT_HP_REGEN;  // % max HP per second
    let damageReduction = s.vit * STAT_SCALING.VIT_DAMAGE_REDUCTION;          // Flat % damage reduction

    // Gear contributions
    let enhanceDmgMult = 1; // Cumulative enhancement damage multiplier
    let weaponScaling = null; // Track weapon scaling stat (int, str, agi, vit)

    Object.entries(gameState.gear).forEach(([slot, gear]) => {
        if (gear) {
            const tierMult = TIERS[gear.tier].statMult;
            const enhanceBonus = getEnhanceBonus(gear.plus || 0, gear.tier);

            // For weapons, use the weapon type stats and apply bonuses
            let gearBase = GEAR_BASES[slot];
            if (slot === 'weapon' && gear.weaponType) {
                const weaponDef = WEAPON_TYPES.find(w => w.id === gear.weaponType) || PRESTIGE_WEAPONS.find(w => w.id === gear.weaponType);
                if (weaponDef) {
                    gearBase = { ...gearBase, ...weaponDef, baseArmor: 0 };
                    // Apply weapon type bonuses
                    speedMult += weaponDef.speedBonus;
                    critChance += weaponDef.critBonus;
                    // Track weapon scaling stat for damage multiplier
                    weaponScaling = weaponDef.scaling;
                }
            }

            // Boss items get a stat bonus multiplier (1.5x to 2.0x base stats)
            const bossStatBonus = gear.isBossItem && gear.statBonus ? gear.statBonus : 1;

            // Add gear stats (scaled by tier) with enhanced enhancement bonuses
            baseDmg += Math.floor((gearBase.baseDmg * tierMult * bossStatBonus) + enhanceBonus.dmgBonus);
            baseHp += Math.floor((gearBase.baseHp * tierMult * bossStatBonus) + enhanceBonus.hpBonus);
            armor += Math.floor((gearBase.baseArmor || 0) * tierMult * bossStatBonus) + enhanceBonus.armorBonus;

            // Apply enhancement damage multiplier from high-level enhancements
            enhanceDmgMult *= enhanceBonus.dmgMult;

            // Stat scaling bonus: gear is stronger if you have the right stat
            const scalingStat = s[gearBase.scaling] || 0;
            const scalingBonus = 1 + scalingStat * STAT_SCALING.GEAR_STAT_SCALING;
            baseDmg += Math.floor(gearBase.baseDmg * tierMult * bossStatBonus * (scalingBonus - 1));
            baseHp += Math.floor(gearBase.baseHp * tierMult * bossStatBonus * (scalingBonus - 1) * STAT_SCALING.GEAR_HP_SCALING);

            // Special effects from gear
            if (gear.effects) {
                gear.effects.forEach(effect => {
                    const effectValue = effect.value * (1 + enhanceBonus.effectBonus / 100);
                    switch (effect.id) {
                        // Standard effects
                        case 'lifesteal': lifesteal += effectValue; break;
                        case 'thorns': thorns += effectValue; break;
                        case 'critChance': critChance += effectValue; break;
                        case 'critDamage': critDamage += effectValue; break;
                        case 'bonusDmg': baseDmg += effectValue; break;
                        case 'bonusHp': baseHp += effectValue; break;
                        case 'silverFind': goldMult += effectValue / 100; break;
                        case 'xpBonus': xpBonus += effectValue; break;
                        case 'dodge': dodge += effectValue; break;
                        case 'hpRegen': hpRegen += effectValue; break;
                        case 'damageReduction': damageReduction += effectValue; break;
                        // Unique boss set effects - DOTs
                        case 'bleed': bleed += effectValue; break;
                        case 'burn': burn += effectValue; break;
                        case 'poison': poison += effectValue; break;
                        // Unique boss set effects - Attack modifiers
                        case 'multiStrike': multiStrike += effectValue; break;
                        case 'executeChance': executeChance += effectValue; break;
                        case 'armorPen': armorPen += effectValue; break;
                        // Unique boss set effects - Defensive
                        case 'damageShield': damageShield += effectValue; break;
                        case 'retaliate': retaliate += effectValue; break;
                        case 'lastStand': lastStand += effectValue; break;
                        // Unique boss set effects - Utility
                        case 'silverOnHit': silverOnHit += effectValue; break;
                        case 'itemFind': itemFind += effectValue; break;
                        // Unique boss set effects - Special mechanics
                        case 'rage': rage += effectValue; break;
                        case 'vampiric': vampiric += effectValue; break;
                        case 'frostbite': frostbite += effectValue; break;
                    }
                });
            }
        }
    });

    // Level bonus
    baseDmg += (gameState.level - 1) * LEVEL_UP.DAMAGE_PER_LEVEL;
    baseHp += (gameState.level - 1) * LEVEL_UP.HP_PER_LEVEL;

    // Skills
    gameState.unlockedSkills.forEach(skillId => {
        const skill = SKILLS[skillId];
        if (skill.effect.dmgMult) dmgMult += skill.effect.dmgMult;
        if (skill.effect.hpMult) hpMult += skill.effect.hpMult;
        if (skill.effect.goldMult) goldMult += skill.effect.goldMult;
        if (skill.effect.speedMult) speedMult += skill.effect.speedMult;
        if (skill.effect.matMult) matMult += skill.effect.matMult;
        if (skill.effect.lifesteal) lifesteal += skill.effect.lifesteal;
        if (skill.effect.critChance) critChance += skill.effect.critChance;
        if (skill.effect.thorns) thorns += skill.effect.thorns;
        if (skill.effect.hpRegen) hpRegen += skill.effect.hpRegen;
        if (skill.effect.damageReduction) damageReduction += skill.effect.damageReduction;
    });

    // Calculate set bonuses
    const setBonuses = {};
    Object.entries(gameState.gear).forEach(([slot, gear]) => {
        if (gear && gear.bossSet) {
            setBonuses[gear.bossSet] = (setBonuses[gear.bossSet] || 0) + 1;
        }
    });

    Object.entries(setBonuses).forEach(([setName, count]) => {
        const bossSet = BOSS_SETS[setName] || PRESTIGE_BOSS_SETS[setName];
        if (bossSet) {
            bossSet.setBonuses.forEach(bonus => {
                if (count >= bonus.pieces) {
                    // Standard bonuses
                    if (bonus.effect.dmgMult) dmgMult += bonus.effect.dmgMult;
                    if (bonus.effect.hpMult) hpMult += bonus.effect.hpMult;
                    if (bonus.effect.speedMult) speedMult += bonus.effect.speedMult;
                    if (bonus.effect.goldMult) goldMult += bonus.effect.goldMult;
                    if (bonus.effect.matMult) matMult += bonus.effect.matMult;
                    if (bonus.effect.lifesteal) lifesteal += bonus.effect.lifesteal;
                    if (bonus.effect.critChance) critChance += bonus.effect.critChance;
                    if (bonus.effect.critDamage) critDamage += bonus.effect.critDamage;
                    if (bonus.effect.thorns) thorns += bonus.effect.thorns;
                    if (bonus.effect.dodge) dodge += bonus.effect.dodge;
                    if (bonus.effect.xpBonus) xpBonus += bonus.effect.xpBonus;
                    if (bonus.effect.hpRegen) hpRegen += bonus.effect.hpRegen;
                    if (bonus.effect.damageReduction) damageReduction += bonus.effect.damageReduction;
                    // Unique boss set effects - DOTs
                    if (bonus.effect.bleed) bleed += bonus.effect.bleed;
                    if (bonus.effect.burn) burn += bonus.effect.burn;
                    if (bonus.effect.poison) poison += bonus.effect.poison;
                    // Unique boss set effects - Attack modifiers
                    if (bonus.effect.multiStrike) multiStrike += bonus.effect.multiStrike;
                    if (bonus.effect.executeChance) executeChance += bonus.effect.executeChance;
                    if (bonus.effect.armorPen) armorPen += bonus.effect.armorPen;
                    // Unique boss set effects - Defensive
                    if (bonus.effect.damageShield) damageShield += bonus.effect.damageShield;
                    if (bonus.effect.retaliate) retaliate += bonus.effect.retaliate;
                    if (bonus.effect.lastStand) lastStand += bonus.effect.lastStand;
                    // Unique boss set effects - Utility
                    if (bonus.effect.silverOnHit) silverOnHit += bonus.effect.silverOnHit;
                    if (bonus.effect.itemFind) itemFind += bonus.effect.itemFind;
                    // Unique boss set effects - Special mechanics
                    if (bonus.effect.rage) rage += bonus.effect.rage;
                    if (bonus.effect.vampiric) vampiric += bonus.effect.vampiric;
                    if (bonus.effect.frostbite) frostbite += bonus.effect.frostbite;
                    if (bonus.effect.killHeal) killHeal += bonus.effect.killHeal;
                }
            });
        }
    });

    // Prestige skills - permanent bonuses that persist through resets
    Object.entries(gameState.prestigeSkills).forEach(([skillId, level]) => {
        if (level > 0) {
            const skill = PRESTIGE_SKILLS[parseInt(skillId)];
            if (skill && skill.effect) {
                if (skill.effect.dmgMult) dmgMult += skill.effect.dmgMult * level;
                if (skill.effect.hpMult) hpMult += skill.effect.hpMult * level;
                if (skill.effect.goldMult) goldMult += skill.effect.goldMult * level;
                if (skill.effect.speedMult) speedMult += skill.effect.speedMult * level;
                if (skill.effect.critChance) critChance += skill.effect.critChance * level;
                if (skill.effect.critDamage) critDamage += skill.effect.critDamage * level;
                if (skill.effect.armor) armor += skill.effect.armor * level;
                if (skill.effect.lifesteal) lifesteal += skill.effect.lifesteal * level;
                if (skill.effect.xpBonus) xpBonus += skill.effect.xpBonus * level;
                if (skill.effect.hpRegen) hpRegen += skill.effect.hpRegen * level;
                if (skill.effect.damageReduction) damageReduction += skill.effect.damageReduction * level;
            }
        }
    });

    // Apply weapon-specific damage multiplier based on scaling stat
    let weaponDmgMult = 1;
    switch (weaponScaling) {
        case 'int': weaponDmgMult = magicDmgMult; break;      // Staff: INT scaling
        case 'str': weaponDmgMult = meleeDmgMult; break;      // Sword, Scythe, Greataxe: STR scaling
        case 'agi': weaponDmgMult = precisionDmgMult; break;  // Dagger, Katana: AGI scaling
        case 'vit': weaponDmgMult = tankDmgMult; break;       // Mace: VIT scaling
    }
    const finalDmgMult = dmgMult * weaponDmgMult;

    // Apply lifesteal soft cap with diminishing returns
    let effectiveLifesteal = lifesteal;
    if (lifesteal > COMBAT.LIFESTEAL_SOFT_CAP) {
        const overCap = lifesteal - COMBAT.LIFESTEAL_SOFT_CAP;
        effectiveLifesteal = COMBAT.LIFESTEAL_SOFT_CAP + (overCap * COMBAT.LIFESTEAL_FALLOFF);
    }

    return {
        damage: Math.floor(baseDmg * finalDmgMult * enhanceDmgMult),
        maxHp: Math.floor(baseHp * hpMult),
        armor,
        goldMult,
        matMult,
        speedMult,
        critChance,
        critDamage,
        lifesteal: effectiveLifesteal,
        lifestealRaw: lifesteal, // For display purposes (show actual vs effective)
        thorns,
        dodge: Math.min(COMBAT.DODGE_CAP, dodge),
        xpBonus,
        hpRegen: Math.min(COMBAT.HP_REGEN_CAP, hpRegen),
        damageReduction: Math.min(COMBAT.DAMAGE_REDUCTION_CAP, damageReduction),
        // Unique boss set effects
        bleed,
        burn,
        poison,
        multiStrike: Math.min(50, multiStrike),  // Cap at 50%
        executeChance: Math.min(25, executeChance), // Cap at 25%
        armorPen: Math.min(75, armorPen),  // Cap at 75%
        damageShield,
        retaliate: Math.min(50, retaliate), // Cap at 50%
        lastStand,
        silverOnHit,
        itemFind,
        rage: Math.min(5, rage),  // Cap at 5% per stack (50% max with 10 stacks)
        vampiric,
        frostbite: Math.min(50, frostbite),  // Cap at 50% slow
        killHeal,
    };
};
