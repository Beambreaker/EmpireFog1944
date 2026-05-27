/** Rolle: Freistellen — SVG bereinigen (kein Hintergrund, kompaktes XML). */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { TRAILER_UNITS_DIR } from './config.mjs';

function cleanSvg(raw) {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.svg')) {
      writeFileSync(p, cleanSvg(readFileSync(p, 'utf8')), 'utf8');
    }
  }
}

if (statSync(TRAILER_UNITS_DIR, { throwIf: false })?.isDirectory()) {
  walk(TRAILER_UNITS_DIR);
  console.log('[04-clean] trailer-units SVGs bereinigt');
} else {
  console.warn('[04-clean] Kein trailer-units — zuerst npm run assets:trailer');
}
