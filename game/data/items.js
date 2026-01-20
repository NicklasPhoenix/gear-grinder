export const MATERIALS = {
    enhanceStone: { name: 'E.Stone', color: '#60a5fa' },
    blessedOrb: { name: 'B.Orb', color: '#c084fc' },
    celestialShard: { name: 'C.Shard', color: '#fbbf24' },
    prestigeStone: { name: 'P.Stone', color: '#f472b6' },
};

// Boss stones - dropped by bosses, required to enhance boss gear past +10
export const BOSS_STONES = {
    guardian: { name: 'Guardian Stone', color: '#22c55e', bossName: 'Forest Guardian', gemIcon: 5 },
    lich: { name: 'Lich Stone', color: '#8b5cf6', bossName: 'Goblin Warlord', gemIcon: 9 },
    dragon: { name: 'Dragon Stone', color: '#ef4444', bossName: 'Lich King', gemIcon: 13 },
    frost: { name: 'Frost Stone', color: '#06b6d4', bossName: 'Ancient Dragon', gemIcon: 17 },
    demon: { name: 'Demon Stone', color: '#dc2626', bossName: 'Frost Titan', gemIcon: 21 },
    seraph: { name: 'Seraph Stone', color: '#fbbf24', bossName: 'Demon Lord', gemIcon: 25 },
    void: { name: 'Void Stone', color: '#7c3aed', bossName: 'Seraph Commander', gemIcon: 29 },
    chaos: { name: 'Chaos Stone', color: '#ec4899', bossName: 'The Eternal One', gemIcon: 33 },
    eternal: { name: 'Eternal Stone', color: '#f97316', bossName: 'Chaos Lord', gemIcon: 37 },
    astral: { name: 'Astral Stone', color: '#38bdf8', bossName: 'Astral Guardian', gemIcon: 41 },
    cosmic: { name: 'Cosmic Stone', color: '#a78bfa', bossName: 'Cosmic Titan', gemIcon: 44 },
    primordial: { name: 'Primordial Stone', color: '#f472b6', bossName: 'Primordial God', gemIcon: 48 },
};

export const GEAR_SLOTS = ['weapon', 'helmet', 'armor', 'legs', 'boots', 'belt', 'shield', 'gloves', 'amulet'];

export const TIERS = [
    // Balanced so +10 tier N ≈ +0 tier N+1 (each tier ~1.5x stronger)
    { id: 0, name: 'Common', color: '#9ca3af', statMult: 1.0, goldCost: 50, zoneReq: 0 },
    { id: 1, name: 'Uncommon', color: '#22c55e', statMult: 1.5, goldCost: 200, zoneReq: 1 },
    { id: 2, name: 'Rare', color: '#3b82f6', statMult: 2.2, goldCost: 600, zoneReq: 3 },
    { id: 3, name: 'Epic', color: '#a855f7', statMult: 3.3, goldCost: 2000, zoneReq: 6 },
    { id: 4, name: 'Legendary', color: '#f97316', statMult: 5.0, goldCost: 6000, zoneReq: 10 },
    { id: 5, name: 'Mythic', color: '#ec4899', statMult: 7.5, goldCost: 20000, zoneReq: 14 },
    { id: 6, name: 'Divine', color: '#fbbf24', statMult: 11.0, goldCost: 60000, zoneReq: 18 },
    // Prestige tiers - require prestige level to unlock
    { id: 7, name: 'Astral', color: '#38bdf8', statMult: 17.0, goldCost: 200000, zoneReq: 21, prestigeReq: 1 },
    { id: 8, name: 'Cosmic', color: '#818cf8', statMult: 25.0, goldCost: 600000, zoneReq: 23, prestigeReq: 2 },
    { id: 9, name: 'Primordial', color: '#f472b6', statMult: 38.0, goldCost: 2000000, zoneReq: 25, prestigeReq: 3 },
];

export const GEAR_NAMES = {
    sword: ['Rusty Blade', 'Iron Sword', 'Steel Saber', 'Crimson Edge', 'Dragonslayer', 'Soul Reaver', 'Excalibur', 'Starforged Blade', 'Cosmic Cleaver', 'Primordial Edge'],
    staff: ['Wooden Staff', 'Oak Wand', 'Crystal Staff', 'Arcane Focus', 'Void Scepter', 'Starweaver', 'Celestial Rod', 'Astral Conduit', 'Cosmic Focus', 'Primordial Staff'],
    dagger: ['Shiv', 'Stiletto', 'Shadow Fang', 'Viper Strike', 'Assassin Blade', 'Nightfall', 'Eclipse Dagger', 'Starlight Fang', 'Cosmic Shiv', 'Primordial Talon'],
    mace: ['Club', 'Flanged Mace', 'War Hammer', 'Skull Crusher', 'Titan Maul', 'Earthshaker', 'Divine Judgment', 'Astral Crusher', 'Cosmic Hammer', 'Primordial Maul'],
    scythe: ['Rusty Scythe', 'Iron Reaper', 'Steel Harvester', 'Crimson Scythe', 'Deathbringer', 'Soul Harvester', 'Eternal Reaper', 'Astral Reaper', 'Cosmic Harvester', 'Primordial Scythe'],
    katana: ['Bamboo Blade', 'Iron Katana', 'Steel Muramasa', 'Crimson Edge', 'Dragon Fang', 'Void Slash', 'Divine Wind', 'Astral Edge', 'Cosmic Blade', 'Primordial Katana'],
    greataxe: ['Woodcutter', 'Iron Cleaver', 'Steel Executioner', 'Blood Axe', 'Worldsplitter', 'Chaos Cleaver', 'Godslayer', 'Starbreaker', 'Cosmic Cleaver', 'Primordial Axe'],
    helmet: ['Cloth Cap', 'Leather Hood', 'Chain Coif', 'Knight Helm', 'Dragon Visor', 'Phoenix Crown', 'Halo of Light', 'Astral Circlet', 'Cosmic Crown', 'Primordial Helm'],
    armor: ['Cloth Tunic', 'Leather Vest', 'Chainmail', 'Plate Armor', 'Dragon Scale', 'Abyssal Plate', 'Radiant Aegis', 'Astral Vestments', 'Cosmic Plate', 'Primordial Armor'],
    legs: ['Cloth Pants', 'Leather Leggings', 'Chain Legguards', 'Plate Greaves', 'Dragon Legs', 'Void Legguards', 'Angelic Greaves', 'Astral Leggings', 'Cosmic Greaves', 'Primordial Legs'],
    boots: ['Sandals', 'Leather Boots', 'Chain Greaves', 'Plated Boots', 'Dragonskin Treads', 'Voidwalkers', 'Angelic Steps', 'Astral Treads', 'Cosmic Boots', 'Primordial Striders'],
    belt: ['Rope Belt', 'Leather Belt', 'Studded Belt', 'Chain Belt', 'Dragon Girdle', 'Void Sash', 'Celestial Cord', 'Astral Waistguard', 'Cosmic Belt', 'Primordial Girdle'],
    shield: ['Wooden Shield', 'Iron Buckler', 'Steel Kite', 'Tower Shield', 'Dragon Guard', 'Bulwark', 'Aegis of Dawn', 'Astral Barrier', 'Cosmic Shield', 'Primordial Bulwark'],
    gloves: ['Cloth Wraps', 'Leather Gloves', 'Chain Gauntlets', 'Plate Fists', 'Drake Claws', 'Void Grip', 'Hands of Fate', 'Astral Grasp', 'Cosmic Gauntlets', 'Primordial Fists'],
    amulet: ['Bead Necklace', 'Bronze Pendant', 'Silver Locket', 'Mystic Amulet', 'Dragon Heart', 'Soul Gem', 'Tear of the Gods', 'Astral Pendant', 'Cosmic Amulet', 'Primordial Heart'],
};

export const BOSS_SETS = {
    // Rebalanced: lower stat bonuses (1.2-1.4), reduced set bonuses for slower progression
    // Each boss has a specific weapon type for build variety
    guardian: {
        name: "Guardian's", color: '#22c55e', tier: 1, statBonus: 1.2, weaponType: 'sword', // Zone 4 boss - STR
        items: {
            weapon: { name: "Guardian's Greatsword", effect: { id: 'bonusDmg', name: '+DMG', value: 15 } },
            helmet: { name: "Guardian's Crown", effect: { id: 'bonusHp', name: '+HP', value: 50 } },
            armor: { name: "Guardian's Plate", effect: { id: 'thorns', name: 'Thorns', value: 8 } },
            legs: { name: "Guardian's Legguards", effect: { id: 'bonusHp', name: '+HP', value: 40 } },
            boots: { name: "Guardian's Treads", effect: { id: 'dodge', name: 'Dodge', value: 4 } },
            gloves: { name: "Guardian's Grasp", effect: { id: 'bonusDmg', name: '+DMG', value: 10 } },
            shield: { name: "Guardian's Bulwark", effect: { id: 'bonusHp', name: '+HP', value: 70 } },
            belt: { name: "Guardian's Girdle", effect: { id: 'critChance', name: 'Crit', value: 4 } },
            amulet: { name: "Guardian's Charm", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+10% HP', effect: { hpMult: 0.10 } },
            { pieces: 4, desc: '+15% DMG, +5% Thorns', effect: { dmgMult: 0.15, thorns: 5 } },
            { pieces: 6, desc: '+10% All Stats', effect: { dmgMult: 0.10, hpMult: 0.10, speedMult: 0.05 } },
            { pieces: 8, desc: 'Guardian Blessing: +20% HP, +8% Dodge', effect: { hpMult: 0.20, dodge: 8 } },
        ]
    },
    lich: {
        name: "Lich", color: '#8b5cf6', tier: 2, statBonus: 1.25, weaponType: 'staff', // Zone 9 boss - INT
        items: {
            weapon: { name: "Lich's Staff", effect: { id: 'critDamage', name: 'Crit DMG', value: 35 } },
            helmet: { name: "Lich's Crown", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
            armor: { name: "Lich's Robes", effect: { id: 'bonusHp', name: '+HP', value: 90 } },
            legs: { name: "Lich's Leggings", effect: { id: 'critChance', name: 'Crit', value: 4 } },
            boots: { name: "Lich's Sandals", effect: { id: 'dodge', name: 'Dodge', value: 5 } },
            gloves: { name: "Lich's Grasp", effect: { id: 'critChance', name: 'Crit', value: 6 } },
            shield: { name: "Lich's Tome", effect: { id: 'bonusDmg', name: '+DMG', value: 20 } },
            belt: { name: "Lich's Sash", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
            amulet: { name: "Lich's Soulstone", effect: { id: 'critDamage', name: 'Crit DMG', value: 25 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+3% Lifesteal', effect: { lifesteal: 3 } },
            { pieces: 4, desc: '+20% Crit DMG, +15% DMG', effect: { critDamage: 20, dmgMult: 0.15 } },
            { pieces: 6, desc: '+6% Crit Chance, +15% HP', effect: { critChance: 6, hpMult: 0.15 } },
            { pieces: 8, desc: 'Undeath: +5% Lifesteal, +30% Crit DMG', effect: { lifesteal: 5, critDamage: 30 } },
        ]
    },
    dragon: {
        name: "Dragonborn", color: '#ef4444', tier: 3, statBonus: 1.25, weaponType: 'dagger', // Zone 14 boss - AGI
        items: {
            weapon: { name: "Dragonborn Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 30 } },
            helmet: { name: "Dragonborn Horns", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            armor: { name: "Dragonborn Scales", effect: { id: 'bonusHp', name: '+HP', value: 130 } },
            legs: { name: "Dragonborn Legguards", effect: { id: 'bonusDmg', name: '+DMG', value: 20 } },
            boots: { name: "Dragonborn Claws", effect: { id: 'dodge', name: 'Dodge', value: 6 } },
            gloves: { name: "Dragonborn Talons", effect: { id: 'critDamage', name: 'Crit DMG', value: 35 } },
            shield: { name: "Dragonborn Aegis", effect: { id: 'thorns', name: 'Thorns', value: 12 } },
            belt: { name: "Dragonborn Girdle", effect: { id: 'bonusHp', name: '+HP', value: 100 } },
            amulet: { name: "Dragonborn Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 25 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+15% DMG', effect: { dmgMult: 0.15 } },
            { pieces: 4, desc: '+12% HP, +8% Crit Chance', effect: { hpMult: 0.12, critChance: 8 } },
            { pieces: 6, desc: '+25% Crit DMG, +10% Thorns', effect: { critDamage: 25, thorns: 10 } },
            { pieces: 8, desc: 'Dragon Fury: +30% DMG, +15% Speed', effect: { dmgMult: 0.30, speedMult: 0.15 } },
        ]
    },
    frost: {
        name: "Frostborn", color: '#06b6d4', tier: 4, statBonus: 1.3, weaponType: 'mace', // Zone 19 boss - VIT
        items: {
            weapon: { name: "Frostborn Axe", effect: { id: 'bonusDmg', name: '+DMG', value: 45 } },
            helmet: { name: "Frostborn Helm", effect: { id: 'dodge', name: 'Dodge', value: 7 } },
            armor: { name: "Frostborn Mail", effect: { id: 'bonusHp', name: '+HP', value: 180 } },
            legs: { name: "Frostborn Leggings", effect: { id: 'bonusHp', name: '+HP', value: 120 } },
            boots: { name: "Frostborn Boots", effect: { id: 'dodge', name: 'Dodge', value: 5 } },
            gloves: { name: "Frostborn Grips", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            shield: { name: "Frostborn Barrier", effect: { id: 'thorns', name: 'Thorns', value: 12 } },
            belt: { name: "Frostborn Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
            amulet: { name: "Frostborn Pendant", effect: { id: 'critDamage', name: 'Crit DMG', value: 40 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+8% Dodge', effect: { dodge: 8 } },
            { pieces: 4, desc: '+20% DMG, +18% HP', effect: { dmgMult: 0.20, hpMult: 0.18 } },
            { pieces: 6, desc: '+10% Crit, +35% Crit DMG', effect: { critChance: 10, critDamage: 35 } },
            { pieces: 8, desc: 'Frozen Heart: +12% All Stats', effect: { dmgMult: 0.12, hpMult: 0.12, speedMult: 0.12 } },
        ]
    },
    demon: {
        name: "Demonheart", color: '#dc2626', tier: 5, statBonus: 1.3, weaponType: 'sword', // Zone 24 boss - STR
        items: {
            weapon: { name: "Demonheart Scythe", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            helmet: { name: "Demonheart Horns", effect: { id: 'bonusDmg', name: '+DMG', value: 55 } },
            armor: { name: "Demonheart Plate", effect: { id: 'thorns', name: 'Thorns', value: 15 } },
            legs: { name: "Demonheart Greaves", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
            boots: { name: "Demonheart Hooves", effect: { id: 'dodge', name: 'Dodge', value: 7 } },
            gloves: { name: "Demonheart Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 45 } },
            shield: { name: "Demonheart Ward", effect: { id: 'bonusHp', name: '+HP', value: 200 } },
            belt: { name: "Demonheart Cord", effect: { id: 'critChance', name: 'Crit', value: 9 } },
            amulet: { name: "Demonheart Soul", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+4% Lifesteal', effect: { lifesteal: 4 } },
            { pieces: 4, desc: '+25% DMG, +12% Thorns', effect: { dmgMult: 0.25, thorns: 12 } },
            { pieces: 6, desc: '+22% HP, +40% Crit DMG', effect: { hpMult: 0.22, critDamage: 40 } },
            { pieces: 8, desc: 'Demonic Pact: +6% Lifesteal, +40% DMG', effect: { lifesteal: 6, dmgMult: 0.40 } },
        ]
    },
    seraph: {
        name: "Seraphic", color: '#fbbf24', tier: 6, statBonus: 1.35, weaponType: 'staff', // Zone 29 boss - INT
        items: {
            weapon: { name: "Seraphic Lance", effect: { id: 'bonusDmg', name: '+DMG', value: 75 } },
            helmet: { name: "Seraphic Halo", effect: { id: 'critChance', name: 'Crit', value: 10 } },
            armor: { name: "Seraphic Wings", effect: { id: 'bonusHp', name: '+HP', value: 280 } },
            legs: { name: "Seraphic Greaves", effect: { id: 'bonusDmg', name: '+DMG', value: 55 } },
            boots: { name: "Seraphic Steps", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            gloves: { name: "Seraphic Touch", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            shield: { name: "Seraphic Bulwark", effect: { id: 'thorns', name: 'Thorns', value: 16 } },
            belt: { name: "Seraphic Sash", effect: { id: 'critDamage', name: 'Crit DMG', value: 50 } },
            amulet: { name: "Seraphic Star", effect: { id: 'bonusDmg', name: '+DMG', value: 65 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+10% Crit Chance', effect: { critChance: 10 } },
            { pieces: 4, desc: '+30% DMG, +25% HP', effect: { dmgMult: 0.30, hpMult: 0.25 } },
            { pieces: 6, desc: '+12% All Stats', effect: { dmgMult: 0.12, hpMult: 0.12, speedMult: 0.12 } },
            { pieces: 8, desc: 'Divine Grace: +18% All Stats, +4% Lifesteal', effect: { dmgMult: 0.18, hpMult: 0.18, speedMult: 0.18, lifesteal: 4 } },
        ]
    },
    void: {
        name: "Voidwalker", color: '#7c3aed', tier: 6, statBonus: 1.35, weaponType: 'dagger', // Zone 34 boss - AGI
        items: {
            weapon: { name: "Voidwalker Reaper", effect: { id: 'critDamage', name: 'Crit DMG', value: 65 } },
            helmet: { name: "Voidwalker Mask", effect: { id: 'critChance', name: 'Crit', value: 11 } },
            armor: { name: "Voidwalker Shroud", effect: { id: 'bonusHp', name: '+HP', value: 350 } },
            legs: { name: "Voidwalker Leggings", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            boots: { name: "Voidwalker Striders", effect: { id: 'dodge', name: 'Dodge', value: 9 } },
            gloves: { name: "Voidwalker Grips", effect: { id: 'bonusDmg', name: '+DMG', value: 90 } },
            shield: { name: "Voidwalker Veil", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            belt: { name: "Voidwalker Cord", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            amulet: { name: "Voidwalker Core", effect: { id: 'critChance', name: 'Crit', value: 10 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+12% Crit Chance', effect: { critChance: 12 } },
            { pieces: 4, desc: '+35% DMG, +30% HP', effect: { dmgMult: 0.35, hpMult: 0.30 } },
            { pieces: 6, desc: '+30% Crit DMG, +8% Dodge', effect: { critDamage: 30, dodge: 8 } },
            { pieces: 8, desc: 'Void Embrace: +60% Crit DMG, +12% Dodge', effect: { critDamage: 60, dodge: 12 } },
        ]
    },
    chaos: {
        name: "Chaosborn", color: '#ec4899', tier: 6, statBonus: 1.4, weaponType: 'sword', // Zone 39 boss - Final boss - STR
        items: {
            weapon: { name: "Chaosborn Destroyer", effect: { id: 'bonusDmg', name: '+DMG', value: 120 } },
            helmet: { name: "Chaosborn Crown", effect: { id: 'critChance', name: 'Crit', value: 12 } },
            armor: { name: "Chaosborn Armor", effect: { id: 'bonusHp', name: '+HP', value: 450 } },
            legs: { name: "Chaosborn Legguards", effect: { id: 'critDamage', name: 'Crit DMG', value: 50 } },
            boots: { name: "Chaosborn Greaves", effect: { id: 'dodge', name: 'Dodge', value: 10 } },
            gloves: { name: "Chaosborn Fists", effect: { id: 'critDamage', name: 'Crit DMG', value: 70 } },
            shield: { name: "Chaosborn Barrier", effect: { id: 'thorns', name: 'Thorns', value: 20 } },
            belt: { name: "Chaosborn Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 5 } },
            amulet: { name: "Chaosborn Essence", effect: { id: 'bonusDmg', name: '+DMG', value: 100 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+25% Crit DMG', effect: { critDamage: 25 } },
            { pieces: 4, desc: '+40% DMG, +35% HP', effect: { dmgMult: 0.40, hpMult: 0.35 } },
            { pieces: 6, desc: '+15% All Stats', effect: { dmgMult: 0.15, hpMult: 0.15, speedMult: 0.15 } },
            { pieces: 8, desc: 'Chaos Incarnate: +60% DMG, +50% HP', effect: { dmgMult: 0.60, hpMult: 0.50 } },
        ]
    },
    eternal: {
        name: "Eternal", color: '#f97316', tier: 6, statBonus: 1.5, weaponType: 'sword', // Prestige only - best gear
        items: {
            weapon: { name: "Eternal Annihilator", effect: { id: 'bonusDmg', name: '+DMG', value: 180 } },
            helmet: { name: "Eternal Diadem", effect: { id: 'critChance', name: 'Crit', value: 14 } },
            armor: { name: "Eternal Plate", effect: { id: 'bonusHp', name: '+HP', value: 600 } },
            legs: { name: "Eternal Legguards", effect: { id: 'bonusDmg', name: '+DMG', value: 120 } },
            boots: { name: "Eternal Walkers", effect: { id: 'dodge', name: 'Dodge', value: 11 } },
            gloves: { name: "Eternal Gauntlets", effect: { id: 'critDamage', name: 'Crit DMG', value: 85 } },
            shield: { name: "Eternal Aegis", effect: { id: 'thorns', name: 'Thorns', value: 22 } },
            belt: { name: "Eternal Waistguard", effect: { id: 'lifesteal', name: 'Lifesteal', value: 5 } },
            amulet: { name: "Eternal Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 140 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+20% All Stats', effect: { dmgMult: 0.20, hpMult: 0.20, speedMult: 0.10 } },
            { pieces: 4, desc: '+50% DMG, +40% HP', effect: { dmgMult: 0.50, hpMult: 0.40 } },
            { pieces: 6, desc: '+15% Crit Chance, +50% Crit DMG', effect: { critChance: 15, critDamage: 50 } },
            { pieces: 8, desc: 'Eternal Power: +70% All Stats', effect: { dmgMult: 0.70, hpMult: 0.70, speedMult: 0.25 } },
        ]
    },
};

export const WEAPON_TYPES = [
    { id: 'sword', name: 'Sword', baseDmg: 8, baseHp: 0, scaling: 'str', speedBonus: 0, critBonus: 5, desc: 'Balanced, +5% crit' },
    { id: 'staff', name: 'Staff', baseDmg: 7, baseHp: 15, scaling: 'int', speedBonus: 0, critBonus: 0, desc: 'Magic, +15 HP' },
    { id: 'dagger', name: 'Dagger', baseDmg: 5, baseHp: 0, scaling: 'agi', speedBonus: 0.4, critBonus: 10, desc: '+40% speed, +10% crit' },
    { id: 'mace', name: 'Mace', baseDmg: 6, baseHp: 30, scaling: 'vit', speedBonus: -0.1, critBonus: 0, desc: 'Slow but tanky, +30 HP' },
];

export const GEAR_BASES = {
    weapon: { name: 'Sword', baseDmg: 8, baseHp: 0, baseArmor: 0, scaling: 'str', desc: '+8 DMG per tier' },
    helmet: { name: 'Helm', baseDmg: 0, baseHp: 20, baseArmor: 5, scaling: 'vit', desc: '+20 HP, +5 Armor per tier' },
    armor: { name: 'Plate', baseDmg: 0, baseHp: 40, baseArmor: 12, scaling: 'vit', desc: '+40 HP, +12 Armor per tier' },
    legs: { name: 'Leggings', baseDmg: 0, baseHp: 25, baseArmor: 8, scaling: 'vit', desc: '+25 HP, +8 Armor per tier' },
    boots: { name: 'Greaves', baseDmg: 0, baseHp: 15, baseArmor: 4, scaling: 'agi', desc: '+15 HP, +4 Armor per tier' },
    belt: { name: 'Belt', baseDmg: 3, baseHp: 10, baseArmor: 0, scaling: 'int', desc: '+3 DMG, +10 HP per tier' },
    shield: { name: 'Buckler', baseDmg: 0, baseHp: 30, baseArmor: 15, scaling: 'vit', desc: '+30 HP, +15 Armor per tier' },
    gloves: { name: 'Gauntlets', baseDmg: 4, baseHp: 10, baseArmor: 3, scaling: 'str', desc: '+4 DMG, +10 HP per tier' },
    amulet: { name: 'Pendant', baseDmg: 2, baseHp: 15, baseArmor: 0, scaling: 'int', desc: '+2 DMG, +15 HP per tier' },
};

export const SPECIAL_EFFECTS = [
    { id: 'thorns', name: 'Thorns', minVal: 5, maxVal: 25, color: '#f97316' },
    { id: 'lifesteal', name: 'Lifesteal', minVal: 1, maxVal: 8, color: '#22c55e' },
    { id: 'critChance', name: 'Crit', minVal: 3, maxVal: 15, color: '#ef4444' },
    { id: 'critDamage', name: 'Crit DMG', minVal: 15, maxVal: 60, color: '#dc2626' },
    { id: 'bonusDmg', name: '+DMG', minVal: 2, maxVal: 50, color: '#f59e0b' },
    { id: 'bonusHp', name: '+HP', minVal: 10, maxVal: 200, color: '#10b981' },
    { id: 'goldFind', name: 'Gold%', minVal: 2, maxVal: 10, color: '#fbbf24' },
    { id: 'xpBonus', name: 'XP%', minVal: 3, maxVal: 15, color: '#8b5cf6' },
    { id: 'dodge', name: 'Dodge', minVal: 1, maxVal: 8, color: '#06b6d4' },
];

// Enhancement milestones that grant bonus substats
export const ENHANCE_MILESTONES = [10, 15, 20, 25, 30];

// Power multipliers for each milestone (higher milestone = stronger substat)
const MILESTONE_POWER = {
    10: 1.0,   // Awakened - base power
    15: 1.5,   // Transcendent - 50% stronger
    20: 2.5,   // Celestial - 150% stronger
    25: 4.0,   // Celestial II - 300% stronger
    30: 6.0,   // Celestial III - 500% stronger
};

// Generate a random awakening substat for reaching a milestone
export function generateAwakeningSubstat(milestone, existingEffects = []) {
    const power = MILESTONE_POWER[milestone] || 1.0;

    // Filter out effects the item already has to avoid duplicates
    const existingIds = (existingEffects || []).map(e => e.id);
    const availableEffects = SPECIAL_EFFECTS.filter(e => !existingIds.includes(e.id));

    // If all effects are taken, pick a random one to stack
    const effectPool = availableEffects.length > 0 ? availableEffects : SPECIAL_EFFECTS;
    const effect = effectPool[Math.floor(Math.random() * effectPool.length)];

    // Calculate value based on milestone power
    const baseValue = effect.minVal + Math.random() * (effect.maxVal - effect.minVal) * 0.5;
    const value = Math.floor(baseValue * power);

    return {
        id: effect.id,
        name: effect.name,
        value: Math.min(value, effect.maxVal * power), // Cap at scaled max
        isAwakened: true, // Mark as awakening bonus for display purposes
        milestone: milestone, // Track which milestone granted it
    };
}

// Check if a plus level is a milestone
export function isEnhanceMilestone(plus) {
    return ENHANCE_MILESTONES.includes(plus);
}

export const PRESTIGE_BOSS_SETS = {
    astral: {
        name: "Astral", color: '#38bdf8', tier: 6, statBonus: 2.5,
        items: {
            weapon: { name: "Astral Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 800 } },
            helmet: { name: "Astral Crown", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            armor: { name: "Astral Vestments", effect: { id: 'bonusHp', name: '+HP', value: 4000 } },
            legs: { name: "Astral Legguards", effect: { id: 'bonusDmg', name: '+DMG', value: 500 } },
            boots: { name: "Astral Treads", effect: { id: 'dodge', name: 'Dodge', value: 28 } },
            gloves: { name: "Astral Grips", effect: { id: 'critDamage', name: 'Crit DMG', value: 280 } },
            shield: { name: "Astral Ward", effect: { id: 'thorns', name: 'Thorns', value: 60 } },
            belt: { name: "Astral Waistguard", effect: { id: 'lifesteal', name: 'Lifesteal', value: 14 } },
            amulet: { name: "Astral Core", effect: { id: 'bonusDmg', name: '+DMG', value: 600 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+150% All Stats', effect: { dmgMult: 1.50, hpMult: 1.50, speedMult: 0.50 } },
            { pieces: 4, desc: '+400% DMG, +300% HP', effect: { dmgMult: 4.00, hpMult: 3.00 } },
            { pieces: 6, desc: '+60% Crit, +250% Crit DMG', effect: { critChance: 60, critDamage: 250 } },
            { pieces: 8, desc: 'Astral Ascension: +600% All Stats', effect: { dmgMult: 6.0, hpMult: 6.0, speedMult: 1.0 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
    cosmic: {
        name: "Cosmic", color: '#a78bfa', tier: 6, statBonus: 3.0,
        items: {
            weapon: { name: "Cosmic Annihilator", effect: { id: 'bonusDmg', name: '+DMG', value: 1500 } },
            helmet: { name: "Cosmic Diadem", effect: { id: 'critChance', name: 'Crit', value: 40 } },
            armor: { name: "Cosmic Aegis", effect: { id: 'bonusHp', name: '+HP', value: 8000 } },
            legs: { name: "Cosmic Leggings", effect: { id: 'critChance', name: 'Crit', value: 30 } },
            boots: { name: "Cosmic Striders", effect: { id: 'dodge', name: 'Dodge', value: 32 } },
            gloves: { name: "Cosmic Gauntlets", effect: { id: 'critDamage', name: 'Crit DMG', value: 350 } },
            shield: { name: "Cosmic Barrier", effect: { id: 'thorns', name: 'Thorns', value: 80 } },
            belt: { name: "Cosmic Girdle", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            amulet: { name: "Cosmic Heart", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+250% All Stats', effect: { dmgMult: 2.50, hpMult: 2.50, speedMult: 0.80 } },
            { pieces: 4, desc: '+700% DMG, +500% HP', effect: { dmgMult: 7.00, hpMult: 5.00 } },
            { pieces: 6, desc: '+50% Crit, +300% Crit DMG', effect: { critChance: 50, critDamage: 300 } },
            { pieces: 8, desc: 'Cosmic Infinity: +1200% All Stats', effect: { dmgMult: 12.0, hpMult: 12.0, speedMult: 1.5 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
    primordial: {
        name: "Primordial", color: '#f472b6', tier: 6, statBonus: 4.0,
        items: {
            weapon: { name: "Primordial Worldbreaker", effect: { id: 'bonusDmg', name: '+DMG', value: 3000 } },
            helmet: { name: "Primordial Crown", effect: { id: 'critChance', name: 'Crit', value: 50 } },
            armor: { name: "Primordial Mantle", effect: { id: 'bonusHp', name: '+HP', value: 15000 } },
            legs: { name: "Primordial Greaves", effect: { id: 'bonusHp', name: '+HP', value: 10000 } },
            boots: { name: "Primordial Steps", effect: { id: 'dodge', name: 'Dodge', value: 35 } },
            gloves: { name: "Primordial Fists", effect: { id: 'critDamage', name: 'Crit DMG', value: 500 } },
            shield: { name: "Primordial Bulwark", effect: { id: 'thorns', name: 'Thorns', value: 100 } },
            belt: { name: "Primordial Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 20 } },
            amulet: { name: "Primordial Essence", effect: { id: 'bonusDmg', name: '+DMG', value: 2000 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+500% All Stats', effect: { dmgMult: 5.00, hpMult: 5.00, speedMult: 1.00 } },
            { pieces: 4, desc: '+1500% DMG, +1000% HP', effect: { dmgMult: 15.00, hpMult: 10.00 } },
            { pieces: 6, desc: '+75% Crit, +500% Crit DMG', effect: { critChance: 75, critDamage: 500 } },
            { pieces: 8, desc: 'Primordial Power: +3000% All', effect: { dmgMult: 30.0, hpMult: 30.0, speedMult: 2.0 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
};

export const PRESTIGE_WEAPONS = [
    { id: 'scythe', name: 'Scythe', baseDmg: 12, baseHp: 0, scaling: 'str', speedBonus: -0.1, critBonus: 15, desc: 'Slow but deadly, +15% crit', prestigeReq: 1 },
    { id: 'katana', name: 'Katana', baseDmg: 7, baseHp: 0, scaling: 'agi', speedBonus: 0.3, critBonus: 20, desc: 'Lightning fast, +20% crit', prestigeReq: 2 },
    { id: 'greataxe', name: 'Greataxe', baseDmg: 15, baseHp: 50, scaling: 'str', speedBonus: -0.2, critBonus: 8, desc: 'Massive damage, +50 HP', prestigeReq: 3 },
];

// Calculate item score for comparison (higher is better)
export function getItemScore(item) {
    if (!item) return 0;

    const tier = TIERS[item.tier] || TIERS[0];
    let score = tier.statMult * 100; // Base score from tier

    // Add enhancement bonus
    score += (item.plus || 0) * 15;

    // Add effect values
    if (item.effects) {
        for (const effect of item.effects) {
            score += (effect.value || 0) * 2;
        }
    }

    // Boss items get bonus
    if (item.bossSet) {
        score *= 1.3;
    }

    return Math.floor(score);
}

// Get salvage returns for an item (multiply by count for stacked items)
export function getSalvageReturns(item, explicitCount) {
    if (!item) return { gold: 0, enhanceStone: 0 };

    const tier = TIERS[item.tier] || TIERS[0];
    const plus = item.plus || 0;
    // Use explicit count if provided, otherwise use item's stack count, default to 1
    const itemCount = explicitCount !== undefined ? explicitCount : (item.count || 1);

    return {
        gold: Math.floor(((tier.goldCost || 50) * 0.4 + plus * 25) * itemCount),
        enhanceStone: Math.floor((1 + plus * 0.5 + tier.id * 0.3) * itemCount),
    };
}

// Generate a unique stack key for an item (items with same key can stack)
export function getItemStackKey(item) {
    if (!item) return null;
    // Create a stable representation of effects for comparison
    const effectsKey = item.effects && item.effects.length > 0
        ? item.effects.map(e => `${e.id}:${e.value}`).sort().join('|')
        : 'none';
    // Stack by: slot, tier, plus, bossSet, weaponType, effects
    return `${item.slot}_${item.tier}_${item.plus || 0}_${item.bossSet || 'none'}_${item.weaponType || 'none'}_${effectsKey}`;
}

// Add item to inventory with stacking
export function addItemToInventory(inventory, newItem) {
    const stackKey = getItemStackKey(newItem);
    const existingIndex = inventory.findIndex(item => getItemStackKey(item) === stackKey);

    if (existingIndex >= 0) {
        // Stack with existing item
        const updated = [...inventory];
        updated[existingIndex] = {
            ...updated[existingIndex],
            count: (updated[existingIndex].count || 1) + (newItem.count || 1)
        };
        return updated;
    } else {
        // Add as new item with count 1
        return [...inventory, { ...newItem, count: newItem.count || 1 }];
    }
}

// Get enhancement stage info for visual styling
// +0-9: Normal, +10-14: Awakened, +15-19: Transcendent, +20+: Celestial
export function getEnhanceStage(plus) {
    if (!plus || plus < 10) {
        return {
            stage: 'normal',
            name: null,
            color: '#fbbf24', // Yellow
            bgColor: 'rgba(251, 191, 36, 0.15)',
            borderColor: 'rgba(251, 191, 36, 0.4)',
            glow: null,
            icon: null
        };
    } else if (plus < 15) {
        return {
            stage: 'awakened',
            name: 'Awakened',
            color: '#22d3ee', // Cyan
            bgColor: 'rgba(34, 211, 238, 0.2)',
            borderColor: 'rgba(34, 211, 238, 0.5)',
            glow: '0 0 8px rgba(34, 211, 238, 0.6)',
            icon: '◆' // Diamond
        };
    } else if (plus < 20) {
        return {
            stage: 'transcendent',
            name: 'Transcendent',
            color: '#c084fc', // Purple
            bgColor: 'rgba(192, 132, 252, 0.25)',
            borderColor: 'rgba(192, 132, 252, 0.6)',
            glow: '0 0 12px rgba(192, 132, 252, 0.7)',
            icon: '★' // Star
        };
    } else {
        return {
            stage: 'celestial',
            name: 'Celestial',
            color: '#f472b6', // Pink
            bgColor: 'rgba(244, 114, 182, 0.3)',
            borderColor: 'rgba(244, 114, 182, 0.7)',
            glow: '0 0 15px rgba(244, 114, 182, 0.8), 0 0 25px rgba(251, 191, 36, 0.4)',
            icon: '✦' // Four-pointed star
        };
    }
}

// Remove one item from a stack (for equipping)
export function removeOneFromStack(inventory, itemId) {
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    if (itemIndex < 0) return inventory;

    const item = inventory[itemIndex];
    const count = item.count || 1;

    if (count <= 1) {
        // Remove entirely
        return inventory.filter(i => i.id !== itemId);
    } else {
        // Reduce count
        const updated = [...inventory];
        updated[itemIndex] = { ...item, count: count - 1 };
        return updated;
    }
}

// Generate a random gear drop for a given zone tier
export function generateGearDrop(zoneTier, zoneId) {
    // Random slot
    const slot = GEAR_SLOTS[Math.floor(Math.random() * GEAR_SLOTS.length)];

    // Determine tier - usually zone tier, small chance for +1 tier
    let tier = zoneTier;
    if (Math.random() < 0.15 && tier < TIERS.length - 1) {
        tier = Math.min(tier + 1, TIERS.length - 1);
    }

    const tierInfo = TIERS[tier];

    // Generate name based on slot and tier
    let name;
    let weaponType = null;
    if (slot === 'weapon') {
        // Pick a random weapon type
        const weaponTypes = WEAPON_TYPES;
        const weaponTypeInfo = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
        weaponType = weaponTypeInfo.id;
        name = GEAR_NAMES[weaponType]?.[tier] || GEAR_NAMES.sword[tier] || 'Weapon';
    } else {
        name = GEAR_NAMES[slot]?.[tier] || tierInfo.name + ' ' + slot;
    }

    // Generate random effects based on tier
    const effects = [];
    const numEffects = Math.random() < (0.1 + tier * 0.08) ? (Math.random() < 0.3 ? 2 : 1) : 0;

    if (numEffects > 0) {
        const availableEffects = [...SPECIAL_EFFECTS];
        for (let i = 0; i < numEffects; i++) {
            if (availableEffects.length === 0) break;
            const effectIndex = Math.floor(Math.random() * availableEffects.length);
            const effect = availableEffects.splice(effectIndex, 1)[0];
            // Scale effect value with tier
            const tierScale = 1 + tier * 0.3;
            const value = Math.floor(effect.minVal + Math.random() * (effect.maxVal - effect.minVal) * tierScale);
            effects.push({ id: effect.id, name: effect.name, value: Math.min(value, effect.maxVal * 2) });
        }
    }

    return {
        id: Date.now() + Math.random(),
        slot,
        tier,
        name,
        plus: 0,
        weaponType,
        effects,
    };
}
