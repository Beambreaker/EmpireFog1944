import Phaser from 'phaser';
import type { City, TerrainType } from '../core/types';
import { theme } from '../core/theme';
import { isWaterTerrain } from '../map/Terrain';
import type { TileMap } from '../map/TileMap';
import { cityContains } from '../cities/cityGeometry';

function T(tm: TileMap, x: number, y: number): TerrainType | null {
  if (!tm.inBounds(x, y)) return null;
  return tm.get(x, y)!.terrain;
}

function touchesLand(tm: TileMap, x: number, y: number): boolean {
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    const t = T(tm, x + dx, y + dy);
    if (t !== null && !isWaterTerrain(t)) return true;
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
    const t = T(tm, x + dx, y + dy);
    if (t !== null && isWaterTerrain(t)) return true;
  }
  return false;
}

function cityOnTile(cities: City[], x: number, y: number, cityId?: string): City | undefined {
  if (cityId) return cities.find((c) => c.id === cityId);
  return cities.find((c) => cityContains(c, x, y));
}

/**
 * Procedural terrain inspired by the reference sheet: water depth, coast sand,
 * roads, clusters for cities / harbor / runway + radar, factories on capitals.
 */
export function drawTerrainGrid(
  g: Phaser.GameObjects.Graphics,
  tileMap: TileMap,
  cities: City[],
  tileSize: number,
): void {
  const w = tileMap.width;
  const h = tileMap.height;
  const { terrainBase: tb } = theme;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tile = tileMap.get(x, y)!;
      const px = x * tileSize;
      const py = y * tileSize;
      const t = tile.terrain;

      if (t === 'water') {
        const shallow = touchesLand(tileMap, x, y);
        g.fillStyle(shallow ? tb.waterShallow : tb.water, 1);
        g.fillRect(px, py, tileSize, tileSize);
        g.fillStyle(0xffffff, shallow ? 0.12 : 0.07);
        const wx = px + 3 + ((x * 17 + y * 9) % (tileSize - 10));
        g.fillRect(wx, py + tileSize * 0.55, tileSize * 0.35, 1.5);
        g.fillRect(wx + 4, py + tileSize * 0.72, tileSize * 0.25, 1);
        if (shallow) {
          g.fillStyle(tb.sand, 0.55);
          const dn = T(tileMap, x, y - 1);
          if (dn !== null && !isWaterTerrain(dn)) g.fillRect(px, py, tileSize, 3);
          const ds = T(tileMap, x, y + 1);
          if (ds !== null && !isWaterTerrain(ds)) g.fillRect(px, py + tileSize - 3, tileSize, 3);
          const dw = T(tileMap, x - 1, y);
          if (dw !== null && !isWaterTerrain(dw)) g.fillRect(px, py, 3, tileSize);
          const de = T(tileMap, x + 1, y);
          if (de !== null && !isWaterTerrain(de)) g.fillRect(px + tileSize - 3, py, 3, tileSize);
        }
        continue;
      }

      // Land & mixed land tiles
      let base = tb.plain;
      if (t === 'forest') base = tb.forest;
      else if (t === 'mountain') base = tb.mountain;
      else if (t === 'desert') base = tb.desert;
      else if (t === 'marsh') base = tb.marsh;
      else if (t === 'road') base = tb.road;
      else if (t === 'city' || t === 'port' || t === 'airfield') base = tb.cityGround;
      else if (t === 'plain') base = tb.plain;

      g.fillStyle(base, 1);
      g.fillRect(px, py, tileSize, tileSize);

      if (touchesWater(tileMap, x, y) && (t === 'plain' || t === 'forest' || t === 'road')) {
        g.fillStyle(tb.sand, 0.35);
        const n1 = T(tileMap, x, y - 1);
        if (n1 !== null && isWaterTerrain(n1)) g.fillRect(px, py, tileSize, 2);
        const n2 = T(tileMap, x, y + 1);
        if (n2 !== null && isWaterTerrain(n2)) g.fillRect(px, py + tileSize - 2, tileSize, 2);
        const n3 = T(tileMap, x - 1, y);
        if (n3 !== null && isWaterTerrain(n3)) g.fillRect(px, py, 2, tileSize);
        const n4 = T(tileMap, x + 1, y);
        if (n4 !== null && isWaterTerrain(n4)) g.fillRect(px + tileSize - 2, py, 2, tileSize);
      }

      if (t === 'plain') {
        const dot = Math.max(3, tileSize * 0.14);
        g.fillStyle(0x000000, 0.07);
        g.fillEllipse(px + tileSize * 0.3, py + tileSize * 0.35, dot, dot * 0.7);
        g.fillEllipse(px + tileSize * 0.65, py + tileSize * 0.62, dot * 0.85, dot * 0.65);
      }

      if (t === 'road') {
        g.fillStyle(tb.roadMark, 0.85);
        g.fillRect(px + tileSize * 0.15, py + tileSize * 0.48, tileSize * 0.7, 2);
        g.fillRect(px + tileSize * 0.48, py + tileSize * 0.15, 2, tileSize * 0.7);
      }

      if (t === 'forest') {
        g.fillStyle(0x1a2818, 0.55);
        for (let i = 0; i < 3; i++) {
          const ox = px + 5 + i * 6;
          const oy = py + tileSize - 4;
          g.fillTriangle(ox, oy - 9, ox - 3, oy, ox + 3, oy);
        }
      }

      if (t === 'mountain') {
        g.fillStyle(0x6a6258, 0.95);
        g.fillTriangle(
          px + tileSize * 0.5,
          py + tileSize * 0.12,
          px + tileSize * 0.08,
          py + tileSize * 0.95,
          px + tileSize * 0.92,
          py + tileSize * 0.95,
        );
        g.fillStyle(0xe8e4dc, 0.35);
        g.fillTriangle(
          px + tileSize * 0.5,
          py + tileSize * 0.18,
          px + tileSize * 0.4,
          py + tileSize * 0.42,
          px + tileSize * 0.6,
          py + tileSize * 0.42,
        );
      }

      if (t === 'desert') {
        g.fillStyle(0xd8b888, 0.4);
        for (let i = 0; i < 4; i++) {
          g.fillEllipse(px + 4 + (i % 2) * 8, py + 5 + Math.floor(i / 2) * 8, 3, 2);
        }
      }

      if (t === 'marsh') {
        g.fillStyle(0x2a3830, 0.45);
        g.fillEllipse(px + tileSize * 0.35, py + tileSize * 0.38, tileSize * 0.45, tileSize * 0.28);
        g.fillEllipse(px + tileSize * 0.62, py + tileSize * 0.58, tileSize * 0.32, tileSize * 0.2);
      }

      if (t === 'city' || t === 'port' || t === 'airfield') {
        const city = cityOnTile(cities, x, y, tile.cityId);
        drawSettlementStructures(g, px, py, tileSize, t, city, x, y);
      }
    }
  }
}

function drawSettlementStructures(
  g: Phaser.GameObjects.Graphics,
  px: number,
  py: number,
  tileSize: number,
  t: TerrainType,
  city: City | undefined,
  x: number,
  y: number,
): void {
  const tb = theme.terrainBase;
  // Small house cluster
  g.fillStyle(tb.building, 1);
  g.fillRect(px + 3, py + tileSize - 10, 6, 8);
  g.fillRect(px + 10, py + tileSize - 12, 7, 10);
  g.fillRect(px + tileSize - 11, py + tileSize - 9, 8, 7);
  g.fillStyle(tb.roof, 1);
  g.fillTriangle(px + 3, py + tileSize - 10, px + 6, py + tileSize - 14, px + 9, py + tileSize - 10);
  g.fillTriangle(px + 10, py + tileSize - 12, px + 13.5, py + tileSize - 17, px + 17, py + tileSize - 12);

  if (t === 'port') {
    g.fillStyle(tb.portPier, 1);
    g.fillRect(px + 2, py + tileSize * 0.55, tileSize * 0.45, 3);
    g.fillStyle(0x1a3048, 0.6);
    g.fillRect(px + 2, py + tileSize * 0.62, tileSize * 0.4, 2);
  }

  if (t === 'airfield') {
    g.fillStyle(tb.runway, 1);
    g.fillRect(px + 2, py + tileSize * 0.35, tileSize - 4, tileSize * 0.35);
    g.fillStyle(tb.runwayLine, 0.9);
    g.fillRect(px + 3, py + tileSize * 0.5, tileSize - 6, 1);
    g.fillStyle(0x8899aa, 0.9);
    g.fillCircle(px + tileSize * 0.78, py + tileSize * 0.22, 4);
    g.lineStyle(1, 0x445566, 0.8);
    g.lineBetween(px + tileSize * 0.78, py + tileSize * 0.22, px + tileSize * 0.78, py + tileSize * 0.1);
  }

  if (city?.settlementKind === 'capital' && cityContains(city, x, y)) {
    g.lineStyle(2, tb.wall, 0.9);
    g.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
  }

  if (city?.hasFactory && city.x === x && city.y === y) {
    g.fillStyle(tb.chimney, 1);
    g.fillRect(px + tileSize * 0.55, py + tileSize * 0.25, 3, 8);
    g.fillStyle(tb.smoke, 0.5);
    g.fillCircle(px + tileSize * 0.56, py + tileSize * 0.2, 2);
  }
}
