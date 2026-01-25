import React from 'react';
import { useGame } from '../context/GameContext';
import { calculatePlayerStats } from '../systems/PlayerSystem';

/**
 * BuffDisplay - Shows active combat buffs/effects with stack counts and bonuses
 *
 * Displays:
 * - Rage stacks (0-10) with current damage bonus (+X% per stack)
 * - Damage Shield amount (absorbs damage, refreshes on kill)
 * - Overheal Shield amount (excess healing becomes shield)
 * - Second Wind availability (heals when HP drops below 20%)
 * - Frostbite (reduces enemy damage by X%)
 * - Last Stand (below 30% HP: +X% damage and lifesteal)
 * - Active DOTs (bleed, burn, poison) with remaining time
 */
export default function BuffDisplay({ compact = false }) {
    const { state } = useGame();

    if (!state?.combatState) return null;

    const combatState = state.combatState;
    const stats = calculatePlayerStats(state);

    // Collect active buffs
    const activeBuffs = [];

    // Rage stacks - each stack gives +X% damage where X is the rage stat
    if (stats.rage > 0) {
        const stacks = combatState.rageStacks || 0;
        const bonusDmg = Math.floor(stats.rage * stacks);
        const maxBonus = Math.floor(stats.rage * (stats.rageUncapped ? 999 : 10));
        activeBuffs.push({
            id: 'rage',
            name: 'Rage',
            icon: '/assets/ui-icons/buffs/rage.png',
            stacks: stacks,
            maxStacks: stats.rageUncapped ? null : 10,
            value: `+${bonusDmg}% DMG`,
            description: `+${stats.rage}% damage per stack (max ${maxBonus}%)`,
            color: '#b91c1c',
            bgColor: 'rgba(185, 28, 28, 0.3)',
            active: stacks > 0,
        });
    }

    // Damage Shield - absorbs damage, refreshes on kill
    if (stats.damageShield > 0 || combatState.damageShield > 0) {
        activeBuffs.push({
            id: 'shield',
            name: 'Shield',
            icon: '/assets/ui-icons/buffs/shield.png',
            value: combatState.damageShield > 0 ? `${combatState.damageShield} HP` : null,
            maxValue: stats.damageShield,
            description: `Absorbs ${stats.damageShield} damage, refreshes on kill`,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.3)',
            active: combatState.damageShield > 0,
        });
    }

    // Overheal Shield - excess healing becomes shield
    if (stats.overheal > 0 || combatState.overhealShield > 0) {
        activeBuffs.push({
            id: 'overheal',
            name: 'Overheal',
            icon: '/assets/ui-icons/buffs/overheal.png',
            value: combatState.overhealShield > 0 ? `${combatState.overhealShield} HP` : null,
            description: `${stats.overheal}% of excess healing becomes shield`,
            color: '#22d3ee',
            bgColor: 'rgba(34, 211, 238, 0.3)',
            active: combatState.overhealShield > 0,
        });
    }

    // Second Wind - emergency heal when below 20% HP
    if (stats.secondWind > 0) {
        activeBuffs.push({
            id: 'secondWind',
            name: '2nd Wind',
            icon: '/assets/ui-icons/buffs/secondwind.png',
            value: `${stats.secondWind}% heal`,
            description: 'Heals when HP drops below 20% (once per fight)',
            color: '#34d399',
            bgColor: 'rgba(52, 211, 153, 0.3)',
            active: !combatState.secondWindUsed,
            used: combatState.secondWindUsed,
        });
    }

    // Frostbite - reduces enemy damage
    if (stats.frostbite > 0) {
        activeBuffs.push({
            id: 'frostbite',
            name: 'Frostbite',
            icon: '/assets/ui-icons/buffs/frostbite.png',
            value: `-${stats.frostbite}% Enemy DMG`,
            description: `Reduces all enemy damage by ${stats.frostbite}%`,
            color: '#06b6d4',
            bgColor: 'rgba(6, 182, 212, 0.3)',
            active: true, // Always active as a passive effect
        });
    }

    // Last Stand - bonus damage and lifesteal when low HP
    if (stats.lastStand > 0) {
        const playerMaxHp = state.playerMaxHp || 100;
        const isLowHp = state.playerHp < playerMaxHp * 0.3;
        activeBuffs.push({
            id: 'lastStand',
            name: 'Last Stand',
            icon: '/assets/ui-icons/buffs/laststand.png',
            value: `+${stats.lastStand}% DMG/Steal`,
            description: `Below 30% HP: +${stats.lastStand}% damage AND +${stats.lastStand}% lifesteal`,
            color: '#dc2626',
            bgColor: 'rgba(220, 38, 38, 0.3)',
            active: isLowHp,
            conditional: true, // Shows when not active but available
        });
    }

    // DOT Effects on Enemy
    // Bleed - damage over 3 seconds
    if (stats.bleed > 0) {
        const ticksRemaining = combatState.bleedTimer || 0;
        activeBuffs.push({
            id: 'bleed',
            name: 'Bleed',
            icon: '/assets/ui-icons/buffs/bleed.png',
            value: `${stats.bleed}%`,
            description: `${stats.bleed}% weapon damage over 3 seconds`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 20) : null,
            color: '#dc2626',
            bgColor: 'rgba(220, 38, 38, 0.3)',
            active: ticksRemaining > 0,
            isDot: true,
        });
    }

    // Burn - damage over 3 seconds
    if (stats.burn > 0) {
        const ticksRemaining = combatState.burnTimer || 0;
        activeBuffs.push({
            id: 'burn',
            name: 'Burn',
            icon: '/assets/ui-icons/buffs/burn.png',
            value: `${stats.burn}%`,
            description: `${stats.burn}% weapon damage over 3 seconds`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 20) : null,
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.3)',
            active: ticksRemaining > 0,
            isDot: true,
        });
    }

    // Poison - damage over 4 seconds
    if (stats.poison > 0) {
        const ticksRemaining = combatState.poisonTimer || 0;
        activeBuffs.push({
            id: 'poison',
            name: 'Poison',
            icon: '/assets/ui-icons/buffs/poison.png',
            value: `${stats.poison}%`,
            description: `${stats.poison}% weapon damage over 4 seconds`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 20) : null,
            color: '#22c55e',
            bgColor: 'rgba(34, 197, 94, 0.3)',
            active: ticksRemaining > 0,
            isDot: true,
        });
    }

    // Don't render if no buffs to show
    if (activeBuffs.length === 0) return null;

    if (compact) {
        return (
            <div className="flex flex-wrap gap-1 justify-center py-0.5">
                {activeBuffs.map(buff => (
                    <BuffIconCompact key={buff.id} buff={buff} />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            {activeBuffs.map(buff => (
                <BuffIcon key={buff.id} buff={buff} />
            ))}
        </div>
    );
}

/**
 * Individual buff icon with stack count and value display
 */
function BuffIcon({ buff }) {
    const isInactive = !buff.active || buff.used;
    // Conditional buffs (like Last Stand) show as "ready" when not yet active
    const isConditionalWaiting = buff.conditional && !buff.active;

    return (
        <div
            className={`relative flex items-center gap-1 px-1.5 py-1 rounded-md border transition-all ${
                isInactive && !isConditionalWaiting ? 'opacity-40 grayscale' : ''
            } ${isConditionalWaiting ? 'opacity-60' : ''}`}
            style={{
                backgroundColor: buff.bgColor,
                borderColor: buff.color,
                borderWidth: '1px',
            }}
            title={`${buff.name}${buff.value ? `: ${buff.value}` : ''}${buff.stacks !== undefined ? ` (${buff.stacks}${buff.maxStacks ? '/' + buff.maxStacks : ''} stacks)` : ''}${buff.description ? '\n' + buff.description : ''}`}
        >
            {/* Icon */}
            <img
                src={buff.icon}
                alt={buff.name}
                className="w-5 h-5 pixelated"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* Stack count badge */}
            {buff.stacks !== undefined && buff.stacks > 0 && (
                <div
                    className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-0.5"
                    style={{ backgroundColor: buff.color }}
                >
                    {buff.stacks}{buff.maxStacks ? `/${buff.maxStacks}` : ''}
                </div>
            )}

            {/* Value display */}
            {buff.value && (
                <span
                    className="text-[10px] font-bold whitespace-nowrap"
                    style={{ color: buff.color }}
                >
                    {buff.value}
                </span>
            )}

            {/* Timer for DOTs */}
            {buff.timer && (
                <span className="text-[9px] text-slate-400 font-mono">
                    {buff.timer}s
                </span>
            )}

            {/* Used indicator for Second Wind */}
            {buff.used && (
                <span className="text-[9px] text-slate-500 font-bold">USED</span>
            )}

            {/* Conditional waiting indicator (e.g., Last Stand when HP > 30%) */}
            {buff.conditional && !buff.active && !buff.used && (
                <span className="text-[9px] text-slate-400 font-bold">READY</span>
            )}

            {/* Active indicator for conditional buffs when triggered */}
            {buff.conditional && buff.active && (
                <span className="text-[9px] text-yellow-400 font-bold animate-pulse">ACTIVE!</span>
            )}
        </div>
    );
}

/**
 * Compact buff icon for mobile/small displays
 */
function BuffIconCompact({ buff }) {
    const isInactive = !buff.active || buff.used;
    const isConditionalWaiting = buff.conditional && !buff.active;

    return (
        <div
            className={`relative flex items-center justify-center w-7 h-7 rounded border transition-all ${
                isInactive && !isConditionalWaiting ? 'opacity-40 grayscale' : ''
            } ${isConditionalWaiting ? 'opacity-60' : ''}`}
            style={{
                backgroundColor: buff.bgColor,
                borderColor: buff.color,
                borderWidth: '1px',
            }}
            title={`${buff.name}${buff.value ? `: ${buff.value}` : ''}${buff.stacks !== undefined ? ` (${buff.stacks}${buff.maxStacks ? '/' + buff.maxStacks : ''} stacks)` : ''}${buff.description ? '\n' + buff.description : ''}`}
        >
            <img
                src={buff.icon}
                alt={buff.name}
                className="w-5 h-5 pixelated"
                style={{ imageRendering: 'pixelated' }}
            />

            {/* Stack count badge */}
            {buff.stacks !== undefined && buff.stacks > 0 && (
                <div
                    className="absolute -top-1 -right-1 min-w-[12px] h-[12px] flex items-center justify-center rounded-full text-[8px] font-bold text-white px-0.5"
                    style={{ backgroundColor: buff.color }}
                >
                    {buff.stacks}
                </div>
            )}

            {/* Timer indicator for DOTs */}
            {buff.timer && buff.active && (
                <div
                    className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-b"
                    style={{ backgroundColor: buff.color, opacity: 0.7 }}
                />
            )}

            {/* Used X overlay */}
            {buff.used && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-500 text-lg font-bold opacity-80">X</span>
                </div>
            )}

            {/* Conditional active glow */}
            {buff.conditional && buff.active && (
                <div
                    className="absolute inset-0 rounded border-2 animate-pulse"
                    style={{ borderColor: buff.color }}
                />
            )}
        </div>
    );
}
