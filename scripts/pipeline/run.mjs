/** Studio-Orchestrator — alle Rollen nacheinander. */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const steps = ['01-brief.mjs', '02-spec.mjs', '03-generate.mjs', '04-clean.mjs', '05-postprocess.mjs', '07-manifest.mjs'];

for (const step of steps) {
  console.log(`\n=== Pipeline: ${step} ===`);
  const r = spawnSync(process.execPath, [join(dir, step)], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const prep = join(dir, '..', 'prepare-public-assets.mjs');
console.log('\n=== Pipeline: prepare-public-assets ===');
const p = spawnSync(process.execPath, [prep], { stdio: 'inherit' });
process.exit(p.status ?? 0);
