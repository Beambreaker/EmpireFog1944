# Asset Manifest — Empire Fog 1944 Runtime Pack

**Version:** 1.0.0  
**Format:** SVG (64×64 Einheiten, 128×128 Terrain/Städte)  
**Pfad-Basis:** `EmpireFog1944_AssetPack/runtime/`

Maschinenlesbare Liste: `ASSET_MANIFEST.json`

---

## Soldaten / Land (`units/soldiers/`)

| Datei | Spiel-`UnitTypeId` | Beschreibung |
|-------|-------------------|--------------|
| `infantry.svg` | `infantry` | Infanterie-Kreuz |
| `special-forces.svg` | `special` | Spezialkräfte |
| `tank.svg` | `tank` | Panzer |
| `flak-radar.svg` | `flak` | Flak / Radar |
| `artillery.svg` | — | Reserve / spätere Einheit |
| `engineer.svg` | — | Reserve / spätere Einheit |

## Flugzeuge (`units/aircraft/`)

| Datei | Spiel-`UnitTypeId` | Beschreibung |
|-------|-------------------|--------------|
| `fighter.svg` | `fighter` | Jäger |
| `dive-bomber.svg` | `divebomber` | Sturzkampfflugzeug |
| `transport.svg` | `transport` | Transportflugzeug |
| `recon.svg` | — | Aufklärer (Reserve) |
| `heavy-bomber.svg` | — | Schwerer Bomber (Reserve) |

## Schiffe (`units/ships/`)

| Datei | Spiel-`UnitTypeId` | Beschreibung |
|-------|-------------------|--------------|
| `destroyer.svg` | `destroyer` | Zerstörer |
| `carrier.svg` | `carrier` | Flugzeugträger |
| `battleship.svg` | `battleship` | Schlachtschiff |
| `cruiser.svg` | — | Kreuzer (Reserve) |
| `patrol-boat.svg` | — | Patrouillenboot (Reserve) |
| `landing-ship.svg` | — | Landungsschiff (Reserve) |

## U-Boote (`units/submarines/`)

| Datei | Spiel-`UnitTypeId` | Beschreibung |
|-------|-------------------|--------------|
| `submarine.svg` | `submarine` | U-Boot getaucht |
| `submarine-surfaced.svg` | — | U-Boot aufgetaucht |
| `submarine-torpedo.svg` | — | U-Boot mit Torpedo-Symbol |

## Städte & Infrastruktur (`cities/`)

| Datei | Spielbezug | Beschreibung |
|-------|------------|--------------|
| `village.svg` | `settlementKind: village` | 1×1 Dorf |
| `town.svg` | `settlementKind: town` | 2×1 Stadt |
| `capital.svg` | `settlementKind: capital` | 2×2 Hauptstadt |
| `port.svg` | `terrain: port` | Hafen |
| `airfield.svg` | `terrain: airfield` | Flugplatz |
| `factory.svg` | `hasFactory` | Industrie / Fabrik |
| `fortified-outpost.svg` | — | Befestigter Außenposten |
| `radar-station.svg` | — | Radar (Flak-Sight-Thema) |

## Gelände (`terrain/`)

| Datei | Spiel-`TerrainType` | Beschreibung |
|-------|---------------------|--------------|
| `water.svg` | `water` | Tiefes Wasser |
| `water-shallow.svg` | `water` (Küste) | Flachwasser |
| `coast.svg` | — | Küstenübergang |
| `plain.svg` | `plain` | Ebene |
| `forest.svg` | `forest` | Wald |
| `mountain.svg` | `mountain` | Gebirge |
| `desert.svg` | `desert` | Wüste |
| `marsh.svg` | `marsh` | Sumpf |
| `road.svg` | `road` | Straße |
| `hills.svg` | — | Hügel (Reserve) |

## Fraktionen (`factions/`)

| Datei | Fraktion |
|-------|----------|
| `emblem-allies.svg` | `allies` |
| `emblem-axis.svg` | `axis` |
| `emblem-neutral.svg` | `neutral` |

## UI & Effekte

| Ordner | Dateien |
|--------|---------|
| `ui/` | `token-frame`, `selection-ring`, `hp-bar-full`, `hp-bar-damaged`, `fog-overlay`, `move-highlight` |
| `effects/` | `explosion`, `smoke` |

---

## Phaser-Ladekeys (Vorschlag)

```ts
// Beispiel BootScene
this.load.svg('unit-infantry', 'EmpireFog1944_AssetPack/runtime/units/soldiers/infantry.svg');
this.load.svg('unit-battleship', 'EmpireFog1944_AssetPack/runtime/units/ships/battleship.svg');
this.load.svg('terrain-forest', 'EmpireFog1944_AssetPack/runtime/terrain/forest.svg');
this.load.svg('city-capital', 'EmpireFog1944_AssetPack/runtime/cities/capital.svg');
```

---

## Regenerieren

```bash
npm run assets:generate
```
