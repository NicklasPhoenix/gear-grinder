import { getZoneById, ZONES, PRESTIGE_ZONES } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, BOSS_STONES, MATERIALS, getSalvageReturns, addItemToInventory, generateGearDrop, TIERS, SPECIAL_EFFECTS, getEffectMaxForTier } from '../data/items';
import { SKILLS } from '../data/skills';
import { calculatePlayerStats } from './PlayerSystem';
import { PLAYER_BASE, COMBAT, DEATH_PENALTY, BOSS_DROPS, LEVEL_UP, UI } from '../data/constants';
import { updateCollectionProgress } from '../data/collections';
import { getEndlessEnemyStats, processEndlessKill, endEndlessRun, startEndlessRun } from '../data/endlessMode';

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

        // Accumulator for batching floating text (reduces visual clutter)
        this.accumulatedDamageToEnemy = 0;
        this.accumulatedHealToPlayer = 0;
        this.accumulatedDamageToPlayer = 0;
        this.ticksSinceLastDisplay = 0;
        this.displayInterval = 3; // Show accumulated numbers every N ticks
        this.lastCritType = null; // Track if we had a crit for display
    }

    /**
     * Sets visual callback functions for combat events.
     * @param {Object} callbacks - Callback functions for onFloatingText, onLootDrop, onEnemyDeath
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Display accumulated damage/healing numbers and reset accumulators.
     * Called periodically to batch floating text and reduce visual clutter.
     */
    flushAccumulatedText() {
        // Show accumulated damage dealt to enemy (left side of enemy)
        if (this.accumulatedDamageToEnemy > 0) {
            const type = this.lastCritType || 'playerDmg';
            const text = this.lastCritType ? `${this.accumulatedDamageToEnemy}!` : `-${this.accumulatedDamageToEnemy}`;
            this.callbacks.onFloatingText(text, type, 'enemy');
            this.accumulatedDamageToEnemy = 0;
            this.lastCritType = null;
        }

        // Show accumulated healing to player (right side of player)
        if (this.accumulatedHealToPlayer > 0) {
            this.callbacks.onFloatingText(`+${this.accumulatedHealToPlayer}`, 'heal', 'player');
            this.accumulatedHealToPlayer = 0;
        }

        // Show accumulated damage to player (left side of player)
        if (this.accumulatedDamageToPlayer > 0) {
            this.callbacks.onFloatingText(`-${this.accumulatedDamageToPlayer}`, 'enemyDmg', 'player');
            this.accumulatedDamageToPlayer = 0;
        }

        this.ticksSinceLastDisplay = 0;
    }

    /**
     * Determines if an item should be auto-salvaged based on loot filter settings.
     * @param {Object} item - The dropped item
     * @param {Object} state - Current game state
     * @returns {boolean} - True if item should be auto-salvaged
     */
    /**
     * Checks if an item has at least one effect rolled at or near max value for its tier.
     * @param {Object} item - The item to check
     * @returns {boolean} - True if item has at least one max-rolled effect
     */
    hasMaxEffect(item) {
        if (!item.effects || item.effects.length === 0) return false;

        for (const effect of item.effects) {
            // Skip awakening bonus effects - they use different scaling
            if (effect.isAwakened) continue;

            const effectDef = SPECIAL_EFFECTS.find(e => e.id === effect.id);
            if (!effectDef) continue;

            // Get the max value for this effect at the item's tier
            const maxForTier = getEffectMaxForTier(effectDef, item.tier);

            // Consider it "max" if within 95% of the tier's max value
            // This accounts for rounding and gives a bit of tolerance
            const threshold = effectDef.minVal + (maxForTier - effectDef.minVal) * 0.95;

            if (effect.value >= threshold) {
                return true;
            }
        }
        return false;
    }

    shouldAutoSalvageItem(item, state) {
        // Never auto-salvage locked items
        if (item.locked) return false;

        // Only auto-salvage boss items if explicitly enabled (dangerous!)
        if (item.isBossItem && !state.autoSalvageBossItems) return false;

        // Check tier threshold (-1 means disabled, otherwise salvage items at or below threshold)
        const tierThreshold = state.autoSalvageTier ?? -1;
        if (tierThreshold === -1) return true; // Old behavior: salvage everything

        // Check if we should keep items with effects
        const keepEffects = state.autoSalvageKeepEffects ?? true;
        const maxEffectsOnly = state.autoSalvageMaxEffectsOnly ?? false;
        const hasEffects = item.effects && item.effects.length > 0;

        // When keepEffects is ON, effects filter applies to ALL tiers consistently
        if (keepEffects) {
            if (hasEffects) {
                // If maxEffectsOnly is ON, only keep items with at least one max-rolled effect
                if (maxEffectsOnly) {
                    if (this.hasMaxEffect(item)) return false; // Keep - has max effect
                    return true; // Salvage - has effects but none are max
                }
                return false; // Keep - has effects (any tier)
            }
            // Salvage items without effects that are at or below threshold
            if (item.tier <= tierThreshold) return true;
            return false; // Keep higher tier items without effects (safety net)
        }

        // When keepEffects is OFF, just use tier threshold
        if (item.tier > tierThreshold) return false;
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
        const isEndless = state.endlessActive;
        let newState = { ...state };
        let log = [...state.combatLog].slice(-UI.COMBAT_LOG_MAX_ENTRIES);
        let combatUpdates = { actualDamageTaken: 0, lastHeal: 0 }; // Track what happened for visuals

        // Get enemy stats based on mode (endless vs regular)
        const enemyMaxHp = isEndless ? state.endlessEnemyMaxHp : zone.enemyHp;
        const enemyDmg = isEndless ? state.endlessEnemyDmg : zone.enemyDmg;

        // Initialize combat state tracking for unique effects
        if (!newState.combatState) {
            newState.combatState = {
                rageStacks: 0,        // Rage stacks (0-10)
                damageShield: 0,      // Current damage shield amount
                overhealShield: 0,    // Shield from overheal effect
                bleedTimer: 0,        // DOT timers (in ticks)
                burnTimer: 0,
                poisonTimer: 0,
                bleedDamage: 0,       // DOT damage per tick
                burnDamage: 0,
                poisonDamage: 0,
                secondWindUsed: false, // Second Wind triggers once per fight
            };
        }

        // Ensure playerHp is valid before combat
        if (typeof newState.playerHp !== 'number' || isNaN(newState.playerHp)) {
            newState.playerHp = safeMaxHp;
        }
        if (typeof newState.enemyHp !== 'number' || isNaN(newState.enemyHp)) {
            newState.enemyHp = enemyMaxHp;
        }
        // Also ensure enemyMaxHp is valid (can be NaN after ending endless mode)
        if (typeof newState.enemyMaxHp !== 'number' || isNaN(newState.enemyMaxHp)) {
            newState.enemyMaxHp = enemyMaxHp;
        }

        // HP Regeneration (% of max HP per second, applied per tick)
        // Tick rate is ATTACKS_PER_SECOND times per second, so divide regen accordingly
        if (stats.hpRegen > 0 && newState.playerHp < safeMaxHp) {
            const regenPerTick = (stats.hpRegen / 100) * safeMaxHp / COMBAT.ATTACKS_PER_SECOND;
            const regenAmount = Math.floor(regenPerTick);
            if (regenAmount > 0) {
                const actualRegen = Math.min(regenAmount, safeMaxHp - newState.playerHp);
                newState.playerHp = Math.min(newState.playerHp + regenAmount, safeMaxHp);
                // Accumulate regen with other healing
                this.accumulatedHealToPlayer += actualRegen;
                combatUpdates.lastRegen = regenAmount;
            }
        }

        // ========== PLAYER TURN ==========
        let playerDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;
        let isCrit = Math.random() * 100 < (stats.critChance || PLAYER_BASE.DEFAULT_CRIT_CHANCE);

        // Ascended Crit: overflow crit becomes double crit damage chance
        let isAscendedCrit = false;
        if (isCrit && stats.ascendedCrit > 0) {
            isAscendedCrit = Math.random() * 100 < stats.ascendedCrit;
        }

        // Annihilate: overflow crit damage becomes 5x damage crit chance
        let isAnnihilate = false;
        if (isCrit && !isAscendedCrit && stats.annihilate > 0) {
            isAnnihilate = Math.random() * 100 < stats.annihilate;
        }

        // Last Stand: bonus damage when below 30% HP
        if (stats.lastStand > 0 && newState.playerHp < safeMaxHp * 0.3) {
            playerDmg = Math.floor(playerDmg * (1 + stats.lastStand / 100));
        }

        // Rage: stacking damage bonus
        if (stats.rage > 0 && newState.combatState.rageStacks > 0) {
            playerDmg = Math.floor(playerDmg * (1 + (stats.rage * newState.combatState.rageStacks) / 100));
        }

        // Apply crit damage multiplier
        if (isCrit) {
            const baseCritMult = (stats.critDamage || PLAYER_BASE.CRIT_DAMAGE) / 100;
            if (isAscendedCrit) {
                // Ascended Crit: double the crit damage multiplier
                playerDmg = Math.floor(playerDmg * baseCritMult * 2);
            } else if (isAnnihilate) {
                // Annihilate: 5x damage instead of normal crit
                playerDmg = Math.floor(playerDmg * 5);
            } else {
                playerDmg = Math.floor(playerDmg * baseCritMult);
            }
        }

        // Apply armor penetration
        if (stats.armorPen > 0) {
            playerDmg = Math.floor(playerDmg * (1 + stats.armorPen / 200));
        }

        newState.enemyHp -= playerDmg;
        let totalDamageDealt = playerDmg;

        // Frenzy: overflow speed becomes triple attack chance
        if (!isAscendedCrit && stats.frenzy > 0 && Math.random() * 100 < stats.frenzy) {
            // Triple attack - two extra hits at 60% damage each
            const frenzyDmg = Math.floor(playerDmg * 0.6);
            newState.enemyHp -= frenzyDmg * 2;
            totalDamageDealt += frenzyDmg * 2;
            this.accumulatedDamageToEnemy += frenzyDmg * 2;
            this.callbacks.onFloatingText('FRENZY!', 'frenzy', 'enemy');
        }
        // Multi-Strike: chance to hit again (not on ascended crit or frenzy)
        else if (!isAscendedCrit && stats.multiStrike > 0 && Math.random() * 100 < stats.multiStrike) {
            const multiDmg = Math.floor(playerDmg * 0.75);
            newState.enemyHp -= multiDmg;
            totalDamageDealt += multiDmg;
            this.accumulatedDamageToEnemy += multiDmg;
            this.callbacks.onFloatingText('x2!', 'multiStrike', 'enemy');
        }

        // Accumulate damage to enemy (shown in batches to reduce clutter)
        this.accumulatedDamageToEnemy += playerDmg;

        // Track crit type for display (special crits show label immediately)
        if (isAscendedCrit) {
            this.lastCritType = 'ascendedCrit';
            this.callbacks.onFloatingText('ASCENDED!', 'ascendedCrit', 'enemy');
        } else if (isAnnihilate) {
            this.lastCritType = 'annihilate';
            this.callbacks.onFloatingText('ANNIHILATE!', 'annihilate', 'enemy');
        } else if (isCrit) {
            this.lastCritType = 'crit';
        }

        combatUpdates.lastDamage = playerDmg;
        combatUpdates.isPlayerTurn = true;

        // Stack rage after hitting
        if (stats.rage > 0) {
            newState.combatState.rageStacks = Math.min(10, newState.combatState.rageStacks + 1);
        }

        // Apply DOT effects
        const baseDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;
        const ticksPerSecond = COMBAT.ATTACKS_PER_SECOND;

        // Bleed: 25% weapon damage over 3 seconds
        if (stats.bleed > 0) {
            const bleedTotal = Math.floor(baseDmg * stats.bleed / 100);
            const bleedTicks = 3 * ticksPerSecond;
            newState.combatState.bleedDamage = Math.floor(bleedTotal / bleedTicks);
            newState.combatState.bleedTimer = bleedTicks;
        }

        // Burn: deals more upfront damage over 3 seconds
        if (stats.burn > 0) {
            const burnTotal = Math.floor(baseDmg * stats.burn / 100);
            const burnTicks = 3 * ticksPerSecond;
            newState.combatState.burnDamage = Math.floor(burnTotal / burnTicks);
            newState.combatState.burnTimer = burnTicks;
        }

        // Poison: slower but longer lasting, 4 seconds
        if (stats.poison > 0) {
            const poisonTotal = Math.floor(baseDmg * stats.poison / 100);
            const poisonTicks = 4 * ticksPerSecond;
            newState.combatState.poisonDamage = Math.floor(poisonTotal / poisonTicks);
            newState.combatState.poisonTimer = poisonTicks;
        }

        // Process DOT ticks (damage applied each tick) - accumulated with regular damage
        let dotDamage = 0;
        if (newState.combatState.bleedTimer > 0) {
            dotDamage += newState.combatState.bleedDamage;
            newState.combatState.bleedTimer--;
        }
        if (newState.combatState.burnTimer > 0) {
            dotDamage += newState.combatState.burnDamage;
            newState.combatState.burnTimer--;
        }
        if (newState.combatState.poisonTimer > 0) {
            dotDamage += newState.combatState.poisonDamage;
            newState.combatState.poisonTimer--;
        }
        newState.enemyHp -= dotDamage;
        totalDamageDealt += dotDamage;
        this.accumulatedDamageToEnemy += dotDamage;

        // Execute: instant kill enemies below 15% HP
        if (stats.executeChance > 0 && newState.enemyHp > 0 && newState.enemyHp < enemyMaxHp * 0.15) {
            if (Math.random() * 100 < stats.executeChance) {
                newState.enemyHp = 0;
                this.callbacks.onFloatingText('EXECUTE!', 'execute', 'enemy');
            }
        }

        // Lifesteal (soft cap with diminishing returns applied in PlayerSystem)
        let totalHealed = 0;
        if (stats.lifesteal > 0) {
            const healed = Math.floor(totalDamageDealt * stats.lifesteal / 100);
            totalHealed += healed;
        }

        // Vampiric: enhanced lifesteal on top of regular lifesteal
        if (stats.vampiric > 0) {
            const vampHealed = Math.floor(totalDamageDealt * stats.vampiric / 100);
            totalHealed += vampHealed;
        }

        // Last Stand lifesteal bonus when below 30% HP
        if (stats.lastStand > 0 && newState.playerHp < safeMaxHp * 0.3) {
            const lastStandHeal = Math.floor(totalDamageDealt * stats.lastStand / 100);
            totalHealed += lastStandHeal;
        }

        if (totalHealed > 0) {
            const actualHeal = Math.min(totalHealed, safeMaxHp - newState.playerHp);
            newState.playerHp = Math.min(newState.playerHp + totalHealed, safeMaxHp);

            // Overheal: excess healing becomes shield (show immediately as special effect)
            if (stats.overheal > 0 && totalHealed > actualHeal) {
                const excessHeal = totalHealed - actualHeal;
                const shieldGain = Math.floor(excessHeal * stats.overheal / 100);
                if (shieldGain > 0) {
                    newState.combatState.overhealShield = (newState.combatState.overhealShield || 0) + shieldGain;
                    // Cap overheal shield at 50% max HP
                    newState.combatState.overhealShield = Math.min(newState.combatState.overhealShield, Math.floor(safeMaxHp * 0.5));
                    this.callbacks.onFloatingText(`+${shieldGain}🛡️`, 'overheal', 'player');
                }
            }

            // Accumulate healing for batched display
            this.accumulatedHealToPlayer += actualHeal;
            combatUpdates.lastHeal = totalHealed;
        }

        // Silver on Hit: chance for bonus silver
        if (stats.silverOnHit > 0 && Math.random() * 100 < stats.silverOnHit) {
            const bonusSilver = Math.floor(zone.goldMin * 0.5);
            newState.gold += bonusSilver;
            this.callbacks.onFloatingText(`+${bonusSilver}s`, 'silver', 'player');
        }

        // Check Enemy Death
        if (newState.enemyHp <= 0) {
            if (isEndless) {
                this.handleEndlessEnemyDeath(newState, stats, log, safeMaxHp);
            } else {
                this.handleEnemyDeath(newState, stats, zone, log, safeMaxHp);
            }
            // Reset combat state on enemy death
            newState.combatState.rageStacks = 0;
            newState.combatState.bleedTimer = 0;
            newState.combatState.burnTimer = 0;
            newState.combatState.poisonTimer = 0;
            newState.combatState.secondWindUsed = false; // Reset Second Wind for next fight
            // Refresh damage shield on kill
            if (stats.damageShield > 0) {
                newState.combatState.damageShield = stats.damageShield;
            }
        } else {
            // ========== ENEMY TURN ==========
            const dodged = Math.random() * 100 < stats.dodge;
            if (dodged) {
                this.callbacks.onFloatingText('DODGE!', 'dodge', 'player');
                combatUpdates.lastDamage = 0;

                // Phantom: counter-attack when dodging
                if (stats.phantom > 0 && Math.random() * 100 < stats.phantom) {
                    const phantomDmg = Math.floor(playerDmg * 0.5);
                    newState.enemyHp -= phantomDmg;
                    this.callbacks.onFloatingText(`PHANTOM ${phantomDmg}!`, 'phantom', 'enemy');
                }
            } else {
                // Immunity: chance to completely negate damage
                const isImmune = stats.immunity > 0 && Math.random() * 100 < stats.immunity;
                if (isImmune) {
                    this.callbacks.onFloatingText('IMMUNE!', 'immunity', 'player');
                    combatUpdates.lastDamage = 0;
                    combatUpdates.isPlayerTurn = false;
                } else {
                    // Calculate enemy damage (use mode-specific damage)
                    let incomingDmg = enemyDmg;

                    // Frostbite: slow enemy attacks (reduce damage as a simplification)
                    if (stats.frostbite > 0) {
                        incomingDmg = Math.floor(incomingDmg * (1 - stats.frostbite / 100));
                    }

                    // Armor reduction (logarithmic diminishing returns)
                    const armorReduction = stats.armor / (stats.armor + COMBAT.ARMOR_CONSTANT);
                    let reducedDmg = Math.floor(incomingDmg * (1 - armorReduction));

                    // Flat damage reduction (applied after armor, enables tank builds)
                    if (stats.damageReduction > 0) {
                        reducedDmg = Math.floor(reducedDmg * (1 - stats.damageReduction / 100));
                    }

                    // Minimum 1 damage to prevent immortality
                    reducedDmg = Math.max(1, reducedDmg);

                    // Overheal Shield: absorbs damage first
                    if (newState.combatState.overhealShield > 0) {
                        if (newState.combatState.overhealShield >= reducedDmg) {
                            newState.combatState.overhealShield -= reducedDmg;
                            this.callbacks.onFloatingText(`🛡️${reducedDmg}`, 'overheal', 'player');
                            reducedDmg = 0;
                        } else {
                            reducedDmg -= newState.combatState.overhealShield;
                            this.callbacks.onFloatingText(`🛡️${newState.combatState.overhealShield}`, 'overheal', 'player');
                            newState.combatState.overhealShield = 0;
                        }
                    }

                    // Damage Shield: absorbs damage before HP
                    if (reducedDmg > 0 && newState.combatState.damageShield > 0) {
                        if (newState.combatState.damageShield >= reducedDmg) {
                            newState.combatState.damageShield -= reducedDmg;
                            this.callbacks.onFloatingText(`🛡️${reducedDmg}`, 'shield', 'player');
                            reducedDmg = 0;
                        } else {
                            reducedDmg -= newState.combatState.damageShield;
                            this.callbacks.onFloatingText(`🛡️${newState.combatState.damageShield}`, 'shield', 'player');
                            newState.combatState.damageShield = 0;
                        }
                    }

                    if (reducedDmg > 0) {
                        newState.playerHp -= reducedDmg;
                        // Accumulate damage to player for batched display
                        this.accumulatedDamageToPlayer += reducedDmg;
                    }
                    combatUpdates.lastDamage = reducedDmg;
                    combatUpdates.actualDamageTaken = reducedDmg;
                    combatUpdates.isPlayerTurn = false;

                    // Vengeance: overflow thorns becomes full damage counter (show immediately)
                    if (stats.vengeance > 0 && reducedDmg > 0 && Math.random() * 100 < stats.vengeance) {
                        const vengDmg = playerDmg; // Full player damage
                        newState.enemyHp -= vengDmg;
                        this.accumulatedDamageToEnemy += vengDmg;
                        this.callbacks.onFloatingText('VENGEANCE!', 'vengeance', 'enemy');
                    }

                    // Thorns (only if not vengeance) - accumulate with regular damage
                    else if (stats.thorns > 0 && reducedDmg > 0) {
                        const thornsDmg = Math.floor(reducedDmg * stats.thorns / 100);
                        newState.enemyHp -= thornsDmg;
                        this.accumulatedDamageToEnemy += thornsDmg;
                    }

                    // Retaliate: chance to counter-attack when hit (show immediately)
                    if (stats.retaliate > 0 && reducedDmg > 0 && Math.random() * 100 < stats.retaliate) {
                        const retaliateDmg = Math.floor(playerDmg * 0.5);
                        newState.enemyHp -= retaliateDmg;
                        this.accumulatedDamageToEnemy += retaliateDmg;
                        this.callbacks.onFloatingText('COUNTER!', 'retaliate', 'enemy');
                    }
                }
            }

            // Second Wind: emergency heal when dropping below 20% HP (once per fight)
            if (stats.secondWind > 0 && !newState.combatState.secondWindUsed && newState.playerHp > 0 && newState.playerHp < safeMaxHp * 0.2) {
                const secondWindHeal = Math.floor(safeMaxHp * stats.secondWind / 100);
                newState.playerHp = Math.min(newState.playerHp + secondWindHeal, safeMaxHp);
                newState.combatState.secondWindUsed = true;
                this.callbacks.onFloatingText(`SECOND WIND +${secondWindHeal}!`, 'secondWind', 'player');
            }

            // Check Player Death
            if (newState.playerHp <= 0) {
                if (isEndless) {
                    this.handleEndlessPlayerDeath(newState, safeMaxHp, log);
                } else {
                    this.handlePlayerDeath(newState, stats, zone, safeMaxHp);
                }
            }
        }

        newState.combatLog = log;
        newState.playerMaxHp = stats.maxHp; // Sync max HP

        // Sync endless enemy HP for UI display
        if (newState.endlessActive) {
            newState.endlessEnemyHp = newState.enemyHp;
        }

        // Periodically flush accumulated damage/heal numbers (reduces floating text clutter)
        this.ticksSinceLastDisplay++;
        if (this.ticksSinceLastDisplay >= this.displayInterval) {
            this.flushAccumulatedText();
        }

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

        // Kill Heal: heal % of max HP on kill (from set bonuses)
        if (stats.killHeal > 0) {
            const killHealAmount = Math.floor(safeMaxHp * stats.killHeal / 100);
            state.playerHp = Math.min(state.playerHp + killHealAmount, safeMaxHp);
            this.callbacks.onFloatingText(`+${killHealAmount}`, 'killHeal', 'player');
        }

        // Roll Material Drops
        const enhanceStoneDropped = Math.random() < drops.enhanceStone ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 2)) : 0;
        const blessedOrbDropped = Math.random() < drops.blessedOrb ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 3)) : 0;
        const celestialShardDropped = Math.random() < drops.celestialShard ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 4)) : 0;
        const prestigeStoneDropped = drops.prestigeStone && Math.random() < drops.prestigeStone ? Math.ceil(Math.random() * 2) : 0;

        // Item Find: increased gear drop chance
        const itemFindBonus = stats.itemFind > 0 ? (1 + stats.itemFind / 100) : 1;

        // Roll Gear Drop (non-boss zones only)
        let droppedGear = null;
        if (!zone.isBoss && zone.gearChance && Math.random() < zone.gearChance * stats.matMult * itemFindBonus) {
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

        // Auto-progress to next zone if enabled and unlocked
        if (state.autoProgress && !state.endlessActive) {
            const allZones = [...ZONES, ...PRESTIGE_ZONES.filter(z => (state.prestigeLevel || 0) >= (z.prestigeReq || 0))];
            const currentIndex = allZones.findIndex(z => z.id === state.currentZone);
            if (currentIndex >= 0 && currentIndex < allZones.length - 1) {
                const currentZoneData = allZones[currentIndex];
                const nextZone = allZones[currentIndex + 1];
                const currentKills = state.zoneKills[currentZoneData.id] || 0;
                // Check if we just reached the kill requirement for current zone
                if (currentKills >= currentZoneData.killsRequired && currentZoneData.killsRequired > 0) {
                    state.currentZone = nextZone.id;
                    state.enemyHp = nextZone.enemyHp;
                    state.enemyMaxHp = nextZone.enemyHp;
                    log.push({ type: 'progress', msg: `Moved to ${nextZone.name}!` });
                    this.callbacks.onFloatingText(`ZONE: ${nextZone.name}`, 'milestone', 'player');
                }
            }
        }

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
            // Track for collection progress regardless of salvage
            updateCollectionProgress(state, droppedGear);
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

            // Boss items get their fixed effect + one random effect
            const fixedEffect = bossItem.effect;
            const effects = [fixedEffect];

            // Add a random second effect (excluding the fixed effect's type)
            const availableEffects = SPECIAL_EFFECTS.filter(e => e.id !== fixedEffect.id);
            if (availableEffects.length > 0) {
                const randomEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                const cappedMax = getEffectMaxForTier(randomEffect, bossSet.tier);
                const value = randomEffect.minVal + Math.random() * (cappedMax - randomEffect.minVal);
                const finalValue = randomEffect.maxVal <= 10 ? Math.round(value * 10) / 10 : Math.floor(value);
                effects.push({ id: randomEffect.id, name: randomEffect.name, value: finalValue });
            }

            const newBossItem = {
                slot: droppedSlot,
                tier: bossSet.tier,
                statBonus: bossSet.statBonus,
                id: Date.now(),
                plus: 0,
                effects: effects,
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
            // Track for collection progress regardless of salvage
            updateCollectionProgress(state, newBossItem);
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

    /**
     * Handles enemy death in Endless Mode - processes wave rewards and advances to next wave.
     * @param {Object} state - Current game state (modified in place)
     * @param {Object} stats - Calculated player stats
     * @param {Array} log - Combat log array
     * @param {number} safeMaxHp - Validated max HP value
     */
    handleEndlessEnemyDeath(state, stats, log, safeMaxHp) {
        // Process the kill and get rewards
        const result = processEndlessKill(state);

        // Show loot visuals (wave is now shown as persistent UI element above enemy)
        const lootItems = [];
        lootItems.push({ text: `+${result.gold}s`, color: '#c0c0c0' });
        lootItems.push({ text: `+${result.xp}xp`, color: '#a855f7' });

        if (result.drops.enhanceStone > 0) {
            lootItems.push({ text: `+${result.drops.enhanceStone} E.Stone`, color: '#3b82f6' });
        }
        if (result.drops.blessedOrb > 0) {
            lootItems.push({ text: `+${result.drops.blessedOrb} B.Orb`, color: '#a855f7' });
        }
        if (result.drops.celestialShard > 0) {
            lootItems.push({ text: `+${result.drops.celestialShard} C.Shard`, color: '#fbbf24' });
        }

        this.callbacks.onLootDrop(lootItems);

        // Handle milestone
        if (result.milestone) {
            log.push({ type: 'milestone', msg: `Milestone reached: ${result.milestone.title}!` });
            this.callbacks.onFloatingText(`${result.milestone.title}!`, 'milestone', 'player');
        }

        // Kill Heal in endless mode
        if (stats.killHeal > 0) {
            const killHealAmount = Math.floor(safeMaxHp * stats.killHeal / 100);
            state.playerHp = Math.min(state.playerHp + killHealAmount, safeMaxHp);
            this.callbacks.onFloatingText(`+${killHealAmount}`, 'killHeal', 'player');
        }

        // Heal player on kill
        state.playerHp = Math.min(state.playerHp + Math.floor(safeMaxHp * COMBAT.HEAL_ON_KILL), safeMaxHp);

        // Enemy HP is already set by processEndlessKill via state mutation
        this.callbacks.onEnemyDeath(state.endlessWave % 10 === 0); // Boss every 10 waves
    }

    /**
     * Handles player death in Endless Mode - ends the run and returns to normal zone.
     * @param {Object} state - Current game state (modified in place)
     * @param {number} safeMaxHp - Validated max HP value
     * @param {Array} log - Combat log array
     */
    handleEndlessPlayerDeath(state, safeMaxHp, log) {
        this.callbacks.onFloatingText('RUN ENDED!', 'death', 'player');

        const finalWave = state.endlessWave;
        const wasNewBest = finalWave > (state.endlessBestWave || 0);

        log.push({
            type: 'endlessEnd',
            msg: `Endless run ended at Wave ${finalWave}${wasNewBest ? ' (NEW BEST!)' : ''}`
        });

        if (wasNewBest) {
            this.callbacks.onFloatingText('NEW BEST!', 'milestone', 'player');
        }

        // End the run (this updates best wave, stores history, returns to zone)
        endEndlessRun(state);

        // Restore player HP
        state.playerHp = safeMaxHp;

        // Reset enemy to current zone's enemy
        const zone = getZoneById(state.currentZone);
        state.enemyHp = zone.enemyHp;
        state.enemyMaxHp = zone.enemyHp;
    }

    /**
     * Starts an endless mode run.
     * @param {Object} state - Current game state (modified in place)
     */
    startEndless(state) {
        startEndlessRun(state);
    }
}
