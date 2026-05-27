import Phaser from 'phaser';
import {
  INTRO_MINIMAL_LOAD_KEYS,
  INTRO_VIDEO_KEY,
  SVG_LOAD_LIST,
  TEXTURE,
  TRAILER_SVG_LOAD_LIST,
} from './assetCatalog';
import { resolveAssetUrl } from './assetUrls';

function queueSvgLoads(
  scene: Phaser.Scene,
  list: ReadonlyArray<{ key: string; path: string; w: number; h: number }>,
  onlyMissing: boolean,
): void {
  for (const { key, path, w, h } of list) {
    if (onlyMissing && scene.textures.exists(key)) continue;
    scene.load.svg(key, resolveAssetUrl(path), { width: w, height: h });
  }
}

/** Register all runtime + reference assets for BootScene.preload. */
export function preloadGameAssets(scene: Phaser.Scene): void {
  queueSvgLoads(scene, SVG_LOAD_LIST, false);

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

/** Intro ohne Boot (Menü „JETZT INTRO TESTEN“): Grain, Wasser, Trailer-Einheiten. */
export function preloadIntroAssets(scene: Phaser.Scene): void {
  const minimal = SVG_LOAD_LIST.filter((e) =>
    INTRO_MINIMAL_LOAD_KEYS.includes(e.key as (typeof INTRO_MINIMAL_LOAD_KEYS)[number]),
  );
  queueSvgLoads(scene, minimal.length > 0 ? minimal : TRAILER_SVG_LOAD_LIST, true);

  if (!scene.textures.exists(TEXTURE.grain)) {
    scene.load.svg(TEXTURE.grain, resolveAssetUrl('assets/generated/map-grain.svg'), {
      width: 128,
      height: 128,
    });
  }
  if (!scene.textures.exists('terrain-water')) {
    scene.load.svg('terrain-water', resolveAssetUrl('assets/runtime/terrain/water.svg'), {
      width: 256,
      height: 256,
    });
  }

  if (!scene.cache.video.exists(INTRO_VIDEO_KEY)) {
    scene.load.video(INTRO_VIDEO_KEY, resolveAssetUrl('video/intro.mp4'));
  }
}

export function introAssetsNeedLoading(scene: Phaser.Scene): boolean {
  return INTRO_MINIMAL_LOAD_KEYS.some((key) => !scene.textures.exists(key));
}
