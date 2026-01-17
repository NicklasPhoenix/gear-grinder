import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export default function PixiGame({ gameState, setGameState, stats }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    // Create PixiJS Application
    const app = new PIXI.Application();

    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    }).then(() => {
      if (!canvasRef.current) return;

      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;
      setIsInitialized(true);

      // Initialize game scenes
      initializeGame(app, gameState, setGameState, stats);
    });

    // Handle window resize
    const handleResize = () => {
      if (app) {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        // TODO: Reposition UI elements
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, []);

  return <div ref={canvasRef} style={{ width: '100%', height: '100vh', overflow: 'hidden' }} />;
}

// Game initialization
async function initializeGame(app, gameState, setGameState, stats) {
  const { stage } = app;

  // Create main game container
  const gameContainer = new PIXI.Container();
  stage.addChild(gameContainer);

  // Create background
  const background = createBackground(app);
  gameContainer.addChild(background);

  // Create combat area
  const combatArea = createCombatArea(app, gameState, stats);
  gameContainer.addChild(combatArea);

  // Create HUD
  const hud = createHUD(app, gameState, stats);
  gameContainer.addChild(hud);

  // Create UI panels (inventory, stats, etc.) - initially hidden
  const uiPanels = createUIPanels(app, gameState, setGameState);
  gameContainer.addChild(uiPanels);

  // Game loop
  app.ticker.add((delta) => {
    updateGame(delta, gameState, combatArea, hud);
  });
}

// Create animated background
function createBackground(app) {
  const container = new PIXI.Container();

  // Gradient background using graphics
  const bg = new PIXI.Graphics();
  bg.beginFill(0x0f0e17);
  bg.drawRect(0, 0, app.screen.width, app.screen.height);
  bg.endFill();
  container.addChild(bg);

  // Add floating particles for atmosphere
  for (let i = 0; i < 50; i++) {
    const particle = new PIXI.Graphics();
    particle.beginFill(0xffffff, 0.3);
    particle.drawCircle(0, 0, Math.random() * 2 + 1);
    particle.endFill();

    particle.x = Math.random() * app.screen.width;
    particle.y = Math.random() * app.screen.height;
    particle.vx = (Math.random() - 0.5) * 0.5;
    particle.vy = (Math.random() - 0.5) * 0.5;

    container.addChild(particle);

    // Animate particle
    app.ticker.add(() => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0) particle.x = app.screen.width;
      if (particle.x > app.screen.width) particle.x = 0;
      if (particle.y < 0) particle.y = app.screen.height;
      if (particle.y > app.screen.height) particle.y = 0;
    });
  }

  return container;
}

// Create combat area with player and enemy
function createCombatArea(app, gameState, stats) {
  const container = new PIXI.Container();
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2 - 100;

  // Ground platform
  const ground = new PIXI.Graphics();
  ground.beginFill(0x2a2a3e, 0.5);
  ground.drawRoundedRect(-400, 200, 800, 20, 10);
  ground.endFill();
  container.addChild(ground);

  // Player character (left side)
  const player = createPlayerSprite();
  player.x = -200;
  player.y = 150;
  container.addChild(player);
  container.player = player;

  // Player health bar
  const playerHpBar = createHealthBar(120, true);
  playerHpBar.x = -200;
  playerHpBar.y = 80;
  container.addChild(playerHpBar);
  container.playerHpBar = playerHpBar;

  // Player label
  const playerLabel = new PIXI.Text('Hero', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0x4ade80,
    fontWeight: 'bold',
  });
  playerLabel.anchor.set(0.5);
  playerLabel.x = -200;
  playerLabel.y = 60;
  container.addChild(playerLabel);

  // Enemy character (right side)
  const enemy = createEnemySprite(gameState.currentZone);
  enemy.x = 200;
  enemy.y = 150;
  container.addChild(enemy);
  container.enemy = enemy;

  // Enemy health bar
  const enemyHpBar = createHealthBar(120, false);
  enemyHpBar.x = 200;
  enemyHpBar.y = 80;
  container.addChild(enemyHpBar);
  container.enemyHpBar = enemyHpBar;

  // Enemy label
  const enemyLabel = new PIXI.Text('Enemy', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0xef4444,
    fontWeight: 'bold',
  });
  enemyLabel.anchor.set(0.5);
  enemyLabel.x = 200;
  enemyLabel.y = 60;
  container.addChild(enemyLabel);
  container.enemyLabel = enemyLabel;

  return container;
}

// Create player sprite
function createPlayerSprite() {
  const container = new PIXI.Container();

  // Simple character representation (will be replaced with proper sprites)
  const body = new PIXI.Graphics();
  body.beginFill(0x3b82f6);
  body.drawCircle(0, 0, 30);
  body.endFill();

  // Head
  body.beginFill(0xfbbf24);
  body.drawCircle(0, -35, 20);
  body.endFill();

  // Weapon glow
  body.beginFill(0xfbbf24);
  body.drawCircle(25, -10, 8);
  body.endFill();

  container.addChild(body);

  // Idle animation
  let time = 0;
  const animate = (delta) => {
    time += delta * 0.05;
    container.y = Math.sin(time) * 5;
  };

  container.animate = animate;

  return container;
}

// Create enemy sprite
function createEnemySprite(zoneId) {
  const container = new PIXI.Container();

  // Enemy body (will vary by zone/type)
  const body = new PIXI.Graphics();
  body.beginFill(0xef4444);
  body.drawCircle(0, 0, 35);
  body.endFill();

  // Eyes
  body.beginFill(0xfef08a);
  body.drawCircle(-10, -5, 5);
  body.drawCircle(10, -5, 5);
  body.endFill();

  // Horns for boss
  body.beginFill(0xdc2626);
  body.moveTo(-15, -25);
  body.lineTo(-10, -40);
  body.lineTo(-5, -25);
  body.lineTo(-15, -25);
  body.endFill();

  body.moveTo(15, -25);
  body.lineTo(10, -40);
  body.lineTo(5, -25);
  body.lineTo(15, -25);
  body.endFill();

  container.addChild(body);

  return container;
}

// Create health bar
function createHealthBar(width, isPlayer) {
  const container = new PIXI.Container();
  container.pivot.set(width / 2, 0);

  // Background
  const bg = new PIXI.Graphics();
  bg.beginFill(0x1f2937);
  bg.drawRoundedRect(0, 0, width, 12, 6);
  bg.endFill();
  container.addChild(bg);
  container.bg = bg;

  // Health fill
  const fill = new PIXI.Graphics();
  fill.beginFill(isPlayer ? 0x22c55e : 0xef4444);
  fill.drawRoundedRect(2, 2, width - 4, 8, 4);
  fill.endFill();
  container.addChild(fill);
  container.fill = fill;

  // HP Text
  const text = new PIXI.Text('100/100', {
    fontFamily: 'Arial',
    fontSize: 10,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  text.anchor.set(0.5);
  text.x = width / 2;
  text.y = 6;
  container.addChild(text);
  container.hpText = text;

  // Update function
  container.updateHealth = (current, max) => {
    const percentage = Math.max(0, Math.min(1, current / max));
    fill.clear();

    // Color based on percentage
    let color = isPlayer ? 0x22c55e : 0xef4444;
    if (!isPlayer) {
      if (percentage < 0.25) color = 0xef4444;
      else if (percentage < 0.5) color = 0xf59e0b;
    }

    fill.beginFill(color);
    fill.drawRoundedRect(2, 2, (width - 4) * percentage, 8, 4);
    fill.endFill();

    text.text = `${Math.ceil(current)}/${Math.ceil(max)}`;
  };

  return container;
}

// Create HUD overlay
function createHUD(app, gameState, stats) {
  const container = new PIXI.Container();

  // Top bar background
  const topBar = new PIXI.Graphics();
  topBar.beginFill(0x0f0e17, 0.9);
  topBar.drawRect(0, 0, app.screen.width, 80);
  topBar.endFill();
  container.addChild(topBar);

  // Resources display
  const resources = createResourceDisplay(gameState);
  resources.x = 20;
  resources.y = 20;
  container.addChild(resources);
  container.resources = resources;

  // XP bar
  const xpBar = createXPBar(app.screen.width - 400, gameState);
  xpBar.x = 200;
  xpBar.y = 50;
  container.addChild(xpBar);
  container.xpBar = xpBar;

  // Bottom menu bar
  const menuBar = createMenuBar(app);
  menuBar.y = app.screen.height - 60;
  container.addChild(menuBar);

  return container;
}

// Create resource display
function createResourceDisplay(gameState) {
  const container = new PIXI.Container();

  const resources = [
    { label: 'Gold', value: gameState.gold, color: 0xfbbf24, icon: '🪙' },
    { label: 'Ore', value: gameState.ore, color: 0x94a3b8, icon: '⛏️' },
    { label: 'Leather', value: gameState.leather, color: 0xd97706, icon: '🧶' },
  ];

  let xOffset = 0;
  resources.forEach(res => {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1f2937, 0.8);
    bg.drawRoundedRect(0, 0, 120, 35, 8);
    bg.endFill();
    bg.x = xOffset;
    container.addChild(bg);

    const text = new PIXI.Text(`${res.icon} ${res.value.toLocaleString()}`, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: res.color,
      fontWeight: 'bold',
    });
    text.x = xOffset + 10;
    text.y = 10;
    container.addChild(text);

    xOffset += 130;
  });

  return container;
}

// Create XP bar
function createXPBar(width, gameState) {
  const container = new PIXI.Container();

  // Background
  const bg = new PIXI.Graphics();
  bg.beginFill(0x1f2937);
  bg.drawRoundedRect(0, 0, width, 20, 10);
  bg.endFill();
  container.addChild(bg);

  // Fill
  const fill = new PIXI.Graphics();
  fill.beginFill(0x8b5cf6);
  fill.drawRoundedRect(2, 2, width - 4, 16, 8);
  fill.endFill();
  container.addChild(fill);
  container.fill = fill;

  // Level text
  const levelText = new PIXI.Text(`Lv.${gameState.level}`, {
    fontFamily: 'Arial',
    fontSize: 14,
    fill: 0x4ade80,
    fontWeight: 'bold',
  });
  levelText.x = -60;
  levelText.y = 2;
  container.addChild(levelText);

  return container;
}

// Create menu bar
function createMenuBar(app) {
  const container = new PIXI.Container();

  const bg = new PIXI.Graphics();
  bg.beginFill(0x0f0e17, 0.9);
  bg.drawRect(0, 0, app.screen.width, 60);
  bg.endFill();
  container.addChild(bg);

  const buttons = ['Combat', 'Stats', 'Inventory', 'Craft', 'Enhance', 'Skills'];
  const buttonWidth = 120;
  const startX = (app.screen.width - (buttons.length * buttonWidth + (buttons.length - 1) * 10)) / 2;

  buttons.forEach((label, i) => {
    const btn = createButton(label, buttonWidth, 40);
    btn.x = startX + i * (buttonWidth + 10);
    btn.y = 10;
    container.addChild(btn);
  });

  return container;
}

// Create button
function createButton(label, width, height) {
  const container = new PIXI.Container();
  container.interactive = true;
  container.buttonMode = true;

  const bg = new PIXI.Graphics();
  bg.beginFill(0x4c1d95);
  bg.drawRoundedRect(0, 0, width, height, 8);
  bg.endFill();
  container.addChild(bg);
  container.bg = bg;

  const text = new PIXI.Text(label, {
    fontFamily: 'Arial',
    fontSize: 14,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  text.anchor.set(0.5);
  text.x = width / 2;
  text.y = height / 2;
  container.addChild(text);

  // Hover effects
  container.on('pointerover', () => {
    bg.clear();
    bg.beginFill(0x6d28d9);
    bg.drawRoundedRect(0, 0, width, height, 8);
    bg.endFill();
  });

  container.on('pointerout', () => {
    bg.clear();
    bg.beginFill(0x4c1d95);
    bg.drawRoundedRect(0, 0, width, height, 8);
    bg.endFill();
  });

  return container;
}

// Create UI panels (inventory, etc.)
function createUIPanels(app, gameState, setGameState) {
  const container = new PIXI.Container();
  container.visible = false; // Hidden by default

  // TODO: Add inventory, crafting, enhancement panels

  return container;
}

// Game update loop
function updateGame(delta, gameState, combatArea, hud) {
  // Update player animation
  if (combatArea.player && combatArea.player.animate) {
    combatArea.player.animate(delta);
  }

  // Update health bars
  // TODO: Get actual stats from gameState
  // combatArea.playerHpBar.updateHealth(gameState.playerHp, stats.maxHp);
  // combatArea.enemyHpBar.updateHealth(gameState.enemyHp, gameState.enemyMaxHp);
}
