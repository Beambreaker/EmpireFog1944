import Phaser from 'phaser';

/**
 * BootScene only exists so that we have a clean start hook.
 * No external assets are loaded — the game uses procedurally generated
 * graphics throughout. Once we're ready, we hand over to MenuScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    // Hand over immediately.
    this.scene.start('MenuScene');
  }
}
