import './styles.css';
import Phaser from 'phaser';
import { GAME_CONFIG } from './game/GameConfig';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { StrategyScene } from './game/scenes/StrategyScene';

// Build Phaser configuration with our scenes registered.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  scene: [BootScene, MenuScene, StrategyScene],
};

// Tag the body in menu state so the HUD overlay is hidden until the strategy scene starts.
document.body.classList.add('in-menu');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(config);

// Expose for debugging in console.
(window as unknown as { __game?: Phaser.Game }).__game = game;
