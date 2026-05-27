import type { GameState } from '../core/GameState';
import type { City, Unit, UnitTypeId } from '../core/types';
import { UNIT_TYPES } from '../units/UnitTypes';
import { getReachableTiles, moveUnitTo } from '../units/MovementSystem';
import { attack, canAttack } from '../units/CombatSystem';
import { startProduction } from '../cities/ProductionSystem';
import { buildableUnits } from '../cities/City';
import { cityAnchorCentreCell } from '../cities/cityGeometry';
import { manhattanDistance } from '../utils/GridMath';

/**
 * A deliberately simple opponent so the prototype is playable without
 * burying us in AI complexity. Behaviour:
 *
 *  1. For every owned city without a production order, queue a sensible unit.
 *  2. For every owned unit:
 *     a) If an enemy is in attack range -> attack the weakest one.
 *     b) Else move toward the closest known enemy unit, or the closest
 *        non-owned city if no enemy units are visible.
 *
 * "Visible" here means: tile fog state == 'visible' from the AI's perspective.
 */
export class SimpleAI {
  constructor(private readonly state: GameState) {}

  takeTurn(): void {
    const faction = this.state.aiFaction;

    // -------- Production --------
    for (const city of this.state.cities) {
      if (city.faction !== faction) continue;
      if (city.production) continue;
      const choice = this.pickProduction(city);
      if (choice) {
        startProduction(city, choice);
        this.state.pushLog(
          'production',
          faction,
          `${city.name} beginnt mit der Produktion: ${UNIT_TYPES[choice].name}.`,
        );
      }
    }

    // -------- Unit actions --------
    // Iterate over a snapshot because units may die during the loop.
    const units = [...this.state.unitsOf(faction)];
    for (const unit of units) {
      if (unit.hp <= 0) continue;
      this.actWithUnit(unit);
    }
  }

  private pickProduction(city: City): UnitTypeId | null {
    const allowed = buildableUnits(city);
    if (allowed.length === 0) return null;
    // Weighted pick: prefer infantry early game, then mix in mobile units.
    const ownedUnits = this.state.unitsOf(city.faction);
    const infantryCount = ownedUnits.filter((u) => u.typeId === 'infantry').length;
    const tankCount = ownedUnits.filter((u) => u.typeId === 'tank').length;

    if (infantryCount < 2 && allowed.includes('infantry')) return 'infantry';
    if (tankCount < 1 && allowed.includes('tank')) return 'tank';
    if (city.hasAirfield && Math.random() < 0.4 && allowed.includes('fighter')) {
      return 'fighter';
    }
    if (city.hasPort && Math.random() < 0.4 && allowed.includes('destroyer')) {
      return 'destroyer';
    }
    // Fallback: random allowed
    return allowed[Math.floor(Math.random() * allowed.length)];
  }

  private actWithUnit(unit: Unit): void {
    // 1. Attack adjacent enemy if possible.
    const adjEnemies = this.state
      .units
      .filter((u) => u.faction !== unit.faction && u.hp > 0)
      .filter((u) => Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1);

    if (adjEnemies.length > 0 && canAttack(this.state, unit, adjEnemies[0])) {
      adjEnemies.sort((a, b) => a.hp - b.hp);
      attack(this.state, unit, adjEnemies[0]);
      return;
    }

    // 2. Move toward objective.
    const target = this.pickMoveTarget(unit);
    if (!target) return;

    const reach = getReachableTiles(this.state, unit);
    let bestKey: string | null = null;
    let bestDist = Infinity;
    for (const [key] of reach.costs) {
      const [xs, ys] = key.split(',');
      const x = parseInt(xs, 10);
      const y = parseInt(ys, 10);
      const d = manhattanDistance({ x, y }, target);
      if (d < bestDist) {
        bestDist = d;
        bestKey = key;
      }
    }

    if (bestKey) {
      const [xs, ys] = bestKey.split(',');
      moveUnitTo(this.state, unit, parseInt(xs, 10), parseInt(ys, 10));

      // After moving, try to attack again.
      const newAdj = this.state
        .units
        .filter((u) => u.faction !== unit.faction && u.hp > 0)
        .filter((u) => Math.abs(u.x - unit.x) + Math.abs(u.y - unit.y) === 1);
      if (newAdj.length > 0 && canAttack(this.state, unit, newAdj[0])) {
        attack(this.state, unit, newAdj[0]);
      }
    }
  }

  private pickMoveTarget(unit: Unit): { x: number; y: number } | null {
    const faction = unit.faction;
    const fog = this.state.fog;

    // First preference: closest visible enemy unit.
    let bestEnemy: Unit | null = null;
    let bestEnemyDist = Infinity;
    for (const u of this.state.units) {
      if (u.faction === faction) continue;
      if (u.hp <= 0) continue;
      if (fog.get(faction, u.x, u.y) !== 'visible') continue;
      const d = manhattanDistance(unit, u);
      if (d < bestEnemyDist) {
        bestEnemyDist = d;
        bestEnemy = u;
      }
    }
    if (bestEnemy) return { x: bestEnemy.x, y: bestEnemy.y };

    // Otherwise: closest non-owned city (including neutrals) — undirected push.
    let bestCity: City | null = null;
    let bestCityDist = Infinity;
    for (const c of this.state.cities) {
      if (c.faction === faction) continue;
      const cell = cityAnchorCentreCell(c);
      const d = manhattanDistance(unit, cell);
      if (d < bestCityDist) {
        bestCityDist = d;
        bestCity = c;
      }
    }
    if (bestCity) {
      const cell = cityAnchorCentreCell(bestCity);
      return { x: cell.x, y: cell.y };
    }
    return null;
  }
}
