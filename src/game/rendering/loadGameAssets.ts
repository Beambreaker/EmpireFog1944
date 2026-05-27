import Phaser from 'phaser';
import { INTRO_VIDEO_KEY, SVG_LOAD_LIST, TEXTURE } from './assetCatalog';
import { resolveAssetUrl } from './assetUrls';

/** Register all runtime + reference assets for BootScene.preload. */
export function preloadGameAssets(scene: Phaser.Scene): void {
  for (const { key, path, w, h } of SVG_LOAD_LIST) {
    scene.load.svg(key, resolveAssetUrl(path), { width: w, height: h });
  }

  scene.load.image(
    TEXTURE.refTerrain,
    resolveAssetUrl('assets/reference/terrain_and_structures_reference.png'),
  );
  scene.load.image(
    TEXTURE.refUnits,
    resolveAssetUrl('assets/reference/units_and_corps_symbols_reference.png'),
  );

  // Intro-MP4 (optional); fehlt → Kino-Fallback in IntroScene.
  scene.load.video(INTRO_VIDEO_KEY, resolveAssetUrl('video/intro.mp4'));
}
