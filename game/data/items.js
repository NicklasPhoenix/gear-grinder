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

// Unique boss effects - gameplay-changing abilities beyond simple stat bonuses
// minVal/maxVal define the range for roll quality display (based on values used across all boss sets)
export const UNIQUE_EFFECTS = {
    // Damage over time effects (values range from early bosses ~15-25 to prestige bosses ~80-100)
    bleed: { id: 'bleed', name: 'Bleed', desc: 'Attacks cause bleeding for {value}% weapon damage over 3s', isPercent: true, color: '#dc2626', minVal: 10, maxVal: 100 },
    burn: { id: 'burn', name: 'Burn', desc: 'Attacks ignite enemies for {value}% weapon damage over 3s', isPercent: true, color: '#f97316', minVal: 10, maxVal: 100 },
    poison: { id: 'poison', name: 'Poison', desc: 'Attacks poison enemies for {value}% weapon damage over 4s', isPercent: true, color: '#22c55e', minVal: 10, maxVal: 100 },

    // Attack modifiers
    multiStrike: { id: 'multiStrike', name: 'Multi-Strike', desc: '{value}% chance to strike twice', isPercent: true, color: '#8b5cf6', minVal: 5, maxVal: 50 },
    executeChance: { id: 'executeChance', name: 'Execute', desc: '{value}% chance to instantly kill enemies below 15% HP', isPercent: true, color: '#ef4444', minVal: 3, maxVal: 25 },
    armorPen: { id: 'armorPen', name: 'Armor Pierce', desc: 'Attacks ignore {value}% of enemy armor', isPercent: true, color: '#6b7280', minVal: 10, maxVal: 80 },

    // Defensive effects
    damageShield: { id: 'damageShield', name: 'Damage Shield', desc: 'Absorb {value} damage before taking HP damage', isPercent: false, color: '#3b82f6', minVal: 30, maxVal: 500 },
    retaliate: { id: 'retaliate', name: 'Retaliate', desc: '{value}% chance to counter-attack when hit', isPercent: true, color: '#eab308', minVal: 5, maxVal: 50 },
    lastStand: { id: 'lastStand', name: 'Last Stand', desc: 'Below 30% HP: +{value}% damage and lifesteal', isPercent: true, color: '#dc2626', minVal: 10, maxVal: 60 },

    // Utility effects
    silverOnHit: { id: 'silverOnHit', name: 'Silver Strike', desc: 'Attacks have {value}% chance to drop bonus silver', isPercent: true, color: '#fbbf24', minVal: 5, maxVal: 30 },
    xpBonus: { id: 'xpBonus', name: 'Wisdom', desc: '+{value}% XP gained from kills', isPercent: true, color: '#a855f7', minVal: 5, maxVal: 50 },
    itemFind: { id: 'itemFind', name: 'Treasure Hunter', desc: '+{value}% chance to find items', isPercent: true, color: '#22d3ee', minVal: 5, maxVal: 40 },

    // Special mechanics
    rage: { id: 'rage', name: 'Rage', desc: 'Each hit increases damage by {value}%, stacks up to 10x', isPercent: true, color: '#b91c1c', minVal: 2, maxVal: 15 },
    vampiric: { id: 'vampiric', name: 'Vampiric', desc: 'Heal for {value}% of damage dealt (enhanced lifesteal)', isPercent: true, color: '#7f1d1d', minVal: 2, maxVal: 15 },
    frostbite: { id: 'frostbite', name: 'Frostbite', desc: 'Reduces enemy damage by {value}%', isPercent: true, color: '#06b6d4', minVal: 10, maxVal: 50 },
};

export const BOSS_SETS = {
    // ============ CROW DEMON - The Shadow Assassin ============
    // Theme: Quick strikes, bleeding wounds, aerial evasion
    crow: {
        name: "Crow Demon", color: '#22c55e', tier: 1, statBonus: 1.2, weaponType: 'dagger',
        lore: "Once a fallen warrior, now reborn as a demon of shadow and vengeance.",
        items: {
            weapon: { name: "Crow's Talon", effect: { id: 'bleed', name: 'Bleed', value: 25, unique: true }, desc: "A curved blade that never stops cutting" },
            helmet: { name: "Crow Demon Visage", effect: { id: 'critChance', name: 'Crit', value: 5 }, desc: "See through the eyes of darkness" },
            armor: { name: "Crow Demon Wings", effect: { id: 'dodge', name: 'Dodge', value: 6 }, desc: "Feathers that bend around attacks" },
            legs: { name: "Crow Demon Greaves", effect: { id: 'bonusHp', name: '+HP', value: 40 } },
            boots: { name: "Silent Talons", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 8, unique: true }, desc: "Strike twice before they blink" },
            gloves: { name: "Crow Demon Grasp", effect: { id: 'critDamage', name: 'Crit DMG', value: 20 } },
            shield: { name: "Feather Ward", effect: { id: 'retaliate', name: 'Retaliate', value: 10, unique: true }, desc: "Those who strike you feel the murder's wrath" },
            belt: { name: "Crow Demon Girdle", effect: { id: 'bonusDmg', name: '+DMG', value: 10 } },
            amulet: { name: "Murder's Feather", effect: { id: 'bleed', name: 'Bleed', value: 15, unique: true }, desc: "A single black feather, always dripping" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Shadow Step: +10% Dodge', effect: { dodge: 10 } },
            { pieces: 4, desc: 'Death From Above: +20% Crit DMG, Bleed +15%', effect: { critDamage: 20, bleedBonus: 0.15 } },
            { pieces: 6, desc: 'Murder of Crows: +25% DMG, +15% Multi-Strike', effect: { dmgMult: 0.25, multiStrike: 15 } },
            { pieces: 8, desc: 'CARRION FEAST: Kills heal 5% HP, +50% Bleed damage', effect: { killHeal: 5, bleedBonus: 0.50 } },
        ]
    },

    // ============ CERBERUS - The Hellfire Guardian ============
    // Theme: Burning damage, triple attacks, hellish resilience
    cerberus: {
        name: "Cerberus", color: '#8b5cf6', tier: 2, statBonus: 1.25, weaponType: 'staff',
        lore: "The three-headed guardian of the underworld gates, wreathed in eternal flame.",
        items: {
            weapon: { name: "Hellfire Staff", effect: { id: 'burn', name: 'Burn', value: 30, unique: true }, desc: "Channels the flames of three hells" },
            helmet: { name: "Triple Crown", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 12, unique: true }, desc: "Three minds, three attacks" },
            armor: { name: "Cerberus Hide", effect: { id: 'bonusHp', name: '+HP', value: 90 }, desc: "Thick hide scarred by hellfire" },
            legs: { name: "Cerberus Greaves", effect: { id: 'burn', name: 'Burn', value: 15, unique: true } },
            boots: { name: "Cerberus Paws", effect: { id: 'dodge', name: 'Dodge', value: 5 } },
            gloves: { name: "Fangs of the Three", effect: { id: 'critChance', name: 'Crit', value: 6 } },
            shield: { name: "Gate Guardian", effect: { id: 'damageShield', name: 'Shield', value: 50, unique: true }, desc: "None shall pass unscathed" },
            belt: { name: "Chain of Binding", effect: { id: 'lifesteal', name: 'Lifesteal', value: 2 } },
            amulet: { name: "Heart of Hellfire", effect: { id: 'burn', name: 'Burn', value: 20, unique: true }, desc: "Burns with the fury of the underworld" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Hellfire Aura: Burn damage +25%', effect: { burnBonus: 0.25 } },
            { pieces: 4, desc: 'Three Heads: +20% Multi-Strike, +20% Crit DMG', effect: { multiStrike: 20, critDamage: 20 } },
            { pieces: 6, desc: 'Guardian\'s Might: +100 Shield, +20% HP', effect: { damageShield: 100, hpMult: 0.20 } },
            { pieces: 8, desc: 'INFERNAL REBIRTH: Survive fatal blow once per fight with 30% HP', effect: { phoenixOnce: true, hpMult: 0.15 } },
        ]
    },

    // ============ DEMON LORD - The Bloodletter ============
    // Theme: Stacking bleeds, execute, demonic fury
    demon: {
        name: "Demon Lord", color: '#ef4444', tier: 3, statBonus: 1.25, weaponType: 'dagger',
        lore: "A prince of the abyss who bathes in the blood of his enemies.",
        items: {
            weapon: { name: "Bloodletter", effect: { id: 'bleed', name: 'Bleed', value: 40, unique: true }, desc: "Each wound opens ten more" },
            helmet: { name: "Demon Lord Crown", effect: { id: 'executeChance', name: 'Execute', value: 5, unique: true }, desc: "The weak deserve no mercy" },
            armor: { name: "Demon Lord Plate", effect: { id: 'bonusHp', name: '+HP', value: 130 } },
            legs: { name: "Demon Lord Greaves", effect: { id: 'lastStand', name: 'Last Stand', value: 25, unique: true }, desc: "Wounded demons fight hardest" },
            boots: { name: "Demon Lord Hooves", effect: { id: 'dodge', name: 'Dodge', value: 6 } },
            gloves: { name: "Torture's Touch", effect: { id: 'bleed', name: 'Bleed', value: 25, unique: true }, desc: "Every touch brings agony" },
            shield: { name: "Aegis of Suffering", effect: { id: 'thorns', name: 'Thorns', value: 12 } },
            belt: { name: "Bloodsoaked Girdle", effect: { id: 'vampiric', name: 'Vampiric', value: 3, unique: true }, desc: "Drink deep of their pain" },
            amulet: { name: "Demon Lord Heart", effect: { id: 'critDamage', name: 'Crit DMG', value: 35 } },
        },
        setBonuses: [
            { pieces: 2, desc: 'Blood Scent: +5% Execute chance on bleeding targets', effect: { executeChance: 5 } },
            { pieces: 4, desc: 'Sadistic: +30% Bleed damage, +3% Vampiric', effect: { bleedBonus: 0.30, vampiric: 3 } },
            { pieces: 6, desc: 'Demon Fury: +30% DMG when below 50% HP', effect: { lastStand: 30 } },
            { pieces: 8, desc: 'LORD OF PAIN: Bleeds stack infinitely, +10% Execute', effect: { bleedStack: true, executeChance: 10 } },
        ]
    },

    // ============ SPIDER MATRIARCH - The Venomweaver ============
    // Theme: Poison DOT, web slows, patient predator
    spider: {
        name: "Spider Matriarch", color: '#06b6d4', tier: 4, statBonus: 1.3, weaponType: 'mace',
        lore: "Mother of a million spiders, her venom dissolves flesh and spirit alike.",
        items: {
            weapon: { name: "Venom Fang Mace", effect: { id: 'poison', name: 'Poison', value: 45, unique: true }, desc: "Dripping with paralytic venom" },
            helmet: { name: "Matriarch Crown", effect: { id: 'critChance', name: 'Crit', value: 7 } },
            armor: { name: "Matriarch Carapace", effect: { id: 'bonusHp', name: '+HP', value: 180 }, desc: "Chitin harder than steel" },
            legs: { name: "Matriarch Legguards", effect: { id: 'frostbite', name: 'Frostbite', value: 15, unique: true }, desc: "Webs that slow the prey" },
            boots: { name: "Silk Treads", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            gloves: { name: "Spinnerets", effect: { id: 'poison', name: 'Poison', value: 30, unique: true }, desc: "Weave death with every touch" },
            shield: { name: "Web Cocoon", effect: { id: 'frostbite', name: 'Frostbite', value: 20, unique: true }, desc: "Ensnare attackers in sticky silk" },
            belt: { name: "Egg Sac Belt", effect: { id: 'retaliate', name: 'Retaliate', value: 15, unique: true }, desc: "Disturb the eggs, face the swarm" },
            amulet: { name: "Matriarch's Eye", effect: { id: 'itemFind', name: 'Treasure Hunter', value: 10, unique: true }, desc: "Spiders find what others miss" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Paralytic Venom: +25% Poison damage', effect: { poisonBonus: 0.25 } },
            { pieces: 4, desc: 'Web Trap: +25% Slow, +20% DMG to slowed', effect: { frostbite: 25, dmgMult: 0.20 } },
            { pieces: 6, desc: 'Patient Hunter: +15% Item Find, +20% HP', effect: { itemFind: 15, hpMult: 0.20 } },
            { pieces: 8, desc: 'BROOD MOTHER: Poison spreads on kill, +50% Poison DMG', effect: { poisonSpread: true, poisonBonus: 0.50 } },
        ]
    },

    // ============ SHADOW WOLF - The Phantom Hunter ============
    // Theme: Stealth, crits from shadows, pack tactics
    shadow: {
        name: "Shadow Wolf", color: '#dc2626', tier: 5, statBonus: 1.3, weaponType: 'sword',
        lore: "Alpha of a spectral pack, hunting between worlds.",
        items: {
            weapon: { name: "Phantom Fang", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 20, unique: true }, desc: "Strikes from the shadow realm" },
            helmet: { name: "Shadow Wolf Mask", effect: { id: 'critChance', name: 'Crit', value: 10 } },
            armor: { name: "Shadow Wolf Hide", effect: { id: 'dodge', name: 'Dodge', value: 10 }, desc: "Phase through attacks" },
            legs: { name: "Shadow Wolf Greaves", effect: { id: 'armorPen', name: 'Armor Pierce', value: 20, unique: true }, desc: "Fangs that ignore armor" },
            boots: { name: "Ghost Step", effect: { id: 'dodge', name: 'Dodge', value: 8 } },
            gloves: { name: "Shadow Wolf Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 50 } },
            shield: { name: "Spectral Guard", effect: { id: 'damageShield', name: 'Shield', value: 100, unique: true } },
            belt: { name: "Pack Leader Cord", effect: { id: 'rage', name: 'Rage', value: 3, unique: true }, desc: "Each strike fuels the hunt" },
            amulet: { name: "Shadow Wolf Heart", effect: { id: 'vampiric', name: 'Vampiric', value: 4, unique: true }, desc: "Feed on the essence of prey" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Shadow Strike: +15% Armor Penetration', effect: { armorPen: 15 } },
            { pieces: 4, desc: 'Pack Tactics: +30% Crit DMG, +15% Multi-Strike', effect: { critDamage: 30, multiStrike: 15 } },
            { pieces: 6, desc: 'Phantom Form: +15% Dodge, +20% DMG', effect: { dodge: 15, dmgMult: 0.20 } },
            { pieces: 8, desc: 'ALPHA HOWL: Crits deal 2x damage, +5% Vampiric', effect: { critMultiplier: 2.0, vampiric: 5 } },
        ]
    },

    // ============ ABYSSAL EYE - The Mind Breaker ============
    // Theme: Armor penetration, damage reflection, madness
    abyss: {
        name: "Abyssal Eye", color: '#fbbf24', tier: 6, statBonus: 1.35, weaponType: 'staff',
        lore: "An eldritch horror from beyond the void, its gaze shatters sanity.",
        items: {
            weapon: { name: "Void Gaze Staff", effect: { id: 'armorPen', name: 'Armor Pierce', value: 35, unique: true }, desc: "Gaze through all defenses" },
            helmet: { name: "Eye of Madness", effect: { id: 'critChance', name: 'Crit', value: 12 } },
            armor: { name: "Abyssal Shroud", effect: { id: 'retaliate', name: 'Retaliate', value: 25, unique: true }, desc: "Strike the void, the void strikes back" },
            legs: { name: "Tentacle Greaves", effect: { id: 'frostbite', name: 'Frostbite', value: 25, unique: true }, desc: "Tendrils that bind and slow" },
            boots: { name: "Abyssal Treads", effect: { id: 'dodge', name: 'Dodge', value: 10 } },
            gloves: { name: "Void Touch", effect: { id: 'armorPen', name: 'Armor Pierce', value: 20, unique: true } },
            shield: { name: "Reality Barrier", effect: { id: 'damageShield', name: 'Shield', value: 150, unique: true }, desc: "Bend reality to block attacks" },
            belt: { name: "Abyssal Sash", effect: { id: 'xpBonus', name: 'Wisdom', value: 15, unique: true }, desc: "Forbidden knowledge flows through you" },
            amulet: { name: "Core of the Void", effect: { id: 'critDamage', name: 'Crit DMG', value: 60 } },
        },
        setBonuses: [
            { pieces: 2, desc: 'Piercing Gaze: +20% Armor Penetration', effect: { armorPen: 20 } },
            { pieces: 4, desc: 'Void Reflection: +30% Retaliate, +200 Shield', effect: { retaliate: 30, damageShield: 200 } },
            { pieces: 6, desc: 'Eldritch Wisdom: +25% XP, +30% Crit DMG', effect: { xpBonus: 25, critDamage: 30 } },
            { pieces: 8, desc: 'GAZE OF OBLIVION: Ignore 50% armor, 20% chance to stun', effect: { armorPen: 50, stunChance: 20 } },
        ]
    },

    // ============ BEHEMOTH - The Unstoppable Force ============
    // Theme: Massive slow hits, rage stacking, cannot be stopped
    behemoth: {
        name: "Behemoth", color: '#7c3aed', tier: 6, statBonus: 1.35, weaponType: 'mace',
        lore: "An ancient titan of pure destruction, each step shakes the world.",
        items: {
            weapon: { name: "Worldbreaker", effect: { id: 'rage', name: 'Rage', value: 5, unique: true }, desc: "Hits harder with each swing (-20% speed, +50% DMG)" },
            helmet: { name: "Behemoth Skull", effect: { id: 'bonusHp', name: '+HP', value: 300 } },
            armor: { name: "Titan Plate", effect: { id: 'lastStand', name: 'Last Stand', value: 40, unique: true }, desc: "The wounded titan rages" },
            legs: { name: "Behemoth Legguards", effect: { id: 'bonusHp', name: '+HP', value: 200 } },
            boots: { name: "Earthshaker Treads", effect: { id: 'frostbite', name: 'Frostbite', value: 20, unique: true }, desc: "Tremors slow all nearby" },
            gloves: { name: "Titan Fists", effect: { id: 'rage', name: 'Rage', value: 4, unique: true } },
            shield: { name: "Mountain Shield", effect: { id: 'damageShield', name: 'Shield', value: 200, unique: true }, desc: "Immovable as a mountain" },
            belt: { name: "Titan Girdle", effect: { id: 'bonusHp', name: '+HP', value: 150 } },
            amulet: { name: "Heart of the Mountain", effect: { id: 'bonusDmg', name: '+DMG', value: 80 } },
        },
        setBonuses: [
            { pieces: 2, desc: 'Titan\'s Strength: +30% HP', effect: { hpMult: 0.30 } },
            { pieces: 4, desc: 'Rampage: Rage stacks +50% faster, +40% DMG', effect: { rageBonus: 0.50, dmgMult: 0.40 } },
            { pieces: 6, desc: 'Unstoppable: +300 Shield, +30% Last Stand', effect: { damageShield: 300, lastStand: 30 } },
            { pieces: 8, desc: 'CATACLYSM: -30% attack speed, +100% damage, Rage uncapped', effect: { speedMult: -0.30, dmgMult: 1.00, rageUncapped: true } },
        ]
    },

    // ============ DARK WOLF KING - The Ultimate Predator ============
    // Theme: All-around power, execute, vampiric mastery
    darkwolf: {
        name: "Dark Wolf King", color: '#ec4899', tier: 6, statBonus: 1.4, weaponType: 'sword',
        lore: "King of all wolves, his howl commands life and death itself.",
        items: {
            weapon: { name: "Kingslayer Fang", effect: { id: 'executeChance', name: 'Execute', value: 10, unique: true }, desc: "Ends kings and peasants alike" },
            helmet: { name: "Wolf King Crown", effect: { id: 'critChance', name: 'Crit', value: 12 } },
            armor: { name: "Wolf King Pelt", effect: { id: 'vampiric', name: 'Vampiric', value: 5, unique: true }, desc: "Drink the life of your prey" },
            legs: { name: "Wolf King Legguards", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 15, unique: true } },
            boots: { name: "Apex Predator Treads", effect: { id: 'dodge', name: 'Dodge', value: 12 } },
            gloves: { name: "Wolf King Claws", effect: { id: 'critDamage', name: 'Crit DMG', value: 70 } },
            shield: { name: "Alpha's Barrier", effect: { id: 'retaliate', name: 'Retaliate', value: 20, unique: true } },
            belt: { name: "Wolf King Girdle", effect: { id: 'rage', name: 'Rage', value: 4, unique: true } },
            amulet: { name: "Wolf King Heart", effect: { id: 'silverOnHit', name: 'Gold Strike', value: 15, unique: true }, desc: "The king claims his tribute" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Alpha Presence: +10% Execute, +20% Silver Find', effect: { executeChance: 10, silverOnHit: 20 } },
            { pieces: 4, desc: 'King\'s Fury: +40% Crit DMG, +5% Vampiric', effect: { critDamage: 40, vampiric: 5 } },
            { pieces: 6, desc: 'Pack Lord: +25% All Stats', effect: { dmgMult: 0.25, hpMult: 0.25, speedMult: 0.15 } },
            { pieces: 8, desc: 'APEX PREDATOR: Execute threshold 30%, Full heal on execute', effect: { executeThreshold: 30, executeHeal: true } },
        ]
    },
    // ============ ETERNAL - The Timeless Warrior ============
    // Theme: Pure power, all effects combined, time manipulation
    eternal: {
        name: "Eternal", color: '#f97316', tier: 6, statBonus: 1.5, weaponType: 'sword',
        lore: "Forged at the beginning of time, worn by those who transcend mortality.",
        items: {
            weapon: { name: "Timekeeper's Blade", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 25, unique: true }, desc: "Strike the past, present, and future" },
            helmet: { name: "Eternal Diadem", effect: { id: 'xpBonus', name: 'Wisdom', value: 25, unique: true }, desc: "Knowledge of all ages" },
            armor: { name: "Eternal Plate", effect: { id: 'damageShield', name: 'Shield', value: 300, unique: true }, desc: "Time itself shields you" },
            legs: { name: "Eternal Legguards", effect: { id: 'rage', name: 'Rage', value: 5, unique: true } },
            boots: { name: "Timeless Walkers", effect: { id: 'dodge', name: 'Dodge', value: 15 } },
            gloves: { name: "Hands of Eternity", effect: { id: 'executeChance', name: 'Execute', value: 12, unique: true }, desc: "End their timeline" },
            shield: { name: "Eternal Aegis", effect: { id: 'retaliate', name: 'Retaliate', value: 30, unique: true } },
            belt: { name: "Time Loop Girdle", effect: { id: 'vampiric', name: 'Vampiric', value: 6, unique: true }, desc: "Heal wounds before they happen" },
            amulet: { name: "Heart of Eternity", effect: { id: 'itemFind', name: 'Treasure Hunter', value: 20, unique: true }, desc: "See treasures across all timelines" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Timeless: +30% All Stats', effect: { dmgMult: 0.30, hpMult: 0.30, speedMult: 0.15 } },
            { pieces: 4, desc: 'Temporal Mastery: +25% Multi-Strike, +15% Execute', effect: { multiStrike: 25, executeChance: 15 } },
            { pieces: 6, desc: 'Eternal Youth: +8% Vampiric, +500 Shield', effect: { vampiric: 8, damageShield: 500 } },
            { pieces: 8, desc: 'LORD OF TIME: All unique effects +50%, Immune to death once per zone', effect: { uniqueBonus: 0.50, phoenixOnce: true } },
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
    // ============ EYE TYRANT - The Mind Dominator ============
    // Theme: Psychic powers, disintegration, mind control
    tyrant: {
        name: "Eye Tyrant", color: '#38bdf8', tier: 6, statBonus: 2.5, weaponType: 'staff',
        lore: "A beholder-like horror whose many eyes each hold a different doom.",
        items: {
            weapon: { name: "Disintegration Ray", effect: { id: 'armorPen', name: 'Armor Pierce', value: 60, unique: true }, desc: "Erases matter from existence" },
            helmet: { name: "Crown of Eyes", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 40, unique: true }, desc: "Ten eyes, ten strikes" },
            armor: { name: "Tyrant Carapace", effect: { id: 'damageShield', name: 'Shield', value: 500, unique: true } },
            legs: { name: "Tyrant Legguards", effect: { id: 'frostbite', name: 'Frostbite', value: 40, unique: true }, desc: "Telekinesis holds them in place" },
            boots: { name: "Levitation Treads", effect: { id: 'dodge', name: 'Dodge', value: 28 } },
            gloves: { name: "Charm Touch", effect: { id: 'executeChance', name: 'Execute', value: 20, unique: true }, desc: "Command them to die" },
            shield: { name: "Anti-Magic Shell", effect: { id: 'retaliate', name: 'Retaliate', value: 50, unique: true }, desc: "Magic reflects back" },
            belt: { name: "Tyrant Girdle", effect: { id: 'xpBonus', name: 'Wisdom', value: 50, unique: true } },
            amulet: { name: "Central Eye", effect: { id: 'burn', name: 'Burn', value: 100, unique: true }, desc: "The death ray incinerates all" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Many Eyes: +40% Multi-Strike, +150% Stats', effect: { multiStrike: 40, dmgMult: 1.50, hpMult: 1.50 } },
            { pieces: 4, desc: 'Disintegrate: +60% Armor Pen, +25% Execute', effect: { armorPen: 60, executeChance: 25 } },
            { pieces: 6, desc: 'Domination: +1000 Shield, +50% Slow', effect: { damageShield: 1000, frostbite: 50 } },
            { pieces: 8, desc: 'SUPREME TYRANT: All attacks bypass armor, 30% instant kill', effect: { armorPen: 100, executeChance: 30 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },

    // ============ INFERNO FOX - The Nine-Tailed Flame ============
    // Theme: Burning everything, phoenix rebirth, speed
    inferno: {
        name: "Inferno Fox", color: '#a78bfa', tier: 6, statBonus: 3.0, weaponType: 'katana',
        lore: "A nine-tailed fox spirit of pure flame, each tail a blazing inferno.",
        items: {
            weapon: { name: "Tail of Flames", effect: { id: 'burn', name: 'Burn', value: 150, unique: true }, desc: "Nine tails, nine infernos" },
            helmet: { name: "Fox Fire Crown", effect: { id: 'multiStrike', name: 'Multi-Strike', value: 50, unique: true }, desc: "Attack with every tail" },
            armor: { name: "Inferno Pelt", effect: { id: 'lastStand', name: 'Last Stand', value: 80, unique: true }, desc: "Burns brighter near death" },
            legs: { name: "Fox Spirit Greaves", effect: { id: 'burn', name: 'Burn', value: 80, unique: true } },
            boots: { name: "Inferno Paws", effect: { id: 'dodge', name: 'Dodge', value: 35 } },
            gloves: { name: "Claws of Wildfire", effect: { id: 'rage', name: 'Rage', value: 8, unique: true } },
            shield: { name: "Flame Barrier", effect: { id: 'retaliate', name: 'Retaliate', value: 60, unique: true }, desc: "Those who touch you burn" },
            belt: { name: "Nine Tails Sash", effect: { id: 'critChance', name: 'Crit', value: 40 } },
            amulet: { name: "Heart of Wildfire", effect: { id: 'vampiric', name: 'Vampiric', value: 12, unique: true }, desc: "Consume their life force" },
        },
        setBonuses: [
            { pieces: 2, desc: 'Wildfire: +100% Burn damage, +250% Stats', effect: { burnBonus: 1.00, dmgMult: 2.50, hpMult: 2.50 } },
            { pieces: 4, desc: 'Fox Fury: +50% Multi-Strike, +10% Rage/hit', effect: { multiStrike: 50, rage: 10 } },
            { pieces: 6, desc: 'Undying Flame: +100% Last Stand, +15% Vampiric', effect: { lastStand: 100, vampiric: 15 } },
            { pieces: 8, desc: 'PHOENIX REBIRTH: Revive at full HP once per fight, +200% Burn', effect: { phoenixFull: true, burnBonus: 2.00 } },
            { pieces: 9, desc: 'SECRET: +100% Drop Rate', effect: { matMult: 2.0 }, secret: true },
        ]
    },

    // ============ SCORPION KING - The Lethal Monarch ============
    // Theme: Deadly poison, armor piercing stinger, death touch
    scorpion: {
        name: "Scorpion King", color: '#f472b6', tier: 6, statBonus: 4.0, weaponType: 'dagger',
        lore: "Emperor of the desert wastes, his venom kills gods.",
        items: {
            weapon: { name: "Godkiller Stinger", effect: { id: 'poison', name: 'Poison', value: 200, unique: true }, desc: "Venom that slays immortals" },
            helmet: { name: "Scorpion Crown", effect: { id: 'executeChance', name: 'Execute', value: 25, unique: true }, desc: "A king's judgment is death" },
            armor: { name: "Divine Carapace", effect: { id: 'damageShield', name: 'Shield', value: 1000, unique: true } },
            legs: { name: "Scorpion Legguards", effect: { id: 'poison', name: 'Poison', value: 120, unique: true } },
            boots: { name: "Death's Approach", effect: { id: 'armorPen', name: 'Armor Pierce', value: 50, unique: true } },
            gloves: { name: "Pincers of Doom", effect: { id: 'bleed', name: 'Bleed', value: 100, unique: true }, desc: "Crush and tear" },
            shield: { name: "Exoskeleton", effect: { id: 'retaliate', name: 'Retaliate', value: 75, unique: true } },
            belt: { name: "King's Girdle", effect: { id: 'vampiric', name: 'Vampiric', value: 15, unique: true } },
            amulet: { name: "Heart of Venom", effect: { id: 'poison', name: 'Poison', value: 150, unique: true }, desc: "Pure concentrated death" },
        },
        setBonuses: [
            { pieces: 2, desc: 'King\'s Venom: +150% Poison, +500% Stats', effect: { poisonBonus: 1.50, dmgMult: 5.00, hpMult: 5.00 } },
            { pieces: 4, desc: 'Death Touch: +40% Execute, Poison spreads', effect: { executeChance: 40, poisonSpread: true } },
            { pieces: 6, desc: 'Immortal King: +2000 Shield, +25% Vampiric', effect: { damageShield: 2000, vampiric: 25 } },
            { pieces: 8, desc: 'GOD SLAYER: Execute at 50% HP, Poison ignores immunity', effect: { executeThreshold: 50, poisonPierce: true } },
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
