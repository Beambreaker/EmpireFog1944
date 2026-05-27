import Phaser from 'phaser';
import { theme } from '../core/theme';
import { IntroAudio } from '../audio/IntroAudio';
import {
  INTRO_TRAILER_DURATION_MS,
  INTRO_TRAILER_NARRATION,
  INTRO_TRAILER_SHORT_MS,
} from '../narrative/introTrailer';
import { TEXTURE } from '../rendering/assetCatalog';
import {
  createTrailerUnit,
  registerTrailerAnimations,
} from '../rendering/TrailerUnitSprite';
import type { IntroLengthMode, IntroQualityMode } from './IntroScene';

interface IntroTrailerOptions {
  lengthMode: IntroLengthMode;
  qualityMode: IntroQualityMode;
}

const ALLIES_TINT = 0xa8c8ff;
const AXIS_TINT = 0xc8ccd4;
const ALLIES_INF_TINT = 0xd8e4f4;

/**
 * Cinematic-Trailer: See → Land → Luft → Titel.
 * Nutzt 512px Trailer-Sprites; prozeduraler Fallback wenn Texturen fehlen.
 */
export class IntroTrailer {
  private readonly root: Phaser.GameObjects.Container;
  private readonly audio = new IntroAudio();
  private readonly timers: number[] = [];
  private destroyed = false;
  private gradeMultiply?: Phaser.GameObjects.Rectangle;
  private gradeScreen?: Phaser.GameObjects.Rectangle;
  private readonly durationMs: number;
  private readonly fxMultiplier: number;
  private readonly screenMin: number;
  private readonly unitScaleRatio: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly width: number,
    private readonly height: number,
    options: IntroTrailerOptions,
  ) {
    this.root = scene.add.container(0, 0);
    this.root.setDepth(5);
    this.durationMs =
      options.lengthMode === 'kurz'
        ? INTRO_TRAILER_SHORT_MS
        : options.lengthMode === 'lang'
          ? 45000
          : INTRO_TRAILER_DURATION_MS;
    this.fxMultiplier =
      options.qualityMode === 'normal' ? 0.85 : options.qualityMode === 'extrem' ? 1.5 : 1.15;
    this.screenMin = Math.min(width, height);
    this.unitScaleRatio = options.lengthMode === 'kurz' ? 0.26 : 0.24;
  }

  play(onComplete: () => void): void {
    registerTrailerAnimations(this.scene);
    this.audio.startAmbient();
    this.createCinematicBars();
    this.rampCamera(1.03, 1200);

    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(
      theme.menu.bgTop,
      theme.menu.bgTop,
      theme.menu.bgBottom,
      theme.menu.bgBottom,
      1,
    );
    bg.fillRect(0, 0, this.width, this.height);
    this.root.add(bg);
    this.createColorGrade();

    const grainKey = this.scene.textures.exists(TEXTURE.grain) ? TEXTURE.grain : undefined;
    if (grainKey) {
      const grain = this.scene.add.tileSprite(
        this.width / 2,
        this.height / 2,
        this.width,
        this.height,
        grainKey,
      );
      grain.setAlpha(0.2);
      this.root.add(grain);
      this.scene.tweens.add({
        targets: grain,
        tilePositionX: 160,
        tilePositionY: 80,
        duration: this.durationMs,
        ease: 'Linear',
      });
    }

    const subtitle = this.scene.add.text(this.width / 2, this.height * 0.82, '', {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: `${Math.min(20, this.height * 0.024)}px`,
      color: '#e8f0ff',
      align: 'center',
      fontStyle: 'italic',
    });
    subtitle.setOrigin(0.5);
    subtitle.setStroke('#000', 4);
    subtitle.setDepth(20);
    this.root.add(subtitle);

    const tScale = this.durationMs / INTRO_TRAILER_DURATION_MS;
    INTRO_TRAILER_NARRATION.forEach((cue) => {
      const at = Math.round(cue.atMs * tScale);
      if (at >= this.durationMs - 400) return;
      this.schedule(at, () => {
        subtitle.setText(cue.text);
        subtitle.setAlpha(0);
        this.scene.tweens.add({ targets: subtitle, alpha: 1, duration: 400 });
      });
    });

    const actGroundAt = Math.round(5000 * tScale);
    const actAirAt = Math.round(10000 * tScale);
    const actTitleAt = Math.round(19000 * tScale);

    this.actNaval(tScale);
    this.audio.playWarPulse();

    this.schedule(Math.round(4700 * tScale), () => {
      this.transitionToAct('PANZERANGRIFF');
      this.audio.playTensionRise();
    });
    this.schedule(actGroundAt, () => this.actGround(tScale));
    this.schedule(Math.round(9700 * tScale), () => {
      this.transitionToAct('LUFTSCHLACHT');
      this.audio.playTensionRise();
    });
    this.schedule(actAirAt, () => this.actAir(tScale));
    this.schedule(Math.round(18600 * tScale), () => {
      this.transitionToAct('OPERATION NEBELFRONT');
      this.audio.playTensionRise();
    });
    this.schedule(actTitleAt, () => this.actTitle());

    this.schedule(this.durationMs, () => {
      if (this.destroyed) return;
      this.scene.tweens.add({
        targets: this.root,
        alpha: 0,
        duration: 900,
        onComplete: () => {
          this.destroy();
          onComplete();
        },
      });
    });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.length = 0;
    this.audio.stopAll();
    this.scene.cameras.main.setZoom(1);
    this.root.destroy(true);
  }

  private schedule(ms: number, fn: () => void): void {
    const id = window.setTimeout(() => {
      if (!this.destroyed) fn();
    }, ms);
    this.timers.push(id);
  }

  private unit(
    type: Parameters<typeof createTrailerUnit>[1],
    x: number,
    y: number,
    tint: number,
    flip = false,
    navalBob = false,
  ): Phaser.GameObjects.Container {
    const c = createTrailerUnit(this.scene, type, x, y, this.screenMin, {
      scale: this.unitScaleRatio,
      tint,
      flip,
    });
    if (navalBob) {
      const y0 = c.y;
      this.scene.tweens.add({
        targets: c,
        y: y0 + 8,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    return c;
  }

  private actNaval(tScale: number): void {
    const cy = this.height * 0.5;
    const waterKey = this.scene.textures.exists('terrain-water') ? 'terrain-water' : undefined;
    if (waterKey) {
      const water = this.scene.add.tileSprite(
        this.width / 2,
        cy + 30,
        this.width * 1.1,
        this.height * 0.5,
        waterKey,
      );
      water.setAlpha(0.9);
      this.root.add(water);
      this.scene.tweens.add({
        targets: water,
        tilePositionX: 200,
        duration: Math.round(9000 * tScale),
        ease: 'Linear',
      });
    }

    const escortL = this.unit('destroyer', this.width * 0.18, cy, ALLIES_TINT, false, true);
    const shipR = this.unit('battleship', this.width * 0.82, cy, AXIS_TINT, true, true);
    const escortR = this.unit('destroyer', this.width * 0.68, cy + 20, AXIS_TINT, true, true);
    const sub = this.unit('submarine', this.width * 0.38, cy + 48, ALLIES_TINT, false, true);
    this.root.add(escortL);
    this.root.add(shipR);
    this.root.add(escortR);
    this.root.add(sub);

    this.scene.tweens.add({
      targets: [escortL, shipR, escortR, sub],
      x: '+=20',
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.schedule(Math.round(1200 * tScale), () => {
      this.audio.playNavalSalvo();
      this.scene.cameras.main.shake(260, 0.008);
      this.muzzleFlash(escortL.x + 40, escortL.y - 15);
      this.shellTrail(escortL.x + 35, escortL.y - 14, shipR.x - 38, shipR.y - 2, 0.55);
      this.schedule(Math.round(600 * tScale), () => {
        this.explosion(shipR.x - 30, shipR.y, 1.1);
        this.audio.playExplosion(1);
      });
    });

    this.schedule(Math.round(2800 * tScale), () => {
      this.audio.playNavalSalvo();
      this.muzzleFlash(shipR.x - 40, shipR.y - 12);
      this.shellTrail(shipR.x - 35, shipR.y - 12, escortL.x + 35, escortL.y - 4, 0.45);
      this.schedule(Math.round(500 * tScale), () => this.explosion(escortL.x + 35, escortL.y, 0.9));
    });

    this.schedule(Math.round(3900 * tScale), () => {
      this.audio.playExplosion(0.6);
      this.explosion(this.width * 0.5, cy + 10, 0.8);
      this.audio.playWarPulse();
    });
    this.rampCamera(1.08, Math.round(4200 * tScale));
  }

  private actGround(tScale: number): void {
    const y = this.height * 0.58;
    const dust = this.scene.add.rectangle(this.width / 2, y + 40, this.width, 60, 0x3a3028, 0.35);
    this.root.add(dust);
    this.scene.tweens.add({
      targets: dust,
      alpha: { from: 0.2, to: 0.45 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
    });

    const tank = this.unit('tank', -120, y, AXIS_TINT);
    const tank2 = this.unit('tank', -220, y + 28, 0xb8bcc8);
    const tank3 = this.unit('tank', -320, y + 14, ALLIES_TINT);
    const infA = this.unit('infantry', this.width * 0.2, y + 38, ALLIES_INF_TINT);
    const infB = this.unit('infantry', this.width * 0.28, y + 42, ALLIES_INF_TINT);
    const infC = this.unit('infantry', this.width * 0.36, y + 40, ALLIES_INF_TINT);
    const arty = this.unit('artillery', this.width * 0.72, y - 8, AXIS_TINT, true);
    this.root.add(tank);
    this.root.add(tank2);
    this.root.add(tank3);
    this.root.add(infA);
    this.root.add(infB);
    this.root.add(infC);
    this.root.add(arty);
    this.audio.playTankRumble();

    const crossDuration = Math.round(4200 * tScale);
    for (const t of [tank, tank2, tank3]) {
      this.scene.tweens.add({
        targets: t,
        x: this.width + 140,
        duration: crossDuration + (t === tank2 ? 500 : t === tank3 ? 300 : 0),
        ease: 'Linear',
      });
    }

    this.scene.tweens.add({
      targets: [infA, infB, infC],
      x: '+=30',
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.schedule(Math.round(800 * tScale), () => this.audio.playMachineGunBurst());
    this.schedule(Math.round(1400 * tScale), () => {
      const volleys = Math.max(4, Math.round(4 * this.fxMultiplier));
      for (let i = 0; i < volleys; i++) {
        this.schedule(Math.round(i * 120 * tScale), () =>
          this.muzzleFlash(arty.x - 20 - i * 8, arty.y - 18),
        );
        this.schedule(Math.round(i * 120 * tScale), () =>
          this.shellTrail(arty.x - 30, arty.y - 20, this.width * 0.4, y - 25 + i * 6, 0.22),
        );
      }
    });

    this.schedule(Math.round(2200 * tScale), () => {
      this.explosion(this.width * 0.62, y - 10, 1.3);
      this.audio.playExplosion(1.1);
      this.scene.cameras.main.shake(280, 0.01);
      this.addSmokeColumn(this.width * 0.62, y - 15);
    });

    this.schedule(Math.round(3000 * tScale), () => this.audio.playWarPulse());
    this.rampCamera(1.14, Math.round(3800 * tScale));
  }

  private actAir(tScale: number): void {
    const plane = this.unit('fighter', -80, this.height * 0.28, ALLIES_TINT);
    const wing = this.unit('fighter', -150, this.height * 0.34, 0xd6e4f8);
    const wing2 = this.unit('fighter', -220, this.height * 0.3, ALLIES_INF_TINT);
    plane.setAngle(-8);
    wing.setAngle(-10);
    wing2.setAngle(-9);
    this.root.add(plane);
    this.root.add(wing);
    this.root.add(wing2);
    this.audio.playPlaneFlyby();

    const flyDuration = Math.round(2800 * tScale);
    this.scene.tweens.add({
      targets: plane,
      x: this.width + 100,
      y: this.height * 0.38,
      duration: flyDuration,
      ease: 'Sine.easeIn',
    });
    this.scene.tweens.add({
      targets: wing,
      x: this.width + 90,
      y: this.height * 0.44,
      duration: flyDuration + 350,
      ease: 'Sine.easeInOut',
    });
    this.scene.tweens.add({
      targets: wing2,
      x: this.width + 80,
      y: this.height * 0.36,
      duration: flyDuration + 180,
      ease: 'Sine.easeInOut',
    });

    this.schedule(Math.round(1600 * tScale), () => {
      this.explosion(this.width * 0.48, this.height * 0.45, 1.4);
      this.audio.playExplosion(1.2);
      this.scene.cameras.main.shake(320, 0.012);
      this.addSmokeColumn(this.width * 0.48, this.height * 0.47);
    });

    const bomber = this.unit('bomber', this.width + 80, this.height * 0.22, ALLIES_TINT, true);
    const bomber2 = this.unit('bomber', this.width + 140, this.height * 0.28, 0xc8d8ef, true);
    bomber.setAngle(12);
    bomber2.setAngle(10);
    this.root.add(bomber);
    this.root.add(bomber2);
    this.scene.tweens.add({
      targets: bomber,
      x: this.width * 0.35,
      y: this.height * 0.32,
      duration: Math.round(2400 * tScale),
      delay: Math.round(1200 * tScale),
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.explosion(bomber.x, bomber.y + 40, 1);
        this.audio.playExplosion(0.9);
        this.addSmokeColumn(bomber.x, bomber.y + 46);
      },
    });
    this.scene.tweens.add({
      targets: bomber2,
      x: this.width * 0.26,
      y: this.height * 0.38,
      duration: Math.round(2700 * tScale),
      delay: Math.round(1500 * tScale),
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.explosion(bomber2.x, bomber2.y + 36, 0.95);
        this.audio.playExplosion(0.8);
      },
    });

    this.schedule(Math.round(3600 * tScale), () => {
      this.audio.playMachineGunBurst();
      const bursts = Math.max(6, Math.round(6 * this.fxMultiplier));
      for (let i = 0; i < bursts; i++) {
        this.schedule(Math.round(i * 70 * tScale), () =>
          this.shellTrail(
            this.width * 0.72 + i * 10,
            this.height * 0.24 + i * 2,
            this.width * 0.45,
            this.height * 0.4 + i * 3,
            0.16,
          ),
        );
      }
    });
    this.schedule(Math.round(5000 * tScale), () => this.audio.playWarPulse());
    this.rampCamera(1.18, Math.round(4200 * tScale));
  }

  private actTitle(): void {
    const title = this.scene.add.text(this.width / 2, this.height * 0.38, 'EMPIRE FOG 1944', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.min(64, this.height * 0.08)}px`,
      color: '#f0e0b0',
      align: 'center',
    });
    title.setOrigin(0.5);
    title.setStroke('#1a1208', 8);
    title.setShadow(0, 6, '#000', 16, true, true);
    title.setScale(1.5);
    title.setAlpha(0);
    this.root.add(title);

    const sub = this.scene.add.text(this.width / 2, this.height * 0.5, 'OPERATION NEBELFRONT', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.min(22, this.height * 0.028)}px`,
      color: '#c8d8ec',
      letterSpacing: 8,
    });
    sub.setOrigin(0.5);
    sub.setAlpha(0);
    this.root.add(sub);

    this.scene.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 700,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: sub,
      alpha: 1,
      duration: 900,
      delay: 400,
    });
    this.scene.cameras.main.shake(200, 0.004);
    this.audio.playFinalSting();
    this.rampCamera(1.1, 1400);

    const flare = this.scene.add.circle(this.width / 2, this.height * 0.45, 90, 0xffcc66, 0.25);
    flare.setBlendMode(Phaser.BlendModes.ADD);
    this.root.add(flare);
    this.scene.tweens.add({
      targets: flare,
      alpha: 0,
      scale: 2,
      duration: 1200,
      onComplete: () => flare.destroy(),
    });
  }

  private muzzleFlash(x: number, y: number): void {
    const f = this.scene.add.circle(x, y, 10, 0xffcc66, 0.95);
    f.setBlendMode(Phaser.BlendModes.ADD);
    this.root.add(f);
    this.scene.tweens.add({
      targets: f,
      alpha: 0,
      scale: 2.5,
      duration: 120,
      onComplete: () => f.destroy(),
    });
  }

  private explosion(x: number, y: number, scale: number): void {
    const ring = this.scene.add.circle(x, y, 14 * scale, 0xff9944, 0.9);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    this.root.add(ring);
    this.scene.tweens.add({
      targets: ring,
      scale: 5 * scale,
      alpha: 0,
      duration: 550,
      onComplete: () => ring.destroy(),
    });
    for (let i = 0; i < 10; i++) {
      const puff = this.scene.add.circle(x, y, 8, 0x5a5048, 0.55);
      const ang = (i / 10) * Math.PI * 2;
      this.root.add(puff);
      this.scene.tweens.add({
        targets: puff,
        x: x + Math.cos(ang) * 50 * scale,
        y: y + Math.sin(ang) * 35 * scale,
        alpha: 0,
        scale: 2,
        duration: 650,
        onComplete: () => puff.destroy(),
      });
    }
  }

  private shellTrail(x0: number, y0: number, x1: number, y1: number, thickness = 0.25): void {
    const g = this.scene.add.graphics();
    g.lineStyle(2 + thickness * 4, 0xffe6a8, 0.75);
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.strokePath();
    this.root.add(g);
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 130,
      onComplete: () => g.destroy(),
    });
  }

  private addSmokeColumn(x: number, y: number): void {
    const puffs = Math.max(5, Math.round(6 * this.fxMultiplier));
    for (let i = 0; i < puffs; i++) {
      const puff = this.scene.add.circle(x + (Math.random() - 0.5) * 14, y + i * 2, 8 + i * 2, 0x504840, 0.35);
      this.root.add(puff);
      this.scene.tweens.add({
        targets: puff,
        y: y - 70 - i * 16,
        x: x + (Math.random() - 0.5) * 28,
        alpha: 0,
        scale: 1.8,
        duration: 1100 + i * 180,
        onComplete: () => puff.destroy(),
      });
    }
  }

  private createCinematicBars(): void {
    const h = Math.max(40, Math.round(this.height * 0.085));
    const top = this.scene.add.rectangle(this.width / 2, -h / 2, this.width, h, 0x000000, 0.96);
    const bottom = this.scene.add.rectangle(this.width / 2, this.height + h / 2, this.width, h, 0x000000, 0.96);
    top.setDepth(40);
    bottom.setDepth(40);
    this.root.add(top);
    this.scene.tweens.add({
      targets: top,
      y: h / 2,
      duration: 500,
      ease: 'Cubic.easeOut',
    });
    this.scene.tweens.add({
      targets: bottom,
      y: this.height - h / 2,
      duration: 500,
      ease: 'Cubic.easeOut',
    });
  }

  private transitionToAct(label: string): void {
    const flash = this.scene.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0x000000, 0);
    flash.setDepth(35);
    this.root.add(flash);

    const text = this.scene.add.text(this.width / 2, this.height * 0.15, label, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.min(20, this.height * 0.026)}px`,
      color: '#e8d8b0',
      letterSpacing: 5,
    });
    text.setOrigin(0.5);
    text.setDepth(36);
    text.setAlpha(0);
    this.root.add(text);

    this.scene.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.32 },
      duration: 180,
      yoyo: true,
      onComplete: () => flash.destroy(),
    });
    this.scene.tweens.add({
      targets: text,
      alpha: { from: 0, to: 1 },
      duration: 220,
      yoyo: true,
      hold: 360,
      onComplete: () => text.destroy(),
    });

    if (this.gradeMultiply && this.gradeScreen) {
      const scheme =
        label === 'PANZERANGRIFF'
          ? { mul: 0x5a3a2a, scr: 0xffb07a }
          : label === 'LUFTSCHLACHT'
            ? { mul: 0x20304a, scr: 0x9ac6ff }
            : { mul: 0x382828, scr: 0xffd89a };
      this.gradeMultiply.setFillStyle(scheme.mul, 0.26);
      this.gradeScreen.setFillStyle(scheme.scr, 0.11);
    }
  }

  private createColorGrade(): void {
    const mul = this.scene.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0x203040, 0.24);
    mul.setBlendMode(Phaser.BlendModes.MULTIPLY);
    const scr = this.scene.add.rectangle(this.width / 2, this.height / 2, this.width, this.height, 0xaac8ff, 0.1);
    scr.setBlendMode(Phaser.BlendModes.SCREEN);
    this.root.add(mul);
    this.root.add(scr);
    this.gradeMultiply = mul;
    this.gradeScreen = scr;
  }

  private rampCamera(targetZoom: number, duration: number): void {
    const cam = this.scene.cameras.main;
    this.scene.tweens.add({
      targets: cam,
      zoom: targetZoom,
      duration,
      ease: 'Sine.easeInOut',
    });
  }
}
