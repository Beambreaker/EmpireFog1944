import Phaser from 'phaser';
import { INTRO_VIDEO_KEY } from '../rendering/assetCatalog';
import { introAssetsNeedLoading, preloadIntroAssets } from '../rendering/loadGameAssets';
import { registerTrailerAnimations } from '../rendering/TrailerUnitSprite';
import { IntroTrailer } from './IntroTrailer';

const INTRO_SKIP_KEY = 'ef1944_intro_skip';
const INTRO_ALWAYS_SKIP_KEY = 'ef1944_intro_always_skip';
const INTRO_LENGTH_KEY = 'ef1944_intro_length';
const INTRO_QUALITY_KEY = 'ef1944_intro_quality';

export type IntroLengthMode = 'kurz' | 'standard' | 'lang';
export type IntroQualityMode = 'normal' | 'hoch' | 'extrem';

/**
 * Intro: optional MP4, sonst Cinematic-Trailer (See, Panzer, Flugzeuge, SFX).
 * Lädt fehlende Assets nach (z. B. Menü „JETZT INTRO TESTEN“ ohne erneuten Boot).
 */
export class IntroScene extends Phaser.Scene {
  private skipHint!: Phaser.GameObjects.Text;
  private canSkip = false;
  private video?: Phaser.GameObjects.Video;
  private trailer?: IntroTrailer;

  constructor() {
    super('IntroScene');
  }

  preload(): void {
    if (introAssetsNeedLoading(this)) {
      preloadIntroAssets(this);
    }
  }

  create(): void {
    document.body.classList.add('in-intro');
    document.body.classList.remove('in-menu');

    const start = (): void => {
      registerTrailerAnimations(this);
      const { width, height } = this.scale;
      const useBundledVideo = this.cache.video.exists(INTRO_VIDEO_KEY);
      if (useBundledVideo) {
        this.playIntroVideo(width, height);
      } else {
        this.playTrailer();
      }
      this.setupSkipInput();
    };

    if (this.load.isLoading()) {
      this.load.once(Phaser.Loader.Events.COMPLETE, start);
      return;
    }
    if (introAssetsNeedLoading(this)) {
      preloadIntroAssets(this);
      if (this.load.totalToLoad > 0) {
        this.load.once(Phaser.Loader.Events.COMPLETE, start);
        this.load.start();
        return;
      }
    }
    start();
  }

  private playIntroVideo(width: number, height: number): void {
    this.video = this.add.video(width / 2, height / 2, INTRO_VIDEO_KEY);
    this.video.setOrigin(0.5);
    this.video.setDisplaySize(width, height);
    this.addSkipHint(width, height);
    this.video.on('complete', () => this.finishIntro());
    this.video.on('error', () => {
      this.video?.destroy();
      this.children.removeAll();
      this.playTrailer();
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

  private playTrailer(): void {
    const { width, height } = this.scale;
    this.addSkipHint(width, height);
    this.trailer = new IntroTrailer(this, width, height, {
      lengthMode: getIntroLengthMode(),
      qualityMode: getIntroQualityMode(),
    });
    this.trailer.play(() => this.finishIntro());
  }

  private addSkipHint(width: number, height: number): void {
    this.skipHint = this.add.text(width / 2, height * 0.94, 'Leertaste · Klick — Überspringen', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#c8d8ec',
      letterSpacing: 3,
    });
    this.skipHint.setOrigin(0.5);
    this.skipHint.setDepth(100);
    this.skipHint.setAlpha(0);
    this.time.delayedCall(1500, () => {
      this.canSkip = true;
      this.tweens.add({ targets: this.skipHint, alpha: 1, duration: 500 });
    });
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

  private skipIntro(): void {
    if (!this.canSkip) return;
    try {
      sessionStorage.setItem(INTRO_SKIP_KEY, '1');
    } catch {
      /* ignore */
    }
    this.video?.stop();
    this.trailer?.destroy();
    this.finishIntro();
  }

  private finishIntro(): void {
    document.body.classList.remove('in-intro');
    this.scene.start('MenuScene');
  }
}

export function shouldSkipIntro(): boolean {
  try {
    return (
      sessionStorage.getItem(INTRO_SKIP_KEY) === '1' ||
      localStorage.getItem(INTRO_ALWAYS_SKIP_KEY) === '1'
    );
  } catch {
    return false;
  }
}

export function setAlwaysSkipIntro(enabled: boolean): void {
  try {
    localStorage.setItem(INTRO_ALWAYS_SKIP_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function getAlwaysSkipIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_ALWAYS_SKIP_KEY) === '1';
  } catch {
    return false;
  }
}

export function setIntroLengthMode(mode: IntroLengthMode): void {
  try {
    localStorage.setItem(INTRO_LENGTH_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function getIntroLengthMode(): IntroLengthMode {
  try {
    const v = localStorage.getItem(INTRO_LENGTH_KEY);
    if (v === 'kurz' || v === 'standard' || v === 'lang') return v;
  } catch {
    /* ignore */
  }
  return 'standard';
}

export function setIntroQualityMode(mode: IntroQualityMode): void {
  try {
    localStorage.setItem(INTRO_QUALITY_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function getIntroQualityMode(): IntroQualityMode {
  try {
    const v = localStorage.getItem(INTRO_QUALITY_KEY);
    if (v === 'normal' || v === 'hoch' || v === 'extrem') return v;
  } catch {
    /* ignore */
  }
  return 'hoch';
}
