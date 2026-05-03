import type { Unit } from '../core/types';
import { COMBAT_RANDOM_RANGE, TERRAIN_DEFENSE_BONUS } from '../core/constants';
import { UNIT_TYPES } from '../units/UnitTypes';
import type { GameState } from '../core/GameState';
import { chebyshevDistance } from '../utils/GridMath';

/**
 * Compact, deterministic-ish combat resolution.
 *
 * For an attack:
 *   attackerDamage = max(1, round(attackerAttack - defenderDefense/2 + jitter)) * bonus
 *   defenderRetaliation = max(0, round(defenderAttack/2 - attackerDefense/2 + jitter))
 *
 * Bonuses come from `bonusVs` on the unit definition (e.g. flak vs air).
 * Terrain defence bonuses are applied to the defender.
 */
export interface AttackResult {
  attackerDamageDealt: number;
  defenderRetaliation: number;
  attackerKilled: boolean;
  defenderKilled: boolean;
}

export function canAttack(state: GameState, attacker: Unit, defender: Unit): boolean {
  if (attacker.faction === defender.faction) return false;
  if (attacker.hasAttacked) return false;
  if (attacker.movementLeft <= 0) return false;
  const def = UNIT_TYPES[attacker.typeId];
  if (def.attack <= 0) return false;
  // Range is currently always 1 (melee adjacency). Future weapons can extend.
  const dist = chebyshevDistance(attacker, defender);
  return dist <= def.range;
}

export function attack(state: GameState, attacker: Unit, defender: Unit): AttackResult | null {
  if (!canAttack(state, attacker, defender)) return null;

  const aDef = UNIT_TYPES[attacker.typeId];
  const dDef = UNIT_TYPES[defender.typeId];
  const tile = state.tileMap.get(defender.x, defender.y);
  const terrainBonus = tile ? TERRAIN_DEFENSE_BONUS[tile.terrain] : 0;

  const aBonus = aDef.bonusVs?.[dDef.domain] ?? 1;
  const dBonus = dDef.bonusVs?.[aDef.domain] ?? 1;

  const jitter = () => 1 + (Math.random() * 2 - 1) * COMBAT_RANDOM_RANGE;

  // Attacker damage to defender.
  let aDmg = (aDef.attack * aBonus * jitter()) - (dDef.defense + terrainBonus) * 0.5;
  aDmg = Math.max(1, Math.round(aDmg));

  // Defender retaliation if alive after first hit and capable of attacking.
  let dDmg = 0;
  const survives = defender.hp - aDmg > 0;
  if (survives && dDef.attack > 0) {
    dDmg = dDef.attack * dBonus * 0.6 * jitter() - aDef.defense * 0.5;
    dDmg = Math.max(0, Math.round(dDmg));
  }

  defender.hp -= aDmg;
  attacker.hp -= dDmg;
  attacker.hasAttacked = true;
  // Attacking consumes the rest of the unit's movement.
  attacker.movementLeft = 0;

  const killed = defender.hp <= 0;
  const selfKilled = attacker.hp <= 0;

  state.pushLog(
    'combat',
    attacker.faction,
    `${aDef.name} greift ${dDef.name} an: ${aDmg} Schaden${dDmg > 0 ? `, Gegenangriff ${dDmg}` : ''}.`,
  );
  if (killed) state.pushLog('combat', attacker.faction, `${dDef.name} (${defender.faction}) zerstört.`);
  if (selfKilled) state.pushLog('combat', defender.faction, `${aDef.name} (${attacker.faction}) zerstört.`);

  state.removeDeadUnits();

  return {
    attackerDamageDealt: aDmg,
    defenderRetaliation: dDmg,
    attackerKilled: selfKilled,
    defenderKilled: killed,
  };
}
