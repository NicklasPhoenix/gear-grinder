import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GameManager } from '../managers/GameManager';
import { SAVE, DEFAULTS } from '../data/constants';

const GameContext = createContext(null);

// Separate context for high-frequency updates (HP bars) to prevent full tree re-renders
const HighFrequencyContext = createContext(null);

// Validate and sanitize a loaded save to prevent crashes
function validateSave(parsed) {
    const errors = [];
    const defaults = {
        stats: { ...DEFAULTS.BASE_STATS },
        playerHp: DEFAULTS.PLAYER_HP,
        playerMaxHp: DEFAULTS.PLAYER_MAX_HP,
        enemyHp: DEFAULTS.ENEMY_HP,
        enemyMaxHp: DEFAULTS.ENEMY_MAX_HP,
        gold: DEFAULTS.GOLD,
        xp: DEFAULTS.XP,
        level: DEFAULTS.LEVEL,
        kills: DEFAULTS.KILLS,
        currentZone: DEFAULTS.CURRENT_ZONE,
        statPoints: DEFAULTS.STAT_POINTS,
        enhanceStone: 0,
        blessedOrb: 0,
        celestialShard: 0,
        prestigeLevel: 0,
        prestigeStones: 0,
        inventory: [],
        gear: {},
        skills: [],
        unlockedSkills: [],
    };

    // Check save version for migrations
    if (!parsed.saveVersion) {
        parsed.saveVersion = SAVE.SAVE_VERSION;
    }

    // Validate stats object
    if (!parsed.stats || typeof parsed.stats !== 'object') {
        errors.push('Invalid stats object, resetting to defaults');
        parsed.stats = { ...defaults.stats };
    } else {
        for (const [key, defaultVal] of Object.entries(defaults.stats)) {
            if (typeof parsed.stats[key] !== 'number' || isNaN(parsed.stats[key]) || parsed.stats[key] < 0) {
                errors.push(`Invalid stat ${key}, resetting to ${defaultVal}`);
                parsed.stats[key] = defaultVal;
            }
        }
    }

    // Validate numeric fields
    const numericFields = [
        'playerHp', 'playerMaxHp', 'enemyHp', 'enemyMaxHp',
        'gold', 'xp', 'level', 'kills', 'currentZone', 'statPoints',
        'enhanceStone', 'blessedOrb', 'celestialShard', 'prestigeLevel', 'prestigeStones'
    ];

    for (const field of numericFields) {
        if (typeof parsed[field] !== 'number' || isNaN(parsed[field])) {
            errors.push(`Invalid ${field}, resetting to default`);
            parsed[field] = defaults[field];
        }
        // Ensure non-negative values
        if (parsed[field] < 0) {
            parsed[field] = 0;
        }
    }

    // Ensure level is at least 1
    if (parsed.level < 1) parsed.level = 1;

    // Ensure HP doesn't exceed max
    if (parsed.playerHp > parsed.playerMaxHp) {
        parsed.playerHp = parsed.playerMaxHp;
    }
    if (parsed.enemyHp > parsed.enemyMaxHp) {
        parsed.enemyHp = parsed.enemyMaxHp;
    }

    // Validate inventory is an array
    if (!Array.isArray(parsed.inventory)) {
        errors.push('Invalid inventory, resetting to empty');
        parsed.inventory = [];
    } else {
        // Filter out invalid items
        parsed.inventory = parsed.inventory.filter(item =>
            item && typeof item === 'object' && item.slot && item.name
        );
    }

    // Validate gear is an object
    if (!parsed.gear || typeof parsed.gear !== 'object') {
        errors.push('Invalid gear, resetting to empty');
        parsed.gear = {};
    }

    // Validate skills arrays
    if (!Array.isArray(parsed.skills)) parsed.skills = [];
    if (!Array.isArray(parsed.unlockedSkills)) parsed.unlockedSkills = [];

    // Log validation errors (but don't crash)
    if (errors.length > 0) {
        console.warn('Save validation found issues:', errors);
    }

    return { validated: parsed, errors };
}

export function GameProvider({ children }) {
    const gameManagerRef = useRef(null);
    const [gameState, setGameState] = useState(null);

    // High-frequency state (HP values) - updated separately to prevent full tree re-renders
    const [hpState, setHpState] = useState({ playerHp: 100, playerMaxHp: 100, enemyHp: 20, enemyMaxHp: 20 });

    // Track last state snapshot for comparison
    const lastStateRef = useRef(null);

    useEffect(() => {
        // Initialize Game Manager once
        const gm = new GameManager();
        gameManagerRef.current = gm;

        // Load saved game (if any)
        const loadGame = async () => {
            try {
                const saved = await window.storage.get('gear-grinder-save');
                if (saved && saved.value) {
                    let parsed;
                    try {
                        parsed = JSON.parse(saved.value);
                    } catch (parseError) {
                        console.error('Save file corrupted, starting fresh:', parseError);
                        parsed = null;
                    }

                    if (parsed) {
                        // Validate and sanitize the loaded save
                        const { validated, errors } = validateSave(parsed);

                        if (errors.length > 0) {
                            console.warn(`Save loaded with ${errors.length} corrections applied`);
                        }

                        // Merge with default state
                        gm.state = { ...gm.state, ...validated, combatLog: [], saveVersion: SAVE.SAVE_VERSION };
                    }
                }
            } catch (e) {
                console.error("Save load error, starting fresh:", e);
            }

            // Subscribe React state to Game Manager state
            const initialState = gm.getState();
            setGameState(initialState);
            setHpState({
                playerHp: initialState.playerHp,
                playerMaxHp: initialState.playerMaxHp,
                enemyHp: initialState.enemyHp,
                enemyMaxHp: initialState.enemyMaxHp
            });
            lastStateRef.current = initialState;

            gm.subscribe((newState) => {
                const lastState = lastStateRef.current;

                // Check if only HP changed (high-frequency updates)
                const hpChanged =
                    newState.playerHp !== lastState?.playerHp ||
                    newState.playerMaxHp !== lastState?.playerMaxHp ||
                    newState.enemyHp !== lastState?.enemyHp ||
                    newState.enemyMaxHp !== lastState?.enemyMaxHp;

                // Check if other important state changed (low-frequency updates)
                const otherChanged =
                    newState.gold !== lastState?.gold ||
                    newState.xp !== lastState?.xp ||
                    newState.level !== lastState?.level ||
                    newState.currentZone !== lastState?.currentZone ||
                    newState.kills !== lastState?.kills ||
                    newState.inventory !== lastState?.inventory ||
                    newState.gear !== lastState?.gear ||
                    newState.stats !== lastState?.stats ||
                    newState.statPoints !== lastState?.statPoints ||
                    newState.enhanceStone !== lastState?.enhanceStone ||
                    newState.blessedOrb !== lastState?.blessedOrb ||
                    newState.celestialShard !== lastState?.celestialShard ||
                    newState.prestigeLevel !== lastState?.prestigeLevel ||
                    newState.prestigeStones !== lastState?.prestigeStones ||
                    newState.autoSalvage !== lastState?.autoSalvage ||
                    newState.unlockedAchievements !== lastState?.unlockedAchievements;

                // Only update HP state for high-frequency changes (doesn't trigger full re-render)
                if (hpChanged) {
                    setHpState({
                        playerHp: newState.playerHp,
                        playerMaxHp: newState.playerMaxHp,
                        enemyHp: newState.enemyHp,
                        enemyMaxHp: newState.enemyMaxHp
                    });
                }

                // Only update full state when important things change
                if (otherChanged) {
                    setGameState({ ...newState });
                }

                lastStateRef.current = newState;
            });

            // Process Offline
            gm.processOfflineProgress(gm.state);

            // Start the loop
            gm.start();
        };

        const saveGame = async () => {
            if (!gameManagerRef.current) return;
            const data = await gameManagerRef.current.save();
            await window.storage.set('gear-grinder-save', data);
        };

        loadGame();

        // Auto Save Interval (30s)
        const saveInterval = setInterval(saveGame, SAVE.AUTO_SAVE_INTERVAL);

        return () => {
            clearInterval(saveInterval);
            saveGame(); // Save on unmount
            gm.stop();
        };
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        gameManager: gameManagerRef.current,
        state: gameState
    }), [gameState]);

    if (!gameState || !gameManagerRef.current) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
                <div className="text-xl animate-pulse">LOADING GAME ASSETS...</div>
            </div>
        );
    }

    return (
        <HighFrequencyContext.Provider value={hpState}>
            <GameContext.Provider value={contextValue}>
                {children}
            </GameContext.Provider>
        </HighFrequencyContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within GameProvider');
    return context;
};

// Hook for high-frequency HP updates (doesn't trigger full tree re-render)
export const useHpState = () => {
    const hpState = useContext(HighFrequencyContext);
    if (!hpState) throw new Error('useHpState must be used within GameProvider');
    return hpState;
};

// Hook for selecting specific state values (only re-renders when selected value changes)
export const useGameSelector = (selector) => {
    const { state } = useGame();
    const selectedValue = useMemo(() => selector(state), [state, selector]);
    return selectedValue;
};
