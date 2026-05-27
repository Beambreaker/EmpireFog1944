import Phaser from 'phaser';
import type { Faction, Unit } from '../core/types';
import { theme } from '../core/theme';
import { UNIT_TYPES } from '../units/UnitTypes';
import { unitTextureKey } from './assetCatalog';

const FACTION_TINT: Record<Faction, number> = {
  allies: 0xa8c8ff,
  axis: 0xc8ccd4,
  neutral: 0xd0d8e4,
};

export interface UnitVisual {
  root: Phaser.GameObjects.Container;
}

/** Builds one unit token from SVG sprites + faction tint. */
export function createUnitVisual(
  scene: Phaser.Scene,
  u: Unit,
  tileSize: number,
  factionColor: number,
): UnitVisual {
  const def = UNIT_TYPES[u.typeId];
  const cx = u.x * tileSize + tileSize / 2;
  const cy = u.y * tileSize + tileSize / 2;
  const root = scene.add.container(cx, cy);

  const shadow = scene.add.ellipse(0, tileSize * 0.22, tileSize * 0.72, tileSize * 0.2, 0x000000, 0.35);
  root.add(shadow);

  const pad = tileSize * 0.06;
  const frame = scene.add.rectangle(0, 0, tileSize - pad, tileSize - pad, theme.unit.tokenInner, 0.94);
  frame.setStrokeStyle(2, factionColor, 1);
  root.add(frame);

  const band = scene.add.rectangle(
    0,
    -(tileSize - pad) * 0.38,
    tileSize - pad - 4,
    Math.max(4, tileSize * 0.14),
    factionColor,
    theme.unit.factionBandAlpha + 0.15,
  );
  root.add(band);

  const key = unitTextureKey(u.typeId);
  const iconSize = tileSize * 0.78;
  if (scene.textures.exists(key)) {
    const icon = scene.add.image(0, -tileSize * 0.02, key);
    icon.setDisplaySize(iconSize, iconSize);
    icon.setTint(FACTION_TINT[u.faction]);
    root.add(icon);
  }

  if (def.productionTurns >= 8) {
    const pip = scene.add.circle(tileSize * 0.32, -tileSize * 0.32, Math.max(2.5, tileSize * 0.07), theme.unit.elitePip, 1);
    root.add(pip);
  }

  const pipCount = Math.max(1, Math.min(4, def.movement));
  const pipSpacing = tileSize * 0.1;
  const totalW = pipCount * tileSize * 0.07 + (pipCount - 1) * pipSpacing;
  let sx = -totalW / 2;
  const yPip = tileSize * 0.36;
  for (let i = 0; i < pipCount; i++) {
    const active = i < Math.ceil((u.movementLeft / Math.max(1, def.movement)) * pipCount);
    const dot = scene.add.circle(
      sx + tileSize * 0.035,
      yPip,
      Math.max(1.8, tileSize * 0.045),
      active ? theme.unit.moveReady : theme.unit.moveSpent,
      active ? 0.95 : 0.7,
    );
    root.add(dot);
    sx += tileSize * 0.07 + pipSpacing;
  }

  if (u.hp < def.hpMax) {
    const hpPct = Math.max(0, u.hp / def.hpMax);
    const barW = tileSize * 0.72;
    const barBg = scene.add.rectangle(0, -tileSize * 0.42, barW, Math.max(3, tileSize * 0.08), 0x000000, 0.7);
    root.add(barBg);
    const barCol =
      hpPct > 0.6 ? theme.unit.hpGood : hpPct > 0.3 ? theme.unit.hpMid : theme.unit.hpLow;
    const barFill = scene.add.rectangle(
      -barW / 2 + (barW * hpPct) / 2,
      -tileSize * 0.42,
      barW * hpPct,
      Math.max(3, tileSize * 0.08),
      barCol,
      1,
    );
    barFill.setOrigin(0.5, 0.5);
    root.add(barFill);
  }

  if (u.movementLeft <= 0 && u.hasAttacked) {
    const dim = scene.add.rectangle(0, 0, tileSize, tileSize, 0x000000, 0.32);
    root.add(dim);
  }

  return { root };
}
