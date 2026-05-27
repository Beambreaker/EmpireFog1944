/**
 * Copies runtime SVG pack, reference PNGs, and generated UI SVGs into public/assets/
 * for Vite dev server and production builds. Run after: npm run assets:generate
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'assets');

const RUNTIME_SRC = join(ROOT, 'EmpireFog1944_AssetPack', 'runtime');
const GENERATED_SRC = join(ROOT, 'src', 'assets', 'generated');
const REFERENCE_SRC = join(ROOT, 'src', 'assets', 'reference');

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.error(`[prepare-public-assets] Missing source directory: ${src}`);
    process.exit(1);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

function copyFilesMatching(srcDir, destDir, predicate) {
  if (!existsSync(srcDir)) {
    console.error(`[prepare-public-assets] Missing source directory: ${srcDir}`);
    process.exit(1);
  }
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    const srcPath = join(srcDir, name);
    if (!statSync(srcPath).isFile() || !predicate(name)) continue;
    cpSync(srcPath, join(destDir, name));
  }
}

mkdirSync(OUT, { recursive: true });

copyDir(RUNTIME_SRC, join(OUT, 'runtime'));
copyFilesMatching(REFERENCE_SRC, join(OUT, 'reference'), (n) => n.endsWith('.png'));
copyFilesMatching(GENERATED_SRC, join(OUT, 'generated'), (n) => n.endsWith('.svg'));

const requiredGenerated = ['map-grain.svg', 'fog-pattern.svg', 'menu-hero-frame.svg'];
for (const file of requiredGenerated) {
  const p = join(OUT, 'generated', file);
  if (!existsSync(p)) {
    console.error(
      `[prepare-public-assets] Missing ${file}. Run: npm run assets:generate`,
    );
    process.exit(1);
  }
}

console.log('[prepare-public-assets] public/assets ready (runtime, reference, generated).');
