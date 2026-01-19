import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ASSET_BASE, ENEMY_SPRITES, SPRITE_CONFIG, ZONE_BACKGROUNDS } from '../../assets/gameAssets';
import { getZoneById } from '../data/zones';
import { audioManager } from '../systems/AudioManager';

// Direct zone ID to monster sprite mapping (using new low-level monster pack)
const ZONE_MONSTER_SPRITES = {
  0: 1, 1: 2, 2: 3, 3: 4,           // Forest (Beasts)
  5: 13, 6: 14, 7: 15, 8: 16,       // Goblins (Humanoid)
  10: 17, 11: 18, 12: 19, 13: 20,   // Undead
  15: 35, 16: 36, 17: 37, 18: 38,   // Dragons
  20: 25, 21: 26, 22: 27, 23: 28,   // Elementals
  25: 39, 26: 40, 27: 41, 28: 42,   // Demons
  30: 29, 31: 30, 32: 31, 33: 32,   // Celestial
  35: 43, 36: 44, 37: 45, 38: 46,   // Void/Chaos
  40: 47, 42: 48, 44: 5,            // Prestige zones
};

// Boss zone ID to boss sprite mapping (using new chaos monster pack)
const ZONE_BOSS_SPRITES = {
  4: 1, 9: 7, 14: 10, 19: 15, 24: 20,
  29: 25, 34: 30, 39: 35, 41: 40, 43: 44, 45: 48,
};

// Cache for loaded monster textures
const monsterTextureCache = {};

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
            const groundY = canvasHeight - 200; // Move ground up more to avoid bottom menu overlap

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

            // Calculate positions based on canvas size
            const playerX = centerX - 200;
            const enemyX = centerX + 200;
            const characterY = groundY - 25;

            // Store in ref for access throughout component
            positionsRef.current = {
                playerX,
                enemyX,
                characterY,
                centerX,
                groundY,
                canvasWidth,
                canvasHeight,
            };

            // --- Load all character sprite sheets with progress tracking ---
            const spriteSheets = {};
            const sheetNames = ['player', 'humanoid', 'demon', 'undead', 'beast', 'reptile', 'elemental', 'avian', 'misc'];
            const totalAssets = sheetNames.length + 2; // +2 for background and monster

            // Calculate total assets: sprite sheets + monster sprites + boss sprites
            const monsterSpriteNums = Object.values(ZONE_MONSTER_SPRITES);
            const bossSpriteNums = Object.values(ZONE_BOSS_SPRITES);
            const uniqueMonsters = [...new Set(monsterSpriteNums)];
            const uniqueBosses = [...new Set(bossSpriteNums)];
            const totalAssetsFinal = sheetNames.length + uniqueMonsters.length + uniqueBosses.length + 1; // +1 for background

            setLoadingProgress({ loaded: 0, total: totalAssetsFinal, status: 'Loading sprite sheets...' });

            let loadedCount = 0;

            for (let i = 0; i < sheetNames.length; i++) {
                const sheetName = sheetNames[i];
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading ${sheetName}...` });
                    const sheet = await PIXI.Assets.load(ASSET_BASE[sheetName]);
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
            for (const spriteNum of uniqueMonsters) {
                const spritePath = `/assets/monsters/Icon${spriteNum}.png`;
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading monster ${spriteNum}...` });
                    const texture = await PIXI.Assets.load(spritePath);
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
            for (const spriteNum of uniqueBosses) {
                const spritePath = `/assets/bosses/Icon${spriteNum}.png`;
                try {
                    setLoadingProgress({ loaded: loadedCount, total: totalAssetsFinal, status: `Loading boss ${spriteNum}...` });
                    const texture = await PIXI.Assets.load(spritePath);
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
            const initialZone = state?.currentZone || 0;
            createBackground(bgContainer, canvasWidth, canvasHeight, initialZone);

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

            // --- Create Player (Hero) using real sprite ---
            // DawnLike sprites face LEFT by default, so flip player to face RIGHT (toward enemy)
            const playerData = ENEMY_SPRITES['Knight'];
            const playerTexture = getSpriteTexture(playerData);
            const player = playerTexture
                ? new PIXI.Sprite(playerTexture)
                : new PIXI.Graphics().rect(-8, -8, 16, 16).fill(0x3b82f6);
            player.anchor.set(0.5, 1);
            player.x = playerX;
            player.y = characterY;
            const playerScale = (playerData.scale || 4) * 1.5; // 1.5x larger
            player.scale.set(-playerScale, playerScale); // Negative X to face right
            gameContainer.addChild(player);
            playerRef.current = player;
            player.baseX = playerX;
            player.baseY = characterY;

            // --- Player Shadow ---
            const playerShadow = new PIXI.Graphics();
            playerShadow.ellipse(playerX, groundY - 2, 35, 12);
            playerShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(playerShadow, 0);

            // --- Player glow effect ---
            const playerGlow = new PIXI.Graphics();
            playerGlow.circle(playerX, characterY - 40, 60);
            playerGlow.fill({ color: 0x3b82f6, alpha: 0.1 });
            gameContainer.addChildAt(playerGlow, 0);

            // --- Create Enemy using NEW sprite PNGs ---
            // Start with a placeholder, will be updated by state change
            const enemy = new PIXI.Sprite(PIXI.Texture.WHITE);
            enemy.anchor.set(0.5, 1);
            enemy.x = enemyX;
            enemy.y = characterY;
            enemy.scale.set(-5, 5); // Larger enemy sprite, flipped to face left (toward player)
            gameContainer.addChild(enemy);
            enemyRef.current = enemy;
            enemy.baseX = enemyX;
            enemy.baseY = characterY;
            enemy.baseScale = 5; // Store the base scale for animations

            // Load initial sprite based on current zone (use pre-cached texture)
            const initialZone = getZoneById(gameManager.getState()?.currentZone || 0);
            const initialSpriteNum = initialZone.isBoss
                ? (ZONE_BOSS_SPRITES[initialZone.id] || 1)
                : (ZONE_MONSTER_SPRITES[initialZone.id] || 1);
            const initialSpritePath = initialZone.isBoss
                ? `/assets/bosses/Icon${initialSpriteNum}.png`
                : `/assets/monsters/Icon${initialSpriteNum}.png`;

            // Use pre-cached texture (already loaded during init)
            if (monsterTextureCache[initialSpritePath] && enemyRef.current) {
                enemyRef.current.texture = monsterTextureCache[initialSpritePath];
            }

            // --- Enemy Shadow ---
            const enemyShadow = new PIXI.Graphics();
            enemyShadow.ellipse(enemyX, groundY - 2, 35, 12);
            enemyShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(enemyShadow, 0);

            // --- Enemy aura for bosses ---
            const enemyAura = new PIXI.Graphics();
            enemyAura.circle(enemyX, characterY - 40, 80);
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

            // --- HP Bars (Modern style with text display) - 3x larger ---
            const createHpBar = (x, y, width, isPlayer) => {
                const container = new PIXI.Container();
                container.position.set(x, y);

                // Outer frame - simple rect for reliability (3x height: 18 -> 54)
                const frame = new PIXI.Graphics();
                frame.rect(-width/2 - 4, -27, width + 8, 54);
                frame.fill({ color: 0x000000, alpha: 0.7 });
                frame.rect(-width/2 - 4, -27, width + 8, 54);
                frame.stroke({ width: 3, color: isPlayer ? 0x3b82f6 : 0xef4444, alpha: 0.8 });
                container.addChild(frame);

                // Background (3x height: 12 -> 36)
                const bg = new PIXI.Graphics();
                bg.rect(-width/2, -18, width, 36);
                bg.fill(0x1f2937);
                container.addChild(bg);

                // Fill - draw initial full bar (3x height: 12 -> 36)
                const fill = new PIXI.Graphics();
                fill.rect(-width/2, -18, width, 36);
                fill.fill(isPlayer ? 0x3b82f6 : 0xef4444);
                container.addChild(fill);
                container.fillRef = fill;
                container.barWidth = width;
                container.isPlayer = isPlayer;

                // HP Text overlay (shows current/max) - larger font
                const hpTextStyle = new PIXI.TextStyle({
                    fontFamily: 'Rajdhani',
                    fontSize: 20,
                    fontWeight: 'bold',
                    fill: '#ffffff',
                });
                const hpText = new PIXI.Text({ text: '100/100', style: hpTextStyle });
                hpText.anchor.set(0.5);
                hpText.y = 0;
                container.addChild(hpText);
                container.hpText = hpText;

                // Label - larger font
                const labelStyle = new PIXI.TextStyle({
                    fontFamily: 'Rajdhani',
                    fontSize: 14,
                    fontWeight: 'bold',
                    fill: isPlayer ? '#60a5fa' : '#f87171',
                });
                const label = new PIXI.Text({ text: isPlayer ? 'HERO' : 'ENEMY', style: labelStyle });
                label.anchor.set(0.5);
                label.y = -38;
                container.addChild(label);
                container.label = label;

                return container;
            };

            const playerBar = createHpBar(playerX, groundY + 40, 180, true);
            const enemyBar = createHpBar(enemyX, groundY + 40, 180, false);
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

            // --- Zone name display ---
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

                // Player idle animation (breathing + slight bob)
                // Player faces right (negative X scale)
                if (playerRef.current) {
                    const pos = positionsRef.current;
                    const breathe = Math.sin(time * 0.002) * 0.02;
                    const bob = Math.sin(time * 0.003) * 3;
                    const playerBaseScale = (ENEMY_SPRITES['Knight'].scale || 4) * 1.5; // Match init scale
                    playerRef.current.scale.set(-playerBaseScale, playerBaseScale * (1.0 + breathe));
                    playerRef.current.y = (playerRef.current.baseY || pos.characterY) - 25 + bob;

                    // Attack cooldown animation
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

                    // Death animation - very fast (~0.05 seconds)
                    if (animState.enemyDying) {
                        animState.enemyDeathProgress += delta * 0.25;
                        const progress = Math.min(1, animState.enemyDeathProgress);

                        // Quick shrink and fade
                        const deathScale = enemyBaseScale * (1 - progress * 0.5);
                        enemyRef.current.scale.set(-deathScale, deathScale);
                        enemyRef.current.alpha = 1 - progress;
                        enemyRef.current.tint = 0xff4444;

                        // When death completes, immediately start spawn
                        if (progress >= 1) {
                            animState.enemyDying = false;
                            animState.enemyDeathProgress = 0;
                            animState.enemySpawning = true;
                            animState.enemySpawnProgress = 0;
                            enemyRef.current.rotation = 0;
                        }
                    }
                    // Spawn animation - instant appearance
                    else if (animState.enemySpawning) {
                        animState.enemySpawnProgress += delta * 0.4;
                        const progress = Math.min(1, animState.enemySpawnProgress);

                        // Quick pop-in
                        const spawnScale = enemyBaseScale * (0.8 + progress * 0.2);
                        enemyRef.current.scale.set(-spawnScale, spawnScale);
                        enemyRef.current.alpha = 0.5 + progress * 0.5; // Start at 50% alpha
                        enemyRef.current.tint = 0xffffff;

                        if (progress >= 1) {
                            animState.enemySpawning = false;
                            animState.enemySpawnProgress = 0;
                            enemyRef.current.scale.set(-enemyBaseScale, enemyBaseScale);
                            enemyRef.current.alpha = 1;
                        }
                    }
                    // Normal idle
                    else {
                        const pos = positionsRef.current;
                        const breathe = Math.sin(time * 0.0025 + 1) * 0.02;
                        const bob = Math.sin(time * 0.004 + 1) * 4;
                        enemyRef.current.scale.y = enemyBaseScale * (1.0 + breathe);
                        enemyRef.current.y = (enemyRef.current.baseY || pos.characterY) - 25 + bob;
                        enemyRef.current.alpha = 1;
                        enemyRef.current.rotation = 0;

                        // Hit flash
                        if (animState.enemyHitFlash > 0) {
                            animState.enemyHitFlash -= delta;
                            enemyRef.current.tint = 0xff6666;
                        } else {
                            enemyRef.current.tint = 0xffffff;
                        }
                    }
                }

                // Player hit flash
                if (playerRef.current && animState.playerHitFlash > 0) {
                    animState.playerHitFlash -= delta;
                    playerRef.current.tint = 0xff6666;
                } else if (playerRef.current) {
                    playerRef.current.tint = 0xffffff;
                }

                // Update particles
                updateParticles(particleContainer);

                // Spawn ambient particles (limit spawn rate and count)
                if (ambientParticlesRef.current.length < 20 && Math.random() < 0.01) {
                    spawnAmbientParticle();
                }

                // Update HP bars periodically (every 10 frames) from gameManager state
                if (Math.floor(time / 16) % 10 === 0) {
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
                }
            });
        };

        init();

        // Listen for effects
        const cleanupText = gameManager.on('floatingText', (data) => {
            if (!appRef.current || !effectsContainerRef.current) return;
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
                    audioManager.playSfxHeal();
                    break;
                case 'dodge':
                    audioManager.playSfxDodge();
                    break;
                case 'levelup':
                    audioManager.playSfxLevelUp();
                    break;
            }

            // Combat effects
            if (data.type === 'playerDmg' || data.type === 'crit') {
                animStateRef.current.enemyHitFlash = 8;
                animStateRef.current.screenShake.intensity = data.type === 'crit' ? 12 : 6;
                animStateRef.current.playerAttackCooldown = 15;

                // Spawn hit particles at enemy position
                spawnHitParticles(pos.enemyX, pos.characterY - 55, data.type === 'crit' ? 0xfde047 : 0xffffff, data.type === 'crit' ? 20 : 10);
            }
            if (data.type === 'enemyDmg') {
                animStateRef.current.playerHitFlash = 8;
                animStateRef.current.screenShake.intensity = 4;
                spawnHitParticles(pos.playerX, pos.characterY - 55, 0xef4444, 8);
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
            // Clean up graphics pool to prevent memory leaks
            if (graphicsPoolRef.current) {
                graphicsPoolRef.current.destroy();
            }
            activeGraphicsRef.current = [];
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    // Background image ref for zone changes
    const bgSpriteRef = useRef(null);
    const bgContainerRef = useRef(null);

    // Get background image path based on zone (progressive darkness)
    function getBackgroundForZone(zoneId) {
        // Forest zones (0-4) use forest backgrounds progressively darker
        if (zoneId <= 4) {
            const bgIndex = Math.min(Math.floor(zoneId / 1.25) + 1, 4);
            return `/assets/backgrounds/forest_0${bgIndex}.png`;
        }
        // Later zones also use forest backgrounds (cycle through them with increasing darkness)
        const bgIndex = Math.min((zoneId % 4) + 1, 4);
        return `/assets/backgrounds/forest_0${bgIndex}.png`;
    }

    // Create animated background with forest image
    async function createBackground(container, width = 800, height = 600, zoneId = 0) {
        // Load forest background image based on zone
        const bgPath = getBackgroundForZone(zoneId);
        try {
            const bgTexture = await PIXI.Assets.load(bgPath);
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
            const bgTexture = await PIXI.Assets.load(bgPath);
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
                const spriteNum = ZONE_BOSS_SPRITES[zoneId] || 1;
                spritePath = `/assets/bosses/Icon${spriteNum}.png`;
            } else {
                const spriteNum = ZONE_MONSTER_SPRITES[zoneId] || 1;
                spritePath = `/assets/monsters/Icon${spriteNum}.png`;
            }

            // Apply texture from cache (all sprites are pre-loaded during init)
            if (monsterTextureCache[spritePath]) {
                enemyRef.current.texture = monsterTextureCache[spritePath];
            } else {
                // Fallback: load async if somehow not cached (shouldn't happen)
                PIXI.Assets.load(spritePath).then((texture) => {
                    texture.source.scaleMode = 'nearest';
                    monsterTextureCache[spritePath] = texture;
                    if (enemyRef.current) {
                        enemyRef.current.texture = texture;
                    }
                }).catch(err => console.warn('Failed to load monster sprite:', spritePath, err));
            }

            // Scale for 32x32 sprites - larger for bosses (increased by 1.5x)
            const baseScale = zone.isBoss ? 6.5 : 5;
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
                effectsContainerRef.current.parent.zoneText.text = zone.name.replace(/🔥|🌟/g, '').trim();
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

    // Create new fill Graphics (3x height: 12 -> 36)
    const fill = new PIXI.Graphics();
    if (pct > 0) {
        // Main fill
        fill.rect(-width/2, -18, barWidth, 36);
        fill.fill(color1);

        // Highlight on top
        fill.rect(-width/2, -18, barWidth, 10);
        fill.fill({ color: 0xffffff, alpha: 0.2 });
    }

    // Add at index 2 (after frame and bg)
    barContainer.addChildAt(fill, 2);
    barContainer.fillRef = fill;
}

function spawnFloatingText(app, container, { text, type, target }, positions = {}) {
    if (!container) return;

    const { playerX = 200, enemyX = 600, characterY = 350 } = positions;

    const isCrit = type === 'crit';
    const isHeal = type === 'heal';
    const isDodge = type === 'dodge';
    const isPlayerDmg = type === 'playerDmg';
    const isEnemyDmg = type === 'enemyDmg';
    const isThorns = type === 'thorns';
    const isSilver = type === 'silver';
    const isSilverLoss = type === 'silverLoss';
    const isXp = type === 'xp';
    const isLoot = type === 'loot';

    let fillColor = '#ffffff';
    let fontSize = 24;

    // Position offsets to prevent overlap - different types go to different areas
    let offsetX = 0;
    let offsetY = 0;

    if (isCrit) {
        fillColor = '#fde047';
        fontSize = 32;
        offsetY = -40; // Crits float high above
    } else if (isHeal) {
        fillColor = '#4ade80';
        fontSize = 22;
        offsetX = -60; // Heals to the left of player
        offsetY = 20;
    } else if (isDodge) {
        fillColor = '#67e8f9';
        fontSize = 20;
        offsetX = 50; // Dodge to the right
        offsetY = -20;
    } else if (isPlayerDmg) {
        fillColor = '#f87171';
        fontSize = 24;
        offsetY = 0; // Player damage centered on enemy
    } else if (isEnemyDmg) {
        fillColor = '#f87171';
        fontSize = 22;
        offsetX = 40; // Enemy damage to the right of player
        offsetY = 10;
    } else if (isThorns) {
        fillColor = '#c084fc';
        fontSize = 18;
        offsetX = -40; // Thorns to the left of enemy
        offsetY = 30;
    } else if (isSilver) {
        fillColor = '#c0c0c0';
        fontSize = 22;
    } else if (isSilverLoss) {
        fillColor = '#ef4444';
        fontSize = 20;
    } else if (isXp) {
        fillColor = '#a78bfa';
        fontSize = 22;
    } else if (isLoot) {
        fillColor = '#34d399';
        fontSize = 24;
    }

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize,
        fill: fillColor,
        stroke: { color: '#000000', width: 4 },
        dropShadow: {
            color: '#000000',
            distance: 2,
            blur: 3,
            alpha: 0.8,
        },
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);

    // Base position based on target
    const baseX = target === 'player' ? playerX : enemyX;
    const baseY = characterY - 70;

    // Apply type-specific offset + small random spread
    pixiText.x = baseX + offsetX + (Math.random() - 0.5) * 30;
    pixiText.y = baseY + offsetY + (Math.random() - 0.5) * 15;

    container.addChild(pixiText);

    let velocityY = isCrit ? -2.5 : -1.5; // Slower upward movement
    let velocityX = (Math.random() - 0.5) * 0.6;
    let tick = 0;
    const scale = isCrit ? 1.5 : 1.2;

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

    const { enemyX = 600, characterY = 350 } = positions;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize: 18, // Increased from 14
        fontWeight: 'bold',
        fill: color || '#fbbf24',
        stroke: { color: '#000000', width: 4 },
        dropShadow: {
            color: '#000000',
            distance: 2,
            blur: 3,
            alpha: 0.9,
        },
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);
    pixiText.x = enemyX;
    pixiText.y = characterY - 70;
    pixiText.alpha = 0;

    container.addChild(pixiText);

    let velocityX = (Math.random() - 0.5) * 4;
    let velocityY = -3 - Math.random() * 2; // Slower movement
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
