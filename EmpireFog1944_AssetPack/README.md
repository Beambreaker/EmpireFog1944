# Empire Fog 1944 — Runtime Asset Pack

Prozedural generiertes, **neutrales** SVG-Asset-Pack für den Spielprototyp.

## Inhalt

| Ordner | Inhalt |
|--------|--------|
| `runtime/units/soldiers/` | Infanterie, Spezialkräfte, Panzer, Flak, Artillerie, Pioniere |
| `runtime/units/aircraft/` | Jäger, Sturzkampf, Transport, Aufklärer, schwerer Bomber |
| `runtime/units/ships/` | Zerstörer, Träger, Schlachtschiff, Kreuzer, Patrouillenboot, Landungsschiff |
| `runtime/units/submarines/` | U-Boot, aufgetaucht, Torpedo-Variante |
| `runtime/cities/` | Dorf, Stadt, Hauptstadt, Hafen, Flugplatz, Fabrik, Festung, Radar |
| `runtime/terrain/` | Wasser, Küste, Ebene, Wald, Gebirge, Wüste, Sumpf, Straße, Hügel |
| `runtime/factions/` | Embleme Alliierte / Achsen / Neutral |
| `runtime/ui/` | Token-Rahmen, Auswahl, HP-Balken, Fog, Bewegungs-Highlight |
| `runtime/effects/` | Explosion, Rauch |

## Regenerieren

```bash
node scripts/generate-empirefog-asset-pack.mjs
```

Erzeugt alle SVGs unter `runtime/` und aktualisiert `docs/ASSET_MANIFEST.json`.

## Stilregeln (HART)

- Keine verbotenen NS-Symbole, keine Propaganda, keine glorifizierende Darstellung.
- Alliierte: blauer Stern. Achsenmächte: neutrales geometrisches Abzeichen.
- Taktische Kartenästhetik: gedämpfte Oliv-/Marine-/Goldtöne.

## Spiel-Integration (nächster Schritt)

Assets können in `BootScene` per `this.load.svg(key, path)` geladen werden, z. B.:

```ts
this.load.svg('unit-tank', 'EmpireFog1944_AssetPack/runtime/units/soldiers/tank.svg');
```

Siehe `docs/ASSET_MANIFEST.md` für die vollständige Key-Liste.
