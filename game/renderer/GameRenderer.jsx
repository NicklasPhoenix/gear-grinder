import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ASSET_BASE, ENEMY_SPRITES, SPRITE_CONFIG, ZONE_BACKGROUNDS } from '../../assets/gameAssets';
import { getZoneById } from '../data/zones';

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

export default function GameRenderer() {
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const { gameManager, state } = useGame();

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

    // Animation state
    const animStateRef = useRef({
        playerAttackCooldown: 0,
        enemyHitFlash: 0,
        playerHitFlash: 0,
        screenShake: { x: 0, y: 0, intensity: 0 },
        lastZone: -1,
    });

    useEffect(() => {
        if (!containerRef.current) return;

        const app = new PIXI.Application();

        const init = async () => {
            await app.init({
                width: 800,
                height: 450,
                backgroundColor: 0x0a0a0f,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (!containerRef.current) return;
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

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

            // --- Load all character sprite sheets ---
            const spriteSheets = {};
            const sheetNames = ['player', 'humanoid', 'demon', 'undead', 'beast', 'reptile', 'elemental', 'avian', 'misc'];

            for (const sheetName of sheetNames) {
                try {
                    const sheet = await PIXI.Assets.load(ASSET_BASE[sheetName]);
                    sheet.source.scaleMode = 'nearest';
                    spriteSheets[sheetName] = sheet;
                } catch (e) {
                    console.warn(`Failed to load sprite sheet: ${sheetName}`, e);
                }
            }
            spriteSheetRef.current = spriteSheets;

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
            createBackground(bgContainer);

            // --- Ground/Floor ---
            const ground = new PIXI.Graphics();
            ground.rect(0, 380, 800, 70);
            ground.fill({ color: 0x1a1a2e });
            ground.rect(0, 378, 800, 4);
            ground.fill({ color: 0x2a2a4e });
            bgContainer.addChild(ground);

            // Grid lines on ground for depth
            const gridLines = new PIXI.Graphics();
            gridLines.setStrokeStyle({ width: 1, color: 0x2a2a4e, alpha: 0.3 });
            for (let i = 0; i < 20; i++) {
                const x = i * 50 - 100;
                gridLines.moveTo(x, 380);
                gridLines.lineTo(x + 200, 450);
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
            player.x = 200;
            player.y = 375;
            const playerScale = playerData.scale || 4;
            player.scale.set(-playerScale, playerScale); // Negative X to face right
            gameContainer.addChild(player);
            playerRef.current = player;

            // --- Player Shadow ---
            const playerShadow = new PIXI.Graphics();
            playerShadow.ellipse(200, 378, 25, 8);
            playerShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(playerShadow, 0);

            // --- Player glow effect ---
            const playerGlow = new PIXI.Graphics();
            playerGlow.circle(200, 350, 50);
            playerGlow.fill({ color: 0x3b82f6, alpha: 0.1 });
            gameContainer.addChildAt(playerGlow, 0);

            // --- Create Enemy using real sprite ---
            // DawnLike sprites face LEFT by default, which is toward the player - no flip needed
            const enemyData = ENEMY_SPRITES['Beast'];
            const enemyTexture = getSpriteTexture(enemyData);
            const enemy = enemyTexture
                ? new PIXI.Sprite(enemyTexture)
                : new PIXI.Graphics().rect(-8, -8, 16, 16).fill(0x22c55e);
            enemy.anchor.set(0.5, 1);
            enemy.x = 600;
            enemy.y = 375;
            const enemyScale = enemyData.scale || 4;
            enemy.scale.set(enemyScale, enemyScale); // Positive X - already faces left toward player
            gameContainer.addChild(enemy);
            enemyRef.current = enemy;

            // --- Enemy Shadow ---
            const enemyShadow = new PIXI.Graphics();
            enemyShadow.ellipse(600, 378, 25, 8);
            enemyShadow.fill({ color: 0x000000, alpha: 0.4 });
            gameContainer.addChildAt(enemyShadow, 0);

            // --- Enemy aura for bosses ---
            const enemyAura = new PIXI.Graphics();
            enemyAura.circle(600, 350, 60);
            enemyAura.fill({ color: 0xef4444, alpha: 0 });
            gameContainer.addChildAt(enemyAura, 0);
            enemy.aura = enemyAura;
            enemy.shadow = enemyShadow;

            // Store shadow ref
            player.shadow = playerShadow;
            player.glow = playerGlow;

            // --- HP Bars (Modern style) ---
            const createHpBar = (x, y, width, isPlayer) => {
                const container = new PIXI.Container();
                container.position.set(x, y);

                // Outer frame
                const frame = new PIXI.Graphics();
                frame.roundRect(-width/2 - 3, -9, width + 6, 18, 4);
                frame.fill({ color: 0x000000, alpha: 0.6 });
                frame.stroke({ width: 2, color: isPlayer ? 0x3b82f6 : 0xef4444, alpha: 0.5 });
                container.addChild(frame);

                // Background
                const bg = new PIXI.Graphics();
                bg.roundRect(-width/2, -6, width, 12, 3);
                bg.fill(0x1f2937);
                container.addChild(bg);

                // Fill
                const fill = new PIXI.Graphics();
                container.addChild(fill);
                container.fillRef = fill;
                container.barWidth = width;
                container.isPlayer = isPlayer;

                // Label
                const labelStyle = new PIXI.TextStyle({
                    fontFamily: 'Rajdhani',
                    fontSize: 10,
                    fontWeight: 'bold',
                    fill: isPlayer ? '#60a5fa' : '#f87171',
                });
                const label = new PIXI.Text({ text: isPlayer ? 'HERO' : 'ENEMY', style: labelStyle });
                label.anchor.set(0.5);
                label.y = -20;
                container.addChild(label);
                container.label = label;

                return container;
            };

            const playerBar = createHpBar(200, 400, 120, true);
            const enemyBar = createHpBar(600, 400, 120, false);
            uiContainer.addChild(playerBar);
            uiContainer.addChild(enemyBar);
            playerHpBarRef.current = playerBar;
            enemyHpBarRef.current = enemyBar;

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
            zoneText.x = 400;
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
                    const breathe = Math.sin(time * 0.002) * 0.02;
                    const bob = Math.sin(time * 0.003) * 3;
                    const playerBaseScale = ENEMY_SPRITES['Knight'].scale || 4;
                    playerRef.current.scale.set(-playerBaseScale, playerBaseScale * (1.0 + breathe));
                    playerRef.current.y = 350 + bob;

                    // Attack cooldown animation
                    if (animState.playerAttackCooldown > 0) {
                        animState.playerAttackCooldown -= delta;
                        const progress = animState.playerAttackCooldown / 15;
                        playerRef.current.x = 200 + Math.sin(progress * Math.PI) * 50;
                    } else {
                        playerRef.current.x = 200;
                    }
                }

                // Enemy idle animation
                // Enemy faces left (positive X scale) - toward the player
                if (enemyRef.current) {
                    const breathe = Math.sin(time * 0.0025 + 1) * 0.02;
                    const bob = Math.sin(time * 0.004 + 1) * 4;
                    const enemyBaseScale = enemyRef.current.scale.x; // Positive scale
                    enemyRef.current.scale.y = enemyBaseScale * (1.0 + breathe);
                    enemyRef.current.y = 350 + bob;

                    // Hit flash
                    if (animState.enemyHitFlash > 0) {
                        animState.enemyHitFlash -= delta;
                        enemyRef.current.tint = 0xff6666;
                    } else {
                        enemyRef.current.tint = 0xffffff;
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

                // Spawn ambient particles
                if (Math.random() < 0.02) {
                    spawnAmbientParticle();
                }
            });
        };

        init();

        // Listen for effects
        const cleanupText = gameManager.on('floatingText', (data) => {
            if (!appRef.current || !effectsContainerRef.current) return;
            spawnFloatingText(appRef.current, effectsContainerRef.current, data);

            // Combat effects
            if (data.type === 'playerDmg' || data.type === 'crit') {
                animStateRef.current.enemyHitFlash = 8;
                animStateRef.current.screenShake.intensity = data.type === 'crit' ? 12 : 6;
                animStateRef.current.playerAttackCooldown = 15;

                // Spawn hit particles
                spawnHitParticles(600, 320, data.type === 'crit' ? 0xfde047 : 0xffffff, data.type === 'crit' ? 20 : 10);
            }
            if (data.type === 'enemyDmg') {
                animStateRef.current.playerHitFlash = 8;
                animStateRef.current.screenShake.intensity = 4;
                spawnHitParticles(200, 320, 0xef4444, 8);
            }
        });

        // Listen for Loot
        const cleanupLoot = gameManager.on('lootDrop', ({ items }) => {
            if (!appRef.current || !effectsContainerRef.current) return;

            // Big loot explosion
            spawnLootExplosion(600, 320, 30);

            items.forEach((item, index) => {
                setTimeout(() => {
                    spawnLootText(appRef.current, effectsContainerRef.current, item);
                }, index * 150);
            });
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
            const colors = [0x3b82f6, 0x8b5cf6, 0x22c55e, 0xfbbf24];
            ambientParticlesRef.current.push(new Particle(
                Math.random() * 800,
                450,
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

            container.removeChildren();

            // Update and draw hit particles
            particlesRef.current = particlesRef.current.filter(p => {
                if (p.update()) {
                    const g = new PIXI.Graphics();
                    g.circle(p.x, p.y, p.size * p.alpha);
                    g.fill({ color: p.color, alpha: p.alpha });
                    container.addChild(g);
                    return true;
                }
                return false;
            });

            // Update and draw ambient particles
            ambientParticlesRef.current = ambientParticlesRef.current.filter(p => {
                if (p.update()) {
                    const g = new PIXI.Graphics();
                    g.circle(p.x, p.y, p.size);
                    g.fill({ color: p.color, alpha: p.alpha * 0.5 });
                    container.addChild(g);
                    return true;
                }
                return false;
            });
        }

        return () => {
            cleanupText();
            cleanupLoot();
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    // Create animated background
    function createBackground(container) {
        // Gradient background
        const bg = new PIXI.Graphics();

        // Create a vertical gradient effect
        for (let i = 0; i < 380; i += 2) {
            const progress = i / 380;
            const r = Math.floor(10 + progress * 15);
            const g = Math.floor(10 + progress * 20);
            const b = Math.floor(20 + progress * 30);
            const color = (r << 16) | (g << 8) | b;
            bg.rect(0, i, 800, 2);
            bg.fill(color);
        }
        container.addChild(bg);

        // Stars/particles in background
        const stars = new PIXI.Graphics();
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 350;
            const size = Math.random() * 2;
            const alpha = 0.3 + Math.random() * 0.5;
            stars.circle(x, y, size);
            stars.fill({ color: 0xffffff, alpha });
        }
        container.addChild(stars);

        // Vignette effect
        const vignette = new PIXI.Graphics();
        vignette.rect(0, 0, 800, 450);
        vignette.fill({ color: 0x000000, alpha: 0 });
        // Top gradient
        for (let i = 0; i < 80; i++) {
            vignette.rect(0, i, 800, 1);
            vignette.fill({ color: 0x000000, alpha: (1 - i / 80) * 0.5 });
        }
        // Bottom gradient
        for (let i = 0; i < 50; i++) {
            vignette.rect(0, 400 + i, 800, 1);
            vignette.fill({ color: 0x000000, alpha: (i / 50) * 0.3 });
        }
        container.addChild(vignette);
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

        // 1. Update Enemy Sprite based on Zone/Enemy Type
        if (enemyRef.current) {
            const zone = getZoneById(state.currentZone);
            const enemyType = zone.enemyType;
            const spriteData = ENEMY_SPRITES[enemyType] || ENEMY_SPRITES['Beast'];

            // Update texture from the correct sprite sheet
            const newTexture = getSpriteTexture(spriteData);
            if (newTexture && enemyRef.current.texture) {
                enemyRef.current.texture = newTexture;
            }

            // Scale based on sprite data and boss status
            // DawnLike sprites face LEFT by default - enemy already faces player (positive scale)
            const baseScale = spriteData.scale || 4;
            const finalScale = zone.isBoss ? baseScale * 1.3 : baseScale;
            enemyRef.current.scale.set(finalScale, finalScale); // Positive X - faces left toward player

            if (zone.isBoss) {
                if (enemyRef.current.aura) {
                    enemyRef.current.aura.clear();
                    enemyRef.current.aura.circle(600, 350, 70);
                    enemyRef.current.aura.fill({ color: 0xef4444, alpha: 0.15 });
                }
                if (enemyRef.current.shadow) {
                    enemyRef.current.shadow.clear();
                    enemyRef.current.shadow.ellipse(600, 378, 35, 12);
                    enemyRef.current.shadow.fill({ color: 0x000000, alpha: 0.5 });
                }
            } else {
                if (enemyRef.current.aura) {
                    enemyRef.current.aura.clear();
                }
                if (enemyRef.current.shadow) {
                    enemyRef.current.shadow.clear();
                    enemyRef.current.shadow.ellipse(600, 378, 25, 8);
                    enemyRef.current.shadow.fill({ color: 0x000000, alpha: 0.4 });
                }
            }

            // Update zone text
            if (effectsContainerRef.current?.parent?.zoneText) {
                effectsContainerRef.current.parent.zoneText.text = zone.name.replace(/🔥|🌟/g, '').trim();
            }
        }

        // 2. Update HP Bars
        if (playerHpBarRef.current && playerHpBarRef.current.fillRef) {
            updateHpBar(playerHpBarRef.current, state.playerHp, state.playerMaxHp, true);
        }
        if (enemyHpBarRef.current && enemyHpBarRef.current.fillRef) {
            updateHpBar(enemyHpBarRef.current, state.enemyHp, state.enemyMaxHp, false);
        }

    }, [state]);

    return (
        <div className="w-full flex justify-center">
            <div className="relative">
                {/* Glow effect behind canvas */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 blur-xl scale-110 pointer-events-none" />
                <div
                    ref={containerRef}
                    className="relative border-2 border-slate-700/50 rounded-xl shadow-2xl overflow-hidden bg-black"
                    style={{
                        boxShadow: '0 0 60px rgba(59, 130, 246, 0.15), 0 0 100px rgba(139, 92, 246, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                    }}
                />
                {/* Scanline effect overlay */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-[0.03]"
                    style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                    }}
                />
            </div>
        </div>
    );
}

function updateHpBar(barContainer, current, max, isPlayer) {
    const fill = barContainer.fillRef;
    const width = barContainer.barWidth;

    fill.clear();
    if (max <= 0) return;

    const pct = Math.max(0, Math.min(1, current / max));
    const barWidth = width * pct;

    // Gradient fill based on health
    let color1, color2;
    if (isPlayer) {
        color1 = 0x3b82f6;
        color2 = 0x60a5fa;
    } else {
        if (pct > 0.5) {
            color1 = 0xef4444;
            color2 = 0xf87171;
        } else if (pct > 0.25) {
            color1 = 0xf97316;
            color2 = 0xfb923c;
        } else {
            color1 = 0xdc2626;
            color2 = 0xef4444;
        }
    }

    fill.roundRect(-width/2, -6, barWidth, 12, 3);
    fill.fill(color1);

    // Highlight on top
    fill.roundRect(-width/2, -6, barWidth, 4, 2);
    fill.fill({ color: 0xffffff, alpha: 0.2 });
}

function spawnFloatingText(app, container, { text, type, target }) {
    if (!container) return;

    const isCrit = type === 'crit';
    const isHeal = type === 'heal';
    const isDodge = type === 'dodge';
    const isPlayerDmg = type === 'playerDmg';

    let fillColor = '#ffffff';
    let fontSize = 18;

    if (isCrit) {
        fillColor = '#fde047';
        fontSize = 28;
    } else if (isHeal) {
        fillColor = '#4ade80';
        fontSize = 20;
    } else if (isDodge) {
        fillColor = '#67e8f9';
        fontSize = 16;
    } else if (isPlayerDmg) {
        fillColor = '#f87171';
    }

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize,
        fill: fillColor,
        stroke: { color: '#000000', width: 4 },
        dropShadow: {
            color: '#000000',
            distance: 3,
            blur: 4,
            alpha: 0.8,
        },
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);
    pixiText.x = target === 'player' ? 200 : 600;
    pixiText.y = 280;

    // Add spread
    pixiText.x += (Math.random() - 0.5) * 50;
    pixiText.y += (Math.random() - 0.5) * 20;

    container.addChild(pixiText);

    let velocityY = isCrit ? -3 : -2;
    let velocityX = (Math.random() - 0.5) * 0.8;
    let tick = 0;
    const scale = isCrit ? 1.5 : 1;

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
        velocityY += 0.04; // Slower gravity

        // Start fading much later and fade slower
        if (tick > 70) {
            pixiText.alpha -= 0.04;
        }

        if (pixiText.alpha <= 0 || tick > 120) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };

    app.ticker.add(animate);
}

function spawnLootText(app, container, { text, color }) {
    if (!container) return;

    const style = new PIXI.TextStyle({
        fontFamily: 'Rajdhani',
        fontSize: 14,
        fontWeight: 'bold',
        fill: color || '#fbbf24',
        stroke: { color: '#000000', width: 3 },
        dropShadow: {
            color: '#000000',
            distance: 2,
            blur: 2,
        },
    });

    const pixiText = new PIXI.Text({ text: `+ ${text}`, style });
    pixiText.anchor.set(0.5);
    pixiText.x = 600;
    pixiText.y = 300;
    pixiText.alpha = 0;

    container.addChild(pixiText);

    let velocityX = (Math.random() - 0.5) * 6;
    let velocityY = -5 - Math.random() * 3;
    let tick = 0;

    const animate = () => {
        tick++;

        // Fade in
        if (tick < 5) {
            pixiText.alpha = tick / 5;
        }

        pixiText.x += velocityX;
        pixiText.y += velocityY;
        velocityY += 0.25;
        velocityX *= 0.98;

        if (pixiText.y > 380) {
            velocityY = -velocityY * 0.5;
            pixiText.y = 380;
            if (Math.abs(velocityY) < 1) {
                pixiText.alpha -= 0.03;
            }
        }

        if (tick > 50) {
            pixiText.alpha -= 0.03;
        }

        if (pixiText.alpha <= 0) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };
    app.ticker.add(animate);
}
