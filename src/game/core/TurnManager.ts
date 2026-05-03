import type { GameState } from './GameState';
import type { Faction } from './types';
import { refreshUnitForNewTurn } from '../units/Unit';
import { tickProductionForFaction } from '../cities/ProductionSystem';

/**
 * Centralises end-of-turn logic so that scenes don't accidentally skip
 * a step (e.g. forgetting to refresh movement points).
 */
export class TurnManager {
  constructor(private readonly state: GameState) {}

  /**
   * Hand control over to the next faction. Order is fixed: player -> AI -> player.
   * On each handover we:
   *   1. tick production for the *incoming* faction
   *   2. refresh movement points for that faction's units
   *   3. recompute fog of war for both factions
   */
  endTurn(): void {
    const next: Faction = this.state.activeFaction === 'allies' ? 'axis' : 'allies';
    this.state.activeFaction = next;

    // Once we cycle back to the player, advance the turn counter.
    if (next === this.state.playerFaction) {
      this.state.turn += 1;
    }

    tickProductionForFaction(this.state, next);

    for (const u of this.state.units) {
      if (u.faction === next) refreshUnitForNewTurn(u);
    }

    this.state.fog.recompute(
      'allies',
      this.state.units,
      this.state.cities,
      this.state.tileMap,
    );
    this.state.fog.recompute(
      'axis',
      this.state.units,
      this.state.cities,
      this.state.tileMap,
    );

    this.state.phase = next === this.state.playerFaction ? 'player_turn' : 'ai_turn';
  }
}
