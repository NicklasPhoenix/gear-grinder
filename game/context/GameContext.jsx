import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GameManager } from '../managers/GameManager';

const GameContext = createContext(null);

// Separate context for high-frequency updates (HP bars) to prevent full tree re-renders
const HighFrequencyContext = createContext(null);

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
                    const parsed = JSON.parse(saved.value);
                    // Sanitize stats object - ensure all stat values are valid numbers
                    if (!parsed.stats || typeof parsed.stats !== 'object') {
                        parsed.stats = { str: 5, int: 5, vit: 5, agi: 5, lck: 5 };
                    } else {
                        const defaultStats = { str: 5, int: 5, vit: 5, agi: 5, lck: 5 };
                        for (const stat of Object.keys(defaultStats)) {
                            if (typeof parsed.stats[stat] !== 'number' || isNaN(parsed.stats[stat])) {
                                parsed.stats[stat] = defaultStats[stat];
                            }
                        }
                    }
                    // Sanitize numeric values that might be NaN
                    if (typeof parsed.playerHp !== 'number' || isNaN(parsed.playerHp)) {
                        parsed.playerHp = parsed.playerMaxHp || 100;
                    }
                    if (typeof parsed.enemyHp !== 'number' || isNaN(parsed.enemyHp)) {
                        parsed.enemyHp = parsed.enemyMaxHp || 20;
                    }
                    if (typeof parsed.gold !== 'number' || isNaN(parsed.gold)) parsed.gold = 0;
                    if (typeof parsed.xp !== 'number' || isNaN(parsed.xp)) parsed.xp = 0;
                    if (typeof parsed.level !== 'number' || isNaN(parsed.level)) parsed.level = 1;
                    // Merge with default state
                    gm.state = { ...gm.state, ...parsed, combatLog: [] };
                }
            } catch (e) {
                console.error("Save load error", e);
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
                    newState.prestigeStones !== lastState?.prestigeStones;

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
            const offlineReport = gm.processOfflineProgress(gm.state);
            if (offlineReport) {
                console.log("Offline Progress:", offlineReport);
            }

            // Start the loop
            gm.start();
        };

        const saveGame = async () => {
            if (!gameManagerRef.current) return;
            const data = await gameManagerRef.current.save();
            await window.storage.set('gear-grinder-save', data);
            console.log("Game Saved");
        };

        loadGame();

        // Auto Save Interval (30s)
        const saveInterval = setInterval(saveGame, 30000);

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
