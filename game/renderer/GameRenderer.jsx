import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ASSET_BASE, ENEMY_SPRITES } from '../../assets/gameAssets';
import { getZoneById } from '../data/zones';
import { loadAndProcessImage } from '../utils/assetLoader';

export default function GameRenderer() {
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const { gameManager, state } = useGame();

    // Entities refs for updating
    const playerRef = useRef(null);
    const enemyRef = useRef(null);
    const playerHpBarRef = useRef(null);
    const enemyHpBarRef = useRef(null);

    const textureSheetRef = useRef(null);
    const effectsContainerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const app = new PIXI.Application();

        const init = async () => {
            await app.init({
                width: 800,
                height: 450,
                backgroundColor: 0x111111,
                antialias: false, // Start with pixel art settings (nearest neighbor implied by texture settings usually)
            });

            if (!containerRef.current) return;
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Load Spritesheet
            let sheetTexture;
            try {
                // Process transparency first
                const cleanedUrl = await loadAndProcessImage(ASSET_BASE.characters);
                sheetTexture = await PIXI.Assets.load(cleanedUrl);
                sheetTexture.source.scaleMode = 'nearest';
            } catch (e) {
                console.error("Failed to load assets", e);
                return;
            }
            textureSheetRef.current = sheetTexture;

            // Containers
            const bgContainer = new PIXI.Container();
            const gameContainer = new PIXI.Container();
            const uiContainer = new PIXI.Container();
            const fxContainer = new PIXI.Container();

            app.stage.addChild(bgContainer);
            app.stage.addChild(gameContainer);
            app.stage.addChild(uiContainer);
            app.stage.addChild(fxContainer);
            effectsContainerRef.current = fxContainer;

            // --- Sprite Slicing Helper ---
            // The generated image is likely 1024x1024.
            // Adjusted grid back to 8 cols but with scale reduction to fit screen.
            const COL_COUNT = 8;
            const ROW_COUNT = 8;
            const CELL_WIDTH = sheetTexture.width / COL_COUNT;
            const CELL_HEIGHT = sheetTexture.height / ROW_COUNT;

            const getSpriteFrame = (row, col) => {
                // Return cropped frame (85% width to avoid bleed)
                return new PIXI.Rectangle(
                    col * CELL_WIDTH,
                    row * CELL_HEIGHT,
                    CELL_WIDTH * 0.85,
                    CELL_HEIGHT
                );
            };

            // --- Create Player (Hero) ---
            // Row 0, Col 0 (Knight)
            const playerTexture = new PIXI.Texture({
                source: sheetTexture.source,
                frame: getSpriteFrame(0, 0) // Row 0 is Knight
            });

            const player = new PIXI.Sprite(playerTexture);
            // Generated sprites are high res.
            // Screen is 450px high. 1024/8 = 128px per cell.
            // Scale 0.8 -> ~102px visual height. Good.
            player.scale.set(0.8, 0.8);
            player.anchor.set(0.5);
            player.x = 200;
            player.y = 300;

            gameContainer.addChild(player);
            playerRef.current = player;

            // --- Player Shadow ---
            const shadow = new PIXI.Graphics();
            shadow.ellipse(0, 0, 24, 8);
            shadow.fill({ color: 0x000000, alpha: 0.5 });
            shadow.y = 40;
            player.addChildAt(shadow, 0);

            // --- Create Enemy ---
            // Start with generic placeholder, updated on state change
            const enemyTexture = new PIXI.Texture({
                source: sheetTexture.source,
                frame: getSpriteFrame(1, 0) // Default to Skeleton (Row 1)
            });

            const enemy = new PIXI.Sprite(enemyTexture);
            enemy.width = 96;
            enemy.height = 96;
            enemy.anchor.set(0.5);
            enemy.x = 600;
            enemy.y = 300;

            gameContainer.addChild(enemy);
            enemyRef.current = enemy;

            // --- Enemy Shadow ---
            const enemyShadow = new PIXI.Graphics();
            enemyShadow.ellipse(0, 0, 8, 4);
            enemyShadow.fill({ color: 0x000000, alpha: 0.5 });
            enemyShadow.y = 12;
            enemy.addChildAt(enemyShadow, 0);


            // --- HP Bars ---
            const createHpBar = (x, y) => {
                const container = new PIXI.Container();
                container.position.set(x, y);

                // Background
                const bg = new PIXI.Graphics();
                bg.rect(-50, -6, 100, 12);
                bg.fill(0x333333);
                bg.stroke({ width: 2, color: 0x000000 });
                container.addChild(bg);

                // Fill
                const fill = new PIXI.Graphics();
                container.addChild(fill);
                container.fillRef = fill; // Store ref

                return container;
            };

            const playerBar = createHpBar(200, 360);
            const enemyBar = createHpBar(600, 360);
            uiContainer.addChild(playerBar);
            uiContainer.addChild(enemyBar);
            playerHpBarRef.current = playerBar;
            enemyHpBarRef.current = enemyBar;


            // --- Animation Loop ---
            app.ticker.add((ticker) => {
                const time = ticker.lastTime;

                // Bobbing animation
                if (playerRef.current) {
                    playerRef.current.y = 300 + Math.sin(time * 0.003) * 5;
                }
                if (enemyRef.current) {
                    enemyRef.current.y = 300 + Math.sin(time * 0.004 + 1) * 5;
                }
            });
        };

        const cleanupInit = init();

        // Listen for effects
        const cleanupText = gameManager.on('floatingText', (data) => {
            if (!appRef.current || !effectsContainerRef.current) return;
            spawnFloatingText(appRef.current, effectsContainerRef.current, data);

            // Shake effect on damage
            if (data.type === 'playerDmg' || data.type === 'crit') {
                if (enemyRef.current) {
                    // Simple shake
                    const originalX = 600;
                    const shakeIntensity = data.type === 'crit' ? 10 : 5;
                    const shakeDuration = 200;
                    const startTime = performance.now();

                    const shake = () => {
                        const now = performance.now();
                        const progress = (now - startTime) / shakeDuration;
                        if (progress >= 1) {
                            enemyRef.current.x = originalX;
                            appRef.current.ticker.remove(shake);
                            return;
                        }
                        enemyRef.current.x = originalX + (Math.random() - 0.5) * shakeIntensity;
                    };
                    appRef.current.ticker.add(shake);
                }
            }
            if (data.type === 'enemyDmg') {
                if (playerRef.current) {
                    const originalX = 200;
                    const shake = () => { /* reuse logic? inline for now */ };
                    // Simplified: just one little nudge
                    playerRef.current.x = originalX - 5;
                    setTimeout(() => { if (playerRef.current) playerRef.current.x = originalX; }, 50);
                }
            }
        });

        // Listen for Loot
        const cleanupLoot = gameManager.on('lootDrop', ({ items }) => {
            if (!appRef.current || !effectsContainerRef.current) return;
            items.forEach((item, index) => {
                setTimeout(() => {
                    spawnLootText(appRef.current, effectsContainerRef.current, item);
                }, index * 200);
            });
        });


        return () => {
            cleanupText();
            cleanupLoot();
            // We'll trust React to unmount init async safely-ish.
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);


    // --- Update Visuals on State Change ---
    useEffect(() => {
        if (!state) return;

        // 1. Update Sprites based on Zone/Enemy Type
        if (enemyRef.current && textureSheetRef.current && state) {
            const zone = getZoneById(state.currentZone);
            const enemyType = zone.enemyType;
            const spriteLoc = ENEMY_SPRITES[enemyType] || ENEMY_SPRITES['Beast'];

            // Re-calc cell size. 
            // 8 Columns is standard for 1024px sheets (128px cells).
            // 10 or 12 clips the Dragon. 8 caused ghosting, so we trim the width.
            const COL_COUNT = 8;
            const ROW_COUNT = 8;
            const CELL_WIDTH = textureSheetRef.current.width / COL_COUNT;
            const CELL_HEIGHT = textureSheetRef.current.height / ROW_COUNT;

            // Check if texture frame needs update
            const newFrame = new PIXI.Rectangle(
                (spriteLoc.col || 0) * CELL_WIDTH,
                (spriteLoc.row || 0) * CELL_HEIGHT,
                CELL_WIDTH * 0.85, // Trim 15% to securely remove neighbor ghosting
                CELL_HEIGHT
            );

            // Create a new texture view for the frame
            const newTexture = new PIXI.Texture({
                source: textureSheetRef.current.source,
                frame: newFrame
            });
            enemyRef.current.texture = newTexture;

            // Scale Bosses / Adjust Size
            // Original sprites are ~100px.
            // Screen is 450px high. 
            // Scale 1.0 is huge. Let's reduce.
            if (zone.isBoss) {
                // Bosses: Scale 1.25x (approx 160px tall), Flip X
                enemyRef.current.scale.set(-1.25, 1.25);
                enemyRef.current.tint = 0xffffff;
            } else {
                // Normal: Scale 0.8x (approx 100px tall), Flip X
                enemyRef.current.scale.set(-0.8, 0.8);
                enemyRef.current.tint = 0xffffff;
            }
        }

        // 2. Update HP Bars
        if (playerHpBarRef.current && playerHpBarRef.current.fillRef) {
            updateHpBar(playerHpBarRef.current.fillRef, state.playerHp, state.playerMaxHp, 0x3b82f6);
        }
        if (enemyHpBarRef.current && enemyHpBarRef.current.fillRef) {
            updateHpBar(enemyHpBarRef.current.fillRef, state.enemyHp, state.enemyMaxHp, 0xef4444);
        }

    }, [state]);

    return (
        <div className="w-full flex justify-center py-4">
            {/* Glow filter behind the canvas for "CRT" feel? Maybe later. */}
            <div ref={containerRef} className="border-4 border-slate-800 rounded-lg shadow-2xl overflow-hidden bg-black" />
        </div>
    );
}

function updateHpBar(graphics, current, max, color) {
    graphics.clear();
    if (max <= 0) return;
    const pct = Math.max(0, Math.min(1, current / max));
    graphics.rect(-50, -6, 100 * pct, 12);
    graphics.fill(color);
}

function spawnFloatingText(app, container, { text, type, target }) {
    if (!container) return;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P', // Ensure this font is loaded in index.html
        fontSize: type === 'crit' ? 24 : 16,
        fill: type === 'crit' ? '#fde047' : (type === 'heal' ? '#4ade80' : (type === 'dodge' ? '#67e8f9' : '#ffffff')),
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center',
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowDistance: 2,
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);
    pixiText.x = target === 'player' ? 200 : 600;
    // Start slightly higher
    pixiText.y = target === 'player' ? 280 : 280;

    // Spread
    pixiText.x += (Math.random() - 0.5) * 60;
    pixiText.y += (Math.random() - 0.5) * 20;

    container.addChild(pixiText);

    let velocityY = -2;
    const duration = 60; // frames roughly
    let tick = 0;

    const animate = () => {
        tick++;
        pixiText.y += velocityY;
        velocityY += 0.05; // Gravity

        if (tick > 30) {
            pixiText.alpha -= 0.05;
        }

        if (pixiText.alpha <= 0) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };

    app.ticker.add(animate);
}

function spawnLootText(app, container, { text, color }) {
    if (!container) return;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize: 12,
        fill: color || '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.anchor.set(0.5);
    pixiText.x = 600; // Drop from enemy
    pixiText.y = 300;

    container.addChild(pixiText);

    // Arcing animation (fountain)
    let velocityX = (Math.random() - 0.5) * 4;
    let velocityY = -4 - Math.random() * 2;

    const animate = () => {
        pixiText.x += velocityX;
        pixiText.y += velocityY;
        velocityY += 0.2; // Gravity

        // Bounce floor? No just fade out
        if (pixiText.y > 350) {
            pixiText.alpha -= 0.02;
        }

        if (pixiText.alpha <= 0) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };
    app.ticker.add(animate);
}
