import Phaser from 'phaser';
import type { City, Faction, Unit } from '../core/types';
import { GameState } from '../core/GameState';
import { TurnManager } from '../core/TurnManager';
import {
  FACTION_COLORS,
  FACTION_NAME,
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE,
} from '../core/constants';
import { TERRAIN_STYLES } from '../map/Terrain';
import { UNIT_TYPES } from '../units/UnitTypes';
import { getReachableTiles, moveUnitTo } from '../units/MovementSystem';
import { attack, canAttack } from '../units/CombatSystem';
import { startProduction } from '../cities/ProductionSystem';
import { SimpleAI } from '../ai/SimpleAI';
import { HUD } from '../ui/HUD';
import { LogPanel } from '../ui/LogPanel';
import { ProductionPanel } from '../ui/ProductionPanel';

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

  private layerTerrain!: Phaser.GameObjects.Graphics;
  private layerOverlay!: Phaser.GameObjects.Graphics;
  private layerHighlight!: Phaser.GameObjects.Graphics;
  private layerUnits!: Phaser.GameObjects.Container;
  private layerFog!: Phaser.GameObjects.Graphics;

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

    this.layerTerrain = this.add.graphics();
    this.layerOverlay = this.add.graphics();
    this.layerHighlight = this.add.graphics();
    this.layerUnits = this.add.container(0, 0);
    this.layerFog = this.add.graphics();

    this.worldRoot.add([
      this.layerTerrain,
      this.layerOverlay,
      this.layerHighlight,
      this.layerUnits,
      this.layerFog,
    ]);

    // Centre the world initially.
    this.centreCamera();

    // UI ------------------------------------------------------------------
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
    this.input.on('wheel', (_p: unknown, _go: unknown, _dx: number, dy: number) => {
      const dir = dy > 0 ? -0.1 : 0.1;
      this.zoomBy(dir);
    });

    this.scale.on('resize', (gs: Phaser.Structs.Size) => this.onResize(gs));

    // Initial render ------------------------------------------------------
    this.redrawAll();
    this.updateHud();
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
  }

  private zoomBy(delta: number): void {
    const newScale = Phaser.Math.Clamp(this.worldRoot.scale + delta, 0.5, 2.0);
    this.worldRoot.setScale(newScale);
  }

  private centreCamera(): void {
    const { width, height } = this.scale;
    this.worldRoot.x = (width - this.worldWidth) / 2;
    this.worldRoot.y = (height - this.worldHeight) / 2 + 28; // shifted slightly to clear the top HUD
  }

  private onResize(_gs: Phaser.Structs.Size): void {
    // Don't re-centre on every resize — just keep the camera in place.
    // Phaser's RESIZE scale mode handles canvas dimensions.
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================
  private redrawAll(): void {
    this.drawTerrain();
    this.drawOverlay();
    this.drawHighlights();
    this.drawUnits();
    this.drawFog();
  }

  private drawTerrain(): void {
    const g = this.layerTerrain;
    g.clear();
    for (let y = 0; y < this.state.tileMap.height; y++) {
      for (let x = 0; x < this.state.tileMap.width; x++) {
        const tile = this.state.tileMap.get(x, y)!;
        const style = TERRAIN_STYLES[tile.terrain];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        g.fillStyle(style.base, 1);
        g.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Subtle terrain detail
        if (tile.terrain === 'forest') {
          g.fillStyle(style.accent, 0.55);
          g.fillTriangle(
            px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.18,
            px + TILE_SIZE * 0.18, py + TILE_SIZE * 0.78,
            px + TILE_SIZE * 0.82, py + TILE_SIZE * 0.78,
          );
        } else if (tile.terrain === 'mountain') {
          g.fillStyle(style.accent, 0.7);
          g.fillTriangle(
            px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.15,
            px + TILE_SIZE * 0.05, py + TILE_SIZE * 0.92,
            px + TILE_SIZE * 0.95, py + TILE_SIZE * 0.92,
          );
          g.fillStyle(0xffffff, 0.25);
          g.fillTriangle(
            px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.15,
            px + TILE_SIZE * 0.38, py + TILE_SIZE * 0.42,
            px + TILE_SIZE * 0.62, py + TILE_SIZE * 0.42,
          );
        } else if (tile.terrain === 'water') {
          g.fillStyle(style.accent, 0.18);
          g.fillRect(px + 2, py + TILE_SIZE * 0.55, TILE_SIZE - 4, 2);
          g.fillRect(px + 6, py + TILE_SIZE * 0.75, TILE_SIZE - 12, 1);
        }
      }
    }
  }

  private drawOverlay(): void {
    const g = this.layerOverlay;
    g.clear();

    // Light grid lines.
    g.lineStyle(1, 0x000000, 0.16);
    for (let x = 0; x <= this.state.tileMap.width; x++) {
      g.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, this.state.tileMap.height * TILE_SIZE);
    }
    for (let y = 0; y <= this.state.tileMap.height; y++) {
      g.lineBetween(0, y * TILE_SIZE, this.state.tileMap.width * TILE_SIZE, y * TILE_SIZE);
    }

    // City badges.
    for (const c of this.state.cities) {
      const px = c.x * TILE_SIZE + TILE_SIZE / 2;
      const py = c.y * TILE_SIZE + TILE_SIZE / 2;

      // Faction-tinted ring.
      const colour = FACTION_COLORS[c.faction];
      g.lineStyle(2, colour, 1);
      g.strokeCircle(px, py, TILE_SIZE * 0.42);

      // Centre fill — slightly lighter than terrain.
      g.fillStyle(0x000000, 0.35);
      g.fillCircle(px, py, TILE_SIZE * 0.36);

      // Tile-type indicator
      g.fillStyle(0xc9a44a, 0.95);
      const tile = this.state.tileMap.get(c.x, c.y)!;
      if (tile.terrain === 'port') {
        // Anchor-like icon — small triangle.
        g.fillTriangle(
          px, py - 4,
          px - 5, py + 4,
          px + 5, py + 4,
        );
      } else if (tile.terrain === 'airfield') {
        // Plane-cross icon.
        g.fillRect(px - 6, py - 1, 12, 2);
        g.fillRect(px - 1, py - 5, 2, 10);
      } else {
        // Generic city pip.
        g.fillRect(px - 3, py - 3, 6, 6);
      }
    }
  }

  private drawHighlights(): void {
    const g = this.layerHighlight;
    g.clear();

    if (this.selectedUnit) {
      const u = this.selectedUnit;
      // Selection ring around unit.
      g.lineStyle(2, 0xc9a44a, 0.95);
      g.strokeRect(u.x * TILE_SIZE + 1, u.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }

    if (this.reachable) {
      g.fillStyle(0xc9a44a, 0.18);
      for (const key of this.reachable.keys()) {
        const [xs, ys] = key.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        if (x === this.selectedUnit?.x && y === this.selectedUnit?.y) continue;
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      // Outline reachable area.
      g.lineStyle(1, 0xc9a44a, 0.4);
      for (const key of this.reachable.keys()) {
        const [xs, ys] = key.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        g.strokeRect(x * TILE_SIZE + 0.5, y * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      }
    }

    // Highlight attackable enemies.
    if (this.selectedUnit && !this.selectedUnit.hasAttacked) {
      const u = this.selectedUnit;
      g.lineStyle(2, 0xd96565, 0.9);
      for (const enemy of this.state.units) {
        if (enemy.faction === u.faction) continue;
        if (enemy.hp <= 0) continue;
        if (this.state.fog.get(this.state.playerFaction, enemy.x, enemy.y) !== 'visible') continue;
        if (canAttack(this.state, u, enemy)) {
          g.strokeRect(
            enemy.x * TILE_SIZE + 1,
            enemy.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
          );
        }
      }
    }

    // Highlight selected city.
    if (this.selectedCity) {
      g.lineStyle(2, 0xc9a44a, 0.6);
      g.strokeRect(
        this.selectedCity.x * TILE_SIZE - 1,
        this.selectedCity.y * TILE_SIZE - 1,
        TILE_SIZE + 2,
        TILE_SIZE + 2,
      );
    }
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
      const def = UNIT_TYPES[u.typeId];
      const colour = FACTION_COLORS[u.faction];

      const cx = u.x * TILE_SIZE + TILE_SIZE / 2;
      const cy = u.y * TILE_SIZE + TILE_SIZE / 2;

      // Background pill.
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.45);
      g.fillRoundedRect(
        u.x * TILE_SIZE + 3,
        u.y * TILE_SIZE + 3,
        TILE_SIZE - 6,
        TILE_SIZE - 6,
        4,
      );
      g.lineStyle(2, colour, 1);
      g.strokeRoundedRect(
        u.x * TILE_SIZE + 3,
        u.y * TILE_SIZE + 3,
        TILE_SIZE - 6,
        TILE_SIZE - 6,
        4,
      );
      this.layerUnits.add(g);

      // Glyph.
      const txt = this.add.text(cx, cy - 1, def.symbol, {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '14px',
        color: '#f4e6c0',
      });
      txt.setOrigin(0.5);
      this.layerUnits.add(txt);

      // HP bar at top of cell when damaged.
      if (u.hp < def.hpMax) {
        const hpPct = Math.max(0, u.hp / def.hpMax);
        const barW = TILE_SIZE - 8;
        const bar = this.add.graphics();
        bar.fillStyle(0x000000, 0.65);
        bar.fillRect(u.x * TILE_SIZE + 4, u.y * TILE_SIZE + 1, barW, 3);
        bar.fillStyle(hpPct > 0.6 ? 0x4a9a5e : hpPct > 0.3 ? 0xc9a44a : 0xc14040, 1);
        bar.fillRect(u.x * TILE_SIZE + 4, u.y * TILE_SIZE + 1, barW * hpPct, 3);
        this.layerUnits.add(bar);
      }

      // Movement-spent indicator (dim slightly when out of moves).
      if (u.faction === this.state.playerFaction && u.movementLeft <= 0 && u.hasAttacked) {
        const dim = this.add.graphics();
        dim.fillStyle(0x000000, 0.35);
        dim.fillRect(u.x * TILE_SIZE, u.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.layerUnits.add(dim);
      }
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
          g.fillStyle(0x000000, 0.95);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        } else if (s === 'explored') {
          g.fillStyle(0x000000, 0.55);
          g.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  // ===========================================================================
  // Input handling
  // ===========================================================================
  private onPointerDown(pointer: Phaser.Input.Pointer): void {
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
    if (this.state.phase !== 'player_turn') return;
    this.clearSelection();
    this.turnManager.endTurn();
    this.updateHud();
    this.redrawAll();

    // After a small visual delay, run the AI turn.
    if (this.state.phase === 'ai_turn') {
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
      this.scene.start('MenuScene');
    });
  }
}
