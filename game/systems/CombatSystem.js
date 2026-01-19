import { getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, BOSS_STONES, MATERIALS, getSalvageReturns, addItemToInventory, generateGearDrop, TIERS } from '../data/items';
import { SKILLS } from '../data/skills';
import { calculatePlayerStats } from './PlayerSystem';

export class CombatSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.callbacks = {
            onFloatingText: () => { },
            onLootDrop: () => { },
            onEnemyDeath: () => { },
        };
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    tick(deltaTime) {
        const state = this.stateManager.getState();
        const stats = calculatePlayerStats(state);

        // Ensure stats.maxHp is valid
        const safeMaxHp = (typeof stats.maxHp === 'number' && !isNaN(stats.maxHp) && stats.maxHp > 0)
            ? stats.maxHp : 100;

        const zone = getZoneById(state.currentZone);
        let newState = { ...state };
        let log = [...state.combatLog].slice(-4);
        let combatUpdates = {}; // Track what happened for visuals

        // Ensure playerHp is valid before combat
        if (typeof newState.playerHp !== 'number' || isNaN(newState.playerHp)) {
            newState.playerHp = safeMaxHp;
        }
        if (typeof newState.enemyHp !== 'number' || isNaN(newState.enemyHp)) {
            newState.enemyHp = zone.enemyHp;
        }

        // Player Turn
        let playerDmg = stats.damage || 10;
        let isCrit = Math.random() * 100 < (stats.critChance || 5);
        if (isCrit) playerDmg = Math.floor(playerDmg * (stats.critDamage || 150) / 100);

        newState.enemyHp -= playerDmg;

        // Visuals: Damage Text
        this.callbacks.onFloatingText(
            isCrit ? `CRIT ${playerDmg}!` : `-${playerDmg}`,
            isCrit ? 'crit' : 'playerDmg',
            'enemy'
        );
        combatUpdates.lastDamage = playerDmg;
        combatUpdates.isPlayerTurn = true;

        // Lifesteal
        if (stats.lifesteal > 0) {
            const rawHeal = Math.floor(playerDmg * stats.lifesteal / 100);
            const healed = Math.min(rawHeal, stats.lifestealMaxHeal || 1000);
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
                const damageReduction = stats.armor / (stats.armor + 250);
                const reducedDmg = Math.max(1, Math.floor(zone.enemyDmg * (1 - damageReduction)));

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
            droppedGear = generateGearDrop(zone.gearTier || 0, zone.id);
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

        // Handle gear drop
        if (droppedGear) {
            if (state.autoSalvage) {
                const returns = getSalvageReturns(droppedGear, 1);
                state.gold += returns.gold;
                state.enhanceStone += returns.enhanceStone;
                log.push({ type: 'autoSalvage', msg: `♻️ ${droppedGear.name} salvaged!` });
            } else {
                state.inventory = addItemToInventory(state.inventory, droppedGear);
                log.push({ type: 'gearDrop', msg: `⚔️ ${droppedGear.name} dropped!` });
            }
        }

        // Boss Loot
        if (zone.isBoss && zone.bossSet) {
            this.handleBossLoot(state, zone, log);
        }

        // Visuals
        const lootItems = [];
        lootItems.push({ text: `+${goldEarned}g`, color: '#fbbf24' });
        lootItems.push({ text: `+${xpEarned}xp`, color: '#a855f7' });
        if (droppedGear && !state.autoSalvage) {
            const tierInfo = TIERS[droppedGear.tier] || TIERS[0];
            lootItems.push({ text: `${droppedGear.name}`, color: tierInfo.color });
        }
        if (enhanceStoneDropped) lootItems.push({ text: `+${enhanceStoneDropped}${MATERIALS.enhanceStone.icon}`, color: MATERIALS.enhanceStone.color });
        if (blessedOrbDropped) lootItems.push({ text: `+${blessedOrbDropped}${MATERIALS.blessedOrb.icon}`, color: MATERIALS.blessedOrb.color });
        if (celestialShardDropped) lootItems.push({ text: `+${celestialShardDropped}${MATERIALS.celestialShard.icon}`, color: MATERIALS.celestialShard.color });

        this.callbacks.onLootDrop(lootItems);
        this.callbacks.onEnemyDeath(zone.isBoss);

        // Level Up Check
        const xpForLevel = (level) => Math.floor(50 * Math.pow(1.3, level - 1));
        while (state.xp >= xpForLevel(state.level)) {
            state.xp -= xpForLevel(state.level);
            state.level += 1;
            state.statPoints = (state.statPoints || 0) + 3;
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

        // Heal Player (3% rule) - use safeMaxHp to prevent NaN
        state.playerHp = Math.min(state.playerHp + Math.floor(safeMaxHp * 0.03), safeMaxHp);
    }

    handleBossLoot(state, zone, log) {
        const bossSet = BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet];
        const bossStoneInfo = BOSS_STONES[zone.bossSet];

        // Boss stone drops (guaranteed 1-2 per boss kill)
        if (bossStoneInfo) {
            const stoneCount = 1 + (Math.random() < 0.3 ? 1 : 0); // 70% = 1, 30% = 2
            if (!state.bossStones) state.bossStones = {};
            state.bossStones[zone.bossSet] = (state.bossStones[zone.bossSet] || 0) + stoneCount;
            log.push({ type: 'bossStone', msg: `💎 ${bossStoneInfo.name} x${stoneCount}!` });
            this.callbacks.onFloatingText(`+${stoneCount} ${bossStoneInfo.name}`, 'bossStone', 'player');
        }

        // Boss gear drops (6% chance)
        const dropChance = 0.06;
        if (Math.random() < dropChance && bossSet) {
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

            // Check if auto-salvage is enabled
            if (state.autoSalvage) {
                const returns = getSalvageReturns(newBossItem, 1);
                state.gold += returns.gold;
                state.enhanceStone += returns.enhanceStone;
                log.push({ type: 'autoSalvage', msg: `♻️ ${bossItem.name} salvaged! +${returns.gold}g` });
                this.callbacks.onFloatingText(`+${returns.gold}g`, 'heal', 'player');
            } else {
                // Add to inventory with stacking
                state.inventory = addItemToInventory(state.inventory, newBossItem);
                log.push({ type: 'bossLoot', msg: `⚡ ${bossItem.name} obtained!` });
            }
        }
    }

    handlePlayerDeath(state, stats, zone, safeMaxHp) {
        this.callbacks.onFloatingText('DEATH!', 'death', 'player');

        // Harsh death penalty: 25% gold loss
        const goldLost = Math.floor(state.gold * 0.25);
        if (goldLost > 0) {
            state.gold -= goldLost;
            this.callbacks.onFloatingText(`-${goldLost}g`, 'goldLoss', 'player');
        }

        // Also lose some enhance stones (10%)
        const stonesLost = Math.floor(state.enhanceStone * 0.10);
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
