import Phaser from 'phaser';
import { INTRO_VIDEO_KEY } from '../rendering/assetCatalog';
import { preloadGameAssets } from '../rendering/loadGameAssets';
import { shouldSkipIntro } from './IntroScene';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.on('loaderror', (file: { key?: string }) => {
      if (file.key === INTRO_VIDEO_KEY) {
        // Kein MP4 vorhanden — IntroScene spielt Kino-Fallback.
      }
    });
    preloadGameAssets(this);
  }

  create(): void {
    if (shouldSkipIntro()) {
      document.body.classList.add('in-menu');
      this.scene.start('MenuScene');
    } else {
      this.scene.start('IntroScene');
    }
  }
}
