import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { GameManager } from '../managers/GameManager';
import { SAVE, DEFAULTS } from '../data/constants';
import { checkAchievements, applyAchievementReward } from '../data/achievements';
import { getObjectiveUpdates } from '../data/dailyObjectives';
const GameContext = createContext(null);

// Separate context for high-frequency updates (HP bars) to prevent full tree re-renders
const HighFrequencyContext = createContext(null);


// Validate and sanitize a loaded save to prevent crashes
function validateSave(parsed) {
    const errors = [];
    const defaults = {
        stats: { ...DEFAULTS.BASE_PRIMARY_STATS },
        secondaryStats: { ...DEFAULTS.BASE_SECONDARY_STATS },
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
        achievementStatPoints: 0,
        inventory: [],
        gear: {},
        skills: [],
        unlockedSkills: [],
        // Display & loot filter settings (new in this version)
        textSize: 'normal',
        autoSalvageTier: -1,
        autoSalvageKeepEffects: true,
        inventorySort: 'none',
    };

    // Check save version for migrations
    if (!parsed.saveVersion) {
        parsed.saveVersion = SAVE.SAVE_VERSION;
    }

    // Validate primary stats object
    if (!parsed.stats || typeof parsed.stats !== 'object') {
        errors.push('Invalid stats object, resetting to defaults');
        parsed.stats = { ...defaults.stats };
    } else {
        // Remove old 'lck' stat if present (migrated to secondary stats)
        if ('lck' in parsed.stats) {
            delete parsed.stats.lck;
        }
        for (const [key, defaultVal] of Object.entries(defaults.stats)) {
            if (typeof parsed.stats[key] !== 'number' || isNaN(parsed.stats[key]) || parsed.stats[key] < 0) {
                errors.push(`Invalid stat ${key}, resetting to ${defaultVal}`);
                parsed.stats[key] = defaultVal;
            }
        }
    }

    // Validate secondary stats object (new stat system)
    if (!parsed.secondaryStats || typeof parsed.secondaryStats !== 'object') {
        parsed.secondaryStats = { ...defaults.secondaryStats };
    } else {
        for (const [key, defaultVal] of Object.entries(defaults.secondaryStats)) {
            if (typeof parsed.secondaryStats[key] !== 'number' || isNaN(parsed.secondaryStats[key]) || parsed.secondaryStats[key] < 0) {
                parsed.secondaryStats[key] = defaultVal;
            }
        }
    }

    // Validate numeric fields
    const numericFields = [
        'playerHp', 'playerMaxHp', 'enemyHp', 'enemyMaxHp',
        'gold', 'xp', 'level', 'kills', 'currentZone', 'statPoints',
        'enhanceStone', 'blessedOrb', 'celestialShard', 'prestigeLevel', 'prestigeStones',
        'achievementStatPoints'
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

    // Add defaults for new display/loot filter settings (for old saves)
    if (!['normal', 'large', 'xlarge'].includes(parsed.textSize)) {
        parsed.textSize = defaults.textSize;
    }
    if (typeof parsed.autoSalvageTier !== 'number' || parsed.autoSalvageTier < -1 || parsed.autoSalvageTier > 9) {
        parsed.autoSalvageTier = defaults.autoSalvageTier;
    }
    if (typeof parsed.autoSalvageKeepEffects !== 'boolean') {
        parsed.autoSalvageKeepEffects = defaults.autoSalvageKeepEffects;
    }
    if (!Array.isArray(parsed.autoSalvageWantedStats)) {
        parsed.autoSalvageWantedStats = []; // Default: keep all stats
    }
    if (typeof parsed.autoSalvageBossItems !== 'boolean') {
        parsed.autoSalvageBossItems = false; // Default OFF for safety
    }
    if (!['none', 'slot', 'tier', 'score'].includes(parsed.inventorySort)) {
        parsed.inventorySort = defaults.inventorySort;
    }

    // Validate endless mode state (reset if corrupted to prevent stuck state)
    if (typeof parsed.endlessActive !== 'boolean') {
        parsed.endlessActive = false;
    }
    if (typeof parsed.endlessWave !== 'number' || parsed.endlessWave < 0) {
        parsed.endlessWave = 0;
    }
    if (typeof parsed.endlessBestWave !== 'number' || parsed.endlessBestWave < 0) {
        parsed.endlessBestWave = 0;
    }
    // If endless is active but has invalid state, reset it
    if (parsed.endlessActive && (!parsed.endlessEnemyMaxHp || parsed.endlessEnemyMaxHp <= 0)) {
        parsed.endlessActive = false;
        parsed.endlessWave = 0;
    }

    // Initialize collection tracking objects if missing
    if (!parsed.collectedBossSetPieces || typeof parsed.collectedBossSetPieces !== 'object') {
        parsed.collectedBossSetPieces = {};
    }
    if (!parsed.collectedWeaponTypes || typeof parsed.collectedWeaponTypes !== 'object') {
        parsed.collectedWeaponTypes = {};
    }
    if (!parsed.collectedEffects || typeof parsed.collectedEffects !== 'object') {
        parsed.collectedEffects = {};
    }
    if (!parsed.collectedTiers || typeof parsed.collectedTiers !== 'object') {
        parsed.collectedTiers = {};
    }
    if (!parsed.collectedEnhanceLevels || typeof parsed.collectedEnhanceLevels !== 'object') {
        parsed.collectedEnhanceLevels = {};
    }

    // Log validation errors (but don't crash)
    if (errors.length > 0) {
        console.warn('Save validation found issues:', errors);
    }

    return { validated: parsed, errors };
}

export function GameProvider({ children, initialCharacter = null, slotIndex = null, onSaveCharacter = null, onReturnToSelect = null }) {
    const gameManagerRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const characterRef = useRef({ initialCharacter, slotIndex });

    // High-frequency state (HP values) - updated separately to prevent full tree re-renders
    const [hpState, setHpState] = useState({ playerHp: 100, playerMaxHp: 100, enemyHp: 20, enemyMaxHp: 20 });

    // Offline rewards state - shown in modal when player returns
    const [offlineRewards, setOfflineRewards] = useState(null);

    // Toast notifications for achievements/skills
    const [toasts, setToasts] = useState([]);

    // Track last state snapshot for comparison
    const lastStateRef = useRef(null);

    // Track when tab was hidden for visibility-based offline progress
    const hiddenTimeRef = useRef(null);

    useEffect(() => {
        // Initialize Game Manager once
        const gm = new GameManager();
        gameManagerRef.current = gm;

        // Expose for console cheats: window.gm.cheat()
        window.gm = gm;

        // Load saved game (if any)
        const loadGame = async () => {
            try {
                let parsed = null;

                // If we have a character with saved gameState, use that
                if (initialCharacter?.gameState) {
                    parsed = initialCharacter.gameState;
                    console.log('Loading character save:', initialCharacter.name);
                } else {
                    // Try main save first (legacy support)
                    const saved = await window.storage.get('gear-grinder-save');

                    if (saved && saved.value) {
                        try {
                            parsed = JSON.parse(saved.value);
                        } catch (parseError) {
                            console.error('Main save corrupted:', parseError);
                        }
                    }

                    // Check backup save (from beforeunload)
                    try {
                        const backupKey = slotIndex !== null ? `gear-grinder-slot${slotIndex}-backup` : 'gear-grinder-save-backup';
                        const backup = localStorage.getItem(backupKey);
                        if (backup) {
                            const backupParsed = JSON.parse(backup);
                            // Use backup if it's newer than main save
                            if (!parsed || (backupParsed.lastSaveTime && (!parsed.lastSaveTime || backupParsed.lastSaveTime > parsed.lastSaveTime))) {
                                console.log('Using backup save (newer)');
                                parsed = backupParsed;
                            }
                            // Clear backup after checking
                            localStorage.removeItem(backupKey);
                        }
                    } catch (e) {
                        console.error('Backup save check failed:', e);
                    }
                }

                if (parsed) {
                    // Validate and sanitize the loaded save
                    const { validated, errors } = validateSave(parsed);

                    if (errors.length > 0) {
                        console.warn(`Save loaded with ${errors.length} corrections applied`);
                    }

                    console.log('Loading save:', {
                        zone: validated.currentZone,
                        level: validated.level,
                        gold: validated.gold,
                        kills: validated.kills,
                        lastSaveTime: validated.lastSaveTime ? new Date(validated.lastSaveTime).toISOString() : 'never'
                    });

                    // Merge with default state
                    gm.state = { ...gm.state, ...validated, combatLog: [], saveVersion: SAVE.SAVE_VERSION };
                }

                // Store character info in state for display
                if (initialCharacter) {
                    gm.state.characterName = initialCharacter.name;
                    gm.state.characterAvatar = initialCharacter.avatar;
                }
            } catch (e) {
                console.error("Save load error, starting fresh:", e);
            }

            // Initialize daily/weekly objectives if needed
            const objectiveUpdates = getObjectiveUpdates(gm.state);
            if (objectiveUpdates) {
                gm.state = { ...gm.state, ...objectiveUpdates };
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
                    newState.secondaryStats !== lastState?.secondaryStats ||
                    newState.statPoints !== lastState?.statPoints ||
                    newState.enhanceStone !== lastState?.enhanceStone ||
                    newState.blessedOrb !== lastState?.blessedOrb ||
                    newState.celestialShard !== lastState?.celestialShard ||
                    newState.prestigeLevel !== lastState?.prestigeLevel ||
                    newState.prestigeStones !== lastState?.prestigeStones ||
                    newState.autoSalvage !== lastState?.autoSalvage ||
                    newState.autoSalvageTier !== lastState?.autoSalvageTier ||
                    newState.autoSalvageKeepEffects !== lastState?.autoSalvageKeepEffects ||
                    JSON.stringify(newState.autoSalvageWantedStats) !== JSON.stringify(lastState?.autoSalvageWantedStats) ||
                    newState.autoSalvageBossItems !== lastState?.autoSalvageBossItems ||
                    newState.textSize !== lastState?.textSize ||
                    newState.inventorySort !== lastState?.inventorySort ||
                    newState.combatPaused !== lastState?.combatPaused ||
                    newState.autoProgress !== lastState?.autoProgress ||
                    newState.unlockedAchievements !== lastState?.unlockedAchievements ||
                    newState.dailyStreak !== lastState?.dailyStreak ||
                    newState.lastDailyReward !== lastState?.lastDailyReward ||
                    newState.equipmentPresets !== lastState?.equipmentPresets ||
                    // Endless mode state
                    newState.endlessActive !== lastState?.endlessActive ||
                    newState.endlessWave !== lastState?.endlessWave ||
                    newState.endlessBestWave !== lastState?.endlessBestWave ||
                    newState.endlessEnemyHp !== lastState?.endlessEnemyHp ||
                    newState.endlessEnemyMaxHp !== lastState?.endlessEnemyMaxHp ||
                    newState.endlessKillsThisRun !== lastState?.endlessKillsThisRun ||
                    newState.endlessGoldThisRun !== lastState?.endlessGoldThisRun ||
                    // Daily/Weekly objectives
                    newState.dailyObjective !== lastState?.dailyObjective ||
                    newState.dailyObjectiveClaimed !== lastState?.dailyObjectiveClaimed ||
                    newState.weeklyObjective !== lastState?.weeklyObjective ||
                    newState.weeklyObjectiveClaimed !== lastState?.weeklyObjectiveClaimed ||
                    // Collection progress
                    newState.collectedBossSetPieces !== lastState?.collectedBossSetPieces ||
                    newState.collectedWeaponTypes !== lastState?.collectedWeaponTypes ||
                    newState.collectedEffects !== lastState?.collectedEffects ||
                    newState.collectedTiers !== lastState?.collectedTiers;

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

            // Process Offline - capture rewards to show in modal
            const rewards = gm.processOfflineProgress(gm.state);
            if (rewards) {
                setOfflineRewards(rewards);
            }

            // Start the loop
            gm.start();
        };

        const saveGame = async () => {
            if (!gameManagerRef.current) return;
            try {
                const gm = gameManagerRef.current;
                gm.state.lastSaveTime = Date.now();

                // If we have a character slot, save to that slot
                if (onSaveCharacter && slotIndex !== null) {
                    onSaveCharacter(gm.state);
                    console.log('Auto-save to slot:', slotIndex + 1, {
                        zone: gm.state.currentZone,
                        level: gm.state.level,
                        gold: gm.state.gold
                    });
                } else {
                    // Legacy global save
                    const data = await gm.save();
                    await window.storage.set('gear-grinder-save', data);
                    console.log('Auto-save:', {
                        zone: gm.state.currentZone,
                        level: gm.state.level,
                        gold: gm.state.gold
                    });
                }
            } catch (err) {
                console.error('Auto-save failed:', err);
            }
        };

        loadGame();

        // Auto Save Interval (30s)
        const saveInterval = setInterval(saveGame, SAVE.AUTO_SAVE_INTERVAL);

        // Save on page close/refresh
        const handleBeforeUnload = () => {
            if (gameManagerRef.current) {
                const data = JSON.stringify(gameManagerRef.current.state);
                // Use synchronous localStorage as fallback for page close
                try {
                    const backupKey = slotIndex !== null ? `gear-grinder-slot${slotIndex}-backup` : 'gear-grinder-save-backup';
                    localStorage.setItem(backupKey, data);
                    // Also save to character slot if available
                    if (onSaveCharacter && slotIndex !== null) {
                        onSaveCharacter(gameManagerRef.current.state);
                    }
                } catch (e) {
                    console.error('Backup save failed:', e);
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearInterval(saveInterval);
            saveGame(); // Save on unmount
            gm.stop();
        };
    }, []);

    // Handle tab visibility changes for offline progress when switching tabs
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab is now hidden - record the time and save immediately
                hiddenTimeRef.current = Date.now();
                // Save to backup when tab hidden (mobile doesn't always fire beforeunload)
                if (gameManagerRef.current) {
                    try {
                        gameManagerRef.current.state.lastSaveTime = Date.now();
                        const data = JSON.stringify(gameManagerRef.current.state);
                        localStorage.setItem('gear-grinder-save-backup', data);
                    } catch (e) {
                        console.error('Tab hidden save failed:', e);
                    }
                }
            } else {
                // Tab is now visible - check if we should process offline progress
                if (hiddenTimeRef.current && gameManagerRef.current) {
                    const now = Date.now();
                    const secondsAway = Math.floor((now - hiddenTimeRef.current) / 1000);

                    // Only process if away for at least 5 seconds
                    if (secondsAway >= 5) {
                        const gm = gameManagerRef.current;

                        // Temporarily set lastSaveTime to when tab was hidden
                        const originalLastSaveTime = gm.state.lastSaveTime;
                        gm.state.lastSaveTime = hiddenTimeRef.current;

                        const rewards = gm.processOfflineProgress(gm.state);

                        // Restore original lastSaveTime (processOfflineProgress doesn't change it)
                        gm.state.lastSaveTime = originalLastSaveTime;

                        if (rewards) {
                            setOfflineRewards(rewards);
                            // Force state update to reflect new gold/xp
                            setGameState({ ...gm.state });
                        }
                    }

                    hiddenTimeRef.current = null;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Check for achievements continuously (not just when viewing achievements tab)
    useEffect(() => {
        if (!gameState || !gameManagerRef.current) return;

        const unlockedAchievements = gameState.unlockedAchievements || [];
        const newlyUnlocked = checkAchievements(gameState, unlockedAchievements);

        if (newlyUnlocked.length > 0) {
            gameManagerRef.current.setState(prev => {
                const newState = { ...prev };
                const newUnlocked = [...(prev.unlockedAchievements || [])];

                for (const achievement of newlyUnlocked) {
                    if (!newUnlocked.includes(achievement.id)) {
                        newUnlocked.push(achievement.id);
                        applyAchievementReward(newState, achievement.reward);

                        // Show toast notification for achievement
                        setToasts(prevToasts => [
                            ...prevToasts,
                            { id: Date.now() + Math.random(), type: 'achievement', data: achievement }
                        ]);
                    }
                }

                newState.unlockedAchievements = newUnlocked;
                return newState;
            });
        }
    }, [gameState?.kills, gameState?.totalGold, gameState?.level, gameState?.prestigeLevel,
        gameState?.inventory?.length, gameState?.zoneKills, gameState?.gear]);

    // Apply text size setting to body element for CSS scaling
    useEffect(() => {
        const textSize = gameState?.textSize ?? 'normal';
        if (textSize === 'normal') {
            document.body.removeAttribute('data-text-size');
        } else {
            document.body.setAttribute('data-text-size', textSize);
        }
    }, [gameState?.textSize]);

    // Toast management functions
    const addToast = useCallback((type, data) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, type, data }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        gameManager: gameManagerRef.current,
        state: gameState,
        offlineRewards,
        clearOfflineRewards: () => setOfflineRewards(null),
        toasts,
        addToast,
        dismissToast,
        onReturnToSelect,
    }), [gameState, offlineRewards, toasts, addToast, dismissToast, onReturnToSelect]);

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
