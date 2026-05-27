# Style Guide — Empire Fog 1944 Assets

## Visuelle Sprache

- **Ära:** WW2-inspiriert, abstrakt-taktisch (Karten-/Korps-Symbole, keine Fotorealistik).
- **Stimmung:** Marineblau, Stahlgrau, gedämpftes Oliv, Goldakzente.
- **Lesbarkeit:** Symbole müssen bei 32–40 px Bildschirmgröße pro Kachel erkennbar sein.

## Farben

| Rolle | Hex | Verwendung |
|-------|-----|------------|
| Token-Hintergrund | `#141a22` | Einheiten-Badge |
| Symbol / Textur | `#f0e6d2` | Innensymbol |
| Gold-Rahmen | `#c9a44a` | UI, Auswahl |
| Land | `#9fcf92` | Soldaten, Panzer |
| Luft | `#9ec7ff` | Flugzeuge |
| See | `#7fc9d6` | Oberflächenschiffe |
| Untersee | `#5f7e9f` | U-Boote |
| Alliierte | `#3a78c8` | Fraktionsband / Emblem |
| Achsen | `#6a7280` | neutrales Abzeichen |

## Einheiten-Token (64×64)

1. Abgerundetes Rechteck, dunkler Fill.
2. Goldener oder domänenfarbiger Rand.
3. Oben: dezentes Fraktions-/Domänenband (22 % Opacity).
4. Mitte: taktisches Symbol (keine Porträts).

## Terrain / Städte (128×128)

- Vollflächige Grundfarbe pro Terrain-Typ.
- 2–4 einfache Formen für Struktur (Bäume, Wellen, Gebirgssilhouette).
- Städte: Hauscluster + Dachfarbe `#a84838`, ggf. Mauern bei Hauptstadt.

## Verboten

- Hakenkreuz, SS-Runen, NS-Propaganda
- Glorifizierende Heldenporträts
- Urheberrechtlich geschützte Fremdgrafiken

## Nächste Ausbaustufe (optional)

- Varianten pro Fraktion (nur Randfarbe, Symbol bleibt neutral)
- 2× Auflösung (128×128 Einheiten) für 4K-UI
- Animations-Spritesheets (Rauch, Treffer)
