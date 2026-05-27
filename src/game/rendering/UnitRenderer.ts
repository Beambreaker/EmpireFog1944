import Phaser from 'phaser';
import type { UnitTypeId } from '../core/types';
import { theme } from '../core/theme';

/**
 * Compact map symbols (readable at small tile size). Inspired by tactical references,
 * drawn only with Phaser Graphics — no external sprites.
 */
export function drawUnitSymbol(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  size: number,
  typeId: UnitTypeId,
  factionStroke: number,
): void {
  const s = size;
  const fill = roleColorByUnitType(typeId);
  const inf = theme.unit.infantryFill;
  g.lineStyle(Math.max(1, s * 0.11), factionStroke, 1);

  switch (typeId) {
    case 'infantry': {
      g.fillStyle(inf, 0.95);
      g.fillRect(cx - s * 0.28, cy - s * 0.28, s * 0.56, s * 0.56);
      g.lineStyle(2, fill, 0.95);
      g.lineBetween(cx - s * 0.2, cy - s * 0.2, cx + s * 0.2, cy + s * 0.2);
      g.lineBetween(cx + s * 0.2, cy - s * 0.2, cx - s * 0.2, cy + s * 0.2);
      g.lineStyle(Math.max(1, s * 0.11), factionStroke, 1);
      g.strokeRect(cx - s * 0.28, cy - s * 0.28, s * 0.56, s * 0.56);
      break;
    }
    case 'special': {
      g.lineStyle(2, fill, 1);
      g.lineBetween(cx - s * 0.35, cy - s * 0.35, cx + s * 0.35, cy + s * 0.35);
      g.lineBetween(cx + s * 0.35, cy - s * 0.35, cx - s * 0.35, cy + s * 0.35);
      g.strokeCircle(cx, cy, s * 0.38);
      break;
    }
    case 'tank': {
      g.fillStyle(fill, 0.9);
      g.fillRoundedRect(cx - s * 0.42, cy - s * 0.06, s * 0.84, s * 0.32, 2);
      g.fillRoundedRect(cx - s * 0.18, cy - s * 0.32, s * 0.36, s * 0.28, 2);
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 1);
      g.strokeRoundedRect(cx - s * 0.42, cy - s * 0.06, s * 0.84, s * 0.32, 2);
      g.strokeRoundedRect(cx - s * 0.18, cy - s * 0.32, s * 0.36, s * 0.28, 2);
      break;
    }
    case 'flak': {
      g.fillStyle(fill, 0.25);
      g.fillCircle(cx, cy, s * 0.38);
      g.lineStyle(2, factionStroke, 1);
      g.strokeCircle(cx, cy, s * 0.38);
      g.lineBetween(cx - s * 0.42, cy, cx + s * 0.42, cy);
      g.lineBetween(cx, cy - s * 0.42, cx, cy + s * 0.42);
      g.fillStyle(factionStroke, 1);
      g.fillCircle(cx, cy, s * 0.08);
      break;
    }
    case 'fighter': {
      g.fillStyle(fill, 0.92);
      g.beginPath();
      g.moveTo(cx, cy - s * 0.45);
      g.lineTo(cx + s * 0.48, cy + s * 0.12);
      g.lineTo(cx, cy + s * 0.05);
      g.lineTo(cx - s * 0.48, cy + s * 0.12);
      g.closePath();
      g.fillPath();
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 1);
      g.strokePath();
      break;
    }
    case 'divebomber': {
      g.fillStyle(fill, 0.92);
      g.beginPath();
      g.moveTo(cx, cy - s * 0.48);
      g.lineTo(cx + s * 0.5, cy + s * 0.22);
      g.lineTo(cx, cy + s * 0.12);
      g.lineTo(cx - s * 0.5, cy + s * 0.22);
      g.closePath();
      g.fillPath();
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 1);
      g.strokePath();
      g.fillStyle(0xc14040, 0.95);
      g.fillCircle(cx, cy + s * 0.32, s * 0.1);
      break;
    }
    case 'transport': {
      g.fillStyle(fill, 0.88);
      g.fillEllipse(cx, cy, s * 0.9, s * 0.32);
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 1);
      g.strokeEllipse(cx, cy, s * 0.9, s * 0.32);
      break;
    }
    case 'destroyer': {
      g.fillStyle(fill, 0.88);
      g.beginPath();
      g.moveTo(cx - s * 0.48, cy + s * 0.1);
      g.lineTo(cx + s * 0.42, cy + s * 0.06);
      g.lineTo(cx + s * 0.32, cy - s * 0.12);
      g.lineTo(cx - s * 0.32, cy - s * 0.14);
      g.closePath();
      g.fillPath();
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 1);
      g.strokePath();
      break;
    }
    case 'submarine': {
      g.fillStyle(0x1a2830, 0.95);
      g.fillEllipse(cx, cy + s * 0.04, s * 0.88, s * 0.3);
      g.lineStyle(Math.max(1, s * 0.1), factionStroke, 0.9);
      g.strokeEllipse(cx, cy + s * 0.04, s * 0.88, s * 0.3);
      break;
    }
    case 'carrier': {
      g.fillStyle(fill, 0.85);
      g.fillRect(cx - s * 0.48, cy - s * 0.06, s * 0.96, s * 0.28);
      g.fillRect(cx - s * 0.12, cy - s * 0.28, s * 0.5, s * 0.22);
      g.strokeRect(cx - s * 0.48, cy - s * 0.06, s * 0.96, s * 0.28);
      break;
    }
    case 'battleship': {
      g.fillStyle(fill, 0.88);
      g.fillRect(cx - s * 0.5, cy - s * 0.04, s * 1.0, s * 0.34);
      g.fillRect(cx - s * 0.16, cy - s * 0.36, s * 0.32, s * 0.32);
      g.strokeRect(cx - s * 0.5, cy - s * 0.04, s * 1.0, s * 0.34);
      break;
    }
    default:
      g.fillStyle(fill, 0.8);
      g.fillRect(cx - s * 0.22, cy - s * 0.22, s * 0.44, s * 0.44);
      g.strokeRect(cx - s * 0.22, cy - s * 0.22, s * 0.44, s * 0.44);
  }
}

function roleColorByUnitType(typeId: UnitTypeId): number {
  switch (typeId) {
    case 'infantry':
    case 'special':
    case 'tank':
    case 'flak':
      return theme.unit.roleLand;
    case 'fighter':
    case 'divebomber':
    case 'transport':
      return theme.unit.roleAir;
    case 'destroyer':
    case 'carrier':
    case 'battleship':
      return theme.unit.roleSea;
    case 'submarine':
      return theme.unit.roleSubsea;
    default:
      return theme.unit.symbolFill;
  }
}

export function drawUnitTokenFrame(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  factionColor: number,
  isElite: boolean,
): void {
  const u = theme.unit;
  const pad = 2;
  const inner = 4;
  const radius = 4;

  g.fillStyle(u.tokenBg, u.tokenBgAlpha);
  g.fillRoundedRect(x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
  g.fillStyle(u.tokenInner, u.tokenInnerAlpha);
  g.fillRoundedRect(x + inner, y + inner, size - inner * 2, size - inner * 2, radius - 1);

  g.fillStyle(factionColor, u.factionBandAlpha);
  g.fillRect(x + inner, y + inner, size - inner * 2, Math.max(3, size * 0.2));

  g.lineStyle(2, factionColor, 1);
  g.strokeRoundedRect(x + pad, y + pad, size - pad * 2, size - pad * 2, radius);
  g.lineStyle(1, u.tokenEdge, 0.95);
  g.strokeRoundedRect(x + 1, y + 1, size - 2, size - 2, radius + 1);

  // Tiny gloss strip for better readability while zoomed out.
  g.fillStyle(u.tokenGloss, 0.14);
  g.fillRoundedRect(x + inner + 1, y + inner + 1, size * 0.52, 3, 2);

  if (isElite) {
    g.fillStyle(u.elitePip, 0.95);
    g.fillCircle(x + size - 6, y + 6, 2.1);
    g.lineStyle(1, u.tokenEdge, 0.9);
    g.strokeCircle(x + size - 6, y + 6, 2.1);
  }
}
