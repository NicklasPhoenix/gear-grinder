import React, { useState, useEffect } from 'react';
import { audioManager } from '../systems/AudioManager';
import { useGame } from '../context/GameContext';

function VolumeSlider({ label, value, onChange, muted, onToggleMute, icon }) {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-slate-200">{label}</span>
                </div>
                <button
                    onClick={onToggleMute}
                    className={`px-3 py-2 rounded text-sm font-bold transition-all active:scale-95 ${
                        muted
                            ? 'bg-red-500/30 text-red-400 hover:bg-red-500/40 active:bg-red-500/50'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 active:bg-green-500/40'
                    }`}
                >
                    {muted ? 'MUTED' : 'ON'}
                </button>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(value * 100)}
                    onChange={(e) => onChange(parseInt(e.target.value) / 100)}
                    disabled={muted}
                    className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                        muted ? 'bg-slate-700' : 'bg-slate-600'
                    }`}
                    style={{
                        background: muted
                            ? '#334155'
                            : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value * 100}%, #334155 ${value * 100}%, #334155 100%)`
                    }}
                />
                <span className={`w-12 text-right font-mono text-sm ${muted ? 'text-slate-600' : 'text-slate-300'}`}>
                    {Math.round(value * 100)}%
                </span>
            </div>
        </div>
    );
}

export default function SettingsView() {
    const { state, gameManager, onReturnToSelect } = useGame();
    const [masterVolume, setMasterVolume] = useState(audioManager.masterVolume);
    const [musicVolume, setMusicVolume] = useState(audioManager.musicVolume);
    const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume);
    const [musicMuted, setMusicMuted] = useState(audioManager.musicMuted);
    const [sfxMuted, setSfxMuted] = useState(audioManager.sfxMuted);

    // Display settings
    const textSize = state?.textSize ?? 'normal';

    // Inventory settings
    const inventorySort = state?.inventorySort ?? 'none';

    // Apply text size to body element
    useEffect(() => {
        if (textSize === 'normal') {
            document.body.removeAttribute('data-text-size');
        } else {
            document.body.setAttribute('data-text-size', textSize);
        }
    }, [textSize]);

    const handleTextSizeChange = (size) => {
        gameManager?.setState(prev => ({ ...prev, textSize: size }));
    };

    const handleInventorySortChange = (sort) => {
        gameManager?.setState(prev => ({ ...prev, inventorySort: sort }));
    };

    const handleMasterChange = (val) => {
        setMasterVolume(val);
        audioManager.setMasterVolume(val);
    };

    const handleMusicChange = (val) => {
        setMusicVolume(val);
        audioManager.setMusicVolume(val);
    };

    const handleSfxChange = (val) => {
        setSfxVolume(val);
        audioManager.setSfxVolume(val);
    };

    const handleToggleMusicMute = () => {
        const newMuted = audioManager.toggleMusicMute();
        setMusicMuted(newMuted);
    };

    const handleToggleSfxMute = () => {
        const newMuted = audioManager.toggleSfxMute();
        setSfxMuted(newMuted);
    };

    const handleTestSfx = () => {
        audioManager.init();
        audioManager.playSfxLevelUp();
    };

    const handleTestMusic = () => {
        audioManager.init();
        if (audioManager.currentMusic && !audioManager.currentMusic.paused) {
            audioManager.stopMusic();
        } else {
            audioManager.playMusic('zone', 0);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-lg mx-auto w-full space-y-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">Settings</h2>
                    <p className="text-slate-500 text-sm">Adjust audio and game settings</p>
                </div>

                {/* Audio Section */}
                <div className="game-panel">
                    <div className="game-panel-header">Audio Settings</div>
                    <div className="p-4 space-y-4">
                        {/* Master Volume */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🔊</span>
                                    <span className="font-bold text-white">Master Volume</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={Math.round(masterVolume * 100)}
                                    onChange={(e) => handleMasterChange(parseInt(e.target.value) / 100)}
                                    className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${masterVolume * 100}%, #334155 ${masterVolume * 100}%, #334155 100%)`
                                    }}
                                />
                                <span className="w-12 text-right font-mono text-sm text-white font-bold">
                                    {Math.round(masterVolume * 100)}%
                                </span>
                            </div>
                        </div>

                        {/* Music Volume */}
                        <VolumeSlider
                            label="Music"
                            icon="🎵"
                            value={musicVolume}
                            onChange={handleMusicChange}
                            muted={musicMuted}
                            onToggleMute={handleToggleMusicMute}
                        />

                        {/* SFX Volume */}
                        <VolumeSlider
                            label="Sound Effects"
                            icon="🔔"
                            value={sfxVolume}
                            onChange={handleSfxChange}
                            muted={sfxMuted}
                            onToggleMute={handleToggleSfxMute}
                        />

                        {/* Test Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleTestMusic}
                                className="flex-1 py-3 bg-purple-600/30 hover:bg-purple-600/50 active:bg-purple-600/60 active:scale-95 text-purple-300 rounded-lg font-semibold transition-all"
                            >
                                {audioManager.currentMusic && !audioManager.currentMusic?.paused ? 'Stop Music' : 'Test Music'}
                            </button>
                            <button
                                onClick={handleTestSfx}
                                className="flex-1 py-3 bg-blue-600/30 hover:bg-blue-600/50 active:bg-blue-600/60 active:scale-95 text-blue-300 rounded-lg font-semibold transition-all"
                            >
                                Test SFX
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="game-panel">
                    <div className="game-panel-header">Display Settings</div>
                    <div className="p-4 space-y-4">
                        {/* Text Size */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="font-bold text-white">Text Size</span>
                                    <p className="text-xs text-slate-500">Increase text size for better readability</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'large', label: 'Large' },
                                    { id: 'xlarge', label: 'X-Large' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleTextSizeChange(opt.id)}
                                        className={`px-4 py-2 rounded text-sm font-bold transition-all ${
                                            textSize === opt.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gameplay Settings */}
                <div className="game-panel">
                    <div className="game-panel-header">Gameplay</div>
                    <div className="p-4 space-y-4">
                        {/* Pause on Level Up */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-white">Pause on Level Up</span>
                                    <p className="text-xs text-slate-500">Automatically pause combat when you level up</p>
                                </div>
                                <button
                                    onClick={() => gameManager?.setState(prev => ({
                                        ...prev,
                                        pauseOnLevelUp: !(prev.pauseOnLevelUp ?? true)
                                    }))}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${
                                        (state?.pauseOnLevelUp ?? true)
                                            ? 'bg-green-600'
                                            : 'bg-slate-700'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                            (state?.pauseOnLevelUp ?? true)
                                                ? 'translate-x-8'
                                                : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Settings */}
                <div className="game-panel">
                    <div className="game-panel-header">Inventory</div>
                    <div className="p-4 space-y-4">
                        {/* Inventory Sort */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="font-bold text-white">Inventory Sort</span>
                                    <p className="text-xs text-slate-500">How to organize inventory items</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'none', label: 'None' },
                                    { id: 'slot', label: 'By Slot' },
                                    { id: 'tier', label: 'By Rarity' },
                                    { id: 'score', label: 'By Power' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleInventorySortChange(opt.id)}
                                        className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                                            inventorySort === opt.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="game-panel">
                    <div className="game-panel-header">Credits</div>
                    <div className="p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Game</span>
                            <span className="text-slate-200">Gear Grinder</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Music</span>
                            <span className="text-slate-200">VXRGE</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Engine</span>
                            <span className="text-slate-200">React + PixiJS</span>
                        </div>
                    </div>
                </div>

                {/* Character */}
                {onReturnToSelect && (
                    <div className="game-panel">
                        <div className="game-panel-header">Character</div>
                        <div className="p-4">
                            <div className="flex items-center gap-4 mb-4">
                                {state.characterAvatar && (
                                    <img
                                        src={state.characterAvatar}
                                        alt={state.characterName}
                                        className="w-12 h-12 rounded-full border-2 border-amber-600"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                )}
                                <div>
                                    <div className="font-bold text-white">{state.characterName || 'Unknown'}</div>
                                    <div className="text-sm text-slate-400">Level {state.level}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.confirm('Switch character?\n\nYour progress will be saved.')) {
                                        onReturnToSelect();
                                    }
                                }}
                                className="w-full py-2 bg-amber-600/30 hover:bg-amber-600/50 active:bg-amber-600/60 active:scale-95 text-amber-400 rounded-lg font-bold transition-all border border-amber-600/50"
                            >
                                Switch Character
                            </button>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="game-panel border-red-900/50">
                    <div className="game-panel-header bg-red-900/30 text-red-400">Danger Zone</div>
                    <div className="p-4 space-y-4">
                        <div className="bg-red-950/30 rounded-lg p-4 border border-red-900/50">
                            <div className="mb-3">
                                <span className="font-bold text-red-400">Reset Game</span>
                                <p className="text-xs text-slate-500 mt-1">
                                    Permanently delete ALL progress and start fresh. This cannot be undone!
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (window.confirm('RESET GAME?\n\nThis will DELETE ALL your progress:\n• Level & Stats\n• Gear & Inventory\n• Silver & Materials\n• Prestige & Skills\n• Achievements\n\nThis CANNOT be undone!\n\nAre you absolutely sure?')) {
                                        if (window.confirm('FINAL WARNING!\n\nYou are about to lose EVERYTHING.\n\nType "RESET" in the next prompt to confirm.') &&
                                            window.prompt('Type RESET to confirm:')?.toUpperCase() === 'RESET') {
                                            gameManager?.resetGame();
                                        }
                                    }
                                }}
                                className="w-full py-3 bg-red-600/30 hover:bg-red-600/50 active:bg-red-600/60 active:scale-95 text-red-400 rounded-lg font-bold transition-all border border-red-600/50"
                            >
                                Reset Game
                            </button>
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts Hint - hide on mobile */}
                <div className="text-center text-slate-500 text-xs hidden sm:block">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">?</kbd> for keyboard shortcuts
                </div>
            </div>
        </div>
    );
}
