import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Button } from './components/ui/button';

// Game constants
const ZONES = [
  { id: 0, name: 'Forest Clearing', enemyHp: 30, enemyDmg: 3, goldMin: 3, goldMax: 8, killsRequired: 0,
    enemyType: 'Beast', drops: { ore: 0.25, leather: 0.35, enhanceStone: 0.08, blessedOrb: 0, celestialShard: 0 }, isBoss: false },
  { id: 1, name: 'Dark Woods', enemyHp: 80, enemyDmg: 8, goldMin: 8, goldMax: 15, killsRequired: 20,
    enemyType: 'Beast', drops: { ore: 0.30, leather: 0.40, enhanceStone: 0.12, blessedOrb: 0.02, celestialShard: 0 }, isBoss: false },
  { id: 2, name: '🔥 Forest Guardian', enemyHp: 250, enemyDmg: 15, goldMin: 30, goldMax: 60, killsRequired: 30,
    enemyType: 'Boss', drops: { ore: 0.80, leather: 0.80, enhanceStone: 0.40, blessedOrb: 0.15, celestialShard: 0 }, isBoss: true, bossSet: 'guardian' },
  { id: 3, name: 'Goblin Caves', enemyHp: 200, enemyDmg: 18, goldMin: 15, goldMax: 30, killsRequired: 10,
    enemyType: 'Humanoid', drops: { ore: 0.45, leather: 0.30, enhanceStone: 0.18, blessedOrb: 0.04, celestialShard: 0 }, isBoss: false },
  { id: 4, name: 'Undead Crypt', enemyHp: 450, enemyDmg: 35, goldMin: 30, goldMax: 60, killsRequired: 40,
    enemyType: 'Undead', drops: { ore: 0.35, leather: 0.20, enhanceStone: 0.28, blessedOrb: 0.08, celestialShard: 0.01 }, isBoss: false },
  { id: 5, name: '🔥 Lich King', enemyHp: 1200, enemyDmg: 60, goldMin: 100, goldMax: 200, killsRequired: 50,
    enemyType: 'Boss', drops: { ore: 0.70, leather: 0.60, enhanceStone: 0.50, blessedOrb: 0.25, celestialShard: 0.08 }, isBoss: true, bossSet: 'lich' },
  { id: 6, name: 'Dragon Peak', enemyHp: 1000, enemyDmg: 75, goldMin: 60, goldMax: 120, killsRequired: 15,
    enemyType: 'Dragon', drops: { ore: 0.50, leather: 0.45, enhanceStone: 0.30, blessedOrb: 0.12, celestialShard: 0.03 }, isBoss: false },
  { id: 7, name: '🔥 Ancient Dragon', enemyHp: 2800, enemyDmg: 120, goldMin: 200, goldMax: 400, killsRequired: 60,
    enemyType: 'Boss', drops: { ore: 0.85, leather: 0.85, enhanceStone: 0.60, blessedOrb: 0.35, celestialShard: 0.15 }, isBoss: true, bossSet: 'dragon' },
  { id: 8, name: 'Void Realm', enemyHp: 2500, enemyDmg: 140, goldMin: 150, goldMax: 300, killsRequired: 20,
    enemyType: 'Demon', drops: { ore: 0.40, leather: 0.35, enhanceStone: 0.40, blessedOrb: 0.18, celestialShard: 0.06 }, isBoss: false },
  { id: 9, name: 'Frozen Wastes', enemyHp: 6000, enemyDmg: 260, goldMin: 300, goldMax: 550, killsRequired: 80,
    enemyType: 'Elemental', drops: { ore: 0.60, leather: 0.25, enhanceStone: 0.45, blessedOrb: 0.22, celestialShard: 0.10 }, isBoss: false },
  { id: 10, name: '🔥 Frost Titan', enemyHp: 15000, enemyDmg: 450, goldMin: 800, goldMax: 1500, killsRequired: 100,
    enemyType: 'Boss', drops: { ore: 0.90, leather: 0.70, enhanceStone: 0.70, blessedOrb: 0.45, celestialShard: 0.25 }, isBoss: true, bossSet: 'frost' },
  { id: 11, name: 'Demon Fortress', enemyHp: 12000, enemyDmg: 480, goldMin: 500, goldMax: 900, killsRequired: 30,
    enemyType: 'Demon', drops: { ore: 0.55, leather: 0.40, enhanceStone: 0.50, blessedOrb: 0.28, celestialShard: 0.15 }, isBoss: false },
  { id: 12, name: '🔥 Demon Lord', enemyHp: 28000, enemyDmg: 750, goldMin: 1500, goldMax: 2800, killsRequired: 120,
    enemyType: 'Boss', drops: { ore: 0.85, leather: 0.80, enhanceStone: 0.75, blessedOrb: 0.55, celestialShard: 0.35 }, isBoss: true, bossSet: 'demon' },
  { id: 13, name: 'Celestial Tower', enemyHp: 25000, enemyDmg: 850, goldMin: 800, goldMax: 1500, killsRequired: 40,
    enemyType: 'Celestial', drops: { ore: 0.50, leather: 0.35, enhanceStone: 0.55, blessedOrb: 0.35, celestialShard: 0.22 }, isBoss: false },
  { id: 14, name: '🔥 Seraph Commander', enemyHp: 55000, enemyDmg: 1300, goldMin: 2500, goldMax: 4500, killsRequired: 150,
    enemyType: 'Boss', drops: { ore: 0.90, leather: 0.75, enhanceStone: 0.80, blessedOrb: 0.65, celestialShard: 0.45 }, isBoss: true, bossSet: 'seraph' },
  { id: 15, name: 'Abyssal Depths', enemyHp: 60000, enemyDmg: 1400, goldMin: 1500, goldMax: 2800, killsRequired: 50,
    enemyType: 'Abyssal', drops: { ore: 0.55, leather: 0.45, enhanceStone: 0.60, blessedOrb: 0.40, celestialShard: 0.28 }, isBoss: false },
  { id: 16, name: '🔥 Void Emperor', enemyHp: 120000, enemyDmg: 2200, goldMin: 4500, goldMax: 8000, killsRequired: 180,
    enemyType: 'Boss', drops: { ore: 0.95, leather: 0.85, enhanceStone: 0.85, blessedOrb: 0.75, celestialShard: 0.55 }, isBoss: true, bossSet: 'void' },
  { id: 17, name: 'Chaos Realm', enemyHp: 150000, enemyDmg: 2500, goldMin: 3000, goldMax: 5500, killsRequired: 60,
    enemyType: 'Chaos', drops: { ore: 0.60, leather: 0.50, enhanceStone: 0.65, blessedOrb: 0.45, celestialShard: 0.35 }, isBoss: false },
  { id: 18, name: '🔥 Chaos God', enemyHp: 280000, enemyDmg: 4000, goldMin: 8000, goldMax: 15000, killsRequired: 200,
    enemyType: 'Boss', drops: { ore: 1.0, leather: 0.95, enhanceStone: 0.90, blessedOrb: 0.85, celestialShard: 0.70 }, isBoss: true, bossSet: 'chaos' },
  { id: 19, name: 'Eternal Void', enemyHp: 350000, enemyDmg: 4500, goldMin: 6000, goldMax: 12000, killsRequired: 70,
    enemyType: 'Void', drops: { ore: 0.70, leather: 0.60, enhanceStone: 0.75, blessedOrb: 0.55, celestialShard: 0.45 }, isBoss: false },
  { id: 20, name: '🔥 Eternal One', enemyHp: 650000, enemyDmg: 7500, goldMin: 15000, goldMax: 28000, killsRequired: 250,
    enemyType: 'Boss', drops: { ore: 1.0, leather: 1.0, enhanceStone: 1.0, blessedOrb: 1.0, celestialShard: 0.90 }, isBoss: true, bossSet: 'eternal' },
];

const MATERIALS = {
  ore: { name: 'Iron Ore', color: '#94a3b8', icon: '⛏️' },
  leather: { name: 'Leather', color: '#d97706', icon: '🧶' },
  enhanceStone: { name: 'E.Stone', color: '#60a5fa', icon: '💎' },
  blessedOrb: { name: 'B.Orb', color: '#c084fc', icon: '🔮' },
  celestialShard: { name: 'C.Shard', color: '#fbbf24', icon: '✨' },
};

// Stats system
const STATS = {
  str: { name: 'Strength', color: '#ef4444', desc: 'Physical damage, melee weapons' },
  int: { name: 'Intelligence', color: '#8b5cf6', desc: 'Magic damage, staff/wand power' },
  vit: { name: 'Vitality', color: '#22c55e', desc: 'Max HP, HP regen' },
  agi: { name: 'Agility', color: '#f59e0b', desc: 'Crit chance, dodge, attack speed' },
  lck: { name: 'Luck', color: '#06b6d4', desc: 'Gold find, drop rates, crit damage' },
};

const GEAR_SLOTS = ['weapon', 'helmet', 'armor', 'boots', 'accessory', 'shield', 'gloves', 'amulet'];
const TIERS = [
  { id: 0, name: 'Common', color: '#9ca3af', statMult: 1, oreCost: 3, leatherCost: 2, goldCost: 20 },
  { id: 1, name: 'Uncommon', color: '#22c55e', statMult: 1.8, oreCost: 8, leatherCost: 7, goldCost: 80 },
  { id: 2, name: 'Rare', color: '#3b82f6', statMult: 3, oreCost: 20, leatherCost: 20, goldCost: 250 },
  { id: 3, name: 'Epic', color: '#a855f7', statMult: 5, oreCost: 50, leatherCost: 50, goldCost: 800 },
  { id: 4, name: 'Legendary', color: '#f97316', statMult: 8, oreCost: 120, leatherCost: 130, goldCost: 2500 },
  { id: 5, name: 'Mythic', color: '#ec4899', statMult: 12, oreCost: 300, leatherCost: 300, goldCost: 8000 },
  { id: 6, name: 'Divine', color: '#fbbf24', statMult: 18, oreCost: 750, leatherCost: 750, goldCost: 25000 },
];

// Named gear for each tier - makes the game feel more immersive
const GEAR_NAMES = {
  sword: ['Rusty Blade', 'Iron Sword', 'Steel Saber', 'Crimson Edge', 'Dragonslayer', 'Soul Reaver', 'Excalibur'],
  staff: ['Wooden Staff', 'Oak Wand', 'Crystal Staff', 'Arcane Focus', 'Void Scepter', 'Starweaver', 'Celestial Rod'],
  dagger: ['Shiv', 'Stiletto', 'Shadow Fang', 'Viper Strike', 'Assassin Blade', 'Nightfall', 'Eclipse Dagger'],
  mace: ['Club', 'Flanged Mace', 'War Hammer', 'Skull Crusher', 'Titan Maul', 'Earthshaker', 'Divine Judgment'],
  helmet: ['Cloth Cap', 'Leather Hood', 'Chain Coif', 'Knight Helm', 'Dragon Visor', 'Phoenix Crown', 'Halo of Light'],
  armor: ['Cloth Tunic', 'Leather Vest', 'Chainmail', 'Plate Armor', 'Dragon Scale', 'Abyssal Plate', 'Radiant Aegis'],
  boots: ['Sandals', 'Leather Boots', 'Chain Greaves', 'Plated Boots', 'Dragonskin Treads', 'Voidwalkers', 'Angelic Steps'],
  accessory: ['Copper Ring', 'Silver Band', 'Sapphire Ring', 'Amethyst Loop', 'Phoenix Signet', 'Chaos Band', 'Ring of Eternity'],
  shield: ['Wooden Shield', 'Iron Buckler', 'Steel Kite', 'Tower Shield', 'Dragon Guard', 'Bulwark', 'Aegis of Dawn'],
  gloves: ['Cloth Wraps', 'Leather Gloves', 'Chain Gauntlets', 'Plate Fists', 'Drake Claws', 'Void Grip', 'Hands of Fate'],
  amulet: ['Bead Necklace', 'Bronze Pendant', 'Silver Locket', 'Mystic Amulet', 'Dragon Heart', 'Soul Gem', 'Tear of the Gods'],
};

// Boss Set Items - Unique gear from boss zones
const BOSS_SETS = {
  guardian: {
    name: "Guardian's", color: '#22c55e',
    items: {
      weapon: { name: "Guardian's Greatsword", effect: { id: 'bonusDmg', name: '+DMG', value: 25 } },
      helmet: { name: "Guardian's Crown", effect: { id: 'bonusHp', name: '+HP', value: 100 } },
      armor: { name: "Guardian's Plate", effect: { id: 'thorns', name: 'Thorns', value: 15 } },
      boots: { name: "Guardian's Treads", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+15% HP', effect: { hpMult: 0.15 } },
      { pieces: 4, desc: '+20% DMG, +10% Thorns', effect: { dmgMult: 0.20, thorns: 10 } },
    ]
  },
  lich: {
    name: "Lich", color: '#8b5cf6',
    items: {
      weapon: { name: "Lich's Staff", effect: { id: 'critDamage', name: 'Crit DMG', value: 80 } },
      helmet: { name: "Lich's Crown", effect: { id: 'lifesteal', name: 'Lifesteal', value: 12 } },
      armor: { name: "Lich's Robes", effect: { id: 'bonusHp', name: '+HP', value: 150 } },
      gloves: { name: "Lich's Grasp", effect: { id: 'critChance', name: 'Crit', value: 15 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+10% Lifesteal', effect: { lifesteal: 10 } },
      { pieces: 4, desc: '+25% Crit DMG, +30% DMG', effect: { critDamage: 25, dmgMult: 0.30 } },
    ]
  },
  dragon: {
    name: "Dragonborn", color: '#ef4444',
    items: {
      weapon: { name: "Dragonborn Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 45 } },
      helmet: { name: "Dragonborn Horns", effect: { id: 'critChance', name: 'Crit', value: 18 } },
      armor: { name: "Dragonborn Scales", effect: { id: 'bonusHp', name: '+HP', value: 200 } },
      shield: { name: "Dragonborn Aegis", effect: { id: 'thorns', name: 'Thorns', value: 25 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+30% DMG', effect: { dmgMult: 0.30 } },
      { pieces: 4, desc: '+25% HP, +15% Crit Chance', effect: { hpMult: 0.25, critChance: 15 } },
    ]
  },
  frost: {
    name: "Frostborn", color: '#06b6d4',
    items: {
      weapon: { name: "Frostborn Axe", effect: { id: 'bonusDmg', name: '+DMG', value: 60 } },
      helmet: { name: "Frostborn Helm", effect: { id: 'dodge', name: 'Dodge', value: 12 } },
      armor: { name: "Frostborn Mail", effect: { id: 'bonusHp', name: '+HP', value: 280 } },
      boots: { name: "Frostborn Boots", effect: { id: 'xpBonus', name: 'XP%', value: 25 } },
      amulet: { name: "Frostborn Pendant", effect: { id: 'critChance', name: 'Crit', value: 20 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+20% Dodge', effect: { dodge: 20 } },
      { pieces: 4, desc: '+40% DMG, +35% HP', effect: { dmgMult: 0.40, hpMult: 0.35 } },
    ]
  },
  demon: {
    name: "Demonheart", color: '#dc2626',
    items: {
      weapon: { name: "Demonheart Scythe", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
      helmet: { name: "Demonheart Horns", effect: { id: 'bonusDmg', name: '+DMG', value: 75 } },
      armor: { name: "Demonheart Plate", effect: { id: 'thorns', name: 'Thorns', value: 30 } },
      gloves: { name: "Demonheart Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 100 } },
      accessory: { name: "Demonheart Ring", effect: { id: 'bonusHp', name: '+HP', value: 350 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+15% Lifesteal', effect: { lifesteal: 15 } },
      { pieces: 3, desc: '+50% DMG', effect: { dmgMult: 0.50 } },
      { pieces: 5, desc: '+40% HP, +20% Thorns', effect: { hpMult: 0.40, thorns: 20 } },
    ]
  },
  seraph: {
    name: "Seraphic", color: '#fbbf24',
    items: {
      weapon: { name: "Seraphic Lance", effect: { id: 'bonusDmg', name: '+DMG', value: 95 } },
      helmet: { name: "Seraphic Halo", effect: { id: 'xpBonus', name: 'XP%', value: 25 } },
      armor: { name: "Seraphic Wings", effect: { id: 'bonusHp', name: '+HP', value: 450 } },
      boots: { name: "Seraphic Steps", effect: { id: 'dodge', name: 'Dodge', value: 15 } },
      shield: { name: "Seraphic Bulwark", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
      amulet: { name: "Seraphic Star", effect: { id: 'goldFind', name: 'Gold%', value: 30 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+30% Gold & XP', effect: { goldMult: 0.30, xpBonus: 30 } },
      { pieces: 4, desc: '+60% DMG, +50% HP', effect: { dmgMult: 0.60, hpMult: 0.50 } },
      { pieces: 6, desc: '+20% All Stats', effect: { dmgMult: 0.20, hpMult: 0.20, speedMult: 0.20 } },
    ]
  },
  void: {
    name: "Voidwalker", color: '#7c3aed',
    items: {
      weapon: { name: "Voidwalker Reaper", effect: { id: 'critDamage', name: 'Crit DMG', value: 120 } },
      helmet: { name: "Voidwalker Mask", effect: { id: 'critChance', name: 'Crit', value: 20 } },
      armor: { name: "Voidwalker Shroud", effect: { id: 'bonusHp', name: '+HP', value: 550 } },
      boots: { name: "Voidwalker Striders", effect: { id: 'dodge', name: 'Dodge', value: 18 } },
      gloves: { name: "Voidwalker Grips", effect: { id: 'bonusDmg', name: '+DMG', value: 110 } },
      accessory: { name: "Voidwalker Band", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+25% Crit Chance', effect: { critChance: 25 } },
      { pieces: 4, desc: '+75% DMG, +60% HP', effect: { dmgMult: 0.75, hpMult: 0.60 } },
      { pieces: 6, desc: '+50% Crit DMG, +15% Dodge', effect: { critDamage: 50, dodge: 15 } },
    ]
  },
  chaos: {
    name: "Chaosborn", color: '#ec4899',
    items: {
      weapon: { name: "Chaosborn Destroyer", effect: { id: 'bonusDmg', name: '+DMG', value: 140 } },
      helmet: { name: "Chaosborn Crown", effect: { id: 'critChance', name: 'Crit', value: 20 } },
      armor: { name: "Chaosborn Armor", effect: { id: 'bonusHp', name: '+HP', value: 700 } },
      boots: { name: "Chaosborn Greaves", effect: { id: 'xpBonus', name: 'XP%', value: 25 } },
      gloves: { name: "Chaosborn Fists", effect: { id: 'critDamage', name: 'Crit DMG', value: 150 } },
      shield: { name: "Chaosborn Barrier", effect: { id: 'thorns', name: 'Thorns', value: 40 } },
      amulet: { name: "Chaosborn Essence", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+40% Crit DMG', effect: { critDamage: 40 } },
      { pieces: 4, desc: '+90% DMG, +70% HP', effect: { dmgMult: 0.90, hpMult: 0.70 } },
      { pieces: 6, desc: '+30% All Stats', effect: { dmgMult: 0.30, hpMult: 0.30, speedMult: 0.30 } },
    ]
  },
  eternal: {
    name: "Eternal", color: '#f97316',
    items: {
      weapon: { name: "Eternal Annihilator", effect: { id: 'bonusDmg', name: '+DMG', value: 200 } },
      helmet: { name: "Eternal Diadem", effect: { id: 'critChance', name: 'Crit', value: 25 } },
      armor: { name: "Eternal Plate", effect: { id: 'bonusHp', name: '+HP', value: 1000 } },
      boots: { name: "Eternal Walkers", effect: { id: 'dodge', name: 'Dodge', value: 20 } },
      gloves: { name: "Eternal Gauntlets", effect: { id: 'critDamage', name: 'Crit DMG', value: 200 } },
      shield: { name: "Eternal Aegis", effect: { id: 'thorns', name: 'Thorns', value: 50 } },
      accessory: { name: "Eternal Loop", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
      amulet: { name: "Eternal Heart", effect: { id: 'goldFind', name: 'Gold%', value: 30 } },
    },
    setBonuses: [
      { pieces: 2, desc: '+50% All Stats', effect: { dmgMult: 0.50, hpMult: 0.50, speedMult: 0.20 } },
      { pieces: 4, desc: '+120% DMG, +100% HP', effect: { dmgMult: 1.20, hpMult: 1.00 } },
      { pieces: 6, desc: '+30% Crit Chance, +100% Crit DMG', effect: { critChance: 30, critDamage: 100 } },
      { pieces: 8, desc: 'Eternal Power: +200% All Stats', effect: { dmgMult: 2.0, hpMult: 2.0, speedMult: 0.50 } },
    ]
  },
};

// Weapon types - different weapons scale with different stats and have unique bonuses
const WEAPON_TYPES = [
  { id: 'sword', name: 'Sword', baseDmg: 8, baseHp: 0, scaling: 'str', speedBonus: 0, critBonus: 5, desc: 'Balanced, +5% crit' },
  { id: 'staff', name: 'Staff', baseDmg: 7, baseHp: 15, scaling: 'int', speedBonus: 0, critBonus: 0, desc: 'Magic, +15 HP' },
  { id: 'dagger', name: 'Dagger', baseDmg: 5, baseHp: 0, scaling: 'agi', speedBonus: 0.4, critBonus: 10, desc: '+40% speed, +10% crit' },
  { id: 'mace', name: 'Mace', baseDmg: 6, baseHp: 30, scaling: 'vit', speedBonus: -0.1, critBonus: 0, desc: 'Slow but tanky, +30 HP' },
];

// Gear bases with clear stat contributions
const GEAR_BASES = {
  weapon: { name: 'Sword', baseDmg: 8, baseHp: 0, baseArmor: 0, scaling: 'str', desc: '+8 DMG per tier' },
  helmet: { name: 'Helm', baseDmg: 0, baseHp: 20, baseArmor: 5, scaling: 'vit', desc: '+20 HP, +5 Armor per tier' },
  armor: { name: 'Plate', baseDmg: 0, baseHp: 40, baseArmor: 12, scaling: 'vit', desc: '+40 HP, +12 Armor per tier' },
  boots: { name: 'Greaves', baseDmg: 0, baseHp: 15, baseArmor: 4, scaling: 'agi', desc: '+15 HP, +4 Armor per tier' },
  accessory: { name: 'Ring', baseDmg: 3, baseHp: 10, baseArmor: 0, scaling: 'int', desc: '+3 DMG, +10 HP per tier' },
  shield: { name: 'Buckler', baseDmg: 0, baseHp: 30, baseArmor: 15, scaling: 'vit', desc: '+30 HP, +15 Armor per tier' },
  gloves: { name: 'Gauntlets', baseDmg: 4, baseHp: 10, baseArmor: 3, scaling: 'str', desc: '+4 DMG, +10 HP per tier' },
  amulet: { name: 'Pendant', baseDmg: 2, baseHp: 15, baseArmor: 0, scaling: 'int', desc: '+2 DMG, +15 HP per tier' },
};

const SPECIAL_EFFECTS = [
  { id: 'thorns', name: 'Thorns', minVal: 5, maxVal: 25, color: '#f97316' },
  { id: 'lifesteal', name: 'Lifesteal', minVal: 3, maxVal: 15, color: '#22c55e' },
  { id: 'critChance', name: 'Crit', minVal: 5, maxVal: 20, color: '#ef4444' },
  { id: 'critDamage', name: 'Crit DMG', minVal: 25, maxVal: 100, color: '#dc2626' },
  { id: 'bonusDmg', name: '+DMG', minVal: 2, maxVal: 50, color: '#f59e0b' },
  { id: 'bonusHp', name: '+HP', minVal: 10, maxVal: 200, color: '#10b981' },
  { id: 'goldFind', name: 'Gold%', minVal: 5, maxVal: 30, color: '#fbbf24' },
  { id: 'xpBonus', name: 'XP%', minVal: 5, maxVal: 25, color: '#8b5cf6' },
  { id: 'dodge', name: 'Dodge', minVal: 2, maxVal: 12, color: '#06b6d4' },
];

const SKILLS = [
  { id: 0, name: 'Power Strike', desc: '+15% damage', unlockLevel: 3, effect: { dmgMult: 0.15 } },
  { id: 1, name: 'Toughness', desc: '+20% HP', unlockLevel: 6, effect: { hpMult: 0.2 } },
  { id: 2, name: 'Gold Rush', desc: '+25% gold', unlockLevel: 10, effect: { goldMult: 0.25 } },
  { id: 3, name: 'Swift Blade', desc: '+20% attack speed', unlockLevel: 15, effect: { speedMult: 0.2 } },
  { id: 4, name: 'Berserker', desc: '+30% damage', unlockLevel: 22, effect: { dmgMult: 0.3 } },
  { id: 5, name: 'Fortitude', desc: '+35% HP', unlockLevel: 30, effect: { hpMult: 0.35 } },
  { id: 6, name: 'Lucky Find', desc: '+30% material drop', unlockLevel: 38, effect: { matMult: 0.3 } },
  { id: 7, name: 'Mastery', desc: '+50% all stats', unlockLevel: 50, effect: { dmgMult: 0.5, hpMult: 0.5 } },
  { id: 8, name: 'Vampiric', desc: '+5% base lifesteal', unlockLevel: 65, effect: { lifesteal: 5 } },
  { id: 9, name: 'Critical Eye', desc: '+10% crit chance', unlockLevel: 80, effect: { critChance: 10 } },
  { id: 10, name: 'Thorny Skin', desc: '10% thorns damage', unlockLevel: 95, effect: { thorns: 10 } },
  { id: 11, name: 'Transcendence', desc: '+100% all stats', unlockLevel: 120, effect: { dmgMult: 1.0, hpMult: 1.0 } },
];

const getEnhanceCost = (currentPlus) => ({
  gold: Math.floor(100 * Math.pow(1.4, currentPlus)),
  enhanceStone: Math.floor(2 * Math.pow(1.25, currentPlus)),
  blessedOrb: currentPlus >= 10 ? Math.floor(Math.pow(1.3, currentPlus - 9)) : 0,
  celestialShard: currentPlus >= 20 ? Math.floor(Math.pow(1.35, currentPlus - 19)) : 0,
});

const getEnhanceSuccess = (currentPlus) => {
  if (currentPlus < 10) return 100;
  if (currentPlus < 20) return Math.max(50, 100 - (currentPlus - 9) * 5);
  if (currentPlus < 30) return Math.max(20, 50 - (currentPlus - 19) * 3);
  return 20;
};

const getEnhanceBonus = (plus) => ({
  dmgBonus: plus * 2,
  hpBonus: plus * 5,
  effectBonus: Math.floor(plus / 5) * 3,
});

const initialState = {
  gold: 50, ore: 5, leather: 5, enhanceStone: 3, blessedOrb: 0, celestialShard: 0,
  level: 1, xp: 0, currentZone: 0,
  // Base stats - player can allocate points
  stats: { str: 5, int: 5, vit: 5, agi: 5, lck: 5 },
  statPoints: 0, // Points available to allocate (3 per level up)
  gear: { weapon: null, helmet: null, armor: null, boots: null, accessory: null, shield: null, gloves: null, amulet: null },
  inventory: [], unlockedSkills: [], combatLog: [],
  enemyHp: 20, enemyMaxHp: 20, playerHp: 100, playerMaxHp: 100,
  kills: 0, totalGold: 0, enhanceFails: 0,
  zoneKills: {}, // Track kills per zone: { 0: 50, 1: 30, ... }
};

function GearGrinder() {
  const [gameState, setGameState] = useState(initialState);
  const [activeTab, setActiveTab] = useState('combat');
  const [isLoading, setIsLoading] = useState(true);
  const [combatTick, setCombatTick] = useState(0);
  const [selectedEnhanceItem, setSelectedEnhanceItem] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // Combat visual effects state
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [enemyDying, setEnemyDying] = useState(false);
  const [lootDrops, setLootDrops] = useState([]);

  // Use ref to track latest gameState for auto-save without causing re-renders
  const gameStateRef = useRef(gameState);
  const saveTimeoutRef = useRef(null);

  // Add floating text helper
  const addFloatingText = useCallback((text, type, target) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, type, target }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  }, []);

  // Add loot drop helper
  const addLootDrop = useCallback((items) => {
    const id = Date.now();
    setLootDrops(prev => [...prev, { id, items }]);
    setTimeout(() => {
      setLootDrops(prev => prev.filter(l => l.id !== id));
    }, 2000);
  }, []);

  // Debounced save - batches rapid saves into a single save after 100ms of no changes
  const saveGameDebounced = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const saveData = { ...gameStateRef.current, combatLog: [] };
        await window.storage.set('gear-grinder-save', JSON.stringify(saveData));
        setLastSaveTime(new Date().toLocaleTimeString());
      } catch (e) {
        console.error('Error saving game:', e);
        setLastSaveTime('Error!');
      }
    }, 100);
  }, []);

  // Immediate save - for critical events that need instant persistence
  const saveGameImmediate = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    try {
      const saveData = { ...gameStateRef.current, combatLog: [] };
      await window.storage.set('gear-grinder-save', JSON.stringify(saveData));
      setLastSaveTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error saving game:', e);
      setLastSaveTime('Error!');
    }
  }, []);

  useEffect(() => {
    async function loadGame() {
      try {
        const saved = await window.storage.get('gear-grinder-save');
        if (saved && saved.value) {
          const parsed = JSON.parse(saved.value);
          console.log('Loading save:', parsed);

          // Calculate stat points for existing saves (3 per level after 1)
          const earnedStatPoints = (parsed.level - 1) * 3;
          const spentPoints = parsed.stats ? Object.values(parsed.stats).reduce((a, b) => a + b, 0) - 25 : 0;
          const availablePoints = Math.max(0, earnedStatPoints - spentPoints);

          // Properly merge saved state with initial state
          const migratedState = {
            // Start with all initial state values
            ...initialState,
            // Override with saved values (excluding gear which needs special handling)
            gold: parsed.gold ?? initialState.gold,
            ore: parsed.ore ?? parsed.materials ?? initialState.ore,
            leather: parsed.leather ?? parsed.materials ?? initialState.leather,
            enhanceStone: parsed.enhanceStone ?? Math.floor((parsed.materials || 0) / 2) ?? initialState.enhanceStone,
            blessedOrb: parsed.blessedOrb ?? parsed.gems ?? initialState.blessedOrb,
            celestialShard: parsed.celestialShard ?? parsed.essence ?? initialState.celestialShard,
            level: parsed.level ?? initialState.level,
            xp: parsed.xp ?? initialState.xp,
            currentZone: parsed.currentZone ?? initialState.currentZone,
            stats: parsed.stats ?? initialState.stats,
            statPoints: parsed.statPoints ?? availablePoints,
            inventory: parsed.inventory ?? initialState.inventory,
            unlockedSkills: parsed.unlockedSkills ?? initialState.unlockedSkills,
            enemyHp: parsed.enemyHp ?? initialState.enemyHp,
            enemyMaxHp: parsed.enemyMaxHp ?? initialState.enemyMaxHp,
            playerHp: parsed.playerHp ?? initialState.playerHp,
            playerMaxHp: parsed.playerMaxHp ?? initialState.playerMaxHp,
            kills: parsed.kills ?? initialState.kills,
            totalGold: parsed.totalGold ?? initialState.totalGold,
            enhanceFails: parsed.enhanceFails ?? initialState.enhanceFails,
            zoneKills: parsed.zoneKills ?? initialState.zoneKills,
            // Gear needs special handling to merge with initial state slots
            gear: parsed.gear ? { ...initialState.gear, ...parsed.gear } : initialState.gear,
            // Always reset combat log on load
            combatLog: [],
          };

          console.log('Loaded state:', migratedState);
          setGameState(migratedState);
        }
      } catch (e) {
        console.error('Error loading save:', e);
      }
      setIsLoading(false);
    }
    loadGame();
  }, []);

  // Recalculate player HP after loading to ensure it matches current stats/gear
  useEffect(() => {
    if (!isLoading && gameState.level > 0) {
      const stats = getPlayerStats();
      // Only update if HP values are incorrect
      if (gameState.playerMaxHp !== stats.maxHp || gameState.playerHp > stats.maxHp) {
        setGameState(prev => ({
          ...prev,
          playerMaxHp: stats.maxHp,
          playerHp: Math.min(prev.playerHp, stats.maxHp) // Keep current HP but cap at new max
        }));
      }
    }
  }, [isLoading]); // Only run once after initial load

  // Update ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Background auto-save every 3 seconds (safety net - main saves happen on state changes)
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(async () => {
      try {
        const saveData = { ...gameStateRef.current, combatLog: [] };
        await window.storage.set('gear-grinder-save', JSON.stringify(saveData));
        setLastSaveTime(new Date().toLocaleTimeString());
        console.log('Game auto-saved:', {
          level: saveData.level,
          gold: saveData.gold,
          zone: saveData.currentZone,
          gearCount: Object.values(saveData.gear).filter(g => g !== null).length,
          inventorySize: saveData.inventory.length,
        });
      } catch (e) {
        console.error('Error auto-saving game:', e);
        setLastSaveTime('Error saving!');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const getPlayerStats = useCallback(() => {
    const s = gameState.stats;
    // Base stats from character stats
    let baseDmg = 5 + s.str * 2 + s.int * 1; // STR gives more physical dmg
    let baseHp = 80 + s.vit * 8; // VIT gives HP
    let armor = s.vit * 1; // Small armor from VIT
    let dmgMult = 1, hpMult = 1, goldMult = 1 + s.lck * 0.02, speedMult = 1 + s.agi * 0.01, matMult = 1 + s.lck * 0.02;
    let lifesteal = 0, thorns = 0;
    let critChance = 3 + s.agi * 0.5; // AGI gives crit
    let critDamage = 150 + s.lck * 2; // LCK gives crit damage
    let dodge = s.agi * 0.3; // AGI gives dodge
    let xpBonus = 0;

    // Gear contributions
    Object.entries(gameState.gear).forEach(([slot, gear]) => {
      if (gear) {
        const tierMult = TIERS[gear.tier].statMult;
        const enhanceBonus = getEnhanceBonus(gear.plus || 0);

        // For weapons, use the weapon type stats and apply bonuses
        let gearBase = GEAR_BASES[slot];
        if (slot === 'weapon' && gear.weaponType) {
          const weaponDef = WEAPON_TYPES.find(w => w.id === gear.weaponType);
          if (weaponDef) {
            gearBase = { ...gearBase, ...weaponDef, baseArmor: 0 };
            // Apply weapon type bonuses
            speedMult += weaponDef.speedBonus;
            critChance += weaponDef.critBonus;
          }
        }

        // Add gear stats (scaled by tier)
        baseDmg += gearBase.baseDmg * tierMult + enhanceBonus.dmgBonus;
        baseHp += gearBase.baseHp * tierMult + enhanceBonus.hpBonus;
        armor += (gearBase.baseArmor || 0) * tierMult;

        // Stat scaling bonus: gear is stronger if you have the right stat
        const scalingStat = s[gearBase.scaling] || 0;
        const scalingBonus = 1 + scalingStat * 0.02; // +2% per stat point
        baseDmg += Math.floor(gearBase.baseDmg * tierMult * (scalingBonus - 1));
        baseHp += Math.floor(gearBase.baseHp * tierMult * (scalingBonus - 1) * 0.5);

        // Special effects from gear
        if (gear.effects) {
          gear.effects.forEach(effect => {
            const effectValue = effect.value * (1 + enhanceBonus.effectBonus / 100);
            switch (effect.id) {
              case 'lifesteal': lifesteal += effectValue; break;
              case 'thorns': thorns += effectValue; break;
              case 'critChance': critChance += effectValue; break;
              case 'critDamage': critDamage += effectValue; break;
              case 'bonusDmg': baseDmg += effectValue; break;
              case 'bonusHp': baseHp += effectValue; break;
              case 'goldFind': goldMult += effectValue / 100; break;
              case 'xpBonus': xpBonus += effectValue; break;
              case 'dodge': dodge += effectValue; break;
            }
          });
        }
      }
    });

    // Level bonus
    baseDmg += (gameState.level - 1) * 2;
    baseHp += (gameState.level - 1) * 8;

    // Skills
    gameState.unlockedSkills.forEach(skillId => {
      const skill = SKILLS[skillId];
      if (skill.effect.dmgMult) dmgMult += skill.effect.dmgMult;
      if (skill.effect.hpMult) hpMult += skill.effect.hpMult;
      if (skill.effect.goldMult) goldMult += skill.effect.goldMult;
      if (skill.effect.speedMult) speedMult += skill.effect.speedMult;
      if (skill.effect.matMult) matMult += skill.effect.matMult;
      if (skill.effect.lifesteal) lifesteal += skill.effect.lifesteal;
      if (skill.effect.critChance) critChance += skill.effect.critChance;
      if (skill.effect.thorns) thorns += skill.effect.thorns;
    });

    // Calculate set bonuses
    const setBonuses = {};
    Object.entries(gameState.gear).forEach(([slot, gear]) => {
      if (gear && gear.bossSet) {
        setBonuses[gear.bossSet] = (setBonuses[gear.bossSet] || 0) + 1;
      }
    });

    Object.entries(setBonuses).forEach(([setName, count]) => {
      const bossSet = BOSS_SETS[setName];
      if (bossSet) {
        bossSet.setBonuses.forEach(bonus => {
          if (count >= bonus.pieces) {
            if (bonus.effect.dmgMult) dmgMult += bonus.effect.dmgMult;
            if (bonus.effect.hpMult) hpMult += bonus.effect.hpMult;
            if (bonus.effect.speedMult) speedMult += bonus.effect.speedMult;
            if (bonus.effect.goldMult) goldMult += bonus.effect.goldMult;
            if (bonus.effect.lifesteal) lifesteal += bonus.effect.lifesteal;
            if (bonus.effect.critChance) critChance += bonus.effect.critChance;
            if (bonus.effect.critDamage) critDamage += bonus.effect.critDamage;
            if (bonus.effect.thorns) thorns += bonus.effect.thorns;
            if (bonus.effect.dodge) dodge += bonus.effect.dodge;
            if (bonus.effect.xpBonus) xpBonus += bonus.effect.xpBonus;
          }
        });
      }
    });

    return {
      damage: Math.floor(baseDmg * dmgMult),
      maxHp: Math.floor(baseHp * hpMult),
      armor: Math.floor(armor),
      goldMult, speedMult, matMult,
      lifesteal: Math.min(lifesteal, 50),
      thorns: Math.min(thorns, 100),
      critChance: Math.min(critChance, 75),
      critDamage,
      dodge: Math.min(dodge, 50),
      xpBonus,
    };
  }, [gameState.gear, gameState.level, gameState.unlockedSkills, gameState.stats]);

  const xpForLevel = (level) => Math.floor(50 * Math.pow(1.3, level - 1));

  // Combat loop
  useEffect(() => {
    if (isLoading) return;
    const stats = getPlayerStats();
    const tickSpeed = Math.max(200, 1000 - (stats.speedMult - 1) * 500);

    const interval = setInterval(() => {
      setCombatTick(t => t + 1);
      setGameState(prev => {
        const zone = ZONES[prev.currentZone];
        let newState = { ...prev };
        let log = [...prev.combatLog].slice(-4);

        let playerDmg = stats.damage;
        let isCrit = Math.random() * 100 < stats.critChance;
        if (isCrit) playerDmg = Math.floor(playerDmg * stats.critDamage / 100);

        newState.enemyHp -= playerDmg;
        // Show floating damage on enemy
        addFloatingText(isCrit ? `CRIT ${playerDmg}!` : `-${playerDmg}`, isCrit ? 'crit' : 'playerDmg', 'enemy');

        if (stats.lifesteal > 0) {
          const healed = Math.floor(playerDmg * stats.lifesteal / 100);
          newState.playerHp = Math.min(newState.playerHp + healed, stats.maxHp);
          if (healed > 0) addFloatingText(`+${healed}`, 'heal', 'player');
        }

        if (newState.enemyHp <= 0) {
          const goldEarned = Math.floor((zone.goldMin + Math.random() * (zone.goldMax - zone.goldMin)) * stats.goldMult);
          const xpEarned = Math.floor(zone.enemyHp / 2 * (1 + stats.xpBonus / 100));
          const drops = zone.drops;
          const zoneBonus = Math.floor(prev.currentZone / 2) + 1;

          const oreDropped = Math.random() < drops.ore * stats.matMult ? Math.ceil(Math.random() * zoneBonus) : 0;
          const leatherDropped = Math.random() < drops.leather * stats.matMult ? Math.ceil(Math.random() * zoneBonus) : 0;
          const enhanceStoneDropped = Math.random() < drops.enhanceStone ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 2)) : 0;
          const blessedOrbDropped = Math.random() < drops.blessedOrb ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 3)) : 0;
          const celestialShardDropped = Math.random() < drops.celestialShard ? Math.ceil(Math.random() * Math.max(1, zoneBonus / 4)) : 0;

          newState.gold += goldEarned;
          newState.totalGold += goldEarned;
          newState.ore += oreDropped;
          newState.leather += leatherDropped;
          newState.enhanceStone += enhanceStoneDropped;
          newState.blessedOrb += blessedOrbDropped;
          newState.celestialShard += celestialShardDropped;
          newState.xp += xpEarned;
          newState.kills += 1;

          // Track kills per zone
          const currentZoneId = prev.currentZone;
          newState.zoneKills = { ...newState.zoneKills };
          newState.zoneKills[currentZoneId] = (newState.zoneKills[currentZoneId] || 0) + 1;

          // Boss loot drops
          if (zone.isBoss && zone.bossSet) {
            const bossSet = BOSS_SETS[zone.bossSet];
            const dropChance = 0.15; // 15% chance to drop a boss item
            if (Math.random() < dropChance && bossSet) {
              const availableSlots = Object.keys(bossSet.items);
              const droppedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
              const bossItem = bossSet.items[droppedSlot];

              // Create the boss item with tier 5 (Mythic) base stats
              const newBossItem = {
                slot: droppedSlot,
                tier: 5, // Mythic tier
                id: Date.now(),
                plus: 0,
                effects: [bossItem.effect],
                bossSet: zone.bossSet,
                isBossItem: true,
                weaponType: droppedSlot === 'weapon' ? 'sword' : null,
              };
              newState.inventory = [...newState.inventory, newBossItem];
              log.push({ type: 'bossLoot', msg: `⚡ ${bossItem.name} obtained!` });
            }
          }

          // Trigger death animation and show loot
          setEnemyDying(true);
          const lootItems = [];
          lootItems.push({ text: `+${goldEarned}g`, color: '#fbbf24' });
          lootItems.push({ text: `+${xpEarned}xp`, color: '#a855f7' });
          if (oreDropped) lootItems.push({ text: `+${oreDropped}${MATERIALS.ore.icon}`, color: MATERIALS.ore.color });
          if (leatherDropped) lootItems.push({ text: `+${leatherDropped}${MATERIALS.leather.icon}`, color: MATERIALS.leather.color });
          if (enhanceStoneDropped) lootItems.push({ text: `+${enhanceStoneDropped}${MATERIALS.enhanceStone.icon}`, color: MATERIALS.enhanceStone.color });
          if (blessedOrbDropped) lootItems.push({ text: `+${blessedOrbDropped}${MATERIALS.blessedOrb.icon}`, color: MATERIALS.blessedOrb.color });
          if (celestialShardDropped) lootItems.push({ text: `+${celestialShardDropped}${MATERIALS.celestialShard.icon}`, color: MATERIALS.celestialShard.color });
          addLootDrop(lootItems);

          // Reset enemy after death animation
          setTimeout(() => {
            setEnemyDying(false);
          }, 400);

          while (newState.xp >= xpForLevel(newState.level)) {
            newState.xp -= xpForLevel(newState.level);
            newState.level += 1;
            newState.statPoints = (newState.statPoints || 0) + 3;
            log.push({ type: 'level', msg: `LEVEL UP! Lv.${newState.level} (+3 stat points)` });
            addFloatingText('LEVEL UP!', 'levelup', 'player');
            SKILLS.forEach(skill => {
              if (skill.unlockLevel === newState.level && !newState.unlockedSkills.includes(skill.id)) {
                newState.unlockedSkills = [...newState.unlockedSkills, skill.id];
                log.push({ type: 'skill', msg: `Unlocked: ${skill.name}!` });
              }
            });
          }

          newState.enemyHp = zone.enemyHp;
          newState.enemyMaxHp = zone.enemyHp;
          newState.playerHp = Math.min(newState.playerHp + Math.floor(stats.maxHp * 0.1), stats.maxHp);
          newState.playerMaxHp = stats.maxHp;
        } else {
          const dodged = Math.random() * 100 < stats.dodge;
          if (dodged) {
            addFloatingText('DODGE!', 'dodge', 'player');
          } else {
            const damageReduction = stats.armor / (stats.armor + 100);
            const reducedDmg = Math.max(1, Math.floor(zone.enemyDmg * (1 - damageReduction)));
            newState.playerHp -= reducedDmg;
            addFloatingText(`-${reducedDmg}`, 'enemyDmg', 'player');
            if (stats.thorns > 0) {
              const thornsDmg = Math.floor(reducedDmg * stats.thorns / 100);
              newState.enemyHp -= thornsDmg;
              if (thornsDmg > 0) addFloatingText(`-${thornsDmg}`, 'thorns', 'enemy');
            }
          }
          if (newState.playerHp <= 0) {
            addFloatingText('DEATH!', 'death', 'player');
            newState.playerHp = stats.maxHp;
            newState.enemyHp = zone.enemyHp;
            newState.enemyMaxHp = zone.enemyHp;
          }
        }

        newState.combatLog = log;
        newState.playerMaxHp = stats.maxHp;
        return newState;
      });
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [isLoading, getPlayerStats, combatTick, addFloatingText, addLootDrop]);

  // Auto-save after combat state changes (kills, level ups, resource gains)
  useEffect(() => {
    if (!isLoading) {
      saveGameDebounced();
    }
  }, [gameState.kills, gameState.level, gameState.gold, gameState.currentZone, isLoading, saveGameDebounced]);

  const rollEffects = (tier) => {
    const numEffects = tier >= 4 ? Math.floor(Math.random() * 3) + 1 : tier >= 2 ? Math.floor(Math.random() * 2) + 1 : Math.random() < 0.3 ? 1 : 0;
    const effects = [];
    const usedIds = new Set();
    for (let i = 0; i < numEffects; i++) {
      const availableEffects = SPECIAL_EFFECTS.filter(e => !usedIds.has(e.id));
      if (availableEffects.length === 0) break;
      const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
      usedIds.add(effect.id);
      const value = Math.floor(effect.minVal + Math.random() * (effect.maxVal - effect.minVal) * (1 + tier * 0.15));
      effects.push({ id: effect.id, name: effect.name, value });
    }
    return effects;
  };

  const craftGear = (slot, tier, weaponType = null) => {
    const t = TIERS[tier];
    if (gameState.gold < t.goldCost || gameState.ore < t.oreCost || gameState.leather < t.leatherCost) return;

    const newItem = {
      slot,
      tier,
      id: Date.now(),
      plus: 0,
      effects: rollEffects(tier),
      weaponType: slot === 'weapon' ? (weaponType || 'sword') : null,
    };

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - t.goldCost,
      ore: prev.ore - t.oreCost,
      leather: prev.leather - t.leatherCost,
      inventory: [...prev.inventory, newItem],
    }));
    // Save immediately after crafting gear
    setTimeout(() => saveGameImmediate(), 0);
  };

  const enhanceGear = (item, isEquipped = false) => {
    const cost = getEnhanceCost(item.plus || 0);
    if (gameState.gold < cost.gold || gameState.enhanceStone < cost.enhanceStone ||
        gameState.blessedOrb < cost.blessedOrb || gameState.celestialShard < cost.celestialShard) return;
    if ((item.plus || 0) >= 30) return;

    setGameState(prev => {
      let newState = {
        ...prev,
        gold: prev.gold - cost.gold,
        enhanceStone: prev.enhanceStone - cost.enhanceStone,
        blessedOrb: prev.blessedOrb - cost.blessedOrb,
        celestialShard: prev.celestialShard - cost.celestialShard,
      };

      const pityBonus = Math.min(prev.enhanceFails * 2, 30);
      const succeeded = Math.random() * 100 < Math.min(100, getEnhanceSuccess(item.plus || 0) + pityBonus);

      if (succeeded) {
        const upgradedItem = { ...item, plus: (item.plus || 0) + 1 };
        if (isEquipped) newState.gear = { ...prev.gear, [item.slot]: upgradedItem };
        else newState.inventory = prev.inventory.map(i => i.id === item.id ? upgradedItem : i);
        newState.enhanceFails = 0;
        newState.combatLog = [...prev.combatLog.slice(-3), { type: 'enhance', msg: `SUCCESS! +${upgradedItem.plus}!` }];
        setSelectedEnhanceItem({ ...upgradedItem, isEquipped });
      } else {
        newState.enhanceFails = prev.enhanceFails + 1;
        newState.combatLog = [...prev.combatLog.slice(-3), { type: 'enhanceFail', msg: `FAILED (Pity: +${newState.enhanceFails * 2}%)` }];
      }
      return newState;
    });
    // Save immediately after enhancing gear
    setTimeout(() => saveGameImmediate(), 0);
  };

  const equipGear = (item) => {
    setGameState(prev => {
      const oldGear = prev.gear[item.slot];
      const newInventory = prev.inventory.filter(i => i.id !== item.id);
      if (oldGear) newInventory.push(oldGear);
      return { ...prev, gear: { ...prev.gear, [item.slot]: item }, inventory: newInventory };
    });
    // Save immediately after equipping gear
    setTimeout(() => saveGameImmediate(), 0);
  };

  const salvageGear = (item) => {
    if (!item) return;

    // Calculate salvage returns (30% of crafting cost for regular gear, 50% for boss items)
    const tier = TIERS[item.tier];
    const salvageRate = item.isBossItem ? 0.5 : 0.3;
    const enhancementBonus = (item.plus || 0) * 0.1; // +10% per enhancement level

    const goldReturn = Math.floor(tier.goldCost * salvageRate * (1 + enhancementBonus));
    const oreReturn = Math.floor(tier.oreCost * salvageRate * (1 + enhancementBonus));
    const leatherReturn = Math.floor(tier.leatherCost * salvageRate * (1 + enhancementBonus));

    // Enhanced items also return some enhancement materials
    const enhanceStoneReturn = item.plus >= 5 ? Math.floor(item.plus * 0.5) : 0;
    const blessedOrbReturn = item.plus >= 15 ? Math.floor((item.plus - 10) * 0.3) : 0;
    const celestialShardReturn = item.plus >= 25 ? Math.floor((item.plus - 20) * 0.2) : 0;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold + goldReturn,
      ore: prev.ore + oreReturn,
      leather: prev.leather + leatherReturn,
      enhanceStone: prev.enhanceStone + enhanceStoneReturn,
      blessedOrb: prev.blessedOrb + blessedOrbReturn,
      celestialShard: prev.celestialShard + celestialShardReturn,
      inventory: prev.inventory.filter(i => i.id !== item.id),
      combatLog: [...prev.combatLog.slice(-3), {
        type: 'salvage',
        msg: `Salvaged for ${goldReturn}g, ${oreReturn}⛏️, ${leatherReturn}🧶`
      }],
    }));
    // Save immediately after salvaging gear
    setTimeout(() => saveGameImmediate(), 0);
  };

  const changeZone = (zoneId) => {
    const zone = ZONES[zoneId];
    // Check if zone is unlocked based on kills in previous zone
    if (zoneId > 0) {
      const prevZoneKills = gameState.zoneKills[zoneId - 1] || 0;
      if (prevZoneKills < zone.killsRequired) return;
    }
    // Get current player stats to reset HP to full
    const currentStats = getPlayerStats();
    setGameState(prev => ({
      ...prev,
      currentZone: zoneId,
      enemyHp: zone.enemyHp,
      enemyMaxHp: zone.enemyHp,
      playerHp: currentStats.maxHp,
      playerMaxHp: currentStats.maxHp
    }));
    // Save immediately after zone change (critical event)
    setTimeout(() => saveGameImmediate(), 0);
  };

  const allocateStat = (statKey) => {
    if (gameState.statPoints <= 0) return;
    setGameState(prev => ({
      ...prev,
      statPoints: prev.statPoints - 1,
      stats: { ...prev.stats, [statKey]: prev.stats[statKey] + 1 },
    }));
    // Save immediately after stat allocation
    setTimeout(() => saveGameImmediate(), 0);
  };

  const manualSave = async () => {
    try {
      const saveData = { ...gameState, combatLog: [] };
      await window.storage.set('gear-grinder-save', JSON.stringify(saveData));
      setLastSaveTime(new Date().toLocaleTimeString());
      console.log('Manual save successful:', saveData);
      alert('Game saved successfully!');
    } catch (e) {
      console.error('Error saving game:', e);
      setLastSaveTime('Error saving!');
      alert('Error saving game! Please try again.');
    }
  };

  const stats = getPlayerStats();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-2 sm:p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-3 sm:mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-amber-400">Gear Grinder</h1>
                <span className="px-2 sm:px-3 py-1 bg-green-600 rounded-full text-xs sm:text-sm font-bold">Lv.{gameState.level}</span>
                {gameState.statPoints > 0 && (
                  <span className="px-2 sm:px-3 py-1 bg-purple-600 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                    +{gameState.statPoints} Points!
                  </span>
                )}
              </div>
              <div className="px-2 sm:px-3 py-1 bg-gray-700/50 rounded-lg text-xs sm:text-sm text-gray-400">
                Auto-saving...
              </div>
            </div>

            {/* Resources with icons and tooltips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-3 mt-3 sm:mt-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Gold - Used for crafting and enhancing gear">
                <span>🪙</span>
                <span className="text-yellow-400 font-bold">{gameState.gold.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Iron Ore - Used for crafting gear">
                <span>{MATERIALS.ore.icon}</span>
                <span style={{color: MATERIALS.ore.color}} className="font-bold">{gameState.ore}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Leather - Used for crafting gear">
                <span>{MATERIALS.leather.icon}</span>
                <span style={{color: MATERIALS.leather.color}} className="font-bold">{gameState.leather}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Enhance Stone - Used for enhancing gear (+1 to +30)">
                <span>{MATERIALS.enhanceStone.icon}</span>
                <span style={{color: MATERIALS.enhanceStone.color}} className="font-bold">{gameState.enhanceStone}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Blessed Orb - Required for enhancing gear past +10">
                <span>{MATERIALS.blessedOrb.icon}</span>
                <span style={{color: MATERIALS.blessedOrb.color}} className="font-bold">{gameState.blessedOrb}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-1 rounded cursor-help" title="Celestial Shard - Required for enhancing gear past +20">
                <span>{MATERIALS.celestialShard.icon}</span>
                <span style={{color: MATERIALS.celestialShard.color}} className="font-bold">{gameState.celestialShard}</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Experience</span>
                <span>{gameState.xp.toLocaleString()} / {xpForLevel(gameState.level).toLocaleString()}</span>
              </div>
              <Progress value={(gameState.xp / xpForLevel(gameState.level)) * 100} className="h-2 sm:h-2.5" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="combat" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-3 sm:mb-4">
            <TabsTrigger value="combat">Combat</TabsTrigger>
            <TabsTrigger value="stats" className={gameState.statPoints > 0 ? 'ring-2 ring-purple-500' : ''}>Stats</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
            <TabsTrigger value="craft">Craft</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
          </TabsList>

          {/* Combat Tab */}
          <TabsContent value="combat" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Player */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-gray-300">Your Hero</CardTitle>
                </CardHeader>
                <CardContent>
              <div className="flex justify-center relative">
                <CharacterDisplay gear={gameState.gear} />
                {/* Floating damage on player */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {floatingTexts.filter(t => t.target === 'player').map(ft => (
                    <FloatingText key={ft.id} text={ft.text} type={ft.type} />
                  ))}
                </div>
              </div>
              {/* Combat Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">DMG</span>
                  <span className="text-red-400 font-bold">{stats.damage}</span>
                </div>
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">Speed</span>
                  <span className="text-yellow-300 font-bold">{Math.floor(stats.speedMult * 100)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">Crit%</span>
                  <span className="text-orange-400 font-bold">{Math.floor(stats.critChance)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">Armor</span>
                  <span className="text-blue-400 font-bold">{stats.armor}</span>
                </div>
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">Dodge%</span>
                  <span className="text-cyan-400 font-bold">{Math.floor(stats.dodge)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-2 flex justify-between">
                  <span className="text-gray-400">Lifesteal</span>
                  <span className="text-green-400 font-bold">{Math.floor(stats.lifesteal)}%</span>
                </div>
              </div>
                  {/* HP Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>HP</span>
                      <span>{gameState.playerHp.toLocaleString()} / {stats.maxHp.toLocaleString()}</span>
                    </div>
                    <Progress value={(gameState.playerHp / stats.maxHp) * 100} className="h-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Enemy */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-gray-300">{ZONES[gameState.currentZone].name}</CardTitle>
                  <div className="text-center text-xs text-gray-500">{ZONES[gameState.currentZone].enemyType}</div>
                </CardHeader>
                <CardContent>
              <div className="flex justify-center my-3 relative min-h-[100px]">
                {/* Enemy with death animation */}
                <div className={`transition-all duration-300 ${enemyDying ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100 rotate-0'}`}>
                  <EnemyDisplay zoneId={gameState.currentZone} />
                </div>
                {/* Floating damage on enemy */}
                <div className="absolute inset-0 pointer-events-none overflow-visible flex justify-center">
                  {floatingTexts.filter(t => t.target === 'enemy').map(ft => (
                    <FloatingText key={ft.id} text={ft.text} type={ft.type} />
                  ))}
                </div>
                {/* Loot drops floating up - positioned to the right of enemy */}
                <div className="absolute top-4 pointer-events-none overflow-visible" style={{ left: '60%' }}>
                  {lootDrops.slice(-1).map(drop => (
                    <LootDrop key={drop.id} items={drop.items} />
                  ))}
                </div>
              </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Enemy HP</span>
                      <span>{gameState.enemyHp.toLocaleString()} / {gameState.enemyMaxHp.toLocaleString()}</span>
                    </div>
                    <Progress value={(gameState.enemyHp / gameState.enemyMaxHp) * 100} indicatorClassName="bg-red-500" className="h-4" />
                  </div>
                  {/* Mini log for level ups and skills only */}
                  {gameState.combatLog.filter(l => l.type === 'level' || l.type === 'skill').length > 0 && (
                    <div className="mt-3 text-center">
                      {gameState.combatLog.filter(l => l.type === 'level' || l.type === 'skill').slice(-2).map((log, i) => (
                        <div key={i} className={`text-sm font-bold ${log.type === 'level' ? 'text-green-400' : 'text-purple-400'}`}>
                          {log.msg}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Zones with drop info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-300">Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[50vh] sm:max-h-[420px] overflow-y-auto pr-1">
                    {ZONES.map(zone => {
                      // Check if unlocked based on kills in previous zone
                      const prevZoneKills = zone.id > 0 ? (gameState.zoneKills[zone.id - 1] || 0) : 0;
                      const unlocked = zone.id === 0 || prevZoneKills >= zone.killsRequired;
                      const active = gameState.currentZone === zone.id;
                      const currentZoneKills = gameState.zoneKills[zone.id] || 0;
                      return (
                        <Button
                          key={zone.id}
                          onClick={() => changeZone(zone.id)}
                          disabled={!unlocked}
                          variant={active ? "default" : unlocked ? "secondary" : "outline"}
                          className={`w-full p-3 text-left text-sm h-auto justify-start ${
                            active ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                          } ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{zone.name}</span>
                        {zone.id === 0 ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/80">{currentZoneKills} kills</span>
                        ) : unlocked ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-black/20">{currentZoneKills} kills</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700">{prevZoneKills}/{zone.killsRequired} kills</span>
                        )}
                      </div>
                      {unlocked && (
                        <div className="flex gap-1 mt-1 text-xs opacity-80">
                          {zone.drops.ore > 0.3 && <span>{MATERIALS.ore.icon}</span>}
                          {zone.drops.leather > 0.3 && <span>{MATERIALS.leather.icon}</span>}
                          {zone.drops.enhanceStone > 0.2 && <span>{MATERIALS.enhanceStone.icon}</span>}
                          {zone.drops.blessedOrb > 0.1 && <span>{MATERIALS.blessedOrb.icon}</span>}
                          {zone.drops.celestialShard > 0.05 && <span>{MATERIALS.celestialShard.icon}</span>}
                          <span className="text-yellow-400 ml-auto">{zone.goldMin}-{zone.goldMax}g</span>
                        </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab - NEW */}
          <TabsContent value="stats" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Character Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-300">Character Stats</CardTitle>
                    {gameState.statPoints > 0 && (
                      <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-bold">
                        {gameState.statPoints} points
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <CharacterDisplay gear={gameState.gear} />
                  </div>
                  <div className="space-y-3">
                    {Object.entries(STATS).map(([key, stat]) => (
                      <div key={key} className="bg-gray-900 rounded p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold" style={{ color: stat.color }}>{stat.name}</span>
                            <span className="text-gray-400 ml-2 text-lg font-bold">{gameState.stats[key]}</span>
                          </div>
                          <Button
                            onClick={() => allocateStat(key)}
                            disabled={gameState.statPoints <= 0}
                            variant={gameState.statPoints > 0 ? "default" : "secondary"}
                            size="sm"
                            className={gameState.statPoints > 0 ? 'bg-purple-600 hover:bg-purple-500' : ''}
                          >
                            +1
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{stat.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

          {/* Derived Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-300">Combat Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Damage</span>
                  <span className="text-red-400 font-bold text-lg">{stats.damage}</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Max HP</span>
                  <span className="text-green-400 font-bold text-lg">{stats.maxHp.toLocaleString()}</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Attack Speed</span>
                  <span className="text-yellow-300 font-bold text-lg">{Math.floor(stats.speedMult * 100)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Armor</span>
                  <span className="text-blue-400 font-bold text-lg">{stats.armor}</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Crit Chance</span>
                  <span className="text-orange-400 font-bold text-lg">{Math.floor(stats.critChance)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Crit Damage</span>
                  <span className="text-red-300 font-bold text-lg">{Math.floor(stats.critDamage)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Dodge</span>
                  <span className="text-cyan-400 font-bold text-lg">{Math.floor(stats.dodge)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Lifesteal</span>
                  <span className="text-green-300 font-bold text-lg">{Math.floor(stats.lifesteal)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Thorns</span>
                  <span className="text-amber-400 font-bold text-lg">{Math.floor(stats.thorns)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Gold Find</span>
                  <span className="text-yellow-400 font-bold text-lg">+{Math.floor((stats.goldMult - 1) * 100)}%</span>
                </div>
                <div className="bg-gray-900 rounded p-3 flex justify-between">
                  <span className="text-gray-400">Drop Rate</span>
                  <span className="text-purple-400 font-bold text-lg">+{Math.floor((stats.matMult - 1) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Gear Tab */}
      <TabsContent value="gear" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Equipped */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-300 mb-4">Equipped Gear</h2>
              <div className="flex gap-4">
                <div className="flex justify-center">
                  <CharacterDisplay gear={gameState.gear} />
                </div>
                <div className="flex-1 space-y-1.5">
                  {GEAR_SLOTS.map(slot => {
                    const gear = gameState.gear[slot];
                    const gearBase = GEAR_BASES[slot];
                    return (
                      <div key={slot} className="bg-gray-900 rounded p-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 capitalize text-xs w-16">{slot}</span>
                            <span className="text-xs px-1 rounded" style={{ backgroundColor: STATS[gearBase.scaling]?.color + '30', color: STATS[gearBase.scaling]?.color }}>
                              {gearBase.scaling.toUpperCase()}
                            </span>
                          </div>
                          {gear ? <GearName item={gear} /> : <span className="text-gray-600 text-xs">Empty</span>}
                        </div>
                        {gear?.effects?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gear.effects.map((eff, i) => (
                              <span key={i} className="text-xs px-1 py-0.5 rounded bg-gray-800" style={{ color: SPECIAL_EFFECTS.find(e => e.id === eff.id)?.color }}>
                                {eff.name} {eff.value}%
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Set Bonuses */}
              {(() => {
                const setBonuses = {};
                Object.entries(gameState.gear).forEach(([slot, gear]) => {
                  if (gear && gear.bossSet) {
                    setBonuses[gear.bossSet] = (setBonuses[gear.bossSet] || 0) + 1;
                  }
                });
                const hasSetBonuses = Object.keys(setBonuses).length > 0;

                return hasSetBonuses ? (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-bold text-gray-300 mb-2">⚡ Active Set Bonuses</h3>
                    <div className="space-y-2">
                      {Object.entries(setBonuses).map(([setName, count]) => {
                        const bossSet = BOSS_SETS[setName];
                        if (!bossSet) return null;
                        return (
                          <div key={setName} className="bg-gray-900 rounded p-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm" style={{ color: bossSet.color }}>
                                {bossSet.name} Set
                              </span>
                              <span className="text-xs text-gray-400">({count} pieces)</span>
                            </div>
                            <div className="space-y-1">
                              {bossSet.setBonuses.map((bonus, i) => (
                                <div key={i} className={`text-xs ${count >= bonus.pieces ? 'text-green-400' : 'text-gray-500'}`}>
                                  ({bonus.pieces}) {bonus.desc}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Inventory */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-300 mb-4">Inventory ({gameState.inventory.length})</h2>
              {gameState.inventory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No items. Craft some gear!</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {gameState.inventory.map(item => (
                    <div key={item.id} className="bg-gray-900 rounded p-3 flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs capitalize">{item.slot}</span>
                          <GearName item={item} />
                        </div>
                        {item.effects?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.effects.map((eff, i) => (
                              <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-gray-800" style={{ color: SPECIAL_EFFECTS.find(e => e.id === eff.id)?.color }}>
                                {eff.name} {eff.value}%
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => equipGear(item)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium">
                          Equip
                        </button>
                        <button onClick={() => salvageGear(item)} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded text-sm font-medium" title="Salvage for materials">
                          Salvage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Craft Tab */}
        <TabsContent value="craft" className="mt-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-300 mb-2">Forge</h2>
            <p className="text-gray-500 text-sm mb-4">
              Craft gear using {MATERIALS.ore.icon} Iron Ore and {MATERIALS.leather.icon} Leather. Higher tiers = better stats + more effects.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-2 text-gray-400 font-medium">Tier / Cost</th>
                    {GEAR_SLOTS.map(slot => {
                      const equipped = gameState.gear[slot];
                      return (
                        <th key={slot} className="py-2 px-1 text-center text-xs">
                          <div className="capitalize text-gray-400">{slot}</div>
                          {equipped && (
                            <div className="text-xs mt-0.5" style={{ color: TIERS[equipped.tier].color }}>
                              {equipped.plus > 0 ? `+${equipped.plus} ` : ''}{TIERS[equipped.tier].name.slice(0,3)}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map(tier => {
                    const canAfford = gameState.gold >= tier.goldCost && gameState.ore >= tier.oreCost && gameState.leather >= tier.leatherCost;
                    return (
                      <tr key={tier.id} className="border-b border-gray-700/50">
                        <td className="py-2 px-2">
                          <div className="font-bold" style={{ color: tier.color }}>{tier.name}</div>
                          <div className="text-xs flex gap-2 mt-0.5">
                            <span className="text-yellow-400">🪙{tier.goldCost}</span>
                            <span style={{color: MATERIALS.ore.color}}>{MATERIALS.ore.icon}{tier.oreCost}</span>
                            <span style={{color: MATERIALS.leather.color}}>{MATERIALS.leather.icon}{tier.leatherCost}</span>
                          </div>
                        </td>
                        {GEAR_SLOTS.map(slot => (
                          <td key={slot} className="py-2 px-1 text-center">
                            {slot === 'weapon' ? (
                              <div className="flex flex-col gap-1">
                                {WEAPON_TYPES.map(wt => (
                                  <button
                                    key={wt.id}
                                    onClick={() => craftGear(slot, tier.id, wt.id)}
                                    disabled={!canAfford}
                                    title={wt.desc}
                                    className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                                      canAfford ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                                    style={{ color: canAfford ? STATS[wt.scaling]?.color : undefined }}
                                  >
                                    {wt.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                onClick={() => craftGear(slot, tier.id)}
                                disabled={!canAfford}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  canAfford ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                Craft
                              </button>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Enhance Tab */}
        <TabsContent value="enhance" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Item List */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-300 mb-3">Select Item to Enhance</h2>
              <div className="space-y-3">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Equipped Gear</div>
                {GEAR_SLOTS.map(slot => {
                  const gear = gameState.gear[slot];
                  if (!gear) return null;
                  const isSelected = selectedEnhanceItem?.id === gear.id && selectedEnhanceItem?.isEquipped;
                  return (
                    <button
                      key={`eq-${slot}`}
                      onClick={() => setSelectedEnhanceItem({ ...gear, isEquipped: true })}
                      className={`w-full p-3 rounded text-left transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <span className="text-gray-400 text-xs capitalize mr-2">{slot}:</span>
                      <GearName item={gear} />
                    </button>
                  );
                })}

                {gameState.inventory.length > 0 && (
                  <>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-4">Inventory</div>
                    {gameState.inventory.map(item => {
                      const isSelected = selectedEnhanceItem?.id === item.id && !selectedEnhanceItem?.isEquipped;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedEnhanceItem({ ...item, isEquipped: false })}
                          className={`w-full p-3 rounded text-left transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                          <span className="text-gray-400 text-xs capitalize mr-2">{item.slot}:</span>
                          <GearName item={item} />
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Enhancement Panel */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-gray-300 mb-3">Enhancement</h2>
              {selectedEnhanceItem ? (
                <div>
                  <div className="text-center py-4 bg-gray-900 rounded-lg mb-4">
                    <div className="text-xl mb-2">
                      <GearName item={selectedEnhanceItem} />
                    </div>
                    <EnhanceGlow plus={selectedEnhanceItem.plus || 0} />
                  </div>

                  {(selectedEnhanceItem.plus || 0) >= 30 ? (
                    <div className="text-center text-2xl font-bold text-amber-400 py-8">MAX LEVEL!</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-900 rounded p-3 text-center">
                          <div className="text-gray-400 text-sm">Current</div>
                          <div className="text-2xl font-bold">+{selectedEnhanceItem.plus || 0}</div>
                        </div>
                        <div className="bg-gray-900 rounded p-3 text-center">
                          <div className="text-gray-400 text-sm">Success Rate</div>
                          <div className="text-2xl font-bold" style={{
                            color: getEnhanceSuccess(selectedEnhanceItem.plus || 0) >= 80 ? '#22c55e' :
                                   getEnhanceSuccess(selectedEnhanceItem.plus || 0) >= 50 ? '#eab308' : '#ef4444'
                          }}>
                            {getEnhanceSuccess(selectedEnhanceItem.plus || 0)}%
                          </div>
                          {gameState.enhanceFails > 0 && (
                            <div className="text-xs text-cyan-400">+{Math.min(gameState.enhanceFails * 2, 30)}% pity</div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded p-3 mb-4">
                        <div className="text-gray-400 text-sm mb-2">Cost:</div>
                        {(() => {
                          const cost = getEnhanceCost(selectedEnhanceItem.plus || 0);
                          return (
                            <div className="flex flex-wrap gap-3 text-sm">
                              <div className={`flex items-center gap-1 ${gameState.gold >= cost.gold ? 'text-yellow-400' : 'text-red-400'}`}>
                                <span>🪙</span>{cost.gold.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1" style={{ color: gameState.enhanceStone >= cost.enhanceStone ? MATERIALS.enhanceStone.color : '#ef4444' }}>
                                <span>{MATERIALS.enhanceStone.icon}</span>{cost.enhanceStone}
                              </div>
                              {cost.blessedOrb > 0 && (
                                <div className="flex items-center gap-1" style={{ color: gameState.blessedOrb >= cost.blessedOrb ? MATERIALS.blessedOrb.color : '#ef4444' }}>
                                  <span>{MATERIALS.blessedOrb.icon}</span>{cost.blessedOrb}
                                </div>
                              )}
                              {cost.celestialShard > 0 && (
                                <div className="flex items-center gap-1" style={{ color: gameState.celestialShard >= cost.celestialShard ? MATERIALS.celestialShard.color : '#ef4444' }}>
                                  <span>{MATERIALS.celestialShard.icon}</span>{cost.celestialShard}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      <button
                        onClick={() => enhanceGear(selectedEnhanceItem, selectedEnhanceItem.isEquipped)}
                        disabled={(() => {
                          const cost = getEnhanceCost(selectedEnhanceItem.plus || 0);
                          return gameState.gold < cost.gold || gameState.enhanceStone < cost.enhanceStone ||
                                 gameState.blessedOrb < cost.blessedOrb || gameState.celestialShard < cost.celestialShard;
                        })()}
                        className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
                      >
                        ENHANCE
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">Select an item to enhance</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-bold text-gray-300 mb-4">Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SKILLS.map(skill => {
                const unlocked = gameState.unlockedSkills.includes(skill.id);
                const canUnlock = gameState.level >= skill.unlockLevel;
                return (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-lg ${
                      unlocked ? 'bg-purple-900/30 border border-purple-500' :
                      canUnlock ? 'bg-gray-700' : 'bg-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${unlocked ? 'text-purple-400' : canUnlock ? 'text-white' : 'text-gray-500'}`}>
                        {skill.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Lv.{skill.unlockLevel}</span>
                    </div>
                    <div className={`text-sm mt-1 ${unlocked ? 'text-purple-300' : 'text-gray-400'}`}>{skill.desc}</div>
                    {unlocked && <div className="text-xs text-green-400 mt-2 font-medium">Active</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-600 mt-4">
        <div>
          Kills: {gameState.kills.toLocaleString()} | Total Gold: {gameState.totalGold.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={manualSave} size="sm" variant="outline" className="text-xs">
            💾 Save Game
          </Button>
          {lastSaveTime && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSaveTime}
            </span>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

// Gear name with enhancement and tier color
function GearName({ item }) {
  const tier = TIERS[item.tier];
  const plus = item.plus || 0;
  const glowColor = plus >= 30 ? '#fbbf24' : plus >= 20 ? '#ec4899' : plus >= 10 ? '#3b82f6' : null;

  // Get the named item - check if it's a boss item first
  let gearName;
  let gearColor = tier.color;

  if (item.isBossItem && item.bossSet) {
    const bossSet = BOSS_SETS[item.bossSet];
    if (bossSet && bossSet.items[item.slot]) {
      gearName = bossSet.items[item.slot].name;
      gearColor = bossSet.color;
    }
  } else {
    // Regular gear naming
    if (item.slot === 'weapon' && item.weaponType) {
      gearName = GEAR_NAMES[item.weaponType]?.[item.tier] || `${tier.name} ${item.weaponType}`;
    } else {
      gearName = GEAR_NAMES[item.slot]?.[item.tier] || `${tier.name} ${GEAR_BASES[item.slot].name}`;
    }
  }

  return (
    <span
      className="font-medium"
      style={{
        color: gearColor,
        textShadow: glowColor ? `0 0 8px ${glowColor}` : 'none',
      }}
    >
      {plus > 0 && <span className="text-white">+{plus} </span>}
      {item.isBossItem && <span className="text-amber-400">⚡</span>}
      {gearName}
    </span>
  );
}

// Enhancement glow indicators
function EnhanceGlow({ plus }) {
  if (plus < 10) return <div className="h-4" />;
  const level = plus >= 30 ? 3 : plus >= 20 ? 2 : 1;
  const colors = ['#3b82f6', '#ec4899', '#fbbf24'];
  return (
    <div className="flex justify-center gap-2">
      {[...Array(level)].map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors[i], boxShadow: `0 0 8px ${colors[i]}` }} />
      ))}
    </div>
  );
}

// Floating damage text component
function FloatingText({ text, type }) {
  const getStyle = () => {
    switch (type) {
      case 'crit':
        return { color: '#f97316', fontSize: '1.5rem', fontWeight: 'bold' };
      case 'playerDmg':
        return { color: '#3b82f6', fontSize: '1.1rem', fontWeight: 'bold' };
      case 'enemyDmg':
        return { color: '#ef4444', fontSize: '1.1rem', fontWeight: 'bold' };
      case 'heal':
        return { color: '#22c55e', fontSize: '1rem', fontWeight: 'bold' };
      case 'dodge':
        return { color: '#06b6d4', fontSize: '1.1rem', fontWeight: 'bold' };
      case 'thorns':
        return { color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold' };
      case 'levelup':
        return { color: '#fbbf24', fontSize: '1.3rem', fontWeight: 'bold' };
      case 'death':
        return { color: '#dc2626', fontSize: '1.4rem', fontWeight: 'bold' };
      default:
        return { color: '#fff', fontSize: '1rem' };
    }
  };

  return (
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 animate-float-up whitespace-nowrap"
      style={{
        ...getStyle(),
        textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
        animation: 'floatUp 1s ease-out forwards',
      }}
    >
      {text}
    </div>
  );
}

// Loot drop display component
function LootDrop({ items }) {
  return (
    <div
      className="flex flex-col items-start gap-0.5"
      style={{ animation: 'lootFloat 2s ease-out forwards' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="text-sm font-bold whitespace-nowrap px-1 rounded"
          style={{
            color: item.color,
            textShadow: '0 0 4px rgba(0,0,0,0.9)',
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

// Full character SVG display
function CharacterDisplay({ gear }) {
  const getColor = (slot) => gear[slot] ? TIERS[gear[slot].tier].color : '#374151';
  const getGlow = (slot) => {
    if (!gear[slot]) return '';
    const plus = gear[slot].plus || 0;
    if (plus >= 30) return 'url(#glow-gold)';
    if (plus >= 20) return 'url(#glow-pink)';
    if (plus >= 10) return 'url(#glow-blue)';
    return '';
  };

  const weaponType = gear.weapon?.weaponType || 'sword';
  const weaponColor = getColor('weapon');
  const weaponGlow = getGlow('weapon');

  // Different weapon SVG shapes based on weapon type
  const renderWeapon = () => {
    switch (weaponType) {
      case 'staff':
        return (
          <g filter={weaponGlow}>
            {/* Staff - long wooden pole with crystal on top */}
            <rect x="13" y="30" width="4" height="60" rx="2" fill="#8B4513" />
            <circle cx="15" cy="28" r="6" fill={weaponColor} />
            <circle cx="15" cy="28" r="3" fill="#ffffff" fillOpacity="0.6" />
          </g>
        );
      case 'dagger':
        return (
          <g filter={weaponGlow}>
            {/* Dagger - short curved blade */}
            <rect x="14" y="70" width="4" height="15" rx="1" fill="#4a4a4a" />
            <rect x="10" y="68" width="12" height="4" rx="1" fill={weaponColor} />
            <polygon points="16,68 12,50 20,50" fill={weaponColor} />
          </g>
        );
      case 'mace':
        return (
          <g filter={weaponGlow}>
            {/* Mace - handle with heavy head */}
            <rect x="13" y="55" width="4" height="35" rx="1" fill="#6b7280" />
            <ellipse cx="15" cy="50" rx="10" ry="8" fill={weaponColor} />
            <circle cx="10" cy="48" r="3" fill={weaponColor} />
            <circle cx="20" cy="48" r="3" fill={weaponColor} />
            <circle cx="15" cy="43" r="3" fill={weaponColor} />
          </g>
        );
      default: // sword
        return (
          <g filter={weaponGlow}>
            {/* Sword - classic blade with hilt */}
            <rect x="12" y="45" width="6" height="50" rx="1" fill={weaponColor} />
            <polygon points="15,40 10,50 20,50" fill={weaponColor} />
            <rect x="8" y="90" width="14" height="4" rx="1" fill="#6b7280" />
          </g>
        );
    }
  };

  return (
    <svg viewBox="0 0 100 140" className="w-20 h-28 sm:w-24 sm:h-32 lg:w-28 lg:h-40 flex-shrink-0">
      <defs>
        <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#3b82f6" floodOpacity="0.8" />
          <feComposite in2="blur" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#ec4899" floodOpacity="0.9" />
          <feComposite in2="blur" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#fbbf24" floodOpacity="1" />
          <feComposite in2="blur" operator="in" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body */}
      <rect x="35" y="50" width="30" height="50" rx="3" fill="#1f2937" />
      {/* Armor */}
      <rect x="33" y="48" width="34" height="55" rx="4" fill={getColor('armor')} fillOpacity="0.9" filter={getGlow('armor')} />
      <rect x="38" y="53" width="24" height="25" rx="2" fill="#1f2937" fillOpacity="0.3" />
      {/* Shield */}
      <ellipse cx="78" cy="70" rx="8" ry="12" fill={getColor('shield')} filter={getGlow('shield')} />
      {/* Head */}
      <circle cx="50" cy="30" r="18" fill="#4b5563" />
      {/* Helmet */}
      <path d="M32 30 Q32 12 50 12 Q68 12 68 30 L68 35 L32 35 Z" fill={getColor('helmet')} filter={getGlow('helmet')} />
      <rect x="38" y="28" width="24" height="8" rx="1" fill="#1f2937" fillOpacity="0.5" />
      {/* Amulet */}
      <circle cx="50" cy="48" r="4" fill={getColor('amulet')} filter={getGlow('amulet')} />
      {/* Arms */}
      <rect x="20" y="52" width="12" height="35" rx="3" fill="#4b5563" />
      <rect x="68" y="52" width="12" height="35" rx="3" fill="#4b5563" />
      {/* Gloves */}
      <rect x="18" y="82" width="14" height="10" rx="2" fill={getColor('gloves')} filter={getGlow('gloves')} />
      <rect x="68" y="82" width="14" height="10" rx="2" fill={getColor('gloves')} filter={getGlow('gloves')} />
      {/* Weapon - rendered based on type */}
      {renderWeapon()}
      {/* Legs */}
      <rect x="37" y="100" width="11" height="30" rx="2" fill="#374151" />
      <rect x="52" y="100" width="11" height="30" rx="2" fill="#374151" />
      {/* Boots */}
      <rect x="35" y="120" width="14" height="15" rx="2" fill={getColor('boots')} filter={getGlow('boots')} />
      <rect x="51" y="120" width="14" height="15" rx="2" fill={getColor('boots')} filter={getGlow('boots')} />
      {/* Accessory ring */}
      <circle cx="74" cy="85" r="5" fill={getColor('accessory')} fillOpacity="0.8" filter={getGlow('accessory')} />
      <circle cx="74" cy="85" r="3" fill="#1f2937" />
    </svg>
  );
}

// Enemy SVG display
function EnemyDisplay({ zoneId }) {
  const colors = ['#22c55e', '#6b7280', '#84cc16', '#a855f7', '#ef4444', '#8b5cf6', '#06b6d4', '#dc2626', '#fbbf24', '#1e3a8a', '#f97316', '#4c1d95'];

  const enemies = [
    // Forest Wolf
    <g key="0"><ellipse cx="50" cy="55" rx="25" ry="15" fill={colors[0]} /><circle cx="35" cy="45" r="12" fill={colors[0]} /><polygon points="28,35 32,20 38,35" fill={colors[0]} /><polygon points="38,35 42,22 48,35" fill={colors[0]} /><circle cx="32" cy="42" r="2" fill="#111" /><ellipse cx="37" cy="48" rx="3" ry="2" fill="#111" /></g>,
    // Shadow
    <g key="1"><ellipse cx="50" cy="50" rx="30" ry="25" fill={colors[1]} fillOpacity="0.8" /><circle cx="40" cy="45" r="4" fill="#dc2626" /><circle cx="60" cy="45" r="4" fill="#dc2626" /><path d="M35 60 Q50 70 65 60" stroke="#111" strokeWidth="3" fill="none" /></g>,
    // Goblin
    <g key="2"><ellipse cx="50" cy="60" rx="20" ry="25" fill={colors[2]} /><circle cx="50" cy="40" r="18" fill={colors[2]} /><polygon points="30,35 35,15 42,35" fill={colors[2]} /><polygon points="58,35 65,15 70,35" fill={colors[2]} /><circle cx="43" cy="38" r="4" fill="#fef08a" /><circle cx="57" cy="38" r="4" fill="#fef08a" /><circle cx="43" cy="38" r="2" fill="#111" /><circle cx="57" cy="38" r="2" fill="#111" /></g>,
    // Skeleton
    <g key="3"><rect x="35" y="30" width="30" height="45" rx="5" fill={colors[3]} fillOpacity="0.7" /><circle cx="50" cy="30" r="15" fill="#e5e5e5" /><circle cx="44" cy="28" r="5" fill="#111" /><circle cx="56" cy="28" r="5" fill="#111" /></g>,
    // Dragon
    <g key="4"><ellipse cx="50" cy="55" rx="35" ry="20" fill={colors[4]} /><circle cx="50" cy="35" r="20" fill={colors[4]} /><polygon points="35,20 40,0 50,20" fill={colors[4]} /><polygon points="50,20 60,0 65,20" fill={colors[4]} /><circle cx="42" cy="32" r="5" fill="#fef08a" /><circle cx="58" cy="32" r="5" fill="#fef08a" /><circle cx="42" cy="32" r="2" fill="#111" /><circle cx="58" cy="32" r="2" fill="#111" /><polygon points="45,50 50,58 55,50" fill="#fef08a" /></g>,
    // Void Entity
    <g key="5"><circle cx="50" cy="50" r="30" fill={colors[5]} fillOpacity="0.5" /><circle cx="50" cy="50" r="20" fill={colors[5]} fillOpacity="0.7" /><circle cx="50" cy="50" r="10" fill={colors[5]} /><circle cx="40" cy="45" r="3" fill="#fff" /><circle cx="60" cy="45" r="3" fill="#fff" /></g>,
    // Ice Elemental
    <g key="6"><polygon points="50,10 70,40 60,40 75,70 50,50 25,70 40,40 30,40" fill={colors[6]} /><circle cx="45" cy="35" r="3" fill="#fff" /><circle cx="55" cy="35" r="3" fill="#fff" /></g>,
    // Demon
    <g key="7"><ellipse cx="50" cy="55" rx="30" ry="25" fill={colors[7]} /><circle cx="50" cy="35" r="18" fill={colors[7]} /><polygon points="30,25 38,5 42,30" fill={colors[7]} /><polygon points="58,30 62,5 70,25" fill={colors[7]} /><circle cx="42" cy="32" r="5" fill="#fef08a" /><circle cx="58" cy="32" r="5" fill="#fef08a" /><circle cx="42" cy="32" r="3" fill="#111" /><circle cx="58" cy="32" r="3" fill="#111" /></g>,
    // Celestial
    <g key="8"><circle cx="50" cy="45" r="25" fill="#fef3c7" fillOpacity="0.9" /><circle cx="50" cy="45" r="18" fill={colors[8]} /><circle cx="45" cy="42" r="3" fill="#fff" /><circle cx="55" cy="42" r="3" fill="#fff" /></g>,
    // Abyssal
    <g key="9"><ellipse cx="50" cy="50" rx="35" ry="30" fill={colors[9]} fillOpacity="0.8" /><circle cx="42" cy="45" r="6" fill="#0ea5e9" /><circle cx="58" cy="45" r="6" fill="#0ea5e9" /><circle cx="42" cy="45" r="2" fill="#111" /><circle cx="58" cy="45" r="2" fill="#111" /></g>,
    // Chaos
    <g key="10"><polygon points="50,15 65,35 80,40 65,50 70,70 50,60 30,70 35,50 20,40 35,35" fill={colors[10]} /><circle cx="50" cy="45" r="12" fill="#f97316" /><circle cx="45" cy="42" r="3" fill="#111" /><circle cx="55" cy="42" r="3" fill="#111" /></g>,
    // Eternal
    <g key="11"><circle cx="50" cy="50" r="35" fill="#111" /><circle cx="50" cy="50" r="25" fill={colors[11]} /><circle cx="50" cy="50" r="15" fill="#1f2937" /><circle cx="45" cy="47" r="4" fill="#ef4444" /><circle cx="55" cy="47" r="4" fill="#ef4444" /></g>,
  ];

  return <svg viewBox="0 0 100 80" className="w-16 h-14 sm:w-20 sm:h-16 lg:w-24 lg:h-20">{enemies[zoneId]}</svg>;
}

export default GearGrinder;
