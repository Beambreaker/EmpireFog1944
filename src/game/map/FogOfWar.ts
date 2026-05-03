import type { FogState, Faction, Unit } from '../core/types';
import { UNIT_TYPES } from '../units/UnitTypes';
import { chebyshevDistance } from '../utils/GridMath';
import type { TileMap } from './TileMap';

/**
 * Per-faction fog of war model.
 *
 * Each faction has a grid of FogState values:
 *   - 'unknown'  : never seen
 *   - 'explored' : seen before, but not currently in line of sight
 *   - 'visible'  : currently within sight of one of the faction's units / cities
 *
 * `recompute()` rebuilds the visible set from the current set of friendly
 * units and cities. Tiles that fall out of vision become 'explored'
 * (they keep what they last saw — but enemy positions are tracked separately
 * by the renderer so old enemy locations don't keep showing in explored fog).
 */
export class FogOfWar {
  private readonly width: number;
  private readonly height: number;
  private readonly states: Map<Faction, FogState[]> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    for (const f of ['allies', 'axis'] as Faction[]) {
      const arr: FogState[] = new Array(width * height);
      for (let i = 0; i < arr.length; i++) arr[i] = 'unknown';
      this.states.set(f, arr);
    }
  }

  get(faction: Faction, x: number, y: number): FogState {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 'unknown';
    return this.states.get(faction)![y * this.width + x];
  }

  /**
   * Rebuild the visible set for one faction. Anything that was 'visible' but
   * is no longer in sight downgrades to 'explored'.
   */
  recompute(
    faction: Faction,
    units: Unit[],
    cities: { x: number; y: number; faction: Faction }[],
    _tileMap: TileMap,
  ): void {
    const arr = this.states.get(faction)!;
    // Demote previously visible tiles.
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 'visible') arr[i] = 'explored';
    }

    const reveal = (cx: number, cy: number, sight: number) => {
      const r = Math.max(0, Math.floor(sight));
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x < 0 || y < 0 || x >= this.width || y >= this.height) continue;
          if (chebyshevDistance({ x: cx, y: cy }, { x, y }) > r) continue;
          arr[y * this.width + x] = 'visible';
        }
      }
    };

    // Reveal from units of this faction.
    for (const u of units) {
      if (u.faction !== faction) continue;
      const sight = UNIT_TYPES[u.typeId].sight;
      reveal(u.x, u.y, sight);
    }
    // Reveal a small radius around friendly cities.
    for (const c of cities) {
      if (c.faction !== faction) continue;
      reveal(c.x, c.y, 2);
    }
  }

  /** Reveal entire map (debug / dev tool). */
  revealAll(faction: Faction): void {
    const arr = this.states.get(faction)!;
    for (let i = 0; i < arr.length; i++) arr[i] = 'visible';
  }
}
