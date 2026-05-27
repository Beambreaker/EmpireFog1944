import type { City, SettlementKind, TerrainType, Faction } from '../core/types';
import { MAP_HEIGHT, MAP_WIDTH, STARTING_CITIES_PER_FACTION } from '../core/constants';
import { TileMap } from './TileMap';
import { SeededRandom } from '../utils/SeededRandom';
import { cityFootprint } from '../cities/cityGeometry';

const CITY_NAMES = [
  'Aachen', 'Bordeaux', 'Calais', 'Dover', 'Edinburgh', 'Florenz',
  'Gibraltar', 'Hamburg', 'Innsbruck', 'Königsberg', 'Lyon', 'Mailand',
  'Narvik', 'Odessa', 'Plymouth', 'Rotterdam', 'Sevilla', 'Triest',
  'Utrecht', 'Verdun', 'Warschau', 'Zagreb', 'Antwerpen', 'Belgrad',
  'Coventry', 'Danzig', 'Eindhoven', 'Faenza', 'Genua', 'Helsinki',
  'Brüssel', 'Prag', 'Krakau', 'Breslau', 'München', 'Nürnberg',
];

export interface GeneratedMap {
  tileMap: TileMap;
  cities: City[];
}

function minFootprintSeparation(
  ox: number,
  oy: number,
  w: number,
  h: number,
  existing: City[],
): number {
  let best = Infinity;
  for (const c of existing) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const x1 = ox + dx;
        const y1 = oy + dy;
        for (const p of cityFootprint(c)) {
          const d = Math.abs(x1 - p.x) + Math.abs(y1 - p.y);
          if (d < best) best = d;
        }
      }
    }
  }
  return best;
}

function canPlacePlainRect(tileMap: TileMap, ox: number, oy: number, w: number, h: number): boolean {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const x = ox + dx;
      const y = oy + dy;
      if (!tileMap.inBounds(x, y)) return false;
      const t = tileMap.get(x, y)!.terrain;
      if (t !== 'plain') return false;
    }
  }
  return true;
}

function hasWaterNeighbour(tileMap: TileMap, x: number, y: number): boolean {
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    if (tileMap.get(x + dx, y + dy)?.terrain === 'water') return true;
  }
  return false;
}

function footprintTouchesWater(tileMap: TileMap, c: City): boolean {
  for (const p of cityFootprint(c)) {
    if (hasWaterNeighbour(tileMap, p.x, p.y)) return true;
  }
  return false;
}

/**
 * One large “continent” (ellipse), detail terrain, multi-tile settlements.
 */
export function generateMap(
  seed: number,
  width: number = MAP_WIDTH,
  height: number = MAP_HEIGHT,
): GeneratedMap {
  const rng = new SeededRandom(seed);
  const tileMap = new TileMap(width, height);

  const cx = width * 0.5;
  const cy = height * 0.48;
  const rx = width * 0.44;
  const ry = height * 0.44;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy < 1) {
        tileMap.setTerrain(x, y, 'plain');
      }
    }
  }

  // Coast noise — bite a few bays into the silhouette.
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
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (snapshot[ny * width + nx] !== 'water') landNeighbours++;
          }
        }
        const cur = snapshot[y * width + x];
        if (cur === 'water' && landNeighbours >= 6) tileMap.setTerrain(x, y, 'plain');
        if (cur !== 'water' && landNeighbours <= 2) tileMap.setTerrain(x, y, 'water');
      }
    }
  }

  const elevation = (x: number, y: number, salt: number): number => {
    const v =
      Math.sin((x * 12.9898 + y * 78.233 + salt + seed) * 0.0001 + (x + y)) * 43758.5453;
    return v - Math.floor(v);
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tileMap.get(x, y)!;
      if (tile.terrain !== 'plain') continue;
      const e = elevation(x, y, 7) * 0.55 + rng.next() * 0.45;
      if (e > 0.86) tileMap.setTerrain(x, y, 'mountain');
      else if (e > 0.62) tileMap.setTerrain(x, y, 'forest');
    }
  }

  // Marsh along low-lying plains near water.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const t = tileMap.get(x, y)!.terrain;
      if (t !== 'plain') continue;
      if (!hasWaterNeighbour(tileMap, x, y)) continue;
      if (rng.next() < 0.42) tileMap.setTerrain(x, y, 'marsh');
    }
  }

  // Desert belt in the “south” of the map.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = tileMap.get(x, y)!;
      if (tile.terrain !== 'plain') continue;
      const southBias = (y - height * 0.42) / (height * 0.58);
      if (southBias > 0 && elevation(x, y, 99) + southBias * 0.35 > 0.72) {
        tileMap.setTerrain(x, y, 'desert');
      }
    }
  }

  const cities: City[] = [];
  const usedNames = new Set<string>();

  const pickCityName = (): string => {
    while (usedNames.size < CITY_NAMES.length) {
      const name = rng.pick(CITY_NAMES);
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    return `Ort-${cities.length}`;
  };

  const tryPlace = (
    kind: SettlementKind,
    tw: number,
    th: number,
    minSep: number,
  ): { x: number; y: number } | null => {
    const slots: { x: number; y: number }[] = [];
    for (let y = 2; y < height - th - 2; y++) {
      for (let x = 2; x < width - tw - 2; x++) {
        if (!canPlacePlainRect(tileMap, x, y, tw, th)) continue;
        if (cities.length > 0 && minFootprintSeparation(x, y, tw, th, cities) < minSep) continue;
        slots.push({ x, y });
      }
    }
    rng.shuffle(slots);
    return slots[0] ?? null;
  };

  let cityIdCounter = 0;

  const pushCity = (c: City): void => {
    for (const p of cityFootprint(c)) {
      tileMap.setCity(p.x, p.y, c.id);
    }
    cities.push(c);
  };

  const paintSettlementTiles = (city: City): void => {
    const touches = footprintTouchesWater(tileMap, city);
    const tiles = cityFootprint(city);
    let airfieldPlaced = false;
    for (const p of tiles) {
      let terr: TerrainType = 'city';
      if (hasWaterNeighbour(tileMap, p.x, p.y)) terr = 'port';
      else if (
        (city.settlementKind === 'capital' || city.settlementKind === 'town') &&
        city.hasAirfield &&
        !airfieldPlaced &&
        terr === 'city'
      ) {
        terr = 'airfield';
        airfieldPlaced = true;
      }
      tileMap.setTerrain(p.x, p.y, terr);
    }
    if (touches) city.hasPort = true;
  };

  // Capitals (2×2)
  const capitalCount = rng.range(4, 6);
  for (let i = 0; i < capitalCount; i++) {
    const pos = tryPlace('capital', 2, 2, 7);
    if (!pos) break;
    const id = `city_${cityIdCounter++}`;
    const city: City = {
      id,
      name: pickCityName(),
      x: pos.x,
      y: pos.y,
      tileWidth: 2,
      tileHeight: 2,
      settlementKind: 'capital',
      faction: 'neutral',
      hasPort: false,
      hasAirfield: true,
      hasFactory: rng.next() < 0.55,
      production: null,
    };
    pushCity(city);
    paintSettlementTiles(city);
  }

  // Towns (2×1)
  const townCount = rng.range(10, 14);
  for (let i = 0; i < townCount; i++) {
    const pos = tryPlace('town', 2, 1, 5);
    if (!pos) break;
    const id = `city_${cityIdCounter++}`;
    const city: City = {
      id,
      name: pickCityName(),
      x: pos.x,
      y: pos.y,
      tileWidth: 2,
      tileHeight: 1,
      settlementKind: 'town',
      faction: 'neutral',
      hasPort: false,
      hasAirfield: rng.next() < 0.65,
      hasFactory: rng.next() < 0.38,
      production: null,
    };
    pushCity(city);
    paintSettlementTiles(city);
  }

  // Villages (1×1)
  const villageTarget = Math.min(32, Math.max(16, Math.floor(width * height * 0.004)));
  for (let i = 0; i < villageTarget; i++) {
    const pos = tryPlace('village', 1, 1, 4);
    if (!pos) break;
    const id = `city_${cityIdCounter++}`;
    const city: City = {
      id,
      name: pickCityName(),
      x: pos.x,
      y: pos.y,
      tileWidth: 1,
      tileHeight: 1,
      settlementKind: 'village',
      faction: 'neutral',
      hasPort: false,
      hasAirfield: false,
      hasFactory: false,
      production: null,
    };
    pushCity(city);
    paintSettlementTiles(city);
  }

  const producers = cities.filter((c) => c.settlementKind === 'capital' || c.settlementKind === 'town');
  const sortedByX = [...producers].sort((a, b) => a.x - b.x);
  const alliesAreWest = rng.next() < 0.5;
  const westFaction: Faction = alliesAreWest ? 'allies' : 'axis';
  const eastFaction: Faction = alliesAreWest ? 'axis' : 'allies';

  const westPick = sortedByX.slice(0, STARTING_CITIES_PER_FACTION);
  const eastPick = sortedByX.slice(-STARTING_CITIES_PER_FACTION);

  for (const c of westPick) c.faction = westFaction;
  for (const c of eastPick) c.faction = eastFaction;

  // Sparse roads on open plains (visual + movement shortcut).
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const t = tileMap.get(x, y)!.terrain;
      if (t !== 'plain') continue;
      if (tileMap.get(x, y)!.cityId) continue;
      if (rng.next() > 0.016) continue;
      tileMap.setTerrain(x, y, 'road');
    }
  }

  for (const f of ['allies', 'axis'] as Faction[]) {
    const owned = cities.filter((c) => c.faction === f);
    if (owned.length === 0) continue;
    if (!owned.some((c) => c.hasFactory)) owned[0].hasFactory = true;
    if (!owned.some((c) => c.hasPort)) {
      const coastal = owned.find((c) => footprintTouchesWater(tileMap, c));
      if (coastal) {
        coastal.hasPort = true;
        for (const p of cityFootprint(coastal)) {
          if (hasWaterNeighbour(tileMap, p.x, p.y)) tileMap.setTerrain(p.x, p.y, 'port');
        }
      }
    }
    if (!owned.some((c) => c.hasAirfield)) {
      const cap = owned.find((c) => c.settlementKind === 'capital') ?? owned[0];
      cap.hasAirfield = true;
      const tlist = cityFootprint(cap);
      const landTile = tlist.find((p) => !hasWaterNeighbour(tileMap, p.x, p.y)) ?? tlist[0];
      if (landTile) tileMap.setTerrain(landTile.x, landTile.y, 'airfield');
    }
  }

  return { tileMap, cities };
}
