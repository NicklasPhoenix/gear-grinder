import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ASSET_BASE, ENEMY_SPRITES, SPRITE_CONFIG, ZONE_BACKGROUNDS } from '../../assets/gameAssets';
import { getZoneById } from '../data/zones';
import { audioManager } from '../systems/AudioManager';

// Animated sprite configurations (frame-by-frame animation)
// Note: These sprites are 128x128 (knight) and 256x256 (lizard) pixels
// Original DawnLike sprites were 16x16, so scale accordingly
const ANIMATED_SPRITES = {
    // Player character - Knight (128x128 sprite)
    player: {
        basePath: '/assets/characters/knight',
        animations: {
            idle: { frames: 12, prefix: 'idle', fps: 10 },
            attack: { frames: 4, prefix: 'attack', fps: 12, indices: [0, 1, 2, 4] },
            hurt: { frames: 2, prefix: 'hurt', fps: 8 },
        },
        scale: 0.8,  // 128px * 0.8 = ~100px (similar to old 16px * 6)
        anchorY: 1,
        flipX: true,  // Knight sprite faces left, flip to face right
    },
    // Zone 0 enemy - Lizard warrior (256x256 sprite)
    lizard: {
        basePath: '/assets/monsters/lizard',
        animations: {
            idle: { frames: 3, prefix: 'Idle', fps: 6 },
            attack: { frames: 5, prefix: 'Attack', fps: 10 },
            hurt: { frames: 2, prefix: 'Hurt', fps: 8 },
            death: { frames: 6, prefix: 'Death', fps: 8 },
        },
        scale: 0.35,  // 256px * 0.35 = ~90px (similar to old 16px * 5)
        anchorY: 0.9,
        flipX: false,  // Lizard faces right (toward player) by default
    },
};

// Zones that use animated sprites (zone ID -> sprite key)
const ANIMATED_ZONE_SPRITES = {
    0: 'lizard',
};

// Direct zone ID to monster sprite mapping (descriptive names)
const ZONE_MONSTER_SPRITES = {
  // Forest region - zones 0-3 (zone 0 now uses animated lizard)
  0: 'lizard', 1: 'spider_dark', 2: 'mushroom', 3: 'ape',
  // Swamp region - zones 5-8
  5: 'flower_blue', 6: 'imp', 7: 'pumpkin', 8: 'beetle_orange',
  // Undead region - zones 10-13
  10: 'frog', 11: 'flower_pink', 12: 'crystal_ice', 13: 'rose_skull',
  // Shadow region - zones 15-18
  15: 'spider_shadow', 16: 'spider_black', 17: 'crow', 18: 'bat_dark',
  // Ice region - zones 20-23
  20: 'golem_ice', 21: 'slime_yellow', 22: 'slime_face', 23: 'slime_blob',
  // Fire region - zones 25-28
  25: 'mantis', 26: 'golem_stone', 27: 'owl', 28: 'hornet',
  // Celestial region - zones 30-33
  30: 'slime_green', 31: 'slime_arms', 32: 'wolf', 33: 'bat_purple',
  // Chaos region - zones 35-38
  35: 'hellhound', 36: 'dwarf', 37: 'pumpkin_evil', 38: 'bear',
  // Prestige zones
  40: 'cockatrice', 42: 'toad', 44: 'shaman',
};

// Boss zone ID to boss sprite mapping (descriptive names)
const ZONE_BOSS_SPRITES = {
  4: 'crow_demon', 9: 'cerberus', 14: 'demon_lord', 19: 'spider_eye', 24: 'shadow_wolf',
  29: 'eye_spider', 34: 'horned_beast', 39: 'dark_wolf', 41: 'eye_tyrant', 43: 'fire_fox', 45: 'scorpion_king',
};

// Cache for loaded monster textures
const monsterTextureCache = {};

// Cache for animated sprite textures
const animatedTextureCache = {};

/**
 * Load all frames for an animated sprite
 * @param {string} spriteKey - Key from ANIMATED_SPRITES
 * @returns {Promise<Object>} Object with animation name -> texture array
 */
async function loadAnimatedSpriteTextures(spriteKey) {
    if (animatedTextureCache[spriteKey]) {
        return animatedTextureCache[spriteKey];
    }

    const config = ANIMATED_SPRITES[spriteKey];
    if (!config) return null;

    const animations = {};

    for (const [animName, animConfig] of Object.entries(config.animations)) {
        const textures = [];
        const indices = animConfig.indices || Array.from({ length: animConfig.frames }, (_, i) => i + 1);

        for (const idx of indices) {
            const path = `${config.basePath}/${animName.toLowerCase()}/${animConfig.prefix}${idx}.png`;
            try {
                let texture;
                if (PIXI.Assets.cache.has(path)) {
                    texture = PIXI.Assets.cache.get(path);
                } else {
                    texture = await PIXI.Assets.load(path);
                }
                textures.push(texture);
            } catch (e) {
                console.warn(`Failed to load animation frame: ${path}`, e);
            }
        }

        if (textures.length > 0) {
            animations[animName] = {
                textures,
                fps: animConfig.fps || 10,
            };
        }
    }

    animatedTextureCache[spriteKey] = animations;
    return animations;
}

/**
 * Create an animated sprite controller
 */
function createAnimatedSpriteController(animations, defaultAnim = 'idle') {
    return {
        animations,
        currentAnim: defaultAnim,
        frameIndex: 0,
        frameTimer: 0,
        playing: true,
        loop: true,
        onComplete: null,

        update(delta) {
            if (!this.playing || !this.animations[this.currentAnim]) return null;

            const anim = this.animations[this.currentAnim];
            this.frameTimer += delta;

            const frameTime = 1000 / anim.fps;
            if (this.frameTimer >= frameTime) {
                this.frameTimer -= frameTime;
                this.frameIndex++;

                if (this.frameIndex >= anim.textures.length) {
                    if (this.loop) {
                        this.frameIndex = 0;
                    } else {
                        this.frameIndex = anim.textures.length - 1;
                        this.playing = false;
                        if (this.onComplete) this.onComplete();
                    }
                }
                return anim.textures[this.frameIndex];
            }
            return null;
        },

        getCurrentTexture() {
            const anim = this.animations[this.currentAnim];
            if (!anim) return null;
            return anim.textures[this.frameIndex] || anim.textures[0];
        },

        play(animName, loop = true, onComplete = null) {
            if (this.currentAnim !== animName || !this.playing) {
                this.currentAnim = animName;
                this.frameIndex = 0;
                this.frameTimer = 0;
                this.loop = loop;
                this.playing = true;
                this.onComplete = onComplete;
                return this.getCurrentTexture();
            }
            return null;
        },
    };
}

// Particle class for ambient effects
class Particle {
    constructor(x, y, color, size, speedX, speedY, life, gravity = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
        this.life = life;
        this.maxLife = life;
        this.gravity = gravity;
        this.alpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life--;
        this.alpha = Math.max(0, this.life / this.maxLife);
        return this.life > 0;
    }
}

// Graphics object pool to prevent memory leaks from constant create/destroy
class GraphicsPool {
    constructor(maxSize = 100) {
        this.pool = [];
        this.maxSize = maxSize;
    }

    acquire() {
        if (this.pool.length > 0) {
            const g = this.pool.pop();
            g.clear();
            g.visible = true;
            return g;
        }
        return new PIXI.Graphics();
    }

    release(graphics) {
        if (!graphics || graphics.destroyed) return;
        graphics.visible = false;
        graphics.clear();
        if (this.pool.length < this.maxSize) {
            this.pool.push(graphics);
        } else {
            graphics.destroy();
        }
    }

    destroy() {
        for (const g of this.pool) {
            if (!g.destroyed) g.destroy();
        }
        this.pool = [];
    }
}

export default function GameRenderer() {
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const { gameManager, state } = useGame();
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 10, status: 'Initializing...' });

    // Resize handler refs
    const resizeObserverRef = useRef(null);
    const uiContainerRef = useRef(null);
    const mainContainerRef = useRef(null);
    const groundRef = useRef(null);
    const gridLinesRef = useRef(null);

    // Entities refs for updating
    const playerRef = useRef(null);
    const enemyRef = useRef(null);
    const playerHpBarRef = useRef(null);
    const enemyHpBarRef = useRef(null);

    const effectsContainerRef = useRef(null);
    const bgContainerRef = useRef(null);
    const particleContainerRef = useRef(null);
    const gameContainerRef = useRef(null);
    const spriteSheetRef = useRef(null);

    // Particle system
    const particlesRef = useRef([]);
    const ambientParticlesRef = useRef([]);
    const graphicsPoolRef = useRef(new GraphicsPool(100));
    const activeGraphicsRef = useRef([]);

    // Animation state
    const animStateRef = useRef({
        playerAttackCooldown: 0,
        enemyAttackCooldown: 0,
        enemyHitFlash: 0,
        playerHitFlash: 0,
        screenShake: { x: 0, y: 0, intensity: 0 },
        lastZone: -1,
        enemyDying: false,
        enemyDeathProgress: 0,
        enemySpawning: false,
        enemySpawnProgress: 0,
    });

    // Store calculated positions for access across the component
    const positionsRef = useRef({
        playerX: 200,
        enemyX: 600,
        characterY: 350,
        centerX: 400,
        groundY: 380,
        canvasWidth: 800,
        canvasHeight: 450,
        scaleFactor: 1,
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const app = new PIXI.Application();

        const init = async () => {
            // Get container dimensions for full-size canvas
            const containerWidth = containerRef.current.clientWidth || 800;
            const containerHeight = containerRef.current.clientHeight || 600;

            await app.init({
                width: containerWidth,
                height: containerHeight,
                backgroundColor: 0x0a0a0f,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
                resizeTo: containerRef.current,
            });

            if (!containerRef.current) return;
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Store dimensions for positioning calculations
            const canvasWidth = containerWidth;
            const canvasHeight = containerHeight;
            const centerX = canvasWidth / 2;
            // Scale factor for mobile (smaller canvas = smaller elements)
            const scaleFactor = Math.min(1, canvasHeight / 400);
            // Scale ground position relative to canvas height
            // On mobile (small canvas): use 75% of height
            // On desktop (large canvas): keep 160px from bottom for HP bars + padding
            const groundY = scaleFactor < 1
                ? canvasHeight * 0.75
                : canvasHeight - 160;

            // Main container with shake support
            const mainContainer = new PIXI.Container();
            app.stage.addChild(mainContainer);

            // Containers
            const bgContainer = new PIXI.Container();
            const particleContainer = new PIXI.Container();
            const gameContainer = new PIXI.Container();
            const uiContainer = new PIXI.Container();
            const fxContainer = new PIXI.Container();

            mainContainer.addChild(bgContainer);
            mainContainer.addChild(particleContainer);
            mainContainer.addChild(gameContainer);
            mainContainer.addChild(uiContainer);
            mainContainer.addChild(fxContainer);

            effectsContainerRef.current = fxContainer;
            bgContainerRef.current = bgContainer;
            particleContainerRef.current = particleContainer;
            gameContainerRef.current = gameContainer;
            uiContainerRef.current = uiContainer;

            // Calculate positions based on canvas size (scale for mobile)
            // Use 35% from center for characters to spread them across the screen
            // Player on left side, enemy on right side (will be behind menu when expanded)
            const charSpacing = Math.min(350, canvasWidth * 0.35);
            const playerX = centerX - charSpacing;
            const enemyX = centerX + charSpacing;
            const characterY = Math.min(groundY - 55, canvasHeight * 0.5); // Position at ~50% height

            // Store in ref for access throughout component
            positionsRef.current = {
                playerX,
                enemyX,
                characterY,
                centerX,
                groundY,
                canvasWidth,
                canvasHeight,
                scaleFactor,
            };

            // --- Load all character sprite sheets with progress tracking ---
            const spriteSheets = {};
            const sheetNames = ['player', 'humanoid', 'demon', 'undead', 'beast', 'reptile', 'elemental', 'avian', 'misc'];
            const totalAssets = sheetNames.length + 2; // +2 for background and monster

            // Calculate total assets: sprite sheets + monster sprites + boss sprites
            const monsterSpriteNames = Object.values(ZONE_MONSTER_SPRITES);
            const bossSpriteNames = Object.values(ZONE_BOSS_SPRITES);
            const uniqueMonsters = [...new Set(monsterSpriteNames)];
            const uniqueBosses = [...new Set(bossSpriteNames)];
            const totalAssetsFinal = sheetNames.length + uniqueMonsters.length + uniqueBosses.length + 1; // +1 for background

            setLoadingProgress({ loaded: 0, total: totalAssetsFinal, status: 'Loading sprite sheets...' });

            let loadedCount = 0;

            for (let i = 0; i < sheetNames.length; i++) {
                const sheetName = sheetNames[i];
                const assetPath = ASSET_BASE[sheetName];
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading ${sheetName}...` });
                    // Check if already cached to avoid duplicate key warnings
                    let sheet;
                    if (PIXI.Assets.cache.has(assetPath)) {
                        sheet = PIXI.Assets.cache.get(assetPath);
                    } else {
                        sheet = await PIXI.Assets.load(assetPath);
                    }
                    sheet.source.scaleMode = 'nearest';
                    spriteSheets[sheetName] = sheet;
                    loadedCount++;
                } catch (e) {
                    console.warn(`Failed to load sprite sheet: ${sheetName}`, e);
                    loadedCount++;
                }
            }
            spriteSheetRef.current = spriteSheets;

            // Pre-load ALL monster sprites to prevent loading delays during gameplay
            setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: 'Loading monsters...' });
            for (const spriteName of uniqueMonsters) {
                const spritePath = `/assets/monsters/${spriteName}.png`;
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading ${spriteName}...` });
                    // Check if already cached to avoid duplicate key warnings
                    let texture;
                    if (PIXI.Assets.cache.has(spritePath)) {
                        texture = PIXI.Assets.cache.get(spritePath);
                    } else {
                        texture = await PIXI.Assets.load(spritePath);
                    }
                    texture.source.scaleMode = 'nearest';
                    monsterTextureCache[spritePath] = texture;
                    loadedCount++;
                } catch (e) {
                    console.warn(`Failed to preload monster sprite: ${spritePath}`, e);
                    loadedCount++;
                }
            }

            // Pre-load ALL boss sprites
            setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: 'Loading bosses...' });
            for (const spriteName of uniqueBosses) {
                const spritePath = `/assets/bosses/${spriteName}.png`;
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading ${spriteName}...` });
                    // Check if already cached to avoid duplicate key warnings
                    let texture;
                    if (PIXI.Assets.cache.has(spritePath)) {
                        texture = PIXI.Assets.cache.get(spritePath);
                    } else {
                        texture = await PIXI.Assets.load(spritePath);
                    }
                    texture.source.scaleMode = 'nearest';
                    monsterTextureCache[spritePath] = texture;
                    loadedCount++;
                } catch (e) {
                    console.warn(`Failed to preload boss sprite: ${spritePath}`, e);
                    loadedCount++;
                }
            }

            setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: 'Creating environment...' });

            // --- Helper to get sprite texture from the appropriate sheet ---
            const getSpriteTexture = (spriteData) => {
                const sheetName = spriteData.sheet || 'player';
                const sheet = spriteSheets[sheetName];
                if (!sheet) return null;

                const { tileSize } = SPRITE_CONFIG;
                const frame = new PIXI.Rectangle(
                    spriteData.col * tileSize,
                    spriteData.row * tileSize,
                    tileSize,
                    tileSize
                );
                return new PIXI.Texture({ source: sheet.source, frame });
            };

            // --- Create animated background ---
            const initialZoneId = state?.currentZone || 0;
            createBackground(bgContainer, canvasWidth, canvasHeight, initialZoneId);

            // --- Ground/Floor ---
            const ground = new PIXI.Graphics();
            ground.rect(0, groundY, canvasWidth, 70);
            ground.fill({ color: 0x1a1a2e });
            ground.rect(0, groundY - 2, canvasWidth, 4);
            ground.fill({ color: 0x2a2a4e });
            bgContainer.addChild(ground);

            // Grid lines on ground for depth
            const gridLines = new PIXI.Graphics();
            gridLines.setStrokeStyle({ width: 1, color: 0x2a2a4e, alpha: 0.3 });
            for (let i = 0; i < Math.ceil(canvasWidth / 50) + 5; i++) {
                const x = i * 50 - 100;
                gridLines.moveTo(x, groundY);
                gridLines.lineTo(x + 200, canvasHeight);
                gridLines.stroke();
            }
            bgContainer.addChild(gridLines);

            // --- Create Player (Hero) using animated sprite ---
            const playerAnimConfig = ANIMATED_SPRITES.player;
            const playerAnims = await loadAnimatedSpriteTextures('player');

            let player;
            let playerAnimController = null;
            // Scale for animated sprites (0.8 base) vs old DawnLike (4 * 1.5 = 6)
            const playerScale = (playerAnimConfig?.scale || 0.8) * scaleFactor;

            if (playerAnims && playerAnims.idle) {
                // Use animated sprite
                player = new PIXI.Sprite(playerAnims.idle.textures[0]);
                playerAnimController = createAnimatedSpriteController(playerAnims, 'idle');
                player.animController = playerAnimController;
            } else {
                // Fallback to static sprite
                const playerData = ENEMY_SPRITES['Knight'];
                const playerTexture = getSpriteTexture(playerData);
                player = playerTexture
                    ? new PIXI.Sprite(playerTexture)
                    : new PIXI.Graphics().rect(-8, -8, 16, 16).fill(0x3b82f6);
            }

            player.anchor.set(0.5, playerAnimConfig?.anchorY || 1);
            player.x = playerX;
            player.y = characterY;
            // Flip X if needed to face right (toward enemy)
            const playerFlipX = playerAnimConfig?.flipX ? -1 : 1;
            player.scale.set(playerScale * playerFlipX, playerScale);
            gameContainer.addChild(player);
            playerRef.current = player;
            player.baseX = playerX;
            player.baseY = characterY;
            player.baseScale = playerScale;
            player.flipX = playerFlipX;

            // --- Player Shadow (scaled for mobile) ---
            const playerShadow = new PIXI.Graphics();
            playerShadow.ellipse(playerX, groundY - 2, 35 * scaleFactor, 12 * scaleFactor);
            playerShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(playerShadow, 0);

            // --- Player glow effect (scaled for mobile) ---
            const playerGlow = new PIXI.Graphics();
            playerGlow.circle(playerX, characterY - 40 * scaleFactor, 60 * scaleFactor);
            playerGlow.fill({ color: 0x3b82f6, alpha: 0.1 });
            gameContainer.addChildAt(playerGlow, 0);

            // --- Create Enemy using NEW sprite PNGs (with animation support) ---
            const initialZone = getZoneById(gameManager.getState()?.currentZone || 0);
            const animatedSpriteKey = ANIMATED_ZONE_SPRITES[initialZone.id];

            let enemy;
            let enemyAnimController = null;
            const enemyBaseScale = 5 * scaleFactor;

            if (animatedSpriteKey && !initialZone.isBoss) {
                // Load animated sprite for this zone
                const enemyAnims = await loadAnimatedSpriteTextures(animatedSpriteKey);
                const animConfig = ANIMATED_SPRITES[animatedSpriteKey];

                if (enemyAnims && enemyAnims.idle) {
                    enemy = new PIXI.Sprite(enemyAnims.idle.textures[0]);
                    enemyAnimController = createAnimatedSpriteController(enemyAnims, 'idle');
                    enemy.animController = enemyAnimController;
                    enemy.animatedSpriteKey = animatedSpriteKey;
                    const scale = (animConfig?.scale || 0.35) * scaleFactor;
                    enemy.anchor.set(0.5, animConfig?.anchorY || 1);
                    // Flip X if needed to face player (left)
                    const flipX = animConfig?.flipX ? 1 : -1;
                    enemy.scale.set(scale * flipX, scale);
                    enemy.baseScale = scale;
                    enemy.flipX = flipX;
                } else {
                    // Fallback to static
                    enemy = new PIXI.Sprite(PIXI.Texture.WHITE);
                    enemy.anchor.set(0.5, 1);
                    enemy.scale.set(-enemyBaseScale, enemyBaseScale);
                    enemy.baseScale = enemyBaseScale;
                }
            } else {
                // Static sprite enemy
                enemy = new PIXI.Sprite(PIXI.Texture.WHITE);
                enemy.anchor.set(0.5, 1);
                enemy.scale.set(-enemyBaseScale, enemyBaseScale);
                enemy.baseScale = enemyBaseScale;

                // Load static sprite
                const initialSpriteName = initialZone.isBoss
                    ? (ZONE_BOSS_SPRITES[initialZone.id] || 'crow_demon')
                    : (ZONE_MONSTER_SPRITES[initialZone.id] || 'spider_red');
                const initialSpritePath = initialZone.isBoss
                    ? `/assets/bosses/${initialSpriteName}.png`
                    : `/assets/monsters/${initialSpriteName}.png`;

                if (monsterTextureCache[initialSpritePath]) {
                    enemy.texture = monsterTextureCache[initialSpritePath];
                }
            }

            enemy.x = enemyX;
            enemy.y = characterY;
            gameContainer.addChild(enemy);
            enemyRef.current = enemy;
            enemy.baseX = enemyX;
            enemy.baseY = characterY;
            enemy.scaleFactor = scaleFactor;

            // --- Enemy Shadow (scaled for mobile) ---
            const enemyShadow = new PIXI.Graphics();
            enemyShadow.ellipse(enemyX, groundY - 2, 35 * scaleFactor, 12 * scaleFactor);
            enemyShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(enemyShadow, 0);

            // --- Enemy aura for bosses (scaled for mobile) ---
            const enemyAura = new PIXI.Graphics();
            enemyAura.circle(enemyX, characterY - 40 * scaleFactor, 80 * scaleFactor);
            enemyAura.fill({ color: 0xef4444, alpha: 0 });
            gameContainer.addChildAt(enemyAura, 0);
            enemy.aura = enemyAura;
            enemy.shadow = enemyShadow;
            enemy.shadowX = enemyX;
            enemy.auraX = enemyX;
            enemy.auraY = characterY - 25;

            // Store shadow ref
            player.shadow = playerShadow;
            player.glow = playerGlow;

            // --- HP Bars (Modern style with text display) - scales for mobile ---
            const createHpBar = (x, y, width, isPlayer, scale = 1) => {
                const container = new PIXI.Container();
                container.position.set(x, y);

                // Scaled heights
                const barHeight = Math.round(36 * scale);
                const frameHeight = Math.round(54 * scale);
                const halfFrame = Math.round(27 * scale);
                const halfBar = Math.round(18 * scale);

                // Outer frame - simple rect for reliability
                const frame = new PIXI.Graphics();
                frame.rect(-width/2 - 4, -halfFrame, width + 8, frameHeight);
                frame.fill({ color: 0x000000, alpha: 0.7 });
                frame.rect(-width/2 - 4, -halfFrame, width + 8, frameHeight);
                frame.stroke({ width: Math.max(1, 3 * scale), color: isPlayer ? 0x3b82f6 : 0xef4444, alpha: 0.8 });
                container.addChild(frame);

                // Background
                const bg = new PIXI.Graphics();
                bg.rect(-width/2, -halfBar, width, barHeight);
                bg.fill(0x1f2937);
                container.addChild(bg);

                // Fill - draw initial full bar
                const fill = new PIXI.Graphics();
                fill.rect(-width/2, -halfBar, width, barHeight);
                fill.fill(isPlayer ? 0x3b82f6 : 0xef4444);
                container.addChild(fill);
                container.fillRef = fill;
                container.barWidth = width;
                container.barHeight = barHeight;
                container.halfBar = halfBar;
                container.isPlayer = isPlayer;
                container.barScale = scale;

                // HP Text overlay (shows current/max) - scaled font
                const hpTextStyle = new PIXI.TextStyle({
                    fontFamily: 'Rajdhani',
                    fontSize: Math.max(10, Math.round(20 * scale)),
                    fontWeight: 'bold',
                    fill: '#ffffff',
                });
                const hpText = new PIXI.Text({ text: '100/100', style: hpTextStyle });
                hpText.anchor.set(0.5);
                hpText.y = 0;
                container.addChild(hpText);
                container.hpText = hpText;

                // Label - scaled font (hide on very small screens)
                if (scale > 0.5) {
                    const labelStyle = new PIXI.TextStyle({
                        fontFamily: 'Rajdhani',
                        fontSize: Math.max(8, Math.round(14 * scale)),
                        fontWeight: 'bold',
                        fill: isPlayer ? '#60a5fa' : '#f87171',
                    });
                    const label = new PIXI.Text({ text: isPlayer ? 'HERO' : 'ENEMY', style: labelStyle });
                    label.anchor.set(0.5);
                    label.y = Math.round(-38 * scale);
                    container.addChild(label);
                    container.label = label;
                }

                return container;
            };

            // Scale HP bars for mobile (smaller on smaller screens)
            const hpBarWidth = Math.min(180, canvasWidth * 0.22);
            const hpBarY = Math.min(groundY + 40, canvasHeight - 30);
            const playerBar = createHpBar(playerX, hpBarY, hpBarWidth, true, scaleFactor);
            const enemyBar = createHpBar(enemyX, hpBarY, hpBarWidth, false, scaleFactor);
            uiContainer.addChild(playerBar);
            uiContainer.addChild(enemyBar);
            playerHpBarRef.current = playerBar;
            enemyHpBarRef.current = enemyBar;

            // Set initialized and force an HP bar update after a short delay
            setIsInitialized(true);

            // Force update HP bars after PIXI has rendered at least one frame
            setTimeout(() => {
                const gmState = gameManager.getState();
                if (gmState && playerHpBarRef.current && enemyHpBarRef.current) {
                    updateHpBar(playerHpBarRef.current, gmState.playerHp || 100, gmState.playerMaxHp || 100, true);
                    updateHpBar(enemyHpBarRef.current, gmState.enemyHp || 20, gmState.enemyMaxHp || 20, false);
                }
            }, 100);

            // --- Zone name display (hide on mobile - shown in MobileCombatView header) ---
            if (scaleFactor >= 0.8) {
                const zoneStyle = new PIXI.TextStyle({
                    fontFamily: 'Press Start 2P',
                    fontSize: 12,
                    fill: '#fbbf24',
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    dropShadowDistance: 2,
                });
                const zoneText = new PIXI.Text({ text: 'Forest Clearing', style: zoneStyle });
                zoneText.anchor.set(0.5, 0);
                zoneText.x = centerX;
                zoneText.y = 15;
                uiContainer.addChild(zoneText);
                uiContainer.zoneText = zoneText;

                // Endless Mode Wave Counter - center top, below zone name
                const waveStyle = new PIXI.TextStyle({
                    fontFamily: 'Press Start 2P',
                    fontSize: Math.round(40 * scaleFactor),
                    fontWeight: 'bold',
                    fill: '#4ade80',
                    stroke: { color: '#000000', width: Math.max(4, 10 * scaleFactor) },
                    dropShadow: {
                        color: '#000000',
                        distance: Math.max(3, 5 * scaleFactor),
                        blur: Math.max(3, 6 * scaleFactor),
                        alpha: 1,
                    },
                });
                const waveText = new PIXI.Text({ text: '', style: waveStyle });
                waveText.anchor.set(0.5, 0); // Anchor center-top
                waveText.x = centerX;
                waveText.y = 150 * scaleFactor; // Well below the HTML overlay
                waveText.visible = false;
                uiContainer.addChild(waveText);
                uiContainer.waveText = waveText;
            }

            // --- Animation Loop ---
            app.ticker.add((ticker) => {
                const time = ticker.lastTime;
                const delta = ticker.deltaTime;
                const animState = animStateRef.current;

                // Screen shake
                if (animState.screenShake.intensity > 0) {
                    mainContainer.x = (Math.random() - 0.5) * animState.screenShake.intensity;
                    mainContainer.y = (Math.random() - 0.5) * animState.screenShake.intensity;
                    animState.screenShake.intensity *= 0.9;
                    if (animState.screenShake.intensity < 0.5) {
                        animState.screenShake.intensity = 0;
                        mainContainer.x = 0;
                        mainContainer.y = 0;
                    }
                }

                // Player animation (animated sprite or fallback)
                if (playerRef.current) {
                    const pos = positionsRef.current;
                    const playerBaseScale = playerRef.current.baseScale || (ANIMATED_SPRITES.player?.scale || 4) * (pos.scaleFactor || 1);

                    // Update animated sprite frames
                    if (playerRef.current.animController) {
                        const newTexture = playerRef.current.animController.update(delta * 16.67); // Convert to ms
                        if (newTexture) {
                            playerRef.current.texture = newTexture;
                        }

                        // Switch to attack animation when attacking
                        if (animState.playerAttackCooldown > 0) {
                            playerRef.current.animController.play('attack', false, () => {
                                playerRef.current.animController.play('idle');
                            });
                        }
                    }

                    // Position animation (bob + attack lunge)
                    const bob = Math.sin(time * 0.003) * 3 * (pos.scaleFactor || 1);
                    playerRef.current.y = (playerRef.current.baseY || pos.characterY) - 25 * (pos.scaleFactor || 1) + bob;

                    // Attack cooldown movement
                    if (animState.playerAttackCooldown > 0) {
                        animState.playerAttackCooldown -= delta;
                        const progress = animState.playerAttackCooldown / 15;
                        playerRef.current.x = (playerRef.current.baseX || pos.playerX) + Math.sin(progress * Math.PI) * 50;
                    } else {
                        playerRef.current.x = playerRef.current.baseX || pos.playerX;
                    }
                }

                // Enemy idle animation
                // Enemy faces left (positive X scale) - toward the player
                if (enemyRef.current) {
                    // Use stored base scale (not current scale which changes during animations)
                    const enemyBaseScale = enemyRef.current.baseScale || 5;

                    // Death animation - dramatic knockback and fall (~1.2 seconds)
                    if (animState.enemyDying) {
                        animState.enemyDeathProgress += delta * 0.015; // Slow death to fill respawn delay
                        const progress = Math.min(1, animState.enemyDeathProgress);
                        const pos = positionsRef.current;
                        const baseX = enemyRef.current.baseX || pos.enemyX;
                        const baseY = enemyRef.current.baseY || pos.characterY;

                        // Knockback away from player + fall down
                        const knockbackDist = 80 * (pos.scaleFactor || 1);
                        const fallDist = 60 * (pos.scaleFactor || 1);
                        enemyRef.current.x = baseX + progress * knockbackDist;
                        enemyRef.current.y = baseY - 25 * (pos.scaleFactor || 1) + progress * fallDist;

                        // Rotate as if falling backwards
                        enemyRef.current.rotation = progress * 1.2; // ~70 degrees rotation

                        // Shrink and fade
                        const deathScale = enemyBaseScale * (1 - progress * 0.6);
                        enemyRef.current.scale.set(-deathScale, deathScale);

                        // Flash white then fade to red
                        if (progress < 0.2) {
                            enemyRef.current.tint = 0xffffff;
                            enemyRef.current.alpha = 1;
                        } else {
                            enemyRef.current.tint = 0xff4444;
                            enemyRef.current.alpha = 1 - ((progress - 0.2) / 0.8);
                            // Fade shadow and aura with enemy
                            if (enemyRef.current.shadow) {
                                enemyRef.current.shadow.alpha = 1 - ((progress - 0.2) / 0.8);
                            }
                            if (enemyRef.current.aura) {
                                enemyRef.current.aura.alpha = 0;
                            }
                        }

                        // When death completes, wait for respawn timer
                        if (progress >= 1) {
                            animState.enemyDying = false;
                            animState.enemyDeathProgress = 0;
                            animState.waitingForRespawn = true;
                            enemyRef.current.alpha = 0; // Hide completely
                            enemyRef.current.rotation = 0;
                            // Reset position for spawn
                            enemyRef.current.x = baseX;
                            enemyRef.current.y = baseY - 25 * (pos.scaleFactor || 1);
                        }
                    }
                    // Waiting for respawn timer - enemy stays hidden
                    else if (animState.waitingForRespawn) {
                        enemyRef.current.alpha = 0;
                        // Hide shadow and aura too
                        if (enemyRef.current.shadow) {
                            enemyRef.current.shadow.alpha = 0;
                        }
                        if (enemyRef.current.aura) {
                            enemyRef.current.aura.alpha = 0;
                        }
                        // Check if respawn timer completed (enemy HP restored)
                        const respawnTimer = state.combatState?.enemyRespawnTimer || 0;
                        if (respawnTimer === 0 && state.enemyHp > 0) {
                            animState.waitingForRespawn = false;
                            animState.enemySpawning = true;
                            animState.enemySpawnProgress = 0;
                            // Restore shadow and aura visibility
                            if (enemyRef.current.shadow) {
                                enemyRef.current.shadow.alpha = 1;
                            }
                            if (enemyRef.current.aura) {
                                enemyRef.current.aura.alpha = 1;
                            }
                        }
                    }
                    // Spawn animation - slide in from right (~0.6 seconds)
                    else if (animState.enemySpawning) {
                        animState.enemySpawnProgress += delta * 0.028; // Slower spawn for smoother feel
                        const progress = Math.min(1, animState.enemySpawnProgress);
                        const pos = positionsRef.current;
                        const baseX = enemyRef.current.baseX || pos.enemyX;
                        const flipX = enemyRef.current.flipX || -1;

                        // Slide in from right side
                        const slideOffset = (1 - progress) * 100 * (pos.scaleFactor || 1);
                        enemyRef.current.x = baseX + slideOffset;

                        // Scale up with slight bounce
                        const bounce = progress < 0.7 ? progress / 0.7 : 1 + Math.sin((progress - 0.7) / 0.3 * Math.PI) * 0.1;
                        const spawnScale = enemyBaseScale * Math.min(1, bounce);
                        enemyRef.current.scale.set(spawnScale * flipX, spawnScale);
                        enemyRef.current.alpha = Math.min(1, progress * 2); // Fade in quickly
                        enemyRef.current.tint = 0xffffff;

                        if (progress >= 1) {
                            animState.enemySpawning = false;
                            animState.enemySpawnProgress = 0;
                            enemyRef.current.scale.set(enemyBaseScale * flipX, enemyBaseScale);
                            enemyRef.current.alpha = 1;
                            enemyRef.current.x = baseX;
                        }
                    }
                    // Normal idle
                    else {
                        const pos = positionsRef.current;

                        // Update animated sprite frames if available
                        if (enemyRef.current.animController) {
                            const newTexture = enemyRef.current.animController.update(delta * 16.67);
                            if (newTexture) {
                                enemyRef.current.texture = newTexture;
                            }
                        }

                        const breathe = Math.sin(time * 0.0025 + 1) * 0.02;
                        const bob = Math.sin(time * 0.004 + 1) * 4 * (pos.scaleFactor || 1);
                        const flipX = enemyRef.current.flipX || -1;
                        enemyRef.current.scale.set(enemyBaseScale * flipX, enemyBaseScale * (1.0 + breathe));
                        enemyRef.current.y = (enemyRef.current.baseY || pos.characterY) - 25 * (pos.scaleFactor || 1) + bob;
                        enemyRef.current.alpha = 1;
                        enemyRef.current.rotation = 0;

                        // Enemy attack animation - lunge towards player
                        if (animState.enemyAttackCooldown > 0) {
                            // Play attack animation for animated sprites (only at start)
                            if (enemyRef.current.animController && animState.enemyAttackCooldown > 14) {
                                enemyRef.current.animController.play('attack', false, () => {
                                    enemyRef.current.animController.play('idle');
                                });
                            }
                            animState.enemyAttackCooldown -= delta;
                            const progress = animState.enemyAttackCooldown / 15;
                            // Lunge towards player (negative X direction)
                            enemyRef.current.x = (enemyRef.current.baseX || pos.enemyX) - Math.sin(progress * Math.PI) * 40;
                            // Slight scale up during attack for impact
                            const attackScale = enemyBaseScale * (1.0 + Math.sin(progress * Math.PI) * 0.1);
                            enemyRef.current.scale.set(attackScale * flipX, attackScale);
                        } else {
                            enemyRef.current.x = enemyRef.current.baseX || pos.enemyX;
                        }

                        // Hit flash
                        if (animState.enemyHitFlash > 0) {
                            animState.enemyHitFlash -= delta;
                            enemyRef.current.tint = 0xff6666;
                        } else {
                            enemyRef.current.tint = 0xffffff;
                        }
                    }
                }

                // Player hit flash with recoil
                if (playerRef.current && animState.playerHitFlash > 0) {
                    animState.playerHitFlash -= delta;
                    const pos = positionsRef.current;
                    const baseX = playerRef.current.baseX || pos.playerX;

                    // Flash white first, then red
                    if (animState.playerHitFlash > 12) {
                        playerRef.current.tint = 0xffffff;
                    } else {
                        playerRef.current.tint = 0xff6666;
                    }

                    // Recoil backwards (away from enemy)
                    const recoilProgress = animState.playerHitFlash / 15;
                    const recoilDist = Math.sin(recoilProgress * Math.PI) * 25 * (pos.scaleFactor || 1);
                    playerRef.current.x = baseX - recoilDist;
                } else if (playerRef.current) {
                    playerRef.current.tint = 0xffffff;
                    // Reset position when not in hit animation
                    const pos = positionsRef.current;
                    if (animState.playerAttackCooldown <= 0) {
                        playerRef.current.x = playerRef.current.baseX || pos.playerX;
                    }
                }

                // Update particles
                updateParticles(particleContainer);

                // Spawn ambient particles (limit spawn rate and count)
                if (ambientParticlesRef.current.length < 20 && Math.random() < 0.01) {
                    spawnAmbientParticle();
                }

                // Update HP bars every frame from gameManager state
                const gmState = gameManager.getState();
                if (gmState && playerHpBarRef.current) {
                    // Use typeof checks - don't use || which treats 0 as falsy
                    const playerHp = typeof gmState.playerHp === 'number' && !isNaN(gmState.playerHp)
                        ? gmState.playerHp
                        : gmState.playerMaxHp;
                    const playerMaxHp = typeof gmState.playerMaxHp === 'number' && !isNaN(gmState.playerMaxHp)
                        ? gmState.playerMaxHp
                        : 100;
                    updateHpBar(playerHpBarRef.current, playerHp, playerMaxHp, true);
                }
                if (gmState && enemyHpBarRef.current) {
                    const enemyHp = typeof gmState.enemyHp === 'number' && !isNaN(gmState.enemyHp)
                        ? gmState.enemyHp
                        : gmState.enemyMaxHp;
                    const enemyMaxHp = typeof gmState.enemyMaxHp === 'number' && !isNaN(gmState.enemyMaxHp)
                        ? gmState.enemyMaxHp
                        : 20;
                    updateHpBar(enemyHpBarRef.current, enemyHp, enemyMaxHp, false);
                }

                // Update endless wave counter
                if (uiContainerRef.current?.waveText) {
                    const waveText = uiContainerRef.current.waveText;
                    if (gmState?.endlessActive && gmState.endlessWave > 0) {
                        waveText.text = `Wave ${gmState.endlessWave}`;
                        waveText.visible = true;
                    } else {
                        waveText.visible = false;
                    }
                }
            });
        };

        init();

        // Listen for effects
        const MAX_FLOATING_TEXT = 30; // Limit concurrent floating texts to prevent spam
        const cleanupText = gameManager.on('floatingText', (data) => {
            if (!appRef.current || !effectsContainerRef.current) return;
            // Limit floating text count to prevent memory issues at high attack speeds
            if (effectsContainerRef.current.children.length >= MAX_FLOATING_TEXT) return;
            const pos = positionsRef.current;
            spawnFloatingText(appRef.current, effectsContainerRef.current, data, pos);

            // Audio SFX based on event type
            switch (data.type) {
                case 'playerDmg':
                    audioManager.playSfxHit();
                    break;
                case 'crit':
                    audioManager.playSfxCrit();
                    break;
                case 'enemyDmg':
                    audioManager.playSfxHit();
                    break;
                case 'heal':
                case 'killHeal':
                    audioManager.playSfxHeal();
                    break;
                case 'dodge':
                    audioManager.playSfxDodge();
                    break;
                case 'levelup':
                    audioManager.playSfxLevelUp();
                    break;
                case 'multiStrike':
                case 'execute':
                case 'retaliate':
                case 'ascendedCrit':
                case 'annihilate':
                case 'frenzy':
                case 'phantom':
                case 'vengeance':
                    audioManager.playSfxCrit();
                    break;
                case 'secondWind':
                case 'immunity':
                case 'overheal':
                    audioManager.playSfxHeal();
                    break;
            }

            // Note: Player attack animation is now triggered by 'playerAttack' event
            // Enemy hit flash on player damage types
            const playerAttackTypes = ['playerDmg', 'crit', 'ascendedCrit', 'annihilate', 'frenzy', 'multiStrike', 'vengeance', 'retaliate', 'phantom', 'thorns'];

            // Visual effects per attack type
            if (data.type === 'playerDmg') {
                animStateRef.current.enemyHitFlash = 8;
                animStateRef.current.screenShake.intensity = 6;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xffffff, 10);
            }
            if (data.type === 'crit') {
                animStateRef.current.enemyHitFlash = 8;
                animStateRef.current.screenShake.intensity = 12;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xfde047, 20);
            }
            if (data.type === 'multiStrike') {
                animStateRef.current.enemyHitFlash = 10;
                animStateRef.current.screenShake.intensity = 8;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0x8b5cf6, 15);
            }
            if (data.type === 'execute') {
                animStateRef.current.enemyHitFlash = 15;
                animStateRef.current.screenShake.intensity = 15;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xef4444, 25);
            }
            if (data.type === 'ascendedCrit') {
                animStateRef.current.enemyHitFlash = 20;
                animStateRef.current.screenShake.intensity = 18;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0x67e8f9, 35);
            }
            if (data.type === 'annihilate') {
                animStateRef.current.enemyHitFlash = 25;
                animStateRef.current.screenShake.intensity = 20;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xfb923c, 40);
            }
            if (data.type === 'frenzy') {
                animStateRef.current.enemyHitFlash = 12;
                animStateRef.current.screenShake.intensity = 10;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xf97316, 25);
            }
            if (data.type === 'vengeance' || data.type === 'retaliate') {
                animStateRef.current.enemyHitFlash = 10;
                animStateRef.current.screenShake.intensity = 8;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xdc2626, 15);
            }
            if (data.type === 'frenzy') {
                // Frenzy - purple rapid strikes
                animStateRef.current.enemyHitFlash = 12;
                animStateRef.current.screenShake.intensity = 10;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xc084fc, 25);
            }
            if (data.type === 'phantom') {
                // Phantom counter - purple ghost strike
                animStateRef.current.enemyHitFlash = 10;
                animStateRef.current.screenShake.intensity = 8;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xa78bfa, 20);
            }
            if (data.type === 'vengeance') {
                // Vengeance - red counter
                animStateRef.current.enemyHitFlash = 15;
                animStateRef.current.screenShake.intensity = 12;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xf43f5e, 30);
            }
            if (data.type === 'secondWind') {
                // Second Wind - healing burst on player
                spawnHitParticles(pos.playerX, pos.characterY - 55, 0x34d399, 25);
            }
            if (data.type === 'immunity') {
                // Immunity - golden shield effect
                spawnHitParticles(pos.playerX, pos.characterY - 55, 0xfcd34d, 15);
            }
            if (data.type === 'retaliate') {
                animStateRef.current.enemyHitFlash = 6;
                spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xeab308, 10);
            }
            if (data.type === 'enemyDmg') {
                // Player taking damage - make it very noticeable
                animStateRef.current.playerHitFlash = 15;
                animStateRef.current.screenShake.intensity = 12;
                animStateRef.current.enemyAttackCooldown = 15; // Enemy lunge animation
                // More particles, spread wider for impact feel
                spawnHitParticles(pos.playerX, pos.characterY - 55, 0xef4444, 20);
                spawnHitParticles(pos.playerX - 20, pos.characterY - 40, 0xff6666, 8);
                spawnHitParticles(pos.playerX + 20, pos.characterY - 70, 0xff6666, 8);
            }
            if (data.type === 'shield') {
                // Blue shield absorb effect - slightly more visible
                animStateRef.current.playerHitFlash = 6;
                animStateRef.current.enemyAttackCooldown = 15;
                spawnHitParticles(pos.playerX, pos.characterY - 55, 0x3b82f6, 15);
            }
        });

        // Listen for Loot
        const cleanupLoot = gameManager.on('lootDrop', ({ items }) => {
            if (!appRef.current || !effectsContainerRef.current) return;
            const pos = positionsRef.current;

            // Coin sound for loot
            audioManager.playSfxCoin();

            // Big loot explosion at enemy position
            spawnLootExplosion(pos.enemyX, pos.characterY - 55, 30);

            items.forEach((item, index) => {
                setTimeout(() => {
                    spawnLootText(appRef.current, effectsContainerRef.current, item, positionsRef.current);
                }, index * 150);
            });
        });

        // Listen for Enemy Death - trigger death animation
        const cleanupDeath = gameManager.on('enemyDeath', ({ isBoss }) => {
            const pos = positionsRef.current;
            animStateRef.current.enemyDying = true;
            animStateRef.current.enemyDeathProgress = 0;
            animStateRef.current.screenShake.intensity = isBoss ? 20 : 10;

            // Death SFX
            if (isBoss) {
                audioManager.playSfxBossDeath();
            } else {
                audioManager.playSfxEnemyDeath();
            }

            // Spawn death particles at enemy position
            spawnHitParticles(pos.enemyX, pos.characterY - 55, 0xff4444, isBoss ? 40 : 25);
        });

        // Listen for Player Attack - trigger player attack animation
        const cleanupPlayerAttack = gameManager.on('playerAttack', () => {
            animStateRef.current.playerAttackCooldown = 15;
            audioManager.playSfxHit();
        });

        // Listen for Enemy Attack - trigger enemy attack animation
        const cleanupEnemyAttack = gameManager.on('enemyAttack', () => {
            animStateRef.current.enemyAttackCooldown = 15;
        });

        // Particle spawn functions
        function spawnHitParticles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 4;
                particlesRef.current.push(new Particle(
                    x + (Math.random() - 0.5) * 30,
                    y + (Math.random() - 0.5) * 30,
                    color,
                    3 + Math.random() * 4,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 2,
                    30 + Math.random() * 20,
                    0.15
                ));
            }
        }

        function spawnLootExplosion(x, y, count) {
            const colors = [0xfbbf24, 0x22c55e, 0x3b82f6, 0xa855f7];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                particlesRef.current.push(new Particle(
                    x,
                    y,
                    colors[Math.floor(Math.random() * colors.length)],
                    4 + Math.random() * 4,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 4,
                    40 + Math.random() * 30,
                    0.2
                ));
            }
        }

        function spawnAmbientParticle() {
            const pos = positionsRef.current;
            const colors = [0x3b82f6, 0x8b5cf6, 0x22c55e, 0xfbbf24];
            ambientParticlesRef.current.push(new Particle(
                Math.random() * pos.canvasWidth,
                pos.canvasHeight,
                colors[Math.floor(Math.random() * colors.length)],
                2 + Math.random() * 2,
                (Math.random() - 0.5) * 0.5,
                -0.5 - Math.random() * 0.5,
                150 + Math.random() * 100,
                0
            ));
        }

        function updateParticles(container) {
            if (!container) return;

            const pool = graphicsPoolRef.current;

            // Return all active graphics to the pool (reuse instead of destroy)
            for (const g of activeGraphicsRef.current) {
                container.removeChild(g);
                pool.release(g);
            }
            activeGraphicsRef.current = [];

            // Cap particle counts to prevent memory issues
            const MAX_HIT_PARTICLES = 50;
            const MAX_AMBIENT_PARTICLES = 30;

            // Trim excess particles
            if (particlesRef.current.length > MAX_HIT_PARTICLES) {
                particlesRef.current = particlesRef.current.slice(-MAX_HIT_PARTICLES);
            }
            if (ambientParticlesRef.current.length > MAX_AMBIENT_PARTICLES) {
                ambientParticlesRef.current = ambientParticlesRef.current.slice(-MAX_AMBIENT_PARTICLES);
            }

            // Update and draw hit particles (acquire from pool)
            particlesRef.current = particlesRef.current.filter(p => {
                if (p.update()) {
                    const g = pool.acquire();
                    g.circle(p.x, p.y, p.size * p.alpha);
                    g.fill({ color: p.color, alpha: p.alpha });
                    container.addChild(g);
                    activeGraphicsRef.current.push(g);
                    return true;
                }
                return false;
            });

            // Update and draw ambient particles (acquire from pool)
            ambientParticlesRef.current = ambientParticlesRef.current.filter(p => {
                if (p.update()) {
                    const g = pool.acquire();
                    g.circle(p.x, p.y, p.size);
                    g.fill({ color: p.color, alpha: p.alpha * 0.5 });
                    container.addChild(g);
                    activeGraphicsRef.current.push(g);
                    return true;
                }
                return false;
            });
        }

        return () => {
            cleanupText();
            cleanupLoot();
            cleanupDeath();
            cleanupPlayerAttack();
            cleanupEnemyAttack();
            // Clean up resize observer
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            // Clean up graphics pool to prevent memory leaks
            if (graphicsPoolRef.current) {
                graphicsPoolRef.current.destroy();
            }
            activeGraphicsRef.current = [];
            if (appRef.current) {
                // Don't destroy textures - they're managed by PIXI.Assets cache
                // Destroying them causes warnings on remount
                appRef.current.destroy(true, { children: true, texture: false });
                appRef.current = null;
            }
        };
    }, []);

    // Resize handling - runs after initialization is complete
    useEffect(() => {
        if (!isInitialized || !containerRef.current || !appRef.current) return;

        const handleResize = () => {
            if (!appRef.current || !containerRef.current) return;

            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                const containerWidth = containerRef.current?.clientWidth || 800;
                const containerHeight = containerRef.current?.clientHeight || 600;

                // Recalculate positions
                const centerX = containerWidth / 2;
                const scaleFactor = Math.min(1, containerHeight / 400);
                const groundY = scaleFactor < 1
                    ? containerHeight * 0.75
                    : containerHeight - 160;

                const charSpacing = Math.min(350, containerWidth * 0.35);
                const playerX = centerX - charSpacing;
                const enemyX = centerX + charSpacing;
                const characterY = Math.min(groundY - 55, containerHeight * 0.5); // Position at ~50% height

                // Update positions ref
                positionsRef.current = {
                    playerX,
                    enemyX,
                    characterY,
                    centerX,
                    groundY,
                    canvasWidth: containerWidth,
                    canvasHeight: containerHeight,
                    scaleFactor,
                };

                // Update player position and base values
                if (playerRef.current) {
                    playerRef.current.baseX = playerX;
                    playerRef.current.baseY = characterY;
                    playerRef.current.x = playerX;
                    playerRef.current.y = characterY - 25 * scaleFactor;
                    const playerScale = (ENEMY_SPRITES['Knight'].scale || 4) * 1.5 * scaleFactor;
                    playerRef.current.scale.set(-playerScale, playerScale);

                    // Update player shadow and glow
                    if (playerRef.current.shadow) {
                        playerRef.current.shadow.clear();
                        playerRef.current.shadow.ellipse(playerX, groundY - 2, 35 * scaleFactor, 12 * scaleFactor);
                        playerRef.current.shadow.fill({ color: 0x000000, alpha: 0.4 });
                    }
                    if (playerRef.current.glow) {
                        playerRef.current.glow.clear();
                        playerRef.current.glow.circle(playerX, characterY - 40 * scaleFactor, 60 * scaleFactor);
                        playerRef.current.glow.fill({ color: 0x3b82f6, alpha: 0.1 });
                    }
                }

                // Update enemy position
                if (enemyRef.current) {
                    enemyRef.current.baseX = enemyX;
                    enemyRef.current.baseY = characterY;
                    enemyRef.current.x = enemyX;
                    enemyRef.current.y = characterY - 25 * scaleFactor;
                    enemyRef.current.scaleFactor = scaleFactor;
                    enemyRef.current.shadowX = enemyX;
                    enemyRef.current.auraX = enemyX;
                    enemyRef.current.auraY = characterY - 25;

                    const zone = getZoneById(gameManager.getState()?.currentZone || 0);
                    const baseScale = (zone?.isBoss ? 6.5 : 5) * scaleFactor;
                    enemyRef.current.baseScale = baseScale;
                    enemyRef.current.scale.set(-baseScale, baseScale);

                    if (enemyRef.current.shadow) {
                        enemyRef.current.shadow.clear();
                        const shadowSize = zone?.isBoss ? 45 : 35;
                        enemyRef.current.shadow.ellipse(enemyX, groundY - 2, shadowSize * scaleFactor, (zone?.isBoss ? 15 : 12) * scaleFactor);
                        enemyRef.current.shadow.fill({ color: 0x000000, alpha: zone?.isBoss ? 0.5 : 0.4 });
                    }
                    if (enemyRef.current.aura) {
                        enemyRef.current.aura.clear();
                        if (zone?.isBoss) {
                            enemyRef.current.aura.circle(enemyX, characterY - 40 * scaleFactor, 90 * scaleFactor);
                            enemyRef.current.aura.fill({ color: 0xef4444, alpha: 0.15 });
                        }
                    }
                }

                // Update HP bars
                const hpBarY = Math.min(groundY + 40, containerHeight - 30);

                if (playerHpBarRef.current) {
                    playerHpBarRef.current.position.set(playerX, hpBarY);
                }
                if (enemyHpBarRef.current) {
                    enemyHpBarRef.current.position.set(enemyX, hpBarY);
                }

                // Update wave text position (endless mode) - center top
                if (uiContainerRef.current?.waveText) {
                    uiContainerRef.current.waveText.x = centerX;
                    uiContainerRef.current.waveText.y = 150 * scaleFactor;
                }

                // Update background
                if (bgSpriteRef.current && bgSpriteRef.current.texture) {
                    const texture = bgSpriteRef.current.texture;
                    const scaleX = containerWidth / texture.width;
                    const scaleY = containerHeight / texture.height;
                    const coverScale = Math.max(scaleX, scaleY);
                    bgSpriteRef.current.scale.set(coverScale, coverScale);
                    bgSpriteRef.current.x = (containerWidth - texture.width * coverScale) / 2;
                    bgSpriteRef.current.y = (containerHeight - texture.height * coverScale) / 2;
                }
            });
        };

        // Set up ResizeObserver
        const observer = new ResizeObserver(() => {
            handleResize();
        });
        observer.observe(containerRef.current);
        resizeObserverRef.current = observer;

        // Also listen to window resize as fallback
        window.addEventListener('resize', handleResize);

        // Initial call to ensure positions are correct
        handleResize();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [isInitialized, gameManager]);

    // Background image ref for zone changes
    const bgSpriteRef = useRef(null);

    // Get background image path based on zone
    // Uses fight backgrounds: forest for zones 0-19, elven for zones 20+
    function getBackgroundForZone(zoneId) {
        // Determine which background set to use based on zone range
        // Zones 0-19: forest fight backgrounds
        // Zones 20+: elven fight backgrounds
        const isElven = zoneId >= 20;
        const bgType = isElven ? 'elven' : 'forest';

        // Each biome is 5 zones (4 regular + 1 boss)
        // Cycle through 4 backgrounds within each set
        const biome = Math.floor(zoneId / 5);
        const zoneInBiome = zoneId % 5;

        // Boss zones (every 5th zone: 4, 9, 14, etc.) use background 4 (most dramatic)
        // Regular zones cycle through 1-4 based on position in biome
        let bgIndex;
        if (zoneInBiome === 4) {
            // Boss zone - use the 4th (most dramatic) background
            bgIndex = 4;
        } else {
            // Regular zones - cycle based on biome number for variety
            bgIndex = ((biome + zoneInBiome) % 4) + 1;
        }

        return `/assets/backgrounds/fight_${bgType}_${bgIndex}.png`;
    }

    // Create animated background with forest image
    async function createBackground(container, width = 800, height = 600, zoneId = 0) {
        // Load forest background image based on zone
        const bgPath = getBackgroundForZone(zoneId);
        try {
            // Check if already cached to avoid duplicate key warnings
            let bgTexture;
            if (PIXI.Assets.cache.has(bgPath)) {
                bgTexture = PIXI.Assets.cache.get(bgPath);
            } else {
                bgTexture = await PIXI.Assets.load(bgPath);
            }
            const bgSprite = new PIXI.Sprite(bgTexture);

            // Calculate scale to cover canvas while maintaining aspect ratio (no stretching)
            // Use the larger scale factor to ensure full coverage (overflow is fine)
            const textureWidth = bgTexture.width;
            const textureHeight = bgTexture.height;
            const scaleX = width / textureWidth;
            const scaleY = height / textureHeight;
            const coverScale = Math.max(scaleX, scaleY);

            bgSprite.scale.set(coverScale, coverScale);
            // Center the background
            bgSprite.x = (width - textureWidth * coverScale) / 2;
            bgSprite.y = (height - textureHeight * coverScale) / 2;

            container.addChild(bgSprite);
            bgSpriteRef.current = bgSprite;
            bgContainerRef.current = container;
        } catch (e) {
            console.warn('Failed to load background, using fallback gradient', e);
            // Fallback gradient background
            const bg = new PIXI.Graphics();
            const gradientHeight = height - 70;
            for (let i = 0; i < gradientHeight; i += 2) {
                const progress = i / gradientHeight;
                const r = Math.floor(10 + progress * 15);
                const g = Math.floor(10 + progress * 20);
                const b = Math.floor(20 + progress * 30);
                const color = (r << 16) | (g << 8) | b;
                bg.rect(0, i, width, 2);
                bg.fill(color);
            }
            container.addChild(bg);
        }

        // Subtle darkening overlay for better character visibility
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, width, height);
        overlay.fill({ color: 0x000000, alpha: 0.25 });
        container.addChild(overlay);

        // Vignette effect
        const vignette = new PIXI.Graphics();
        // Top gradient
        for (let i = 0; i < 100; i++) {
            vignette.rect(0, i, width, 1);
            vignette.fill({ color: 0x000000, alpha: (1 - i / 100) * 0.6 });
        }
        // Bottom gradient
        const bottomStart = height - 60;
        for (let i = 0; i < 60; i++) {
            vignette.rect(0, bottomStart + i, width, 1);
            vignette.fill({ color: 0x000000, alpha: (i / 60) * 0.4 });
        }
        // Side vignettes
        for (let i = 0; i < 50; i++) {
            vignette.rect(i, 0, 1, height);
            vignette.fill({ color: 0x000000, alpha: (1 - i / 50) * 0.3 });
            vignette.rect(width - i, 0, 1, height);
            vignette.fill({ color: 0x000000, alpha: (1 - i / 50) * 0.3 });
        }
        container.addChild(vignette);
    }

    // Update background texture when zone changes
    async function updateBackground(zoneId, width = 800, height = 600) {
        if (!bgSpriteRef.current) return;

        const bgPath = getBackgroundForZone(zoneId);
        try {
            // Check if already cached to avoid duplicate key warnings
            let bgTexture;
            if (PIXI.Assets.cache.has(bgPath)) {
                bgTexture = PIXI.Assets.cache.get(bgPath);
            } else {
                bgTexture = await PIXI.Assets.load(bgPath);
            }
            bgSpriteRef.current.texture = bgTexture;

            // Recalculate scale to cover canvas
            const textureWidth = bgTexture.width;
            const textureHeight = bgTexture.height;
            const scaleX = width / textureWidth;
            const scaleY = height / textureHeight;
            const coverScale = Math.max(scaleX, scaleY);

            bgSpriteRef.current.scale.set(coverScale, coverScale);
            bgSpriteRef.current.x = (width - textureWidth * coverScale) / 2;
            bgSpriteRef.current.y = (height - textureHeight * coverScale) / 2;
        } catch (e) {
            console.warn('Failed to update background:', e);
        }
    }

    // --- Create Procedural Character Graphics ---
    function createCharacterGraphics(enemyType, isBoss) {
        const g = new PIXI.Graphics();
        const colors = ENEMY_COLORS[enemyType] || ENEMY_COLORS.Beast;
        const primary = colors.primary;
        const secondary = colors.secondary;
        const accent = colors.accent;

        // Map enemy type to visual type
        const typeMap = {
            Knight: 'humanoid', Undead: 'skeleton', Beast: 'beast', Humanoid: 'orc',
            Dragon: 'dragon', Demon: 'demon', Elemental: 'elemental', Celestial: 'angel',
            Abyssal: 'demon', Chaos: 'elemental', Void: 'wraith', Boss: 'dragon'
        };
        const type = typeMap[enemyType] || 'beast';

        // Draw based on type - all centered around origin
        switch (type) {
            case 'humanoid':
            case 'orc':
                // Head
                g.circle(0, -55, 18);
                g.fill(secondary);
                // Body
                g.roundRect(-20, -38, 40, 50, 8);
                g.fill(primary);
                // Arms
                g.roundRect(-30, -35, 12, 35, 4);
                g.roundRect(18, -35, 12, 35, 4);
                g.fill(secondary);
                // Legs
                g.roundRect(-16, 10, 14, 30, 4);
                g.roundRect(2, 10, 14, 30, 4);
                g.fill(primary);
                // Weapon/accent
                g.roundRect(24, -45, 6, 50, 2);
                g.fill(accent);
                // Eyes
                g.circle(-6, -58, 3);
                g.circle(6, -58, 3);
                g.fill(0xffffff);
                break;

            case 'skeleton':
                // Skull
                g.circle(0, -55, 16);
                g.fill(0xd1d5db);
                // Eye sockets
                g.circle(-5, -58, 4);
                g.circle(5, -58, 4);
                g.fill(0x1f2937);
                // Jaw
                g.rect(-10, -48, 20, 6);
                g.fill(0xd1d5db);
                // Ribcage
                for (let i = 0; i < 4; i++) {
                    g.roundRect(-18, -35 + i * 10, 36, 6, 2);
                    g.fill(0xd1d5db);
                }
                // Spine
                g.roundRect(-3, -38, 6, 50, 2);
                g.fill(0x9ca3af);
                // Arms
                g.roundRect(-28, -35, 8, 35, 2);
                g.roundRect(20, -35, 8, 35, 2);
                g.fill(0xd1d5db);
                // Legs
                g.roundRect(-12, 10, 8, 30, 2);
                g.roundRect(4, 10, 8, 30, 2);
                g.fill(0xd1d5db);
                // Glow
                g.circle(-5, -58, 2);
                g.circle(5, -58, 2);
                g.fill(accent);
                break;

            case 'beast':
                // Body (quadruped stance)
                g.ellipse(0, -20, 35, 25);
                g.fill(primary);
                // Head
                g.ellipse(-30, -30, 20, 18);
                g.fill(primary);
                // Snout
                g.ellipse(-45, -28, 10, 8);
                g.fill(secondary);
                // Ears
                g.moveTo(-25, -48);
                g.lineTo(-35, -55);
                g.lineTo(-30, -45);
                g.fill(primary);
                g.moveTo(-15, -45);
                g.lineTo(-22, -55);
                g.lineTo(-20, -42);
                g.fill(primary);
                // Legs
                g.roundRect(-25, 0, 12, 25, 4);
                g.roundRect(-5, 0, 12, 25, 4);
                g.roundRect(15, 0, 12, 25, 4);
                g.fill(secondary);
                // Tail
                g.moveTo(30, -25);
                g.quadraticCurveTo(50, -30, 45, -10);
                g.lineTo(42, -12);
                g.quadraticCurveTo(45, -28, 28, -22);
                g.fill(primary);
                // Eye
                g.circle(-38, -32, 4);
                g.fill(accent);
                break;

            case 'dragon':
                // Body (large, serpentine)
                g.ellipse(0, -30, 50, 35);
                g.fill(primary);
                // Belly scales
                g.ellipse(0, -20, 35, 20);
                g.fill(secondary);
                // Head
                g.ellipse(-45, -45, 25, 20);
                g.fill(primary);
                // Snout
                g.ellipse(-65, -42, 15, 10);
                g.fill(secondary);
                // Horns
                g.moveTo(-35, -60);
                g.lineTo(-25, -80);
                g.lineTo(-30, -58);
                g.fill(accent);
                g.moveTo(-50, -58);
                g.lineTo(-45, -78);
                g.lineTo(-42, -55);
                g.fill(accent);
                // Wings
                g.moveTo(10, -55);
                g.lineTo(60, -90);
                g.lineTo(70, -50);
                g.lineTo(50, -55);
                g.lineTo(40, -40);
                g.fill(secondary);
                // Legs
                g.roundRect(-30, 0, 20, 35, 6);
                g.roundRect(10, 0, 20, 35, 6);
                g.fill(primary);
                // Claws
                g.moveTo(-25, 35);
                g.lineTo(-30, 45);
                g.lineTo(-20, 35);
                g.fill(accent);
                // Eye
                g.circle(-55, -48, 5);
                g.fill(accent);
                // Tail
                g.moveTo(45, -25);
                g.quadraticCurveTo(80, -20, 85, -40);
                g.lineTo(82, -38);
                g.quadraticCurveTo(75, -22, 43, -22);
                g.fill(primary);
                break;

            case 'demon':
                // Body
                g.roundRect(-25, -40, 50, 55, 10);
                g.fill(primary);
                // Head
                g.circle(0, -55, 22);
                g.fill(primary);
                // Horns
                g.moveTo(-18, -70);
                g.lineTo(-25, -95);
                g.lineTo(-12, -72);
                g.fill(accent);
                g.moveTo(18, -70);
                g.lineTo(25, -95);
                g.lineTo(12, -72);
                g.fill(accent);
                // Eyes (glowing)
                g.circle(-8, -58, 5);
                g.circle(8, -58, 5);
                g.fill(accent);
                g.circle(-8, -58, 2);
                g.circle(8, -58, 2);
                g.fill(0xffffff);
                // Wings
                g.moveTo(-25, -30);
                g.lineTo(-55, -60);
                g.lineTo(-60, -20);
                g.lineTo(-30, -25);
                g.fill(secondary);
                g.moveTo(25, -30);
                g.lineTo(55, -60);
                g.lineTo(60, -20);
                g.lineTo(30, -25);
                g.fill(secondary);
                // Arms
                g.roundRect(-35, -30, 12, 40, 4);
                g.roundRect(23, -30, 12, 40, 4);
                g.fill(secondary);
                // Legs
                g.roundRect(-18, 12, 16, 28, 5);
                g.roundRect(2, 12, 16, 28, 5);
                g.fill(primary);
                break;

            case 'wraith':
                // Ghostly body (wispy)
                g.moveTo(0, -70);
                g.quadraticCurveTo(30, -50, 25, -20);
                g.quadraticCurveTo(30, 10, 15, 35);
                g.lineTo(5, 30);
                g.lineTo(-5, 40);
                g.lineTo(-15, 30);
                g.quadraticCurveTo(-30, 10, -25, -20);
                g.quadraticCurveTo(-30, -50, 0, -70);
                g.fill({ color: primary, alpha: 0.7 });
                // Hood
                g.ellipse(0, -55, 20, 25);
                g.fill(secondary);
                // Face void
                g.ellipse(0, -50, 12, 15);
                g.fill(0x000000);
                // Eyes
                g.circle(-5, -52, 3);
                g.circle(5, -52, 3);
                g.fill(accent);
                // Wisps
                g.moveTo(-20, -30);
                g.quadraticCurveTo(-40, -40, -35, -20);
                g.fill({ color: secondary, alpha: 0.5 });
                g.moveTo(20, -30);
                g.quadraticCurveTo(40, -40, 35, -20);
                g.fill({ color: secondary, alpha: 0.5 });
                break;

            case 'elemental':
                // Core
                g.circle(0, -35, 30);
                g.fill(primary);
                // Inner glow
                g.circle(0, -35, 20);
                g.fill(secondary);
                g.circle(0, -35, 10);
                g.fill(accent);
                // Orbiting fragments
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const ox = Math.cos(angle) * 40;
                    const oy = Math.sin(angle) * 40 - 35;
                    g.circle(ox, oy, 8);
                    g.fill(primary);
                }
                // Energy streams
                g.setStrokeStyle({ width: 3, color: accent, alpha: 0.7 });
                g.moveTo(-30, -20);
                g.quadraticCurveTo(-15, -50, 0, -35);
                g.stroke();
                g.moveTo(30, -20);
                g.quadraticCurveTo(15, -50, 0, -35);
                g.stroke();
                break;

            case 'angel':
                // Body (robed)
                g.moveTo(-20, -30);
                g.lineTo(-30, 35);
                g.lineTo(30, 35);
                g.lineTo(20, -30);
                g.fill(0xffffff);
                // Head
                g.circle(0, -45, 18);
                g.fill(0xfef3c7);
                // Halo
                g.setStrokeStyle({ width: 4, color: accent });
                g.circle(0, -70, 15);
                g.stroke();
                // Wings
                g.moveTo(-18, -25);
                g.quadraticCurveTo(-60, -50, -70, -15);
                g.quadraticCurveTo(-65, -35, -55, -30);
                g.quadraticCurveTo(-50, -45, -40, -35);
                g.quadraticCurveTo(-35, -48, -18, -30);
                g.fill(0xffffff);
                g.moveTo(18, -25);
                g.quadraticCurveTo(60, -50, 70, -15);
                g.quadraticCurveTo(65, -35, 55, -30);
                g.quadraticCurveTo(50, -45, 40, -35);
                g.quadraticCurveTo(35, -48, 18, -30);
                g.fill(0xffffff);
                // Face
                g.circle(-5, -48, 2);
                g.circle(5, -48, 2);
                g.fill(primary);
                // Arms holding staff
                g.roundRect(-8, -25, 6, 30, 2);
                g.roundRect(2, -25, 6, 30, 2);
                g.fill(0xfef3c7);
                // Staff
                g.roundRect(-2, -60, 4, 80, 2);
                g.fill(accent);
                g.circle(0, -65, 8);
                g.fill(accent);
                break;

            default:
                // Default blob enemy
                g.ellipse(0, -25, 30, 35);
                g.fill(primary);
                g.circle(-10, -35, 5);
                g.circle(10, -35, 5);
                g.fill(0xffffff);
                g.circle(-10, -35, 2);
                g.circle(10, -35, 2);
                g.fill(0x000000);
        }

        // Boss enhancement - add glowing outline
        if (isBoss) {
            g.setStrokeStyle({ width: 3, color: accent, alpha: 0.8 });
            g.circle(0, -30, 50);
            g.stroke();
        }

        return g;
    }

    // --- Update HP Bars on State Change (separate from sprite updates) ---
    useEffect(() => {
        // Wait for PIXI to initialize and refs to be set
        if (!state || !isInitialized) return;

        // Update HP Bars (doesn't depend on sprite sheets)
        if (playerHpBarRef.current && playerHpBarRef.current.fillRef) {
            const playerHp = state.playerHp || 100;
            const playerMaxHp = state.playerMaxHp || 100;
            updateHpBar(playerHpBarRef.current, playerHp, playerMaxHp, true);
        }
        if (enemyHpBarRef.current && enemyHpBarRef.current.fillRef) {
            const enemyHp = state.enemyHp || 20;
            const enemyMaxHp = state.enemyMaxHp || 20;
            updateHpBar(enemyHpBarRef.current, enemyHp, enemyMaxHp, false);
        }
    }, [state?.playerHp, state?.playerMaxHp, state?.enemyHp, state?.enemyMaxHp, isInitialized]);

    // --- Update Visuals on State Change ---
    useEffect(() => {
        if (!state || !spriteSheetRef.current) return;

        const spriteSheets = spriteSheetRef.current;

        // Helper to get sprite texture from the appropriate sheet
        const getSpriteTexture = (spriteData) => {
            const sheetName = spriteData.sheet || 'player';
            const sheet = spriteSheets[sheetName];
            if (!sheet) return null;

            const { tileSize } = SPRITE_CONFIG;
            const frame = new PIXI.Rectangle(
                spriteData.col * tileSize,
                spriteData.row * tileSize,
                tileSize,
                tileSize
            );
            return new PIXI.Texture({ source: sheet.source, frame });
        };

        // 1. Update Enemy Sprite based on Zone/Enemy Type - using NEW sprite PNGs
        if (enemyRef.current) {
            const zone = getZoneById(state.currentZone);
            const zoneId = zone.id;

            // Determine sprite path based on zone
            let spritePath;
            if (zone.isBoss) {
                const spriteName = ZONE_BOSS_SPRITES[zoneId] || 'crow_demon';
                spritePath = `/assets/bosses/${spriteName}.png`;
            } else {
                const spriteName = ZONE_MONSTER_SPRITES[zoneId] || 'spider_red';
                spritePath = `/assets/monsters/${spriteName}.png`;
            }

            // Apply texture from cache (all sprites are pre-loaded during init)
            if (monsterTextureCache[spritePath]) {
                enemyRef.current.texture = monsterTextureCache[spritePath];
            } else {
                // Fallback: load async if somehow not cached (shouldn't happen)
                // Check PIXI cache first to avoid duplicate key warnings
                if (PIXI.Assets.cache.has(spritePath)) {
                    const texture = PIXI.Assets.cache.get(spritePath);
                    texture.source.scaleMode = 'nearest';
                    monsterTextureCache[spritePath] = texture;
                    if (enemyRef.current) {
                        enemyRef.current.texture = texture;
                    }
                } else {
                    PIXI.Assets.load(spritePath).then((texture) => {
                        texture.source.scaleMode = 'nearest';
                        monsterTextureCache[spritePath] = texture;
                        if (enemyRef.current) {
                            enemyRef.current.texture = texture;
                        }
                    }).catch(err => console.warn('Failed to load monster sprite:', spritePath, err));
                }
            }

            // Scale for 32x32 sprites - larger for bosses (increased by 1.5x)
            // Use stored scaleFactor for consistent mobile scaling
            const sf = enemyRef.current.scaleFactor || 1;
            const baseScale = (zone.isBoss ? 6.5 : 5) * sf;
            enemyRef.current.baseScale = baseScale; // Store for animation reference
            enemyRef.current.scale.set(-baseScale, baseScale); // Negative x to face player
            enemyRef.current.alpha = 1; // Ensure visible after zone change

            if (zone.isBoss) {
                if (enemyRef.current.aura) {
                    const auraX = enemyRef.current.auraX || enemyRef.current.baseX || 600;
                    const auraY = enemyRef.current.auraY || (enemyRef.current.baseY ? enemyRef.current.baseY - 40 : 350);
                    enemyRef.current.aura.clear();
                    enemyRef.current.aura.circle(auraX, auraY, 90);
                    enemyRef.current.aura.fill({ color: 0xef4444, alpha: 0.15 });
                }
                if (enemyRef.current.shadow) {
                    const shadowX = enemyRef.current.shadowX || enemyRef.current.baseX || 600;
                    enemyRef.current.shadow.clear();
                    enemyRef.current.shadow.ellipse(shadowX, (enemyRef.current.baseY || 375) + 3, 45, 15);
                    enemyRef.current.shadow.fill({ color: 0x000000, alpha: 0.5 });
                }
            } else {
                if (enemyRef.current.aura) {
                    enemyRef.current.aura.clear();
                }
                if (enemyRef.current.shadow) {
                    const shadowX = enemyRef.current.shadowX || enemyRef.current.baseX || 600;
                    enemyRef.current.shadow.clear();
                    enemyRef.current.shadow.ellipse(shadowX, (enemyRef.current.baseY || 375) + 3, 35, 12);
                    enemyRef.current.shadow.fill({ color: 0x000000, alpha: 0.4 });
                }
            }

            // Update zone text
            if (effectsContainerRef.current?.parent?.zoneText) {
                effectsContainerRef.current.parent.zoneText.text = zone.name;
            }

            // Update background for zone changes
            if (appRef.current) {
                updateBackground(zoneId, appRef.current.screen.width, appRef.current.screen.height);
            }
        }

        // HP Bars are now updated in a separate useEffect above

    }, [state]);

    return (
        <div className="w-full h-full relative">
            <div
                ref={containerRef}
                className="w-full h-full overflow-hidden bg-black"
            />

            {/* Loading Overlay */}
            {!isInitialized && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-10">
                    <div className="text-center">
                        {/* Animated sword icon */}
                        <div className="text-6xl mb-6 animate-bounce">&#9876;</div>

                        <h2 className="text-xl font-bold text-white mb-4">Loading Game</h2>

                        {/* Progress bar */}
                        <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                style={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                            />
                        </div>

                        {/* Status text */}
                        <p className="text-slate-400 text-sm">
                            {loadingProgress.status}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            {loadingProgress.loaded} / {loadingProgress.total}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function updateHpBar(barContainer, current, max, isPlayer) {
    if (!barContainer) return;

    const width = barContainer.barWidth || 180;

    // Ensure valid values - handle NaN explicitly
    const safeMax = Math.max(1, (isNaN(max) || max === null || max === undefined) ? 100 : max);
    const safeCurrent = Math.max(0, (isNaN(current) || current === null || current === undefined) ? safeMax : current);
    const pct = Math.min(1, Math.max(0, safeCurrent / safeMax));
    const barWidth = Math.max(4, width * pct); // At least 4px width if health > 0

    // Update HP text overlay
    if (barContainer.hpText) {
        barContainer.hpText.text = `${Math.floor(safeCurrent)}/${Math.floor(safeMax)}`;
    }

    // Color based on health percentage
    let color1;
    if (isPlayer) {
        color1 = 0x3b82f6;
    } else {
        if (pct > 0.5) {
            color1 = 0xef4444;
        } else if (pct > 0.25) {
            color1 = 0xf97316;
        } else {
            color1 = 0xdc2626;
        }
    }

    // Remove old fill and create new one (more reliable than clear+redraw)
    if (barContainer.fillRef) {
        barContainer.removeChild(barContainer.fillRef);
        barContainer.fillRef.destroy();
    }

    // Create new fill Graphics (use scaled dimensions from container)
    const barHeight = barContainer.barHeight || 36;
    const halfBar = barContainer.halfBar || 18;
    const fill = new PIXI.Graphics();
    if (pct > 0) {
        // Main fill
        fill.rect(-width/2, -halfBar, barWidth, barHeight);
        fill.fill(color1);

        // Highlight on top
        const highlightHeight = Math.max(3, Math.round(10 * (barContainer.barScale || 1)));
        fill.rect(-width/2, -halfBar, barWidth, highlightHeight);
        fill.fill({ color: 0xffffff, alpha: 0.2 });
    }

    // Add at index 2 (after frame and bg)
    barContainer.addChildAt(fill, 2);
    barContainer.fillRef = fill;
}

function spawnFloatingText(app, container, { text, type, target }, positions = {}) {
    if (!container) return;

    const { playerX = 200, enemyX = 600, characterY = 350, scaleFactor = 1 } = positions;

    let fillColor = '#ffffff';
    let fontSize = 24;

    // Position offsets to prevent overlap - different types go to different areas
    let offsetX = 0;
    let offsetY = 0;

    // Map type to color and style
    switch (type) {
        case 'crit':
            fillColor = '#fde047';
            fontSize = 32;
            offsetY = -10;
            break;
        case 'heal':
        case 'killHeal':
            fillColor = '#4ade80';
            fontSize = 24;
            offsetX = -100; // Far left of player for clear separation
            offsetY = -20;
            break;
        case 'dodge':
            fillColor = '#67e8f9';
            fontSize = 22;
            offsetX = 0;
            offsetY = -40;
            break;
        case 'playerDmg':
            fillColor = '#fbbf24'; // Golden/yellow for damage dealt
            fontSize = 26;
            offsetX = 0;
            offsetY = -30;
            break;
        case 'enemyDmg':
            fillColor = '#f87171';
            fontSize = 24;
            offsetX = 100; // Far right of player for clear separation
            offsetY = -20;
            break;
        case 'thorns':
            fillColor = '#c084fc';
            fontSize = 18;
            offsetX = -40;
            offsetY = 30;
            break;
        case 'silver':
            fillColor = '#c0c0c0';
            fontSize = 22;
            break;
        case 'silverLoss':
            fillColor = '#ef4444';
            fontSize = 20;
            break;
        case 'xp':
            fillColor = '#a78bfa';
            fontSize = 22;
            break;
        case 'loot':
            fillColor = '#34d399';
            fontSize = 24;
            break;
        // New unique effect types
        case 'bleed':
            fillColor = '#dc2626';
            fontSize = 18;
            offsetX = 30;
            offsetY = 20;
            break;
        case 'burn':
            fillColor = '#f97316';
            fontSize = 18;
            offsetX = -30;
            offsetY = 25;
            break;
        case 'poison':
            fillColor = '#22c55e';
            fontSize = 18;
            offsetX = 0;
            offsetY = 35;
            break;
        case 'multiStrike':
            fillColor = '#8b5cf6';
            fontSize = 26;
            offsetY = -20;
            break;
        case 'execute':
            fillColor = '#ef4444';
            fontSize = 28;
            offsetY = -15;
            break;
        case 'shield':
            fillColor = '#3b82f6';
            fontSize = 20;
            offsetX = -50;
            offsetY = 0;
            break;
        case 'retaliate':
            fillColor = '#eab308';
            fontSize = 20;
            offsetX = 20;
            offsetY = 40;
            break;
        case 'regen':
            fillColor = '#86efac';
            fontSize = 18;
            offsetX = -70;
            offsetY = 30;
            break;
        case 'ascendedCrit':
            fillColor = '#67e8f9'; // Light blue/cyan
            fontSize = 32;
            offsetY = -15;
            break;
        // New overflow effects
        case 'phantom':
            fillColor = '#a78bfa'; // Purple
            fontSize = 24;
            offsetY = -10;
            break;
        case 'immunity':
            fillColor = '#fcd34d'; // Gold
            fontSize = 26;
            offsetY = -15;
            break;
        case 'vengeance':
            fillColor = '#f43f5e'; // Rose/Red
            fontSize = 26;
            offsetY = 30;
            break;
        case 'secondWind':
            fillColor = '#34d399'; // Emerald
            fontSize = 28;
            offsetY = -20;
            break;
        case 'overheal':
            fillColor = '#22d3ee'; // Cyan
            fontSize = 20;
            offsetX = -40;
            offsetY = 15;
            break;
        case 'annihilate':
            fillColor = '#fb923c'; // Orange
            fontSize = 30;
            offsetY = -15;
            break;
        case 'frenzy':
            fillColor = '#c084fc'; // Purple/Pink
            fontSize = 28;
            offsetY = -20;
            break;
    }

    // Scale font size and offsets for mobile
    fontSize = Math.round(fontSize * scaleFactor);
    offsetX *= scaleFactor;
    offsetY *= scaleFactor;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize,
        fill: fillColor,
        stroke: { color: '#000000', width: Math.max(1, 4 * scaleFactor) },
        dropShadow: {
            color: '#000000',
            distance: Math.max(1, 2 * scaleFactor),
            blur: Math.max(1, 3 * scaleFactor),
            alpha: 0.8,
        },
        padding: Math.ceil(10 * scaleFactor), // Prevent text clipping from stroke/shadow
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);

    // Base position based on target
    const baseX = target === 'player' ? playerX : enemyX;
    const baseY = characterY - 50 * scaleFactor;

    // Apply type-specific offset + small random spread (scaled)
    let finalX = baseX + offsetX + (Math.random() - 0.5) * 30 * scaleFactor;
    let finalY = baseY + offsetY + (Math.random() - 0.5) * 15 * scaleFactor;

    // Clamp to canvas bounds with padding to prevent text going off screen
    const canvasWidth = positions.canvasWidth || 800;
    const canvasHeight = positions.canvasHeight || 600;
    const padding = fontSize + 20;
    finalX = Math.max(padding, Math.min(canvasWidth - padding, finalX));
    finalY = Math.max(padding, Math.min(canvasHeight - padding, finalY));

    pixiText.x = finalX;
    pixiText.y = finalY;

    container.addChild(pixiText);

    const isBigHit = type === 'crit' || type === 'execute' || type === 'multiStrike' || type === 'ascendedCrit' ||
                     type === 'annihilate' || type === 'frenzy' || type === 'vengeance' || type === 'phantom' || type === 'secondWind';
    let velocityY = (isBigHit ? -2.5 : -1.5) * scaleFactor;
    let velocityX = (Math.random() - 0.5) * 0.6 * scaleFactor;
    let tick = 0;
    const scale = isBigHit ? 1.5 : 1.2;

    pixiText.scale.set(0.5);

    const animate = () => {
        tick++;

        // Pop-in effect
        if (tick < 10) {
            pixiText.scale.set(0.5 + (tick / 10) * (scale - 0.5) * 1.2);
        } else if (tick < 15) {
            pixiText.scale.set(scale * 1.2 - ((tick - 10) / 5) * 0.2 * scale);
        }

        pixiText.x += velocityX;
        pixiText.y += velocityY;
        velocityY += 0.025; // Even slower gravity

        // Start fading much later and fade slower
        if (tick > 120) {
            pixiText.alpha -= 0.025;
        }

        if (pixiText.alpha <= 0 || tick > 180) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };

    app.ticker.add(animate);
}

function spawnLootText(app, container, { text, color }, positions = {}) {
    if (!container) return;

    const { enemyX = 600, characterY = 350, scaleFactor = 1 } = positions;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize: Math.round(18 * scaleFactor),
        fontWeight: 'bold',
        fill: color || '#fbbf24',
        stroke: { color: '#000000', width: Math.max(1, 4 * scaleFactor) },
        dropShadow: {
            color: '#000000',
            distance: Math.max(1, 2 * scaleFactor),
            blur: Math.max(1, 3 * scaleFactor),
            alpha: 0.9,
        },
        padding: Math.ceil(10 * scaleFactor), // Prevent text clipping from stroke/shadow
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);
    pixiText.x = enemyX;
    pixiText.y = characterY - 50 * scaleFactor;
    pixiText.alpha = 0;

    container.addChild(pixiText);

    let velocityX = (Math.random() - 0.5) * 4 * scaleFactor;
    let velocityY = (-3 - Math.random() * 2) * scaleFactor;
    let tick = 0;

    const animate = () => {
        tick++;

        // Fade in
        if (tick < 8) {
            pixiText.alpha = tick / 8;
        }

        pixiText.x += velocityX;
        pixiText.y += velocityY;
        velocityY += 0.15; // Slower gravity
        velocityX *= 0.98;

        const groundLevel = (positions.characterY || 350) + 20;
        if (pixiText.y > groundLevel) {
            velocityY = -velocityY * 0.4;
            pixiText.y = groundLevel;
            if (Math.abs(velocityY) < 0.5) {
                pixiText.alpha -= 0.015;
            }
        }

        // Start fading much later
        if (tick > 100) {
            pixiText.alpha -= 0.02;
        }

        if (pixiText.alpha <= 0 || tick > 200) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };
    app.ticker.add(animate);
}
