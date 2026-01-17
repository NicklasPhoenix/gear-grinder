import React from 'react';
import { GameProvider } from './game/context/GameContext';
import GameLayout from './game/ui/GameLayout';

export default function App() {
    return (
        <GameProvider>
            <GameLayout />
        </GameProvider>
    );
}
