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
    // PRIMARY STATS (weapon scaling + basic bonus)
    const p = gameState.stats || {};  // Primary stats: str, int, vit, agi
    // SECONDARY STATS (specialized combat stats)
    const sec = gameState.secondaryStats || {};

    // Base damage from STR and INT
    let baseDmg = PLAYER_BASE.DAMAGE + (p.str || 0) * STAT_SCALING.STR_DAMAGE + (p.int || 0) * STAT_SCALING.INT_DAMAGE;
    // Base HP from VIT
    let baseHp = PLAYER_BASE.HP + (p.vit || 0) * STAT_SCALING.VIT_HP;
    // Base speed from AGI
    let speedMult = 1 + (p.agi || 0) * STAT_SCALING.AGI_SPEED;

    // Weapon-specific damage multipliers from primary stats
    let strWeaponMult = 1 + (p.str || 0) * STAT_SCALING.STR_WEAPON_DAMAGE;  // STR weapons (sword, scythe, greataxe)
    let intWeaponMult = 1 + (p.int || 0) * STAT_SCALING.INT_WEAPON_DAMAGE;  // INT weapons (staff)
    let vitWeaponMult = 1 + (p.vit || 0) * STAT_SCALING.VIT_WEAPON_DAMAGE;  // VIT weapons (mace)
    let agiWeaponMult = 1 + (p.agi || 0) * STAT_SCALING.AGI_WEAPON_DAMAGE;  // AGI weapons (dagger, katana)

    // SECONDARY STATS - from secondary stat allocation
    let armor = (sec.armor || 0) * STAT_SCALING.ARMOR;
    let critChance = PLAYER_BASE.CRIT_CHANCE + (sec.critChance || 0) * STAT_SCALING.CRIT_CHANCE;
    let critDamage = PLAYER_BASE.CRIT_DAMAGE + (sec.critDamage || 0) * STAT_SCALING.CRIT_DAMAGE;
    let dodge = (sec.dodge || 0) * STAT_SCALING.DODGE;
    let hpRegen = COMBAT.BASE_HP_REGEN + (sec.hpRegen || 0) * STAT_SCALING.HP_REGEN;
    let damageReduction = (sec.dmgReduction || 0) * STAT_SCALING.DMG_REDUCTION;
    let xpBonus = (sec.xpBonus || 0) * STAT_SCALING.XP_BONUS;
    let goldMult = 1 + (sec.silverFind || 0) * STAT_SCALING.SILVER_FIND;
    let matMult = 1 + (sec.dropRate || 0) * STAT_SCALING.DROP_RATE;

    // Multipliers
    let dmgMult = 1, hpMult = 1;
    let lifesteal = 0, thorns = 0;

    // Unique boss set effects
    let bleed = 0, burn = 0, poison = 0;           // DOT effects (% weapon damage)
    let multiStrike = 0, executeChance = 0, armorPen = 0;  // Attack modifiers
    let damageShield = 0, retaliate = 0, lastStand = 0;    // Defensive effects
    let silverOnHit = 0, itemFind = 0;             // Utility effects
    let rage = 0, vampiric = 0, frostbite = 0;     // Special mechanics
    let killHeal = 0;                              // Set bonus: heal on kill

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
            const scalingStat = p[gearBase.scaling] || 0;
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
        case 'int': weaponDmgMult = intWeaponMult; break;    // Staff: INT scaling
        case 'str': weaponDmgMult = strWeaponMult; break;    // Sword, Scythe, Greataxe: STR scaling
        case 'agi': weaponDmgMult = agiWeaponMult; break;    // Dagger, Katana: AGI scaling
        case 'vit': weaponDmgMult = vitWeaponMult; break;    // Mace: VIT scaling
    }
    const finalDmgMult = dmgMult * weaponDmgMult;

    // ========== OVERFLOW / ASCENDED STAT SYSTEMS ==========
    // When stats exceed their caps, overflow converts to powerful special effects

    // ASCENDED CRIT: Overflow crit becomes instant kill chance
    // Every 9% over 100% = 1% Ascended (1000% crit = 100% Ascended)
    let ascendedCrit = 0;
    let effectiveCritChance = critChance;
    if (critChance > 100) {
        const overflow = critChance - 100;
        ascendedCrit = Math.min(100, overflow / 9);
        effectiveCritChance = 100;
    }

    // PHANTOM: Overflow dodge becomes counter-attack on dodge
    // Every 4% over 80% = 1% Phantom (160% dodge = 100% Phantom)
    let phantom = 0;
    let effectiveDodge = dodge;
    if (dodge > COMBAT.DODGE_CAP) {
        const overflow = dodge - COMBAT.DODGE_CAP;
        phantom = Math.min(100, overflow / 0.8); // 80% overflow = 100% phantom
        effectiveDodge = COMBAT.DODGE_CAP;
    }

    // OVERHEAL: Overflow lifesteal becomes shield generation
    // Every 5% over 100% = 1% of damage dealt becomes shield
    let overheal = 0;
    let effectiveLifesteal = lifesteal;
    if (lifesteal > 100) {
        const overflow = lifesteal - 100;
        overheal = Math.min(50, overflow / 5); // Cap at 50% shield gen
        effectiveLifesteal = 100;
    } else if (lifesteal > COMBAT.LIFESTEAL_SOFT_CAP) {
        // Apply soft cap only if under 100%
        const overCap = lifesteal - COMBAT.LIFESTEAL_SOFT_CAP;
        effectiveLifesteal = COMBAT.LIFESTEAL_SOFT_CAP + (overCap * COMBAT.LIFESTEAL_FALLOFF);
    }

    // FRENZY: Overflow speed becomes triple-attack chance
    // Every 10% over 200% = 1% Frenzy (300% speed = 100% Frenzy)
    let frenzy = 0;
    let effectiveSpeed = speedMult;
    if (speedMult > 2.0) {
        const overflow = (speedMult - 2.0) * 100; // Convert to percentage
        frenzy = Math.min(100, overflow / 1); // 100% overflow = 100% frenzy
        effectiveSpeed = 2.0;
    }

    // IMMUNITY: Overflow damage reduction becomes full damage negation
    // Every 5% over 75% = 1% Immunity (125% DR = 100% Immunity)
    let immunity = 0;
    let effectiveDR = damageReduction;
    if (damageReduction > COMBAT.DAMAGE_REDUCTION_CAP) {
        const overflow = damageReduction - COMBAT.DAMAGE_REDUCTION_CAP;
        immunity = Math.min(100, overflow / 0.5); // 50% overflow = 100% immunity
        effectiveDR = COMBAT.DAMAGE_REDUCTION_CAP;
    }

    // ANNIHILATE: Overflow crit damage becomes 5x damage crit chance
    // Every 20% over 300% = 1% Annihilate (500% crit dmg = 100% Annihilate)
    let annihilate = 0;
    let effectiveCritDamage = critDamage;
    if (critDamage > 300) {
        const overflow = critDamage - 300;
        annihilate = Math.min(100, overflow / 2); // 200% overflow = 100% annihilate
        effectiveCritDamage = 300;
    }

    // VENGEANCE: Overflow thorns becomes full damage counter-attack
    // Every 10% over 100% = 1% Vengeance (200% thorns = 100% Vengeance)
    let vengeance = 0;
    let effectiveThorns = thorns;
    if (thorns > 100) {
        const overflow = thorns - 100;
        vengeance = Math.min(100, overflow / 1); // 100% overflow = 100% vengeance
        effectiveThorns = 100;
    }

    // SECOND WIND: Overflow HP regen becomes emergency heal
    // Every 1% over 5%/sec = 5% Second Wind heal (10%/sec = 25% heal when low)
    let secondWind = 0;
    let effectiveRegen = hpRegen;
    if (hpRegen > COMBAT.HP_REGEN_CAP) {
        const overflow = hpRegen - COMBAT.HP_REGEN_CAP;
        secondWind = Math.min(50, overflow * 5); // Cap at 50% heal
        effectiveRegen = COMBAT.HP_REGEN_CAP;
    }

    return {
        damage: Math.floor(baseDmg * finalDmgMult * enhanceDmgMult),
        maxHp: Math.floor(baseHp * hpMult),
        armor,
        goldMult,
        matMult,
        speedMult: effectiveSpeed,
        speedMultRaw: speedMult,
        critChance: effectiveCritChance,
        critChanceRaw: critChance,
        critDamage: effectiveCritDamage,
        critDamageRaw: critDamage,
        // Overflow effects
        ascendedCrit,    // Instant kill on crit
        phantom,         // Counter-attack on dodge
        overheal,        // Shield from excess healing
        frenzy,          // Triple attack chance
        immunity,        // Full damage negation
        annihilate,      // 5x damage crits
        vengeance,       // Full damage counter
        secondWind,      // Emergency heal when low HP
        // Standard stats
        lifesteal: effectiveLifesteal,
        lifestealRaw: lifesteal,
        thorns: effectiveThorns,
        thornsRaw: thorns,
        dodge: effectiveDodge,
        dodgeRaw: dodge,
        xpBonus,
        hpRegen: effectiveRegen,
        hpRegenRaw: hpRegen,
        damageReduction: effectiveDR,
        damageReductionRaw: damageReduction,
        // Unique boss set effects
        bleed,
        burn,
        poison,
        multiStrike: Math.min(50, multiStrike),
        executeChance: Math.min(25, executeChance),
        armorPen: Math.min(75, armorPen),
        damageShield,
        retaliate: Math.min(50, retaliate),
        lastStand,
        silverOnHit,
        itemFind,
        rage: Math.min(5, rage),
        vampiric,
        frostbite: Math.min(50, frostbite),
        killHeal,
    };
};
