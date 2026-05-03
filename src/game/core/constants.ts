import type { Faction, TerrainType } from './types';

// ---------------------------------------------------------------------------
// Map / Grid
// ---------------------------------------------------------------------------
export const MAP_WIDTH = 48;
export const MAP_HEIGHT = 32;
export const TILE_SIZE = 28; // pixels per tile, base size before camera zoom

// ---------------------------------------------------------------------------
// Game pacing
// ---------------------------------------------------------------------------
export const UNIT_HP_MAX = 10;
export const COMBAT_RANDOM_RANGE = 0.2; // ±20% randomness on combat damage
export const FACTORY_PRODUCTION_BONUS = 1; // factory reduces turns by 1, min 1
export const STARTING_CITIES_PER_FACTION = 2;

// ---------------------------------------------------------------------------
// Terrain rules
// ---------------------------------------------------------------------------
// Movement cost per terrain for LAND units. Infinity = impassable.
export const LAND_MOVEMENT_COST: Record<TerrainType, number> = {
  water: Infinity,
  plain: 1,
  forest: 2,
  mountain: 3,
  city: 1,
  port: 1,
  airfield: 1,
};

// Movement cost per terrain for SEA / SUBSEA units.
export const SEA_MOVEMENT_COST: Record<TerrainType, number> = {
  water: 1,
  plain: Infinity,
  forest: Infinity,
  mountain: Infinity,
  city: Infinity,
  port: 1, // ships may dock at port tiles
  airfield: Infinity,
};

// AIR units traverse anything at cost 1.
export const AIR_MOVEMENT_COST: Record<TerrainType, number> = {
  water: 1,
  plain: 1,
  forest: 1,
  mountain: 1,
  city: 1,
  port: 1,
  airfield: 1,
};

// Defensive bonus depending on terrain (additive to defense stat).
export const TERRAIN_DEFENSE_BONUS: Record<TerrainType, number> = {
  water: 0,
  plain: 0,
  forest: 1,
  mountain: 2,
  city: 2,
  port: 1,
  airfield: 1,
};

// ---------------------------------------------------------------------------
// Faction colors / symbols
// ---------------------------------------------------------------------------
export const FACTION_COLORS: Record<Faction, number> = {
  allies: 0x3a78c8, // steel blue
  axis: 0x6a7280, // neutral steel grey
  neutral: 0x8a9bb3,
};

export const FACTION_COLOR_HEX: Record<Faction, string> = {
  allies: '#3a78c8',
  axis: '#6a7280',
  neutral: '#8a9bb3',
};

export const FACTION_NAME: Record<Faction, string> = {
  allies: 'Alliierte',
  axis: 'Achsenmächte',
  neutral: 'Neutral',
};

// ---------------------------------------------------------------------------
// Procedural generation seed (default)
// ---------------------------------------------------------------------------
export const DEFAULT_SEED = 19440101;
