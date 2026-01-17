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

        while (this.accumulatedTime >= tickSpeed) {
            this.combatSystem.tick(tickSpeed);
            this.accumulatedTime -= tickSpeed;
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
}
