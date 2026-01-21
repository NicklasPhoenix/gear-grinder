import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getEnhanceCost, getEnhanceSuccess, getEnhanceBonus, getPityBonus, getBaseEnhanceSuccess } from '../utils/formulas';
import ItemIcon from './ItemIcon';
import { MaterialIcon } from './MaterialIcons';
import { TIERS, BOSS_STONES, addItemToInventory, removeOneFromStack, getEnhanceStage, generateAwakeningSubstat, isEnhanceMilestone, ENHANCE_MILESTONES } from '../data/items';
import { formatWithCommas } from '../utils/format';
import { audioManager } from '../systems/AudioManager';
import { useIsMobile } from '../hooks/useIsMobile';

export default function EnhancementView() {
    const { state, gameManager } = useGame();
    const [selectedItem, setSelectedItem] = useState(null);
    const [autoEnhanceTarget, setAutoEnhanceTarget] = useState(null);
    const [autoEnhancing, setAutoEnhancing] = useState(false);
    const autoEnhanceRef = useRef(null);

    // Enhancement result display (shows SUCCESS/FAIL on the panel)
    const [enhanceResult, setEnhanceResult] = useState(null); // { type: 'success'|'fail', text: string }
    const resultTimeoutRef = useRef(null);

    // Refs for always-fresh state access (fixes stale closure in auto-enhance)
    const stateRef = useRef(state);
    const selectedItemRef = useRef(selectedItem);

    // Keep refs in sync with state
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        selectedItemRef.current = selectedItem;
    }, [selectedItem]);

    const allItems = [
        ...Object.values(state.gear).filter(i => i),
        ...state.inventory
    ];

    useEffect(() => {
        if (selectedItem) {
            const updated = allItems.find(i => i.id === selectedItem.id);
            if (updated && (updated.plus !== selectedItem.plus)) {
                setSelectedItem(updated);
            }
        }
    }, [state.gear, state.inventory]);

    useEffect(() => {
        if (!autoEnhancing || !selectedItem || autoEnhanceTarget === null) {
            if (autoEnhanceRef.current) {
                clearInterval(autoEnhanceRef.current);
                autoEnhanceRef.current = null;
            }
            return;
        }

        const runAutoEnhance = () => {
            // Use refs for always-fresh values (fixes stale closure issues)
            const freshState = stateRef.current;
            const freshSelectedItem = selectedItemRef.current;

            if (!freshSelectedItem) {
                setAutoEnhancing(false);
                return;
            }

            const freshAllItems = [
                ...Object.values(freshState.gear).filter(i => i),
                ...freshState.inventory
            ];

            const currentItem = freshAllItems.find(i => i.id === freshSelectedItem.id);
            if (!currentItem) {
                setAutoEnhancing(false);
                return;
            }

            if (currentItem.plus >= autoEnhanceTarget) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: `+${autoEnhanceTarget} DONE!`, type: 'levelup', target: 'player' });
                return;
            }

            const baseCosts = getEnhanceCost(currentItem.plus);
            const needsBossStone = currentItem.bossSet && currentItem.plus >= 10;
            const costs = { ...baseCosts, bossStone: needsBossStone ? 1 : 0 };

            // Use fresh state values for resource checks
            if (freshState.gold < costs.gold || freshState.enhanceStone < costs.enhanceStone) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NO RESOURCES!', type: 'death', target: 'player' });
                return;
            }

            // Check blessed orb requirement
            if ((costs.blessedOrb || 0) > (freshState.blessedOrb || 0)) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NEED B.ORBS!', type: 'death', target: 'player' });
                return;
            }

            // Check celestial shard requirement
            if ((costs.celestialShard || 0) > (freshState.celestialShard || 0)) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NEED C.SHARDS!', type: 'death', target: 'player' });
                return;
            }

            // Check boss stone requirement with fresh state
            if (needsBossStone && (freshState.bossStones?.[currentItem.bossSet] || 0) < 1) {
                setAutoEnhancing(false);
                gameManager.emit('floatingText', { text: 'NEED BOSS STONE!', type: 'death', target: 'player' });
                return;
            }

            doEnhance(currentItem, costs);
        };

        autoEnhanceRef.current = setInterval(runAutoEnhance, 200);
        return () => { if (autoEnhanceRef.current) clearInterval(autoEnhanceRef.current); };
    }, [autoEnhancing, autoEnhanceTarget]); // Removed state dependencies - using refs instead

    const doEnhance = (item, costs) => {
        // Use ref for always-fresh state (fixes stale closure during rapid auto-enhance)
        const freshState = stateRef.current;

        // Calculate success with pity bonus from consecutive failures (per-item)
        const failStreak = item.failStreak || 0;
        const successChance = getEnhanceSuccess(item.plus, failStreak);
        const success = Math.random() * 100 < successChance;
        const isInventoryItem = freshState.inventory.find(i => i.id === item.id);

        let newState = {
            ...freshState,
            gold: freshState.gold - costs.gold,
            enhanceStone: freshState.enhanceStone - costs.enhanceStone,
            blessedOrb: freshState.blessedOrb - (costs.blessedOrb || 0),
            celestialShard: freshState.celestialShard - (costs.celestialShard || 0)
        };

        // Deduct boss stone if required (boss gear +10 and above)
        if (item.bossSet && item.plus >= 10 && costs.bossStone) {
            newState.bossStones = {
                ...freshState.bossStones,
                [item.bossSet]: (freshState.bossStones?.[item.bossSet] || 0) - costs.bossStone
            };
        }

        // No downgrade on failure - you keep your level, just don't progress
        const newPlus = success ? item.plus + 1 : item.plus;
        const newItem = {
            ...item,
            plus: newPlus,
            id: Date.now(),
            // Per-item pity: reset on success, increment on fail
            failStreak: success ? 0 : failStreak + 1
        };
        delete newItem.count;

        // Handle awakening bonuses on milestone success
        if (success && isEnhanceMilestone(newPlus)) {
            const alreadyHasMilestoneBonus = (newItem.effects || []).some(e => e.isAwakened && e.milestone === newPlus);
            if (!alreadyHasMilestoneBonus) {
                const newSubstat = generateAwakeningSubstat(newPlus, newItem.effects || []);
                newItem.effects = [...(newItem.effects || []), newSubstat];
                gameManager.emit('floatingText', { text: `AWAKENED! +${newSubstat.name}`, type: 'levelup', target: 'player' });
                audioManager.playSfxAwakening();
            }
        }

        if (isInventoryItem) {
            let updatedInventory = removeOneFromStack(freshState.inventory, item.id);
            updatedInventory = addItemToInventory(updatedInventory, newItem);
            newState.inventory = updatedInventory;
        } else {
            newState.gear = { ...freshState.gear, [newItem.slot]: newItem };
        }

        if (!success) {
            newState.enhanceFails = (freshState.enhanceFails || 0) + 1;
        }

        gameManager.setState(newState);

        // Show result on enhancement panel (not on character)
        // Use unique key to force animation remount on each enhance
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
        if (success) {
            setEnhanceResult({ type: 'success', text: `+${newItem.plus}!`, key: Date.now() });
            audioManager.playSfxEnhanceSuccess();
        } else {
            setEnhanceResult({ type: 'fail', text: 'FAIL', key: Date.now() });
            audioManager.playSfxEnhanceFail();
        }
        // Clear result after delay (longer for manual, shorter for auto)
        resultTimeoutRef.current = setTimeout(() => setEnhanceResult(null), autoEnhancing ? 150 : 800);

        if (isInventoryItem) {
            const updatedItem = newState.inventory.find(i =>
                i.slot === newItem.slot && i.tier === newItem.tier &&
                i.plus === newItem.plus && i.bossSet === newItem.bossSet
            );
            setSelectedItem(updatedItem || newItem);
        } else {
            setSelectedItem(newItem);
        }
    };

    const handleEnhance = () => {
        if (!selectedItem) return;
        const baseCosts = getEnhanceCost(selectedItem.plus);
        const needsBossStone = selectedItem.bossSet && selectedItem.plus >= 10;
        const costs = { ...baseCosts, bossStone: needsBossStone ? 1 : 0 };

        if (state.gold < costs.gold || state.enhanceStone < costs.enhanceStone) return;
        if ((costs.blessedOrb || 0) > (state.blessedOrb || 0)) return;
        if ((costs.celestialShard || 0) > (state.celestialShard || 0)) return;
        // Check boss stone requirement
        if (needsBossStone && (state.bossStones?.[selectedItem.bossSet] || 0) < 1) return;
        doEnhance(selectedItem, costs);
    };

    const startAutoEnhance = (target) => {
        if (!selectedItem) return;
        setAutoEnhanceTarget(target);
        setAutoEnhancing(true);
    };

    const stopAutoEnhance = () => {
        setAutoEnhancing(false);
        setAutoEnhanceTarget(null);
    };

    const baseCosts = selectedItem ? getEnhanceCost(selectedItem.plus) : null;
    // Add boss stone cost for boss gear +10 and above
    const needsBossStone = selectedItem?.bossSet && selectedItem.plus >= 10;
    const bossStoneInfo = needsBossStone ? BOSS_STONES[selectedItem.bossSet] : null;
    const costs = baseCosts ? {
        ...baseCosts,
        bossStone: needsBossStone ? 1 : 0,
        bossStoneType: selectedItem?.bossSet
    } : null;

    const failStreak = selectedItem?.failStreak || 0;
    const pityBonus = getPityBonus(failStreak);
    const baseSuccessChance = selectedItem ? getBaseEnhanceSuccess(selectedItem.plus) : 0;
    const successChance = selectedItem ? getEnhanceSuccess(selectedItem.plus, failStreak) : 0;
    const currentStats = selectedItem ? getEnhanceBonus(selectedItem.plus, selectedItem.tier) : null;
    const nextStats = selectedItem ? getEnhanceBonus(selectedItem.plus + 1, selectedItem.tier) : null;

    const hasBossStone = !needsBossStone || (state.bossStones?.[selectedItem?.bossSet] || 0) >= 1;
    const hasOrbs = !costs?.blessedOrb || (state.blessedOrb || 0) >= costs.blessedOrb;
    const hasShards = !costs?.celestialShard || (state.celestialShard || 0) >= costs.celestialShard;
    const canAfford = costs && state.gold >= costs.gold && state.enhanceStone >= costs.enhanceStone && hasBossStone && hasOrbs && hasShards;
    const { isMobile } = useIsMobile();

    return (
        <div className={`h-full ${isMobile ? 'flex flex-col' : 'flex'} gap-2`}>
            {/* Left/Top: Item List */}
            <div className={`${isMobile ? 'h-40' : 'w-1/3'} game-panel flex flex-col min-h-0`}>
                <div className="game-panel-header text-sm">Select Item</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {allItems.length === 0 ? (
                        <div className="text-center text-slate-600 py-4 text-sm">No items</div>
                    ) : (
                        <div className="space-y-1.5">
                            {allItems.map(item => {
                                const tierInfo = TIERS[item.tier];
                                const isSelected = selectedItem?.id === item.id;
                                const stage = getEnhanceStage(item.plus);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => { stopAutoEnhance(); setSelectedItem(item); }}
                                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border-2 transition-all active:scale-[0.98] ${
                                            isSelected
                                                ? 'bg-blue-900/50 border-blue-500/70'
                                                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-500/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded bg-slate-900/50 flex-shrink-0 relative">
                                            <ItemIcon item={item} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold truncate" style={{ color: tierInfo.color }}>
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="text-xs px-1.5 py-0.5 rounded font-semibold"
                                                    style={{ color: stage.color, backgroundColor: stage.bgColor }}
                                                >
                                                    {stage.icon && <span className="mr-0.5">{stage.icon}</span>}
                                                    +{item.plus}
                                                </span>
                                                {(item.count || 1) > 1 && (
                                                    <span className="text-xs text-blue-400">x{item.count}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Enhancement Panel */}
            <div className="flex-1 game-panel flex flex-col min-h-0">
                <div className="game-panel-header text-sm">Enhance</div>

                {selectedItem ? (
                    <div className="flex-1 flex flex-col p-3 min-h-0 relative overflow-hidden">
                        {/* Enhancement Result Animation - flex centered */}
                        {enhanceResult && (
                            <div key={enhanceResult.key} className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                {/* Center anchor - all effects position relative to this */}
                                <div className="relative">
                                    {/* Radial flash background */}
                                    <div
                                        className="absolute w-64 h-64 rounded-full animate-enhance-flash"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            marginLeft: '-128px',
                                            marginTop: '-128px',
                                            background: enhanceResult.type === 'success'
                                                ? 'radial-gradient(circle, rgba(74, 222, 128, 0.5) 0%, transparent 70%)'
                                                : 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)'
                                        }}
                                    />

                                    {/* Rays for success */}
                                    {enhanceResult.type === 'success' && [...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-0.5 bg-gradient-to-t from-green-400/70 to-transparent animate-enhance-ray"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                height: '80px',
                                                marginLeft: '-1px',
                                                transformOrigin: 'top center',
                                                transform: `rotate(${i * 45}deg)`,
                                                animationDelay: `${i * 0.03}s`
                                            }}
                                        />
                                    ))}

                                    {/* Sparkles for success */}
                                    {enhanceResult.type === 'success' && [...Array(6)].map((_, i) => (
                                        <div
                                            key={`sparkle-${i}`}
                                            className="absolute text-yellow-400 text-lg animate-enhance-sparkle"
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                marginLeft: '-8px',
                                                marginTop: '-8px',
                                                transformOrigin: 'center center',
                                                transform: `rotate(${i * 60}deg) translateY(-45px)`,
                                                animationDelay: `${i * 0.08}s`
                                            }}
                                        >
                                            ✦
                                        </div>
                                    ))}

                                    {/* Main text - centered */}
                                    <div className={`text-5xl font-black tracking-wider whitespace-nowrap ${
                                        enhanceResult.type === 'success' ? 'animate-enhance-success' : 'animate-enhance-fail'
                                    }`}
                                        style={{
                                            color: enhanceResult.type === 'success' ? '#4ade80' : '#ef4444',
                                            textShadow: enhanceResult.type === 'success'
                                                ? '0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(74, 222, 128, 0.4)'
                                                : '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)'
                                        }}
                                    >
                                        {enhanceResult.text}
                                    </div>
                                </div>

                                {/* CSS for animations */}
                                <style>{`
                                    @keyframes enhance-flash {
                                        0% { opacity: 0; transform: scale(0.3); }
                                        20% { opacity: 1; transform: scale(1); }
                                        100% { opacity: 0; transform: scale(1.3); }
                                    }
                                    @keyframes enhance-ray {
                                        0% { opacity: 0; transform: rotate(inherit) scaleY(0); }
                                        30% { opacity: 1; transform: rotate(inherit) scaleY(1); }
                                        100% { opacity: 0; transform: rotate(inherit) scaleY(1.3); }
                                    }
                                    @keyframes enhance-success {
                                        0% { opacity: 0; transform: scale(0.5); }
                                        20% { opacity: 1; transform: scale(1.15); }
                                        35% { transform: scale(1); }
                                        70% { opacity: 1; }
                                        100% { opacity: 0; transform: scale(0.95); }
                                    }
                                    @keyframes enhance-fail {
                                        0% { opacity: 0; transform: scale(0.8); }
                                        15% { opacity: 1; transform: scale(1.05) translateX(-4px); }
                                        30% { transform: scale(1) translateX(4px); }
                                        45% { transform: translateX(-3px); }
                                        60% { transform: translateX(3px); }
                                        75% { opacity: 1; transform: translateX(0); }
                                        100% { opacity: 0; }
                                    }
                                    @keyframes enhance-sparkle {
                                        0% { opacity: 0; transform: rotate(inherit) translateY(-25px) scale(0); }
                                        30% { opacity: 1; transform: rotate(inherit) translateY(-55px) scale(1.3); }
                                        100% { opacity: 0; transform: rotate(inherit) translateY(-75px) scale(0); }
                                    }
                                    .animate-enhance-flash { animation: enhance-flash 0.8s ease-out forwards; }
                                    .animate-enhance-ray { animation: enhance-ray 0.6s ease-out forwards; }
                                    .animate-enhance-success { animation: enhance-success 0.8s ease-out forwards; }
                                    .animate-enhance-fail { animation: enhance-fail 0.6s ease-out forwards; }
                                    .animate-enhance-sparkle { animation: enhance-sparkle 0.7s ease-out forwards; }
                                `}</style>
                            </div>
                        )}
                        {/* Selected Item Display */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-16 h-16 rounded-lg bg-slate-900/80 border-2 border-slate-600 relative flex-shrink-0">
                                <ItemIcon item={selectedItem} />
                                {selectedItem.plus > 0 && (
                                    <div
                                        className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-xs font-bold rounded"
                                        style={{
                                            color: getEnhanceStage(selectedItem.plus).color,
                                            backgroundColor: getEnhanceStage(selectedItem.plus).bgColor,
                                            boxShadow: getEnhanceStage(selectedItem.plus).glow
                                        }}
                                    >
                                        +{selectedItem.plus}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-base truncate" style={{ color: TIERS[selectedItem.tier].color }}>
                                    {selectedItem.name}
                                </div>
                                {/* Enhancement transition */}
                                <div className="flex items-center gap-2 mt-1">
                                    {(() => {
                                        const current = getEnhanceStage(selectedItem.plus);
                                        const next = getEnhanceStage(selectedItem.plus + 1);
                                        const isNewStage = current.stage !== next.stage;
                                        return (
                                            <>
                                                <span className="text-sm px-1.5 py-0.5 rounded font-semibold" style={{ color: current.color, backgroundColor: current.bgColor }}>
                                                    {current.icon}{current.icon && ' '}+{selectedItem.plus}
                                                </span>
                                                <span className="text-slate-500">→</span>
                                                <span
                                                    className={`text-sm px-1.5 py-0.5 rounded font-semibold ${isNewStage ? 'animate-pulse' : ''}`}
                                                    style={{ color: next.color, backgroundColor: next.bgColor, boxShadow: next.glow }}
                                                >
                                                    {next.icon}{next.icon && ' '}+{selectedItem.plus + 1}
                                                </span>
                                                {isNewStage && next.name && (
                                                    <span className="text-xs font-bold animate-pulse" style={{ color: next.color }}>
                                                        {next.name}!
                                                    </span>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Success Rate - Visual Bar */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span className="uppercase font-semibold">Success Rate</span>
                                <span className={`font-bold text-sm ${successChance > 80 ? 'text-green-400' : successChance > 50 ? 'text-yellow-400' : successChance > 20 ? 'text-orange-400' : 'text-red-400'}`}>
                                    {baseSuccessChance}%{pityBonus > 0 && <span className="text-cyan-400"> +{pityBonus}%</span>}
                                </span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-lg overflow-hidden relative">
                                {/* Base success (darker) */}
                                <div
                                    className={`h-full absolute left-0 top-0 transition-all duration-300 ${
                                        successChance > 80 ? 'bg-green-500' :
                                        successChance > 50 ? 'bg-yellow-500' :
                                        successChance > 20 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${baseSuccessChance}%` }}
                                />
                                {/* Pity bonus (lighter/cyan overlay) */}
                                {pityBonus > 0 && (
                                    <div
                                        className="h-full absolute top-0 bg-cyan-400 transition-all duration-300"
                                        style={{ left: `${baseSuccessChance}%`, width: `${pityBonus}%` }}
                                    />
                                )}
                            </div>
                            {/* Pity streak info */}
                            {failStreak > 0 && (
                                <div className="text-[10px] text-cyan-400 mt-1 text-center">
                                    Pity: {failStreak} fails (+{pityBonus}% bonus)
                                </div>
                            )}
                        </div>

                        {/* Stats Preview */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-slate-800/50 rounded p-2">
                                <div className="text-slate-500 text-[10px] uppercase mb-1 font-semibold">Current</div>
                                <div className="text-red-300 text-sm font-semibold">DMG +{currentStats.dmgBonus}</div>
                                <div className="text-green-300 text-sm font-semibold">HP +{currentStats.hpBonus}</div>
                            </div>
                            <div className="bg-blue-900/30 rounded p-2 border border-blue-500/30">
                                <div className="text-blue-400 text-[10px] uppercase mb-1 font-semibold">Next</div>
                                <div className="text-red-300 text-sm font-semibold">DMG +{nextStats.dmgBonus}</div>
                                <div className="text-green-300 text-sm font-semibold">HP +{nextStats.hpBonus}</div>
                            </div>
                        </div>

                        {/* Awakening Milestones */}
                        {(() => {
                            const awakenedEffects = (selectedItem.effects || []).filter(e => e.isAwakened);
                            const nextMilestone = ENHANCE_MILESTONES.find(m => m > selectedItem.plus);

                            return (
                                <div className="mb-2 p-2 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded border border-orange-500/30">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="text-yellow-400 text-sm">★</span>
                                        <span className="text-[10px] uppercase font-bold text-orange-300">Awakening Progress</span>
                                    </div>
                                    {/* Milestone dots */}
                                    <div className="flex items-center justify-between mb-1">
                                        {ENHANCE_MILESTONES.map((m, i) => {
                                            const achieved = selectedItem.plus >= m;
                                            const isNext = m === nextMilestone;
                                            return (
                                                <div key={m} className="flex flex-col items-center">
                                                    <div
                                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            achieved
                                                                ? 'bg-orange-500 text-white'
                                                                : isNext
                                                                    ? 'bg-orange-500/30 text-orange-300 border border-orange-500 animate-pulse'
                                                                    : 'bg-slate-700/50 text-slate-500'
                                                        }`}
                                                    >
                                                        {achieved ? '★' : m}
                                                    </div>
                                                    <span className={`text-[8px] ${achieved ? 'text-orange-300' : 'text-slate-500'}`}>
                                                        +{m}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Existing awakened effects */}
                                    {awakenedEffects.length > 0 && (
                                        <div className="pt-1.5 border-t border-orange-500/20 space-y-0.5">
                                            {awakenedEffects.map((eff, i) => (
                                                <div key={i} className="flex justify-between text-[10px]">
                                                    <span className="text-orange-200">★ {eff.name}</span>
                                                    <span className="text-orange-300 font-mono">+{eff.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Next milestone preview */}
                                    {nextMilestone && (
                                        <div className="mt-1 text-center text-[9px] text-yellow-400/80">
                                            Next awakening at +{nextMilestone} ({nextMilestone - selectedItem.plus} to go)
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Cost */}
                        <div className="flex justify-center flex-wrap gap-3 mb-2 py-2 bg-slate-900/50 rounded">
                            <div className={`flex items-center gap-1.5 ${state.gold >= costs.gold ? 'opacity-100' : 'opacity-40'}`}>
                                <MaterialIcon type="gold" size={20} />
                                <span className="text-sm font-bold text-slate-300">{formatWithCommas(costs.gold)}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${state.enhanceStone >= costs.enhanceStone ? 'opacity-100' : 'opacity-40'}`}>
                                <MaterialIcon type="enhanceStone" size={20} />
                                <span className="text-sm font-bold text-blue-400">{costs.enhanceStone}</span>
                            </div>
                            {costs.blessedOrb > 0 && (
                                <div className={`flex items-center gap-1.5 ${state.blessedOrb >= costs.blessedOrb ? 'opacity-100' : 'opacity-40'}`}>
                                    <MaterialIcon type="blessedOrb" size={20} />
                                    <span className="text-sm font-bold text-purple-400">{costs.blessedOrb}</span>
                                </div>
                            )}
                            {needsBossStone && bossStoneInfo && (
                                <div className={`flex items-center gap-1.5 ${hasBossStone ? 'opacity-100' : 'opacity-40'}`}>
                                    <img
                                        src={`/assets/gems/Icon${bossStoneInfo.gemIcon}.png`}
                                        alt={bossStoneInfo.name}
                                        className="w-5 h-5"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <span className="text-sm font-bold" style={{ color: bossStoneInfo.color }}>
                                        1 ({state.bossStones?.[selectedItem.bossSet] || 0})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Boss Stone Warning */}
                        {needsBossStone && !hasBossStone && (
                            <div className="mb-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-center">
                                <span className="text-xs text-red-300 font-semibold">
                                    Requires {bossStoneInfo?.name} to enhance past +10
                                </span>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-auto space-y-1.5">
                            {autoEnhancing ? (
                                <button
                                    onClick={stopAutoEnhance}
                                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-sm rounded flex items-center justify-center gap-2"
                                >
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    STOP (+{autoEnhanceTarget})
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEnhance}
                                        disabled={!canAfford}
                                        className={`w-full py-2 font-bold uppercase text-sm rounded transition-all ${
                                            canAfford
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        ENHANCE
                                    </button>
                                    <div className="flex gap-1.5">
                                        {[3, 5, 10].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => startAutoEnhance(selectedItem.plus + n)}
                                                disabled={!canAfford}
                                                className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${
                                                    canAfford
                                                        ? 'bg-purple-600/40 hover:bg-purple-600/60 text-purple-200'
                                                        : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                AUTO +{selectedItem.plus + n}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-600">
                        <div className="text-center">
                            <img src="/assets/ui-icons/book-enhancement.png" alt="" className="w-16 h-16 mb-3 opacity-30 mx-auto" />
                            <div className="text-base">Select an item</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
