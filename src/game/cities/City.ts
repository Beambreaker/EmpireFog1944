import type { City, UnitTypeId } from '../core/types';
import { UNIT_TYPES } from '../units/UnitTypes';
import { FACTORY_PRODUCTION_BONUS } from '../core/constants';
import { cityCanProduce } from './cityGeometry';

/**
 * Returns which unit types this city is allowed to build.
 * - Villages: no production.
 * - Land units: capitals & towns
 * - Air units : requires hasAirfield
 * - Sea units : requires hasPort
 */
export function buildableUnits(city: City): UnitTypeId[] {
  if (!cityCanProduce(city)) return [];
  const result: UnitTypeId[] = [];
  for (const def of Object.values(UNIT_TYPES)) {
    if (def.domain === 'land') {
      result.push(def.id);
    } else if (def.domain === 'air' || def.domain === 'sea' || def.domain === 'subsea') {
      if (def.domain === 'air' && city.hasAirfield) result.push(def.id);
      if ((def.domain === 'sea' || def.domain === 'subsea') && city.hasPort) result.push(def.id);
    }
  }
  return result;
}

/**
 * Effective production duration for the given unit type at this city,
 * after factory bonuses.
 */
export function effectiveProductionTurns(city: City, unitTypeId: UnitTypeId): number {
  const base = UNIT_TYPES[unitTypeId].productionTurns;
  const bonus = city.hasFactory ? FACTORY_PRODUCTION_BONUS : 0;
  return Math.max(1, base - bonus);
}
