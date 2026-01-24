import React, { useState, useEffect } from 'react';
import { TIERS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, BOSS_SETS, PRESTIGE_BOSS_SETS, SPECIAL_EFFECTS, getItemScore, getEnhanceStage, getEffectMaxForTier } from '../data/items';
import { getEnhanceBonus } from '../utils/formulas';
import { formatBonus } from '../utils/format';

// Effect descriptions - what each effect actually does
const EFFECT_DESCRIPTIONS = {
    thorns: (val) => `Reflect ${val}% damage back to attackers`,
    lifesteal: (val) => `Heal for ${val}% of damage dealt`,
    critChance: (val) => `+${val}% chance to deal critical hits`,
    critDamage: (val) => `+${val}% critical hit damage`,
    bonusDmg: (val) => `+${val} flat damage bonus`,
    bonusHp: (val) => `+${val} maximum HP`,
    silverFind: (val) => `+${val}% silver from enemies`,
    xpBonus: (val) => `+${val}% experience gained`,
    dodge: (val) => `${val}% chance to avoid attacks`,
    hpRegen: (val) => `Restore ${val}% max HP per second`,
    damageReduction: (val) => `Reduce damage taken by ${val}%`,
};

// Helper to calculate item stats for comparison
function calculateItemStats(item) {
    if (!item) return { dmg: 0, hp: 0, armor: 0, score: 0 };

    const tierData = TIERS[item.tier] || TIERS[0];
    const gearBase = GEAR_BASES[item.slot] || { baseDmg: 0, baseHp: 0, baseArmor: 0 };
    let weaponBase = gearBase;

    if (item.slot === 'weapon' && item.weaponType) {
        const weaponDef = WEAPON_TYPES.find(w => w.id === item.weaponType)
            || PRESTIGE_WEAPONS.find(w => w.id === item.weaponType);
        if (weaponDef) {
            weaponBase = { ...gearBase, ...weaponDef };
        }
    }

    const tierMult = tierData.statMult || 1;
    const bossBonus = item.isBossItem && item.statBonus ? item.statBonus : 1;
    const enhanceBonus = getEnhanceBonus(item.plus || 0, item.tier);

    return {
        dmg: Math.floor((weaponBase.baseDmg || 0) * tierMult * bossBonus) + (enhanceBonus.dmgBonus || 0),
        hp: Math.floor((weaponBase.baseHp || 0) * tierMult * bossBonus) + (enhanceBonus.hpBonus || 0),
        armor: Math.floor((weaponBase.baseArmor || 0) * tierMult * bossBonus) + (enhanceBonus.armorBonus || 0),
        score: getItemScore(item),
    };
}

export default function GameTooltip({ tooltip }) {
    const [shiftHeld, setShiftHeld] = useState(false);

    // Track shift key state
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift') setShiftHeld(true);
        };
        const handleKeyUp = (e) => {
            if (e.key === 'Shift') setShiftHeld(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    if (!tooltip || !tooltip.item) return null;

    const { item, position, gear, isInventoryItem } = tooltip;

    // Count equipped pieces of the same set
    const getEquippedSetCount = (setName) => {
        if (!gear || !setName) return 0;
        return Object.values(gear).filter(g => g && g.bossSet === setName).length;
    };
    const equippedSetPieces = item.bossSet ? getEquippedSetCount(item.bossSet) : 0;
    const tierData = TIERS[item.tier] || TIERS[0];
    const effects = item.effects || [];
    const score = getItemScore(item);

    // Calculate actual stats from the item
    const gearBase = GEAR_BASES[item.slot] || { baseDmg: 0, baseHp: 0, baseArmor: 0 };
    let weaponBase = gearBase;

    // For weapons, get the weapon type specific stats
    if (item.slot === 'weapon' && item.weaponType) {
        const weaponDef = WEAPON_TYPES.find(w => w.id === item.weaponType)
            || PRESTIGE_WEAPONS.find(w => w.id === item.weaponType);
        if (weaponDef) {
            weaponBase = { ...gearBase, ...weaponDef };
        }
    }

    // Calculate tier-scaled base stats
    const tierMult = tierData.statMult || 1;
    const bossBonus = item.isBossItem && item.statBonus ? item.statBonus : 1;
    const enhanceBonus = getEnhanceBonus(item.plus || 0, item.tier);

    const baseDmg = Math.floor((weaponBase.baseDmg || 0) * tierMult * bossBonus) + (enhanceBonus.dmgBonus || 0);
    const baseHp = Math.floor((weaponBase.baseHp || 0) * tierMult * bossBonus) + (enhanceBonus.hpBonus || 0);
    const baseArmor = Math.floor((weaponBase.baseArmor || 0) * tierMult * bossBonus) + (enhanceBonus.armorBonus || 0);

    // Get equipped item for comparison (only if viewing inventory item)
    const equippedItem = isInventoryItem && gear ? gear[item.slot] : null;
    const equippedStats = equippedItem ? calculateItemStats(equippedItem) : null;
    const hoveredStats = calculateItemStats(item);

    // Calculate differences
    const getDiff = (newVal, oldVal) => {
        if (!equippedStats) return null;
        const diff = newVal - oldVal;
        if (diff === 0) return null;
        return diff;
    };

    const dmgDiff = getDiff(hoveredStats.dmg, equippedStats?.dmg || 0);
    const hpDiff = getDiff(hoveredStats.hp, equippedStats?.hp || 0);
    const armorDiff = getDiff(hoveredStats.armor, equippedStats?.armor || 0);
    const scoreDiff = getDiff(hoveredStats.score, equippedStats?.score || 0);

    // Calculate position to keep on screen - complete boundary checking
    // Estimate tooltip dimensions based on content
    const tooltipWidth = 256; // w-64 = 16rem = 256px
    const hasSetBonuses = item.bossSet && (BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet]);
    const estimatedHeight = 350 + (effects.length * 30) + (hasSetBonuses ? 220 : 0) + (isInventoryItem ? 100 : 0);

    const screenPadding = 16;
    const cursorOffset = 15;

    let style = {
        maxHeight: `calc(100vh - ${screenPadding * 2}px)`,
        overflowY: 'auto',
    };

    // Horizontal positioning - check both left and right edges
    const spaceOnRight = window.innerWidth - position.x - cursorOffset - tooltipWidth;
    const spaceOnLeft = position.x - cursorOffset - tooltipWidth;

    if (spaceOnRight >= screenPadding) {
        // Fits on right side
        style.left = position.x + cursorOffset;
    } else if (spaceOnLeft >= screenPadding) {
        // Fits on left side
        style.left = position.x - cursorOffset - tooltipWidth;
    } else {
        // Center it horizontally if it doesn't fit either side
        style.left = Math.max(screenPadding, (window.innerWidth - tooltipWidth) / 2);
    }

    // Ensure left edge doesn't go off screen
    if (style.left < screenPadding) {
        style.left = screenPadding;
    }

    // Ensure right edge doesn't go off screen
    if (style.left + tooltipWidth > window.innerWidth - screenPadding) {
        style.left = window.innerWidth - screenPadding - tooltipWidth;
    }

    // Vertical positioning - check both top and bottom edges
    const spaceBelow = window.innerHeight - position.y - cursorOffset - estimatedHeight;
    const spaceAbove = position.y - cursorOffset - estimatedHeight;

    if (spaceBelow >= screenPadding) {
        // Fits below cursor
        style.top = position.y + cursorOffset;
    } else if (spaceAbove >= screenPadding) {
        // Fits above cursor
        style.top = position.y - cursorOffset - Math.min(estimatedHeight, window.innerHeight - screenPadding * 2);
    } else {
        // Center vertically and use max height with scroll
        style.top = screenPadding;
        style.maxHeight = `calc(100vh - ${screenPadding * 2}px)`;
    }

    // Ensure top edge doesn't go off screen
    if (style.top < screenPadding) {
        style.top = screenPadding;
    }

    // Ensure bottom edge doesn't go off screen
    if (style.top + estimatedHeight > window.innerHeight - screenPadding) {
        style.maxHeight = `${window.innerHeight - style.top - screenPadding}px`;
    }

    // Get rating label based on score
    const getRatingLabel = (score) => {
        if (score >= 800) return { label: 'S+', color: '#f472b6' };
        if (score >= 600) return { label: 'S', color: '#fbbf24' };
        if (score >= 400) return { label: 'A', color: '#a855f7' };
        if (score >= 250) return { label: 'B', color: '#3b82f6' };
        if (score >= 150) return { label: 'C', color: '#22c55e' };
        if (score >= 80) return { label: 'D', color: '#94a3b8' };
        return { label: 'E', color: '#64748b' };
    };

    const rating = getRatingLabel(score);

    return (
        <div
            className="fixed z-[100] w-64 bg-gradient-to-br from-slate-900 to-slate-950 border-2 shadow-2xl rounded-lg overflow-hidden pointer-events-none"
            style={{ ...style, borderColor: tierData.color }}
        >
            {/* Header with tier glow */}
            <div
                className="px-4 py-3 border-b border-slate-700/50"
                style={{ background: `linear-gradient(135deg, ${tierData.color}15, transparent)` }}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-lg leading-tight" style={{ color: tierData.color }}>
                            {item.name}
                            {item.plus > 0 && (() => {
                                const stage = getEnhanceStage(item.plus);
                                return (
                                    <span
                                        className="ml-2 px-1.5 py-0.5 rounded text-sm inline-flex items-center gap-0.5"
                                        style={{
                                            color: stage.color,
                                            backgroundColor: stage.bgColor,
                                            boxShadow: stage.glow
                                        }}
                                    >
                                        {stage.icon && <span className="text-xs">{stage.icon}</span>}
                                        +{item.plus}
                                    </span>
                                );
                            })()}
                        </div>
                        <div className="text-xs text-slate-400 uppercase font-bold mt-0.5 flex items-center gap-2">
                            <span style={{ color: tierData.color }}>{tierData.name}</span>
                            <span className="text-slate-600">|</span>
                            <span className="capitalize">{item.slot}</span>
                            {item.weaponType && (
                                <>
                                    <span className="text-slate-600">|</span>
                                    <span className="capitalize">{item.weaponType}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Rating Badge */}
                    <div
                        className="flex flex-col items-center px-2 py-1 rounded-lg"
                        style={{ backgroundColor: `${rating.color}20`, border: `1px solid ${rating.color}40` }}
                    >
                        <span className="text-[10px] text-slate-400 uppercase">Rating</span>
                        <span className="font-bold text-lg leading-none" style={{ color: rating.color }}>
                            {rating.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Base Stats Section */}
            <div className="px-4 py-3 border-b border-slate-700/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Base Stats</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                    {baseDmg > 0 && (
                        <div className="flex flex-col items-center p-1.5 bg-red-500/10 rounded">
                            <span className="text-[10px] text-red-400">DMG</span>
                            <span className="font-bold text-red-300">+{baseDmg}</span>
                        </div>
                    )}
                    {baseHp > 0 && (
                        <div className="flex flex-col items-center p-1.5 bg-green-500/10 rounded">
                            <span className="text-[10px] text-green-400">HP</span>
                            <span className="font-bold text-green-300">+{baseHp}</span>
                        </div>
                    )}
                    {baseArmor > 0 && (
                        <div className="flex flex-col items-center p-1.5 bg-blue-500/10 rounded">
                            <span className="text-[10px] text-blue-400">Armor</span>
                            <span className="font-bold text-blue-300">+{baseArmor}</span>
                        </div>
                    )}
                </div>

                {/* Weapon bonuses */}
                {item.slot === 'weapon' && weaponBase.speedBonus !== undefined && (
                    <div className="mt-2 space-y-1">
                        <div className="flex gap-3 text-xs">
                            {weaponBase.speedBonus !== 0 && (
                                <span className={weaponBase.speedBonus > 0 ? 'text-cyan-400' : 'text-orange-400'}>
                                    {formatBonus(weaponBase.speedBonus * 100)} Speed
                                </span>
                            )}
                            {weaponBase.critBonus > 0 && (
                                <span className="text-yellow-400">+{weaponBase.critBonus}% Crit</span>
                            )}
                        </div>
                        {/* Weapon scaling info */}
                        {weaponBase.scaling && (
                            <div className="text-[10px] text-slate-400">
                                Scales with <span className={{
                                    str: 'text-red-400',
                                    int: 'text-purple-400',
                                    agi: 'text-amber-400',
                                    vit: 'text-green-400',
                                }[weaponBase.scaling] || 'text-slate-300'}>
                                    {weaponBase.scaling.toUpperCase()}
                                </span>
                                <span className="text-slate-500"> (+{weaponBase.scaling === 'int' ? '3' : '2'}% DMG per point)</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Comparison Section - Only show when hovering inventory items */}
            {isInventoryItem && equippedItem && (
                <div className="px-4 py-3 border-b border-slate-700/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        vs Equipped: {equippedItem.name}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        {/* DMG comparison */}
                        <div className={`flex flex-col items-center p-1.5 rounded ${dmgDiff !== null ? (dmgDiff > 0 ? 'bg-green-500/15' : 'bg-red-500/15') : 'bg-slate-700/20'}`}>
                            <span className="text-[9px] text-slate-400">DMG</span>
                            <span className={`font-bold ${dmgDiff === null ? 'text-slate-400' : dmgDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dmgDiff === null ? '=' : dmgDiff > 0 ? `+${dmgDiff}` : dmgDiff}
                            </span>
                        </div>
                        {/* HP comparison */}
                        <div className={`flex flex-col items-center p-1.5 rounded ${hpDiff !== null ? (hpDiff > 0 ? 'bg-green-500/15' : 'bg-red-500/15') : 'bg-slate-700/20'}`}>
                            <span className="text-[9px] text-slate-400">HP</span>
                            <span className={`font-bold ${hpDiff === null ? 'text-slate-400' : hpDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {hpDiff === null ? '=' : hpDiff > 0 ? `+${hpDiff}` : hpDiff}
                            </span>
                        </div>
                        {/* Armor comparison */}
                        <div className={`flex flex-col items-center p-1.5 rounded ${armorDiff !== null ? (armorDiff > 0 ? 'bg-green-500/15' : 'bg-red-500/15') : 'bg-slate-700/20'}`}>
                            <span className="text-[9px] text-slate-400">ARM</span>
                            <span className={`font-bold ${armorDiff === null ? 'text-slate-400' : armorDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {armorDiff === null ? '=' : armorDiff > 0 ? `+${armorDiff}` : armorDiff}
                            </span>
                        </div>
                        {/* Score comparison */}
                        <div className={`flex flex-col items-center p-1.5 rounded ${scoreDiff !== null ? (scoreDiff > 0 ? 'bg-green-500/15' : 'bg-red-500/15') : 'bg-slate-700/20'}`}>
                            <span className="text-[9px] text-slate-400">PWR</span>
                            <span className={`font-bold ${scoreDiff === null ? 'text-slate-400' : scoreDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {scoreDiff === null ? '=' : scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff}
                            </span>
                        </div>
                    </div>
                    {/* Upgrade indicator */}
                    {scoreDiff !== null && (
                        <div className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wider ${scoreDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {scoreDiff > 0 ? '^ UPGRADE ^' : 'v DOWNGRADE v'}
                        </div>
                    )}
                </div>
            )}

            {/* Show "Empty slot" comparison when no item equipped */}
            {isInventoryItem && !equippedItem && (
                <div className="px-4 py-2 border-b border-slate-700/30 bg-green-500/5">
                    <div className="text-[10px] text-green-400 uppercase tracking-wider text-center font-bold">
                        Slot Empty - Equipping will add stats!
                    </div>
                </div>
            )}

            {/* Special Effects */}
            {effects.length > 0 && (() => {
                const regularEffects = effects.filter(e => !e.isAwakened);
                const awakenedEffects = effects.filter(e => e.isAwakened);

                // Helper to get roll quality percentage
                const getRollQuality = (effectId, value) => {
                    const effectDef = SPECIAL_EFFECTS.find(e => e.id === effectId);
                    if (!effectDef) return null;
                    const maxForTier = getEffectMaxForTier(effectDef, item.tier);
                    const minVal = effectDef.minVal;
                    const range = maxForTier - minVal;
                    if (range <= 0) return { percent: 100, max: Math.round(maxForTier) };
                    // If value exceeds max by 20%+, it's likely an awakening bonus without the flag
                    const isLikelyAwakened = value > maxForTier * 1.2;
                    if (isLikelyAwakened) return null; // Don't show roll quality for likely awakening effects
                    const percent = Math.min(100, Math.round(((value - minVal) / range) * 100));
                    return { percent, max: Math.round(maxForTier), min: minVal };
                };

                // Get color based on roll quality
                const getQualityColor = (percent) => {
                    if (percent >= 95) return '#fbbf24'; // Gold - perfect
                    if (percent >= 80) return '#22c55e'; // Green - great
                    if (percent >= 60) return '#3b82f6'; // Blue - good
                    if (percent >= 40) return '#94a3b8'; // Gray - average
                    return '#ef4444'; // Red - poor
                };

                return (
                    <div className="px-4 py-3 border-b border-slate-700/30">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                            <span>Special Effects</span>
                            {!shiftHeld && <span className="text-slate-600 normal-case">[Shift] max rolls</span>}
                        </div>

                        {/* Regular effects - full display with descriptions */}
                        {regularEffects.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                                {regularEffects.map((eff, i) => {
                                    const desc = EFFECT_DESCRIPTIONS[eff.id];
                                    // Only show roll quality for non-unique effects (unique = boss fixed)
                                    const quality = !eff.unique ? getRollQuality(eff.id, eff.value) : null;
                                    const isMaxRoll = quality && quality.percent >= 95;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-purple-300">
                                                    {eff.name}
                                                    {eff.unique && <span className="ml-1 text-[9px] text-yellow-500">(SET)</span>}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {shiftHeld && quality && (
                                                        <>
                                                            <span
                                                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                                style={{
                                                                    color: getQualityColor(quality.percent),
                                                                    backgroundColor: `${getQualityColor(quality.percent)}20`
                                                                }}
                                                            >
                                                                {quality.percent}%
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">
                                                                max: {quality.max}
                                                            </span>
                                                        </>
                                                    )}
                                                    {shiftHeld && eff.unique && (
                                                        <span className="text-[10px] text-yellow-500">fixed</span>
                                                    )}
                                                    <span className="font-mono font-bold text-sm text-purple-300">+{eff.value}</span>
                                                </div>
                                            </div>
                                            {desc && (
                                                <div className="text-[10px] text-slate-400">{desc(eff.value)}</div>
                                            )}
                                            {/* Roll quality bar when shift held - only for rolled effects */}
                                            {shiftHeld && quality && (
                                                <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{
                                                            width: `${quality.percent}%`,
                                                            backgroundColor: getQualityColor(quality.percent)
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Awakened effects - compact 2-column grid */}
                        {awakenedEffects.length > 0 && (
                            <div className="p-2 rounded bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                                <div className="text-[9px] text-orange-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <span className="text-yellow-400">★</span> Awakening Bonuses
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    {awakenedEffects.map((eff, i) => (
                                        <div key={i} className="flex items-center justify-between text-[11px]">
                                            <span className="text-orange-200 flex items-center gap-1">
                                                <span className="text-[9px] text-orange-400/70">+{eff.milestone}</span>
                                                {eff.name}
                                            </span>
                                            <span className="font-mono font-bold text-orange-300">+{eff.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Boss Set Info with Bonuses */}
            {item.bossSet && (BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet]) && (() => {
                const bossSet = BOSS_SETS[item.bossSet] || PRESTIGE_BOSS_SETS[item.bossSet];
                const isPrestigeSet = !!PRESTIGE_BOSS_SETS[item.bossSet];
                const hasSecretBonus = equippedSetPieces >= 9 && isPrestigeSet;
                const displayCount = hasSecretBonus ? '9/9' : `${equippedSetPieces}/8`;

                return (
                    <div className={`px-4 py-3 border-b border-slate-700/30 ${hasSecretBonus ? 'bg-gradient-to-r from-yellow-500/10 to-purple-500/10' : 'bg-purple-500/5'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-bold" style={{ color: bossSet.color }}>
                                    {bossSet.name} Set
                                </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${hasSecretBonus ? 'animate-pulse' : ''}`} style={{
                                backgroundColor: hasSecretBonus ? '#fbbf2440' : `${bossSet.color}20`,
                                color: hasSecretBonus ? '#fbbf24' : bossSet.color
                            }}>
                                {displayCount}
                            </span>
                        </div>
                        <div className="space-y-0.5 text-[10px]">
                            {bossSet.setBonuses.map((bonus, i) => {
                                // Hide secret bonus unless it's active
                                if (bonus.secret && equippedSetPieces < bonus.pieces) return null;

                                const isActive = equippedSetPieces >= bonus.pieces;
                                const isSecretActive = bonus.secret && isActive;

                                return (
                                    <div
                                        key={i}
                                        className={`flex gap-1.5 py-0.5 px-1 rounded ${
                                            isSecretActive
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
                                                : isActive
                                                    ? 'bg-green-500/10'
                                                    : 'opacity-40'
                                        }`}
                                    >
                                        <span className={`w-6 font-bold flex-shrink-0 ${isSecretActive ? 'text-yellow-400' : isActive ? 'text-green-400' : 'text-slate-600'}`}>
                                            {bonus.pieces}pc
                                        </span>
                                        <span className={`flex-1 ${isSecretActive ? 'text-yellow-300' : isActive ? 'text-green-300' : 'text-slate-500'}`}>
                                            {bonus.desc}
                                        </span>
                                        {isActive && (
                                            <svg className={`w-3 h-3 flex-shrink-0 ${isSecretActive ? 'text-yellow-400' : 'text-green-400'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {hasSecretBonus && (
                            <div className="mt-2 pt-2 border-t border-yellow-500/30 text-center">
                                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
                                    Secret Set Bonus Unlocked!
                                </span>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Enhancement Stage Info - compact inline format */}
            {item.plus >= 10 && (() => {
                const stage = getEnhanceStage(item.plus);
                return (
                    <div
                        className="px-4 py-1.5 border-t border-slate-700/30 flex items-center gap-2 flex-wrap"
                        style={{ background: `linear-gradient(135deg, ${stage.bgColor}, transparent)` }}
                    >
                        {stage.icon && (
                            <span style={{ color: stage.color }} className="text-sm">{stage.icon}</span>
                        )}
                        <span className="text-[10px] uppercase font-bold" style={{ color: stage.color }}>
                            {stage.name}
                        </span>
                        {item.plus >= 15 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: stage.color, backgroundColor: `${stage.color}20` }}>
                                {formatBonus((enhanceBonus.dmgMult - 1) * 100)} DMG
                            </span>
                        )}
                    </div>
                );
            })()}

            {/* Footer with Score */}
            <div className="px-4 py-2 bg-slate-950/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Item Power</span>
                <div className="flex items-center gap-2">
                    {(item.count || 1) > 1 && (
                        <span className="text-[10px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">x{item.count}</span>
                    )}
                    <span className="font-mono font-bold text-slate-300">{score}</span>
                </div>
            </div>
        </div>
    );
}
