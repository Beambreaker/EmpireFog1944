# Trailer-Asset-Plan — Empire Fog 1944

Dieses Dokument beschreibt Zielbild, Farben, Animation und Prompt-Karten für die **Kino-Intro-Einheiten** (512×512 SVG, Seitenansicht). Strategie-Karten nutzen weiterhin 96×96-Icons; der Trailer hat eigene Assets unter `runtime/trailer-units/`.

## Inhaltsregeln (verbindlich)

- Setting: neutrales WW2, **keine** verbotenen Symbole (kein Hakenkreuz, keine SS-Runen, keine Propaganda).
- Alliierte: blauer Stern als Erkennungszeichen (optional dezent am Rumpf/Helm).
- Achsenmächte: neutrales geometrisches Zeichen (Raute/Viereck), keine historischen Embleme.
- Silhouetten lesbar bei Trailer-Skalierung **0,22–0,28** der kleineren Bildschirmseite.

## Visuelle Ziele pro Einheitstyp (512 px)

| Typ | Lesbarkeit | Silhouette | Bewegung im Trailer |
|-----|------------|------------|---------------------|
| **Panzer** | Kette, Turm, Rohr, Rauch | Panzer-IV-ähnliche Seitenansicht, keine Insignien | Ketten-Offset (5 Frames), leichter Turm-Schwenk |
| **Infanterie** | Helm, Gewehr, Beine | Soldat Profil | 4-Frame-Marsch |
| **Artillerie** | Lafette, Rohr, Räder | Feldkanone | Rückstoß-Frame + Rauch |
| **Zerstörer** | Bug, Aufbauten, Geschütztürme | Mittleres Kriegsschiff | 4 Frames: Wasserlinie + Kielwelle |
| **Schlachtschiff** | Größer, Hauptgeschütze | Schwere Silhouette | Wie Zerstörer, langsameres Wippen |
| **U-Boot** | Turm, Luke, Rumpf (getaucht/surfaced) | Aufgetauchtes U-Boot | Periskop/Wasserlinie |
| **Jäger** | Tragflächen, Propeller, Rumpf | Propellerjäger Seite | Propeller-Blur (4 Frames) |
| **Sturzkampf** | gull wings, Bomber-Silhouette | Sturzkampfbomber | Flügel + leichte Bank |

## Fraktionsfarben (neutral, nur Tönung)

| Rolle | Basis | Akzent | Verwendung |
|-------|-------|--------|------------|
| Alliiert | `#2a4a6e` Dunkelblau | `#6aa8e8` Hellblau | Rumpf/Uniform-Tönung, Stern `#4a8fd4` |
| Achse (neutral) | `#3a3834` Grau-oliv | `#8a8880` Silbergrau | Geometrie `#6a6860` |
| Neutral | `#4a4844` | `#a8a4a0` | Hintergrund-Einheiten |

Tönung in Phaser per `setTint()`; SVGs bleiben grau/blau-neutral.

## Animations-Rahmenplan

```
tank/       frame-0 … frame-4   (8 fps, Loop)   Ketten + Auspuff
infantry/   frame-0 … frame-3   (10 fps)        Marsch
artillery/  frame-0 … frame-4   (6 fps, einmalig bei Feuer)
destroyer/  frame-0 … frame-3   (6 fps)         Welle + Rauch
battleship/ frame-0 … frame-3   (5 fps)
submarine/  frame-0 … frame-3   (6 fps)
fighter/    frame-0 … frame-3   (12 fps)        Propeller
bomber/     frame-0 … frame-3   (10 fps)
```

Phaser-Keys: `trailer-{typ}-{frame}` via `trailerAnimKey(typ, frame)`.

## Trailer-Längen

| Modus | Dauer | Einsatz |
|-------|-------|---------|
| **kurz** | 8 s | Schnelltest, Wiederholung |
| **standard** | 30 s | Erster Start |
| **lang** | 45 s | Optionen |

## Prompt-Karten (Design / KI)

### Panzer (Seite, 512×512)

> Seitenansicht mittlerer Panzer 1944, Panzer-IV-Proportionen, **ohne** nationale Insignien. Dunkelgrau-oliv, starke Silhouette: Ketten mit einzelnen Platten, Turm leicht nach rechts, Kanonenrohr horizontal. Stil: „Hammer“-Grafik, flache Schattierung, 2–3 Graustufen + blaue Alliierten- oder graue Achsen-Tönung. Frame-Variante: Kette um 8 px verschoben, kleiner Auspuff-Kegel.

### Infanterie

> Soldat Profil marschierend, Stahlhelm, Gewehr schräg. 4 Frames: Beine abwechselnd, keine Gesichtsdetails. Helm und Jacke als eine Form.

### Artillerie

> Feldkanone Seitenansicht, Lafette, große Räder. Ein Frame mit Rückstoß (Rohr 5° nach oben), Rauchwolke.

### Zerstörer / Schlachtschiff

> Kriegsschiff Seite, klare Bug-Linie, 2–3 Geschütztürme (Zerstörer) bzw. 3 Haupttürme (Schlachtschiff). Wasserlinie wellig, kein Text auf Rumpf.

### U-Boot

> Aufgetauchtes U-Boot, Turm mit Luke, Wellen an Wasserlinie. Keine Flaggen-Grafik.

### Jäger / Sturzkampfbomber

> Propellerflugzeug Seite, klare Tragfläche und Rumpf. Propeller als 3–4 rotierende Blur-Kreise. Sturzkampf: leicht nach unten geneigte Flügel.

## Pipeline (Studio-Rollen)

Siehe `docs/pipeline/STUDIO_PIPELINE.md` — ein Befehl für alle Schritte:

```bash
npm run assets:pipeline     # Brief → Spec → Erstellung → Clean → Post → Manifest → public/
npm run assets:trailer      # nur Trailer-SVGs
npm run prepare:assets      # nach public/assets/runtime kopieren
npm run typecheck
npm run dev                 # OPTIONEN → JETZT INTRO TESTEN
```

## Akte im Trailer (Standard 30 s)

1. **See** — Schlachtschiff, Zerstörer, U-Boot; Salven, Explosionen  
2. **Land** — Panzerkolonne, Infanterie, Artillerie  
3. **Luft** — Jägerformation, Sturzkampf-Angriff  
4. **Titel** — Empire Fog 1944  

Kurz-Modus (8 s): gleiche Akte, Zeiten mit `tScale = 8000/30000` skaliert.

## Fallback

Fehlen Texturen (z. B. Intro ohne Boot): `TrailerUnitSprite` zeichnet **prozedurale Silhouetten** (keine leeren Rechtecke).
