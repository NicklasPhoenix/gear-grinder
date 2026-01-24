import { initialState } from '../data/initialState';
import { CombatSystem } from '../systems/CombatSystem';
import { calculatePlayerStats } from '../systems/PlayerSystem';

export class GameManager {
    constructor() {
        this.state = JSON.parse(JSON.stringify(initialState));
        this.combatSystem = new CombatSystem(this);
        this.listeners = new Set();

        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;

        this.gameSpeed = 1;
        this.speedListeners = new Set();
    }

    // --- Speed Control ---
    setSpeed(speed) {
        this.gameSpeed = speed;
        for (const listener of this.speedListeners) {
            listener(speed);
        }
    }

    subscribeSpeed(listener) {
        this.speedListeners.add(listener);
        listener(this.gameSpeed);
        return () => this.speedListeners.delete(listener);
    }

    // --- Combat Pause Control ---
    toggleCombat() {
        this.setState(prev => ({
            ...prev,
            combatPaused: !prev.combatPaused
        }));
    }

    setCombatPaused(paused) {
        this.setState(prev => ({
            ...prev,
            combatPaused: paused
        }));
    }

    // --- State Management ---
    getState() {
        return this.state;
    }

    setState(newStateOrUpdater) {
        if (typeof newStateOrUpdater === 'function') {
            this.state = newStateOrUpdater(this.state);
        } else {
            this.state = newStateOrUpdater;
        }
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    // --- Event System (One-shot events) ---
    on(event, handler) {
        if (!this.eventHandlers) this.eventHandlers = {};
        if (!this.eventHandlers[event]) this.eventHandlers[event] = new Set();
        this.eventHandlers[event].add(handler);
        return () => this.eventHandlers[event].delete(handler);
    }

    emit(event, data) {
        if (!this.eventHandlers || !this.eventHandlers[event]) return;
        for (const handler of this.eventHandlers[event]) {
            handler(data);
        }
    }

    // --- Game Loop ---
    start() {
        // Hook up combat system callbacks to emit events
        this.combatSystem.setCallbacks({
            onFloatingText: (text, type, target) => this.emit('floatingText', { text, type, target }),
            onLootDrop: (items) => this.emit('lootDrop', { items }),
            onEnemyDeath: (isBoss) => this.emit('enemyDeath', { isBoss }),
        });

        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    // --- Persistence & Offline Progress ---
    async save() {
        this.state.lastSaveTime = Date.now();
        this.emit('floatingText', { x: 100, y: 50, text: "Game Saved", color: "#64748b" }); // Visual feedback
        return JSON.stringify(this.state);
    }

    processOfflineProgress(savedState) {
        if (!savedState.lastSaveTime) return null;

        const now = Date.now();
        const diff = now - savedState.lastSaveTime;
        const secondsOffline = Math.floor(diff / 1000);

        if (secondsOffline < 5) return null;

        const stats = calculatePlayerStats(savedState);
        const zone = savedState.currentZone;

        const kills = Math.floor(secondsOffline / 3);
        const goldGain = kills * (10 + zone * 5);
        const xpGain = kills * (20 + zone * 10);

        this.state.gold += goldGain;
        this.state.xp += xpGain;
        this.state.totalGold += goldGain;

        // Return rewards for modal display (floating text removed in favor of modal)
        return { time: secondsOffline, kills, gold: goldGain, xp: xpGain };
    }

    gameLoop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        const stats = calculatePlayerStats(this.state);
        const baseTickSpeed = Math.max(200, 1000 - (stats.speedMult - 1) * 500);
        const tickSpeed = Math.max(40, baseTickSpeed / this.gameSpeed);

        this.accumulatedTime += deltaTime;

        if (this.accumulatedTime > 1000) this.accumulatedTime = 1000;

        while (this.accumulatedTime >= tickSpeed) {
            // Only run combat if not paused
            if (!this.state.combatPaused) {
                this.combatSystem.tick(tickSpeed);
            }
            this.accumulatedTime -= tickSpeed;
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    performPrestige() {
        const lastBossZone = 39; // Dark Wolf King - final boss before prestige zones
        const hasBeatenLastBoss = (this.state.zoneKills[lastBossZone] || 0) >= 1;
        if (!hasBeatenLastBoss) return;

        // Calculate starting bonus from prestige skills
        const startingBonusLevel = this.state.prestigeSkills?.[8] || 0;
        const startGold = 50 + startingBonusLevel * 50;

        // Calculate prestige stone reward based on level: 10 base + level/2
        const stoneReward = 10 + Math.floor(this.state.level / 2);

        // Preserve achievement stat points - these are permanent rewards
        const achievementStatPoints = this.state.achievementStatPoints || 0;

        this.setState(prev => ({
            ...prev,
            gold: startGold,
            enhanceStone: 3,
            blessedOrb: 0,
            celestialShard: 0,
            level: 1,
            xp: 0,
            currentZone: 0,
            stats: { str: 5, int: 5, vit: 5, agi: 5, lck: 5 },
            statPoints: achievementStatPoints, // Re-grant achievement stat points
            achievementStatPoints: achievementStatPoints, // Preserve the tracking value
            gear: { weapon: null, helmet: null, armor: null, boots: null, belt: null, shield: null, gloves: null, amulet: null },
            inventory: [],
            unlockedSkills: [],
            enemyHp: 20,
            enemyMaxHp: 20,
            playerHp: 100,
            playerMaxHp: 100,
            kills: 0,
            zoneKills: {},
            prestigeLevel: (prev.prestigeLevel || 0) + 1,
            prestigeStones: (prev.prestigeStones || 0) + stoneReward,
            prestigeSkills: prev.prestigeSkills || {},
            totalPrestiges: (prev.totalPrestiges || 0) + 1,
        }));

        this.emit('floatingText', { text: "ASCENDED!", type: "levelup", target: "player" });
    }

    upgradePrestigeSkill(skillId, cost) {
        if (this.state.prestigeStones < cost) return;

        this.setState(prev => ({
            ...prev,
            prestigeStones: prev.prestigeStones - cost,
            prestigeSkills: {
                ...prev.prestigeSkills,
                [skillId]: (prev.prestigeSkills[skillId] || 0) + 1
            }
        }));
    }

    // Full reset for testing - no rewards, fresh start
    resetGame() {
        this.setState(JSON.parse(JSON.stringify(initialState)));
        this.emit('floatingText', { text: "GAME RESET", type: "death", target: "player" });
    }

    // --- Endless Mode ---
    startEndlessMode() {
        this.setState(prev => {
            const newState = { ...prev };
            this.combatSystem.startEndless(newState);
            return newState;
        });
        this.emit('floatingText', { text: "ENDLESS MODE!", type: "milestone", target: "player" });
    }

    endEndlessMode() {
        // This is called from CombatSystem on player death, but can also be called manually
        if (!this.state.endlessActive) return;

        this.setState(prev => {
            const newState = { ...prev };
            // Import and call endEndlessRun
            const { endEndlessRun } = require('../data/endlessMode');
            endEndlessRun(newState);
            return newState;
        });
        this.emit('floatingText', { text: "RUN ENDED", type: "death", target: "player" });
    }

    // Admin cheat for testing - gives tons of resources
    cheat() {
        this.setState(prev => {
            // Add 99 of each boss stone
            const bossStones = { ...prev.bossStones };
            const bossStoneKeys = ['crow', 'cerberus', 'demon', 'spider', 'shadow', 'abyss', 'behemoth', 'darkwolf', 'tyrant', 'inferno', 'scorpion'];
            for (const key of bossStoneKeys) {
                bossStones[key] = (bossStones[key] || 0) + 99;
            }

            return {
                ...prev,
                gold: prev.gold + 9999999,
                enhanceStone: prev.enhanceStone + 99999,
                blessedOrb: prev.blessedOrb + 9999,
                celestialShard: prev.celestialShard + 999,
                prestigeStones: prev.prestigeStones + 999,
                statPoints: prev.statPoints + 500,
                level: Math.max(prev.level, 100),
                bossStones,
            };
        });
        console.log('🎮 CHEAT ACTIVATED: +9.9M gold, +99K enhance stones, +9K orbs, +999 shards, +999 prestige stones, +500 stat points, +99 each boss stone, level 100');
        this.emit('floatingText', { text: "CHEATS ON!", type: "levelup", target: "player" });
    }
}
