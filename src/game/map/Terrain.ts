import type { TerrainType } from '../core/types';

// Visual properties for each terrain type. All graphics are generated
// procedurally via Phaser shape primitives, so we only need fill colours
// and a label; no external textures required.

export interface TerrainStyle {
  base: number; // primary fill colour
  accent: number; // accent / detail colour
  label: string;
}

export const TERRAIN_STYLES: Record<TerrainType, TerrainStyle> = {
  water: { base: 0x152a44, accent: 0x1f3d63, label: 'Wasser' },
  plain: { base: 0x4a6038, accent: 0x55703f, label: 'Ebene' },
  forest: { base: 0x2f4a2a, accent: 0x3d6035, label: 'Wald' },
  mountain: { base: 0x6a6a72, accent: 0x808088, label: 'Gebirge' },
  city: { base: 0x8a7a52, accent: 0xc9a44a, label: 'Stadt' },
  port: { base: 0x6a6a8a, accent: 0xc9a44a, label: 'Hafen' },
  airfield: { base: 0x5a5a4a, accent: 0xc9a44a, label: 'Flugplatz' },
};

export function isLandTerrain(t: TerrainType): boolean {
  return t !== 'water';
}

export function isWaterTerrain(t: TerrainType): boolean {
  return t === 'water' || t === 'port';
}
