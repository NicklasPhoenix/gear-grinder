import React, { useEffect, useRef } from 'react';
import { generateMaterialIcon } from '../assets/gameAssets';

export default function MaterialIcon({ material, size = 32, className = '' }) {
  const canvasRef = useRef(null);
  const imageDataRef = useRef(null);

  useEffect(() => {
    if (!imageDataRef.current) {
      imageDataRef.current = generateMaterialIcon(material);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = imageDataRef.current;
  }, [material, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`material-icon ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
