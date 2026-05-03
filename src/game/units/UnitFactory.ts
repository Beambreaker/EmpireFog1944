import type { Unit, UnitTypeId, Faction } from '../core/types';
import { UNIT_TYPES } from './UnitTypes';

let unitCounter = 0;

/**
 * Spawns a new unit at full HP with movement-points already filled, ready
 * to act on the next turn. The caller is responsible for placing it in the
 * GameState's unit list.
 */
export function createUnit(
  typeId: UnitTypeId,
  faction: Faction,
  x: number,
  y: number,
): Unit {
  const def = UNIT_TYPES[typeId];
  unitCounter += 1;
  return {
    uid: `u${unitCounter}`,
    typeId,
    faction,
    x,
    y,
    hp: def.hpMax,
    movementLeft: def.movement,
    hasAttacked: false,
  };
}
