import type { TerrainType } from '../core/types';
import { terrainStyleFromTheme } from '../core/theme';

// Visual properties for each terrain type. All graphics are generated
// procedurally via Phaser shape primitives, so we only need fill colours
// and a label; no external textures required.

export interface TerrainStyle {
  base: number; // primary fill colour
  accent: number; // accent / detail colour
  label: string;
}

const ALL_TERRAIN: TerrainType[] = [
  'water',
  'plain',
  'forest',
  'mountain',
  'desert',
  'marsh',
  'road',
  'city',
  'port',
  'airfield',
];

export const TERRAIN_STYLES: Record<TerrainType, TerrainStyle> = Object.fromEntries(
  ALL_TERRAIN.map((t) => [t, terrainStyleFromTheme(t)]),
) as Record<TerrainType, TerrainStyle>;

export function isLandTerrain(t: TerrainType): boolean {
  return t !== 'water';
}

export function isWaterTerrain(t: TerrainType): boolean {
  return t === 'water' || t === 'port';
}
