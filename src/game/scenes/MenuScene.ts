import Phaser from 'phaser';
import type { Faction } from '../core/types';
import { FACTION_COLORS } from '../core/constants';

/**
 * Title screen. Allows the player to choose Allies or Axis. Visuals are
 * built entirely from Phaser primitives — no images.
 *
 * Faction symbols (no real-world or politically charged iconography):
 *   - Allies: blue five-pointed star
 *   - Axis  : neutral grey "iron cross"-style geometric badge
 *             (four rectangles around a centre point — purely decorative)
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    document.body.classList.add('in-menu');
    const { width, height } = this.scale;

    // Atmospheric background: vignette + grid lines for "tactical map" feel.
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0c1622, 0x0c1622, 0x05080d, 0x05080d, 1);
    bg.fillRect(0, 0, width, height);

    // Grid lines.
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a2638, 0.6);
    for (let x = 0; x < width; x += 40) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      grid.lineBetween(0, y, width, y);
    }

    // Decorative compass / circle.
    const compass = this.add.graphics();
    compass.lineStyle(1, 0x2a3a52, 0.6);
    compass.strokeCircle(width * 0.5, height * 0.5, 320);
    compass.strokeCircle(width * 0.5, height * 0.5, 220);
    compass.strokeCircle(width * 0.5, height * 0.5, 120);

    // Title.
    const title = this.add.text(width / 2, height * 0.18, 'Empire Fog 1944', {
      fontFamily: 'Cinzel, "Playfair Display", Georgia, serif',
      fontSize: '64px',
      color: '#e6bf6a',
    });
    title.setOrigin(0.5);
    title.setShadow(0, 4, '#000', 12, true, true);

    const subtitle = this.add.text(width / 2, height * 0.18 + 70, 'Turn-Based Strategy Prototype', {
      fontFamily: 'Source Sans Pro, sans-serif',
      fontSize: '18px',
      color: '#8a9bb3',
    });
    subtitle.setOrigin(0.5);
    subtitle.setLetterSpacing(3);

    // Two faction-pick buttons.
    this.makeFactionButton(width * 0.34, height * 0.6, 'allies', 'Alliierte spielen');
    this.makeFactionButton(width * 0.66, height * 0.6, 'axis', 'Achsenmächte spielen');

    // Footer hint.
    const hint = this.add.text(
      width / 2,
      height - 36,
      'Wähle eine Fraktion. Karten sind prozedural — jeder Start ist neu.',
      {
        fontFamily: 'Source Sans Pro, sans-serif',
        fontSize: '12px',
        color: '#5e708a',
      },
    );
    hint.setOrigin(0.5);
  }

  /**
   * Builds a faction "card" that the player can click. Symbol drawn with
   * Phaser graphics — no external assets, no banned iconography.
   */
  private makeFactionButton(
    cx: number,
    cy: number,
    faction: Faction,
    label: string,
  ): void {
    const w = 280;
    const h = 320;
    const colour = FACTION_COLORS[faction];

    const container = this.add.container(cx, cy);

    const bg = this.add.rectangle(0, 0, w, h, 0x0e1624, 0.92);
    bg.setStrokeStyle(2, 0x2a3a52);
    container.add(bg);

    // Symbol.
    const symbol = this.add.graphics();
    if (faction === 'allies') {
      drawStar(symbol, 0, -30, 70, 32, 5, colour, 0xffffff);
    } else {
      drawAxisBadge(symbol, 0, -30, 80, colour);
    }
    container.add(symbol);

    // Label.
    const text = this.add.text(0, 80, label, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '20px',
      color: '#e6bf6a',
    });
    text.setOrigin(0.5);
    container.add(text);

    const sub = this.add.text(
      0,
      110,
      faction === 'allies' ? 'Symbol: blauer Stern' : 'Symbol: neutrales Strategieabzeichen',
      {
        fontFamily: 'Source Sans Pro, sans-serif',
        fontSize: '12px',
        color: '#8a9bb3',
      },
    );
    sub.setOrigin(0.5);
    container.add(sub);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xc9a44a);
      this.tweens.add({ targets: container, scale: 1.04, duration: 150 });
    });
    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x2a3a52);
      this.tweens.add({ targets: container, scale: 1.0, duration: 150 });
    });
    bg.on('pointerdown', () => {
      document.body.classList.remove('in-menu');
      this.scene.start('StrategyScene', { playerFaction: faction });
    });
  }
}

// --- helpers ----------------------------------------------------------------

function drawStar(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  points: number,
  fill: number,
  outline: number,
): void {
  const pts: number[] = [];
  const offset = -Math.PI / 2;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = offset + (Math.PI * i) / points;
    pts.push(cx + Math.cos(a) * r);
    pts.push(cy + Math.sin(a) * r);
  }
  g.fillStyle(fill, 1);
  g.lineStyle(3, outline, 1);
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fillPath();
  g.strokePath();
}

/**
 * Generic "axis powers" placeholder badge: four equal-arm rectangles
 * radiating from a centre, framed in a circle. Deliberately abstract,
 * no real-world emblem. Pure strategy-game iconography.
 */
function drawAxisBadge(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  size: number,
  colour: number,
): void {
  const armW = size * 0.22;
  const armL = size * 0.5;
  // Outer ring.
  g.lineStyle(3, colour, 1);
  g.strokeCircle(cx, cy, size * 0.6);

  // Four arms.
  g.fillStyle(colour, 1);
  g.fillRect(cx - armW / 2, cy - armL, armW, armL * 2);
  g.fillRect(cx - armL, cy - armW / 2, armL * 2, armW);

  // Inner accent square (rotated 45°).
  g.fillStyle(0x2a3a52, 1);
  const s = size * 0.18;
  g.fillRect(cx - s / 2, cy - s / 2, s, s);
}
