import Phaser from 'phaser';
import type { City, Faction, Unit } from '../core/types';
import { GameState } from '../core/GameState';
import { TurnManager } from '../core/TurnManager';
import { CAMERA, computeInitialWorldScale } from '../core/camera';
import {
  FACTION_COLORS,
  FACTION_NAME,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE,
} from '../core/constants';
import { theme } from '../core/theme';
import { UNIT_TYPES } from '../units/UnitTypes';
import { TEXTURE } from '../rendering/assetCatalog';
import { rebuildTerrainSpriteLayer } from '../rendering/TerrainSpriteLayer';
import { createUnitVisual } from '../rendering/UnitSpriteLayer';
import { getReachableTiles, moveUnitTo } from '../units/MovementSystem';
import { attack, canAttack } from '../units/CombatSystem';
import { startProduction } from '../cities/ProductionSystem';
import { SimpleAI } from '../ai/SimpleAI';
import { cityFootprint } from '../cities/cityGeometry';
import { HUD } from '../ui/HUD';
import { LogPanel } from '../ui/LogPanel';
import { ProductionPanel } from '../ui/ProductionPanel';
import { BriefingOverlay } from '../ui/BriefingOverlay';
import { CampaignDirector } from '../narrative/CampaignDirector';
import { MapEffectsLayer } from '../rendering/MapEffectsLayer';
import { rebuildCityMarkers } from '../rendering/CityMarkersLayer';
import { MissionBanner } from '../ui/MissionBanner';

interface SceneData {
  playerFaction: Faction;
}

/**
 * The main strategic gameplay scene.
 *
 * Responsibility split:
 *   - Phaser scene draws everything: terrain, fog overlay, units, cities.
 *   - All rules / state mutations go through GameState + the various
 *     systems (movement, combat, production, AI).
 *   - DOM-overlay UI (HUD, ProductionPanel, LogPanel) reads from GameState
 *     and dispatches user actions back to the scene.
 *
 * Layers (z-order):
 *   layerTerrain  -> base tile colours
 *   layerOverlay  -> grid + city/airfield/port markers
 *   layerHighlight-> movement / attack highlights
 *   layerUnits    -> units + selection ring
 *   layerFog      -> fog of war (rendered last so it covers everything)
 */
export class StrategyScene extends Phaser.Scene {
  private state!: GameState;
  private turnManager!: TurnManager;
  private ai!: SimpleAI;

  private hud!: HUD;
  private logPanel!: LogPanel;
  private prodPanel!: ProductionPanel;

  private layerTerrain!: Phaser.GameObjects.Container;
  private layerMapEffects!: Phaser.GameObjects.Container;
  private mapEffects: MapEffectsLayer | null = null;
  private screenVignette!: Phaser.GameObjects.Graphics;
  private campaign!: CampaignDirector;
  private briefing!: BriefingOverlay;
  private missionBanner!: MissionBanner;
  private briefingActive = false;
  private layerAtmosphere!: Phaser.GameObjects.TileSprite;
  private layerOverlay!: Phaser.GameObjects.Graphics;
  private layerHighlight!: Phaser.GameObjects.Container;
  private layerUnits!: Phaser.GameObjects.Container;
  private layerFogPattern!: Phaser.GameObjects.TileSprite;
  private layerFog!: Phaser.GameObjects.Graphics;
  private layerCityLabels!: Phaser.GameObjects.Container;

  private worldRoot!: Phaser.GameObjects.Container;

  private selectedUnit: Unit | null = null;
  private selectedCity: City | null = null;
  private reachable: Map<string, number> | null = null;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: Record<'W' | 'A' | 'S' | 'D' | 'ESC', Phaser.Input.Keyboard.Key>;

  // Camera/world state
  private worldWidth = MAP_WIDTH * TILE_SIZE;
  private worldHeight = MAP_HEIGHT * TILE_SIZE;

  constructor() {
    super('StrategyScene');
  }

  init(data: SceneData): void {
    this.state = new GameState(data.playerFaction);
    this.turnManager = new TurnManager(this.state);
    this.ai = new SimpleAI(this.state);
  }

  create(): void {
    document.body.classList.remove('in-menu');

    // World root container — we move/scale this for camera pan & zoom.
    this.worldRoot = this.add.container(0, 0);

    this.layerTerrain = this.add.container(0, 0);
    this.layerMapEffects = this.add.container(0, 0);
    this.layerAtmosphere = this.add.tileSprite(
      (this.worldWidth * 0.5),
      (this.worldHeight * 0.5),
      this.worldWidth,
      this.worldHeight,
      'tex-map-grain',
    );
    this.layerAtmosphere.setAlpha(0.16);
    this.layerAtmosphere.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.layerOverlay = this.add.graphics();
    this.layerHighlight = this.add.container(0, 0);
    this.layerUnits = this.add.container(0, 0);
    this.layerFogPattern = this.add.tileSprite(
      this.worldWidth * 0.5,
      this.worldHeight * 0.5,
      this.worldWidth,
      this.worldHeight,
      'tex-fog-pattern',
    );
    this.layerFogPattern.setAlpha(0.08);
    this.layerFogPattern.setBlendMode(Phaser.BlendModes.SCREEN);
    this.layerFog = this.add.graphics();
    this.layerCityLabels = this.add.container(0, 0);

    this.worldRoot.add([
      this.layerTerrain,
      this.layerMapEffects,
      this.layerAtmosphere,
      this.layerOverlay,
      this.layerCityLabels,
      this.layerHighlight,
      this.layerUnits,
      this.layerFogPattern,
      this.layerFog,
    ]);

    const initialScale = computeInitialWorldScale(this.scale.width, this.scale.height);
    this.worldRoot.setScale(initialScale);

    this.centreOnPlayerTerritory();

    // UI ------------------------------------------------------------------
    this.campaign = new CampaignDirector(this.state.playerFaction);
    this.briefing = new BriefingOverlay();
    this.missionBanner = new MissionBanner();

    this.hud = new HUD(() => this.handleEndTurn());
    this.logPanel = new LogPanel();
    this.prodPanel = new ProductionPanel((unitTypeId) => {
      if (!this.selectedCity) return;
      if (this.selectedCity.faction !== this.state.playerFaction) return;
      startProduction(this.selectedCity, unitTypeId);
      this.state.pushLog(
        'production',
        this.selectedCity.faction,
        `${this.selectedCity.name}: ${UNIT_TYPES[unitTypeId].name} in Auftrag gegeben.`,
      );
      this.prodPanel.show(this.selectedCity, this.state.playerFaction);
    });

    this.state.onLog = (e) => this.logPanel.push(e);
    // Replay any log entries that already exist (e.g. spawn message).
    for (const e of this.state.log) this.logPanel.push(e);

    // Input ---------------------------------------------------------------
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onPointerDown(pointer));
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      ESC: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _go: unknown, _dx: number, dy: number) => {
      if (this.briefingActive) return;
      const factor = dy < 0 ? CAMERA.zoomWheelFactor : 1 / CAMERA.zoomWheelFactor;
      this.zoomAtScreen(pointer.x, pointer.y, factor);
    });

    const zIn = CAMERA.zoomWheelFactor;
    const zOut = 1 / CAMERA.zoomWheelFactor;
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ADD).on('down', () => {
      const { width, height } = this.scale;
      this.zoomAtScreen(width / 2, height / 2, zIn);
    });
    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT).on('down', () => {
      const { width, height } = this.scale;
      this.zoomAtScreen(width / 2, height / 2, zOut);
    });
    this.input.keyboard!.addKey('PLUS').on('down', () => {
      const { width, height } = this.scale;
      this.zoomAtScreen(width / 2, height / 2, zIn);
    });
    this.input.keyboard!.addKey('MINUS').on('down', () => {
      const { width, height } = this.scale;
      this.zoomAtScreen(width / 2, height / 2, zOut);
    });

    this.scale.on('resize', (gs: Phaser.Structs.Size) => this.onResize(gs));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
    });

    this.screenVignette = this.add.graphics();
    this.screenVignette.setScrollFactor(0);
    this.screenVignette.setDepth(1000);
    this.drawScreenVignette();

    // Initial render ------------------------------------------------------
    this.redrawAll();
    this.updateHud();
    this.refreshMissionBanner();
    this.time.delayedCall(400, () => {
      void this.maybeShowCampaignBriefing();
    });
  }

  private refreshMissionBanner(): void {
    const m = this.campaign.currentMission(this.state.turn);
    this.missionBanner.show(m?.title ?? 'Operation Nebelfront', m?.objectives[0] ?? '');
  }

  private async maybeShowCampaignBriefing(): Promise<void> {
    const mission = this.campaign.pendingBriefing(this.state.turn);
    if (!mission) return;
    this.briefingActive = true;
    this.hud.setTurnInfo(
      this.state.turn,
      this.state.activeFaction,
      false,
    );
    await this.briefing.show(mission);
    this.campaign.markBriefingShown(mission.id);
    this.state.pushLog('system', this.state.playerFaction, mission.logLine);
    this.logPanel.push({
      turn: this.state.turn,
      faction: this.state.playerFaction,
      kind: 'system',
      message: mission.logLine,
    });
    this.briefingActive = false;
    this.updateHud();
    this.refreshMissionBanner();
  }

  private drawScreenVignette(): void {
    const g = this.screenVignette;
    const { width, height } = this.scale;
    g.clear();
    g.fillStyle(0x000000, 0.35);
    g.fillRect(0, 0, width, height * 0.08);
    g.fillRect(0, height * 0.92, width, height * 0.08);
    g.fillRect(0, 0, width * 0.06, height);
    g.fillRect(width * 0.94, 0, width * 0.06, height);
  }

  // ===========================================================================
  // Update loop — handles keyboard pan only.
  // ===========================================================================
  update(_time: number, delta: number): void {
    const speed = 0.6 * delta;
    let dx = 0;
    let dy = 0;
    if (this.cursors.left?.isDown || this.wasdKeys.A.isDown) dx += speed;
    if (this.cursors.right?.isDown || this.wasdKeys.D.isDown) dx -= speed;
    if (this.cursors.up?.isDown || this.wasdKeys.W.isDown) dy += speed;
    if (this.cursors.down?.isDown || this.wasdKeys.S.isDown) dy -= speed;
    if (dx !== 0 || dy !== 0) {
      this.worldRoot.x += dx;
      this.worldRoot.y += dy;
    }

    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.ESC)) {
      this.clearSelection();
    }
    this.layerAtmosphere.tilePositionX += delta * 0.0024;
    this.layerAtmosphere.tilePositionY += delta * 0.0012;
    this.layerFogPattern.tilePositionX -= delta * 0.0034;
    this.layerFogPattern.tilePositionY += delta * 0.0016;
    this.mapEffects?.update(_time, delta);
  }

  /** Zoom bleibt unter dem Mauszeiger (oder Bildschirmmitte bei Tastatur). */
  private zoomAtScreen(screenX: number, screenY: number, scaleFactor: number): void {
    const oldScale = this.worldRoot.scale;
    const newScale = Phaser.Math.Clamp(oldScale * scaleFactor, CAMERA.minScale, CAMERA.maxScale);
    if (Math.abs(newScale - oldScale) < 0.0005) return;

    const worldX = (screenX - this.worldRoot.x) / oldScale;
    const worldY = (screenY - this.worldRoot.y) / oldScale;
    this.worldRoot.setScale(newScale);
    this.worldRoot.x = screenX - worldX * newScale;
    this.worldRoot.y = screenY - worldY * newScale;
  }

  private centreCamera(): void {
    const { width, height } = this.scale;
    const s = this.worldRoot.scale;
    this.worldRoot.x = (width - this.worldWidth * s) / 2;
    this.worldRoot.y = (height - this.worldHeight * s) / 2 + 28;
  }

  /** Startansicht auf eigene Städte/Einheiten, nicht auf die leere Gesamtkarte. */
  private centreOnPlayerTerritory(): void {
    const pf = this.state.playerFaction;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const include = (gx: number, gy: number): void => {
      minX = Math.min(minX, gx);
      minY = Math.min(minY, gy);
      maxX = Math.max(maxX, gx);
      maxY = Math.max(maxY, gy);
    };

    for (const c of this.state.citiesOf(pf)) {
      for (const p of cityFootprint(c)) {
        include(p.x, p.y);
      }
    }
    for (const u of this.state.unitsOf(pf)) {
      include(u.x, u.y);
    }

    if (!Number.isFinite(minX)) {
      this.centreCamera();
      return;
    }

    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(this.state.tileMap.width - 1, maxX + pad);
    maxY = Math.min(this.state.tileMap.height - 1, maxY + pad);

    const cx = ((minX + maxX + 1) * 0.5) * TILE_SIZE;
    const cy = ((minY + maxY + 1) * 0.5) * TILE_SIZE;
    const { width, height } = this.scale;
    const s = this.worldRoot.scale;
    this.worldRoot.x = width * 0.5 - cx * s;
    this.worldRoot.y = height * 0.52 - cy * s;
  }

  private onResize(gs: Phaser.Structs.Size): void {
    this.drawScreenVignette();
    if (this.state.phase === 'game_over') return;
    const next = computeInitialWorldScale(gs.width, gs.height);
    if (this.worldRoot.scale < next * 0.85) {
      this.worldRoot.setScale(next);
      this.centreCamera();
    }
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================
  private redrawAll(): void {
    this.drawTerrain();
    this.drawOverlay();
    this.drawCityLabels();
    this.drawHighlights();
    this.drawUnits();
    this.drawFog();
  }

  private drawTerrain(): void {
    rebuildTerrainSpriteLayer(
      this,
      this.layerTerrain,
      this.state.tileMap,
      this.state.cities,
      TILE_SIZE,
    );
    this.mapEffects?.destroy();
    this.layerMapEffects.removeAll(true);
    this.mapEffects = new MapEffectsLayer(
      this,
      this.layerMapEffects,
      this.state.tileMap,
      this.state.cities,
      TILE_SIZE,
    );
  }

  private drawCityLabels(): void {
    const pf = this.state.playerFaction;
    rebuildCityMarkers(
      this,
      this.layerCityLabels,
      this.state.cities,
      pf,
      (gx, gy) => this.state.fog.get(pf, gx, gy) === 'visible',
      TILE_SIZE,
    );
  }

  private drawOverlay(): void {
    const g = this.layerOverlay;
    g.clear();

    g.lineStyle(1, theme.map.gridLine, theme.map.gridAlpha);
    for (let x = 0; x <= this.state.tileMap.width; x++) {
      g.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, this.state.tileMap.height * TILE_SIZE);
    }
    for (let y = 0; y <= this.state.tileMap.height; y++) {
      g.lineBetween(0, y * TILE_SIZE, this.state.tileMap.width * TILE_SIZE, y * TILE_SIZE);
    }

    // Settlement outlines (multi-tile footprint).
    for (const c of this.state.cities) {
      const colour = FACTION_COLORS[c.faction];
      const x0 = c.x * TILE_SIZE;
      const y0 = c.y * TILE_SIZE;
      const bw = c.tileWidth * TILE_SIZE;
      const bh = c.tileHeight * TILE_SIZE;
      g.lineStyle(c.settlementKind === 'capital' ? 2 : 1, colour, 0.55);
      g.strokeRect(x0 + 1, y0 + 1, bw - 2, bh - 2);
      g.fillStyle(0x000000, 0.12);
      g.fillRect(x0 + 2, y0 + 2, bw - 4, bh - 4);

      g.fillStyle(theme.menu.gold, 0.88);
      for (let ty = c.y; ty < c.y + c.tileHeight; ty++) {
        for (let tx = c.x; tx < c.x + c.tileWidth; tx++) {
          const tile = this.state.tileMap.get(tx, ty)!;
          const cx = tx * TILE_SIZE + TILE_SIZE / 2;
          const cy = ty * TILE_SIZE + TILE_SIZE / 2;
          if (tile.terrain === 'port') {
            g.fillTriangle(cx, cy - 3, cx - 4, cy + 4, cx + 4, cy + 4);
          } else if (tile.terrain === 'airfield') {
            g.fillRect(cx - 5, cy - 1, 10, 2);
            g.fillRect(cx - 1, cy - 4, 2, 8);
          }
        }
      }
    }
  }

  private drawHighlights(): void {
    this.layerHighlight.removeAll(true);
    const g = this.add.graphics();

    if (this.selectedUnit) {
      const u = this.selectedUnit;
      g.lineStyle(3, theme.map.selection, 0.95);
      g.strokeRoundedRect(
        u.x * TILE_SIZE + 1,
        u.y * TILE_SIZE + 1,
        TILE_SIZE - 2,
        TILE_SIZE - 2,
        4,
      );
    }

    if (this.reachable && this.textures.exists(TEXTURE.uiMoveHighlight)) {
      for (const key of this.reachable.keys()) {
        const [xs, ys] = key.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        if (x === this.selectedUnit?.x && y === this.selectedUnit?.y) continue;
        const hx = x * TILE_SIZE + TILE_SIZE / 2;
        const hy = y * TILE_SIZE + TILE_SIZE / 2;
        const hl = this.add.image(hx, hy, TEXTURE.uiMoveHighlight);
        hl.setDisplaySize(TILE_SIZE, TILE_SIZE);
        hl.setAlpha(0.85);
        hl.setBlendMode(Phaser.BlendModes.ADD);
        this.layerHighlight.add(hl);
      }
    }

    if (this.selectedUnit && !this.selectedUnit.hasAttacked) {
      const u = this.selectedUnit;
      g.lineStyle(2, theme.map.attackRange, 0.92);
      for (const enemy of this.state.units) {
        if (enemy.faction === u.faction) continue;
        if (enemy.hp <= 0) continue;
        if (this.state.fog.get(this.state.playerFaction, enemy.x, enemy.y) !== 'visible') continue;
        if (canAttack(this.state, u, enemy)) {
          g.strokeRoundedRect(
            enemy.x * TILE_SIZE + 1,
            enemy.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
            4,
          );
        }
      }
    }

    if (this.selectedCity) {
      const sc = this.selectedCity;
      g.lineStyle(2, theme.map.selection, 0.78);
      g.strokeRect(
        sc.x * TILE_SIZE - 2,
        sc.y * TILE_SIZE - 2,
        sc.tileWidth * TILE_SIZE + 4,
        sc.tileHeight * TILE_SIZE + 4,
      );
    }

    this.layerHighlight.add(g);
  }

  private drawUnits(): void {
    this.layerUnits.removeAll(true);

    for (const u of this.state.units) {
      if (u.hp <= 0) continue;
      // Hide enemy units that are not currently visible to the player.
      if (
        u.faction !== this.state.playerFaction &&
        this.state.fog.get(this.state.playerFaction, u.x, u.y) !== 'visible'
      ) {
        continue;
      }
      const colour = FACTION_COLORS[u.faction];
      const visual = createUnitVisual(this, u, TILE_SIZE, colour);
      this.layerUnits.add(visual.root);
    }
  }

  private drawFog(): void {
    const g = this.layerFog;
    g.clear();
    const f = this.state.playerFaction;
    for (let y = 0; y < this.state.tileMap.height; y++) {
      for (let x = 0; x < this.state.tileMap.width; x++) {
        const s = this.state.fog.get(f, x, y);
        if (s === 'visible') continue;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        if (s === 'unknown') {
          g.fillStyle(theme.fog.unknown.color, theme.fog.unknown.alpha);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          g.fillStyle(0xffffff, 0.04);
          g.fillRect(px + 1, py + 1, TILE_SIZE - 2, 2);
        } else if (s === 'explored') {
          g.fillStyle(theme.fog.explored.color, theme.fog.explored.alpha);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          g.fillStyle(0xffffff, 0.025);
          g.fillRect(px + 2, py + 2, TILE_SIZE - 4, 1);
        }
      }
    }
  }

  // ===========================================================================
  // Input handling
  // ===========================================================================
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.briefingActive) return;
    if (this.state.phase !== 'player_turn') return;
    // Convert screen -> world coordinates.
    const wx = (pointer.x - this.worldRoot.x) / this.worldRoot.scale;
    const wy = (pointer.y - this.worldRoot.y) / this.worldRoot.scale;
    const tx = Math.floor(wx / TILE_SIZE);
    const ty = Math.floor(wy / TILE_SIZE);
    if (!this.state.tileMap.inBounds(tx, ty)) return;
    this.handleClickTile(tx, ty);
  }

  private handleClickTile(x: number, y: number): void {
    const player = this.state.playerFaction;
    const clickedUnit = this.state.unitAt(x, y);
    const clickedCity = this.state.cityAt(x, y);

    // Click on enemy unit while own unit selected -> attack
    if (
      this.selectedUnit &&
      clickedUnit &&
      clickedUnit.faction !== player &&
      canAttack(this.state, this.selectedUnit, clickedUnit)
    ) {
      attack(this.state, this.selectedUnit, clickedUnit);
      // Refresh fog because units may have died.
      this.state.fog.recompute('allies', this.state.units, this.state.cities, this.state.tileMap);
      this.state.fog.recompute('axis', this.state.units, this.state.cities, this.state.tileMap);
      this.refreshSelection();
      this.updateHud();
      this.checkVictory();
      this.redrawAll();
      return;
    }

    // Click on a movement-eligible tile -> move
    if (
      this.selectedUnit &&
      this.reachable &&
      this.reachable.has(`${x},${y}`) &&
      !(this.selectedUnit.x === x && this.selectedUnit.y === y)
    ) {
      moveUnitTo(this.state, this.selectedUnit, x, y);
      this.state.fog.recompute('allies', this.state.units, this.state.cities, this.state.tileMap);
      this.state.fog.recompute('axis', this.state.units, this.state.cities, this.state.tileMap);
      this.reachable = getReachableTiles(this.state, this.selectedUnit).costs;
      this.refreshSelection();
      this.checkVictory();
      this.redrawAll();
      return;
    }

    // Click on own unit -> select
    if (clickedUnit && clickedUnit.faction === player) {
      this.selectedUnit = clickedUnit;
      this.selectedCity = null;
      this.reachable = getReachableTiles(this.state, clickedUnit).costs;
      this.hud.showUnit(clickedUnit);
      this.prodPanel.clear();
      this.redrawAll();
      return;
    }

    // Click on city
    if (clickedCity) {
      this.selectedCity = clickedCity;
      // Don't deselect a friendly unit on top of the same tile if user just wants to inspect.
      if (!clickedUnit) this.selectedUnit = null;
      this.reachable = this.selectedUnit ? getReachableTiles(this.state, this.selectedUnit).costs : null;
      this.prodPanel.show(clickedCity, this.state.playerFaction);
      if (!this.selectedUnit) this.hud.showUnit(null);
      this.redrawAll();
      return;
    }

    // Click on empty tile -> deselect
    this.clearSelection();
  }

  private clearSelection(): void {
    this.selectedUnit = null;
    this.selectedCity = null;
    this.reachable = null;
    this.hud.showUnit(null);
    this.prodPanel.clear();
    this.redrawAll();
  }

  private refreshSelection(): void {
    if (this.selectedUnit && this.selectedUnit.hp > 0) {
      this.reachable = getReachableTiles(this.state, this.selectedUnit).costs;
      this.hud.showUnit(this.selectedUnit);
    } else {
      this.selectedUnit = null;
      this.reachable = null;
      this.hud.showUnit(null);
    }
    if (this.selectedCity) this.prodPanel.show(this.selectedCity, this.state.playerFaction);
  }

  // ===========================================================================
  // Turn handling
  // ===========================================================================
  private handleEndTurn(): void {
    if (this.briefingActive) return;
    if (this.state.phase !== 'player_turn') return;
    this.clearSelection();
    const nextPhase = this.turnManager.endTurn();
    this.updateHud();
    this.redrawAll();

    // After a small visual delay, run the AI turn.
    if (nextPhase === 'ai_turn') {
      this.time.delayedCall(350, () => this.runAiTurn());
    }
  }

  private runAiTurn(): void {
    this.ai.takeTurn();
    this.state.fog.recompute('allies', this.state.units, this.state.cities, this.state.tileMap);
    this.state.fog.recompute('axis', this.state.units, this.state.cities, this.state.tileMap);
    this.checkVictory();
    if (this.state.phase === 'game_over') {
      this.redrawAll();
      return;
    }
    // End the AI's turn and hand control back to the player.
    this.turnManager.endTurn();
    this.updateHud();
    this.redrawAll();
    this.refreshMissionBanner();
    const hint = this.campaign.evaluateMissionProgress(this.state);
    if (hint) this.state.pushLog('system', this.state.playerFaction, hint);
    void this.maybeShowCampaignBriefing();
  }

  private updateHud(): void {
    this.hud.setTurnInfo(
      this.state.turn,
      this.state.activeFaction,
      this.state.activeFaction === this.state.playerFaction && this.state.phase === 'player_turn',
    );
  }

  private checkVictory(): void {
    const winner = this.state.evaluateVictory();
    if (!winner) return;
    this.state.phase = 'game_over';
    const msg =
      winner === this.state.playerFaction
        ? `Sieg! ${FACTION_NAME[winner]} kontrolliert das Schlachtfeld.`
        : `Niederlage. ${FACTION_NAME[winner]} hat die Oberhand gewonnen.`;
    this.state.pushLog('system', winner, msg);
    this.showGameOver(winner);
  }

  private showGameOver(winner: Faction): void {
    const { width, height } = this.scale;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);

    const isWin = winner === this.state.playerFaction;
    const title = this.add.text(width / 2, height / 2 - 20, isWin ? 'SIEG' : 'NIEDERLAGE', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '72px',
      color: isWin ? '#e6bf6a' : '#c14040',
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000', 12, true, true);

    const sub = this.add.text(width / 2, height / 2 + 60, `Klicke, um ins Hauptmenü zurückzukehren.`, {
      fontFamily: 'Source Sans Pro, sans-serif',
      fontSize: '16px',
      color: '#d8e1ec',
    });
    sub.setOrigin(0.5);

    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    overlay.on('pointerdown', () => {
      document.body.classList.add('in-menu');
      this.scene.start('BootScene');
    });
  }
}
