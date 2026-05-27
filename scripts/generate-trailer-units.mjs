/**
 * Studio step 3: Erstellung — 512×512 Trailer-Einheiten (animierte SVG-Frames).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DRAWERS } from './pipeline/trailer-svg-draw.mjs';
import {
  TRAILER_UNIT_TYPES,
  TRAILER_UNITS_DIR,
  FRAME_COUNTS,
} from './pipeline/config.mjs';

for (const unit of TRAILER_UNIT_TYPES) {
  const count = FRAME_COUNTS[unit];
  const dir = join(TRAILER_UNITS_DIR, unit);
  mkdirSync(dir, { recursive: true });
  const draw = DRAWERS[unit];
  if (!draw) {
    console.error(`[trailer-units] No drawer for ${unit}`);
    process.exit(1);
  }
  for (let f = 0; f < count; f++) {
    const out = join(dir, `frame-${f}.svg`);
    writeFileSync(out, draw(f), 'utf8');
  }
  console.log(`[trailer-units] ${unit}: ${count} frames`);
}

console.log('[trailer-units] Done → EmpireFog1944_AssetPack/runtime/trailer-units/');
