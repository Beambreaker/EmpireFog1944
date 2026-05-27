import Phaser from 'phaser';
import type { City, Faction } from '../core/types';
import { CITY_MARKER_SCALE, FACTION_COLORS, TILE_SIZE } from '../core/constants';
import {
  cityTextureKey,
  settlementTextureKey,
} from './assetCatalog';

function markerTextureKey(c: City): string {
  if (c.hasFactory && !c.hasPort) return cityTextureKey('factory');
  if (c.hasPort) return cityTextureKey('port');
  if (c.hasAirfield) return cityTextureKey('airfield');
  return settlementTextureKey(c.settlementKind);
}

function markerSize(c: City, tileSize: number): number {
  const footprint = Math.max(c.tileWidth, c.tileHeight) * tileSize;
  const tier =
    c.settlementKind === 'capital' ? 1.45 : c.settlementKind === 'town' ? 1.22 : 1.05;
  return footprint * CITY_MARKER_SCALE * tier;
}

/** Große Stadt-Symbole über dem Terrain (gut sichtbar beim Zoomen). */
export function rebuildCityMarkers(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  cities: City[],
  playerFaction: Faction,
  fogVisible: (gx: number, gy: number) => boolean,
  tileSize: number = TILE_SIZE,
): void {
  container.removeAll(true);

  for (const c of cities) {
    let anyVis = false;
    for (let yy = c.y; yy < c.y + c.tileHeight; yy++) {
      for (let xx = c.x; xx < c.x + c.tileWidth; xx++) {
        if (fogVisible(xx, yy)) anyVis = true;
      }
    }
    if (!anyVis) continue;

    const tcx = (c.x + c.tileWidth * 0.5) * tileSize;
    const tcy = (c.y + c.tileHeight * 0.5) * tileSize;
    const key = markerTextureKey(c);
    const size = markerSize(c, tileSize);

    const shadow = scene.add.ellipse(tcx, tcy + size * 0.22, size * 0.85, size * 0.18, 0x000000, 0.4);
    container.add(shadow);

    if (scene.textures.exists(key)) {
      const icon = scene.add.image(tcx, tcy - size * 0.05, key);
      icon.setDisplaySize(size, size);
      const col = FACTION_COLORS[c.faction];
      icon.setTint(c.faction === playerFaction ? 0xffffff : col);
      container.add(icon);
    }

    const fs =
      c.settlementKind === 'capital'
        ? Math.round(tileSize * 0.38)
        : c.settlementKind === 'town'
          ? Math.round(tileSize * 0.32)
          : Math.round(tileSize * 0.28);
    const tier =
      c.settlementKind === 'capital' ? 'Hauptstadt' : c.settlementKind === 'town' ? 'Stadt' : 'Dorf';
    const txt = scene.add.text(tcx, tcy - size * 0.58, `${c.name}\n${tier}`, {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: `${fs}px`,
      color: '#f0ece4',
      align: 'center',
      stroke: '#1a1814',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5, 1);
    container.add(txt);
  }
}
