/**
 * Deutscher Erzähltext für den Intro-Trailer (Synchron zu den Akten).
 */

export interface IntroNarrationCue {
  /** Millisekunden ab Trailer-Start */
  atMs: number;
  text: string;
}

export const INTRO_TRAILER_NARRATION: IntroNarrationCue[] = [
  { atMs: 800, text: 'Europa. Neunzehnhundertvierundvierzig.' },
  { atMs: 5500, text: 'Die Flotten feuern. Die Fronten brennen.' },
  { atMs: 10500, text: 'Panzer rollen durch den Rauch — kein Zurück.' },
  { atMs: 15500, text: 'Jagdgeschwader über dem Nebel. Städte werden umkämpft.' },
  { atMs: 20500, text: 'Empire Fog 1944. Operation Nebelfront beginnt.' },
  { atMs: 25500, text: 'Du führst das Oberkommando. Der Kontinent wartet nicht.' },
];

/** Gesamtdauer des eingebauten Trailers — Standard (ms). */
export const INTRO_TRAILER_DURATION_MS = 30000;

/** Kurz-Modus (~8 s). */
export const INTRO_TRAILER_SHORT_MS = 8000;
