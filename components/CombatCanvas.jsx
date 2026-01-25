import React, { useEffect, useRef, useState } from 'react';
import { ZONE_BACKGROUNDS } from '../assets/gameAssets';

// Direct zone ID to monster sprite mapping (descriptive names)
const ZONE_MONSTER_SPRITES = {
  // Forest region - zones 0-3
  0: 'spider_red',      // Spider Den
  1: 'spider_dark',     // Dark Hollow
  2: 'mushroom',        // Fungal Grove
  3: 'ape',             // Primal Woods
  // Swamp region - zones 5-8
  5: 'flower_blue',     // Blooming Marsh
  6: 'imp',             // Imp Hollow
  7: 'pumpkin',         // Pumpkin Patch
  8: 'beetle_orange',   // Beetle Burrow
  // Undead region - zones 10-13
  10: 'frog',           // Murky Swamp
  11: 'flower_pink',    // Poison Garden
  12: 'crystal_ice',    // Crystal Caves
  13: 'rose_skull',     // Skull Garden
  // Shadow region - zones 15-18
  15: 'spider_shadow',  // Shadow Webs
  16: 'spider_black',   // Arachnid Lair
  17: 'crow',           // Crow's Nest
  18: 'bat_dark',       // Bat Hollow
  // Ice region - zones 20-23
  20: 'golem_ice',      // Frozen Wastes
  21: 'slime_yellow',   // Slime Pools
  22: 'slime_face',     // Ooze Caverns
  23: 'slime_blob',     // Slime Pits
  // Fire region - zones 25-28
  25: 'mantis',         // Mantis Hive
  26: 'golem_stone',    // Golem Quarry
  27: 'owl',            // Owl's Perch
  28: 'hornet',         // Hornet's Nest
  // Celestial region - zones 30-33
  30: 'slime_green',    // Slime Wastes
  31: 'slime_arms',     // Gelatinous Depths
  32: 'wolf',           // Wolf Territory
  33: 'bat_purple',     // Vampire Den
  // Chaos region - zones 35-38
  35: 'hellhound',      // Hellhound Lair
  36: 'dwarf',          // Dwarven Mines
  37: 'pumpkin_evil',   // Cursed Fields
  38: 'bear',           // Bear's Domain
  // Prestige zones
  40: 'cockatrice',     // Cockatrice Roost
  42: 'toad',           // Giant Toad Marsh
  44: 'shaman',         // Shaman's Sanctum
};

// Boss zone ID to boss sprite mapping (descriptive names)
const ZONE_BOSS_SPRITES = {
  4: 'crow_demon',      // The Crow Demon
  9: 'cerberus',        // Cerberus
  14: 'demon_lord',     // Demon Lord
  19: 'spider_eye',     // Spider Matriarch
  24: 'shadow_wolf',    // Shadow Wolf Alpha
  29: 'eye_spider',     // Eye of the Abyss
  34: 'horned_beast',   // Horned Behemoth
  39: 'dark_wolf',      // Dark Wolf King
  41: 'eye_tyrant',     // Eye Tyrant
  43: 'fire_fox',       // Inferno Fox
  45: 'scorpion_king',  // Scorpion King
};

// Preload and cache sprite images
const spriteCache = {};
function loadSprite(path) {
  if (spriteCache[path]) return spriteCache[path];
  const img = new Image();
  img.src = path;
  spriteCache[path] = img;
  return img;
}

// Get sprite path for a zone - direct mapping by zone ID
function getSpritePath(zone) {
  if (!zone) return null;

  if (zone.isBoss) {
    const spriteName = ZONE_BOSS_SPRITES[zone.id] || 'crow_demon';
    return `/assets/bosses/${spriteName}.png`;
  } else {
    const spriteName = ZONE_MONSTER_SPRITES[zone.id] || 'spider_red';
    return `/assets/monsters/${spriteName}.png`;
  }
}

export default function CombatCanvas({
  currentZone,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  lastDamage,
  lastHeal,
  isPlayerTurn
}) {
  const canvasRef = useRef(null);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  // Preload sprite when zone changes
  useEffect(() => {
    const path = getSpritePath(currentZone);
    if (path) {
      const img = loadSprite(path);
      if (img.complete) {
        setSpriteLoaded(true);
      } else {
        img.onload = () => setSpriteLoaded(true);
      }
    }
  }, [currentZone]);

  // Add damage numbers
  useEffect(() => {
    if (lastDamage > 0) {
      const id = Date.now();
      setDamageNumbers(prev => [...prev, {
        id,
        value: lastDamage,
        x: isPlayerTurn ? 400 : 200,
        y: 200,
        type: isPlayerTurn ? 'player' : 'enemy'
      }]);

      // Create hit particles
      const particleCount = Math.min(20, Math.floor(lastDamage / 10) + 5);
      const newParticles = [];
      const baseX = isPlayerTurn ? 400 : 200;
      const baseY = 200;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: baseX + (Math.random() - 0.5) * 40,
          y: baseY + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2,
          life: 1,
          color: isPlayerTurn ? '#ef4444' : '#22c55e',
          size: Math.random() * 4 + 2
        });
      }
      particlesRef.current.push(...newParticles);

      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
      }, 1000);
    }
  }, [lastDamage, isPlayerTurn]);

  // Add heal numbers
  useEffect(() => {
    if (lastHeal > 0) {
      const id = Date.now() + 0.1;
      setDamageNumbers(prev => [...prev, {
        id,
        value: lastHeal,
        x: 200,
        y: 200,
        type: 'heal'
      }]);
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
      }, 1000);
    }
  }, [lastHeal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const zone = currentZone;

    let animationFrame = 0;
    let shakeAmount = 0;

    function drawCharacter(x, y, color, scale = 1, bounce = 0) {
      ctx.save();
      ctx.translate(x, y + bounce);
      ctx.scale(scale, scale);

      // Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, -15, 12, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(0, -35, 10, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillRect(-6, -5, 4, 15);
      ctx.fillRect(2, -5, 4, 15);

      // Arms
      ctx.fillRect(-12, -15, 4, 12);
      ctx.fillRect(8, -15, 4, 12);

      // Weapon glow
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.arc(12, -20, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawEnemy(x, y, type, _scale, shake = 0) {
      ctx.save();
      ctx.translate(x + shake, y);

      const isBoss = zone?.isBoss;
      const spriteSize = 32;
      const displaySize = isBoss ? spriteSize * 4 : spriteSize * 3;

      // Try to get cached sprite
      const spritePath = getSpritePath(zone);
      const sprite = spritePath ? spriteCache[spritePath] : null;

      // Draw sprite if loaded
      if (sprite && sprite.complete && sprite.naturalWidth > 0) {
        // Add glow effect for bosses
        if (isBoss) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#dc2626';
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
        }

        // Draw the sprite centered above ground
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sprite,
          -displaySize / 2,
          -displaySize,
          displaySize,
          displaySize
        );
      } else {
        // Fallback shape while sprite loads
        const enemyColors = {
          'Beast': '#d97706',
          'Humanoid': '#78716c',
          'Boss': '#dc2626',
          'Undead': '#6b7280',
          'Dragon': '#ef4444',
          'Demon': '#7f1d1d',
          'Elemental': '#06b6d4',
          'Celestial': '#fbbf24',
          'Abyssal': '#312e81',
          'Chaos': '#831843',
          'Void': '#0c4a6e',
        };

        const color = enemyColors[type] || '#991b1b';
        const size = isBoss ? 40 : 25;

        // Draw body
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(0, -size - 20, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(-size/3, -size - 25, 4, 0, Math.PI * 2);
        ctx.arc(size/3, -size - 25, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawHealthBar(x, y, hp, maxHp, width = 100) {
      const height = 8;
      const percentage = Math.max(0, Math.min(1, hp / maxHp));

      // Background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(x - width/2, y, width, height);

      // Health
      const healthColor = percentage > 0.5 ? '#22c55e' : percentage > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = healthColor;
      ctx.fillRect(x - width/2, y, width * percentage, height);

      // Border
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - width/2, y, width, height);

      // HP Text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(hp)} / ${Math.ceil(maxHp)}`, x, y + 20);
    }

    function drawParticles() {
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.life -= 0.02;

        if (p.life <= 0) return false;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const bg = ZONE_BACKGROUNDS[zone?.id] || ZONE_BACKGROUNDS[0];
      const colors = bg.match(/#[0-9a-f]{6}/gi);
      if (colors && colors.length >= 2) {
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 350, canvas.width, 50);

      // Bounce animation
      const bounce = Math.sin(animationFrame * 0.1) * 5;

      // Shake on hit
      if (lastDamage > 0) {
        shakeAmount = Math.max(0, shakeAmount - 0.5);
      } else {
        shakeAmount = 0;
      }

      // Draw player
      drawCharacter(150, 300, '#3b82f6', 1.2, bounce);
      drawHealthBar(150, 340, playerHp, playerMaxHp, 120);

      // Draw enemy
      if (zone && enemyHp > 0) {
        const enemyShake = !isPlayerTurn ? (Math.random() - 0.5) * shakeAmount : 0;
        drawEnemy(450, 300, zone.enemyType, zone.isBoss ? 1.5 : 1.2, enemyShake);
        drawHealthBar(450, 340, enemyHp, enemyMaxHp, 120);
      }

      // Draw particles
      drawParticles();

      // Draw damage numbers
      damageNumbers.forEach(dmg => {
        const age = (Date.now() - dmg.id) / 1000;
        const y = dmg.y - age * 50;
        const alpha = Math.max(0, 1 - age);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        if (dmg.type === 'heal') {
          ctx.fillStyle = '#22c55e';
          ctx.strokeText(`+${dmg.value}`, dmg.x, y);
          ctx.fillText(`+${dmg.value}`, dmg.x, y);
        } else {
          ctx.fillStyle = dmg.type === 'player' ? '#ef4444' : '#f59e0b';
          ctx.strokeText(`-${dmg.value}`, dmg.x, y);
          ctx.fillText(`-${dmg.value}`, dmg.x, y);
        }
        ctx.restore();
      });

      // Zone name
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(zone?.name || 'Unknown Zone', canvas.width / 2, 26);

      animationFrame++;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentZone, playerHp, playerMaxHp, enemyHp, enemyMaxHp, damageNumbers, isPlayerTurn, lastDamage, lastHeal, spriteLoaded]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="border-2 border-gray-700 rounded-lg shadow-2xl"
      style={{
        imageRendering: 'pixelated',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
}
