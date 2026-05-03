import type { Unit } from '../core/types';
import { UNIT_TYPES } from './UnitTypes';

export function getUnitDef(unit: Unit) {
  return UNIT_TYPES[unit.typeId];
}

export function refreshUnitForNewTurn(unit: Unit): void {
  const def = UNIT_TYPES[unit.typeId];
  unit.movementLeft = def.movement;
  unit.hasAttacked = false;
}
