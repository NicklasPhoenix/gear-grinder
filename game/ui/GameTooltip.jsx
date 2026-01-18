import React from 'react';
import { TIERS, GEAR_BASES, WEAPON_TYPES, PRESTIGE_WEAPONS, BOSS_SETS, getItemScore } from '../data/items';
import { getEnhanceBonus } from '../utils/formulas';

// Effect descriptions - what each effect actually does
const EFFECT_DESCRIPTIONS = {
    thorns: (val) => `Reflect ${val}% damage back to attackers`,
    lifesteal: (val) => `Heal for ${val}% of damage dealt`,
    critChance: (val) => `+${val}% chance to deal critical hits`,
    critDamage: (val) => `+${val}% critical hit damage`,
    bonusDmg: (val) => `+${val} flat damage bonus`,
    bonusHp: (val) => `+${val} maximum HP`,
    goldFind: (val) => `+${val}% gold from enemies`,
    xpBonus: (val) => `+${val}% experience gained`,
    dodge: (val) => `${val}% chance to avoid attacks`,
};

export default function GameTooltip({ tooltip }) {
    if (!tooltip || !tooltip.item) return null;

    const { item, position, gear } = tooltip;

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

    // Calculate position to keep on screen
    let style = {
        top: position.y + 10,
        left: position.x + 10,
    };

    if (position.x > window.innerWidth - 300) {
        style.left = position.x - 260;
    }
    if (position.y > window.innerHeight - 400) {
        style.top = position.y - 200;
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
                            {item.plus > 0 && <span className="text-white ml-1">+{item.plus}</span>}
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
                    <div className="mt-2 flex gap-3 text-xs">
                        {weaponBase.speedBonus !== 0 && (
                            <span className={weaponBase.speedBonus > 0 ? 'text-cyan-400' : 'text-orange-400'}>
                                {weaponBase.speedBonus > 0 ? '+' : ''}{(weaponBase.speedBonus * 100).toFixed(0)}% Speed
                            </span>
                        )}
                        {weaponBase.critBonus > 0 && (
                            <span className="text-yellow-400">+{weaponBase.critBonus}% Crit</span>
                        )}
                    </div>
                )}
            </div>

            {/* Special Effects */}
            {effects.length > 0 && (
                <div className="px-4 py-3 border-b border-slate-700/30">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Special Effects</div>
                    <div className="space-y-2">
                        {effects.map((eff, i) => {
                            const desc = EFFECT_DESCRIPTIONS[eff.id];
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-300 text-sm font-bold">{eff.name}</span>
                                        <span className="font-mono font-bold text-purple-300 text-sm">+{eff.value}</span>
                                    </div>
                                    {desc && (
                                        <div className="text-[10px] text-slate-400 mt-0.5">{desc(eff.value)}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Boss Set Info with Bonuses */}
            {item.bossSet && BOSS_SETS[item.bossSet] && (
                <div className="px-4 py-3 border-b border-slate-700/30 bg-purple-500/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-bold" style={{ color: BOSS_SETS[item.bossSet].color }}>
                                {BOSS_SETS[item.bossSet].name} Set
                            </span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{
                            backgroundColor: `${BOSS_SETS[item.bossSet].color}20`,
                            color: BOSS_SETS[item.bossSet].color
                        }}>
                            {equippedSetPieces}/8
                        </span>
                    </div>
                    <div className="space-y-1.5 text-[10px]">
                        {BOSS_SETS[item.bossSet].setBonuses.map((bonus, i) => {
                            const isActive = equippedSetPieces >= bonus.pieces;
                            return (
                                <div
                                    key={i}
                                    className={`flex gap-2 p-1.5 rounded ${isActive ? 'bg-green-500/10 border border-green-500/30' : 'opacity-40'}`}
                                >
                                    <span className={`w-8 font-bold ${isActive ? 'text-green-400' : 'text-slate-600'}`}>
                                        {bonus.pieces}pc:
                                    </span>
                                    <span className={isActive ? 'text-green-300' : 'text-slate-500'}>
                                        {bonus.desc}
                                    </span>
                                    {isActive && (
                                        <svg className="w-3 h-3 text-green-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Enhancement Info */}
            {item.plus > 0 && enhanceBonus.dmgMult > 1 && (
                <div className="px-4 py-2 bg-yellow-500/5">
                    <div className="text-[10px] text-yellow-400/70 uppercase tracking-wider">Enhancement Bonus</div>
                    <div className="text-sm text-yellow-300">
                        +{((enhanceBonus.dmgMult - 1) * 100).toFixed(0)}% Total Damage
                    </div>
                </div>
            )}

            {/* Footer with Score */}
            <div className="px-4 py-2 bg-slate-950/50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Item Power</span>
                <span className="font-mono font-bold text-slate-300">{score}</span>
            </div>
        </div>
    );
}
