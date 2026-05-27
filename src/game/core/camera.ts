import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from './constants';

/** Pan/zoom tuning — initial scale derived from viewport (4K-first readability). */
export const CAMERA = {
  minScale: 0.5,
  maxScale: 3.6,
  /** Multiplikator pro Mausrad-Tick (zoom am Zeiger). */
  zoomWheelFactor: 1.14,
  /** Target on-screen tile size in px at game start (lesbar, nicht ganze Karte). */
  targetTileScreenPx: 92,
  sidePanelReservePx: 460,
  hudReservePx: 280,
} as const;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Start-Zoom: Kacheln lesbar groß — nicht die gesamte 96×56-Karte auf einmal.
 * (Früher wurde auf fitScale gedeckelt → ~0,2 Zoom → Nebel-Flecken statt Karte.)
 */
export function computeInitialWorldScale(_viewportWidth: number, _viewportHeight: number): number {
  const readabilityScale = CAMERA.targetTileScreenPx / TILE_SIZE;
  return clamp(readabilityScale, CAMERA.minScale, CAMERA.maxScale);
}
