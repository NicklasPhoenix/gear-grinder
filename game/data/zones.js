export const ZONES = [
  // Normal zones drop gear of their tier, bosses drop set items
  // gearTier determines what tier of gear drops, gearChance is drop rate per kill
  { id: 0, name: 'Forest Clearing', enemyHp: 30, enemyDmg: 15, goldMin: 1, goldMax: 3, killsRequired: 0,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.08, drops: { enhanceStone: 0.03, blessedOrb: 0, celestialShard: 0 }, isBoss: false },
  { id: 1, name: 'Dark Woods', enemyHp: 80, enemyDmg: 45, goldMin: 2, goldMax: 5, killsRequired: 20,
    enemyType: 'Beast', gearTier: 0, gearChance: 0.10, drops: { enhanceStone: 0.04, blessedOrb: 0.005, celestialShard: 0 }, isBoss: false },
  { id: 2, name: '🔥 Forest Guardian', enemyHp: 300, enemyDmg: 85, goldMin: 15, goldMax: 30, killsRequired: 30,
    enemyType: 'Boss', gearTier: 2, gearChance: 0, drops: { enhanceStone: 0.20, blessedOrb: 0.05, celestialShard: 0 }, isBoss: true, bossSet: 'guardian' },
  { id: 3, name: 'Goblin Caves', enemyHp: 250, enemyDmg: 120, goldMin: 5, goldMax: 12, killsRequired: 10,
    enemyType: 'Humanoid', gearTier: 1, gearChance: 0.10, drops: { enhanceStone: 0.06, blessedOrb: 0.01, celestialShard: 0 }, isBoss: false },
  { id: 4, name: 'Undead Crypt', enemyHp: 500, enemyDmg: 220, goldMin: 8, goldMax: 20, killsRequired: 40,
    enemyType: 'Undead', gearTier: 1, gearChance: 0.10, drops: { enhanceStone: 0.08, blessedOrb: 0.02, celestialShard: 0.002 }, isBoss: false },
  { id: 5, name: '🔥 Lich King', enemyHp: 1500, enemyDmg: 400, goldMin: 40, goldMax: 80, killsRequired: 50,
    enemyType: 'Boss', gearTier: 3, gearChance: 0, drops: { enhanceStone: 0.25, blessedOrb: 0.10, celestialShard: 0.02 }, isBoss: true, bossSet: 'lich' },
  { id: 6, name: 'Dragon Peak', enemyHp: 1200, enemyDmg: 500, goldMin: 15, goldMax: 35, killsRequired: 15,
    enemyType: 'Dragon', gearTier: 2, gearChance: 0.10, drops: { enhanceStone: 0.12, blessedOrb: 0.04, celestialShard: 0.008 }, isBoss: false },
  { id: 7, name: '🔥 Ancient Dragon', enemyHp: 3500, enemyDmg: 800, goldMin: 80, goldMax: 160, killsRequired: 60,
    enemyType: 'Boss', gearTier: 3, gearChance: 0, drops: { enhanceStone: 0.30, blessedOrb: 0.15, celestialShard: 0.05 }, isBoss: true, bossSet: 'dragon' },
  { id: 8, name: 'Void Realm', enemyHp: 3000, enemyDmg: 950, goldMin: 25, goldMax: 60, killsRequired: 20,
    enemyType: 'Demon', gearTier: 2, gearChance: 0.10, drops: { enhanceStone: 0.14, blessedOrb: 0.05, celestialShard: 0.015 }, isBoss: false },
  { id: 9, name: 'Frozen Wastes', enemyHp: 8000, enemyDmg: 1800, goldMin: 50, goldMax: 120, killsRequired: 80,
    enemyType: 'Elemental', gearTier: 3, gearChance: 0.10, drops: { enhanceStone: 0.18, blessedOrb: 0.08, celestialShard: 0.03 }, isBoss: false },
  { id: 10, name: '🔥 Frost Titan', enemyHp: 20000, enemyDmg: 3000, goldMin: 200, goldMax: 450, killsRequired: 100,
    enemyType: 'Boss', gearTier: 4, gearChance: 0, drops: { enhanceStone: 0.35, blessedOrb: 0.20, celestialShard: 0.10 }, isBoss: true, bossSet: 'frost' },
  { id: 11, name: 'Demon Fortress', enemyHp: 15000, enemyDmg: 3500, goldMin: 80, goldMax: 180, killsRequired: 30,
    enemyType: 'Demon', gearTier: 3, gearChance: 0.10, drops: { enhanceStone: 0.20, blessedOrb: 0.10, celestialShard: 0.05 }, isBoss: false },
  { id: 12, name: '🔥 Demon Lord', enemyHp: 40000, enemyDmg: 5500, goldMin: 350, goldMax: 700, killsRequired: 120,
    enemyType: 'Boss', gearTier: 4, gearChance: 0, drops: { enhanceStone: 0.40, blessedOrb: 0.25, celestialShard: 0.15 }, isBoss: true, bossSet: 'demon' },
  { id: 13, name: 'Celestial Tower', enemyHp: 35000, enemyDmg: 6500, goldMin: 150, goldMax: 350, killsRequired: 40,
    enemyType: 'Celestial', gearTier: 4, gearChance: 0.10, drops: { enhanceStone: 0.22, blessedOrb: 0.12, celestialShard: 0.08 }, isBoss: false },
  { id: 14, name: '🔥 Seraph Commander', enemyHp: 80000, enemyDmg: 10000, goldMin: 600, goldMax: 1200, killsRequired: 150,
    enemyType: 'Boss', gearTier: 5, gearChance: 0, drops: { enhanceStone: 0.45, blessedOrb: 0.30, celestialShard: 0.20 }, isBoss: true, bossSet: 'seraph' },
  { id: 15, name: 'Abyssal Depths', enemyHp: 80000, enemyDmg: 11000, goldMin: 250, goldMax: 550, killsRequired: 50,
    enemyType: 'Abyssal', gearTier: 4, gearChance: 0.10, drops: { enhanceStone: 0.25, blessedOrb: 0.15, celestialShard: 0.10 }, isBoss: false },
  { id: 16, name: '🔥 Void Emperor', enemyHp: 180000, enemyDmg: 18000, goldMin: 1000, goldMax: 2200, killsRequired: 180,
    enemyType: 'Boss', gearTier: 5, gearChance: 0, drops: { enhanceStone: 0.50, blessedOrb: 0.35, celestialShard: 0.25 }, isBoss: true, bossSet: 'void' },
  { id: 17, name: 'Chaos Realm', enemyHp: 200000, enemyDmg: 22000, goldMin: 400, goldMax: 900, killsRequired: 60,
    enemyType: 'Chaos', gearTier: 5, gearChance: 0.10, drops: { enhanceStone: 0.28, blessedOrb: 0.18, celestialShard: 0.12 }, isBoss: false },
  { id: 18, name: '🔥 Chaos God', enemyHp: 400000, enemyDmg: 35000, goldMin: 1800, goldMax: 4000, killsRequired: 200,
    enemyType: 'Boss', gearTier: 6, gearChance: 0, drops: { enhanceStone: 0.55, blessedOrb: 0.40, celestialShard: 0.30 }, isBoss: true, bossSet: 'chaos' },
  { id: 19, name: 'Eternal Void', enemyHp: 500000, enemyDmg: 45000, goldMin: 700, goldMax: 1500, killsRequired: 70,
    enemyType: 'Void', gearTier: 5, gearChance: 0.10, drops: { enhanceStone: 0.32, blessedOrb: 0.22, celestialShard: 0.18 }, isBoss: false },
  { id: 20, name: '🔥 Eternal One', enemyHp: 1000000, enemyDmg: 75000, goldMin: 3500, goldMax: 8000, killsRequired: 250,
    enemyType: 'Boss', gearTier: 6, gearChance: 0, drops: { enhanceStone: 0.65, blessedOrb: 0.50, celestialShard: 0.40 }, isBoss: true, bossSet: 'eternal' },
];

export const PRESTIGE_ZONES = [
  { id: 21, name: '🌟 Astral Plane', enemyHp: 2000000, enemyDmg: 100000, goldMin: 5000, goldMax: 12000, killsRequired: 100,
    enemyType: 'Astral', gearTier: 6, gearChance: 0.10, drops: { enhanceStone: 0.40, blessedOrb: 0.30, celestialShard: 0.25, prestigeStone: 0.05 }, isBoss: false, prestigeReq: 1 },
  { id: 22, name: '🔥🌟 Astral Guardian', enemyHp: 5000000, enemyDmg: 180000, goldMin: 15000, goldMax: 35000, killsRequired: 150,
    enemyType: 'Boss', gearTier: 7, gearChance: 0, drops: { enhanceStone: 0.75, blessedOrb: 0.60, celestialShard: 0.50, prestigeStone: 0.20 }, isBoss: true, prestigeReq: 1, bossSet: 'astral' },
  { id: 23, name: '🌟🌟 Cosmic Void', enemyHp: 8000000, enemyDmg: 250000, goldMin: 10000, goldMax: 25000, killsRequired: 120,
    enemyType: 'Cosmic', gearTier: 7, gearChance: 0.10, drops: { enhanceStone: 0.45, blessedOrb: 0.35, celestialShard: 0.30, prestigeStone: 0.10 }, isBoss: false, prestigeReq: 2 },
  { id: 24, name: '🔥🌟🌟 Cosmic Titan', enemyHp: 20000000, enemyDmg: 400000, goldMin: 40000, goldMax: 90000, killsRequired: 200,
    enemyType: 'Boss', gearTier: 8, gearChance: 0, drops: { enhanceStone: 0.85, blessedOrb: 0.70, celestialShard: 0.60, prestigeStone: 0.35 }, isBoss: true, prestigeReq: 2, bossSet: 'cosmic' },
  { id: 25, name: '🌟🌟🌟 Primordial Realm', enemyHp: 50000000, enemyDmg: 600000, goldMin: 25000, goldMax: 60000, killsRequired: 150,
    enemyType: 'Primordial', gearTier: 8, gearChance: 0.10, drops: { enhanceStone: 0.50, blessedOrb: 0.40, celestialShard: 0.35, prestigeStone: 0.15 }, isBoss: false, prestigeReq: 3 },
  { id: 26, name: '🔥🌟🌟🌟 Primordial God', enemyHp: 100000000, enemyDmg: 1000000, goldMin: 100000, goldMax: 250000, killsRequired: 300,
    enemyType: 'Boss', gearTier: 9, gearChance: 0, drops: { enhanceStone: 0.95, blessedOrb: 0.85, celestialShard: 0.80, prestigeStone: 0.50 }, isBoss: true, prestigeReq: 3, bossSet: 'primordial' },
];

export const getZoneById = (zoneId) => {
  const regularZone = ZONES.find(z => z.id === zoneId);
  if (regularZone) return regularZone;
  return PRESTIGE_ZONES.find(z => z.id === zoneId) || ZONES[0];
};
