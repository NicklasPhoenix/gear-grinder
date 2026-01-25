import React from 'react';
import { useGame } from '../context/GameContext';
import { calculatePlayerStats } from '../systems/PlayerSystem';

/**
 * BuffDisplay - Shows active combat buffs/effects with stack counts and bonuses
 *
 * Displays:
 * - Rage stacks (0-10) with current damage bonus
 * - Damage Shield amount
 * - Overheal Shield amount
 * - Active DOTs (bleed, burn, poison) with remaining time
 * - Second Wind availability
 */
export default function BuffDisplay({ compact = false }) {
    const { state } = useGame();

    if (!state?.combatState) return null;

    const combatState = state.combatState;
    const stats = calculatePlayerStats(state);

    // Collect active buffs
    const activeBuffs = [];

    // Rage stacks
    if (stats.rage > 0) {
        const stacks = combatState.rageStacks || 0;
        const bonusDmg = Math.floor(stats.rage * stacks);
        activeBuffs.push({
            id: 'rage',
            name: 'Rage',
            icon: '/assets/ui-icons/buffs/rage.png',
            stacks: stacks,
            maxStacks: stats.rageUncapped ? null : 10,
            value: bonusDmg > 0 ? `+${bonusDmg}%` : null,
            color: '#b91c1c',
            bgColor: 'rgba(185, 28, 28, 0.3)',
            active: true,
        });
    }

    // Damage Shield
    if (stats.damageShield > 0 || combatState.damageShield > 0) {
        activeBuffs.push({
            id: 'shield',
            name: 'Shield',
            icon: '/assets/ui-icons/buffs/shield.png',
            value: combatState.damageShield > 0 ? combatState.damageShield : null,
            maxValue: stats.damageShield,
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.3)',
            active: combatState.damageShield > 0,
        });
    }

    // Overheal Shield
    if (stats.overheal > 0 || combatState.overhealShield > 0) {
        activeBuffs.push({
            id: 'overheal',
            name: 'Overheal',
            icon: '/assets/ui-icons/buffs/overheal.png',
            value: combatState.overhealShield > 0 ? combatState.overhealShield : null,
            color: '#22d3ee',
            bgColor: 'rgba(34, 211, 238, 0.3)',
            active: combatState.overhealShield > 0,
        });
    }

    // Second Wind (show if available, not used)
    if (stats.secondWind > 0) {
        activeBuffs.push({
            id: 'secondWind',
            name: '2nd Wind',
            icon: '/assets/ui-icons/buffs/secondwind.png',
            value: `${stats.secondWind}%`,
            color: '#34d399',
            bgColor: 'rgba(52, 211, 153, 0.3)',
            active: !combatState.secondWindUsed,
            used: combatState.secondWindUsed,
        });
    }

    // DOT Effects on Enemy
    // Bleed
    if (stats.bleed > 0) {
        const ticksRemaining = combatState.bleedTimer || 0;
        activeBuffs.push({
            id: 'bleed',
            name: 'Bleed',
            icon: '/assets/ui-icons/buffs/bleed.png',
            value: `${stats.bleed}%`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 4) : null, // ~4 ticks per second
            color: '#dc2626',
            bgColor: 'rgba(220, 38, 38, 0.3)',
            active: ticksRemaining > 0,
            isDot: true,
        });
    }

    // Burn
    if (stats.burn > 0) {
        const ticksRemaining = combatState.burnTimer || 0;
        activeBuffs.push({
            id: 'burn',
            name: 'Burn',
            icon: '/assets/ui-icons/buffs/burn.png',
            value: `${stats.burn}%`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 4) : null,
            color: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.3)',
            active: ticksRemaining > 0,
            isDot: true,
        });
    }

    // Poison
    if (stats.poison > 0) {
        const ticksRemaining = combatState.poisonTimer || 0;
        activeBuffs.push({
            id: 'poison',
            name: 'Poison',
            icon: '/assets/ui-icons/buffs/poison.png',
            value: `${stats.poison}%`,
            timer: ticksRemaining > 0 ? Math.ceil(ticksRemaining / 4) : null,
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

    return (
        <div
            className={`relative flex items-center gap-1 px-1.5 py-1 rounded-md border transition-all ${
                isInactive ? 'opacity-40 grayscale' : ''
            }`}
            style={{
                backgroundColor: buff.bgColor,
                borderColor: buff.color,
                borderWidth: '1px',
            }}
            title={`${buff.name}${buff.value ? `: ${buff.value}` : ''}${buff.stacks !== undefined ? ` (${buff.stacks} stacks)` : ''}`}
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
        </div>
    );
}

/**
 * Compact buff icon for mobile/small displays
 */
function BuffIconCompact({ buff }) {
    const isInactive = !buff.active || buff.used;

    return (
        <div
            className={`relative flex items-center justify-center w-7 h-7 rounded border transition-all ${
                isInactive ? 'opacity-40 grayscale' : ''
            }`}
            style={{
                backgroundColor: buff.bgColor,
                borderColor: buff.color,
                borderWidth: '1px',
            }}
            title={`${buff.name}${buff.value ? `: ${buff.value}` : ''}${buff.stacks !== undefined ? ` (${buff.stacks} stacks)` : ''}`}
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
        </div>
    );
}
