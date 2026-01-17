import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ASSET_BASE, ENEMY_SPRITES } from '../../assets/gameAssets';
import { getZoneById } from '../data/zones';

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

            // Load Spritesheet with procedural fallback
            let sheetTexture;
            try {
                sheetTexture = await PIXI.Assets.load(ASSET_BASE.characters);
                sheetTexture.source.scaleMode = 'nearest'; // Ensure pixel art look
            } catch (e) {
                console.warn("Asset load failed, using procedural sprites");
                // Generate a sprite sheet on the fly
                const canvas = document.createElement('canvas');
                canvas.width = 128; // Enough for a few rows
                canvas.height = 128;
                const ctx = canvas.getContext('2d');

                // Helper to draw a pixel character
                const drawChar = (x, y, color, type) => {
                    ctx.fillStyle = color;
                    // Body
                    ctx.fillRect(x + 4, y + 4, 8, 8);
                    // Head
                    ctx.fillRect(x + 4, y, 8, 4);
                    // Legs
                    ctx.fillRect(x + 5, y + 12, 2, 4);
                    ctx.fillRect(x + 9, y + 12, 2, 4);

                    if (type === 'hero') {
                        ctx.fillStyle = '#fbbf24'; // Gold helmet
                        ctx.fillRect(x + 4, y, 8, 2);
                        ctx.fillStyle = '#ffffff'; // Sword
                        ctx.fillRect(x + 12, y + 6, 2, 8);
                    } else if (type === 'enemy') {
                        ctx.fillStyle = '#000000'; // Eyes
                        ctx.fillRect(x + 5, y + 5, 2, 2);
                        ctx.fillRect(x + 9, y + 5, 2, 2);
                        ctx.fillStyle = '#ef4444'; // Red Eyes
                        ctx.fillRect(x + 5, y + 6, 1, 1);
                        ctx.fillRect(x + 9, y + 6, 1, 1);
                    }
                };

                // Draw Hero at 0, 80 (Row 5 ish) similar to our previous logic
                drawChar(0, 80, '#3b82f6', 'hero'); // Blue Hero

                // Draw Enemy at 0, 0
                drawChar(0, 0, '#ef4444', 'enemy'); // Red Enemy

                sheetTexture = await PIXI.Assets.load(canvas.toDataURL());
                sheetTexture.source.scaleMode = 'nearest';
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

            // --- Create Player (Hero) ---
            // Assuming the hero is the first sprite in row 2 (index based on 16x16 grid)
            // The spritesheet is packed. Kenney's Tiny RPG has 12 columns.
            // Row 0: 0-11, Row 1: 12-23...
            // Let's grab a hero-looking sprite. Row 7, Col 0 is usually a knight.
            // 16x16 pixels. Spacing 1px sometimes? Let's assume standard grid.

            // Note: ENEMY_SPRITES has explicit frames. Let's use similar logic for player.
            // Let's use Humanoid frame for player default.
            let playerTexture;
            try {
                // Safeguard against missing frames if asset failed
                playerTexture = new PIXI.Texture({
                    source: sheetTexture.source,
                    frame: new PIXI.Rectangle(0, 80, 16, 16) // A knight
                });
            } catch {
                playerTexture = PIXI.Texture.WHITE;
            }
            const player = new PIXI.Sprite(playerTexture);
            player.scale.set(4, 4); // Scale up 4x
            player.anchor.set(0.5);
            player.x = 200;
            player.y = 300;
            player.eventMode = 'none'; // Passive
            if (playerTexture === PIXI.Texture.WHITE) {
                player.tint = 0x3b82f6; // Blue hero fallback
                player.width = 64;
                player.height = 64;
            }

            gameContainer.addChild(player);
            playerRef.current = player;

            // --- Player Shadow ---
            const shadow = new PIXI.Graphics();
            shadow.ellipse(0, 0, 8, 4);
            shadow.fill({ color: 0x000000, alpha: 0.5 });
            shadow.y = 12; // Below feet
            player.addChildAt(shadow, 0);

            // --- Create Enemy ---
            // Start with generic placeholder, updated on state change
            let enemyTexture;
            try {
                enemyTexture = new PIXI.Texture({
                    source: sheetTexture.source,
                    frame: new PIXI.Rectangle(0, 0, 16, 16)
                });
            } catch {
                enemyTexture = PIXI.Texture.WHITE;
            }
            const enemy = new PIXI.Sprite(enemyTexture);
            enemy.scale.set(4, 4);
            enemy.anchor.set(0.5);
            enemy.x = 600;
            enemy.y = 300;
            if (enemyTexture === PIXI.Texture.WHITE) {
                enemy.tint = 0xef4444; // Red enemy fallback
                enemy.width = 64;
                enemy.height = 64;
            }
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
            const spriteData = ENEMY_SPRITES[enemyType] || ENEMY_SPRITES['Beast'];

            // Check if texture frame needs update
            // We can compare current Texture frame with target
            const newFrame = new PIXI.Rectangle(
                spriteData.frame.x,
                spriteData.frame.y,
                spriteData.frame.w,
                spriteData.frame.h
            );

            // Create a new texture view for the frame
            const newTexture = new PIXI.Texture({
                source: textureSheetRef.current.source,
                frame: newFrame
            });
            enemyRef.current.texture = newTexture;

            // Scale Bosses
            if (zone.isBoss) {
                enemyRef.current.scale.set(6, 6);
                // Tint bosses red/menacing
                enemyRef.current.tint = 0xffaaaa;
            } else {
                enemyRef.current.scale.set(4, 4);
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
