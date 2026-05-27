# Empire Fog 1944 — Projektkontext für Claude Code

## Stack
- TypeScript (strict), Vite, Phaser 3, DOM-Overlay für UI
- Spielfläche: prozedural via Phaser.Graphics (`src/game/rendering/TerrainRenderer.ts`, `UnitRenderer.ts`); zentrale Farben in `src/game/core/theme.ts`, DOM via `src/game/rendering/UITheme.ts`.
- Stilreferenzen (nur Inspiration, keine Runtime-Bitmaps im Spiel): `src/assets/reference/*.png` — siehe `EmpireFog1944_AssetPack_for_Claude/README.md`.

## Inhaltsregeln (HART)
- WW2-Setting, aber nur neutrale, abstrakte Fraktionssymbole.
- KEINE Hakenkreuze, SS-Runen, NS-Propaganda, keine glorifizierende Sprache.
- Alliierte = blauer Stern. Achsenmächte = neutrales geometrisches Zeichen.
- Stadtnamen sind neutrale europäische Städte.

## Architektur (kurz)
- src/game/core/    Spielzustand, Rundensteuerung, Konstanten, Typen
- src/game/map/     Karte, Terrain, Fog of War, prozedurale Generierung
- src/game/units/   Einheitentypen, Bewegung (Dijkstra), Kampf
- src/game/cities/  Städte, Produktionssystem
- src/game/ai/      KI (aktuell greedy)
- src/game/scenes/  Boot/Menu/Strategy
- src/game/ui/      DOM-HUD, Log, Produktionspanel

## Konventionen
- Strict TypeScript. Keine `any` einführen.
- Spielzustand ausschließlich über GameState mutieren.
- Logging über GameState.pushLog (kein console.log in Spielcode).
- Bewegung respektiert immer terrainabhängige Kosten je Domain.
- Sichtbarkeit/Fog nach jeder Aktion bei Bedarf neu berechnen.

## Aktueller Stand (v0.1)
- Spielbar: Menü → Fraktionswahl → Karte → Fog → Auswählen/Bewegen/Angreifen
  → Stadteinnahme → Produktion → KI-Zug → Sieg/Niederlage.

## Offen (Roadmap, priorisiert)
1. Flugzeugträger-Stationierung (Jäger/Dive Bomber an Bord)
2. KI-Strategieebene (Bedrohungs-Score, koordinierte Angriffe)
3. Speichern/Laden (LocalStorage zuerst)
4. Forschungsbaum
5. Ressourcen (Treibstoff/Stahl/Mannstärke)
6. Diplomatie
7. Echte Europa-Karte / Szenarien
8. Transport-Logik (Flugzeug/Schiff lädt Bodeneinheit)
9. Optional: Multiplayer (Hot-Seat zuerst)

## Workflow-Regeln für Claude Code
- Vor größeren Änderungen kurz Plan skizzieren.
- Pro Feature ein Branch, kleine Commits.
- Nach Änderungen: `npm run typecheck` muss grün sein.
- Wenn Phaser-API unklar: nicht raten, in offizieller Doku verifizieren.
