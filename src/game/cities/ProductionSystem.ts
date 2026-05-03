import type { City, Coord, Unit, UnitTypeId } from '../core/types';
import type { GameState } from '../core/GameState';
import { UNIT_TYPES } from '../units/UnitTypes';
import { createUnit } from '../units/UnitFactory';
import { buildableUnits, effectiveProductionTurns } from './City';
import {
  AIR_MOVEMENT_COST,
  LAND_MOVEMENT_COST,
  SEA_MOVEMENT_COST,
} from '../core/constants';

/**
 * Adds or replaces the production order at a city.
 */
export function startProduction(city: City, unitTypeId: UnitTypeId): boolean {
  const allowed = buildableUnits(city);
  if (!allowed.includes(unitTypeId)) return false;
  const turns = effectiveProductionTurns(city, unitTypeId);
  city.production = {
    unitTypeId,
    turnsTotal: turns,
    turnsRemaining: turns,
  };
  return true;
}

/**
 * Tick all cities of `faction` once: decrement counters and spawn finished units.
 */
export function tickProductionForFaction(state: GameState, faction: City['faction']): void {
  for (const city of state.cities) {
    if (city.faction !== faction) continue;
    if (!city.production) continue;
    city.production.turnsRemaining -= 1;
    if (city.production.turnsRemaining <= 0) {
      const def = UNIT_TYPES[city.production.unitTypeId];
      const spawn = findSpawnTile(state, city, city.production.unitTypeId);
      if (!spawn) {
        // No room to spawn — keep the order at 1 turn left so it tries again.
        city.production.turnsRemaining = 1;
        state.pushLog(
          'production',
          city.faction,
          `${city.name}: ${def.name} fertig, aber kein freies Feld zum Stationieren — wartet.`,
        );
        continue;
      }
      const unit: Unit = createUnit(city.production.unitTypeId, city.faction, spawn.x, spawn.y);
      // Newly built units may not act this turn.
      unit.movementLeft = 0;
      unit.hasAttacked = true;
      state.units.push(unit);
      state.pushLog(
        'production',
        city.faction,
        `${city.name}: ${def.name} fertiggestellt.`,
      );
      city.production = null;
    }
  }
}

/**
 * Pick the best spawn tile for a freshly-built unit. We try the city tile
 * first, then 4-neighbours, then a 5x5 ring outward.
 */
export function findSpawnTile(
  state: GameState,
  city: City,
  unitTypeId: UnitTypeId,
): Coord | null {
  const def = UNIT_TYPES[unitTypeId];
  const cost = (terrain: import('../core/types').TerrainType): number => {
    switch (def.domain) {
      case 'land':
        return LAND_MOVEMENT_COST[terrain];
      case 'sea':
      case 'subsea':
        return SEA_MOVEMENT_COST[terrain];
      case 'air':
        return AIR_MOVEMENT_COST[terrain];
    }
  };

  const candidates: Coord[] = [];
  for (let r = 0; r <= 3; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        candidates.push({ x: city.x + dx, y: city.y + dy });
      }
    }
  }

  for (const c of candidates) {
    if (!state.tileMap.inBounds(c.x, c.y)) continue;
    const tile = state.tileMap.get(c.x, c.y)!;
    if (!isFinite(cost(tile.terrain))) continue;
    if (state.unitAt(c.x, c.y)) continue; // occupied
    return c;
  }
  return null;
}
