# Empire Fog 1944 – Asset Pack für Claude / Cursor

Dieses ZIP-Paket enthält grafische Referenzbilder für den Prototyp **Empire Fog 1944**.

Ziel:
Claude / Claude Code soll diese Bilder nicht einfach nur irgendwo ablegen, sondern daraus einen klaren grafischen Stil für den Spielprototyp ableiten.

## Enthaltene Dateien

### assets/terrain_and_structures_reference.png
Referenz für:
- Weltkarte
- Meer / Küsten / Land-Übergänge
- Grasland, Wald, Gebirge, Straßen
- Städte
- befestigte Städte
- Häfen
- Flugplätze
- Radarstationen
- Fabriken / Industriestädte
- Fog-of-War-Darstellung

### assets/units_and_corps_symbols_reference.png
Referenz für:
- Infanterie
- Spezialkräfte
- Panzer
- Flak / Radar
- Jäger
- Dive Bomber
- Transportflugzeug
- Zerstörer
- U-Boot
- Flugzeugträger
- Schlachtschiff
- vereinfachte taktische Kartensymbole
- Fraktionsabzeichen
- Bewegungsdomänen: Land, Luft, See, Untersee

### assets/main_menu_faction_selection_reference.png
Referenz für:
- Startmenü
- Fraktionsauswahl
- britischer General als Alliierte-Seite
- deutscher General als Achsenmächte-Seite
- dunkles Marineblau / Stahlgrau / Gold
- strategische Kartenoptik im Hintergrund
- Premium-Pixel-Art-Stimmung

## Wichtige rechtliche und stilistische Regeln

- Keine Hakenkreuze
- Keine SS-Runen
- Keine NS-Parolen
- Keine Propaganda
- Keine Glorifizierung
- Die Darstellung bleibt neutral-historisch und spielmechanisch.
- Für die Achsenmächte neutrale militärische Symbole verwenden, zum Beispiel ein abstraktes graues Balkenkreuz-ähnliches Strategiesymbol, aber keine verbotenen Zeichen.

## Aufgabe für Claude / Cursor

Claude soll aus diesen Referenzen folgende Dinge in das Spielprojekt übernehmen:

1. Eine konsistente visuelle Sprache für den Prototyp erstellen.
2. Die UI-Farben daran ausrichten:
   - Dunkles Marineblau
   - Stahlgrau
   - gedämpftes Olivgrün
   - Goldakzente
   - helle Pixel-Schrift
3. Die Map-Tiles im Code so darstellen, dass sie zumindest stilistisch an die Referenz erinnern.
4. Die Einheiten zuerst als einfache Pixel-/Canvas-/SVG-ähnliche Symbole umsetzen.
5. Das Startmenü im Stil der Menüreferenz bauen.
6. Keine externen Assets aus dem Internet laden.
7. Keine urheberrechtlich geschützten Grafiken verwenden.
8. Diese Bilder nur als Stil- und Layoutreferenz nutzen.

## Empfohlener nächster Schritt

Dieses ZIP in den Projektordner kopieren, zum Beispiel:

`%USERPROFILE%\Desktop\EmpireFog1944\reference_assets`

Danach Claude / Claude Code mit dem beiliegenden Prompt aus `docs/CLAUDE_CURSOR_ASSET_PROMPT.txt` beauftragen.
