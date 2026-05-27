/**
 * Kampagnen-Missionen mit deutscher Story zwischen den Runden.
 */

export interface CampaignMission {
  id: string;
  /** Ab dieser Spielerrunde wird das Briefing gezeigt. */
  startTurn: number;
  title: string;
  briefing: string[];
  objectives: string[];
  /** Logzeile nach Abschluss des Briefings. */
  logLine: string;
}

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 'm1-aufbruch',
    startTurn: 1,
    title: 'Auftrag 1 — Erster Nebel',
    briefing: [
      'Das Oberkommando meldet: Die Front liegt unter dichtem Nebel.',
      'Halte deine Startstädte und erkunde vorsichtig die Nachbarschaft.',
      'Jede sichtbare Kachel ist ein Risiko — und eine Chance.',
    ],
    objectives: [
      'Bewege mindestens eine Einheit.',
      'Behalte beide Startstädte unter deiner Kontrolle.',
    ],
    logLine: 'Briefing: Erkundung unter Nebel — Auftrag 1 aktiv.',
  },
  {
    id: 'm2-stoss',
    startTurn: 3,
    title: 'Auftrag 2 — Stoß ins Unbekannte',
    briefing: [
      'Funkmeldungen: Der Gegner verlegt Reserven an die Flanke.',
      'Nutze den Nebel für einen kurzen Stoß auf eine feindnahe Stadt.',
      'Produktion in deinen Städten nicht vergessen.',
    ],
    objectives: [
      'Erobere mindestens eine feindliche Stadt, oder',
      'vernichte zwei feindliche Einheiten.',
    ],
    logLine: 'Briefing: Flankenstoß — Auftrag 2 aktiv.',
  },
  {
    id: 'm3-halt',
    startTurn: 5,
    title: 'Auftrag 3 — Linie halten',
    briefing: [
      'Die Gegenseite sammelt Kräfte für einen Gegenstoß.',
      'Verstärke kritische Abschnitte und halte die Versorgungsstädte.',
      'Ein verlorener Hafen oder Flugplatz kann die ganze Operation kippen.',
    ],
    objectives: [
      'Kontrolliere am Ende der Runde mindestens drei Städte.',
      'Verliere keine Hauptstadt.',
    ],
    logLine: 'Briefing: Verteidigung der Kerngebiete — Auftrag 3 aktiv.',
  },
  {
    id: 'm4-entscheidung',
    startTurn: 8,
    title: 'Auftrag 4 — Entscheidungsschlacht',
    briefing: [
      'Der Nebel lichtet sich stellenweise — kurze Zeitfenster für Präzisionsschläge.',
      'Koordiniere Land-, See- und Lufteinheiten.',
      'Wer jetzt zögert, verliert die Initiative für den Rest der Kampagne.',
    ],
    objectives: [
      'Erreiche den Sieg (alle feindlichen Städte oder Vernichtung der Armee).',
    ],
    logLine: 'Briefing: Entscheidungsschlacht — letzte Phase der Operation Nebelfront.',
  },
];

export function missionForPlayerTurn(turn: number): CampaignMission | undefined {
  let found: CampaignMission | undefined;
  for (const m of CAMPAIGN_MISSIONS) {
    if (turn >= m.startTurn) found = m;
  }
  return found;
}

export function missionBriefingDue(turn: number, lastShownMissionId: string | null): CampaignMission | undefined {
  const m = missionForPlayerTurn(turn);
  if (!m) return undefined;
  if (m.startTurn !== turn) return undefined;
  if (m.id === lastShownMissionId) return undefined;
  return m;
}
