import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const PACK = join(ROOT, 'EmpireFog1944_AssetPack');
export const RUNTIME = join(PACK, 'runtime');
export const TRAILER_UNITS_DIR = join(RUNTIME, 'trailer-units');
export const PIPELINE = join(PACK, 'docs', 'pipeline');
export const SPECS_DIR = join(PIPELINE, 'specs');

export const TRAILER_UNIT_TYPES = [
  'tank',
  'infantry',
  'artillery',
  'destroyer',
  'battleship',
  'submarine',
  'fighter',
  'bomber',
] ;

export const FRAME_COUNTS = {
  tank: 5,
  infantry: 4,
  artillery: 5,
  destroyer: 4,
  battleship: 4,
  submarine: 4,
  fighter: 4,
  bomber: 4,
};
