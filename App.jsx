import React, { useState, useCallback } from 'react';
import { GameProvider } from './game/context/GameContext';
import GameLayout from './game/ui/GameLayout';
import CharacterSelectScreen, { saveCharacterSlot } from './game/ui/CharacterSelectScreen';

// Error Boundary to catch crashes and prevent data loss
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });

        // Attempt emergency backup save
        try {
            const currentSave = localStorage.getItem('gearGrinderSave');
            if (currentSave) {
                // Create emergency backup with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                localStorage.setItem(`gearGrinderBackup_${timestamp}`, currentSave);

                // Keep only last 3 backups to avoid storage issues
                const keys = Object.keys(localStorage).filter(k => k.startsWith('gearGrinderBackup_'));
                if (keys.length > 3) {
                    keys.sort().slice(0, keys.length - 3).forEach(k => localStorage.removeItem(k));
                }

                console.log('Emergency backup created:', `gearGrinderBackup_${timestamp}`);
            }
        } catch (e) {
            console.error('Failed to create emergency backup:', e);
        }

        console.error('Game Error:', error);
        console.error('Component Stack:', errorInfo?.componentStack);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleRestoreBackup = () => {
        try {
            const backups = Object.keys(localStorage)
                .filter(k => k.startsWith('gearGrinderBackup_'))
                .sort()
                .reverse();

            if (backups.length > 0) {
                const latestBackup = localStorage.getItem(backups[0]);
                if (latestBackup) {
                    localStorage.setItem('gearGrinderSave', latestBackup);
                    window.location.reload();
                }
            }
        } catch (e) {
            console.error('Failed to restore backup:', e);
            alert('Failed to restore backup. Please try reloading the page.');
        }
    };

    render() {
        if (this.state.hasError) {
            const hasBackups = Object.keys(localStorage || {}).some(k => k.startsWith('gearGrinderBackup_'));

            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                    <div className="max-w-lg w-full bg-slate-800 rounded-xl border-2 border-red-500/50 p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Game Error</h1>
                        <p className="text-slate-400 mb-6">
                            Something went wrong. An emergency backup of your save has been created.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
                            >
                                Reload Game
                            </button>

                            {hasBackups && (
                                <button
                                    onClick={this.handleRestoreBackup}
                                    className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition-colors"
                                >
                                    Restore Last Backup
                                </button>
                            )}
                        </div>

                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-slate-500 cursor-pointer hover:text-slate-400">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-slate-900 rounded text-xs text-red-400 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('characterSelect');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    const handleSelectCharacter = useCallback((slotIndex, character) => {
        setSelectedSlot(slotIndex);
        setSelectedCharacter(character);
        setCurrentScreen('game');
    }, []);

    const handleReturnToCharacterSelect = useCallback(() => {
        setCurrentScreen('characterSelect');
        setSelectedSlot(null);
        setSelectedCharacter(null);
    }, []);

    const handleSaveCharacter = useCallback((gameState) => {
        if (selectedSlot !== null && selectedCharacter) {
            saveCharacterSlot(selectedSlot, {
                ...selectedCharacter,
                gameState,
            });
        }
    }, [selectedSlot, selectedCharacter]);

    if (currentScreen === 'characterSelect') {
        return (
            <ErrorBoundary>
                <CharacterSelectScreen onSelectCharacter={handleSelectCharacter} />
            </ErrorBoundary>
        );
    }

    return (
        <ErrorBoundary>
            <GameProvider
                initialCharacter={selectedCharacter}
                slotIndex={selectedSlot}
                onSaveCharacter={handleSaveCharacter}
                onReturnToSelect={handleReturnToCharacterSelect}
            >
                <GameLayout />
            </GameProvider>
        </ErrorBoundary>
    );
}
