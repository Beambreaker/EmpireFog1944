import Phaser from 'phaser';

/** Kurze Seeschlacht-Animation für das Intro (Schiffe, Salven, Explosionen). */
export class IntroNavalAnimation {
  private readonly root: Phaser.GameObjects.Container;
  private readonly flashes: Phaser.GameObjects.GameObject[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly width: number,
    private readonly height: number,
    depth = 5,
  ) {
    this.root = scene.add.container(0, 0);
    this.root.setDepth(depth);
  }

  play(onComplete: () => void): void {
    const cy = this.height * 0.52;
    const ocean = this.scene.add.graphics();
    ocean.fillGradientStyle(0x0a1828, 0x0a1828, 0x061018, 0x061018, 1);
    ocean.fillRect(0, 0, this.width, this.height);
    this.root.add(ocean);

    const water = this.scene.add.tileSprite(
      this.width / 2,
      cy + 40,
      this.width * 1.2,
      this.height * 0.55,
      'terrain-water',
    );
    water.setAlpha(0.85);
    water.setTint(0x5a8ab8);
    this.root.add(water);
    this.scene.tweens.add({
      targets: water,
      tilePositionX: { from: 0, to: 120 },
      duration: 12000,
      repeat: -1,
    });

    const shipL = this.makeShip('unit-destroyer', this.width * 0.22, cy, 1, 0xa8c8ff);
    const shipR = this.makeShip('unit-battleship', this.width * 0.78, cy, -1, 0xd0d4dc);
    this.root.add(shipL);
    this.root.add(shipR);

    this.bobShip(shipL);
    this.bobShip(shipR, 400);

    const title = this.scene.add.text(this.width / 2, this.height * 0.14, '', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.min(52, this.height * 0.065)}px`,
      color: '#f0e0b0',
      align: 'center',
    });
    title.setOrigin(0.5);
    title.setStroke('#1a1208', 6);
    title.setShadow(0, 4, '#000', 14, true, true);
    title.setAlpha(0);
    this.root.add(title);

    const sub = this.scene.add.text(this.width / 2, this.height * 0.22, '', {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: `${Math.min(18, this.height * 0.022)}px`,
      color: '#c8d8ec',
      align: 'center',
    });
    sub.setOrigin(0.5);
    sub.setAlpha(0);
    this.root.add(sub);

    const vignette = this.scene.add.graphics();
    vignette.fillStyle(0x000000, 0.45);
    vignette.fillRect(0, 0, this.width, this.height * 0.12);
    vignette.fillRect(0, this.height * 0.88, this.width, this.height * 0.12);
    this.root.add(vignette);

    // Salve 1: links → rechts
    this.scene.time.delayedCall(900, () => {
      this.fireSalvo(shipL.x + 50, shipL.y - 20, shipR.x - 40, shipR.y, 0xffcc66);
      this.scene.cameras.main.shake(120, 0.004);
    });

    // Treffer + Gegenschlag
    this.scene.time.delayedCall(2200, () => {
      this.explosion(shipR.x - 30, shipR.y - 10, 1.2);
      this.scene.cameras.main.shake(200, 0.008);
    });

    this.scene.time.delayedCall(3200, () => {
      this.fireSalvo(shipR.x - 50, shipR.y - 15, shipL.x + 35, shipL.y, 0xff8866);
    });

    this.scene.time.delayedCall(4500, () => {
      this.explosion(shipL.x + 25, shipL.y - 8, 1);
      this.scene.cameras.main.shake(180, 0.006);
    });

    // Titel einblenden
    this.scene.time.delayedCall(5200, () => {
      title.setText('EMPIRE FOG 1944');
      title.setScale(1.4);
      title.setAlpha(0);
      this.scene.tweens.add({
        targets: title,
        alpha: 1,
        scale: 1,
        duration: 450,
        ease: 'Back.easeOut',
      });
      sub.setText('Seeschlacht im Nebel — Europa 1944');
      this.scene.tweens.add({
        targets: sub,
        alpha: 1,
        duration: 600,
        delay: 200,
      });
    });

    this.scene.time.delayedCall(7800, () => {
      this.scene.tweens.add({
        targets: this.root,
        alpha: 0,
        duration: 700,
        onComplete: () => {
          this.destroy();
          onComplete();
        },
      });
    });
  }

  destroy(): void {
    this.root.destroy(true);
    for (const f of this.flashes) f.destroy();
    this.flashes.length = 0;
  }

  private makeShip(
    textureKey: string,
    x: number,
    y: number,
    flipX: number,
    tint: number,
  ): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);
    const wake = this.scene.add.ellipse(0, 28, 90, 18, 0x000000, 0.25);
    c.add(wake);

    const size = Math.min(this.width, this.height) * 0.14;
    if (this.scene.textures.exists(textureKey)) {
      const hull = this.scene.add.image(0, 0, textureKey);
      hull.setDisplaySize(size, size);
      hull.setTint(tint);
      hull.setFlipX(flipX < 0);
      c.add(hull);
    } else {
      const hull = this.scene.add.rectangle(0, 0, size, size * 0.5, 0x3a4a5a, 1);
      c.add(hull);
    }
    return c;
  }

  private bobShip(ship: Phaser.GameObjects.Container, delay = 0): void {
    this.scene.tweens.add({
      targets: ship,
      y: ship.y + 6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay,
    });
  }

  private fireSalvo(x0: number, y0: number, x1: number, y1: number, color: number): void {
    const flash = this.scene.add.circle(x0, y0, 8, color, 0.9);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    this.root.add(flash);
    this.flashes.push(flash);
    this.scene.tweens.add({ targets: flash, alpha: 0, scale: 2, duration: 180, onComplete: () => flash.destroy() });

    for (let i = 0; i < 3; i++) {
      const shell = this.scene.add.circle(x0, y0 - i * 4, 4, 0xfff0c0, 1);
      shell.setBlendMode(Phaser.BlendModes.ADD);
      this.root.add(shell);
      this.flashes.push(shell);
      this.scene.tweens.add({
        targets: shell,
        x: x1 + (i - 1) * 12,
        y: y1 + (i - 1) * 8,
        duration: 520 + i * 80,
        delay: i * 70,
        ease: 'Quad.easeIn',
        onComplete: () => shell.destroy(),
      });
    }
  }

  private explosion(x: number, y: number, scale: number): void {
    const ring = this.scene.add.circle(x, y, 12 * scale, 0xffaa44, 0.85);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    this.root.add(ring);
    this.scene.tweens.add({
      targets: ring,
      scale: 4 * scale,
      alpha: 0,
      duration: 500,
      onComplete: () => ring.destroy(),
    });

    for (let i = 0; i < 8; i++) {
      const puff = this.scene.add.circle(x, y, 6 + i * 2, 0x6a5a48, 0.5);
      puff.setBlendMode(Phaser.BlendModes.SCREEN);
      this.root.add(puff);
      const ang = (i / 8) * Math.PI * 2;
      this.scene.tweens.add({
        targets: puff,
        x: x + Math.cos(ang) * 40 * scale,
        y: y + Math.sin(ang) * 25 * scale,
        alpha: 0,
        scale: 1.8,
        duration: 700 + i * 40,
        onComplete: () => puff.destroy(),
      });
    }
  }
}
