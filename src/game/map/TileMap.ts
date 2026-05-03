import type { Tile, TerrainType } from '../core/types';
import { MAP_HEIGHT, MAP_WIDTH } from '../core/constants';

/**
 * Plain data wrapper around the 2D tile grid. All access goes through this
 * class so we can later add LOS, region tagging or cached neighbours without
 * touching the rest of the code.
 */
export class TileMap {
  readonly width: number;
  readonly height: number;
  private readonly tiles: Tile[];

  constructor(width: number = MAP_WIDTH, height: number = MAP_HEIGHT) {
    this.width = width;
    this.height = height;
    this.tiles = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.tiles[y * width + x] = { x, y, terrain: 'water' };
      }
    }
  }

  get(x: number, y: number): Tile | undefined {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return undefined;
    return this.tiles[y * this.width + x];
  }

  setTerrain(x: number, y: number, terrain: TerrainType): void {
    const t = this.get(x, y);
    if (t) t.terrain = terrain;
  }

  setCity(x: number, y: number, cityId: string): void {
    const t = this.get(x, y);
    if (t) t.cityId = cityId;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  forEach(cb: (tile: Tile) => void): void {
    for (const t of this.tiles) cb(t);
  }
}
