import Phaser from 'phaser';
import { theme } from '../core/theme';
import { INTRO_BEATS } from '../narrative/campaign';
import { INTRO_VIDEO_KEY, TEXTURE } from '../rendering/assetCatalog';

const INTRO_SKIP_KEY = 'ef1944_intro_skip';

/**
 * Intro: bevorzugt echtes MP4 (public/video/intro.mp4), sonst Kino-Sequenz in Phaser.
 * Alles auf Deutsch. Überspringen: Klick, Leertaste, Enter, Esc.
 */
export class IntroScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private lineTexts: Phaser.GameObjects.Text[] = [];
  private skipHint!: Phaser.GameObjects.Text;
  private canSkip = false;
  private video?: Phaser.GameObjects.Video;
  private usingVideo = false;

  constructor() {
    super('IntroScene');
  }

  create(): void {
    document.body.classList.add('in-intro');
    document.body.classList.remove('in-menu');
    const { width, height } = this.scale;

    if (this.cache.video.exists(INTRO_VIDEO_KEY)) {
      this.playIntroVideo(width, height);
    } else {
      this.playCinematicIntro(width, height);
    }

    this.setupSkipInput();
  }

  private playIntroVideo(width: number, height: number): void {
    this.usingVideo = true;
    const bg = this.add.rectangle(width / 2, height / 2, width, height, theme.menu.bgBottom, 1);

    this.video = this.add.video(width / 2, height / 2, INTRO_VIDEO_KEY);
    this.video.setOrigin(0.5);
    this.video.setDisplaySize(width, height);
    this.video.setDepth(1);
    bg.setDepth(0);

    this.skipHint = this.add.text(width / 2, height * 0.92, 'Leertaste · Klick — Überspringen', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#c8d8ec',
      letterSpacing: 3,
    });
    this.skipHint.setOrigin(0.5);
    this.skipHint.setDepth(10);
    this.skipHint.setAlpha(0);

    this.time.delayedCall(600, () => {
      this.canSkip = true;
      this.tweens.add({ targets: this.skipHint, alpha: 1, duration: 500 });
    });

    this.video.on('complete', () => this.finishIntro());
    this.video.on('error', () => {
      this.video?.destroy();
      this.children.removeAll();
      this.playCinematicIntro(width, height);
      this.setupSkipInput();
    });

    try {
      this.video.play(false);
    } catch {
      this.video?.once(Phaser.GameObjects.Events.VIDEO_UNLOCKED, () => {
        this.video?.play(false);
      });
    }
  }

  private playCinematicIntro(width: number, height: number): void {
    this.usingVideo = false;
    const tm = theme.menu;

    const bg = this.add.graphics();
    bg.fillGradientStyle(tm.bgTop, tm.bgTop, tm.bgBottom, tm.bgBottom, 1);
    bg.fillRect(0, 0, width, height);

    if (this.textures.exists(TEXTURE.introMap)) {
      const map = this.add.image(width * 0.5, height * 0.52, TEXTURE.introMap);
      map.setDisplaySize(width * 0.85, height * 0.55);
      map.setAlpha(0.55);
      this.tweens.add({
        targets: map,
        x: width * 0.52,
        duration: 18000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const grain = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE.grain);
    grain.setAlpha(0.22);
    grain.setBlendMode(Phaser.BlendModes.MULTIPLY);

    if (this.textures.exists(TEXTURE.introFog)) {
      const fog = this.add.image(width / 2, height / 2, TEXTURE.introFog);
      fog.setDisplaySize(width, height);
      fog.setAlpha(0.75);
      this.tweens.add({
        targets: fog,
        alpha: { from: 0.65, to: 0.92 },
        duration: 4000,
        yoyo: true,
        repeat: -1,
      });
    }

    if (this.textures.exists(TEXTURE.logoMark)) {
      const logo = this.add.image(width / 2, height * 0.22, TEXTURE.logoMark);
      logo.setDisplaySize(140, 140);
      logo.setAlpha(0.9);
      this.tweens.add({
        targets: logo,
        scale: { from: 0.95, to: 1.05 },
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.5);
    vignette.fillRect(0, 0, width, height * 0.15);
    vignette.fillRect(0, height * 0.85, width, height * 0.15);

    this.titleText = this.add.text(width / 2, height * 0.38, '', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.min(56, height * 0.07)}px`,
      color: '#f0e0b0',
      align: 'center',
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setStroke('#1a1208', 6);
    this.titleText.setShadow(0, 4, '#000', 12, true, true);

    for (let i = 0; i < 3; i++) {
      const t = this.add.text(width / 2, height * 0.5 + i * 36, '', {
        fontFamily: 'Source Sans 3, system-ui, sans-serif',
        fontSize: `${Math.min(20, height * 0.024)}px`,
        color: '#c8d8ec',
        align: 'center',
        lineSpacing: 8,
      });
      t.setOrigin(0.5);
      t.setAlpha(0);
      this.lineTexts.push(t);
    }

    this.skipHint = this.add.text(width / 2, height * 0.92, 'Leertaste · Klick — Überspringen', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      color: '#5e708a',
      letterSpacing: 3,
    });
    this.skipHint.setOrigin(0.5);
    this.skipHint.setAlpha(0);

    this.time.delayedCall(800, () => {
      this.canSkip = true;
      this.tweens.add({ targets: this.skipHint, alpha: 1, duration: 600 });
    });

    this.playBeat(0);
  }

  private setupSkipInput(): void {
    this.input.keyboard?.off('keydown-SPACE');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.on('keydown-SPACE', () => this.skipIntro());
    this.input.keyboard?.on('keydown-ENTER', () => this.skipIntro());
    this.input.keyboard?.on('keydown-ESC', () => this.skipIntro());
    this.input.on('pointerdown', () => {
      if (this.canSkip) this.skipIntro();
    });
  }

  private playBeat(index: number): void {
    if (this.usingVideo) return;
    if (index >= INTRO_BEATS.length) {
      this.finishIntro();
      return;
    }
    const beat = INTRO_BEATS[index];

    this.titleText.setText(beat.title);
    this.titleText.setAlpha(0);
    this.tweens.add({ targets: this.titleText, alpha: 1, duration: 900, ease: 'Cubic.easeOut' });

    for (let i = 0; i < this.lineTexts.length; i++) {
      const line = this.lineTexts[i];
      line.setText(beat.lines[i] ?? '');
      line.setAlpha(0);
      this.time.delayedCall(400 + i * 500, () => {
        this.tweens.add({ targets: line, alpha: 1, duration: 700, ease: 'Cubic.easeOut' });
      });
    }

    this.time.delayedCall(beat.durationMs, () => {
      this.tweens.add({
        targets: [this.titleText, ...this.lineTexts],
        alpha: 0,
        duration: 500,
        onComplete: () => this.playBeat(index + 1),
      });
    });
  }

  private skipIntro(): void {
    if (!this.canSkip) return;
    try {
      sessionStorage.setItem(INTRO_SKIP_KEY, '1');
    } catch {
      /* ignore */
    }
    this.video?.stop();
    this.finishIntro();
  }

  private finishIntro(): void {
    document.body.classList.remove('in-intro');
    this.scene.start('MenuScene');
  }
}

export function shouldSkipIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SKIP_KEY) === '1';
  } catch {
    return false;
  }
}
