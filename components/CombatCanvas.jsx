import React, { useEffect, useRef, useState } from 'react';
import { ENEMY_SPRITES, ZONE_BACKGROUNDS } from '../assets/gameAssets';

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

    function drawEnemy(x, y, type, scale = 1, shake = 0) {
      ctx.save();
      ctx.translate(x + shake, y);
      ctx.scale(scale, scale);

      const isBoss = type === 'Boss';
      const size = isBoss ? 25 : 15;

      // Enemy body (more menacing colors)
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

      ctx.fillStyle = enemyColors[type] || '#991b1b';

      if (isBoss) {
        // Boss - more intimidating
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#dc2626';

        // Large body
        ctx.beginPath();
        ctx.arc(0, -20, size, 0, Math.PI * 2);
        ctx.fill();

        // Horns/spikes
        ctx.beginPath();
        ctx.moveTo(-15, -35);
        ctx.lineTo(-10, -45);
        ctx.lineTo(-5, -35);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(15, -35);
        ctx.lineTo(10, -45);
        ctx.lineTo(5, -35);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fef08a';
        ctx.beginPath();
        ctx.arc(-8, -22, 3, 0, Math.PI * 2);
        ctx.arc(8, -22, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Regular enemy
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemyColors[type] || '#991b1b';

        ctx.beginPath();
        ctx.arc(0, -15, size, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-5, -15, 2, 0, Math.PI * 2);
        ctx.arc(5, -15, 2, 0, Math.PI * 2);
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
  }, [currentZone, playerHp, playerMaxHp, enemyHp, enemyMaxHp, damageNumbers, isPlayerTurn, lastDamage, lastHeal]);

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
