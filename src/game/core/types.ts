// Central type definitions for Empire Fog 1944.
// Keeping them in one place avoids circular imports between systems.

export type Faction = 'allies' | 'axis' | 'neutral';

export type Domain = 'land' | 'air' | 'sea' | 'subsea';

export type TerrainType =
  | 'water'
  | 'plain'
  | 'forest'
  | 'hills'
  | 'mountain'
  | 'desert'
  | 'marsh'
  | 'road'
  | 'city'
  | 'port'
  | 'airfield';

/** Multi-tile settlements: capital 2×2, town 2×1, village 1×1 — only capital/town may produce. */
export type SettlementKind = 'capital' | 'town' | 'village';

export type UnitTypeId =
  | 'infantry'
  | 'special'
  | 'tank'
  | 'flak'
  | 'fighter'
  | 'divebomber'
  | 'transport'
  | 'destroyer'
  | 'submarine'
  | 'carrier'
  | 'battleship';

export interface Coord {
  x: number;
  y: number;
}

export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  cityId?: string; // present if terrain is city/port/airfield linked to a city
}

export type FogState = 'unknown' | 'explored' | 'visible';

export interface UnitDefinition {
  id: UnitTypeId;
  name: string;
  domain: Domain;
  movement: number;
  attack: number;
  defense: number;
  sight: number;
  range: number;
  hpMax: number;
  productionTurns: number;
  canCaptureCities: boolean;
  symbol: string; // single character glyph for placeholder rendering
  notes?: string;
  /** small bonus multiplier when attacking certain domains, e.g. flak vs air */
  bonusVs?: Partial<Record<Domain, number>>;
}

export interface Unit {
  uid: string;
  typeId: UnitTypeId;
  faction: Faction;
  x: number;
  y: number;
  hp: number;
  movementLeft: number;
  hasAttacked: boolean;
}

export interface City {
  id: string;
  name: string;
  /** Top-left tile of the settlement footprint. */
  x: number;
  y: number;
  /** Footprint width/height in tiles (capital 2×2, town 2×1, village 1×1). */
  tileWidth: number;
  tileHeight: number;
  settlementKind: SettlementKind;
  faction: Faction;
  hasPort: boolean;
  hasAirfield: boolean;
  hasFactory: boolean;
  production: ProductionOrder | null;
}

export interface ProductionOrder {
  unitTypeId: UnitTypeId;
  turnsTotal: number;
  turnsRemaining: number;
}

export type LogEntryKind = 'system' | 'move' | 'combat' | 'production' | 'capture';

export interface LogEntry {
  turn: number;
  faction: Faction;
  kind: LogEntryKind;
  message: string;
}

export interface FactionState {
  faction: Faction;
  isPlayer: boolean;
}

export type Phase = 'menu' | 'player_turn' | 'ai_turn' | 'game_over';
