/** Rolle: Drehbuch — Trailer-Zeitplan und Akte. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PIPELINE } from './config.mjs';

const brief = {
  title: 'Empire Fog 1944 — Intro-Trailer',
  language: 'de',
  acts: [
    { id: 'naval', label: 'SEESCHLACHT', startMs: 0, endMs: 5000 },
    { id: 'ground', label: 'PANZERANGRIFF', startMs: 5000, endMs: 10000 },
    { id: 'air', label: 'LUFTSCHLACHT', startMs: 10000, endMs: 19000 },
    { id: 'title', label: 'OPERATION NEBELFRONT', startMs: 19000, endMs: 30000 },
  ],
  lengths: { kurz: 8000, standard: 30000, lang: 45000 },
  units: {
    naval: ['battleship', 'destroyer', 'submarine'],
    ground: ['tank', 'infantry', 'artillery'],
    air: ['fighter', 'bomber'],
  },
};

mkdirSync(PIPELINE, { recursive: true });
writeFileSync(join(PIPELINE, 'brief.json'), JSON.stringify(brief, null, 2), 'utf8');
console.log('[01-brief] pipeline/brief.json');
