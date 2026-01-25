import React, { useState, useEffect } from 'react';

// Character classes with their portraits and descriptions
const CHARACTER_CLASSES = [
    {
        id: 'knight',
        name: 'Knight',
        portrait: '/assets/portraits/knight.png',
        description: 'A sturdy warrior with balanced stats.',
    },
    {
        id: 'rogue',
        name: 'Rogue',
        portrait: '/assets/portraits/rogue.png',
        description: 'A swift assassin with deadly precision.',
    },
    {
        id: 'mage',
        name: 'Mage',
        portrait: '/assets/portraits/mage.png',
        description: 'A powerful spellcaster with arcane might.',
    },
];

// Generate list of available avatars
const AVATAR_COUNT = 48;
const AVATARS = Array.from({ length: AVATAR_COUNT }, (_, i) => `/assets/avatars/dwarf/Icon${i + 1}.png`);

// Character slot storage keys
const SLOT_KEYS = ['gearGrinderSlot1', 'gearGrinderSlot2', 'gearGrinderSlot3'];

export function getCharacterSlots() {
    return SLOT_KEYS.map((key, index) => {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                return {
                    slot: index + 1,
                    key,
                    ...parsed,
                };
            }
        } catch (e) {
            console.error(`Failed to load slot ${index + 1}:`, e);
        }
        return { slot: index + 1, key, empty: true };
    });
}

export function saveCharacterSlot(slotIndex, data) {
    const key = SLOT_KEYS[slotIndex];
    localStorage.setItem(key, JSON.stringify({
        ...data,
        lastPlayed: Date.now(),
    }));
}

export function deleteCharacterSlot(slotIndex) {
    const key = SLOT_KEYS[slotIndex];
    localStorage.removeItem(key);
}

export function loadCharacterData(slotIndex) {
    const key = SLOT_KEYS[slotIndex];
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error(`Failed to load character from slot ${slotIndex + 1}:`, e);
        return null;
    }
}

export default function CharacterSelectScreen({ onSelectCharacter }) {
    const [slots, setSlots] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [createSlot, setCreateSlot] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(0);
    const [selectedClass, setSelectedClass] = useState(0);
    const [characterName, setCharacterName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        setSlots(getCharacterSlots());
    }, []);

    const handleCreateNew = (slotIndex) => {
        setCreateSlot(slotIndex);
        setSelectedAvatar(Math.floor(Math.random() * AVATAR_COUNT));
        setSelectedClass(0);
        setCharacterName('');
        setShowCreate(true);
    };

    const handleConfirmCreate = () => {
        if (!characterName.trim()) return;

        const charClass = CHARACTER_CLASSES[selectedClass];
        const newCharacter = {
            name: characterName.trim(),
            avatar: AVATARS[selectedAvatar],
            avatarIndex: selectedAvatar,
            characterClass: charClass.id,
            createdAt: Date.now(),
            gameState: null, // Will be populated with initial state when game starts
        };

        saveCharacterSlot(createSlot, newCharacter);
        setSlots(getCharacterSlots());
        setShowCreate(false);

        // Start game with new character
        onSelectCharacter(createSlot, newCharacter);
    };

    const handleSelectCharacter = (slotIndex, character) => {
        onSelectCharacter(slotIndex, character);
    };

    const handleDeleteCharacter = (slotIndex) => {
        deleteCharacterSlot(slotIndex);
        setSlots(getCharacterSlots());
        setConfirmDelete(null);
    };

    const _formatPlayTime = (ms) => {
        if (!ms) return '0h';
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            {/* Background image */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'url(/assets/backgrounds/fight_forest_1.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.4)',
                }}
            />

            <div className="relative z-10 max-w-4xl w-full">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-amber-400 mb-2" style={{ textShadow: '2px 2px 4px #000' }}>
                        Gear Grinder
                    </h1>
                    <p className="text-amber-200/60">Select your hero</p>
                </div>

                {/* Character Slots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {slots.map((slot, index) => (
                        <div
                            key={index}
                            className="relative"
                        >
                            {/* Wooden panel background */}
                            <img
                                src="/assets/ui-elements/8.png"
                                alt=""
                                className="w-full h-auto"
                                style={{ imageRendering: 'pixelated' }}
                            />

                            {/* Content overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-[30%] pb-[15%]">
                                {slot.empty ? (
                                    /* Empty slot */
                                    <button
                                        onClick={() => handleCreateNew(index)}
                                        className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-amber-600/50 flex items-center justify-center">
                                            <span className="text-3xl text-amber-600/50">+</span>
                                        </div>
                                        <span className="text-amber-200/80 font-semibold" style={{ textShadow: '1px 1px 2px #000' }}>
                                            New Character
                                        </span>
                                    </button>
                                ) : (
                                    /* Character slot */
                                    <div className="flex flex-col items-center gap-2 w-full">
                                        <img
                                            src={slot.avatar}
                                            alt={slot.name}
                                            className="w-16 h-16 rounded-full border-2 border-amber-600"
                                            style={{ imageRendering: 'pixelated' }}
                                        />
                                        <span className="text-amber-100 font-bold text-lg" style={{ textShadow: '1px 1px 2px #000' }}>
                                            {slot.name}
                                        </span>
                                        <div className="text-amber-200/60 text-xs" style={{ textShadow: '1px 1px 1px #000' }}>
                                            Lv. {slot.gameState?.level || 1} {slot.characterClass ? `• ${slot.characterClass.charAt(0).toUpperCase() + slot.characterClass.slice(1)}` : '• Knight'}
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleSelectCharacter(index, slot)}
                                                className="px-4 py-1.5 bg-green-700/80 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors"
                                                style={{ textShadow: '1px 1px 1px #000' }}
                                            >
                                                Play
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(index)}
                                                className="px-3 py-1.5 bg-red-800/60 hover:bg-red-700 text-red-200 text-sm rounded transition-colors"
                                            >
                                                <img
                                                    src="/assets/ui-elements/dark_X_button.png"
                                                    alt="Delete"
                                                    className="w-4 h-4"
                                                    style={{ imageRendering: 'pixelated' }}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Version */}
                <div className="text-center mt-8 text-slate-600 text-sm">
                    v0.1.0 Alpha
                </div>
            </div>

            {/* Create Character Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative max-w-md w-full mx-4">
                        <img
                            src="/assets/ui-elements/8.png"
                            alt=""
                            className="w-full h-auto"
                            style={{ imageRendering: 'pixelated' }}
                        />

                        <div className="absolute inset-0 flex flex-col px-8 pt-[28%] pb-[10%]">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4 -mt-[5px]">
                                <h2 className="text-lg font-bold text-amber-100" style={{ textShadow: '1px 1px 2px #000' }}>
                                    Create Character
                                </h2>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <img
                                        src="/assets/ui-elements/dark_X_button.png"
                                        alt="Close"
                                        className="w-6 h-6"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                </button>
                            </div>

                            {/* Name input */}
                            <div className="mb-4">
                                <label className="block text-amber-200/80 text-sm mb-1" style={{ textShadow: '1px 1px 1px #000' }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={characterName}
                                    onChange={(e) => setCharacterName(e.target.value)}
                                    maxLength={16}
                                    className="w-full px-3 py-2 bg-slate-900/80 border-2 border-amber-800 rounded text-amber-100 focus:outline-none focus:border-amber-600"
                                    placeholder="Enter name..."
                                    autoFocus
                                />
                            </div>

                            {/* Class selection */}
                            <div className="mb-4">
                                <label className="block text-amber-200/80 text-sm mb-2" style={{ textShadow: '1px 1px 1px #000' }}>
                                    Class
                                </label>
                                <div className="flex justify-center gap-3">
                                    {CHARACTER_CLASSES.map((cls, index) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => setSelectedClass(index)}
                                            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                                                selectedClass === index
                                                    ? 'bg-amber-600/50 border-2 border-amber-400 scale-105'
                                                    : 'bg-slate-800/50 border-2 border-slate-600 hover:border-amber-600/50'
                                            }`}
                                        >
                                            <img
                                                src={cls.portrait}
                                                alt={cls.name}
                                                className="w-12 h-12"
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                            <span className={`text-xs mt-1 font-semibold ${
                                                selectedClass === index ? 'text-amber-200' : 'text-slate-400'
                                            }`}>
                                                {cls.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-amber-200/60 text-xs mt-2" style={{ textShadow: '1px 1px 1px #000' }}>
                                    {CHARACTER_CLASSES[selectedClass].description}
                                </p>
                            </div>

                            {/* Avatar selection */}
                            <div className="mb-4">
                                <label className="block text-amber-200/80 text-sm mb-2" style={{ textShadow: '1px 1px 1px #000' }}>
                                    Avatar
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedAvatar((prev) => (prev - 1 + AVATAR_COUNT) % AVATAR_COUNT)}
                                        className="text-2xl text-amber-400 hover:text-amber-200"
                                    >
                                        ‹
                                    </button>
                                    <img
                                        src={AVATARS[selectedAvatar]}
                                        alt="Selected avatar"
                                        className="w-20 h-20 rounded-full border-2 border-amber-600"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <button
                                        onClick={() => setSelectedAvatar((prev) => (prev + 1) % AVATAR_COUNT)}
                                        className="text-2xl text-amber-400 hover:text-amber-200"
                                    >
                                        ›
                                    </button>
                                </div>
                                <p className="text-center text-amber-200/40 text-xs mt-1">
                                    {selectedAvatar + 1} / {AVATAR_COUNT}
                                </p>
                            </div>

                            {/* Create button */}
                            <button
                                onClick={handleConfirmCreate}
                                disabled={!characterName.trim()}
                                className={`w-full py-2 rounded font-bold transition-colors ${
                                    characterName.trim()
                                        ? 'bg-green-700 hover:bg-green-600 text-white'
                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                                style={{ textShadow: '1px 1px 1px #000' }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-slate-800 rounded-xl border-2 border-red-500/50 p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-red-400 mb-4">Delete Character?</h3>
                        <p className="text-slate-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-bold">{slots[confirmDelete]?.name}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteCharacter(confirmDelete)}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
