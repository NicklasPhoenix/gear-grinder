// Game asset URLs from Kenney.nl and other free CDNs
// All assets are freely available and CDN-hosted

export const ASSET_BASE = {
  // Local assets generated via AI
  characters: '/assets/characters.png',
  items: '/assets/items.png',
  ui: 'https://kenney.nl/content/3-assets/2-asset-packs/ui-pack-rpg-expansion/preview.png', // Keep UI for now or replace if needed
};

// Enemy sprites by zone type
// Mapped to generated spreadsheet rows (approximate)
// Assuming standard grid layout from generation
const GRID_SIZE = 120; // Approximately 120px usually for sprite gen outputs per cell if 1024x1024?
// Let's rely on GameRenderer.jsx to handle the slicing logic properly by checking texture size.
// Actually, let's define logical slots here.
export const ENEMY_SPRITES = {
  // Row 2: Skeleton
  Undead: { row: 1, col: 0 },
  // Row 3: Orc
  Beast: { row: 2, col: 0 },
  Humanoid: { row: 2, col: 2 },
  // Row 4: Dragon
  Dragon: { row: 3, col: 0 },
  Boss: { row: 3, col: 1 },
  // Row 5: Demon
  Demon: { row: 4, col: 0 },
  Abyssal: { row: 4, col: 2 },
  Void: { row: 4, col: 3 },
  // Row 6: Elemental
  Elemental: { row: 5, col: 0 },
  Chaos: { row: 5, col: 2 },
  // Row 7: Angel
  Celestial: { row: 6, col: 0 },
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

  // Draw different shapes based on weapon type
  switch (weaponType) {
    case 'sword':
      // Sword shape
      ctx.fillRect(20, 10, 8, 28);
      ctx.fillRect(18, 38, 12, 4);
      ctx.fillRect(22, 6, 4, 8);
      break;
    case 'staff':
      // Staff shape
      ctx.fillRect(23, 10, 2, 32);
      ctx.beginPath();
      ctx.arc(24, 10, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'dagger':
      // Dagger shape
      ctx.fillRect(22, 15, 4, 20);
      ctx.fillRect(20, 35, 8, 3);
      ctx.beginPath();
      ctx.moveTo(24, 10);
      ctx.lineTo(20, 15);
      ctx.lineTo(28, 15);
      ctx.fill();
      break;
    case 'mace':
      // Mace shape
      ctx.fillRect(23, 20, 2, 18);
      ctx.fillRect(18, 15, 12, 8);
      break;
    case 'scythe':
      // Scythe shape
      ctx.fillRect(20, 15, 2, 25);
      ctx.beginPath();
      ctx.arc(24, 18, 8, 0, Math.PI);
      ctx.fill();
      break;
    case 'katana':
      // Katana shape
      ctx.save();
      ctx.translate(24, 24);
      ctx.rotate(-0.3);
      ctx.fillRect(-2, -15, 4, 30);
      ctx.fillRect(-4, 15, 8, 3);
      ctx.restore();
      break;
    case 'greataxe':
      // Greataxe shape
      ctx.fillRect(23, 20, 2, 20);
      ctx.fillRect(12, 12, 24, 12);
      break;
    default:
      // Default sword
      ctx.fillRect(20, 10, 8, 28);
  }

  // Add glow effect based on tier
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

  // Add glow effect based on tier
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
