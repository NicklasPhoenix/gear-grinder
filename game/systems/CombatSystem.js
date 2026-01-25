import { getZoneById, ZONES, PRESTIGE_ZONES } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, BOSS_STONES, MATERIALS, getSalvageReturns, addItemToInventory, generateGearDrop, TIERS, SPECIAL_EFFECTS, UNIQUE_EFFECTS, getEffectMaxForTier } from '../data/items';
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
            onPlayerAttack: () => { },
            onEnemyAttack: () => { },
            onEnemyAttackWindup: () => { }, // Fires before attack for animation anticipation
        };
        this.enemyWindupFired = false; // Track if windup was fired this attack cycle

        // Accumulators for batching DOT floating text by type (reduces visual clutter)
        this.accumulatedBleed = 0;
        this.accumulatedBurn = 0;
        this.accumulatedPoison = 0;
        this.ticksSinceLastDotDisplay = 0;
        this.dotDisplayInterval = 12; // Show accumulated DOT numbers every N ticks (~0.6s at 20 ticks/s)
    }

    /**
     * Sets visual callback functions for combat events.
     * @param {Object} callbacks - Callback functions for onFloatingText, onLootDrop, onEnemyDeath
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Display accumulated DOT damage numbers and reset accumulators.
     * Each DOT type (bleed, burn, poison) is shown separately with its label and color.
     */
    flushAccumulatedDotText() {
        if (this.accumulatedBleed > 0) {
            this.callbacks.onFloatingText(`BLEED ${this.accumulatedBleed}`, 'bleed', 'enemy');
            this.accumulatedBleed = 0;
        }
        if (this.accumulatedBurn > 0) {
            this.callbacks.onFloatingText(`BURN ${this.accumulatedBurn}`, 'burn', 'enemy');
            this.accumulatedBurn = 0;
        }
        if (this.accumulatedPoison > 0) {
            this.callbacks.onFloatingText(`POISON ${this.accumulatedPoison}`, 'poison', 'enemy');
            this.accumulatedPoison = 0;
        }
        this.ticksSinceLastDotDisplay = 0;
    }

    /**
     * Show player attack damage immediately with appropriate type styling.
     * @param {number} damage - Damage dealt
     * @param {string} critType - Type of attack ('crit', 'ascendedCrit', 'annihilate', etc.)
     */
    showPlayerAttack(damage, critType) {
        let text;
        const type = critType || 'playerDmg';

        switch (critType) {
            case 'crit':
                text = `CRIT ${damage}!`;
                break;
            case 'ascendedCrit':
                text = `ASCEND ${damage}!`;
                break;
            case 'annihilate':
                text = `ANNIHL ${damage}!`;
                break;
            case 'frenzy':
                text = `FRENZYx3 ${damage}!`;
                break;
            case 'multiStrike':
                text = `x2 ${damage}!`;
                break;
            case 'vengeance':
                text = `VENGE ${damage}!`;
                break;
            case 'retaliate':
                text = `COUNTER ${damage}!`;
                break;
            default:
                text = `${damage}`;
        }
        this.callbacks.onFloatingText(text, type, 'enemy');
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

        for (let i = 0; i < item.effects.length; i++) {
            const effect = item.effects[i];
            // Skip awakening bonus effects - they use different scaling
            if (effect.isAwakened) continue;

            // Check both SPECIAL_EFFECTS and UNIQUE_EFFECTS for the effect definition
            let effectDef = SPECIAL_EFFECTS.find(e => e.id === effect.id);
            let isBossEffect = effect.isBossEffect || effect.unique || (item.isBossItem && i === 0);

            if (!effectDef) {
                effectDef = UNIQUE_EFFECTS[effect.id];
                if (effectDef) isBossEffect = true;
            }

            if (!effectDef || effectDef.minVal === undefined) continue;

            // For boss effects use full max, for regular use tier-capped max
            const maxVal = isBossEffect ? effectDef.maxVal : getEffectMaxForTier(effectDef, item.tier);

            // Consider it "max" if within 95% of the max value
            const threshold = effectDef.minVal + (maxVal - effectDef.minVal) * 0.95;

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
        const wantedStats = state.autoSalvageWantedStats ?? [];
        const hasEffects = item.effects && item.effects.length > 0;

        // When keepEffects is ON, effects filter applies to ALL tiers consistently
        if (keepEffects) {
            if (hasEffects) {
                // If stat filter is set, only keep items with at least one wanted stat
                if (wantedStats.length > 0) {
                    const hasWantedStat = item.effects.some(effect => wantedStats.includes(effect.id));
                    if (hasWantedStat) return false; // Keep - has a wanted stat
                    return true; // Salvage - has effects but none are wanted
                }
                return false; // Keep - has effects (any stat, no filter set)
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
     * Calculate player attack interval in ticks based on speed stats.
     */
    getPlayerAttackInterval(stats) {
        const speedMult = stats.speedMult || 1;
        const baseInterval = COMBAT.TICK_RATE / COMBAT.ATTACKS_PER_SECOND;
        const interval = Math.floor(baseInterval / speedMult);
        return Math.max(1, isNaN(interval) ? 5 : interval);
    }

    /**
     * Calculate enemy attack interval in ticks based on zone difficulty.
     */
    getEnemyAttackInterval(zoneId, isEndless, endlessWave) {
        // Base enemy attack speed scales with zone difficulty
        let speedMult = COMBAT.BASE_ENEMY_ATTACK_SPEED || 1;

        if (isEndless) {
            // In endless mode, speed scales with wave
            speedMult += (endlessWave || 1) * 0.01;
        } else {
            // In normal zones, speed scales with zone ID
            speedMult += (zoneId || 0) * (COMBAT.ENEMY_SPEED_SCALING || 0.015);
        }

        // Cap at max speed
        speedMult = Math.min(speedMult, COMBAT.MAX_ENEMY_ATTACK_SPEED || 3);

        const baseInterval = COMBAT.TICK_RATE / speedMult;
        const interval = Math.floor(baseInterval);
        return Math.max(2, isNaN(interval) ? 20 : interval);
    }

    /**
     * Processes one combat tick. Handles independent player and enemy attacks.
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
        let combatUpdates = { actualDamageTaken: 0, lastHeal: 0 };

        // Get enemy stats based on mode (endless vs regular)
        const enemyMaxHp = isEndless ? state.endlessEnemyMaxHp : zone.enemyHp;
        const enemyDmg = isEndless ? state.endlessEnemyDmg : zone.enemyDmg;

        // Initialize or deep copy combat state tracking
        if (!state.combatState) {
            newState.combatState = {
                rageStacks: 0,
                rageDecayTimer: 0,     // Ticks until rage decays (0 = no decay pending)
                damageShield: 0,
                overhealShield: 0,
                bleedTimer: 0,
                burnTimer: 0,
                poisonTimer: 0,
                bleedDamage: 0,
                burnDamage: 0,
                poisonDamage: 0,
                secondWindUsed: false,
                playerAttackTimer: 0,  // Ticks until player attacks
                enemyAttackTimer: 0,   // Ticks until enemy attacks
                enemyRespawnTimer: 0,  // Ticks until next enemy spawns (0 = enemy alive)
            };
        } else {
            // Deep copy combatState to avoid mutating the original
            newState.combatState = { ...state.combatState };
        }

        // Ensure attack timers are valid numbers (fix corrupted saves)
        // Also reset if timers are unreasonably high (> 100 ticks = 5 seconds)
        if (typeof newState.combatState.playerAttackTimer !== 'number' ||
            isNaN(newState.combatState.playerAttackTimer) ||
            newState.combatState.playerAttackTimer > 100) {
            newState.combatState.playerAttackTimer = 0;
        }
        if (typeof newState.combatState.enemyAttackTimer !== 'number' ||
            isNaN(newState.combatState.enemyAttackTimer) ||
            newState.combatState.enemyAttackTimer > 100) {
            newState.combatState.enemyAttackTimer = 0;
        }
        // Also validate rage stacks and decay timer
        if (typeof newState.combatState.rageStacks !== 'number' || isNaN(newState.combatState.rageStacks)) {
            newState.combatState.rageStacks = 0;
        }
        if (typeof newState.combatState.rageDecayTimer !== 'number' || isNaN(newState.combatState.rageDecayTimer)) {
            newState.combatState.rageDecayTimer = 0;
        }

        // Ensure HP values are valid
        if (typeof newState.playerHp !== 'number' || isNaN(newState.playerHp)) {
            newState.playerHp = safeMaxHp;
        }
        if (typeof newState.enemyHp !== 'number' || isNaN(newState.enemyHp)) {
            newState.enemyHp = enemyMaxHp;
        }
        if (typeof newState.enemyMaxHp !== 'number' || isNaN(newState.enemyMaxHp)) {
            newState.enemyMaxHp = enemyMaxHp;
        }

        // Decrement attack timers
        if (newState.combatState.playerAttackTimer > 0) {
            newState.combatState.playerAttackTimer--;
        }
        if (newState.combatState.enemyAttackTimer > 0) {
            newState.combatState.enemyAttackTimer--;
            // Fire windup callback when attack is imminent (8 ticks = ~400ms before hit)
            // This lets the attack animation start before damage is dealt
            if (newState.combatState.enemyAttackTimer === 8 && !this.enemyWindupFired) {
                this.enemyWindupFired = true;
                this.callbacks.onEnemyAttackWindup();
            }
        }

        // Rage decay system - lose stacks if not killing enemies fast enough
        // Decay timer only runs when you have rage stacks
        if (stats.rage > 0 && newState.combatState.rageStacks > 0) {
            if (newState.combatState.rageDecayTimer > 0) {
                newState.combatState.rageDecayTimer--;
            } else {
                // Timer expired - lose 1 rage stack
                newState.combatState.rageStacks = Math.max(0, newState.combatState.rageStacks - 1);
                // Reset decay timer (40 ticks = 2 seconds between decays)
                if (newState.combatState.rageStacks > 0) {
                    newState.combatState.rageDecayTimer = 40;
                }
            }
        }

        // HP Regeneration (% of max HP per second, applied per tick)
        if (stats.hpRegen > 0 && newState.playerHp < safeMaxHp) {
            const regenPerTick = (stats.hpRegen / 100) * safeMaxHp / COMBAT.TICK_RATE;
            const regenAmount = Math.floor(regenPerTick);
            if (regenAmount > 0) {
                newState.playerHp = Math.min(newState.playerHp + regenAmount, safeMaxHp);
                combatUpdates.lastRegen = regenAmount;
            }
        }

        // Process DOT damage each tick (not tied to player attacks)
        // Track each DOT type separately for colored floating text
        if (newState.combatState.bleedTimer > 0) {
            const bleedDmg = newState.combatState.bleedDamage;
            newState.enemyHp -= bleedDmg;
            this.accumulatedBleed += bleedDmg;
            newState.combatState.bleedTimer--;
        }
        if (newState.combatState.burnTimer > 0) {
            const burnDmg = newState.combatState.burnDamage;
            newState.enemyHp -= burnDmg;
            this.accumulatedBurn += burnDmg;
            newState.combatState.burnTimer--;
        }
        if (newState.combatState.poisonTimer > 0) {
            const poisonDmg = newState.combatState.poisonDamage;
            newState.enemyHp -= poisonDmg;
            this.accumulatedPoison += poisonDmg;
            newState.combatState.poisonTimer--;
        }

        // ========== ENEMY RESPAWN TIMER ==========
        // 2 second delay (40 ticks) before next enemy spawns
        if (newState.combatState.enemyRespawnTimer > 0) {
            newState.combatState.enemyRespawnTimer--;

            // When timer reaches 0, spawn the new enemy
            if (newState.combatState.enemyRespawnTimer === 0) {
                newState.enemyHp = enemyMaxHp;
                newState.enemyMaxHp = enemyMaxHp;
                newState.combatState.enemyAttackTimer = this.getEnemyAttackInterval(
                    state.currentZone,
                    isEndless,
                    state.endlessWave
                );
            }

            // Skip combat while waiting for respawn
            newState.combatLog = log;
            newState.playerMaxHp = stats.maxHp;
            if (newState.endlessActive) {
                newState.endlessEnemyHp = newState.enemyHp;
            }
            this.stateManager.setState(newState);
            return combatUpdates;
        }

        // ========== PLAYER ATTACK ==========
        if (newState.combatState.playerAttackTimer <= 0 && newState.enemyHp > 0) {
            const playerAttackResult = this.processPlayerAttack(newState, stats, safeMaxHp, enemyMaxHp, zone);
            combatUpdates = { ...combatUpdates, ...playerAttackResult };

            // Reset player attack timer
            newState.combatState.playerAttackTimer = this.getPlayerAttackInterval(stats);

            // Trigger player attack animation callback
            this.callbacks.onPlayerAttack();
        }

        // Check Enemy Death after player attack
        if (newState.enemyHp <= 0) {
            this.flushAccumulatedDotText();

            if (isEndless) {
                this.handleEndlessEnemyDeath(newState, stats, log, safeMaxHp);
            } else {
                this.handleEnemyDeath(newState, stats, zone, log, safeMaxHp);
            }
            // Reset combat state on enemy death (rage persists between enemies)
            // newState.combatState.rageStacks = 0; // Rage now persists!
            // Reset rage decay timer on kill - reward for fast kills!
            // Timer is 60 ticks (3 seconds) - kill within 3 seconds to maintain rage
            newState.combatState.rageDecayTimer = 60;
            newState.combatState.bleedTimer = 0;
            newState.combatState.burnTimer = 0;
            newState.combatState.poisonTimer = 0;
            newState.combatState.secondWindUsed = false;
            // Don't reset playerAttackTimer - maintain attack rhythm between enemies
            // Only reset enemy timer since it's a new enemy
            newState.combatState.enemyAttackTimer = 0;
            if (stats.damageShield > 0) {
                newState.combatState.damageShield = stats.damageShield;
            }
        }
        // ========== ENEMY ATTACK ==========
        else if (newState.combatState.enemyAttackTimer <= 0 && newState.playerHp > 0) {
            const enemyAttackResult = this.processEnemyAttack(newState, stats, safeMaxHp, enemyDmg, enemyMaxHp);
            combatUpdates = { ...combatUpdates, ...enemyAttackResult };

            // Reset enemy attack timer
            newState.combatState.enemyAttackTimer = this.getEnemyAttackInterval(
                state.currentZone,
                isEndless,
                state.endlessWave
            );

            // Trigger enemy attack animation callback and reset windup flag
            this.callbacks.onEnemyAttack();
            this.enemyWindupFired = false;

            // Second Wind check after enemy attack
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
        newState.playerMaxHp = stats.maxHp;

        if (newState.endlessActive) {
            newState.endlessEnemyHp = newState.enemyHp;
        }

        // Periodically flush accumulated DOT damage numbers
        this.ticksSinceLastDotDisplay++;
        if (this.ticksSinceLastDotDisplay >= this.dotDisplayInterval) {
            this.flushAccumulatedDotText();
        }

        this.stateManager.setState(newState);
        return combatUpdates;
    }

    /**
     * Process a player attack and return damage dealt.
     */
    processPlayerAttack(newState, stats, safeMaxHp, enemyMaxHp, zone) {
        let combatUpdates = {};
        let playerDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;
        let isCrit = Math.random() * 100 < (stats.critChance || PLAYER_BASE.DEFAULT_CRIT_CHANCE);

        // Ascended Crit check
        let isAscendedCrit = false;
        if (isCrit && stats.ascendedCrit > 0) {
            isAscendedCrit = Math.random() * 100 < stats.ascendedCrit;
        }

        // Annihilate check
        let isAnnihilate = false;
        if (isCrit && !isAscendedCrit && stats.annihilate > 0) {
            isAnnihilate = Math.random() * 100 < stats.annihilate;
        }

        // Last Stand bonus
        if (stats.lastStand > 0 && newState.playerHp < safeMaxHp * 0.3) {
            playerDmg = Math.floor(playerDmg * (1 + stats.lastStand / 100));
        }

        // Rage bonus
        if (stats.rage > 0 && newState.combatState.rageStacks > 0) {
            playerDmg = Math.floor(playerDmg * (1 + (stats.rage * newState.combatState.rageStacks) / 100));
        }

        // Crit damage
        if (isCrit) {
            const baseCritMult = (stats.critDamage || PLAYER_BASE.CRIT_DAMAGE) / 100;
            if (isAscendedCrit) {
                playerDmg = Math.floor(playerDmg * baseCritMult * 2);
            } else if (isAnnihilate) {
                playerDmg = Math.floor(playerDmg * 5);
            } else {
                playerDmg = Math.floor(playerDmg * baseCritMult);
            }
        }

        // Armor penetration
        if (stats.armorPen > 0) {
            playerDmg = Math.floor(playerDmg * (1 + stats.armorPen / 200));
        }

        newState.enemyHp -= playerDmg;
        let totalDamageDealt = playerDmg;

        // Determine attack type for display
        let mainAttackType = null;
        if (isAscendedCrit) mainAttackType = 'ascendedCrit';
        else if (isAnnihilate) mainAttackType = 'annihilate';
        else if (isCrit) mainAttackType = 'crit';

        // Show player attack immediately
        this.showPlayerAttack(playerDmg, mainAttackType);

        // Frenzy extra attacks
        if (!isAscendedCrit && stats.frenzy > 0 && Math.random() * 100 < stats.frenzy) {
            const frenzyDmg = Math.floor(playerDmg * 0.6) * 2;
            newState.enemyHp -= frenzyDmg;
            totalDamageDealt += frenzyDmg;
            this.showPlayerAttack(frenzyDmg, 'frenzy');
        }
        // Multi-Strike
        else if (!isAscendedCrit && stats.multiStrike > 0 && Math.random() * 100 < stats.multiStrike) {
            const multiDmg = Math.floor(playerDmg * 0.75);
            newState.enemyHp -= multiDmg;
            totalDamageDealt += multiDmg;
            this.showPlayerAttack(multiDmg, 'multiStrike');
        }

        combatUpdates.lastDamage = playerDmg;
        combatUpdates.isPlayerTurn = true;

        // Stack rage (default max 10, can be increased by set bonuses)
        if (stats.rage > 0) {
            const maxStacks = stats.rageMax || 10;
            newState.combatState.rageStacks = Math.min(maxStacks, newState.combatState.rageStacks + 1);
        }

        // Apply DOT effects on hit
        const baseDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;
        const ticksPerSecond = COMBAT.TICK_RATE;

        if (stats.bleed > 0) {
            const bleedTotal = Math.floor(baseDmg * stats.bleed / 100);
            const bleedTicks = 3 * ticksPerSecond;
            newState.combatState.bleedDamage = Math.max(1, Math.floor(bleedTotal / bleedTicks));
            newState.combatState.bleedTimer = bleedTicks;
        }
        if (stats.burn > 0) {
            const burnTotal = Math.floor(baseDmg * stats.burn / 100);
            const burnTicks = 3 * ticksPerSecond;
            newState.combatState.burnDamage = Math.max(1, Math.floor(burnTotal / burnTicks));
            newState.combatState.burnTimer = burnTicks;
        }
        if (stats.poison > 0) {
            const poisonTotal = Math.floor(baseDmg * stats.poison / 100);
            const poisonTicks = 4 * ticksPerSecond;
            newState.combatState.poisonDamage = Math.max(1, Math.floor(poisonTotal / poisonTicks));
            newState.combatState.poisonTimer = poisonTicks;
        }

        // Execute check
        if (stats.executeChance > 0 && newState.enemyHp > 0 && newState.enemyHp < enemyMaxHp * 0.15) {
            if (Math.random() * 100 < stats.executeChance) {
                newState.enemyHp = 0;
                this.callbacks.onFloatingText('EXECUTE!', 'execute', 'enemy');
            }
        }

        // Lifesteal
        let totalHealed = 0;
        if (stats.lifesteal > 0) {
            totalHealed += Math.floor(totalDamageDealt * stats.lifesteal / 100);
        }
        if (stats.vampiric > 0) {
            totalHealed += Math.floor(totalDamageDealt * stats.vampiric / 100);
        }
        if (stats.lastStand > 0 && newState.playerHp < safeMaxHp * 0.3) {
            totalHealed += Math.floor(totalDamageDealt * stats.lastStand / 100);
        }

        if (totalHealed > 0) {
            const actualHeal = Math.min(totalHealed, safeMaxHp - newState.playerHp);
            newState.playerHp = Math.min(newState.playerHp + totalHealed, safeMaxHp);

            // Show heal immediately
            if (actualHeal > 0) {
                this.callbacks.onFloatingText(`+${actualHeal}`, 'heal', 'player');
            }

            // Overheal shield
            if (stats.overheal > 0 && totalHealed > actualHeal) {
                const excessHeal = totalHealed - actualHeal;
                const shieldGain = Math.floor(excessHeal * stats.overheal / 100);
                if (shieldGain > 0) {
                    newState.combatState.overhealShield = Math.min(
                        (newState.combatState.overhealShield || 0) + shieldGain,
                        Math.floor(safeMaxHp * 0.5)
                    );
                    this.callbacks.onFloatingText(`+${shieldGain}🛡️`, 'overheal', 'player');
                }
            }

            combatUpdates.lastHeal = totalHealed;
        }

        // Silver on Hit
        if (stats.silverOnHit > 0 && Math.random() * 100 < stats.silverOnHit) {
            const bonusSilver = Math.floor(zone.goldMin * 0.5);
            newState.gold += bonusSilver;
            this.callbacks.onFloatingText(`+${bonusSilver}s`, 'silver', 'player');
        }

        return combatUpdates;
    }

    /**
     * Process an enemy attack and return damage taken.
     */
    processEnemyAttack(newState, stats, safeMaxHp, enemyDmg, enemyMaxHp) {
        let combatUpdates = {};
        const playerDmg = stats.damage || PLAYER_BASE.DEFAULT_DAMAGE;

        const dodged = Math.random() * 100 < stats.dodge;
        if (dodged) {
            this.callbacks.onFloatingText('DODGE!', 'dodge', 'player');
            combatUpdates.lastDamage = 0;

            // Phantom counter
            if (stats.phantom > 0 && Math.random() * 100 < stats.phantom) {
                const phantomDmg = Math.floor(playerDmg * 0.5);
                newState.enemyHp -= phantomDmg;
                this.callbacks.onFloatingText(`PHANTOM ${phantomDmg}!`, 'phantom', 'enemy');
            }
            return combatUpdates;
        }

        // Immunity check
        if (stats.immunity > 0 && Math.random() * 100 < stats.immunity) {
            this.callbacks.onFloatingText('IMMUNE!', 'immunity', 'player');
            combatUpdates.lastDamage = 0;
            combatUpdates.isPlayerTurn = false;
            return combatUpdates;
        }

        // Calculate damage
        let incomingDmg = enemyDmg;

        // Frostbite reduction
        if (stats.frostbite > 0) {
            incomingDmg = Math.floor(incomingDmg * (1 - stats.frostbite / 100));
        }

        // Armor reduction
        const armorReduction = stats.armor / (stats.armor + COMBAT.ARMOR_CONSTANT);
        let reducedDmg = Math.floor(incomingDmg * (1 - armorReduction));

        // Flat damage reduction
        if (stats.damageReduction > 0) {
            reducedDmg = Math.floor(reducedDmg * (1 - stats.damageReduction / 100));
        }

        reducedDmg = Math.max(1, reducedDmg);

        // Overheal Shield absorption
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

        // Damage Shield absorption
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

        // Apply damage to player
        if (reducedDmg > 0) {
            newState.playerHp -= reducedDmg;
            // Show enemy damage immediately
            this.callbacks.onFloatingText(`-${reducedDmg}`, 'enemyDmg', 'player');
        }

        combatUpdates.lastDamage = reducedDmg;
        combatUpdates.actualDamageTaken = reducedDmg;
        combatUpdates.isPlayerTurn = false;

        // Counter-attacks
        if (reducedDmg > 0) {
            // Vengeance
            if (stats.vengeance > 0 && Math.random() * 100 < stats.vengeance) {
                const vengDmg = playerDmg;
                newState.enemyHp -= vengDmg;
                this.showPlayerAttack(vengDmg, 'vengeance');
            }
            // Thorns
            else if (stats.thorns > 0) {
                const thornsDmg = Math.floor(reducedDmg * stats.thorns / 100);
                newState.enemyHp -= thornsDmg;
                this.callbacks.onFloatingText(`${thornsDmg}`, 'thorns', 'enemy');
            }

            // Retaliate
            if (stats.retaliate > 0 && Math.random() * 100 < stats.retaliate) {
                const retaliateDmg = Math.floor(playerDmg * 0.5);
                newState.enemyHp -= retaliateDmg;
                this.showPlayerAttack(retaliateDmg, 'retaliate');
            }
        }

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
        const xpEarned = Math.floor(zone.enemyHp / 20 * (1 + stats.xpBonus / 100));
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
                // Check if we have enough kills in current zone to unlock next zone
                // nextZone.killsRequired = kills needed in previous zone to unlock
                if (currentKills >= nextZone.killsRequired) {
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
                state.dailySalvaged = (state.dailySalvaged || 0) + 1; // Track for objectives
                log.push({ type: 'autoSalvage', msg: `${droppedGear.name} salvaged!` });
            } else {
                const maxSlots = state.inventorySlots || 50;
                const result = addItemToInventory(state.inventory, droppedGear, maxSlots);
                if (result.added) {
                    state.inventory = result.inventory;
                    log.push({ type: 'gearDrop', msg: `${droppedGear.name} dropped!` });
                } else {
                    // Inventory full - auto-salvage the item
                    const returns = getSalvageReturns(droppedGear, 1);
                    state.gold += returns.gold;
                    state.enhanceStone += returns.enhanceStone;
                    state.dailySalvaged = (state.dailySalvaged || 0) + 1; // Track for objectives
                    log.push({ type: 'inventoryFull', msg: `Inventory full! ${droppedGear.name} salvaged.` });
                }
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

        // Set respawn timer instead of immediately resetting enemy
        // 40 ticks = 2 seconds at 20 ticks/second
        state.combatState.enemyRespawnTimer = 40;
        // Keep enemy HP at 0 until respawn
        state.enemyHp = 0;

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
            // Mark fixed effect as boss-specific so tooltip doesn't show misleading roll quality
            const fixedEffect = { ...bossItem.effect, isBossEffect: true };
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
                state.dailySalvaged = (state.dailySalvaged || 0) + 1; // Track for objectives
                log.push({ type: 'autoSalvage', msg: `${bossItem.name} salvaged!` });
            } else {
                const maxSlots = state.inventorySlots || 50;
                const result = addItemToInventory(state.inventory, newBossItem, maxSlots);
                if (result.added) {
                    state.inventory = result.inventory;
                    log.push({ type: 'bossLoot', msg: `${bossItem.name} obtained!` });
                } else {
                    // Inventory full - auto-salvage (boss items too valuable to just lose)
                    const returns = getSalvageReturns(newBossItem, 1);
                    state.gold += returns.gold;
                    state.enhanceStone += returns.enhanceStone;
                    state.dailySalvaged = (state.dailySalvaged || 0) + 1; // Track for objectives
                    log.push({ type: 'inventoryFull', msg: `Inventory full! ${bossItem.name} salvaged.` });
                }
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

        // Set respawn timer (40 ticks = 2 seconds)
        state.combatState.enemyRespawnTimer = 40;

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
