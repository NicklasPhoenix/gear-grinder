import React from 'react';
import { BOSS_STONES } from '../data/items';

// Gem icon numbers for each material type
const GEM_ICONS = {
    gold: 25,           // Gold/yellow gem
    enhanceStone: 1,    // Blue gem
    blessedOrb: 13,     // Purple gem
    celestialShard: 37, // Yellow/gold gem
    prestigeStone: 45,  // Pink gem
};

// Generic gem icon component using asset images
// If className includes width/height (w-*, h-*), those will be used for sizing
// Otherwise falls back to the size prop
function GemIcon({ iconNum, size = 16, className = '' }) {
    const hasClassSize = className.includes('w-') || className.includes('h-');
    return (
        <img
            src={`/assets/gems/Icon${iconNum}.png`}
            alt=""
            width={hasClassSize ? undefined : size}
            height={hasClassSize ? undefined : size}
            className={className}
            style={{ imageRendering: 'pixelated' }}
        />
    );
}

export function MaterialIcon({ type, size = 16, className = '' }) {
    const iconNum = GEM_ICONS[type];
    if (!iconNum) return null;
    return <GemIcon iconNum={iconNum} size={size} className={className} />;
}

export function BossStoneIcon({ bossSet, size = 16, className = '' }) {
    const stoneInfo = BOSS_STONES[bossSet];
    if (!stoneInfo) return null;
    return <GemIcon iconNum={stoneInfo.gemIcon} size={size} className={className} />;
}

export default { MaterialIcon, BossStoneIcon };
