import Phaser from 'phaser';
import {
  trailerAnimKey,
  trailerAnimPlayKey,
  TRAILER_FRAME_COUNTS,
  type TrailerUnitId,
} from './assetCatalog';

export interface TrailerUnitOptions {
  flip?: boolean;
  tint?: number;
  /** Anteil der kleineren Bildschirmseite (0.22–0.28 empfohlen). */
  scale?: number;
  animate?: boolean;
}

/** Trailer-Animationen einmalig registrieren (Boot + Intro). */
export function registerTrailerAnimations(scene: Phaser.Scene): void {
  const units = Object.keys(TRAILER_FRAME_COUNTS) as TrailerUnitId[];
  for (const unit of units) {
    const animKey = trailerAnimPlayKey(unit);
    if (scene.anims.exists(animKey)) continue;
    const count = TRAILER_FRAME_COUNTS[unit];
    const frames: { key: string }[] = [];
    for (let i = 0; i < count; i++) {
      const texKey = trailerAnimKey(unit, i);
      if (scene.textures.exists(texKey)) {
        frames.push({ key: texKey });
      }
    }
    if (frames.length < 2) continue;
    const frameRate =
      unit === 'fighter' ? 12 : unit === 'infantry' ? 10 : unit === 'tank' ? 8 : 6;
    scene.anims.create({
      key: animKey,
      frames,
      frameRate,
      repeat: -1,
    });
  }
}

/** Kino-Einheit: animiertes 512-SVG oder prozedurale Silhouette (nie leer). */
export function createTrailerUnit(
  scene: Phaser.Scene,
  unit: TrailerUnitId,
  x: number,
  y: number,
  screenMin: number,
  options: TrailerUnitOptions = {},
): Phaser.GameObjects.Container {
  const { flip = false, tint = 0xffffff, scale = 0.24, animate = true } = options;
  const c = scene.add.container(x, y);
  const size = screenMin * scale;
  const firstKey = trailerAnimKey(unit, 0);
  const animKey = trailerAnimPlayKey(unit);

  if (scene.textures.exists(firstKey)) {
    const sprite = scene.add.sprite(0, 0, firstKey);
    sprite.setDisplaySize(size, size);
    sprite.setTint(tint);
    sprite.setFlipX(flip);
    c.add(sprite);
    if (animate && scene.anims.exists(animKey)) {
      sprite.play(animKey);
    }
    return c;
  }

  const g = scene.add.graphics();
  drawProceduralSilhouette(g, unit, size, tint);
  if (flip) g.scaleX = -1;
  c.add(g);
  return c;
}

/** Alias für Trailer-API in der Doku. */
export const createAnimatedUnit = createTrailerUnit;

function drawProceduralSilhouette(
  g: Phaser.GameObjects.Graphics,
  unit: TrailerUnitId,
  size: number,
  tint: number,
): void {
  const s = size / 512;
  const hull = tint;
  const dark = Phaser.Display.Color.IntegerToColor(tint).darken(30).color;
  g.fillStyle(dark, 1);
  switch (unit) {
    case 'tank':
      g.fillRect(-180 * s, 20 * s, 360 * s, 28 * s);
      g.fillStyle(hull, 1);
      g.fillTriangle(-160 * s, 20 * s, 150 * s, 10 * s, 155 * s, -30 * s);
      g.fillTriangle(-160 * s, 20 * s, 155 * s, -30 * s, -155 * s, -20 * s);
      g.fillCircle(40 * s, -50 * s, 45 * s);
      g.fillRect(70 * s, -58 * s, 110 * s, 14 * s);
      break;
    case 'infantry':
      g.fillStyle(hull, 1);
      g.fillCircle(0, -70 * s, 32 * s);
      g.fillRect(-18 * s, -35 * s, 36 * s, 90 * s);
      g.fillTriangle(-10 * s, 55 * s, -28 * s, 120 * s, 2 * s, 120 * s);
      g.fillTriangle(10 * s, 55 * s, 28 * s, 120 * s, -2 * s, 120 * s);
      g.fillRect(12 * s, -25 * s, 70 * s, 8 * s);
      break;
    case 'artillery':
      g.fillCircle(-70 * s, 50 * s, 40 * s);
      g.fillCircle(70 * s, 50 * s, 40 * s);
      g.fillStyle(hull, 1);
      g.fillRect(-30 * s, 10 * s, 160 * s, 30 * s);
      g.fillRect(50 * s, -15 * s, 130 * s, 16 * s);
      break;
    case 'destroyer':
    case 'battleship': {
      const w = unit === 'battleship' ? 1.12 : 1;
      g.fillStyle(0x1a4a6a, 0.45);
      g.fillEllipse(0, 50 * s, 380 * w * s, 20 * s);
      g.fillStyle(hull, 1);
      g.fillTriangle(-190 * w * s, 35 * s, 195 * w * s, 25 * s, 185 * w * s, 70 * s);
      g.fillRect(-30 * s, -55 * s, 35 * s, 55 * s);
      g.fillRect(50 * s, -70 * s, 40 * s, 70 * s);
      if (unit === 'battleship') g.fillRect(110 * s, -60 * s, 35 * s, 55 * s);
      break;
    }
    case 'submarine':
      g.fillStyle(0x1a5a82, 0.5);
      g.fillRect(-200 * s, 35 * s, 400 * s, 18 * s);
      g.fillStyle(hull, 1);
      g.fillEllipse(0, 10 * s, 280 * s, 55 * s);
      g.fillRect(-35 * s, -55 * s, 70 * s, 55 * s);
      break;
    case 'fighter':
    case 'bomber':
      g.fillTriangle(-150 * s, 5 * s, 140 * s, -15 * s, 130 * s, 25 * s);
      g.fillTriangle(-30 * s, 5 * s, -90 * s, -70 * s, 10 * s, 0);
      g.fillTriangle(30 * s, 5 * s, 90 * s, -70 * s, -10 * s, 0);
      g.fillCircle(-120 * s, 0, 18 * s);
      break;
    default:
      g.fillCircle(0, 0, 60 * s);
  }
}
