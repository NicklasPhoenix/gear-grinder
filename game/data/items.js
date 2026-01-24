export const MATERIALS = {
    enhanceStone: { name: 'E.Stone', icon: ' E.St', color: '#60a5fa' },
    blessedOrb: { name: 'B.Orb', icon: ' B.Orb', color: '#c084fc' },
    celestialShard: { name: 'C.Shard', icon: ' C.Sh', color: '#fbbf24' },
    prestigeStone: { name: 'P.Stone', icon: ' P.St', color: '#f472b6' },
};

// Boss stones - dropped by bosses, required to enhance boss gear past +10
export const BOSS_STONES = {
    crow: { name: 'Crow Stone', color: '#22c55e', bossName: 'Crow Demon', gemIcon: 5 },
    cerberus: { name: 'Cerberus Stone', color: '#8b5cf6', bossName: 'Cerberus', gemIcon: 9 },
    demon: { name: 'Demon Stone', color: '#ef4444', bossName: 'Demon Lord', gemIcon: 13 },
    spider: { name: 'Spider Stone', color: '#06b6d4', bossName: 'Spider Matriarch', gemIcon: 17 },
    shadow: { name: 'Shadow Stone', color: '#dc2626', bossName: 'Shadow Wolf Alpha', gemIcon: 21 },
    abyss: { name: 'Abyss Stone', color: '#fbbf24', bossName: 'Eye of the Abyss', gemIcon: 25 },
    behemoth: { name: 'Behemoth Stone', color: '#7c3aed', bossName: 'Horned Behemoth', gemIcon: 29 },
    darkwolf: { name: 'Dark Wolf Stone', color: '#ec4899', bossName: 'Dark Wolf King', gemIcon: 33 },
    tyrant: { name: 'Tyrant Stone', color: '#38bdf8', bossName: 'Eye Tyrant', gemIcon: 41 },
    inferno: { name: 'Inferno Stone', color: '#a78bfa', bossName: 'Inferno Fox', gemIcon: 44 },
    scorpion: { name: 'Scorpion Stone', color: '#f472b6', bossName: 'Scorpion King', gemIcon: 48 },
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
    crow: {
        name: "Crow Demon", color: '#22c55e', tier: 1, statBonus: 1.2, weaponType: 'sword', // Zone 4 boss - STR
        items: {
            weapon: { name: "Crow Demon Talon", effect: { id: 'bonusDmg', name: '+DMG', value: 15 } },
            helmet: { name: "Crow Demon Crown", effect: { id: 'bonusHp', name: '+HP', value: 50 } },
            armor: { name: "Crow Demon Wings", effect: { id: 'thorns', name: 'Thorns', value: 8 } },
            legs: { name: "Crow Demon Greaves", effect: { id: 'bonusHp', name: '+HP', value: 40 } },
            boots: { name: "Crow Demon Claws", effect: { id: 'dodge', name: 'Dodge', value: 4 } },
            gloves: { name: "Crow Demon Grasp", effect: { id: 'bonusDmg', name: '+DMG', value: 10 } },
            shield: { name: "Crow Demon Ward", effect: { id: 'bonusHp', name: '+HP', value: 70 } },
            belt: { name: "Crow Demon Girdle", effect: { id: 'critChance', name: 'Crit', value: 4 } },
            amulet: { name: "Crow Demon Feather", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+10% HP', effect: { hpMult: 0.10 } },
            { pieces: 4, desc: '+15% DMG, +5% Thorns', effect: { dmgMult: 0.15, thorns: 5 } },
            { pieces: 6, desc: '+10% All Stats', effect: { dmgMult: 0.10, hpMult: 0.10, speedMult: 0.05 } },
            { pieces: 8, desc: 'Crow Flight: +20% HP, +8% Dodge', effect: { hpMult: 0.20, dodge: 8 } },
        ]
    },
    cerberus: {
        name: "Cerberus", color: '#8b5cf6', tier: 2, statBonus: 1.25, weaponType: 'staff', // Zone 9 boss - INT
        items: {
            weapon: { name: "Cerberus Fang", effect: { id: 'critDamage', name: 'Crit DMG', value: 35 } },
            helmet: { name: "Cerberus Skull", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
            armor: { name: "Cerberus Hide", effect: { id: 'bonusHp', name: '+HP', value: 90 } },
            legs: { name: "Cerberus Greaves", effect: { id: 'critChance', name: 'Crit', value: 4 } },
            boots: { name: "Cerberus Paws", effect: { id: 'dodge', name: 'Dodge', value: 5 } },
            gloves: { name: "Cerberus Claws", effect: { id: 'critChance', name: 'Crit', value: 6 } },
            shield: { name: "Cerberus Guard", effect: { id: 'bonusDmg', name: '+DMG', value: 20 } },
            belt: { name: "Cerberus Chain", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
            amulet: { name: "Cerberus Heart", effect: { id: 'critDamage', name: 'Crit DMG', value: 25 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+3% Lifesteal', effect: { lifesteal: 3 } },
            { pieces: 4, desc: '+20% Crit DMG, +15% DMG', effect: { critDamage: 20, dmgMult: 0.15 } },
            { pieces: 6, desc: '+6% Crit Chance, +15% HP', effect: { critChance: 6, hpMult: 0.15 } },
            { pieces: 8, desc: 'Hellhound Fury: +5% Lifesteal, +30% Crit DMG', effect: { lifesteal: 5, critDamage: 30 } },
        ]
    },
    demon: {
        name: "Demon Lord", color: '#ef4444', tier: 3, statBonus: 1.25, weaponType: 'dagger', // Zone 14 boss - AGI
        items: {
            weapon: { name: "Demon Lord Blade", effect: { id: 'bonusDmg', name: '+DMG', value: 30 } },
            helmet: { name: "Demon Lord Crown", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            armor: { name: "Demon Lord Plate", effect: { id: 'bonusHp', name: '+HP', value: 130 } },
            legs: { name: "Demon Lord Greaves", effect: { id: 'bonusDmg', name: '+DMG', value: 20 } },
            boots: { name: "Demon Lord Hooves", effect: { id: 'dodge', name: 'Dodge', value: 6 } },
            gloves: { name: "Demon Lord Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 35 } },
            shield: { name: "Demon Lord Aegis", effect: { id: 'thorns', name: 'Thorns', value: 12 } },
            belt: { name: "Demon Lord Girdle", effect: { id: 'bonusHp', name: '+HP', value: 100 } },
            amulet: { name: "Demon Lord Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 25 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+15% DMG', effect: { dmgMult: 0.15 } },
            { pieces: 4, desc: '+12% HP, +8% Crit Chance', effect: { hpMult: 0.12, critChance: 8 } },
            { pieces: 6, desc: '+25% Crit DMG, +10% Thorns', effect: { critDamage: 25, thorns: 10 } },
            { pieces: 8, desc: 'Demon Fury: +30% DMG, +15% Speed', effect: { dmgMult: 0.30, speedMult: 0.15 } },
        ]
    },
    spider: {
        name: "Spider Matriarch", color: '#06b6d4', tier: 4, statBonus: 1.3, weaponType: 'mace', // Zone 19 boss - VIT
        items: {
            weapon: { name: "Matriarch Fang", effect: { id: 'bonusDmg', name: '+DMG', value: 45 } },
            helmet: { name: "Matriarch Crown", effect: { id: 'dodge', name: 'Dodge', value: 7 } },
            armor: { name: "Matriarch Carapace", effect: { id: 'bonusHp', name: '+HP', value: 180 } },
            legs: { name: "Matriarch Legguards", effect: { id: 'bonusHp', name: '+HP', value: 120 } },
            boots: { name: "Matriarch Treads", effect: { id: 'dodge', name: 'Dodge', value: 5 } },
            gloves: { name: "Matriarch Spinnerets", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            shield: { name: "Matriarch Web", effect: { id: 'thorns', name: 'Thorns', value: 12 } },
            belt: { name: "Matriarch Silk", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
            amulet: { name: "Matriarch Eye", effect: { id: 'critDamage', name: 'Crit DMG', value: 40 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+8% Dodge', effect: { dodge: 8 } },
            { pieces: 4, desc: '+20% DMG, +18% HP', effect: { dmgMult: 0.20, hpMult: 0.18 } },
            { pieces: 6, desc: '+10% Crit, +35% Crit DMG', effect: { critChance: 10, critDamage: 35 } },
            { pieces: 8, desc: 'Spider Sense: +12% All Stats', effect: { dmgMult: 0.12, hpMult: 0.12, speedMult: 0.12 } },
        ]
    },
    shadow: {
        name: "Shadow Wolf", color: '#dc2626', tier: 5, statBonus: 1.3, weaponType: 'sword', // Zone 24 boss - STR
        items: {
            weapon: { name: "Shadow Wolf Fang", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            helmet: { name: "Shadow Wolf Mask", effect: { id: 'bonusDmg', name: '+DMG', value: 55 } },
            armor: { name: "Shadow Wolf Hide", effect: { id: 'thorns', name: 'Thorns', value: 15 } },
            legs: { name: "Shadow Wolf Greaves", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
            boots: { name: "Shadow Wolf Treads", effect: { id: 'dodge', name: 'Dodge', value: 7 } },
            gloves: { name: "Shadow Wolf Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 45 } },
            shield: { name: "Shadow Wolf Guard", effect: { id: 'bonusHp', name: '+HP', value: 200 } },
            belt: { name: "Shadow Wolf Cord", effect: { id: 'critChance', name: 'Crit', value: 9 } },
            amulet: { name: "Shadow Wolf Heart", effect: { id: 'lifesteal', name: 'Lifesteal', value: 3 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+4% Lifesteal', effect: { lifesteal: 4 } },
            { pieces: 4, desc: '+25% DMG, +12% Thorns', effect: { dmgMult: 0.25, thorns: 12 } },
            { pieces: 6, desc: '+22% HP, +40% Crit DMG', effect: { hpMult: 0.22, critDamage: 40 } },
            { pieces: 8, desc: 'Shadow Pact: +6% Lifesteal, +40% DMG', effect: { lifesteal: 6, dmgMult: 0.40 } },
        ]
    },
    abyss: {
        name: "Abyssal Eye", color: '#fbbf24', tier: 6, statBonus: 1.35, weaponType: 'staff', // Zone 29 boss - INT
        items: {
            weapon: { name: "Abyssal Staff", effect: { id: 'bonusDmg', name: '+DMG', value: 75 } },
            helmet: { name: "Abyssal Gaze", effect: { id: 'critChance', name: 'Crit', value: 10 } },
            armor: { name: "Abyssal Shroud", effect: { id: 'bonusHp', name: '+HP', value: 280 } },
            legs: { name: "Abyssal Greaves", effect: { id: 'bonusDmg', name: '+DMG', value: 55 } },
            boots: { name: "Abyssal Treads", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            gloves: { name: "Abyssal Touch", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            shield: { name: "Abyssal Ward", effect: { id: 'thorns', name: 'Thorns', value: 16 } },
            belt: { name: "Abyssal Sash", effect: { id: 'critDamage', name: 'Crit DMG', value: 50 } },
            amulet: { name: "Abyssal Core", effect: { id: 'bonusDmg', name: '+DMG', value: 65 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+10% Crit Chance', effect: { critChance: 10 } },
            { pieces: 4, desc: '+30% DMG, +25% HP', effect: { dmgMult: 0.30, hpMult: 0.25 } },
            { pieces: 6, desc: '+12% All Stats', effect: { dmgMult: 0.12, hpMult: 0.12, speedMult: 0.12 } },
            { pieces: 8, desc: 'Abyss Gaze: +18% All Stats, +4% Lifesteal', effect: { dmgMult: 0.18, hpMult: 0.18, speedMult: 0.18, lifesteal: 4 } },
        ]
    },
    behemoth: {
        name: "Behemoth", color: '#7c3aed', tier: 6, statBonus: 1.35, weaponType: 'dagger', // Zone 34 boss - AGI
        items: {
            weapon: { name: "Behemoth Horn", effect: { id: 'critDamage', name: 'Crit DMG', value: 65 } },
            helmet: { name: "Behemoth Skull", effect: { id: 'critChance', name: 'Crit', value: 11 } },
            armor: { name: "Behemoth Hide", effect: { id: 'bonusHp', name: '+HP', value: 350 } },
            legs: { name: "Behemoth Legguards", effect: { id: 'critChance', name: 'Crit', value: 8 } },
            boots: { name: "Behemoth Hooves", effect: { id: 'dodge', name: 'Dodge', value: 9 } },
            gloves: { name: "Behemoth Fists", effect: { id: 'bonusDmg', name: '+DMG', value: 90 } },
            shield: { name: "Behemoth Barrier", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            belt: { name: "Behemoth Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 4 } },
            amulet: { name: "Behemoth Heart", effect: { id: 'critChance', name: 'Crit', value: 10 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+12% Crit Chance', effect: { critChance: 12 } },
            { pieces: 4, desc: '+35% DMG, +30% HP', effect: { dmgMult: 0.35, hpMult: 0.30 } },
            { pieces: 6, desc: '+30% Crit DMG, +8% Dodge', effect: { critDamage: 30, dodge: 8 } },
            { pieces: 8, desc: 'Behemoth Might: +60% Crit DMG, +12% Dodge', effect: { critDamage: 60, dodge: 12 } },
        ]
    },
    darkwolf: {
        name: "Dark Wolf King", color: '#ec4899', tier: 6, statBonus: 1.4, weaponType: 'sword', // Zone 39 boss - Final boss - STR
        items: {
            weapon: { name: "Wolf King Fang", effect: { id: 'bonusDmg', name: '+DMG', value: 120 } },
            helmet: { name: "Wolf King Crown", effect: { id: 'critChance', name: 'Crit', value: 12 } },
            armor: { name: "Wolf King Pelt", effect: { id: 'bonusHp', name: '+HP', value: 450 } },
            legs: { name: "Wolf King Legguards", effect: { id: 'critDamage', name: 'Crit DMG', value: 50 } },
            boots: { name: "Wolf King Treads", effect: { id: 'dodge', name: 'Dodge', value: 10 } },
            gloves: { name: "Wolf King Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 70 } },
            shield: { name: "Wolf King Barrier", effect: { id: 'thorns', name: 'Thorns', value: 20 } },
            belt: { name: "Wolf King Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 5 } },
            amulet: { name: "Wolf King Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 100 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+25% Crit DMG', effect: { critDamage: 25 } },
            { pieces: 4, desc: '+40% DMG, +35% HP', effect: { dmgMult: 0.40, hpMult: 0.35 } },
            { pieces: 6, desc: '+15% All Stats', effect: { dmgMult: 0.15, hpMult: 0.15, speedMult: 0.15 } },
            { pieces: 8, desc: 'Wolf King Fury: +60% DMG, +50% HP', effect: { dmgMult: 0.60, hpMult: 0.50 } },
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
    { id: 'dagger', name: 'Dagger', baseDmg: 5, baseHp: 0, scaling: 'agi', speedBonus: 0.25, critBonus: 10, desc: '+25% speed, +10% crit' },
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
    { id: 'lifesteal', name: 'Lifesteal', minVal: 0.5, maxVal: 4, color: '#22c55e' },       // Reduced from 8% max
    { id: 'critChance', name: 'Crit', minVal: 1, maxVal: 8, color: '#ef4444' },             // Reduced from 15% max
    { id: 'critDamage', name: 'Crit DMG', minVal: 10, maxVal: 60, color: '#dc2626' },
    { id: 'bonusDmg', name: '+DMG', minVal: 2, maxVal: 50, color: '#f59e0b' },
    { id: 'bonusHp', name: '+HP', minVal: 10, maxVal: 200, color: '#10b981' },
    { id: 'silverFind', name: 'Silver%', minVal: 2, maxVal: 10, color: '#fbbf24' },         // Renamed from goldFind
    { id: 'xpBonus', name: 'XP%', minVal: 3, maxVal: 15, color: '#8b5cf6' },
    { id: 'dodge', name: 'Dodge', minVal: 1, maxVal: 8, color: '#06b6d4' },
    // Defensive effects for tank/regen builds
    { id: 'hpRegen', name: 'HP Regen', minVal: 0.5, maxVal: 3, color: '#34d399' },          // % max HP per second
    { id: 'damageReduction', name: 'DR%', minVal: 2, maxVal: 10, color: '#60a5fa' },        // Flat damage reduction %
];

// Tier-based cap multipliers for effect max values
// Lower tier items can't roll as high as prestige gear
export const EFFECT_TIER_CAPS = {
    0: 0.30,  // Common
    1: 0.30,  // Uncommon
    2: 0.40,  // Rare
    3: 0.50,  // Epic
    4: 0.65,  // Legendary
    5: 0.80,  // Mythic
    6: 0.90,  // Divine
    7: 1.00,  // Astral (prestige)
    8: 1.00,  // Cosmic (prestige)
    9: 1.00,  // Primordial (prestige)
};

// Get the capped max value for an effect at a given tier
export function getEffectMaxForTier(effect, tier) {
    const capMultiplier = EFFECT_TIER_CAPS[tier] ?? 1.0;
    return effect.minVal + (effect.maxVal - effect.minVal) * capMultiplier;
}

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
    tyrant: {
        name: "Eye Tyrant", color: '#38bdf8', tier: 6, statBonus: 2.5,
        items: {
            weapon: { name: "Tyrant Gaze", effect: { id: 'bonusDmg', name: '+DMG', value: 800 } },
            helmet: { name: "Tyrant Crown", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            armor: { name: "Tyrant Carapace", effect: { id: 'bonusHp', name: '+HP', value: 4000 } },
            legs: { name: "Tyrant Legguards", effect: { id: 'bonusDmg', name: '+DMG', value: 500 } },
            boots: { name: "Tyrant Treads", effect: { id: 'dodge', name: 'Dodge', value: 28 } },
            gloves: { name: "Tyrant Grips", effect: { id: 'critDamage', name: 'Crit DMG', value: 280 } },
            shield: { name: "Tyrant Ward", effect: { id: 'thorns', name: 'Thorns', value: 60 } },
            belt: { name: "Tyrant Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 14 } },
            amulet: { name: "Tyrant Eye", effect: { id: 'bonusDmg', name: '+DMG', value: 600 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+150% All Stats', effect: { dmgMult: 1.50, hpMult: 1.50, speedMult: 0.50 } },
            { pieces: 4, desc: '+400% DMG, +300% HP', effect: { dmgMult: 4.00, hpMult: 3.00 } },
            { pieces: 6, desc: '+60% Crit, +250% Crit DMG', effect: { critChance: 60, critDamage: 250 } },
            { pieces: 8, desc: 'Tyrant Dominion: +600% All Stats', effect: { dmgMult: 6.0, hpMult: 6.0, speedMult: 1.0 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
    inferno: {
        name: "Inferno Fox", color: '#a78bfa', tier: 6, statBonus: 3.0,
        items: {
            weapon: { name: "Inferno Fang", effect: { id: 'bonusDmg', name: '+DMG', value: 1500 } },
            helmet: { name: "Inferno Crown", effect: { id: 'critChance', name: 'Crit', value: 40 } },
            armor: { name: "Inferno Pelt", effect: { id: 'bonusHp', name: '+HP', value: 8000 } },
            legs: { name: "Inferno Legguards", effect: { id: 'critChance', name: 'Crit', value: 30 } },
            boots: { name: "Inferno Paws", effect: { id: 'dodge', name: 'Dodge', value: 32 } },
            gloves: { name: "Inferno Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 350 } },
            shield: { name: "Inferno Barrier", effect: { id: 'thorns', name: 'Thorns', value: 80 } },
            belt: { name: "Inferno Sash", effect: { id: 'critChance', name: 'Crit', value: 35 } },
            amulet: { name: "Inferno Heart", effect: { id: 'lifesteal', name: 'Lifesteal', value: 15 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+250% All Stats', effect: { dmgMult: 2.50, hpMult: 2.50, speedMult: 0.80 } },
            { pieces: 4, desc: '+700% DMG, +500% HP', effect: { dmgMult: 7.00, hpMult: 5.00 } },
            { pieces: 6, desc: '+50% Crit, +300% Crit DMG', effect: { critChance: 50, critDamage: 300 } },
            { pieces: 8, desc: 'Inferno Blaze: +1200% All Stats', effect: { dmgMult: 12.0, hpMult: 12.0, speedMult: 1.5 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
    scorpion: {
        name: "Scorpion King", color: '#f472b6', tier: 6, statBonus: 4.0,
        items: {
            weapon: { name: "Scorpion Stinger", effect: { id: 'bonusDmg', name: '+DMG', value: 3000 } },
            helmet: { name: "Scorpion Crown", effect: { id: 'critChance', name: 'Crit', value: 50 } },
            armor: { name: "Scorpion Carapace", effect: { id: 'bonusHp', name: '+HP', value: 15000 } },
            legs: { name: "Scorpion Legguards", effect: { id: 'bonusHp', name: '+HP', value: 10000 } },
            boots: { name: "Scorpion Treads", effect: { id: 'dodge', name: 'Dodge', value: 35 } },
            gloves: { name: "Scorpion Pincers", effect: { id: 'critDamage', name: 'Crit DMG', value: 500 } },
            shield: { name: "Scorpion Shell", effect: { id: 'thorns', name: 'Thorns', value: 100 } },
            belt: { name: "Scorpion Girdle", effect: { id: 'lifesteal', name: 'Lifesteal', value: 20 } },
            amulet: { name: "Scorpion Heart", effect: { id: 'bonusDmg', name: '+DMG', value: 2000 } },
        },
        setBonuses: [
            { pieces: 2, desc: '+500% All Stats', effect: { dmgMult: 5.00, hpMult: 5.00, speedMult: 1.00 } },
            { pieces: 4, desc: '+1500% DMG, +1000% HP', effect: { dmgMult: 15.00, hpMult: 10.00 } },
            { pieces: 6, desc: '+75% Crit, +500% Crit DMG', effect: { critChance: 75, critDamage: 500 } },
            { pieces: 8, desc: 'Scorpion Venom: +3000% All', effect: { dmgMult: 30.0, hpMult: 30.0, speedMult: 2.0 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },
};

export const PRESTIGE_WEAPONS = [
    { id: 'scythe', name: 'Scythe', baseDmg: 12, baseHp: 0, scaling: 'str', speedBonus: -0.1, critBonus: 15, desc: 'Slow but deadly, +15% crit', prestigeReq: 1 },
    { id: 'katana', name: 'Katana', baseDmg: 9, baseHp: 0, scaling: 'agi', speedBonus: 0.3, critBonus: 20, desc: 'Lightning fast, +20% crit', prestigeReq: 2 },
    { id: 'greataxe', name: 'Greataxe', baseDmg: 18, baseHp: 50, scaling: 'str', speedBonus: -0.2, critBonus: 8, desc: 'Massive damage, +50 HP', prestigeReq: 3 },
];

// Calculate item score for comparison (higher is better)
// Optional playerStats parameter enables smart weapon scoring based on stat build
export function getItemScore(item, playerStats = null) {
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

    // If player stats provided and this is a weapon, factor in stat scaling
    if (playerStats && item.slot === 'weapon' && item.weaponType) {
        const allWeaponTypes = [...WEAPON_TYPES, ...PRESTIGE_WEAPONS];
        const weaponInfo = allWeaponTypes.find(w => w.id === item.weaponType);
        if (weaponInfo?.scaling) {
            const scalingStat = playerStats[weaponInfo.scaling] || 0;
            // Find player's highest invested stat
            const statValues = ['str', 'int', 'agi', 'vit'].map(s => playerStats[s] || 0);
            const maxStat = Math.max(...statValues);
            // If weapon scales with player's main stat, big bonus; if not, penalty
            if (scalingStat >= maxStat * 0.8) {
                score *= 1.5; // Weapon matches build
            } else if (scalingStat < maxStat * 0.3) {
                score *= 0.3; // Weapon completely mismatched (e.g., sword for INT build)
            } else {
                score *= 0.7; // Partial mismatch
            }
        }
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
export function generateGearDrop(zoneTier, zoneId, prestigeLevel = 0) {
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
        // Pick a random weapon type - include prestige weapons if in prestige zones
        const availableWeapons = [...WEAPON_TYPES];

        // Add prestige weapons based on prestige level
        if (prestigeLevel >= 1) {
            const eligiblePrestigeWeapons = PRESTIGE_WEAPONS.filter(w => w.prestigeReq <= prestigeLevel);
            availableWeapons.push(...eligiblePrestigeWeapons);
        }

        const weaponTypeInfo = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
        weaponType = weaponTypeInfo.id;
        name = GEAR_NAMES[weaponType]?.[tier] || GEAR_NAMES.sword[tier] || weaponTypeInfo.name;
    } else {
        name = GEAR_NAMES[slot]?.[tier] || tierInfo.name + ' ' + slot;
    }

    // Generate random effects based on tier
    // Each effect slot rolls independently for more natural variation
    // Divine+ (tier 6+) can roll up to 3 effects, lower tiers cap at 2
    const effects = [];
    const maxEffects = tier >= 6 ? 3 : 2;

    // Base chance for each effect slot, increases with tier
    // Tier 0: 15%, 5%, 0%  |  Tier 3: 30%, 15%, 0%  |  Tier 6+: 50%, 25%, 10%
    const effectSlotChances = [
        0.15 + tier * 0.05,  // 1st effect: 15-60% based on tier
        0.05 + tier * 0.03,  // 2nd effect: 5-32% based on tier
        tier >= 6 ? 0.05 + (tier - 6) * 0.03 : 0,  // 3rd effect: Divine+ only, 5-14%
    ];

    const availableEffects = [...SPECIAL_EFFECTS];

    for (let i = 0; i < maxEffects; i++) {
        // Roll for this effect slot
        if (Math.random() >= effectSlotChances[i]) continue;
        if (availableEffects.length === 0) break;

        const effectIndex = Math.floor(Math.random() * availableEffects.length);
        const effect = availableEffects.splice(effectIndex, 1)[0];

        // Calculate tier-capped max value
        const cappedMax = getEffectMaxForTier(effect, tier);
        // Roll value between min and capped max
        const value = effect.minVal + Math.random() * (cappedMax - effect.minVal);
        // Round appropriately (1 decimal for small values like lifesteal/regen)
        const finalValue = effect.maxVal <= 10 ? Math.round(value * 10) / 10 : Math.floor(value);

        effects.push({ id: effect.id, name: effect.name, value: finalValue });
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
