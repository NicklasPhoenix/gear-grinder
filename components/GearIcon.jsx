import React, { useEffect, useRef } from 'react';
import { generateWeaponIcon, generateArmorIcon } from '../assets/gameAssets';

export default function GearIcon({ item, size = 48, className = '' }) {
  const canvasRef = useRef(null);
  const imageDataRef = useRef(null);

  useEffect(() => {
    if (!item) {
      imageDataRef.current = null;
      return;
    }

    // Generate icon based on slot
    if (item.slot === 'weapon') {
      imageDataRef.current = generateWeaponIcon(item.weaponType || 'sword', item.tier);
    } else {
      imageDataRef.current = generateArmorIcon(item.slot, item.tier);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (imageDataRef.current) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
      };
      img.src = imageDataRef.current;
    } else {
      ctx.clearRect(0, 0, size, size);
    }
  }, [item, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`gear-icon ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
