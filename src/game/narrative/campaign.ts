/**
 * Campaign narrative — neutral historical framing, no glorification.
 * Used by IntroScene, menu briefing, and opening log entries.
 */

export interface StoryBeat {
  id: string;
  title: string;
  lines: string[];
  durationMs: number;
}

export const CAMPAIGN_TITLE = 'Operation Nebelfront';
export const CAMPAIGN_SUBTITLE = 'Europa 1944 — Der Krieg entscheidet sich im Nebel';

export const INTRO_BEATS: StoryBeat[] = [
  {
    id: 'fog',
    title: 'EMPIRE FOG 1944',
    lines: [
      'Der Kontinent liegt unter Kriegsnebel.',
      'Städte, Armeen, ganze Fronten —',
      'sichtbar nur für den, der sie erobert.',
    ],
    durationMs: 5200,
  },
  {
    id: 'stakes',
    title: CAMPAIGN_TITLE,
    lines: [
      'Zwei Koalitionen. Eine Karte. Kein Zurück.',
      'Jeder Zug schreibt Geschichte.',
      'Jede Stadt ein Schachfeld des Schicksals.',
    ],
    durationMs: 5500,
  },
  {
    id: 'command',
    title: 'OBERKOMMANDO',
    lines: [
      'Du trägst die Verantwortung für Korps, Flotten und Jagdgeschwader.',
      'Erobere Städte. Halte die Linie. Durchbreche den Nebel.',
    ],
    durationMs: 5000,
  },
];

export const FACTION_BRIEFING = {
  allies: {
    title: 'Alliierte Koalition',
    lines: [
      'Defensive Stärke, See- und Luftüberlegenheit.',
      'Halte die Produktion in deinen Städten.',
      'Der blaue Stern markiert deine Truppen.',
    ],
  },
  axis: {
    title: 'Achsenstreitkräfte',
    lines: [
      'Offensive Schläge, Panzer und Industrie.',
      'Dränge durch den Nebel, bevor der Gegner reagiert.',
      'Neutrales Strategieabzeichen — keine verbotenen Symbole.',
    ],
  },
} as const;

export function openingLogLines(factionLabel: string): string[] {
  return [
    `${CAMPAIGN_TITLE} — ${CAMPAIGN_SUBTITLE}`,
    `Oberkommando übernimmt die ${factionLabel}.`,
    'Erobere feindliche Städte oder vernichte ihre Streitkräfte.',
  ];
}
