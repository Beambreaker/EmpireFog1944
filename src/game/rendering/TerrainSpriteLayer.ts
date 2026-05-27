import Phaser from 'phaser';
import type { City } from '../core/types';
import { isWaterTerrain } from '../map/Terrain';
import type { TileMap } from '../map/TileMap';
import { cityContains } from '../cities/cityGeometry';
import { terrainSpriteForTile } from './assetCatalog';

function touchesLand(tm: TileMap, x: number, y: number): boolean {
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    const nx = x + dx;
    const ny = y + dy;
    if (!tm.inBounds(nx, ny)) continue;
    if (!isWaterTerrain(tm.get(nx, ny)!.terrain)) return true;
  }
  return false;
}

function touchesWater(tm: TileMap, x: number, y: number): boolean {
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    const nx = x + dx;
    const ny = y + dy;
    if (!tm.inBounds(nx, ny)) continue;
    if (isWaterTerrain(tm.get(nx, ny)!.terrain)) return true;
  }
  return false;
}

function cityOnTile(cities: City[], x: number, y: number, cityId?: string): City | undefined {
  if (cityId) return cities.find((c) => c.id === cityId);
  return cities.find((c) => cityContains(c, x, y));
}

/**
 * Rebuilds the terrain layer from SVG tile sprites (asset pack).
 * Slight per-tile tint variation breaks up the grid repetition.
 */
export function rebuildTerrainSpriteLayer(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  tileMap: TileMap,
  cities: City[],
  tileSize: number,
): void {
  container.removeAll(true);
  const w = tileMap.width;
  const h = tileMap.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = tileMap.get(x, y)!;
      const t = tile.terrain;
      const city = cityOnTile(cities, x, y, tile.cityId);
      const shallow = t === 'water' && touchesLand(tileMap, x, y);
      const coastal =
        !isWaterTerrain(t) &&
        touchesWater(tileMap, x, y) &&
        (t === 'plain' || t === 'forest' || t === 'road');

      const key = terrainSpriteForTile(
        t,
        shallow,
        coastal,
        city?.settlementKind,
        t === 'port',
        t === 'airfield',
        Boolean(city?.hasFactory && city.x === x && city.y === y),
      );

      if (!scene.textures.exists(key)) continue;

      const px = x * tileSize + tileSize * 0.5;
      const py = y * tileSize + tileSize * 0.5;
      const img = scene.add.image(px, py, key);
      img.setDisplaySize(tileSize + 1, tileSize + 1);

      const landTints = [0xffffff, 0xf2f0e8, 0xe8ece4, 0xf0ebe0, 0xe6ebe8] as const;
      const hash = (x * 73 + y * 41) % landTints.length;
      if (!isWaterTerrain(t)) {
        img.setTint(landTints[hash]);
      }

      container.add(img);
    }
  }
}
