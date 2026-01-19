import { TIERS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, BOSS_SETS, PRESTIGE_BOSS_SETS } from '../data/items';
import { SKILLS, PRESTIGE_SKILLS } from '../data/skills';
import { getEnhanceBonus } from '../utils/formulas';
import { PLAYER_BASE, STAT_SCALING, LEVEL_UP, COMBAT } from '../data/constants';

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
    let magicDmgMult = 1 + s.int * STAT_SCALING.INT_MAGIC_DAMAGE;

    // Gear contributions
    let enhanceDmgMult = 1; // Cumulative enhancement damage multiplier
    let hasIntWeapon = false; // Track if using INT-scaling weapon

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
                    // Track INT weapons for magic damage multiplier
                    if (weaponDef.scaling === 'int') hasIntWeapon = true;
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
                        case 'lifesteal': lifesteal += effectValue; break;
                        case 'thorns': thorns += effectValue; break;
                        case 'critChance': critChance += effectValue; break;
                        case 'critDamage': critDamage += effectValue; break;
                        case 'bonusDmg': baseDmg += effectValue; break;
                        case 'bonusHp': baseHp += effectValue; break;
                        case 'goldFind': goldMult += effectValue / 100; break;
                        case 'xpBonus': xpBonus += effectValue; break;
                        case 'dodge': dodge += effectValue; break;
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
                    if (bonus.effect.dmgMult) dmgMult += bonus.effect.dmgMult;
                    if (bonus.effect.hpMult) hpMult += bonus.effect.hpMult;
                    if (bonus.effect.speedMult) speedMult += bonus.effect.speedMult;
                    if (bonus.effect.goldMult) goldMult += bonus.effect.goldMult;
                    if (bonus.effect.lifesteal) lifesteal += bonus.effect.lifesteal;
                    if (bonus.effect.critChance) critChance += bonus.effect.critChance;
                    if (bonus.effect.critDamage) critDamage += bonus.effect.critDamage;
                    if (bonus.effect.thorns) thorns += bonus.effect.thorns;
                    if (bonus.effect.dodge) dodge += bonus.effect.dodge;
                    if (bonus.effect.xpBonus) xpBonus += bonus.effect.xpBonus;
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
            }
        }
    });

    // Apply magic damage multiplier for INT weapons (staffs)
    const finalDmgMult = hasIntWeapon ? dmgMult * magicDmgMult : dmgMult;

    return {
        damage: Math.floor(baseDmg * finalDmgMult * enhanceDmgMult),
        maxHp: Math.floor(baseHp * hpMult),
        armor,
        goldMult,
        matMult,
        speedMult,
        critChance,
        critDamage,
        lifesteal,
        thorns,
        dodge: Math.min(COMBAT.DODGE_CAP, dodge),
        xpBonus,
    };
};
