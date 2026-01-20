export const ZONES = [
  // Rebalanced for 6-10 hour playthrough
  // 4-5 zones between each boss, steeper stat scaling, higher kill requirements
  // gearTier determines what tier of gear drops, gearChance is drop rate per kill (30% start -> 10% end)
  // bossGearChance is boss set item drop rate (25% start -> 10% end)

  // === TIER 0: Forest Region (Zones 0-4) ===
  { id: 0, name: 'Forest Clearing', enemyHp: 500, enemyDmg: 8, goldMin: 1, goldMax: 3, killsRequired: 0,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.30, drops: { enhanceStone: 0.02, blessedOrb: 0, celestialShard: 0 }, isBoss: false },
  { id: 1, name: 'Dark Woods', enemyHp: 900, enemyDmg: 15, goldMin: 2, goldMax: 4, killsRequired: 30,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.29, drops: { enhanceStone: 0.025, blessedOrb: 0, celestialShard: 0 }, isBoss: false },
  { id: 2, name: 'Wolf Den', enemyHp: 1400, enemyDmg: 22, goldMin: 2, goldMax: 5, killsRequired: 50,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.28, drops: { enhanceStone: 0.03, blessedOrb: 0, celestialShard: 0 }, isBoss: false },
  { id: 3, name: 'Ancient Grove', enemyHp: 2000, enemyDmg: 32, goldMin: 3, goldMax: 6, killsRequired: 75,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.27, drops: { enhanceStone: 0.035, blessedOrb: 0.005, celestialShard: 0 }, isBoss: false },
  { id: 4, name: 'Forest Guardian', enemyHp: 8000, enemyDmg: 55, goldMin: 20, goldMax: 40, killsRequired: 100,
    enemyType: 'Boss', gearTier: 1, gearChance: 0, bossGearChance: 0.25, drops: { enhanceStone: 0.15, blessedOrb: 0.03, celestialShard: 0 }, isBoss: true, bossSet: 'guardian' },

  // === TIER 1: Goblin Territory (Zones 5-9) ===
  { id: 5, name: 'Goblin Outskirts', enemyHp: 2800, enemyDmg: 48, goldMin: 4, goldMax: 8, killsRequired: 40,
    enemyType: 'Humanoid', gearTier: 1, gearChance: 0.26, drops: { enhanceStone: 0.04, blessedOrb: 0.008, celestialShard: 0 }, isBoss: false },
  { id: 6, name: 'Goblin Caves', enemyHp: 4000, enemyDmg: 65, goldMin: 5, goldMax: 10, killsRequired: 60,
    enemyType: 'Humanoid', gearTier: 1, gearChance: 0.25, drops: { enhanceStone: 0.045, blessedOrb: 0.01, celestialShard: 0 }, isBoss: false },
  { id: 7, name: 'Goblin Stronghold', enemyHp: 5500, enemyDmg: 85, goldMin: 6, goldMax: 12, killsRequired: 80,
    enemyType: 'Humanoid', gearTier: 1, gearChance: 0.24, drops: { enhanceStone: 0.05, blessedOrb: 0.012, celestialShard: 0 }, isBoss: false },
  { id: 8, name: 'Goblin Throne', enemyHp: 7500, enemyDmg: 110, goldMin: 8, goldMax: 15, killsRequired: 100,
    enemyType: 'Humanoid', gearTier: 1, gearChance: 0.23, drops: { enhanceStone: 0.055, blessedOrb: 0.015, celestialShard: 0.002 }, isBoss: false },
  { id: 9, name: 'Goblin Warlord', enemyHp: 25000, enemyDmg: 180, goldMin: 50, goldMax: 100, killsRequired: 120,
    enemyType: 'Boss', gearTier: 2, gearChance: 0, bossGearChance: 0.23, drops: { enhanceStone: 0.18, blessedOrb: 0.06, celestialShard: 0.01 }, isBoss: true, bossSet: 'lich' },

  // === TIER 2: Undead Crypts (Zones 10-14) ===
  { id: 10, name: 'Graveyard', enemyHp: 9500, enemyDmg: 150, goldMin: 10, goldMax: 20, killsRequired: 50,
    enemyType: 'Undead', gearTier: 2, gearChance: 0.22, drops: { enhanceStone: 0.06, blessedOrb: 0.018, celestialShard: 0.003 }, isBoss: false },
  { id: 11, name: 'Crypt Entrance', enemyHp: 13000, enemyDmg: 200, goldMin: 12, goldMax: 25, killsRequired: 70,
    enemyType: 'Undead', gearTier: 2, gearChance: 0.21, drops: { enhanceStone: 0.065, blessedOrb: 0.02, celestialShard: 0.005 }, isBoss: false },
  { id: 12, name: 'Bone Halls', enemyHp: 18000, enemyDmg: 260, goldMin: 15, goldMax: 30, killsRequired: 90,
    enemyType: 'Undead', gearTier: 2, gearChance: 0.20, drops: { enhanceStone: 0.07, blessedOrb: 0.022, celestialShard: 0.006 }, isBoss: false },
  { id: 13, name: 'Necropolis', enemyHp: 24000, enemyDmg: 340, goldMin: 18, goldMax: 36, killsRequired: 110,
    enemyType: 'Undead', gearTier: 2, gearChance: 0.19, drops: { enhanceStone: 0.075, blessedOrb: 0.025, celestialShard: 0.008 }, isBoss: false },
  { id: 14, name: 'Lich King', enemyHp: 80000, enemyDmg: 550, goldMin: 120, goldMax: 240, killsRequired: 140,
    enemyType: 'Boss', gearTier: 3, gearChance: 0, bossGearChance: 0.20, drops: { enhanceStone: 0.22, blessedOrb: 0.08, celestialShard: 0.02 }, isBoss: true, bossSet: 'dragon' },

  // === TIER 3: Dragon Mountains (Zones 15-19) ===
  { id: 15, name: 'Mountain Pass', enemyHp: 32000, enemyDmg: 450, goldMin: 22, goldMax: 45, killsRequired: 60,
    enemyType: 'Dragon', gearTier: 3, gearChance: 0.18, drops: { enhanceStone: 0.08, blessedOrb: 0.03, celestialShard: 0.01 }, isBoss: false },
  { id: 16, name: 'Dragon Foothills', enemyHp: 45000, enemyDmg: 600, goldMin: 28, goldMax: 55, killsRequired: 80,
    enemyType: 'Dragon', gearTier: 3, gearChance: 0.17, drops: { enhanceStone: 0.085, blessedOrb: 0.032, celestialShard: 0.012 }, isBoss: false },
  { id: 17, name: 'Wyrm Nests', enemyHp: 60000, enemyDmg: 780, goldMin: 35, goldMax: 70, killsRequired: 100,
    enemyType: 'Dragon', gearTier: 3, gearChance: 0.16, drops: { enhanceStone: 0.09, blessedOrb: 0.035, celestialShard: 0.015 }, isBoss: false },
  { id: 18, name: 'Dragon Peak', enemyHp: 80000, enemyDmg: 1000, goldMin: 45, goldMax: 90, killsRequired: 120,
    enemyType: 'Dragon', gearTier: 3, gearChance: 0.15, drops: { enhanceStone: 0.095, blessedOrb: 0.04, celestialShard: 0.018 }, isBoss: false },
  { id: 19, name: 'Ancient Dragon', enemyHp: 250000, enemyDmg: 1600, goldMin: 300, goldMax: 600, killsRequired: 160,
    enemyType: 'Boss', gearTier: 4, gearChance: 0, bossGearChance: 0.18, drops: { enhanceStone: 0.28, blessedOrb: 0.12, celestialShard: 0.04 }, isBoss: true, bossSet: 'frost' },

  // === TIER 4: Frozen Wastes (Zones 20-24) ===
  { id: 20, name: 'Frozen Tundra', enemyHp: 110000, enemyDmg: 1350, goldMin: 55, goldMax: 110, killsRequired: 70,
    enemyType: 'Elemental', gearTier: 4, gearChance: 0.14, drops: { enhanceStone: 0.10, blessedOrb: 0.045, celestialShard: 0.02 }, isBoss: false },
  { id: 21, name: 'Ice Caverns', enemyHp: 150000, enemyDmg: 1800, goldMin: 70, goldMax: 140, killsRequired: 90,
    enemyType: 'Elemental', gearTier: 4, gearChance: 0.14, drops: { enhanceStone: 0.11, blessedOrb: 0.05, celestialShard: 0.025 }, isBoss: false },
  { id: 22, name: 'Glacial Depths', enemyHp: 200000, enemyDmg: 2400, goldMin: 90, goldMax: 180, killsRequired: 110,
    enemyType: 'Elemental', gearTier: 4, gearChance: 0.13, drops: { enhanceStone: 0.12, blessedOrb: 0.055, celestialShard: 0.03 }, isBoss: false },
  { id: 23, name: 'Frost Citadel', enemyHp: 280000, enemyDmg: 3200, goldMin: 120, goldMax: 240, killsRequired: 140,
    enemyType: 'Elemental', gearTier: 4, gearChance: 0.13, drops: { enhanceStone: 0.13, blessedOrb: 0.06, celestialShard: 0.035 }, isBoss: false },
  { id: 24, name: 'Frost Titan', enemyHp: 800000, enemyDmg: 5000, goldMin: 600, goldMax: 1200, killsRequired: 180,
    enemyType: 'Boss', gearTier: 5, gearChance: 0, bossGearChance: 0.15, drops: { enhanceStone: 0.35, blessedOrb: 0.16, celestialShard: 0.08 }, isBoss: true, bossSet: 'demon' },

  // === TIER 5: Demon Realm (Zones 25-29) ===
  { id: 25, name: 'Hellgate', enemyHp: 400000, enemyDmg: 4200, goldMin: 150, goldMax: 300, killsRequired: 80,
    enemyType: 'Demon', gearTier: 5, gearChance: 0.12, drops: { enhanceStone: 0.14, blessedOrb: 0.07, celestialShard: 0.04 }, isBoss: false },
  { id: 26, name: 'Burning Plains', enemyHp: 550000, enemyDmg: 5600, goldMin: 200, goldMax: 400, killsRequired: 100,
    enemyType: 'Demon', gearTier: 5, gearChance: 0.12, drops: { enhanceStone: 0.15, blessedOrb: 0.08, celestialShard: 0.05 }, isBoss: false },
  { id: 27, name: 'Demon Fortress', enemyHp: 750000, enemyDmg: 7500, goldMin: 280, goldMax: 560, killsRequired: 130,
    enemyType: 'Demon', gearTier: 5, gearChance: 0.11, drops: { enhanceStone: 0.16, blessedOrb: 0.09, celestialShard: 0.06 }, isBoss: false },
  { id: 28, name: 'Infernal Throne', enemyHp: 1000000, enemyDmg: 10000, goldMin: 400, goldMax: 800, killsRequired: 160,
    enemyType: 'Demon', gearTier: 5, gearChance: 0.11, drops: { enhanceStone: 0.17, blessedOrb: 0.10, celestialShard: 0.07 }, isBoss: false },
  { id: 29, name: 'Demon Lord', enemyHp: 2800000, enemyDmg: 15000, goldMin: 1500, goldMax: 3000, killsRequired: 200,
    enemyType: 'Boss', gearTier: 6, gearChance: 0, bossGearChance: 0.13, drops: { enhanceStone: 0.42, blessedOrb: 0.22, celestialShard: 0.12 }, isBoss: true, bossSet: 'seraph' },

  // === TIER 6: Celestial Realm (Zones 30-34) ===
  { id: 30, name: 'Cloud Steps', enemyHp: 1500000, enemyDmg: 12500, goldMin: 500, goldMax: 1000, killsRequired: 90,
    enemyType: 'Celestial', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.18, blessedOrb: 0.12, celestialShard: 0.08 }, isBoss: false },
  { id: 31, name: 'Astral Bridge', enemyHp: 2000000, enemyDmg: 16500, goldMin: 700, goldMax: 1400, killsRequired: 110,
    enemyType: 'Celestial', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.19, blessedOrb: 0.14, celestialShard: 0.10 }, isBoss: false },
  { id: 32, name: 'Divine Sanctum', enemyHp: 2800000, enemyDmg: 22000, goldMin: 1000, goldMax: 2000, killsRequired: 140,
    enemyType: 'Celestial', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.20, blessedOrb: 0.16, celestialShard: 0.12 }, isBoss: false },
  { id: 33, name: 'Eternal Halls', enemyHp: 3800000, enemyDmg: 30000, goldMin: 1500, goldMax: 3000, killsRequired: 180,
    enemyType: 'Celestial', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.22, blessedOrb: 0.18, celestialShard: 0.14 }, isBoss: false },
  { id: 34, name: 'Seraph Commander', enemyHp: 10000000, enemyDmg: 45000, goldMin: 5000, goldMax: 10000, killsRequired: 250,
    enemyType: 'Boss', gearTier: 6, gearChance: 0, bossGearChance: 0.11, drops: { enhanceStone: 0.50, blessedOrb: 0.30, celestialShard: 0.20 }, isBoss: true, bossSet: 'void' },

  // === FINAL: Void/Chaos (Zones 35-39) ===
  { id: 35, name: 'Void Rift', enemyHp: 5000000, enemyDmg: 38000, goldMin: 2000, goldMax: 4000, killsRequired: 100,
    enemyType: 'Void', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.24, blessedOrb: 0.20, celestialShard: 0.16 }, isBoss: false },
  { id: 36, name: 'Chaos Wastes', enemyHp: 7000000, enemyDmg: 52000, goldMin: 3000, goldMax: 6000, killsRequired: 130,
    enemyType: 'Chaos', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.26, blessedOrb: 0.22, celestialShard: 0.18 }, isBoss: false },
  { id: 37, name: 'Primordial Abyss', enemyHp: 10000000, enemyDmg: 70000, goldMin: 4500, goldMax: 9000, killsRequired: 160,
    enemyType: 'Chaos', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.28, blessedOrb: 0.24, celestialShard: 0.20 }, isBoss: false },
  { id: 38, name: 'End of All Things', enemyHp: 15000000, enemyDmg: 95000, goldMin: 7000, goldMax: 14000, killsRequired: 200,
    enemyType: 'Chaos', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.30, blessedOrb: 0.26, celestialShard: 0.22 }, isBoss: false },
  { id: 39, name: 'The Eternal One', enemyHp: 40000000, enemyDmg: 140000, goldMin: 20000, goldMax: 40000, killsRequired: 300,
    enemyType: 'Boss', gearTier: 6, gearChance: 0, bossGearChance: 0.10, drops: { enhanceStone: 0.60, blessedOrb: 0.40, celestialShard: 0.30 }, isBoss: true, bossSet: 'chaos' },
];

export const PRESTIGE_ZONES = [
  { id: 40, name: 'Astral Plane', enemyHp: 80000000, enemyDmg: 200000, goldMin: 30000, goldMax: 60000, killsRequired: 120,
    enemyType: 'Astral', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.35, blessedOrb: 0.28, celestialShard: 0.24, prestigeStone: 0.03 }, isBoss: false, prestigeReq: 1 },
  { id: 41, name: 'Astral Guardian', enemyHp: 200000000, enemyDmg: 350000, goldMin: 80000, goldMax: 160000, killsRequired: 200,
    enemyType: 'Boss', gearTier: 7, gearChance: 0, bossGearChance: 0.10, drops: { enhanceStone: 0.70, blessedOrb: 0.55, celestialShard: 0.45, prestigeStone: 0.15 }, isBoss: true, prestigeReq: 1, bossSet: 'astral' },
  { id: 42, name: 'Cosmic Void', enemyHp: 400000000, enemyDmg: 500000, goldMin: 60000, goldMax: 120000, killsRequired: 150,
    enemyType: 'Cosmic', gearTier: 7, gearChance: 0.10, drops: { enhanceStone: 0.40, blessedOrb: 0.32, celestialShard: 0.28, prestigeStone: 0.06 }, isBoss: false, prestigeReq: 2 },
  { id: 43, name: 'Cosmic Titan', enemyHp: 1000000000, enemyDmg: 800000, goldMin: 200000, goldMax: 400000, killsRequired: 250,
    enemyType: 'Boss', gearTier: 8, gearChance: 0, bossGearChance: 0.10, drops: { enhanceStone: 0.80, blessedOrb: 0.65, celestialShard: 0.55, prestigeStone: 0.25 }, isBoss: true, prestigeReq: 2, bossSet: 'cosmic' },
  { id: 44, name: 'Primordial Realm', enemyHp: 2500000000, enemyDmg: 1200000, goldMin: 150000, goldMax: 300000, killsRequired: 180,
    enemyType: 'Primordial', gearTier: 8, gearChance: 0.10, drops: { enhanceStone: 0.45, blessedOrb: 0.38, celestialShard: 0.32, prestigeStone: 0.10 }, isBoss: false, prestigeReq: 3 },
  { id: 45, name: 'Primordial God', enemyHp: 5000000000, enemyDmg: 2000000, goldMin: 500000, goldMax: 1000000, killsRequired: 400,
    enemyType: 'Boss', gearTier: 9, gearChance: 0, bossGearChance: 0.10, drops: { enhanceStone: 0.90, blessedOrb: 0.80, celestialShard: 0.70, prestigeStone: 0.40 }, isBoss: true, prestigeReq: 3, bossSet: 'primordial' },
];

export const getZoneById = (zoneId) => {
  const regularZone = ZONES.find(z => z.id === zoneId);
  if (regularZone) return regularZone;
  return PRESTIGE_ZONES.find(z => z.id === zoneId) || ZONES[0];
};
