import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as PIXI from 'pixi.js';
import './styles/game-v2.css';

// Import game constants from original file
// (We'll keep the game logic but completely rebuild the UI)

export default function GearGrinderV2() {
  const pixiContainerRef = useRef(null);
  const appRef = useRef(null);
  const [currentScene, setCurrentScene] = useState('combat'); // combat, inventory, stats, craft, etc.
  const [gameState, setGameState] = useState({
    // Simplified for now - we'll integrate the full state later
    level: 1,
    xp: 0,
    gold: 100,
    playerHp: 100,
    playerMaxHp: 100,
    enemyHp: 30,
    enemyMaxHp: 30,
  });

  // Initialize PixiJS
  useEffect(() => {
    if (!pixiContainerRef.current || appRef.current) return;

    const initPixi = async () => {
      const app = new PIXI.Application();

      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x0a0a0f,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      pixiContainerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Build the game scene
      buildGameScene(app, gameState);
    };

    initPixi();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="game-container">
      {/* PixiJS Canvas - Full screen background */}
      <div ref={pixiContainerRef} className="pixi-canvas" />

      {/* Game UI Overlay - Fantasy styled, not corporate dashboard */}
      <div className="game-ui-overlay">
        {/* Top HUD */}
        <div className="game-hud-top">
          <div className="game-title">
            <h1>⚔️ GEAR GRINDER ⚔️</h1>
          </div>

          <div className="player-info">
            <div className="level-badge">
              <span className="level-label">LEVEL</span>
              <span className="level-value">{gameState.level}</span>
            </div>

            <div className="xp-bar">
              <div className="xp-fill" style={{ width: '45%' }}></div>
              <span className="xp-text">450 / 1000 XP</span>
            </div>
          </div>

          <div className="resources-bar">
            <div className="resource">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{gameState.gold.toLocaleString()}</span>
            </div>
            <div className="resource">
              <span className="resource-icon">⛏️</span>
              <span className="resource-value">25</span>
            </div>
            <div className="resource">
              <span className="resource-icon">🧶</span>
              <span className="resource-value">18</span>
            </div>
            <div className="resource">
              <span className="resource-icon">💎</span>
              <span className="resource-value">5</span>
            </div>
          </div>
        </div>

        {/* Combat Info - Centered */}
        {currentScene === 'combat' && (
          <div className="combat-info">
            <div className="player-combat-card">
              <div className="combat-card-header">YOUR HERO</div>
              <div className="health-bar player-hp">
                <div className="health-fill" style={{ width: '75%' }}></div>
                <span className="health-text">75 / 100 HP</span>
              </div>
              <div className="combat-stats">
                <div className="stat"><span className="stat-label">DMG</span><span className="stat-value damage">45</span></div>
                <div className="stat"><span className="stat-label">ARMOR</span><span className="stat-value">12</span></div>
                <div className="stat"><span className="stat-label">CRIT</span><span className="stat-value crit">15%</span></div>
              </div>
            </div>

            <div className="enemy-combat-card">
              <div className="combat-card-header enemy">FOREST BEAST</div>
              <div className="health-bar enemy-hp">
                <div className="health-fill" style={{ width: '40%' }}></div>
                <span className="health-text">12 / 30 HP</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="game-nav-bottom">
          <button
            className={`nav-button ${currentScene === 'combat' ? 'active' : ''}`}
            onClick={() => setCurrentScene('combat')}
          >
            ⚔️ COMBAT
          </button>
          <button
            className={`nav-button ${currentScene === 'stats' ? 'active' : ''}`}
            onClick={() => setCurrentScene('stats')}
          >
            📊 STATS
          </button>
          <button
            className={`nav-button ${currentScene === 'inventory' ? 'active' : ''}`}
            onClick={() => setCurrentScene('inventory')}
          >
            🎒 INVENTORY
          </button>
          <button
            className={`nav-button ${currentScene === 'craft' ? 'active' : ''}`}
            onClick={() => setCurrentScene('craft')}
          >
            🔨 CRAFT
          </button>
          <button
            className={`nav-button ${currentScene === 'enhance' ? 'active' : ''}`}
            onClick={() => setCurrentScene('enhance')}
          >
            ✨ ENHANCE
          </button>
          <button
            className={`nav-button ${currentScene === 'skills' ? 'active' : ''}`}
            onClick={() => setCurrentScene('skills')}
          >
            🎯 SKILLS
          </button>
        </div>

        {/* Side panel for current scene */}
        {currentScene !== 'combat' && (
          <div className="game-panel-overlay">
            <div className="game-panel">
              <div className="panel-header">
                <h2>{currentScene.toUpperCase()}</h2>
                <button className="close-button" onClick={() => setCurrentScene('combat')}>✕</button>
              </div>
              <div className="panel-content">
                {/* TODO: Render scene-specific content */}
                <p>Panel content for {currentScene}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Build PixiJS game scene
function buildGameScene(app, gameState) {
  const { stage } = app;

  // Create background layers
  const bgContainer = new PIXI.Container();
  stage.addChild(bgContainer);

  // Dark gradient background
  const bgGradient = new PIXI.Graphics();
  bgGradient.beginFill(0x0a0a0f);
  bgGradient.drawRect(0, 0, app.screen.width, app.screen.height);
  bgGradient.endFill();
  bgContainer.addChild(bgGradient);

  // Animated stars/particles
  for (let i = 0; i < 100; i++) {
    const star = new PIXI.Graphics();
    const size = Math.random() * 2;
    star.beginFill(0xffffff, Math.random() * 0.5 + 0.2);
    star.drawCircle(0, 0, size);
    star.endFill();

    star.x = Math.random() * app.screen.width;
    star.y = Math.random() * app.screen.height;

    bgContainer.addChild(star);

    // Twinkle animation
    app.ticker.add(() => {
      star.alpha = 0.2 + Math.abs(Math.sin(Date.now() * 0.001 + i)) * 0.8;
    });
  }

  // Combat area (center of screen)
  const combatContainer = new PIXI.Container();
  combatContainer.x = app.screen.width / 2;
  combatContainer.y = app.screen.height / 2;
  stage.addChild(combatContainer);

  // Ground platform
  const ground = new PIXI.Graphics();
  ground.beginFill(0x1a1a2e, 0.6);
  ground.drawRoundedRect(-450, 150, 900, 30, 15);
  ground.endFill();
  combatContainer.addChild(ground);

  // Player character (left side)
  const player = createAdvancedPlayerSprite();
  player.x = -250;
  player.y = 100;
  combatContainer.addChild(player);

  // Enemy character (right side)
  const enemy = createAdvancedEnemySprite();
  enemy.x = 250;
  enemy.y = 100;
  combatContainer.addChild(enemy);

  // Add floating combat text system
  const combatTextContainer = new PIXI.Container();
  stage.addChild(combatTextContainer);

  // Particle effects container
  const particlesContainer = new PIXI.Container();
  stage.addChild(particlesContainer);

  // Animation loop
  let time = 0;
  app.ticker.add((delta) => {
    time += delta.deltaTime * 0.01;

    // Idle animations
    player.y = 100 + Math.sin(time) * 10;
    player.rotation = Math.sin(time * 0.5) * 0.05;

    enemy.y = 100 + Math.sin(time + 1) * 10;
    enemy.rotation = Math.sin(time * 0.5 + 1) * 0.05;
  });
}

// Create advanced player sprite with effects
function createAdvancedPlayerSprite() {
  const container = new PIXI.Container();

  // Player body (heroic blue)
  const body = new PIXI.Graphics();

  // Torso
  body.beginFill(0x3b82f6);
  body.drawRoundedRect(-25, -20, 50, 60, 10);
  body.endFill();

  // Head
  body.beginFill(0xfbbf24);
  body.drawCircle(0, -60, 25);
  body.endFill();

  // Eyes
  body.beginFill(0x000000);
  body.drawCircle(-8, -60, 4);
  body.drawCircle(8, -60, 4);
  body.endFill();

  // Cape
  body.beginFill(0x1e40af, 0.7);
  body.moveTo(-25, -10);
  body.lineTo(-35, 40);
  body.lineTo(-15, 35);
  body.lineTo(-25, -10);
  body.endFill();

  body.moveTo(25, -10);
  body.lineTo(35, 40);
  body.lineTo(15, 35);
  body.lineTo(25, -10);
  body.endFill();

  // Legs
  body.beginFill(0x1e3a8a);
  body.drawRect(-20, 40, 15, 35);
  body.drawRect(5, 40, 15, 35);
  body.endFill();

  // Boots
  body.beginFill(0x1f2937);
  body.drawRoundedRect(-20, 70, 15, 10, 3);
  body.drawRoundedRect(5, 70, 15, 10, 3);
  body.endFill();

  // Weapon (glowing sword)
  const sword = new PIXI.Graphics();
  sword.beginFill(0xfbbf24);
  sword.drawRect(25, -40, 8, 60);
  sword.endFill();

  sword.beginFill(0xfcd34d);
  sword.moveTo(29, -45);
  sword.lineTo(33, -60);
  sword.lineTo(37, -45);
  sword.lineTo(29, -45);
  sword.endFill();

  // Glow effect on weapon
  const glow = new PIXI.Graphics();
  glow.beginFill(0xfbbf24, 0.3);
  glow.drawCircle(29, -30, 20);
  glow.endFill();
  glow.filters = [new PIXI.BlurFilter(8)];

  container.addChild(glow);
  container.addChild(body);
  container.addChild(sword);

  return container;
}

// Create advanced enemy sprite with effects
function createAdvancedEnemySprite() {
  const container = new PIXI.Container();

  // Enemy body (menacing red creature)
  const body = new PIXI.Graphics();

  // Main body
  body.beginFill(0xdc2626);
  body.drawEllipse(0, 0, 40, 50);
  body.endFill();

  // Head
  body.beginFill(0xef4444);
  body.drawCircle(0, -50, 30);
  body.endFill();

  // Horns
  body.beginFill(0x991b1b);
  body.moveTo(-20, -65);
  body.lineTo(-15, -90);
  body.lineTo(-10, -65);
  body.lineTo(-20, -65);
  body.endFill();

  body.moveTo(20, -65);
  body.lineTo(15, -90);
  body.lineTo(10, -65);
  body.lineTo(20, -65);
  body.endFill();

  // Eyes (glowing)
  body.beginFill(0xfef08a);
  body.drawCircle(-10, -50, 6);
  body.drawCircle(10, -50, 6);
  body.endFill();

  body.beginFill(0xff0000);
  body.drawCircle(-10, -50, 3);
  body.drawCircle(10, -50, 3);
  body.endFill();

  // Arms/claws
  body.beginFill(0xb91c1c);
  body.drawRoundedRect(-50, -10, 15, 40, 5);
  body.drawRoundedRect(35, -10, 15, 40, 5);
  body.endFill();

  // Legs
  body.beginFill(0x7f1d1d);
  body.drawRect(-25, 45, 20, 35);
  body.drawRect(5, 45, 20, 35);
  body.endFill();

  // Shadow/aura
  const aura = new PIXI.Graphics();
  aura.beginFill(0xff0000, 0.2);
  aura.drawCircle(0, 0, 70);
  aura.endFill();
  aura.filters = [new PIXI.BlurFilter(12)];

  container.addChild(aura);
  container.addChild(body);

  return container;
}
