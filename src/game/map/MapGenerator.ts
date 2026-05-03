import type { City, TerrainType, Faction } from '../core/types';
import { MAP_HEIGHT, MAP_WIDTH, STARTING_CITIES_PER_FACTION } from '../core/constants';
import { TileMap } from './TileMap';
import { SeededRandom } from '../utils/SeededRandom';

const CITY_NAMES = [
  'Aachen', 'Bordeaux', 'Calais', 'Dover', 'Edinburgh', 'Florenz',
  'Gibraltar', 'Hamburg', 'Innsbruck', 'Königsberg', 'Lyon', 'Mailand',
  'Narvik', 'Odessa', 'Plymouth', 'Rotterdam', 'Sevilla', 'Triest',
  'Utrecht', 'Verdun', 'Warschau', 'Zagreb', 'Antwerpen', 'Belgrad',
  'Coventry', 'Danzig', 'Eindhoven', 'Faenza', 'Genua', 'Helsinki',
];

export interface GeneratedMap {
  tileMap: TileMap;
  cities: City[];
}

interface IslandSeed {
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Procedurally builds a map of multiple islands/continents with seeded RNG.
 * Same seed always produces the same map.
 *
 * The generator is intentionally simple but structured:
 *   1. Carve a few islands using overlapping radial blobs.
 *   2. Smooth using a couple of cellular-automata passes.
 *   3. Assign secondary terrain (forest, mountain) by elevation noise.
 *   4. Place cities, ports and airfields on suitable tiles.
 *   5. Hand out two starting cities per faction near opposite map edges.
 */
export function generateMap(
  seed: number,
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT,
): GeneratedMap {
  const rng = new SeededRandom(seed);
  const tileMap = new TileMap(width, height);

  // ------------------------------------------------------------------
  // Step 1: spawn island seeds with sizes biased toward larger blobs.
  // ------------------------------------------------------------------
  const islandCount = rng.range(4, 6);
  const islands: IslandSeed[] = [];

  // Force two large continents on opposite sides of the map.
  islands.push({
    cx: Math.floor(width * 0.22),
    cy: Math.floor(height * 0.5 + rng.rangeFloat(-3, 3)),
    radius: Math.floor(Math.min(width, height) * 0.28),
  });
  islands.push({
    cx: Math.floor(width * 0.78),
    cy: Math.floor(height * 0.5 + rng.rangeFloat(-3, 3)),
    radius: Math.floor(Math.min(width, height) * 0.28),
  });
  // Add 2-4 smaller islands somewhere in between.
  for (let i = 0; i < islandCount - 2; i++) {
    islands.push({
      cx: rng.range(Math.floor(width * 0.35), Math.floor(width * 0.65)),
      cy: rng.range(3, height - 4),
      radius: rng.range(3, 6),
    });
  }

  // Carve islands by radial falloff with noise.
  for (const isle of islands) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - isle.cx;
        const dy = y - isle.cy;
        const distSq = dx * dx + dy * dy;
        const r = isle.radius + rng.rangeFloat(-1.5, 1.5);
        if (distSq <= r * r) {
          tileMap.setTerrain(x, y, 'plain');
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Step 2: cellular automata smoothing — removes lone water specks
  // inside land areas and lone land specks in the ocean.
  // ------------------------------------------------------------------
  for (let pass = 0; pass < 2; pass++) {
    const snapshot: TerrainType[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        snapshot.push(tileMap.get(x, y)!.terrain);
      }
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let landNeighbours = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (dx === 0 && dy === 0) continue;
            if (snapshot[ny * width + nx] !== 'water') landNeighbours++;
          }
        }
        const cur = snapshot[y * width + x];
        if (cur === 'water' && landNeighbours >= 6) tileMap.setTerrain(x, y, 'plain');
        if (cur !== 'water' && landNeighbours <= 1) tileMap.setTerrain(x, y, 'water');
      }
    }
  }

  // ------------------------------------------------------------------
  // Step 3: Add forest / mountain detail to land using value noise.
  // ------------------------------------------------------------------
  const elevation = (x: number, y: number, salt: number): number => {
    // Cheap pseudo-noise based on the seeded RNG hashed by coordinates.
    const v =
      Math.sin((x * 12.9898 + y * 78.233 + salt + seed) * 0.0001 + (x + y)) * 43758.5453;
    return v - Math.floor(v);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tileMap.get(x, y)!;
      if (tile.terrain !== 'plain') continue;
      const e = elevation(x, y, 7) * 0.6 + rng.next() * 0.4;
      if (e > 0.85) tileMap.setTerrain(x, y, 'mountain');
      else if (e > 0.6) tileMap.setTerrain(x, y, 'forest');
    }
  }

  // ------------------------------------------------------------------
  // Step 4: Place cities. Cities prefer plain tiles. Some get ports
  // (adjacent water) or airfields (open hinterland).
  // ------------------------------------------------------------------
  const cities: City[] = [];
  const usedNames = new Set<string>();
  const occupied = new Set<string>();

  const isPlain = (x: number, y: number) => tileMap.get(x, y)?.terrain === 'plain';
  const hasWaterNeighbour = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (tileMap.get(x + dx, y + dy)?.terrain === 'water') return true;
      }
    }
    return false;
  };

  const candidates: { x: number; y: number; coastal: boolean }[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (!isPlain(x, y)) continue;
      candidates.push({ x, y, coastal: hasWaterNeighbour(x, y) });
    }
  }
  rng.shuffle(candidates);

  const TARGET_CITY_COUNT = Math.min(14, Math.max(8, Math.floor(candidates.length * 0.06)));
  let cityIdCounter = 0;
  const pickCityName = (): string => {
    while (usedNames.size < CITY_NAMES.length) {
      const name = rng.pick(CITY_NAMES);
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    return `Stadt-${cityIdCounter}`;
  };

  for (const c of candidates) {
    if (cities.length >= TARGET_CITY_COUNT) break;
    // Enforce minimum spacing between cities so the map breathes.
    let tooClose = false;
    for (const existing of cities) {
      const md = Math.abs(existing.x - c.x) + Math.abs(existing.y - c.y);
      if (md < 5) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    occupied.add(`${c.x},${c.y}`);
    const id = `city_${cityIdCounter++}`;
    const cityName = pickCityName();

    // Decide terrain type for the city tile itself.
    const isCoastal = c.coastal;
    const wantsAirfield = !isCoastal && rng.next() < 0.45;
    let terrain: TerrainType = 'city';
    if (isCoastal && rng.next() < 0.7) terrain = 'port';
    else if (wantsAirfield) terrain = 'airfield';
    tileMap.setTerrain(c.x, c.y, terrain);
    tileMap.setCity(c.x, c.y, id);

    cities.push({
      id,
      name: cityName,
      x: c.x,
      y: c.y,
      faction: 'neutral',
      hasPort: terrain === 'port',
      hasAirfield: terrain === 'airfield' || rng.next() < 0.25,
      hasFactory: rng.next() < 0.4,
      production: null,
    });
  }

  // ------------------------------------------------------------------
  // Step 5: Assign starting cities to factions. Pick the westernmost
  // cluster for one faction and the easternmost for the other so that
  // they're naturally separated by the central sea.
  // ------------------------------------------------------------------
  const sortedByX = [...cities].sort((a, b) => a.x - b.x);
  const alliesAreWest = rng.next() < 0.5;

  const westCities = sortedByX.slice(0, STARTING_CITIES_PER_FACTION);
  const eastCities = sortedByX.slice(-STARTING_CITIES_PER_FACTION);

  const westFaction: Faction = alliesAreWest ? 'allies' : 'axis';
  const eastFaction: Faction = alliesAreWest ? 'axis' : 'allies';

  for (const c of westCities) c.faction = westFaction;
  for (const c of eastCities) c.faction = eastFaction;

  // Make sure starting cities can produce things — give one a factory and
  // ensure at least one port + one airfield exists per faction's holdings
  // when feasible.
  for (const f of ['allies', 'axis'] as Faction[]) {
    const owned = cities.filter((c) => c.faction === f);
    if (owned.length === 0) continue;
    if (!owned.some((c) => c.hasFactory)) owned[0].hasFactory = true;
    if (!owned.some((c) => c.hasPort)) {
      // upgrade one if it sits next to water
      const coastal = owned.find((c) => hasWaterNeighbour(c.x, c.y));
      if (coastal) {
        coastal.hasPort = true;
        tileMap.setTerrain(coastal.x, coastal.y, 'port');
      }
    }
    if (!owned.some((c) => c.hasAirfield)) owned[0].hasAirfield = true;
  }

  return { tileMap, cities };
}
