import Phaser from 'phaser';
import type { City } from '../core/types';
import { isWaterTerrain } from '../map/Terrain';
import type { TileMap } from '../map/TileMap';
import { TEXTURE } from './assetCatalog';

/**
 * Animierte Karten-Atmosphäre: Wasser-Schimmer, Fabrik-Rauch.
 * Läuft in StrategyScene update().
 */
export class MapEffectsLayer {
  private readonly waterOverlays: Phaser.GameObjects.Image[] = [];
  private readonly smokePuffs: Phaser.GameObjects.Arc[] = [];
  private waterPhase = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly container: Phaser.GameObjects.Container,
    private readonly tileMap: TileMap,
    private readonly cities: City[],
    private readonly tileSize: number,
  ) {
    this.buildWaterShimmer();
    this.buildFactorySmoke();
  }

  private buildWaterShimmer(): void {
    const w = this.tileMap.width;
    const h = this.tileMap.height;
    const key = this.scene.textures.exists('terrain-water-shallow')
      ? 'terrain-water-shallow'
      : 'terrain-water';

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const t = this.tileMap.get(x, y)!.terrain;
        if (!isWaterTerrain(t)) continue;
        if ((x + y) % 2 !== 0) continue;

        const px = x * this.tileSize + this.tileSize * 0.5;
        const py = y * this.tileSize + this.tileSize * 0.5;
        const overlay = this.scene.add.image(px, py, key);
        overlay.setDisplaySize(this.tileSize + 2, this.tileSize + 2);
        overlay.setAlpha(0.22);
        overlay.setBlendMode(Phaser.BlendModes.ADD);
        overlay.setTint(0x88d0ff);
        this.container.add(overlay);
        this.waterOverlays.push(overlay);

        this.scene.tweens.add({
          targets: overlay,
          alpha: { from: 0.12, to: 0.32 },
          duration: 1800 + ((x * 31 + y * 17) % 1200),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: (x * 7 + y * 11) % 800,
        });
      }
    }
  }

  private buildFactorySmoke(): void {
    for (const c of this.cities) {
      if (!c.hasFactory) continue;
      const cx = (c.x + c.tileWidth * 0.5) * this.tileSize;
      const cy = (c.y + 0.3) * this.tileSize;

      for (let i = 0; i < 3; i++) {
        const puff = this.scene.add.circle(cx + (i - 1) * 6, cy, 4 + i, 0x4a4844, 0.35);
        puff.setBlendMode(Phaser.BlendModes.SCREEN);
        this.container.add(puff);
        this.smokePuffs.push(puff);

        this.scene.tweens.add({
          targets: puff,
          y: cy - 18 - i * 4,
          alpha: { from: 0.45, to: 0 },
          scale: { from: 0.6, to: 1.4 },
          duration: 2200 + i * 400,
          repeat: -1,
          delay: i * 600,
          onRepeat: () => {
            puff.y = cy;
            puff.setAlpha(0.4);
            puff.setScale(0.6);
          },
        });
      }
    }
  }

  update(_time: number, delta: number): void {
    this.waterPhase += delta * 0.001;
    const shift = Math.sin(this.waterPhase) * 0.5;
    for (let i = 0; i < this.waterOverlays.length; i++) {
      const o = this.waterOverlays[i];
      o.rotation = shift * 0.02;
    }
  }

  destroy(): void {
    for (const o of this.waterOverlays) o.destroy();
    for (const p of this.smokePuffs) p.destroy();
    this.waterOverlays.length = 0;
    this.smokePuffs.length = 0;
  }
}
