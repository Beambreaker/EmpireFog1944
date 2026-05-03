import type { Coord, Unit, TerrainType } from '../core/types';
import {
  AIR_MOVEMENT_COST,
  LAND_MOVEMENT_COST,
  SEA_MOVEMENT_COST,
} from '../core/constants';
import { UNIT_TYPES } from '../units/UnitTypes';
import type { GameState } from '../core/GameState';
import { neighbours4 } from '../utils/GridMath';

/**
 * Movement & pathfinding for a single unit.
 *
 * `getReachableTiles()` runs a Dijkstra-style flood-fill bounded by the unit's
 * remaining movement points. The result is a map of "tile key" -> total
 * movement cost, useful both for highlighting valid moves and for animating
 * a path step by step.
 */

function movementCostFor(unit: Unit, terrain: TerrainType): number {
  const def = UNIT_TYPES[unit.typeId];
  switch (def.domain) {
    case 'land':
      return LAND_MOVEMENT_COST[terrain];
    case 'sea':
    case 'subsea':
      return SEA_MOVEMENT_COST[terrain];
    case 'air':
      return AIR_MOVEMENT_COST[terrain];
  }
}

export interface ReachInfo {
  /** key = "x,y", value = total cost to reach that tile */
  costs: Map<string, number>;
  /** parent tile key for path reconstruction */
  parents: Map<string, string | null>;
}

export function getReachableTiles(state: GameState, unit: Unit): ReachInfo {
  const costs = new Map<string, number>();
  const parents = new Map<string, string | null>();
  const startKey = `${unit.x},${unit.y}`;
  costs.set(startKey, 0);
  parents.set(startKey, null);

  // Simple Dijkstra with a sorted-array frontier — map is small enough that
  // a real heap would be overkill.
  const frontier: { x: number; y: number; cost: number }[] = [
    { x: unit.x, y: unit.y, cost: 0 },
  ];

  while (frontier.length > 0) {
    // pop lowest cost
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift()!;
    const currentKey = `${current.x},${current.y}`;
    if (current.cost > (costs.get(currentKey) ?? Infinity)) continue;

    for (const n of neighbours4(current)) {
      if (!state.tileMap.inBounds(n.x, n.y)) continue;
      const tile = state.tileMap.get(n.x, n.y)!;
      const cost = movementCostFor(unit, tile.terrain);
      if (!isFinite(cost)) continue;

      // Friendly unit blocks the tile entirely.
      const occupant = state.unitAt(n.x, n.y);
      if (occupant && occupant.uid !== unit.uid && occupant.faction === unit.faction) {
        continue;
      }
      // Enemy unit means "you can move adjacent and may attack" — we don't
      // include enemy-occupied tiles in the reachable list, attacks are
      // resolved through CombatSystem. (However, for capture & movement
      // cost we still allow stopping on enemy-empty cities.)
      if (occupant && occupant.faction !== unit.faction) continue;

      const newCost = current.cost + cost;
      if (newCost > unit.movementLeft) continue;

      const nKey = `${n.x},${n.y}`;
      const prev = costs.get(nKey);
      if (prev === undefined || newCost < prev) {
        costs.set(nKey, newCost);
        parents.set(nKey, currentKey);
        frontier.push({ x: n.x, y: n.y, cost: newCost });
      }
    }
  }

  return { costs, parents };
}

export function reconstructPath(reach: ReachInfo, target: Coord): Coord[] {
  const path: Coord[] = [];
  let key: string | null = `${target.x},${target.y}`;
  while (key) {
    const [xs, ys] = key.split(',');
    path.push({ x: parseInt(xs, 10), y: parseInt(ys, 10) });
    const parent: string | null | undefined = reach.parents.get(key);
    key = parent ?? null;
  }
  path.reverse();
  return path;
}

/**
 * Move a unit along the cheapest path to (tx,ty), spending movement points
 * accordingly. Returns true on success. Does NOT handle combat; use
 * CombatSystem.attack() for that.
 */
export function moveUnitTo(
  state: GameState,
  unit: Unit,
  tx: number,
  ty: number,
): boolean {
  const reach = getReachableTiles(state, unit);
  const targetKey = `${tx},${ty}`;
  const cost = reach.costs.get(targetKey);
  if (cost === undefined) return false;
  unit.movementLeft -= cost;
  unit.x = tx;
  unit.y = ty;
  state.pushLog(
    'move',
    unit.faction,
    `${UNIT_TYPES[unit.typeId].name} bewegt sich nach (${tx}, ${ty}).`,
  );

  // Capture city if eligible.
  const city = state.cityAt(tx, ty);
  if (city && city.faction !== unit.faction) {
    const def = UNIT_TYPES[unit.typeId];
    if (def.canCaptureCities) {
      const oldFaction = city.faction;
      city.faction = unit.faction;
      city.production = null;
      state.pushLog(
        'capture',
        unit.faction,
        `${city.name} eingenommen (vormals ${oldFaction === 'neutral' ? 'neutral' : oldFaction}).`,
      );
    }
  }
  return true;
}
