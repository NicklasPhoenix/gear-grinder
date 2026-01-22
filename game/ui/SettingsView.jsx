import React, { useState, useEffect } from 'react';
import { audioManager } from '../systems/AudioManager';
import { useGame } from '../context/GameContext';
import { TIERS } from '../data/items';

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
    const { state, gameManager } = useGame();
    const [masterVolume, setMasterVolume] = useState(audioManager.masterVolume);
    const [musicVolume, setMusicVolume] = useState(audioManager.musicVolume);
    const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume);
    const [musicMuted, setMusicMuted] = useState(audioManager.musicMuted);
    const [sfxMuted, setSfxMuted] = useState(audioManager.sfxMuted);

    // Display settings
    const uiScale = state?.uiScale ?? 1.0;

    // Loot filter settings
    const autoSalvageTier = state?.autoSalvageTier ?? -1;
    const autoSalvageKeepEffects = state?.autoSalvageKeepEffects ?? true;
    const inventorySort = state?.inventorySort ?? 'none';

    // Apply UI scale using transform (handled by GameContext, but also here for immediate feedback)
    useEffect(() => {
        const gameContainer = document.getElementById('game-root');
        if (gameContainer) {
            gameContainer.style.zoom = '';
            gameContainer.style.transformOrigin = 'top left';
            gameContainer.style.transform = `scale(${uiScale})`;
            gameContainer.style.width = `${100 / uiScale}%`;
            gameContainer.style.height = `${100 / uiScale}vh`;
        }
    }, [uiScale]);

    const handleUiScaleChange = (val) => {
        gameManager?.setState(prev => ({ ...prev, uiScale: val }));
    };

    const handleAutoSalvageTierChange = (tier) => {
        gameManager?.setState(prev => ({ ...prev, autoSalvageTier: tier }));
    };

    const handleAutoSalvageKeepEffectsToggle = () => {
        gameManager?.setState(prev => ({ ...prev, autoSalvageKeepEffects: !prev.autoSalvageKeepEffects }));
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
                        {/* UI Scale */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">Aa</span>
                                    <span className="font-bold text-white">UI Scale</span>
                                </div>
                                <span className="text-sm text-slate-400">For smaller screens</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">80%</span>
                                <input
                                    type="range"
                                    min="80"
                                    max="150"
                                    step="5"
                                    value={Math.round(uiScale * 100)}
                                    onChange={(e) => handleUiScaleChange(parseInt(e.target.value) / 100)}
                                    className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((uiScale - 0.8) / 0.7) * 100}%, #334155 ${((uiScale - 0.8) / 0.7) * 100}%, #334155 100%)`
                                    }}
                                />
                                <span className="text-xs text-slate-500">150%</span>
                                <span className="w-14 text-right font-mono text-sm text-white font-bold">
                                    {Math.round(uiScale * 100)}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Increase this if text is too small on 1080p screens
                            </p>
                        </div>
                    </div>
                </div>

                {/* Loot Filter Settings */}
                <div className="game-panel">
                    <div className="game-panel-header">Loot Filter</div>
                    <div className="p-4 space-y-4">
                        {/* Auto-Salvage Tier Threshold */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="font-bold text-white">Auto-Salvage Threshold</span>
                                    <p className="text-xs text-slate-500">Automatically salvage items up to this rarity</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleAutoSalvageTierChange(-1)}
                                    className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                                        autoSalvageTier === -1
                                            ? 'bg-slate-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                >
                                    OFF
                                </button>
                                {TIERS.slice(0, 7).map((tier, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAutoSalvageTierChange(idx)}
                                        className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${
                                            autoSalvageTier === idx
                                                ? 'ring-2 ring-white'
                                                : 'hover:brightness-125'
                                        }`}
                                        style={{
                                            backgroundColor: tier.color + '40',
                                            color: tier.color,
                                        }}
                                    >
                                        {tier.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Keep Items with Effects */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-white">Keep Items with Effects</span>
                                    <p className="text-xs text-slate-500">Don't auto-salvage items that have special effects</p>
                                </div>
                                <button
                                    onClick={handleAutoSalvageKeepEffectsToggle}
                                    className={`px-4 py-2 rounded text-sm font-bold transition-all active:scale-95 ${
                                        autoSalvageKeepEffects
                                            ? 'bg-green-500/30 text-green-400 hover:bg-green-500/40'
                                            : 'bg-red-500/30 text-red-400 hover:bg-red-500/40'
                                    }`}
                                >
                                    {autoSalvageKeepEffects ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

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

                {/* Keyboard Shortcuts Hint */}
                <div className="text-center text-slate-500 text-xs">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">?</kbd> for keyboard shortcuts
                </div>
            </div>
        </div>
    );
}
