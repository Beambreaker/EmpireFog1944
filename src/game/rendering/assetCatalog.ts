import type { SettlementKind, TerrainType, UnitTypeId } from '../core/types';

/** Öffentliche Laufzeit-Assets (nach npm run prepare:assets unter public/assets/). */
export const ASSET_PACK = 'assets/runtime';

/** Phaser-Video-Key für public/video/intro.mp4 */
export const INTRO_VIDEO_KEY = 'intro-video';

export const TEXTURE = {
  grain: 'tex-map-grain',
  fogPattern: 'tex-fog-pattern',
  menuFrame: 'menu-hero-frame',
  refTerrain: 'ref-terrain',
  refUnits: 'ref-units',
  emblemAllies: 'emblem-allies',
  emblemAxis: 'emblem-axis',
  emblemNeutral: 'emblem-neutral',
  uiMoveHighlight: 'ui-move-highlight',
  uiFogOverlay: 'ui-fog-overlay',
  introFog: 'intro-fog-layer',
  introMap: 'intro-map-silhouette',
  logoMark: 'logo-mark',
} as const;

const terrainKeys: Record<string, string> = {
  water: 'terrain-water',
  'water-shallow': 'terrain-water-shallow',
  coast: 'terrain-coast',
  plain: 'terrain-plain',
  forest: 'terrain-forest',
  mountain: 'terrain-mountain',
  desert: 'terrain-desert',
  marsh: 'terrain-marsh',
  road: 'terrain-road',
  hills: 'terrain-hills',
};

const cityKeys: Record<string, string> = {
  village: 'city-village',
  town: 'city-town',
  capital: 'city-capital',
  port: 'city-port',
  airfield: 'city-airfield',
  factory: 'city-factory',
  fortified: 'city-fortified-outpost',
  radar: 'city-radar-station',
};

const unitKeys: Record<UnitTypeId, string> = {
  infantry: 'unit-infantry',
  special: 'unit-special-forces',
  tank: 'unit-tank',
  flak: 'unit-flak-radar',
  fighter: 'unit-fighter',
  divebomber: 'unit-dive-bomber',
  transport: 'unit-transport',
  destroyer: 'unit-destroyer',
  submarine: 'unit-submarine',
  carrier: 'unit-carrier',
  battleship: 'unit-battleship',
};

export function terrainTextureKey(name: keyof typeof terrainKeys): string {
  return terrainKeys[name];
}

export function cityTextureKey(name: keyof typeof cityKeys): string {
  return cityKeys[name];
}

export function unitTextureKey(typeId: UnitTypeId): string {
  return unitKeys[typeId];
}

export function settlementTextureKey(kind: SettlementKind): string {
  switch (kind) {
    case 'capital':
      return cityKeys.capital;
    case 'town':
      return cityKeys.town;
    case 'village':
      return cityKeys.village;
  }
}

/** Pick terrain sprite for a map cell (coast / shallow water / settlements). */
export function terrainSpriteForTile(
  terrain: TerrainType,
  shallowWater: boolean,
  coastalLand: boolean,
  settlementKind?: SettlementKind,
  isPort?: boolean,
  isAirfield?: boolean,
  hasFactory?: boolean,
): string {
  if (terrain === 'water') {
    return shallowWater ? terrainKeys['water-shallow'] : terrainKeys.water;
  }
  if (coastalLand && (terrain === 'plain' || terrain === 'forest')) {
    return terrainKeys.coast;
  }
  if (isPort) return cityKeys.port;
  if (isAirfield) return cityKeys.airfield;
  if (hasFactory) return cityKeys.factory;
  if (terrain === 'city' && settlementKind) {
    return settlementTextureKey(settlementKind);
  }
  if (terrain in terrainKeys) {
    return terrainKeys[terrain as keyof typeof terrainKeys];
  }
  return terrainKeys.plain;
}

/** All SVG assets to register in BootScene. */
export const SVG_LOAD_LIST: ReadonlyArray<{
  key: string;
  path: string;
  w: number;
  h: number;
}> = [
  { key: TEXTURE.grain, path: 'assets/generated/map-grain.svg', w: 128, h: 128 },
  { key: TEXTURE.fogPattern, path: 'assets/generated/fog-pattern.svg', w: 96, h: 96 },
  { key: TEXTURE.menuFrame, path: 'assets/generated/menu-hero-frame.svg', w: 960, h: 540 },
  ...Object.entries(terrainKeys).map(([name, key]) => ({
    key,
    path: `${ASSET_PACK}/terrain/${name}.svg`,
    w: 256,
    h: 256,
  })),
  ...Object.entries(cityKeys).map(([name, key]) => {
    const file =
      name === 'fortified' ? 'fortified-outpost' : name === 'radar' ? 'radar-station' : name;
    return { key, path: `${ASSET_PACK}/cities/${file}.svg`, w: 256, h: 256 };
  }),
  { key: TEXTURE.emblemAllies, path: `${ASSET_PACK}/factions/emblem-allies.svg`, w: 256, h: 256 },
  { key: TEXTURE.emblemAxis, path: `${ASSET_PACK}/factions/emblem-axis.svg`, w: 256, h: 256 },
  { key: TEXTURE.emblemNeutral, path: `${ASSET_PACK}/factions/emblem-neutral.svg`, w: 256, h: 256 },
  { key: TEXTURE.introFog, path: `${ASSET_PACK}/intro/intro-fog-layer.svg`, w: 1920, h: 1080 },
  { key: TEXTURE.introMap, path: `${ASSET_PACK}/intro/intro-map-silhouette.svg`, w: 1200, h: 800 },
  { key: TEXTURE.logoMark, path: `${ASSET_PACK}/intro/logo-mark.svg`, w: 400, h: 400 },
  { key: TEXTURE.uiMoveHighlight, path: `${ASSET_PACK}/ui/move-highlight.svg`, w: 64, h: 64 },
  { key: TEXTURE.uiFogOverlay, path: `${ASSET_PACK}/ui/fog-overlay.svg`, w: 64, h: 64 },
  { key: 'unit-infantry', path: `${ASSET_PACK}/units/soldiers/infantry.svg`, w: 96, h: 96 },
  { key: 'unit-special-forces', path: `${ASSET_PACK}/units/soldiers/special-forces.svg`, w: 96, h: 96 },
  { key: 'unit-tank', path: `${ASSET_PACK}/units/soldiers/tank.svg`, w: 96, h: 96 },
  { key: 'unit-flak-radar', path: `${ASSET_PACK}/units/soldiers/flak-radar.svg`, w: 96, h: 96 },
  { key: 'unit-fighter', path: `${ASSET_PACK}/units/aircraft/fighter.svg`, w: 96, h: 96 },
  { key: 'unit-dive-bomber', path: `${ASSET_PACK}/units/aircraft/dive-bomber.svg`, w: 96, h: 96 },
  { key: 'unit-transport', path: `${ASSET_PACK}/units/aircraft/transport.svg`, w: 96, h: 96 },
  { key: 'unit-destroyer', path: `${ASSET_PACK}/units/ships/destroyer.svg`, w: 96, h: 96 },
  { key: 'unit-submarine', path: `${ASSET_PACK}/units/submarines/submarine.svg`, w: 96, h: 96 },
  { key: 'unit-carrier', path: `${ASSET_PACK}/units/ships/carrier.svg`, w: 96, h: 96 },
  { key: 'unit-battleship', path: `${ASSET_PACK}/units/ships/battleship.svg`, w: 96, h: 96 },
];
