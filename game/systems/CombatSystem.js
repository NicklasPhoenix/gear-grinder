import { getZoneById } from '../data/zones';
import { BOSS_SETS, PRESTIGE_BOSS_SETS, MATERIALS } from '../data/items';
import { SKILLS } from '../data/skills';
import { calculatePlayerStats } from './PlayerSystem';

export class CombatSystem {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.callbacks = {
            onFloatingText: () => { },
            onLootDrop: () => { },
        };
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    tick(deltaTime) {
        const state = this.stateManager.getState();
        const stats = calculatePlayerStats(state);

        // Calculate tick speed based on stats (same as original logic)
        // Original: baseTickSpeed = max(200, 1000 - (stats.speedMult - 1) * 500)
        // This runs logic every X ms. 
        // In a frame-based loop, we should accumulate time.

        // However, to keep it simple for this refactor phase, we will just call this 'tick' method 
        // when the accumulated time exceeds the tick speed in the main loop.

        const zone = getZoneById(state.currentZone);
        let newState = { ...state };
        let log = [...state.combatLog].slice(-4);
        let combatUpdates = {}; // Track what happened for visuals

        // Player Turn
        let playerDmg = stats.damage;
        let isCrit = Math.random() * 100 < stats.critChance;
        if (isCrit) playerDmg = Math.floor(playerDmg * stats.critDamage / 100);

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
            const healed = Math.min(rawHeal, stats.lifestealMaxHeal);
            newState.playerHp = Math.min(newState.playerHp + healed, stats.maxHp);

            if (healed > 0) {
                this.callbacks.onFloatingText(`+${healed}`, 'heal', 'player');
                combatUpdates.lastHeal = healed;
            }
        }

        // Check Enemy Death
        if (newState.enemyHp <= 0) {
            this.handleEnemyDeath(newState, stats, zone, log);
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
                this.handlePlayerDeath(newState, stats, zone);
            }
        }

        newState.combatLog = log;
        newState.playerMaxHp = stats.maxHp; // Sync max HP

        this.stateManager.setState(newState);
        return combatUpdates;
    }

    handleEnemyDeath(state, stats, zone, log) {
        const goldEarned = Math.floor((zone.goldMin + Math.random() * (zone.goldMax - zone.goldMin)) * stats.goldMult);
        const xpEarned = Math.floor(zone.enemyHp / 2 * (1 + stats.xpBonus / 100));
        const drops = zone.drops;
        const zoneBonus = Math.floor(state.currentZone / 2) + 1;

        // Roll Drops
        const oreDropped = Math.random() < drops.ore * stats.matMult ? Math.ceil(Math.random() * zoneBonus) : 0;
        const leatherDropped = Math.random() < drops.leather * stats.matMult ? Math.ceil(Math.random() * zoneBonus) : 0;
        const enhanceStoneDropped = Math.random() < drops.enhanceStone ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 2)) : 0;
        const blessedOrbDropped = Math.random() < drops.blessedOrb ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 3)) : 0;
        const celestialShardDropped = Math.random() < drops.celestialShard ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 4)) : 0;
        const prestigeStoneDropped = drops.prestigeStone && Math.random() < drops.prestigeStone ? Math.ceil(Math.random() * 2) : 0;

        // Update State
        state.gold += goldEarned;
        state.totalGold += goldEarned;
        state.ore += oreDropped;
        state.leather += leatherDropped;
        state.enhanceStone += enhanceStoneDropped;
        state.blessedOrb += blessedOrbDropped;
        state.celestialShard += celestialShardDropped;
        state.prestigeStones += prestigeStoneDropped;
        state.xp += xpEarned;
        state.kills += 1;

        // Zone Kills
        state.zoneKills = { ...state.zoneKills };
        state.zoneKills[state.currentZone] = (state.zoneKills[state.currentZone] || 0) + 1;

        // Boss Loot
        if (zone.isBoss && zone.bossSet) {
            this.handleBossLoot(state, zone, log);
        }

        // Visuals
        const lootItems = [];
        lootItems.push({ text: `+${goldEarned}g`, color: '#fbbf24' });
        lootItems.push({ text: `+${xpEarned}xp`, color: '#a855f7' });
        if (oreDropped) lootItems.push({ text: `+${oreDropped}${MATERIALS.ore.icon}`, color: MATERIALS.ore.color });
        if (leatherDropped) lootItems.push({ text: `+${leatherDropped}${MATERIALS.leather.icon}`, color: MATERIALS.leather.color });
        if (enhanceStoneDropped) lootItems.push({ text: `+${enhanceStoneDropped}${MATERIALS.enhanceStone.icon}`, color: MATERIALS.enhanceStone.color });
        if (blessedOrbDropped) lootItems.push({ text: `+${blessedOrbDropped}${MATERIALS.blessedOrb.icon}`, color: MATERIALS.blessedOrb.color });
        if (celestialShardDropped) lootItems.push({ text: `+${celestialShardDropped}${MATERIALS.celestialShard.icon}`, color: MATERIALS.celestialShard.color });

        this.callbacks.onLootDrop(lootItems);

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

        // Heal Player (3% rule)
        state.playerHp = Math.min(state.playerHp + Math.floor(stats.maxHp * 0.03), stats.maxHp);
    }

    handleBossLoot(state, zone, log) {
        const bossSet = BOSS_SETS[zone.bossSet] || PRESTIGE_BOSS_SETS[zone.bossSet];
        const dropChance = 0.20;
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
                weaponType: droppedSlot === 'weapon' ? 'sword' : null,
            };
            state.inventory = [...state.inventory, newBossItem];
            log.push({ type: 'bossLoot', msg: `⚡ ${bossItem.name} obtained!` });
        }
    }

    handlePlayerDeath(state, stats, zone) {
        this.callbacks.onFloatingText('DEATH!', 'death', 'player');
        const goldLost = Math.floor(state.gold * 0.1);
        if (goldLost > 0) {
            state.gold -= goldLost;
            this.callbacks.onFloatingText(`-${goldLost}g`, 'goldLoss', 'player');
        }
        state.playerHp = stats.maxHp;
        state.enemyHp = zone.enemyHp;
        state.enemyMaxHp = zone.enemyHp;
    }
}
