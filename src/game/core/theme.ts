import type { Faction, TerrainType } from './types';

/**
 * Central visual theme (reference-inspired, procedural only — no bitmap sprites).
 * Aligns HUD/DOM via `rendering/UITheme.ts` + Phaser scenes import numbers from here.
 */
export const theme = {
  menu: {
    bgTop: 0x0e1e32,
    bgBottom: 0x060a12,
    grid: 0x1e3a55,
    gridAlpha: 0.45,
    gold: 0xc9a44a,
    goldBright: 0xe6d4a0,
    titleStroke: 0x1a1206,
    cardBg: 0x0c1826,
    cardBorder: 0x2a4560,
    cardBorderActive: 0xc9a44a,
    subtitle: 0x8a9bb3,
  },

  /** Fog overlay drawn on top of terrain (alpha). */
  fog: {
    unknown: { color: 0x020408, alpha: 0.94 },
    explored: { color: 0x05080c, alpha: 0.52 },
  },

  /** Map grid / highlights (Phaser hex). */
  map: {
    gridLine: 0x0a0f18,
    gridAlpha: 0.35,
    moveHighlight: 0xc9a44a,
    moveHighlightFillAlpha: 0.16,
    attackRange: 0xd96565,
    selection: 0xc9a44a,
  },

  faction: {
    allies: 0x3a78c8,
    axis: 0x6a7280,
    neutral: 0x8a9bb3,
  } satisfies Record<Faction, number>,

  factionHex: {
    allies: '#3a78c8',
    axis: '#6a7280',
    neutral: '#8a9bb3',
  } satisfies Record<Faction, string>,

  /** Base fills per logical terrain (TerrainRenderer may blend by neighbours). */
  terrainBase: {
    water: 0x0e2842,
    waterShallow: 0x1e6a72,
    sand: 0xd4c4a0,
    plain: 0x5a7444,
    forest: 0x324a2c,
    mountain: 0x6a6458,
    desert: 0xd0b080,
    marsh: 0x3c4a42,
    road: 0x7a7568,
    roadMark: 0xd4c48a,
    cityGround: 0x5a5344,
    building: 0x6a5a48,
    roof: 0xa84838,
    portPier: 0x4a4034,
    runway: 0x4a5048,
    runwayLine: 0xc8d0c8,
    chimney: 0x2a2824,
    smoke: 0x3a3836,
    wall: 0x7a7265,
  } satisfies Record<string, number>,

  /** Legacy labels for tooltips / TERRAIN_STYLES sync. */
  terrainLabel: {
    water: 'Wasser',
    plain: 'Ebene',
    forest: 'Wald',
    mountain: 'Gebirge',
    desert: 'Wüste',
    marsh: 'Sumpf',
    road: 'Straße',
    city: 'Stadt',
    port: 'Hafen',
    airfield: 'Flugplatz',
  } satisfies Record<TerrainType, string>,

  unit: {
    tokenBg: 0x141a22,
    tokenBgAlpha: 0.72,
    tokenInner: 0x1b2430,
    tokenInnerAlpha: 0.92,
    tokenEdge: 0x0a0e14,
    tokenGloss: 0xffffff,
    factionBandAlpha: 0.24,
    elitePip: 0xe6d4a0,
    moveReady: 0x87b2ff,
    moveSpent: 0x3e4b62,
    roleLand: 0x9fcf92,
    roleAir: 0x9ec7ff,
    roleSea: 0x7fc9d6,
    roleSubsea: 0x5f7e9f,
    infantryFill: 0x3d6b3a,
    symbolFill: 0xf0e6d2,
    hpGood: 0x4a9a5e,
    hpMid: 0xc9a44a,
    hpLow: 0xc14040,
  },
} as const;

export function terrainStyleFromTheme(t: TerrainType): { base: number; accent: number; label: string } {
  const label = theme.terrainLabel[t];
  switch (t) {
    case 'water':
      return { base: theme.terrainBase.water, accent: 0x1a4060, label };
    case 'plain':
      return { base: theme.terrainBase.plain, accent: 0x5a7440, label };
    case 'forest':
      return { base: theme.terrainBase.forest, accent: 0x3d5530, label };
    case 'mountain':
      return { base: theme.terrainBase.mountain, accent: 0x8a8278, label };
    case 'desert':
      return { base: theme.terrainBase.desert, accent: 0xd8bc8c, label };
    case 'marsh':
      return { base: theme.terrainBase.marsh, accent: 0x4a5c52, label };
    case 'road':
      return { base: theme.terrainBase.road, accent: theme.terrainBase.roadMark, label };
    case 'city':
      return { base: theme.terrainBase.cityGround, accent: theme.terrainBase.roof, label };
    case 'port':
      return { base: 0x4a5560, accent: theme.terrainBase.roof, label };
    case 'airfield':
      return { base: theme.terrainBase.runway, accent: theme.terrainBase.runwayLine, label };
  }
}
