import type {
  City,
  Faction,
  LogEntry,
  LogEntryKind,
  Phase,
  Unit,
} from './types';
import { TileMap } from '../map/TileMap';
import { FogOfWar } from '../map/FogOfWar';
import { generateMap } from '../map/MapGenerator';
import { createUnit } from '../units/UnitFactory';
import { DEFAULT_SEED } from './constants';
import { FACTION_NAME } from './constants';
import { cityContains, cityFootprint } from '../cities/cityGeometry';
import { openingLogLines } from '../narrative/campaign';

/**
 * Authoritative game state — single source of truth for the strategy scene.
 * All mutating systems (movement, combat, production, AI) read and write
 * through this object. The renderer is purely a view onto its data.
 */
export class GameState {
  readonly seed: number;
  readonly tileMap: TileMap;
  readonly fog: FogOfWar;
  readonly cities: City[];
  readonly units: Unit[] = [];
  readonly log: LogEntry[] = [];

  playerFaction: Faction;
  aiFaction: Faction;

  turn: number = 1;
  phase: Phase = 'player_turn';
  /** Faction currently acting. */
  activeFaction: Faction;

  /** Optional callback the UI can subscribe to for log updates. */
  onLog?: (entry: LogEntry) => void;
  /** Optional callback the UI can subscribe to for state updates. */
  onChange?: () => void;

  constructor(playerFaction: Faction, seed: number = DEFAULT_SEED) {
    this.seed = seed;
    this.playerFaction = playerFaction;
    this.aiFaction = playerFaction === 'allies' ? 'axis' : 'allies';
    this.activeFaction = playerFaction;

    const generated = generateMap(seed);
    this.tileMap = generated.tileMap;
    this.cities = generated.cities;
    this.fog = new FogOfWar(this.tileMap.width, this.tileMap.height);

    // Spawn a starter garrison in each starting settlement (first footprint tile).
    for (const c of this.cities) {
      if (c.faction === 'neutral') continue;
      const tiles = cityFootprint(c);
      const spawn = tiles[0] ?? { x: c.x, y: c.y };
      this.units.push(createUnit('infantry', c.faction, spawn.x, spawn.y));
    }

    // Initial fog computation + lesbarer Start (nicht nur 2 Nebel-Flecken).
    this.fog.recompute(this.playerFaction, this.units, this.cities, this.tileMap);
    this.fog.bootstrapStartingVision(this.playerFaction, this.cities, 5, 14);
    this.fog.recompute(this.aiFaction, this.units, this.cities, this.tileMap);

    for (const line of openingLogLines(FACTION_NAME[playerFaction])) {
      this.pushLog('system', this.playerFaction, line);
    }
  }

  // ---------------------------- log helpers ------------------------------
  pushLog(kind: LogEntryKind, faction: Faction, message: string): void {
    const entry: LogEntry = { turn: this.turn, faction, kind, message };
    this.log.push(entry);
    if (this.log.length > 200) this.log.shift();
    this.onLog?.(entry);
  }

  // ---------------------------- lookups ----------------------------------
  unitAt(x: number, y: number): Unit | undefined {
    return this.units.find((u) => u.x === x && u.y === y && u.hp > 0);
  }

  cityAt(x: number, y: number): City | undefined {
    return this.cities.find((c) => cityContains(c, x, y));
  }

  unitsOf(faction: Faction): Unit[] {
    return this.units.filter((u) => u.faction === faction && u.hp > 0);
  }

  citiesOf(faction: Faction): City[] {
    return this.cities.filter((c) => c.faction === faction);
  }

  removeDeadUnits(): void {
    for (let i = this.units.length - 1; i >= 0; i--) {
      if (this.units[i].hp <= 0) this.units.splice(i, 1);
    }
  }

  /** Check victory: a faction has won when the opposing faction owns 0 cities AND has 0 units. */
  evaluateVictory(): Faction | null {
    const alliesAlive =
      this.citiesOf('allies').length > 0 || this.unitsOf('allies').length > 0;
    const axisAlive =
      this.citiesOf('axis').length > 0 || this.unitsOf('axis').length > 0;
    if (!alliesAlive && axisAlive) return 'axis';
    if (!axisAlive && alliesAlive) return 'allies';
    return null;
  }
}
