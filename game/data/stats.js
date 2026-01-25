// Primary Stats - Weapon scaling + one basic bonus
export const PRIMARY_STATS = {
    str: { name: 'Strength', color: '#ef4444', desc: '+1 base DMG, +3% STR weapon DMG per point', icon: '⚔️' },
    int: { name: 'Intelligence', color: '#8b5cf6', desc: '+1 base DMG, +3% INT weapon DMG per point', icon: '✨' },
    vit: { name: 'Vitality', color: '#22c55e', desc: '+10 HP, +2% VIT weapon DMG per point', icon: '❤️' },
    agi: { name: 'Agility', color: '#f59e0b', desc: '+1% attack speed, +2% AGI weapon DMG per point', icon: '💨' },
};

// Secondary Stats - Must be skilled separately for specialization
export const SECONDARY_STATS = {
    critChance: { name: 'Crit Chance', color: '#fde047', desc: '+1% critical hit chance per point', icon: '🎯' },
    critDamage: { name: 'Crit Damage', color: '#fb923c', desc: '+5% critical damage per point', icon: '💥' },
    dodge: { name: 'Dodge', color: '#34d399', desc: '+1% dodge chance per point', icon: '🌀' },
    armor: { name: 'Armor', color: '#60a5fa', desc: '+3 armor per point', icon: '🛡️' },
    hpRegen: { name: 'HP Regen', color: '#4ade80', desc: '+0.2% HP regen/sec per point', icon: '💚' },
    dmgReduction: { name: 'Dmg Reduction', color: '#38bdf8', desc: '+0.5% damage reduction per point', icon: '🔰' },
    xpBonus: { name: 'XP Bonus', color: '#a78bfa', desc: '+2% XP gained per point', icon: '📚' },
    silverFind: { name: 'Silver Find', color: '#94a3b8', desc: '+1% silver drop per point', icon: '💰' },
    dropRate: { name: 'Drop Rate', color: '#2dd4bf', desc: '+1% item/material drop rate per point', icon: '🎁' },
};

// Combined for backwards compatibility
export const STATS = {
    ...PRIMARY_STATS,
};

// All stat keys
export const PRIMARY_STAT_KEYS = Object.keys(PRIMARY_STATS);
export const SECONDARY_STAT_KEYS = Object.keys(SECONDARY_STATS);
