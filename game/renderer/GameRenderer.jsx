import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useGame } from '../context/GameContext';
import { ZONE_BACKGROUNDS } from '../../assets/gameAssets'; // Need to fix this import path later or mock it

export default function GameRenderer() {
    const containerRef = useRef(null);
    const appRef = useRef(null);
    const { gameManager, state } = useGame();

    // Entities refs for updating
    const playerRef = useRef(null);
    const enemyRef = useRef(null);
    const effectsContainerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Pixi App
        const app = new PIXI.Application();

        const init = async () => {
            await app.init({
                width: 800,
                height: 450,
                backgroundColor: 0x111111,
                antialias: true
            });

            if (!containerRef.current) return; // Component might have unmounted
            containerRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Container Layers
            const bgContainer = new PIXI.Container();
            const gameContainer = new PIXI.Container(); // Characters
            const uiContainer = new PIXI.Container();   // HP Bars
            const fxContainer = new PIXI.Container();   // Particles/Text

            app.stage.addChild(bgContainer);
            app.stage.addChild(gameContainer);
            app.stage.addChild(uiContainer);
            app.stage.addChild(fxContainer);
            effectsContainerRef.current = fxContainer;

            // --- Create Player ---
            const player = new PIXI.Graphics();
            player.rect(-20, -40, 40, 80); // Simple body
            player.fill(0x3b82f6);
            player.x = 200;
            player.y = 300;

            // Player Glow
            // Note: Filters might need extra bundle in v8, sticking to graphics for now
            // or simulating glow with additive sprite if available.
            // For now, simple box.

            gameContainer.addChild(player);
            playerRef.current = player;

            // --- Create Enemy ---
            const enemy = new PIXI.Graphics();
            enemy.rect(-30, -50, 60, 100);
            enemy.fill(0xef4444);
            enemy.x = 600;
            enemy.y = 300;
            gameContainer.addChild(enemy);
            enemyRef.current = enemy;

            // Game Loop for animations (independent of logic loop)
            app.ticker.add((ticker) => {
                const time = ticker.lastTime;

                // Idle bobbing
                if (player) player.y = 300 + Math.sin(time * 0.005) * 5;
                if (enemy) enemy.y = 300 + Math.sin(time * 0.004 + 1) * 5;
            });
        };

        init();

        // Listen for effects
        const cleanupText = gameManager.on('floatingText', (data) => {
            if (!appRef.current) return;
            spawnFloatingText(appRef.current, effectsContainerRef.current, data);
        });

        return () => {
            cleanupText();
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, []);

    // Update State (HP, etc)
    useEffect(() => {
        // This runs on React render cycle (synced with state)
        // We can update HP bars here if we had them as Pixi graphics references
        // Ideally, we'd do this in the ticker by reading from a shared Ref, 
        // but React props is fine for low-frequency updates like "Zone Changed".
        // For HP bars 60fps, we might want to read directly from gameManager.state in the ticker.

        // Update Enemy Color/Shape based on Zone?
        if (enemyRef.current && state) {
            // Simple color swap for feedback
            // enemyRef.current.tint = ...
        }
    }, [state]);

    return (
        <div className="w-full flex justify-center py-4">
            <div ref={containerRef} className="border-4 border-slate-800 rounded-lg shadow-2xl overflow-hidden" />
        </div>
    );
}

function spawnFloatingText(app, container, { text, type, target }) {
    if (!container) return;

    const style = new PIXI.TextStyle({
        fontFamily: 'Press Start 2P',
        fontSize: 20,
        fill: type === 'crit' ? '#ffeb3b' : (type === 'heal' ? '#4ade80' : '#ffffff'),
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
    });

    const pixiText = new PIXI.Text({ text, style });
    pixiText.x = target === 'player' ? 200 : 600;
    pixiText.y = target === 'player' ? 250 : 250;
    pixiText.anchor.set(0.5);

    // Add some randomness
    pixiText.x += (Math.random() - 0.5) * 40;
    pixiText.y += (Math.random() - 0.5) * 40;

    container.addChild(pixiText);

    // Animate
    let elapsed = 0;
    const duration = 1000; // 1s
    const startY = pixiText.y;

    const animate = (ticker) => {
        elapsed += ticker.deltaTime; // This is frames, not ms in v8? CHECK.
        // Actually ticker.deltaTime is scalar (1 = 60fps). 
        // Let's rely on time checking or just approximate.

        pixiText.y -= 2; // Float up
        pixiText.alpha -= 0.02;

        if (pixiText.alpha <= 0) {
            app.ticker.remove(animate);
            pixiText.destroy();
        }
    };

    app.ticker.add(animate);
}
