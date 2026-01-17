export const SKILLS = [
    { id: 0, name: 'Power Strike', desc: '+15% damage', unlockLevel: 3, effect: { dmgMult: 0.15 } },
    { id: 1, name: 'Toughness', desc: '+20% HP', unlockLevel: 6, effect: { hpMult: 0.2 } },
    { id: 2, name: 'Gold Rush', desc: '+10% gold', unlockLevel: 10, effect: { goldMult: 0.10 } },
    { id: 3, name: 'Swift Blade', desc: '+20% attack speed', unlockLevel: 15, effect: { speedMult: 0.2 } },
    { id: 4, name: 'Berserker', desc: '+30% damage', unlockLevel: 22, effect: { dmgMult: 0.3 } },
    { id: 5, name: 'Fortitude', desc: '+35% HP', unlockLevel: 30, effect: { hpMult: 0.35 } },
    { id: 6, name: 'Lucky Find', desc: '+10% material drop', unlockLevel: 38, effect: { matMult: 0.1 } },
    { id: 7, name: 'Mastery', desc: '+50% all stats', unlockLevel: 50, effect: { dmgMult: 0.5, hpMult: 0.5 } },
    { id: 8, name: 'Vampiric', desc: '+3% base lifesteal', unlockLevel: 65, effect: { lifesteal: 3 } },
    { id: 9, name: 'Critical Eye', desc: '+10% crit chance', unlockLevel: 80, effect: { critChance: 10 } },
    { id: 10, name: 'Thorny Skin', desc: '10% thorns damage', unlockLevel: 95, effect: { thorns: 10 } },
    { id: 11, name: 'Transcendence', desc: '+100% all stats', unlockLevel: 120, effect: { dmgMult: 1.0, hpMult: 1.0 } },
];

export const PRESTIGE_SKILLS = [
    { id: 0, name: 'Eternal Strength', desc: '+10% base DMG per level', maxLevel: 20, cost: (lvl) => Math.floor(2 * Math.pow(1.5, lvl)), effect: { dmgMult: 0.10 } },
    { id: 1, name: 'Eternal Vitality', desc: '+10% base HP per level', maxLevel: 20, cost: (lvl) => Math.floor(2 * Math.pow(1.5, lvl)), effect: { hpMult: 0.10 } },
    { id: 2, name: 'Eternal Fortune', desc: '+5% gold find per level', maxLevel: 15, cost: (lvl) => Math.floor(3 * Math.pow(1.4, lvl)), effect: { goldMult: 0.05 } },
    { id: 3, name: 'Eternal Haste', desc: '+5% attack speed per level', maxLevel: 10, cost: (lvl) => Math.floor(5 * Math.pow(1.6, lvl)), effect: { speedMult: 0.05 } },
    { id: 4, name: 'Eternal Precision', desc: '+3% crit chance per level', maxLevel: 15, cost: (lvl) => Math.floor(4 * Math.pow(1.5, lvl)), effect: { critChance: 3 } },
    { id: 5, name: 'Eternal Fury', desc: '+15% crit damage per level', maxLevel: 20, cost: (lvl) => Math.floor(3 * Math.pow(1.4, lvl)), effect: { critDamage: 15 } },
    { id: 6, name: 'Eternal Guard', desc: '+5 base armor per level', maxLevel: 25, cost: (lvl) => Math.floor(2 * Math.pow(1.3, lvl)), effect: { armor: 5 } },
    { id: 7, name: 'Eternal Leech', desc: '+1% lifesteal per level', maxLevel: 10, cost: (lvl) => Math.floor(8 * Math.pow(1.8, lvl)), effect: { lifesteal: 1 } },
    { id: 8, name: 'Starting Bonus', desc: '+50 gold, +10 ore/leather on prestige per level', maxLevel: 10, cost: (lvl) => Math.floor(5 * Math.pow(1.5, lvl)), effect: { startGold: 50, startOre: 10, startLeather: 10 } },
    { id: 9, name: 'XP Mastery', desc: '+10% XP gain per level', maxLevel: 15, cost: (lvl) => Math.floor(4 * Math.pow(1.5, lvl)), effect: { xpBonus: 10 } },
];
