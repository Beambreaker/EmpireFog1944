import Phaser from 'phaser';
import type { City, TerrainType } from '../core/types';
import { isWaterTerrain } from '../map/Terrain';
import type { TileMap } from '../map/TileMap';
import { cityContains } from '../cities/cityGeometry';
import { cityTextureKey, settlementTextureKey, terrainTextureKey } from './assetCatalog';

type WaterKind = 'ocean' | 'lake';

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

function cityOnTile(cities: City[], x: number, y: number, cityId?: string): City | undefined {
  if (cityId) return cities.find((c) => c.id === cityId);
  return cities.find((c) => cityContains(c, x, y));
}

/** N=1, E=2, S=4, W=8 — Wasser-Nachbarn für Küsten-Overlay. */
function waterEdgeMask(tm: TileMap, x: number, y: number): number {
  let mask = 0;
  if (tm.inBounds(x, y - 1) && isWaterTerrain(tm.get(x, y - 1)!.terrain)) mask |= 1;
  if (tm.inBounds(x + 1, y) && isWaterTerrain(tm.get(x + 1, y)!.terrain)) mask |= 2;
  if (tm.inBounds(x, y + 1) && isWaterTerrain(tm.get(x, y + 1)!.terrain)) mask |= 4;
  if (tm.inBounds(x - 1, y) && isWaterTerrain(tm.get(x - 1, y)!.terrain)) mask |= 8;
  return mask;
}

function classifyWaterBodies(tileMap: TileMap): Map<string, WaterKind> {
  const w = tileMap.width;
  const h = tileMap.height;
  const kind = new Map<string, WaterKind>();
  const visited = new Set<string>();

  const key = (x: number, y: number) => `${x},${y}`;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = key(x, y);
      if (visited.has(k)) continue;
      if (tileMap.get(x, y)!.terrain !== 'water') continue;

      const stack: [number, number][] = [[x, y]];
      const component: [number, number][] = [];
      let touchesBorder = false;

      while (stack.length > 0) {
        const [cx, cy] = stack.pop()!;
        const ck = key(cx, cy);
        if (visited.has(ck)) continue;
        if (tileMap.get(cx, cy)?.terrain !== 'water') continue;
        visited.add(ck);
        component.push([cx, cy]);
        if (cx === 0 || cy === 0 || cx === w - 1 || cy === h - 1) touchesBorder = true;
        for (const [dx, dy] of [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ] as const) {
          stack.push([cx + dx, cy + dy]);
        }
      }

      const type: WaterKind = touchesBorder ? 'ocean' : 'lake';
      for (const [cx, cy] of component) {
        kind.set(key(cx, cy), type);
      }
    }
  }
  return kind;
}

function isLandTerrain(t: TerrainType): boolean {
  return !isWaterTerrain(t) && t !== 'city' && t !== 'port' && t !== 'airfield';
}

function roadRotationRad(tm: TileMap, x: number, y: number): number {
  const east = tm.inBounds(x + 1, y) && tm.get(x + 1, y)!.terrain === 'road';
  const west = tm.inBounds(x - 1, y) && tm.get(x - 1, y)!.terrain === 'road';
  const south = tm.inBounds(x, y + 1) && tm.get(x, y + 1)!.terrain === 'road';
  const north = tm.inBounds(x, y - 1) && tm.get(x, y - 1)!.terrain === 'road';
  const horizontal = east || west;
  const vertical = north || south;
  if (vertical && !horizontal) return Math.PI / 2;
  return 0;
}

function baseTerrainKey(
  terrain: TerrainType,
  x: number,
  y: number,
  mapH: number,
  shallow: boolean,
  waterKind: WaterKind | undefined,
  city: City | undefined,
  settlementOnTile: boolean,
  isPort: boolean,
  isAirfield: boolean,
  hasFactory: boolean,
): string {
  if (terrain === 'water') {
    if (y < mapH * 0.09) return terrainTextureKey('ice');
    if (waterKind === 'lake') return terrainTextureKey('lake');
    if (shallow) return terrainTextureKey('water-shallow');
    return terrainTextureKey('water');
  }

  if (isPort) return cityTextureKey('port');
  if (isAirfield) return cityTextureKey('airfield');
  if (hasFactory) return cityTextureKey('factory');
  if (terrain === 'city' && settlementOnTile && city) {
    return settlementTextureKey(city.settlementKind);
  }

  const snowBand = y < mapH * 0.14;
  if (terrain === 'mountain' && snowBand) return terrainTextureKey('mountain-snow');
  if ((terrain === 'plain' || terrain === 'forest' || terrain === 'hills') && snowBand) {
    return terrainTextureKey('snow');
  }

  if (
    terrain === 'plain' ||
    terrain === 'forest' ||
    terrain === 'hills' ||
    terrain === 'mountain' ||
    terrain === 'desert' ||
    terrain === 'marsh' ||
    terrain === 'road'
  ) {
    return terrainTextureKey(terrain);
  }
  return terrainTextureKey('plain');
}

function resolveTextureKey(name: string): string {
  if (name.startsWith('city-') || name.startsWith('terrain-')) return name;
  return terrainTextureKey(name as Parameters<typeof terrainTextureKey>[0]);
}

/**
 * Gelände mit realistischen SVGs, weichen Küsten und leichter Kachel-Variation.
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
  const waterKinds = classifyWaterBodies(tileMap);
  const bleed = tileSize + 6;

  const landTints = [0xfafaf8, 0xf4f2ec, 0xeeeee6, 0xf0ece4, 0xeceee8] as const;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = tileMap.get(x, y)!;
      const t = tile.terrain;
      const city = cityOnTile(cities, x, y, tile.cityId);
      const shallow = t === 'water' && touchesLand(tileMap, x, y);
      const wKind = waterKinds.get(`${x},${y}`);

      let key = baseTerrainKey(
        t,
        x,
        y,
        h,
        shallow,
        wKind,
        city,
        t === 'city',
        t === 'port',
        t === 'airfield',
        Boolean(city?.hasFactory && city.x === x && city.y === y),
      );
      key = resolveTextureKey(key);
      if (!scene.textures.exists(key)) {
        key = terrainTextureKey('plain');
      }

      const jitterX = ((x * 17 + y * 31) % 5) - 2;
      const jitterY = ((x * 23 + y * 13) % 5) - 2;
      const px = x * tileSize + tileSize * 0.5 + jitterX;
      const py = y * tileSize + tileSize * 0.5 + jitterY;
      const img = scene.add.image(px, py, key);
      img.setDisplaySize(bleed, bleed);

      const microRot = (((x * 7 + y * 11) % 7) - 3) * (Math.PI / 180);
      if (t === 'road') {
        img.setRotation(roadRotationRad(tileMap, x, y));
      } else if (t !== 'water' && t !== 'port' && t !== 'airfield' && t !== 'city') {
        img.setRotation(microRot);
      }

      if (!isWaterTerrain(t)) {
        const hash = (x * 73 + y * 41) % landTints.length;
        img.setTint(landTints[hash]);
      } else if (wKind === 'lake') {
        img.setTint(0xdedad2);
      } else if (y < h * 0.09) {
        img.setTint(0xd0dce8);
      } else {
        img.setTint(0xe8ecef);
      }

      container.add(img);
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = tileMap.get(x, y)!.terrain;
      if (!isLandTerrain(t) && t !== 'city' && t !== 'port') continue;
      const mask = waterEdgeMask(tileMap, x, y);
      if (mask === 0) continue;

      const blendKey = `terrain-blend-mask-${mask}`;
      if (!scene.textures.exists(blendKey)) continue;

      const px = x * tileSize + tileSize * 0.5;
      const py = y * tileSize + tileSize * 0.5;
      const blend = scene.add.image(px, py, blendKey);
      blend.setDisplaySize(bleed, bleed);
      blend.setAlpha(0.88);
      container.add(blend);
    }
  }
}
