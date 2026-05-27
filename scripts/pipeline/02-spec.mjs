/** Rolle: Art Direction — Spezifikationen pro Einheit. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPECS_DIR, TRAILER_UNIT_TYPES, FRAME_COUNTS } from './config.mjs';

const base = {
  canvas: 512,
  view: 'side',
  style: 'hammer-flat',
  rules: 'neutral-ww2-no-forbidden-symbols',
};

mkdirSync(SPECS_DIR, { recursive: true });
for (const unit of TRAILER_UNIT_TYPES) {
  const spec = {
    ...base,
    unit,
    frames: FRAME_COUNTS[unit],
    fps: unit === 'fighter' ? 12 : unit === 'tank' ? 8 : 6,
    output: `runtime/trailer-units/${unit}/frame-{n}.svg`,
  };
  writeFileSync(join(SPECS_DIR, `${unit}.json`), JSON.stringify(spec, null, 2), 'utf8');
}
console.log(`[02-spec] ${TRAILER_UNIT_TYPES.length} specs → pipeline/specs/`);
