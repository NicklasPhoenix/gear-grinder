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
        // Return serialized state for the context to handle, or handle internal if we pass storage ref.
        // For now, let's just return the object and let context save it.
        return JSON.stringify(this.state);
    }

    processOfflineProgress(savedState) {
        if (!savedState.lastSaveTime) return null;

        const now = Date.now();
        const diff = now - savedState.lastSaveTime;
        const secondsOffline = Math.floor(diff / 1000);

        if (secondsOffline < 5) return null; // Reduced to 5s for easier testing

        // Simulate progress
        // Simple heuristic: 1 kill every 3 seconds if player is alive
        const stats = calculatePlayerStats(savedState);
        const zone = savedState.currentZone;

        // Assume survival if stats are decent (simple check)
        const kills = Math.floor(secondsOffline / 3);
        const goldGain = kills * (10 + zone * 5); // Rough formula matching Zone 0-1
        const xpGain = kills * (20 + zone * 10);

        // Apply
        this.state.gold += goldGain;
        this.state.xp += xpGain;
        this.state.totalGold += goldGain;

        // Check level up from bulk XP
        // (Simplified, actual level up logic is in CombatSystem but we can just let it carry over)

        // Notify
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

        // Tick Logic
        // Adjust tick speed based on stats
        const stats = calculatePlayerStats(this.state);
        const baseTickSpeed = Math.max(200, 1000 - (stats.speedMult - 1) * 500);
        const tickSpeed = Math.max(40, baseTickSpeed / this.gameSpeed);

        this.accumulatedTime += deltaTime;

        // Cap accumulation to prevent death spirals if tab was inactive (browser throttling)
        if (this.accumulatedTime > 1000) this.accumulatedTime = 1000;

        while (this.accumulatedTime >= tickSpeed) {
            this.combatSystem.tick(tickSpeed);
            this.accumulatedTime -= tickSpeed;
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
}
