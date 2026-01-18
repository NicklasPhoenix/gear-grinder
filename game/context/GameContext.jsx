import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GameManager } from '../managers/GameManager';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const gameManagerRef = useRef(null);
    const [gameState, setGameState] = useState(null);

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
            setGameState(gm.getState());
            gm.subscribe((newState) => {
                // We use a strict copy or just pass the reference if we are careful.
                // For distinct updates, we normally clone. But GameManager might mutate deep props.
                // Let's force a shallow clone to trigger React renders.
                setGameState({ ...newState });
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

    if (!gameState || !gameManagerRef.current) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
                <div className="text-xl animate-pulse">LOADING GAME ASSETS...</div>
            </div>
        );
    }

    return (
        <GameContext.Provider value={{ gameManager: gameManagerRef.current, state: gameState }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within GameProvider');
    return context;
};
