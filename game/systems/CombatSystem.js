import { getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, BOSS_STONES, MATERIALS, getSalvageReturns, addItemToInventory, generateGearDrop, TIERS } from '../data/items';
import { SKILLS } from '../data/skills';
import { calculatePlayerStats } from './PlayerSystem';
import { PLAYER_BASE, COMBAT, DEATH_PENALTY, BOSS_DROPS, LEVEL_UP, UI } from '../data/constants';

/**
 * Handles all combat logic including damage calculation, enemy death, loot drops, and player death.
 */
export class CombatSystem {
    /**
     * @param {Object} stateManager - The game state manager (GameManager instance)
     */
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.callbacks = {
            onFloatingText: () => { },
            onLootDrop: () => { },
            onEnemyDeath: () => { },
        };
    }

    /**
     * Sets visual callback functions for combat events.
     * @param {Object} callbacks - Callback functions for onFloatingText, onLootDrop, onEnemyDeath
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Determines if an item should be auto-salvaged based on loot filter settings.
     * @param {Object} item - The dropped item
     * @param {Object} state - Current game state
     * @returns {boolean} - True if item should be auto-salvaged
     */
    shouldAutoSalvageItem(item, state) {
        // Check tier threshold (-1 means disabled, otherwise salvage items at or below threshold)
        const tierThreshold = state.autoSalvageTier ?? -1;
        if (tierThreshold === -1) return true; // Old behavior: salvage everything

        // Item is above tier threshold - don't salvage
        if (item.tier > tierThreshold) return false;

        // Check if we should keep items with effects
        const keepEffects = state.autoSalvageKeepEffects ?? true;
        if (keepEffects && item.effects && item.effects.length > 0) return false;

        // Item matches criteria for auto-salvage
        return true;
    }

    /**
     * Processes one combat tick. Handles player attack, enemy damage, lifesteal, thorns, and death.
     * @param {number} deltaTime - Time since last tick in milliseconds
     * @returns {Object} Combat updates for visual feedback (lastDamage, isPlayerTurn, etc.)
     */
    tick(deltaTime) {
        const state = this.stateManager.getState();
        const stats = calculatePlayerStats(state);

        // Ensure stats.maxHp is valid
        const safeMaxHp = (typeof stats.maxHp === 'number' && !isNaN(stats.maxHp) && stats.maxHp > 0)
            ? stats.maxHp : PLAYER_BASE.DEFAULT_MAX_HP;

        const zone = getZoneById(state.currentZone);
        let newState = { ...state };
        let log = [...state.combatLog].slice(-UI.COMBAT_LOG_MAX_ENTRIES);
        let combatUpdates = {}; // Track what happened for visuals

        // Ensure playerHp is valid before combat
        if (typeof newState.playerHp !== 'number' || isNaN(newState.playerHp)) {
            newState.playerHp = safeMaxHp;
        }
        if (typeof newState.enemyHp !== 'number' || isNaN(newState.enemyHp)) {
            newState.enemyHp = zone.enemyHp;
        }

        // HP Regeneration (% of max HP per second, applied per tick)
        // Tick rate is ATTACKS_PER_SECOND times per second, so divide regen accordingly
        if (stats.hpRegen > 0 && newState.playerHp < safeMaxHp) {
            const regenPerTick = (stats.hpRegen / 100) * safeMaxHp / COMBAT.ATTACKS_PER_SECOND;
            const regenAmount = Math.floor(regenPerTick);
            if (regenAmount > 0) {
                newState.playerHp = Math.min(newState.playerHp + regenAmount, safeMaxHp);
                // Only show regen text occasionally to avoid spam (every 6 ticks = 1 second)
                if (Math.random() < 0.17) {
                    this.callbacks.onFloatingText(`+${regenAmount}`, 'regen', 'player');
                }
                combatUpdates.lastRegen = regenAmount;
            }
        }

        // Player Turn
        let playerDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;
        let isCrit = Math.random() * 100 < (stats.critChance || PLAYER_BASE.DEFAULT_CRIT_CHANCE);
        if (isCrit) playerDmg = Math.floor(playerDmg * (stats.critDamage || PLAYER_BASE.CRIT_DAMAGE) / 100);

        newState.enemyHp -= playerDmg;

        // Visuals: Damage Text
        this.callbacks.onFloatingText(
            isCrit ? `CRIT ${playerDmg}!` : `-${playerDmg}`,
            isCrit ? 'crit' : 'playerDmg',
            'enemy'
        );
        combatUpdates.lastDamage = playerDmg;
        combatUpdates.isPlayerTurn = true;

        // Lifesteal (soft cap with diminishing returns applied in PlayerSystem)
        if (stats.lifesteal > 0) {
            const healed = Math.floor(playerDmg * stats.lifesteal / 100);
            newState.playerHp = Math.min(newState.playerHp + healed, safeMaxHp);

            if (healed > 0) {
                this.callbacks.onFloatingText(`+${healed}`, 'heal', 'player');
                combatUpdates.lastHeal = healed;
            }
        }

        // Check Enemy Death
        if (newState.enemyHp <= 0) {
            this.handleEnemyDeath(newState, stats, zone, log, safeMaxHp);
            // Post-death cleanup/reset is handled inside handleEnemyDeath
        } else {
            // Enemy Return Fire (if alive)
            const dodged = Math.random() * 100 < stats.dodge;
            if (dodged) {
                this.callbacks.onFloatingText('DODGE!', 'dodge', 'player');
                combatUpdates.lastDamage = 0; // Dodged
            } else {
                // Armor reduction (logarithmic diminishing returns)
                const armorReduction = stats.armor / (stats.armor + COMBAT.ARMOR_CONSTANT);
                let reducedDmg = Math.floor(zone.enemyDmg * (1 - armorReduction));

                // Flat damage reduction (applied after armor, enables tank builds)
                if (stats.damageReduction > 0) {
                    reducedDmg = Math.floor(reducedDmg * (1 - stats.damageReduction / 100));
                }

                // Minimum 1 damage to prevent immortality
                reducedDmg = Math.max(1, reducedDmg);

                newState.playerHp -= reducedDmg;
                this.callbacks.onFloatingText(`-${reducedDmg}`, 'enemyDmg', 'player');
                combatUpdates.lastDamage = reducedDmg;
                combatUpdates.isPlayerTurn = false;

                // Thorns
                if (stats.thorns > 0) {
                    const thornsDmg = Math.floor(reducedDmg * stats.thorns / 100);
                    newState.enemyHp -= thornsDmg;
                    if (thornsDmg > 0) this.callbacks.onFloatingText(`-${thornsDmg}`, 'thorns', 'enemy');
                }
            }

            // Check Player Death
            if (newState.playerHp <= 0) {
                this.handlePlayerDeath(newState, stats, zone, safeMaxHp);
            }
        }

        newState.combatLog = log;
        newState.playerMaxHp = stats.maxHp; // Sync max HP

        this.stateManager.setState(newState);
        return combatUpdates;
    }

    /**
     * Handles enemy death: awards gold, XP, drops materials/gear, handles boss loot, level ups.
     * @param {Object} state - Current game state (modified in place)
     * @param {Object} stats - Calculated player stats
     * @param {Object} zone - Current zone data
     * @param {Array} log - Combat log array
     * @param {number} safeMaxHp - Validated max HP value
     */
    handleEnemyDeath(state, stats, zone, log, safeMaxHp) {
        const goldEarned = Math.floor((zone.goldMin + Math.random() * (zone.goldMax - zone.goldMin)) * stats.goldMult);
        const xpEarned = Math.floor(zone.enemyHp / 2 * (1 + stats.xpBonus / 100));
        const drops = zone.drops;
        const zoneBonus = Math.floor(state.currentZone / 2) + 1;

        // Roll Material Drops
        const enhanceStoneDropped = Math.random() < drops.enhanceStone ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 2)) : 0;
        const blessedOrbDropped = Math.random() < drops.blessedOrb ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 3)) : 0;
        const celestialShardDropped = Math.random() < drops.celestialShard ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 4)) : 0;
        const prestigeStoneDropped = drops.prestigeStone && Math.random() < drops.prestigeStone ? Math.ceil(Math.random() * 2) : 0;

        // Roll Gear Drop (non-boss zones only)
        let droppedGear = null;
        if (!zone.isBoss && zone.gearChance && Math.random() < zone.gearChance * stats.matMult) {
            droppedGear = generateGearDrop(zone.gearTier || 0, zone.id, zone.prestigeReq || 0);
        }

        // Update State
        state.gold += goldEarned;
        state.totalGold += goldEarned;
        state.enhanceStone += enhanceStoneDropped;
        state.blessedOrb += blessedOrbDropped;
        state.celestialShard += celestialShardDropped;
        state.prestigeStones += prestigeStoneDropped;
        state.xp += xpEarned;
        state.kills += 1;

        // Zone Kills
        state.zoneKills = { ...state.zoneKills };
        state.zoneKills[state.currentZone] = (state.zoneKills[state.currentZone] || 0) + 1;

        // Handle gear drop with loot filter
        if (droppedGear) {
            // Check if item should be auto-salvaged based on settings
            const shouldAutoSalvage = state.autoSalvage && this.shouldAutoSalvageItem(droppedGear, state);

            if (shouldAutoSalvage) {
                const returns = getSalvageReturns(droppedGear, 1);
                state.gold += returns.gold;
                state.enhanceStone += returns.enhanceStone;
                log.push({ type: 'autoSalvage', msg: `${droppedGear.name} salvaged!` });
            } else {
                state.inventory = addItemToInventory(state.inventory, droppedGear);
                log.push({ type: 'gearDrop', msg: `${droppedGear.name} dropped!` });
            }
        }

        // Boss Loot
        if (zone.isBoss && zone.bossSet) {
            this.handleBossLoot(state, zone, log);
        }

        // Visuals
        const lootItems = [];
        lootItems.push({ text: `+${goldEarned}s`, color: '#c0c0c0' });
        lootItems.push({ text: `+${xpEarned}xp`, color: '#a855f7' });
        // Only show gear drop visual if it wasn't auto-salvaged
        const wasAutoSalvaged = droppedGear && state.autoSalvage && this.shouldAutoSalvageItem(droppedGear, state);
        if (droppedGear && !wasAutoSalvaged) {
            const tierInfo = TIERS[droppedGear.tier] || TIERS[0];
            lootItems.push({ text: `${droppedGear.name}`, color: tierInfo.color });
        }
        if (enhanceStoneDropped) lootItems.push({ text: `+${enhanceStoneDropped}${MATERIALS.enhanceStone.icon}`, color: MATERIALS.enhanceStone.color });
        if (blessedOrbDropped) lootItems.push({ text: `+${blessedOrbDropped}${MATERIALS.blessedOrb.icon}`, color: MATERIALS.blessedOrb.color });
        if (celestialShardDropped) lootItems.push({ text: `+${celestialShardDropped}${MATERIALS.celestialShard.icon}`, color: MATERIALS.celestialShard.color });

        this.callbacks.onLootDrop(lootItems);
        this.callbacks.onEnemyDeath(zone.isBoss);

        // Level Up Check
        const xpForLevel = (level) => Math.floor(LEVEL_UP.BASE_XP * Math.pow(LEVEL_UP.XP_SCALING, level - 1));
        while (state.xp >= xpForLevel(state.level)) {
            state.xp -= xpForLevel(state.level);
            state.level += 1;
            state.statPoints = (state.statPoints || 0) + LEVEL_UP.STAT_POINTS_PER_LEVEL;
            log.push({ type: 'level', msg: `LEVEL UP! Lv.${state.level} (+3 stat points)` });
            this.callbacks.onFloatingText('LEVEL UP!', 'levelup', 'player');

            SKILLS.forEach(skill => {
                if (skill.unlockLevel === state.level && !state.unlockedSkills.includes(skill.id)) {
                    state.unlockedSkills = [...state.unlockedSkills, skill.id];
                    log.push({ type: 'skill', msg: `Unlocked: ${skill.name}!` });
                }
            });
        }

        // Reset Enemy
        state.enemyHp = zone.enemyHp;
        state.enemyMaxHp = zone.enemyHp;

        // Heal Player - use safeMaxHp to prevent NaN
        state.playerHp = Math.min(state.playerHp + Math.floor(safeMaxHp * COMBAT.HEAL_ON_KILL), safeMaxHp);
    }

    /**
     * Handles boss-specific loot: boss stones and boss gear drops.
     * @param {Object} state - Current game state (modified in place)
     * @param {Object} zone - Current zone data (must be a boss zone)
     * @param {Array} log - Combat log array
     */
    handleBossLoot(state, zone, log) {
        const bossSet = BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet];
        const bossStoneInfo = BOSS_STONES[zone.bossSet];

        // Boss stone drops (guaranteed 1-2 per boss kill)
        if (bossStoneInfo) {
            const stoneCount = 1 + (Math.random() < BOSS_DROPS.BONUS_STONE_CHANCE ? 1 : 0);
            if (!state.bossStones) state.bossStones = {};
            state.bossStones[zone.bossSet] = (state.bossStones[zone.bossSet] || 0) + stoneCount;
            log.push({ type: 'bossStone', msg: `${bossStoneInfo.name} x${stoneCount}!` });
            this.callbacks.onFloatingText(`+${stoneCount} ${bossStoneInfo.name}`, 'bossStone', 'player');
        }

        // Boss gear drops (use per-zone rate if defined, otherwise fallback to constant)
        const bossGearChance = zone.bossGearChance || BOSS_DROPS.GEAR_DROP_CHANCE;
        if (Math.random() < bossGearChance && bossSet) {
            const availableSlots = Object.keys(bossSet.items);
            const droppedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            const bossItem = bossSet.items[droppedSlot];

            const newBossItem = {
                slot: droppedSlot,
                tier: bossSet.tier,
                statBonus: bossSet.statBonus,
                id: Date.now(),
                plus: 0,
                effects: [bossItem.effect],
                bossSet: zone.bossSet,
                isBossItem: true,
                weaponType: droppedSlot === 'weapon' ? (bossSet.weaponType || 'sword') : null,
                name: bossItem.name,
            };

            // Check if boss item should be auto-salvaged based on filter settings
            const shouldAutoSalvage = state.autoSalvage && this.shouldAutoSalvageItem(newBossItem, state);

            if (shouldAutoSalvage) {
                const returns = getSalvageReturns(newBossItem, 1);
                state.gold += returns.gold;
                state.enhanceStone += returns.enhanceStone;
                log.push({ type: 'autoSalvage', msg: `${bossItem.name} salvaged!` });
            } else {
                state.inventory = addItemToInventory(state.inventory, newBossItem);
                log.push({ type: 'bossLoot', msg: `${bossItem.name} obtained!` });
            }
        }
    }

    /**
     * Handles player death: applies gold/stone penalties and resets HP.
     * @param {Object} state - Current game state (modified in place)
     * @param {Object} stats - Calculated player stats
     * @param {Object} zone - Current zone data
     * @param {number} safeMaxHp - Validated max HP value
     */
    handlePlayerDeath(state, stats, zone, safeMaxHp) {
        this.callbacks.onFloatingText('DEATH!', 'death', 'player');

        // Death penalty: gold loss
        const goldLost = Math.floor(state.gold * DEATH_PENALTY.GOLD_LOSS);
        if (goldLost > 0) {
            state.gold -= goldLost;
            this.callbacks.onFloatingText(`-${goldLost}s`, 'silverLoss', 'player');
        }

        // Also lose some enhance stones
        const stonesLost = Math.floor(state.enhanceStone * DEATH_PENALTY.STONE_LOSS);
        if (stonesLost > 0) {
            state.enhanceStone -= stonesLost;
        }

        // Track deaths on this zone - if too many, suggest going back
        state.deathsOnZone = (state.deathsOnZone || 0) + 1;

        state.playerHp = safeMaxHp;
        state.enemyHp = zone.enemyHp;
        state.enemyMaxHp = zone.enemyHp;
    }
}
