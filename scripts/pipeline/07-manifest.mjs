/** Rolle: Technische Dokumentation — Manifest-Einträge Trailer. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PACK, TRAILER_UNIT_TYPES, FRAME_COUNTS } from './config.mjs';

const manifestPath = join(PACK, 'docs', 'ASSET_MANIFEST.json');
const manifest = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : { assets: [] };

const trailerEntries = TRAILER_UNIT_TYPES.flatMap((unit) =>
  Array.from({ length: FRAME_COUNTS[unit] }, (_, f) => ({
    id: `trailer-${unit}-${f}`,
    path: `runtime/trailer-units/${unit}/frame-${f}.svg`,
    category: 'trailer-unit',
    size: '512x512',
  })),
);

manifest.trailerUnits = trailerEntries;
manifest.trailerGeneratedAt = new Date().toISOString();
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`[07-manifest] ${trailerEntries.length} Trailer-Assets im Manifest`);
