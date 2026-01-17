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
                    // TODO: Add robust migration here, for now simple merge
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
