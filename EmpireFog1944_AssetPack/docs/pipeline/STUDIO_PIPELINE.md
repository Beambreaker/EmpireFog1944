# Asset-Studio-Pipeline — Empire Fog 1944

Wie in einem echten Spielestudio: **jede Rolle = ein Schritt im Build**. Ein Befehl führt die Kette aus.

## Rollen (Agenten)

| Stufe | Rolle | Skript | Output |
|-------|--------|--------|--------|
| 1 | **Drehbuch / Trailer-Skript** | `01-brief.mjs` | `pipeline/brief.json` |
| 2 | **Art Direction / Spezifikation** | `02-spec.mjs` | `pipeline/specs/*.json` |
| 3 | **3D/2D-Erstellung (Silhouetten)** | `03-generate.mjs` | `runtime/trailer-units/**/frame-*.svg` |
| 4 | **Freistellen / Clean-up** | `04-clean.mjs` | bereinigte SVGs |
| 5 | **Nachbearbeitung (Licht, Kontrast)** | `05-postprocess.mjs` | optimierte SVGs |
| 6 | **Animation (Frames)** | (in 03) | Animations-Frames |
| 7 | **Engine-Export (Manifest)** | `07-manifest.mjs` | `docs/ASSET_MANIFEST.json` |
| 8 | **Public Copy** | `prepare-public-assets.mjs` | `public/assets/` |

## Ein Befehl

```bash
npm run assets:pipeline
```

Oder einzeln:

```bash
npm run assets:brief
npm run assets:spec
npm run assets:trailer
npm run assets:clean
npm run assets:post
npm run assets:manifest
npm run prepare:assets
```

## Spiel-Intro testen

```bash
npm run dev
```

Menü → **OPTIONEN** → **JETZT INTRO TESTEN**

## Texturenbibliothek

| Bereich | Pfad | Auflösung |
|---------|------|-----------|
| Trailer-Einheiten | `runtime/trailer-units/` | 512×512 SVG, 4–5 Frames |
| Strategie-Einheiten | `runtime/units/` | 96×96 SVG |
| Gelände | `runtime/terrain/` | 256×256 SVG |
| Küsten | `runtime/terrain-blend/` | 256×256 Masken |
| UI | `runtime/ui/` | 64–960 px |

## Inhaltsregeln

- Neutrales WW2, keine verbotenen Symbole.
- Alliierte: blauer Stern. Achse: neutrales Geometrie-Zeichen.
