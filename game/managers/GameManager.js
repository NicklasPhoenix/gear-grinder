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

        setTimeout(() => {
            this.emit('floatingText', { x: 400, y: 150, text: `WELCOME BACK!`, color: '#ffffff' });
            this.emit('floatingText', { x: 400, y: 200, text: `OFFLINE: +${goldGain} Gold`, color: '#fbbf24' });
            this.emit('floatingText', { x: 400, y: 230, text: `+${kills} Kills`, color: '#ef4444' });
        }, 1500);

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
            this.combatSystem.tick(tickSpeed);
            this.accumulatedTime -= tickSpeed;
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    performPrestige() {
        const lastBossZone = 20; // Eternal One
        const hasBeatenLastBoss = (this.state.zoneKills[lastBossZone] || 0) >= 1;
        if (!hasBeatenLastBoss) return;

        // Calculate starting bonus from prestige skills
        const startingBonusLevel = this.state.prestigeSkills?.[8] || 0;
        const startGold = 50 + startingBonusLevel * 50;
        const startOre = 5 + startingBonusLevel * 10;
        const startLeather = 5 + startingBonusLevel * 10;

        this.setState(prev => ({
            ...prev,
            gold: startGold,
            ore: startOre,
            leather: startLeather,
            enhanceStone: 3,
            blessedOrb: 0,
            celestialShard: 0,
            level: 1,
            xp: 0,
            currentZone: 0,
            stats: { str: 5, int: 5, vit: 5, agi: 5, lck: 5 },
            statPoints: 0,
            gear: { weapon: null, helmet: null, armor: null, boots: null, accessory: null, shield: null, gloves: null, amulet: null },
            inventory: [],
            unlockedSkills: [],
            enemyHp: 20,
            enemyMaxHp: 20,
            playerHp: 100,
            playerMaxHp: 100,
            kills: 0,
            zoneKills: {},
            prestigeLevel: (prev.prestigeLevel || 0) + 1,
            prestigeStones: (prev.prestigeStones || 0) + 10,
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
}
