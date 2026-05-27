import type { Faction } from '../core/types';
import type { GameState } from '../core/GameState';
import {
  missionBriefingDue,
  missionForPlayerTurn,
  type CampaignMission,
} from './missions';

/**
 * Steuert Kampagnen-Briefings und Missions-Logik (alles auf Deutsch).
 */
export class CampaignDirector {
  private lastBriefingMissionId: string | null = null;

  constructor(_playerFaction: Faction) {}

  /** Briefing zu Beginn einer Spieler-Runde, falls neu. */
  pendingBriefing(turn: number): CampaignMission | undefined {
    return missionBriefingDue(turn, this.lastBriefingMissionId);
  }

  markBriefingShown(missionId: string): void {
    this.lastBriefingMissionId = missionId;
  }

  currentMission(turn: number): CampaignMission | undefined {
    return missionForPlayerTurn(turn);
  }

  /** Einfache Zielerfüllung für Missions-Feedback im Log. */
  evaluateMissionProgress(state: GameState): string | null {
    const m = missionForPlayerTurn(state.turn);
    if (!m) return null;

    const playerCities = state.cities.filter((c) => c.faction === state.playerFaction).length;
    const enemyUnits = state.units.filter((u) => u.faction === state.aiFaction && u.hp > 0).length;

    switch (m.id) {
      case 'm3-halt':
        if (playerCities >= 3) return 'Auftrag 3: Drei Städte unter deiner Kontrolle.';
        return null;
      case 'm2-stoss':
        if (enemyUnits === 0) return 'Auftrag 2: Feindliche Armee vernichtet.';
        return null;
      default:
        return null;
    }
  }
}
