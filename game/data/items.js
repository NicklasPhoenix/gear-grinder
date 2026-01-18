export const MATERIALS = {
    ore: { name: 'Iron Ore', color: '#94a3b8', icon: '⛏️' },
    leather: { name: 'Leather', color: '#d97706', icon: '🧶' },
    enhanceStone: { name: 'E.Stone', color: '#60a5fa', icon: '💎' },
    blessedOrb: { name: 'B.Orb', color: '#c084fc', icon: '🔮' },
    celestialShard: { name: 'C.Shard', color: '#fbbf24', icon: '✨' },
    prestigeStone: { name: 'P.Stone', color: '#f472b6', icon: '🌟' },
};

export const GEAR_SLOTS = ['weapon', 'helmet', 'armor', 'boots', 'accessory', 'shield', 'gloves', 'amulet'];

export const TIERS = [
    // Costs dramatically increased - high tier gear should be a real achievement
    { id: 0, name: 'Common', color: '#9ca3af', statMult: 1, oreCost: 5, leatherCost: 5, goldCost: 50, zoneReq: 0 },
    { id: 1, name: 'Uncommon', color: '#22c55e', statMult: 1.8, oreCost: 25, leatherCost: 25, goldCost: 300, zoneReq: 1 },
    { id: 2, name: 'Rare', color: '#3b82f6', statMult: 3, oreCost: 80, leatherCost: 80, goldCost: 1500, zoneReq: 3 },
    { id: 3, name: 'Epic', color: '#a855f7', statMult: 5, oreCost: 250, leatherCost: 250, goldCost: 8000, zoneReq: 6 },
    { id: 4, name: 'Legendary', color: '#f97316', statMult: 8, oreCost: 800, leatherCost: 800, goldCost: 35000, zoneReq: 10 },
    { id: 5, name: 'Mythic', color: '#ec4899', statMult: 12, oreCost: 2500, leatherCost: 2500, goldCost: 150000, zoneReq: 14 },
    { id: 6, name: 'Divine', color: '#fbbf24', statMult: 18, oreCost: 8000, leatherCost: 8000, goldCost: 500000, zoneReq: 18 },
    // Prestige tiers - require prestige level to unlock
    { id: 7, name: 'Astral', color: '#38bdf8', statMult: 28, oreCost: 20000, leatherCost: 20000, goldCost: 1500000, zoneReq: 21, prestigeReq: 1 },
    { id: 8, name: 'Cosmic', color: '#818cf8', statMult: 42, oreCost: 50000, leatherCost: 50000, goldCost: 5000000, zoneReq: 23, prestigeReq: 2 },
    { id: 9, name: 'Primordial', color: '#f472b6', statMult: 65, oreCost: 120000, leatherCost: 120000, goldCost: 15000000, zoneReq: 25, prestigeReq: 3 },
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
    boots: ['Sandals', 'Leather Boots', 'Chain Greaves', 'Plated Boots', 'Dragonskin Treads', 'Voidwalkers', 'Angelic Steps', 'Astral Treads', 'Cosmic Boots', 'Primordial Striders'],
    accessory: ['Copper Ring', 'Silver Band', 'Sapphire Ring', 'Amethyst Loop', 'Phoenix Signet', 'Chaos Band', 'Ring of Eternity', 'Astral Loop', 'Cosmic Ring', 'Primordial Band'],
    shield: ['Wooden Shield', 'Iron Buckler', 'Steel Kite', 'Tower Shield', 'Dragon Guard', 'Bulwark', 'Aegis of Dawn', 'Astral Barrier', 'Cosmic Shield', 'Primordial Bulwark'],
    gloves: ['Cloth Wraps', 'Leather Gloves', 'Chain Gauntlets', 'Plate Fists', 'Drake Claws', 'Void Grip', 'Hands of Fate', 'Astral Grasp', 'Cosmic Gauntlets', 'Primordial Fists'],
    amulet: ['Bead Necklace', 'Bronze Pendant', 'Silver Locket', 'Mystic Amulet', 'Dragon Heart', 'Soul Gem', 'Tear of the Gods', 'Astral Pendant', 'Cosmic Amulet', 'Primordial Heart'],
};

export const BOSS_SETS = {
    guardian: {
        name: "Guardian's", color: '#22c55e', tier: 2, statBonus: 1.5, // Zone 2 boss - Rare tier, 50% better stats
        items: {
            weapon: { name: "Guardian's Greatsword", effect: { id: 'bonusDmg', name: '+DMG', value: 40 } },
            helmet: { name: "Guardian's Crown", effect: { id: 'bonusHp', name: '+HP', value: 150 } },
            armor: { name: "Guardian's Plate", effect: { id: 'thorns', name: 'Thorns', value: 20 } },
            boots: { name: "Guardian's Treads", effect: { id: 'dodge', name: 'Dodge', value: 10 } },
            gloves: { name: "Guardian's Grasp", effect: { id: 'bonusDmg', name: '+DMG', value: 25 } },
            shield: { name: "Guardian's Bulwark", effect: { id: 'bonusHp', name: '+HP', value: 200 } },
            accessory: { name: "Guardian's Signet", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            amulet: { name: "Guardian's Charm", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+25% HP', effect: { hpMult: 0.25 } },
            { pieces: 4, desc: '+40% DMG, +15% Thorns', effect: { dmgMult: 0.40, thorns: 15 } },
            { pieces: 6, desc: '+30% All Stats', effect: { dmgMult: 0.30, hpMult: 0.30, speedMult: 0.20 } },
            { pieces: 8, desc: 'Guardian Blessing: +60% HP, +20% Dodge', effect: { hpMult: 0.60, dodge: 20 } },
        ]
    },
    lich: {
        name: "Lich", color: '#8b5cf6', tier: 3, statBonus: 1.5, // Zone 5 boss - Epic tier
        items: {
            weapon: { name: "Lich's Staff", effect: { id: 'critDamage', name: 'Crit DMG', value: 100 } },
            helmet: { name: "Lich's Crown", effect: { id: 'lifesteal', name: 'Lifesteal', value: 8 } },
            armor: { name: "Lich's Robes", effect: { id: 'bonusHp', name: '+HP', value: 250 } },
            boots: { name: "Lich's Sandals", effect: { id: 'dodge', name: 'Dodge', value: 12 } },
            gloves: { name: "Lich's Grasp", effect: { id: 'critChance', name: 'Crit', value: 18 } },
            shield: { name: "Lich's Tome", effect: { id: 'bonusDmg', name: '+DMG', value: 60 } },
            accessory: { name: "Lich's Phylactery", effect: { id: 'lifesteal', name: 'Lifesteal', value: 6 } },
            amulet: { name: "Lich's Soulstone", effect: { id: 'critDamage', name: 'Crit DMG', value: 80 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+8% Lifesteal', effect: { lifesteal: 8 } },
            { pieces: 4, desc: '+50% Crit DMG, +50% DMG', effect: { critDamage: 50, dmgMult: 0.50 } },
            { pieces: 6, desc: '+15% Crit Chance, +60% HP', effect: { critChance: 15, hpMult: 0.60 } },
            { pieces: 8, desc: 'Undeath: +12% Lifesteal, +100% Crit DMG', effect: { lifesteal: 12, critDamage: 100 } },
        ]
    },
    dragon: {
        name: "Dragonborn", color: '#ef4444', tier: 3, statBonus: 1.6, // Zone 7 boss - Epic tier, slightly better
        items: {
            weapon: { name: "Dragonborn Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 80 } },
            helmet: { name: "Dragonborn Horns", effect: { id: 'critChance', name: 'Crit', value: 20 } },
            armor: { name: "Dragonborn Scales", effect: { id: 'bonusHp', name: '+HP', value: 350 } },
            boots: { name: "Dragonborn Claws", effect: { id: 'dodge', name: 'Dodge', value: 14 } },
            gloves: { name: "Dragonborn Talons", effect: { id: 'critDamage', name: 'Crit DMG', value: 90 } },
            shield: { name: "Dragonborn Aegis", effect: { id: 'thorns', name: 'Thorns', value: 30 } },
            accessory: { name: "Dragonborn Scale", effect: { id: 'bonusHp', name: '+HP', value: 300 } },
            amulet: { name: "Dragonborn Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 70 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+50% DMG', effect: { dmgMult: 0.50 } },
            { pieces: 4, desc: '+40% HP, +20% Crit Chance', effect: { hpMult: 0.40, critChance: 20 } },
            { pieces: 6, desc: '+80% Crit DMG, +25% Thorns', effect: { critDamage: 80, thorns: 25 } },
            { pieces: 8, desc: 'Dragon Fury: +100% DMG, +50% Speed', effect: { dmgMult: 1.00, speedMult: 0.50 } },
        ]
    },
    frost: {
        name: "Frostborn", color: '#06b6d4', tier: 4, statBonus: 1.6, // Zone 10 boss - Legendary tier
        items: {
            weapon: { name: "Frostborn Axe", effect: { id: 'bonusDmg', name: '+DMG', value: 120 } },
            helmet: { name: "Frostborn Helm", effect: { id: 'dodge', name: 'Dodge', value: 15 } },
            armor: { name: "Frostborn Mail", effect: { id: 'bonusHp', name: '+HP', value: 500 } },
            boots: { name: "Frostborn Boots", effect: { id: 'dodge', name: 'Dodge', value: 12 } },
            gloves: { name: "Frostborn Grips", effect: { id: 'critChance', name: 'Crit', value: 18 } },
            shield: { name: "Frostborn Barrier", effect: { id: 'thorns', name: 'Thorns', value: 28 } },
            accessory: { name: "Frostborn Band", effect: { id: 'lifesteal', name: 'Lifesteal', value: 7 } },
            amulet: { name: "Frostborn Pendant", effect: { id: 'critDamage', name: 'Crit DMG', value: 110 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+20% Dodge', effect: { dodge: 20 } },
            { pieces: 4, desc: '+70% DMG, +60% HP', effect: { dmgMult: 0.70, hpMult: 0.60 } },
            { pieces: 6, desc: '+25% Crit, +100% Crit DMG', effect: { critChance: 25, critDamage: 100 } },
            { pieces: 8, desc: 'Frozen Heart: +40% All Stats', effect: { dmgMult: 0.40, hpMult: 0.40, speedMult: 0.40 } },
        ]
    },
    demon: {
        name: "Demonheart", color: '#dc2626', tier: 4, statBonus: 1.7, // Zone 12 boss - Legendary tier
        items: {
            weapon: { name: "Demonheart Scythe", effect: { id: 'lifesteal', name: 'Lifesteal', value: 10 } },
            helmet: { name: "Demonheart Horns", effect: { id: 'bonusDmg', name: '+DMG', value: 150 } },
            armor: { name: "Demonheart Plate", effect: { id: 'thorns', name: 'Thorns', value: 35 } },
            boots: { name: "Demonheart Hooves", effect: { id: 'dodge', name: 'Dodge', value: 16 } },
            gloves: { name: "Demonheart Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 120 } },
            shield: { name: "Demonheart Ward", effect: { id: 'bonusHp', name: '+HP', value: 550 } },
            accessory: { name: "Demonheart Ring", effect: { id: 'critChance', name: 'Crit', value: 20 } },
            amulet: { name: "Demonheart Soul", effect: { id: 'lifesteal', name: 'Lifesteal', value: 8 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+10% Lifesteal', effect: { lifesteal: 10 } },
            { pieces: 4, desc: '+80% DMG, +30% Thorns', effect: { dmgMult: 0.80, thorns: 30 } },
            { pieces: 6, desc: '+70% HP, +120% Crit DMG', effect: { hpMult: 0.70, critDamage: 120 } },
            { pieces: 8, desc: 'Demonic Pact: +15% Lifesteal, +150% DMG', effect: { lifesteal: 15, dmgMult: 1.50 } },
        ]
    },
    seraph: {
        name: "Seraphic", color: '#fbbf24', tier: 5, statBonus: 1.7, // Zone 14 boss - Mythic tier
        items: {
            weapon: { name: "Seraphic Lance", effect: { id: 'bonusDmg', name: '+DMG', value: 200 } },
            helmet: { name: "Seraphic Halo", effect: { id: 'critChance', name: 'Crit', value: 25 } },
            armor: { name: "Seraphic Wings", effect: { id: 'bonusHp', name: '+HP', value: 800 } },
            boots: { name: "Seraphic Steps", effect: { id: 'dodge', name: 'Dodge', value: 18 } },
            gloves: { name: "Seraphic Touch", effect: { id: 'lifesteal', name: 'Lifesteal', value: 9 } },
            shield: { name: "Seraphic Bulwark", effect: { id: 'thorns', name: 'Thorns', value: 38 } },
            accessory: { name: "Seraphic Ring", effect: { id: 'critDamage', name: 'Crit DMG', value: 140 } },
            amulet: { name: "Seraphic Star", effect: { id: 'bonusDmg', name: '+DMG', value: 180 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+25% Crit Chance', effect: { critChance: 25 } },
            { pieces: 4, desc: '+100% DMG, +80% HP', effect: { dmgMult: 1.00, hpMult: 0.80 } },
            { pieces: 6, desc: '+30% All Stats', effect: { dmgMult: 0.30, hpMult: 0.30, speedMult: 0.30 } },
            { pieces: 8, desc: 'Divine Grace: +50% All Stats, +10% Lifesteal', effect: { dmgMult: 0.50, hpMult: 0.50, speedMult: 0.50, lifesteal: 10 } },
        ]
    },
    void: {
        name: "Voidwalker", color: '#7c3aed', tier: 5, statBonus: 1.8, // Zone 16 boss - Mythic tier
        items: {
            weapon: { name: "Voidwalker Reaper", effect: { id: 'critDamage', name: 'Crit DMG', value: 180 } },
            helmet: { name: "Voidwalker Mask", effect: { id: 'critChance', name: 'Crit', value: 25 } },
            armor: { name: "Voidwalker Shroud", effect: { id: 'bonusHp', name: '+HP', value: 1000 } },
            boots: { name: "Voidwalker Striders", effect: { id: 'dodge', name: 'Dodge', value: 20 } },
            gloves: { name: "Voidwalker Grips", effect: { id: 'bonusDmg', name: '+DMG', value: 250 } },
            shield: { name: "Voidwalker Veil", effect: { id: 'dodge', name: 'Dodge', value: 18 } },
            accessory: { name: "Voidwalker Band", effect: { id: 'lifesteal', name: 'Lifesteal', value: 10 } },
            amulet: { name: "Voidwalker Core", effect: { id: 'critChance', name: 'Crit', value: 22 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+30% Crit Chance', effect: { critChance: 30 } },
            { pieces: 4, desc: '+120% DMG, +100% HP', effect: { dmgMult: 1.20, hpMult: 1.00 } },
            { pieces: 6, desc: '+80% Crit DMG, +20% Dodge', effect: { critDamage: 80, dodge: 20 } },
            { pieces: 8, desc: 'Void Embrace: +200% Crit DMG, +35% Dodge', effect: { critDamage: 200, dodge: 35 } },
        ]
    },
    chaos: {
        name: "Chaosborn", color: '#ec4899', tier: 6, statBonus: 1.8, // Zone 18 boss - Divine tier
        items: {
            weapon: { name: "Chaosborn Destroyer", effect: { id: 'bonusDmg', name: '+DMG', value: 350 } },
            helmet: { name: "Chaosborn Crown", effect: { id: 'critChance', name: 'Crit', value: 28 } },
            armor: { name: "Chaosborn Armor", effect: { id: 'bonusHp', name: '+HP', value: 1400 } },
            boots: { name: "Chaosborn Greaves", effect: { id: 'dodge', name: 'Dodge', value: 22 } },
            gloves: { name: "Chaosborn Fists", effect: { id: 'critDamage', name: 'Crit DMG', value: 200 } },
            shield: { name: "Chaosborn Barrier", effect: { id: 'thorns', name: 'Thorns', value: 45 } },
            accessory: { name: "Chaosborn Seal", effect: { id: 'lifesteal', name: 'Lifesteal', value: 11 } },
            amulet: { name: "Chaosborn Essence", effect: { id: 'bonusDmg', name: '+DMG', value: 300 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+60% Crit DMG', effect: { critDamage: 60 } },
            { pieces: 4, desc: '+150% DMG, +120% HP', effect: { dmgMult: 1.50, hpMult: 1.20 } },
            { pieces: 6, desc: '+50% All Stats', effect: { dmgMult: 0.50, hpMult: 0.50, speedMult: 0.50 } },
            { pieces: 8, desc: 'Chaos Incarnate: +250% DMG, +200% HP', effect: { dmgMult: 2.50, hpMult: 2.00 } },
        ]
    },
    eternal: {
        name: "Eternal", color: '#f97316', tier: 6, statBonus: 2.0, // Zone 20 boss - Divine tier, best in game
        items: {
            weapon: { name: "Eternal Annihilator", effect: { id: 'bonusDmg', name: '+DMG', value: 500 } },
            helmet: { name: "Eternal Diadem", effect: { id: 'critChance', name: 'Crit', value: 30 } },
            armor: { name: "Eternal Plate", effect: { id: 'bonusHp', name: '+HP', value: 2000 } },
            boots: { name: "Eternal Walkers", effect: { id: 'dodge', name: 'Dodge', value: 25 } },
            gloves: { name: "Eternal Gauntlets", effect: { id: 'critDamage', name: 'Crit DMG', value: 250 } },
            shield: { name: "Eternal Aegis", effect: { id: 'thorns', name: 'Thorns', value: 50 } },
            accessory: { name: "Eternal Loop", effect: { id: 'lifesteal', name: 'Lifesteal', value: 12 } },
            amulet: { name: "Eternal Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 300 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+80% All Stats', effect: { dmgMult: 0.80, hpMult: 0.80, speedMult: 0.30 } },
            { pieces: 4, desc: '+200% DMG, +150% HP', effect: { dmgMult: 2.00, hpMult: 1.50 } },
            { pieces: 6, desc: '+40% Crit Chance, +150% Crit DMG', effect: { critChance: 40, critDamage: 150 } },
            { pieces: 8, desc: 'Eternal Power: +300% All Stats', effect: { dmgMult: 3.0, hpMult: 3.0, speedMult: 0.80 } },
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
    boots: { name: 'Greaves', baseDmg: 0, baseHp: 15, baseArmor: 4, scaling: 'agi', desc: '+15 HP, +4 Armor per tier' },
    accessory: { name: 'Ring', baseDmg: 3, baseHp: 10, baseArmor: 0, scaling: 'int', desc: '+3 DMG, +10 HP per tier' },
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

export const PRESTIGE_BOSS_SETS = {
    astral: {
        name: "Astral", color: '#38bdf8', tier: 6, statBonus: 2.5,
        items: {
            weapon: { name: "Astral Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 800 } },
            helmet: { name: "Astral Crown", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            armor: { name: "Astral Vestments", effect: { id: 'bonusHp', name: '+HP', value: 4000 } },
            boots: { name: "Astral Treads", effect: { id: 'dodge', name: 'Dodge', value: 28 } },
            gloves: { name: "Astral Grips", effect: { id: 'critDamage', name: 'Crit DMG', value: 280 } },
            shield: { name: "Astral Ward", effect: { id: 'thorns', name: 'Thorns', value: 60 } },
            accessory: { name: "Astral Band", effect: { id: 'lifesteal', name: 'Lifesteal', value: 14 } },
            amulet: { name: "Astral Core", effect: { id: 'bonusDmg', name: '+DMG', value: 600 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+150% All Stats', effect: { dmgMult: 1.50, hpMult: 1.50, speedMult: 0.50 } },
            { pieces: 4, desc: '+400% DMG, +300% HP', effect: { dmgMult: 4.00, hpMult: 3.00 } },
            { pieces: 6, desc: '+60% Crit, +250% Crit DMG', effect: { critChance: 60, critDamage: 250 } },
            { pieces: 8, desc: 'Astral Ascension: +600% All Stats', effect: { dmgMult: 6.0, hpMult: 6.0, speedMult: 1.0 } },
        ]
    },
    cosmic: {
        name: "Cosmic", color: '#a78bfa', tier: 6, statBonus: 3.0,
        items: {
            weapon: { name: "Cosmic Annihilator", effect: { id: 'bonusDmg', name: '+DMG', value: 1500 } },
            helmet: { name: "Cosmic Diadem", effect: { id: 'critChance', name: 'Crit', value: 40 } },
            armor: { name: "Cosmic Aegis", effect: { id: 'bonusHp', name: '+HP', value: 8000 } },
            boots: { name: "Cosmic Striders", effect: { id: 'dodge', name: 'Dodge', value: 32 } },
            gloves: { name: "Cosmic Gauntlets", effect: { id: 'critDamage', name: 'Crit DMG', value: 350 } },
            shield: { name: "Cosmic Barrier", effect: { id: 'thorns', name: 'Thorns', value: 80 } },
            accessory: { name: "Cosmic Ring", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            amulet: { name: "Cosmic Heart", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+250% All Stats', effect: { dmgMult: 2.50, hpMult: 2.50, speedMult: 0.80 } },
            { pieces: 4, desc: '+700% DMG, +500% HP', effect: { dmgMult: 7.00, hpMult: 5.00 } },
            { pieces: 6, desc: '+50% Crit, +300% Crit DMG', effect: { critChance: 50, critDamage: 300 } },
            { pieces: 8, desc: 'Cosmic Infinity: +1200% All Stats', effect: { dmgMult: 12.0, hpMult: 12.0, speedMult: 1.5 } },
        ]
    },
    primordial: {
        name: "Primordial", color: '#f472b6', tier: 6, statBonus: 4.0,
        items: {
            weapon: { name: "Primordial Worldbreaker", effect: { id: 'bonusDmg', name: '+DMG', value: 3000 } },
            helmet: { name: "Primordial Crown", effect: { id: 'critChance', name: 'Crit', value: 50 } },
            armor: { name: "Primordial Mantle", effect: { id: 'bonusHp', name: '+HP', value: 15000 } },
            boots: { name: "Primordial Steps", effect: { id: 'dodge', name: 'Dodge', value: 35 } },
            gloves: { name: "Primordial Fists", effect: { id: 'critDamage', name: 'Crit DMG', value: 500 } },
            shield: { name: "Primordial Bulwark", effect: { id: 'thorns', name: 'Thorns', value: 100 } },
            accessory: { name: "Primordial Ring", effect: { id: 'lifesteal', name: 'Lifesteal', value: 20 } },
            amulet: { name: "Primordial Essence", effect: { id: 'bonusDmg', name: '+DMG', value: 2000 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+500% All Stats', effect: { dmgMult: 5.00, hpMult: 5.00, speedMult: 1.00 } },
            { pieces: 4, desc: '+1500% DMG, +1000% HP', effect: { dmgMult: 15.00, hpMult: 10.00 } },
            { pieces: 6, desc: '+75% Crit, +500% Crit DMG', effect: { critChance: 75, critDamage: 500 } },
            { pieces: 8, desc: 'Primordial Power: +3000% All', effect: { dmgMult: 30.0, hpMult: 30.0, speedMult: 2.0 } },
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

// Get salvage returns for an item
export function getSalvageReturns(item) {
    if (!item) return { gold: 0, ore: 0, leather: 0, enhanceStone: 0 };

    const tier = TIERS[item.tier] || TIERS[0];
    const plus = item.plus || 0;

    return {
        gold: Math.floor((tier.goldCost || 50) * 0.3 + plus * 20),
        ore: Math.floor((tier.oreCost || 5) * 0.4 + plus * 2),
        leather: Math.floor((tier.leatherCost || 5) * 0.4 + plus * 2),
        enhanceStone: Math.floor(plus * 0.5),
    };
}
