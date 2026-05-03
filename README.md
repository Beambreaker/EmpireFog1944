# Empire Fog 1944

Rundenbasierter 2D-Strategie-Prototyp im Stil klassischer Empire-Deluxe-Spiele,
historisch inspiriert vom Zweiten Weltkrieg, aber bewusst neutral dargestellt.

> Inhaltsrahmen: Es werden ausschliesslich abstrakte, neutrale Fraktionssymbole
> verwendet (Alliierte = blauer Stern, Achsenmaechte = neutrales geometrisches
> Zeichen). Keine Hakenkreuze, keine SS-Runen, keine reale Propaganda, keine
> verbotenen Symbole, keine Glorifizierung.

## Technik-Stack

- TypeScript
- Vite (Dev-Server und Build)
- Phaser 3 (Rendering, Input, Scenes)
- DOM-Overlay (HUD, Log, Produktionsmenue)
- Keine externen Bildassets - alle Grafiken werden zur Laufzeit prozedural
  durch Phaser.Graphics und SVG/CSS erzeugt.

## Installation

Voraussetzung: Node.js 18+ und npm.

```bash
npm install
```

## Start (Entwicklung)

```bash
npm run dev
```

Der Vite-Dev-Server oeffnet automatisch http://localhost:5173.

## Build (Produktion)

```bash
npm run build
npm run preview
```

`npm run typecheck` prueft nur die Typen, ohne zu builden.

## Steuerung

- Linksklick auf eigene Einheit ........ auswaehlen, Reichweite anzeigen
- Linksklick auf gueltiges Zielfeld .... Einheit dorthin bewegen
- Linksklick auf Gegner in Reichweite .. angreifen
- Linksklick auf Stadt ................. Stadt-/Produktionsmenue oeffnen
- ESC .................................. Auswahl aufheben
- WASD oder Pfeiltasten ................ Karte verschieben
- Mausrad .............................. zoomen (0.5x bis 2.0x)
- Button "Zug beenden" ................. Spielerzug abschliessen, KI ist dran

## Was bereits funktioniert (Version 0.1)

- Startmenue mit Fraktionsauswahl (Alliierte / Achsenmaechte)
- Prozedurale Karte mit Seed (48 x 32, mehrere Inseln/Kontinente)
- Terrain: Wasser, Ebene, Wald, Gebirge, Stadt, Hafen, Flugplatz
- Fog of War mit drei Zustaenden (unbekannt, erkundet, sichtbar)
- 11 Einheitentypen aus den Domaenen Land, Luft, See, Untersee
  (Infanterie, Spezialkraefte, Panzer, Flak/Radar, Jaeger, Dive Bomber,
   Transportflugzeug, Zerstoerer, U-Boot, Flugzeugtraeger, Schlachtschiff)
- Bewegungspunkte, Sichtweiten, Angriff/Verteidigung, HP, terrainabhaengige
  Bewegungskosten, Verteidigungsboni durch Terrain
- Kampfsystem mit kleinem Zufallsfaktor, Bonus-Effekten (Flak vs. Luft,
  Jaeger vs. Bomber, Zerstoerer vs. U-Boot, Dive Bomber vs. Panzer/Stadt)
- Stadtproduktion mit Fortschrittsanzeige, Fabrik/Hafen/Flugplatz-Boni
  und automatischer Spawn-Platzierung der fertigen Einheit
- Stadt-Einnahme durch Landeinheiten, die Staedte einnehmen koennen
- Einfache aber funktionierende KI: produziert, bewegt, kaempft, nimmt ein
- Premium-UI in dunklem Marineblau/Stahlgrau mit Goldakzenten
  (oben Rundenanzeige, links Einheitenpanel, rechts Produktionspanel,
   unten Kampf-/Ereignis-Log)
- Sieg-/Niederlage-Bildschirm bei Kontrolle aller Staedte einer Fraktion

## Bekannte Grenzen

- Flugzeugtraeger besitzt noch kein Stationierungs-System fuer Flugzeuge
  (UI-Hinweis: "Carrier-System folgt").
- Transportflugzeug existiert als Einheit, aber ohne Transportlogik fuer
  Bodentruppen.
- Kein Speichern/Laden, keine Forschung, keine Diplomatie, keine Ressourcen.
- KI ist absichtlich einfach gehalten (greedy) und plant nicht langfristig.
- Karte ist generisch prozedural, noch keine echte Europa-/Weltkarte.
- Build wurde im Sandbox-Build-Schritt nicht verifiziert (Netzwerk dort
  deaktiviert). Falls beim ersten `npm install` etwas haengen sollte,
  bitte Node-Version pruefen (>= 18) und erneut starten.

## Naechste Ausbaustufen

1. Echte Flugzeugtraeger-Stationierung (Jaeger/Dive Bomber an Bord, Start/Landung)
2. Bessere KI (Bedrohungsbewertung, Aufklaerung, koordinierte Angriffe,
   Frontbildung, gezielte Stadt-Strategie)
3. Forschungsbaum (Einheiten-Upgrades, Stadt-Upgrades)
4. Diplomatie (Allianzen, Nichtangriffspakte, Kriegserklaerungen)
5. Ressourcensystem (Treibstoff, Stahl, Mannstaerke)
6. Speichern und Laden des Spielstands (LocalStorage / Datei)
7. Echte Kampagnenkarte Europa und Weltkarte mit Szenarien
8. Transportlogik (Flugzeuge laden Infanterie, Schiffe laden Landeinheiten)
9. Optional spaeter: Multiplayer (Hot-Seat zuerst, dann Netzwerk)

## Projektstruktur

```
EmpireFog1944/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  README.md
  src/
    main.ts
    styles.css
    game/
      GameConfig.ts
      scenes/        BootScene, MenuScene, StrategyScene
      core/          types, constants, GameState, TurnManager
      map/           MapGenerator, TileMap, Terrain, FogOfWar
      units/         UnitTypes, Unit, UnitFactory, MovementSystem, CombatSystem
      cities/        City, ProductionSystem
      ai/            SimpleAI
      ui/            HUD, LogPanel, ProductionPanel
      utils/         GridMath, SeededRandom
```
