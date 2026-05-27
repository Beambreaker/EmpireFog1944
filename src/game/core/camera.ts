import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from './constants';

/** Pan/zoom tuning — initial scale derived from viewport (4K-first readability). */
export const CAMERA = {
  minScale: 0.42,
  maxScale: 2.8,
  zoomStep: 0.1,
  /** Target on-screen tile size in px at game start. */
  targetTileScreenPx: 50,
  sidePanelReservePx: 480,
  hudReservePx: 300,
} as const;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** World scale so tiles stay readable on 4K without forcing full-map overview. */
export function computeInitialWorldScale(viewportWidth: number, viewportHeight: number): number {
  const worldW = MAP_WIDTH * TILE_SIZE;
  const worldH = MAP_HEIGHT * TILE_SIZE;
  const availW = Math.max(720, viewportWidth - CAMERA.sidePanelReservePx);
  const availH = Math.max(540, viewportHeight - CAMERA.hudReservePx);

  const fitScale = Math.min(availW / worldW, availH / worldH);
  const readabilityScale = CAMERA.targetTileScreenPx / TILE_SIZE;
  const desired = Math.max(readabilityScale, fitScale * 0.78);
  const maxForViewport = fitScale * 1.12;

  return clamp(desired, CAMERA.minScale, Math.min(CAMERA.maxScale, maxForViewport));
}
