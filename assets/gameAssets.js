// DawnLike 16x16 Universal Roguelike Tileset by DragonDePlatino
// CC-BY 4.0 - Credit: DragonDePlatino (art) and DawnBringer (palette)
// Characters organized by type in separate sprite sheets

export const ASSET_BASE = {
  // Character sprite sheets
  player: '/assets/characters.png',    // Player/hero sprites (128x240)
  humanoid: '/assets/humanoid.png',    // Humanoid enemies (128x432)
  demon: '/assets/demon.png',          // Demon sprites (128x144)
  undead: '/assets/undead.png',        // Undead/skeleton (128x160)
  beast: '/assets/beast.png',          // Quadruped beasts (128x192)
  reptile: '/assets/reptile.png',      // Reptiles/dragons (128x248)
  elemental: '/assets/elemental.png',  // Elementals
  avian: '/assets/avian.png',          // Flying creatures (128x208)
  misc: '/assets/misc.png',            // Misc creatures
  // Item sprite sheets (DawnLike - all 128px wide, 8 cols of 16x16)
  shortwep: '/assets/shortwep.png',    // Daggers (128x80, 5 rows)
  medwep: '/assets/medwep.png',        // Swords (128x32, 2 rows)
  longwep: '/assets/longwep.png',      // Staffs/spears (128x112, 7 rows)
  shield: '/assets/shield.png',        // Shields (128x16, 1 row)
  armor_items: '/assets/armor_items.png', // Armor (128x144, 9 rows)
  amulet: '/assets/amulet.png',        // Amulets (128x48, 3 rows)
  ring: '/assets/ring.png',            // Rings
  boot: '/assets/boot.png',            // Boots
  glove: '/assets/glove.png',          // Gloves
  hat: '/assets/hat.png',              // Hats/helmets
  potion: '/assets/potion.png',        // Potions
};

// Sprite config: All DawnLike sprites are 16x16 in 8-column sheets
export const SPRITE_CONFIG = {
  tileSize: 16,
  cols: 8,  // 128px / 16px = 8 columns
};

// Item sprite config (DawnLike - all sheets are 8 columns of 16x16)
export const ITEM_SPRITE_CONFIG = {
  tileSize: 16,
  cols: 8,
};

// Enemy sprite definitions - maps enemy type to sprite sheet and position
// DawnLike organizes sprites in rows, with animation frames in columns 0-1
// Row/col are the grid position within each sprite sheet
export const ENEMY_SPRITES = {
  // Player/Knight uses player sheet
  Knight: {
    sheet: 'player',
    row: 0, col: 0,  // First hero sprite
    scale: 4
  },
  // Humanoid enemies
  Humanoid: {
    sheet: 'humanoid',
    row: 4, col: 0,  // Orc/goblin type
    scale: 4
  },
  // Beast (quadruped)
  Beast: {
    sheet: 'beast',
    row: 2, col: 0,  // Wolf/bear type
    scale: 4
  },
  // Undead
  Undead: {
    sheet: 'undead',
    row: 0, col: 0,  // Skeleton
    scale: 4
  },
  // Dragon/Reptile
  Dragon: {
    sheet: 'reptile',
    row: 8, col: 0,  // Large dragon
    scale: 5
  },
  // Demon
  Demon: {
    sheet: 'demon',
    row: 2, col: 0,  // Demon type
    scale: 5
  },
  // Elemental
  Elemental: {
    sheet: 'elemental',
    row: 2, col: 0,  // Fire/ice elemental
    scale: 4
  },
  // Celestial (use humanoid with angel-like row)
  Celestial: {
    sheet: 'humanoid',
    row: 0, col: 0,  // Human/angel type
    scale: 4
  },
  // Abyssal (dark demon)
  Abyssal: {
    sheet: 'demon',
    row: 4, col: 0,
    scale: 5
  },
  // Chaos (misc weird creature)
  Chaos: {
    sheet: 'misc',
    row: 2, col: 0,
    scale: 5
  },
  // Void (ghost-like)
  Void: {
    sheet: 'undead',
    row: 4, col: 0,  // Ghost/wraith
    scale: 4
  },
  // Boss variant (large dragon)
  Boss: {
    sheet: 'reptile',
    row: 10, col: 0,
    scale: 6
  },
};

// Item sprites - maps item type to sprite sheet and position
// DawnLike organizes items by category in separate sheets (8 columns each)
export const ITEM_SPRITES = {
  // Weapons - swords from medwep sheet
  sword:    { sheet: 'medwep', row: 0, col: 0 },
  katana:   { sheet: 'medwep', row: 0, col: 2 },
  axe:      { sheet: 'medwep', row: 1, col: 0 },
  greataxe: { sheet: 'medwep', row: 1, col: 2 },
  mace:     { sheet: 'medwep', row: 1, col: 4 },
  // Daggers from shortwep
  dagger:   { sheet: 'shortwep', row: 0, col: 0 },
  // Staffs from longwep
  staff:    { sheet: 'longwep', row: 0, col: 0 },
  scythe:   { sheet: 'longwep', row: 2, col: 0 },
  // Armor from armor_items
  helmet:   { sheet: 'hat', row: 0, col: 0 },
  armor:    { sheet: 'armor_items', row: 0, col: 0 },
  boots:    { sheet: 'boot', row: 0, col: 0 },
  shield:   { sheet: 'shield', row: 0, col: 0 },
  gloves:   { sheet: 'glove', row: 0, col: 0 },
  // Accessories
  amulet:   { sheet: 'amulet', row: 0, col: 0 },
  accessory:{ sheet: 'ring', row: 0, col: 2 },
  ring:     { sheet: 'ring', row: 0, col: 0 },
  // Materials (use potion sheet)
  ore:      { sheet: 'potion', row: 1, col: 0 },
  leather:  { sheet: 'potion', row: 1, col: 2 },
  gem:      { sheet: 'potion', row: 0, col: 4 },
  potion:   { sheet: 'potion', row: 0, col: 0 },
};

// Procedurally generate weapon icons based on type and tier
export function generateWeaponIcon(weaponType, tier) {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');

  const tierColors = [
    '#9ca3af', '#22c55e', '#3b82f6', '#a855f7',
    '#f97316', '#ec4899', '#fbbf24', '#38bdf8',
    '#818cf8', '#f472b6'
  ];

  ctx.fillStyle = tierColors[tier] || tierColors[0];

  switch (weaponType) {
    case 'sword':
      ctx.fillRect(20, 10, 8, 28);
      ctx.fillRect(18, 38, 12, 4);
      ctx.fillRect(22, 6, 4, 8);
      break;
    case 'staff':
      ctx.fillRect(23, 10, 2, 32);
      ctx.beginPath();
      ctx.arc(24, 10, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'dagger':
      ctx.fillRect(22, 15, 4, 20);
      ctx.fillRect(20, 35, 8, 3);
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(20, 15);
      ctx.lineTo(28, 15);
      ctx.fill();
      break;
    case 'mace':
      ctx.fillRect(23, 20, 2, 18);
      ctx.fillRect(18, 15, 12, 8);
      break;
    case 'scythe':
      ctx.fillRect(20, 15, 2, 25);
      ctx.beginPath();
      ctx.arc(24, 18, 8, 0, Math.PI);
      ctx.fill();
      break;
    case 'katana':
      ctx.save();
      ctx.translate(24, 24);
      ctx.rotate(-0.3);
      ctx.fillRect(-2, -15, 4, 30);
      ctx.fillRect(-4, 15, 8, 3);
      ctx.restore();
      break;
    case 'greataxe':
      ctx.fillRect(23, 20, 2, 20);
      ctx.fillRect(12, 12, 24, 12);
      break;
    default:
      ctx.fillRect(20, 10, 8, 28);
  }

  if (tier >= 3) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = tierColors[tier];
  }

  return canvas.toDataURL();
}

// Generate armor piece icons
export function generateArmorIcon(slot, tier) {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');

  const tierColors = [
    '#9ca3af', '#22c55e', '#3b82f6', '#a855f7',
    '#f97316', '#ec4899', '#fbbf24', '#38bdf8',
    '#818cf8', '#f472b6'
  ];

  ctx.fillStyle = tierColors[tier] || tierColors[0];

  switch (slot) {
    case 'helmet':
      ctx.fillRect(14, 12, 20, 16);
      ctx.fillRect(12, 20, 24, 4);
      break;
    case 'armor':
      ctx.fillRect(16, 16, 16, 20);
      ctx.fillRect(12, 18, 24, 14);
      break;
    case 'boots':
      ctx.fillRect(14, 26, 8, 12);
      ctx.fillRect(26, 26, 8, 12);
      break;
    case 'shield':
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(36, 18);
      ctx.lineTo(36, 30);
      ctx.lineTo(24, 38);
      ctx.lineTo(12, 30);
      ctx.lineTo(12, 18);
      ctx.closePath();
      ctx.fill();
      break;
    case 'gloves':
      ctx.fillRect(12, 20, 10, 12);
      ctx.fillRect(26, 20, 10, 12);
      break;
    case 'amulet':
      ctx.beginPath();
      ctx.arc(24, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(20, 20, 8, 12);
      break;
    case 'accessory':
      ctx.beginPath();
      ctx.arc(24, 24, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(24, 24, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1f2937';
      ctx.fill();
      break;
    default:
      ctx.fillRect(16, 16, 16, 16);
  }

  if (tier >= 3) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = tierColors[tier];
  }

  return canvas.toDataURL();
}

// Generate material icons
export function generateMaterialIcon(materialType) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  switch (materialType) {
    case 'ore':
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(8, 12, 16, 14);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(12, 8, 8, 4);
      break;
    case 'leather':
      ctx.fillStyle = '#d97706';
      ctx.fillRect(6, 8, 20, 16);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(8, 10, 4, 4);
      ctx.fillRect(14, 10, 4, 4);
      ctx.fillRect(20, 10, 4, 4);
      break;
    case 'enhanceStone':
      ctx.fillStyle = '#60a5fa';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(16, 6);
      ctx.lineTo(10, 16);
      ctx.lineTo(12, 26);
      ctx.lineTo(20, 26);
      ctx.lineTo(22, 16);
      ctx.closePath();
      ctx.fill();
      break;
    case 'blessedOrb':
      ctx.fillStyle = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#c084fc';
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'celestialShard':
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = 16 + Math.cos(angle) * 10;
        const y = 16 + Math.sin(angle) * 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case 'prestigeStone':
      ctx.fillStyle = '#f472b6';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f472b6';
      ctx.beginPath();
      ctx.arc(16, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  return canvas.toDataURL();
}

// Background gradients by zone
export const ZONE_BACKGROUNDS = {
  0: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',  // Forest
  1: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',  // Dark Woods
  2: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',  // Boss
  3: 'linear-gradient(135deg, #78716c 0%, #57534e 100%)',  // Caves
  4: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',  // Crypt
  5: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',  // Lich Boss
  6: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',  // Dragon Peak
  7: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',  // Dragon Boss
  8: 'linear-gradient(135deg, #6b21a8 0%, #581c87 100%)',  // Void
  9: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',  // Frozen
  10: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', // Frost Boss
  11: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)', // Demon Fortress
  12: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)', // Demon Boss
  13: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Celestial
  14: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', // Seraph Boss
  15: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', // Abyssal
  16: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', // Void Boss
  17: 'linear-gradient(135deg, #831843 0%, #500724 100%)', // Chaos
  18: 'linear-gradient(135deg, #9f1239 0%, #701a36 100%)', // Chaos Boss
  19: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)', // Eternal Void
  20: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #1f2937 100%)', // Eternal Boss
};
