import type { City, Coord } from '../core/types';

/** All grid cells occupied by a settlement (anchor = top-left). */
export function cityFootprint(c: City): Coord[] {
  const tiles: Coord[] = [];
  for (let dy = 0; dy < c.tileHeight; dy++) {
    for (let dx = 0; dx < c.tileWidth; dx++) {
      tiles.push({ x: c.x + dx, y: c.y + dy });
    }
  }
  return tiles;
}

export function cityContains(c: City, gx: number, gy: number): boolean {
  return gx >= c.x && gx < c.x + c.tileWidth && gy >= c.y && gy < c.y + c.tileHeight;
}

/** Integer tile closest to geometric centre (for AI / labels). */
export function cityAnchorCentreCell(c: City): Coord {
  return {
    x: c.x + Math.floor((c.tileWidth - 1) / 2),
    y: c.y + Math.floor((c.tileHeight - 1) / 2),
  };
}

export function cityCanProduce(c: City): boolean {
  return c.settlementKind === 'capital' || c.settlementKind === 'town';
}
