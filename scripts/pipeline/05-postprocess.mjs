/** Rolle: Nachbearbeitung — leichter Schatten unter Silhouette. */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TRAILER_UNITS_DIR } from './config.mjs';

const SHADOW =
  '<ellipse cx="256" cy="420" rx="180" ry="24" fill="#000000" opacity="0.22"/>';

function postprocess(raw) {
  if (raw.includes('opacity="0.22"')) return raw;
  return raw.replace(/<rect width="512" height="512" fill="none"\/>/, `$&${SHADOW}`);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.svg')) {
      writeFileSync(p, postprocess(readFileSync(p, 'utf8')), 'utf8');
    }
  }
}

if (statSync(TRAILER_UNITS_DIR, { throwIf: false })?.isDirectory()) {
  walk(TRAILER_UNITS_DIR);
  console.log('[05-postprocess] Boden-Schatten ergänzt');
}
