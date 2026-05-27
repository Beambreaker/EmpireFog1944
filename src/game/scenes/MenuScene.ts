import Phaser from 'phaser';
import type { Faction } from '../core/types';
import { theme } from '../core/theme';
import { TEXTURE } from '../rendering/assetCatalog';
import { CAMPAIGN_SUBTITLE, CAMPAIGN_TITLE, FACTION_BRIEFING } from '../narrative/campaign';
import {
  getAlwaysSkipIntro,
  getIntroLengthMode,
  getIntroQualityMode,
  setAlwaysSkipIntro,
  setIntroLengthMode,
  setIntroQualityMode,
  type IntroLengthMode,
  type IntroQualityMode,
} from './IntroScene';

/**
 * Startmenü mit visueller Tiefe: Referenz-Kartenbild, Fraktionsvorschau, Embleme.
 * Keine Porträts — nur Terrain-/Symbol-Referenzen als Stimmungsbilder.
 */
export class MenuScene extends Phaser.Scene {
  private menuSelected: Faction | null = null;
  private cardAllies!: Phaser.GameObjects.Container;
  private cardAxis!: Phaser.GameObjects.Container;
  private btnStart!: Phaser.GameObjects.Container;
  private toast?: Phaser.GameObjects.Container;
  private briefingText!: Phaser.GameObjects.Text;
  private entranceTargets: Phaser.GameObjects.GameObject[] = [];
  private menuButtons: Phaser.GameObjects.Container[] = [];
  private optionPanel?: Phaser.GameObjects.Container;
  private optionLengthText?: Phaser.GameObjects.Text;
  private optionQualityText?: Phaser.GameObjects.Text;
  private optionAutoText?: Phaser.GameObjects.Text;
  private optionPreviewText?: Phaser.GameObjects.Text;
  private introLengthMode: IntroLengthMode = 'standard';
  private introQualityMode: IntroQualityMode = 'hoch';
  private alwaysSkipIntro = false;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    document.body.classList.add('in-menu');
    const { width, height } = this.scale;
    const tm = theme.menu;
    this.introLengthMode = getIntroLengthMode();
    this.introQualityMode = getIntroQualityMode();
    this.alwaysSkipIntro = getAlwaysSkipIntro();

    // --- Background stack ---------------------------------------------------
    const bg = this.add.graphics();
    bg.fillGradientStyle(tm.bgTop, tm.bgTop, tm.bgBottom, tm.bgBottom, 1);
    bg.fillRect(0, 0, width, height);

    const heroW = Math.min(width * 0.58, 1100);
    const heroKey = this.textures.exists(TEXTURE.refTerrain) ? TEXTURE.refTerrain : TEXTURE.menuFrame;
    const hero = this.add.image(heroW * 0.5, height * 0.5, heroKey);
    hero.setDisplaySize(heroW, height);
    hero.setAlpha(heroKey === TEXTURE.refTerrain ? 0.55 : 0.35);
    hero.setTint(0x7a98b8);

    const frame = this.add.image(heroW * 0.5, height * 0.5, TEXTURE.menuFrame);
    frame.setDisplaySize(heroW, height);

    const shade = this.add.graphics();
    shade.fillGradientStyle(0x050810, 0x050810, 0x050810, 0x050810, 0.2, 0.55, 0.88, 0.95);
    shade.fillRect(heroW * 0.35, 0, width - heroW * 0.35, height);
    shade.fillRect(0, 0, width, height * 0.12);
    shade.fillRect(0, height * 0.88, width, height * 0.12);

    const grain = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE.grain);
    grain.setAlpha(0.18);
    grain.setBlendMode(Phaser.BlendModes.MULTIPLY);

    const vignette = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE.fogPattern);
    vignette.setAlpha(0.14);
    vignette.setBlendMode(Phaser.BlendModes.SCREEN);

    // --- Title block (left) -------------------------------------------------
    const titleX = Math.max(48, width * 0.04);
    const titleY = height * 0.16;

    const title = this.add.text(titleX, titleY, 'EMPIRE\nFOG 1944', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: `${Math.round(Math.min(72, height * 0.09))}px`,
      color: `#${tm.goldBright.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
      lineSpacing: 4,
    });
    title.setOrigin(0, 0);
    title.setStroke('#1a1208', 6);
    title.setShadow(0, 4, '#000000', 14, true, true);
    this.entranceTargets.push(title);

    const campaignHead = this.add.text(titleX, titleY + title.height + 12, CAMPAIGN_TITLE, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '18px',
      color: `#${tm.gold.toString(16).padStart(6, '0')}`,
      letterSpacing: 4,
    });

    const tagline = this.add.text(titleX, campaignHead.y + 28, CAMPAIGN_SUBTITLE, {
      fontFamily: 'system-ui, Segoe UI, sans-serif',
      fontSize: '15px',
      color: `#${tm.subtitle.toString(16).padStart(6, '0')}`,
      letterSpacing: 6,
    });
    this.entranceTargets.push(campaignHead, tagline);

    this.briefingText = this.add.text(titleX, tagline.y + 32, 'Wähle eine Fraktion.', {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: '13px',
      color: '#b8c8dc',
      lineSpacing: 8,
      wordWrap: { width: Math.min(420, width * 0.38) },
    });
    this.entranceTargets.push(this.briefingText);

    const rule = this.add.graphics();
    rule.lineStyle(2, tm.gold, 0.85);
    rule.lineBetween(titleX, this.briefingText.y + this.briefingText.height + 16, titleX + 180, this.briefingText.y + this.briefingText.height + 16);
    rule.lineStyle(1, tm.grid, 0.5);
    rule.lineBetween(titleX, this.briefingText.y + this.briefingText.height + 20, titleX + 280, this.briefingText.y + this.briefingText.height + 20);

    // --- Fraktionen (kompakt, nebeneinander) --------------------------------
    const cardY = height * 0.52;
    const cardX1 = width * 0.56;
    const cardX2 = width * 0.72;

    const pickHead = this.add.text(width * 0.64, height * 0.38, 'FRAKTION', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '15px',
      color: `#${tm.gold.toString(16).padStart(6, '0')}`,
      letterSpacing: 6,
    });
    pickHead.setOrigin(0.5, 0);
    this.entranceTargets.push(pickHead);

    this.cardAllies = this.makeFactionCard(cardX1, cardY, 'allies', 'ALLIIERTE', 'See & Luft');
    this.cardAxis = this.makeFactionCard(cardX2, cardY, 'axis', 'ACHSENMÄCHTE', 'Panzer & Stoß');
    this.entranceTargets.push(this.cardAllies, this.cardAxis);

    // --- Aktionen (donnern von rechts rein) ---------------------------------
    const btnX = width * 0.64;
    const btnY = height * 0.78;
    this.menuButtons = [];
    this.btnStart = this.makeGoldButton(btnX, btnY - 40, 'SPIEL STARTEN', () => {
      if (!this.menuSelected) {
        this.showToast('Bitte zuerst eine Fraktion wählen.');
        return;
      }
      document.body.classList.remove('in-menu');
      this.scene.stop('BootScene');
      this.scene.stop('MenuScene');
      this.scene.start('StrategyScene', { playerFaction: this.menuSelected });
    });
    this.menuButtons.push(this.btnStart);
    const optionsBtn = this.makeGoldButton(btnX, btnY + 8, 'OPTIONEN', () => this.toggleOptionsPanel());
    this.menuButtons.push(optionsBtn);
    this.menuButtons.push(
      this.makeGoldButton(btnX, btnY + 56, 'INTRO ERNEUT', () => {
      try {
        sessionStorage.removeItem('ef1944_intro_skip');
      } catch {
        /* ignore */
      }
      document.body.classList.remove('in-menu');
      this.scene.start('IntroScene');
      }),
    );
    this.menuButtons.push(
      this.makeGoldButton(btnX, btnY + 104, 'BEENDEN', () =>
        this.showToast('Tab oder Fenster schließen, um zu beenden.'),
      ),
    );
    this.optionPanel = this.createOptionsPanel(btnX, btnY - 130);
    this.optionPanel.setAlpha(0);
    this.optionPanel.setVisible(false);

    const ver = this.add.text(width - 16, height - 12, 'v0.1.1 · Karte & Nebel · Empire Fog 1944', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#5e708a',
    });
    ver.setOrigin(1, 1);

    this.refreshCardFrames();
    this.playMenuEntrance();
  }

  /** Menü-Elemente mit Donner-Effekt einfliegen lassen. */
  private playMenuEntrance(): void {
    const slide = 420;
    for (const t of this.entranceTargets) {
      const ox = (t as Phaser.GameObjects.Text).x ?? (t as Phaser.GameObjects.Container).x;
      const oy = (t as Phaser.GameObjects.Text).y ?? (t as Phaser.GameObjects.Container).y;
      if (t instanceof Phaser.GameObjects.Text) {
        t.setAlpha(0);
        t.x -= 80;
        this.tweens.add({
          targets: t,
          x: ox,
          alpha: 1,
          duration: 550,
          ease: 'Back.easeOut',
          delay: 80,
        });
      } else if (t instanceof Phaser.GameObjects.Container) {
        t.setAlpha(0);
        t.y += 60;
        this.tweens.add({
          targets: t,
          y: oy,
          alpha: 1,
          duration: 600,
          ease: 'Back.easeOut',
          delay: 200,
        });
      }
    }

    this.menuButtons.forEach((btn, i) => {
      const targetX = btn.x;
      btn.x = targetX + slide;
      btn.setAlpha(0);
      btn.setScale(0.85);
      this.tweens.add({
        targets: btn,
        x: targetX,
        alpha: 1,
        scale: 1,
        duration: 420,
        ease: 'Back.easeOut',
        delay: 380 + i * 90,
      });
    });

    this.cameras.main.shake(180, 0.0025);
  }

  private makeFactionCard(
    cx: number,
    cy: number,
    faction: Faction,
    title: string,
    blurb: string,
  ): Phaser.GameObjects.Container {
    const w = Math.min(260, this.scale.width * 0.22);
    const h = 132;
    const container = this.add.container(cx, cy);
    const tm = theme.menu;

    const shadow = this.add.rectangle(4, 6, w, h, 0x000000, 0.35);
    container.add(shadow);

    const bg = this.add.rectangle(0, 0, w, h, tm.cardBg, 0.97);
    bg.setStrokeStyle(2, tm.cardBorder);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const symbolKey = faction === 'allies' ? TEXTURE.emblemAllies : TEXTURE.emblemAxis;
    const symbol = this.add.image(0, -8, symbolKey);
    symbol.setDisplaySize(72, 72);
    container.add(symbol);

    const head = this.add.text(0, 38, title, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '15px',
      color: `#${tm.goldBright.toString(16).padStart(6, '0')}`,
    });
    head.setOrigin(0.5, 0);
    container.add(head);

    const sub = this.add.text(0, 58, blurb, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: `#${tm.subtitle.toString(16).padStart(6, '0')}`,
      align: 'center',
      wordWrap: { width: w * 0.5 },
    });
    sub.setOrigin(0.5, 0);
    container.add(sub);

    const accent = theme.faction[faction];
    const band = this.add.rectangle(-w / 2 + 3, 0, 5, h - 12, accent, 0.9);
    band.setOrigin(0, 0.5);
    container.add(band);

    bg.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.04, duration: 140 });
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 140 });
    });
    bg.on('pointerdown', () => {
      this.menuSelected = faction;
      this.refreshCardFrames();
    });

    return container;
  }

  private refreshCardFrames(): void {
    const tm = theme.menu;
    const setStroke = (c: Phaser.GameObjects.Container, f: Faction) => {
      const bg = c.list[1] as Phaser.GameObjects.Rectangle;
      const on = this.menuSelected === f;
      bg.setStrokeStyle(on ? 3 : 2, on ? tm.cardBorderActive : tm.cardBorder);
      if (on) bg.setFillStyle(0x142438, 0.98);
      else bg.setFillStyle(tm.cardBg, 0.97);
    };
    setStroke(this.cardAllies, 'allies');
    setStroke(this.cardAxis, 'axis');

    const startBg = this.btnStart.list[0] as Phaser.GameObjects.Rectangle;
    startBg.setAlpha(this.menuSelected ? 1 : 0.55);

    if (this.menuSelected === 'allies' || this.menuSelected === 'axis') {
      const b = FACTION_BRIEFING[this.menuSelected];
      this.briefingText.setText([b.title, '', ...b.lines].join('\n'));
    } else {
      this.briefingText.setText('Wähle eine Fraktion für das Lagebild.');
    }
  }

  private makeGoldButton(cx: number, cy: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const tm = theme.menu;
    const w = Math.min(340, this.scale.width * 0.3);
    const h = 42;
    const container = this.add.container(cx, cy);
    const bg = this.add.rectangle(0, 0, w, h, 0x101c2c, 0.95);
    bg.setStrokeStyle(2, tm.gold);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      letterSpacing: 3,
      color: `#${tm.goldBright.toString(16).padStart(6, '0')}`,
    });
    txt.setOrigin(0.5);
    container.add(txt);

    bg.on('pointerover', () => {
      bg.setStrokeStyle(2, tm.goldBright);
      bg.setFillStyle(0x182a40, 0.98);
    });
    bg.on('pointerout', () => {
      bg.setStrokeStyle(2, tm.gold);
      bg.setFillStyle(0x101c2c, 0.95);
    });
    bg.on('pointerdown', onClick);
    return container;
  }

  private showToast(msg: string): void {
    this.toast?.destroy(true);
    const { width, height } = this.scale;
    const wrap = this.add.container(width * 0.62, height * 0.48);
    const g = this.add.graphics();
    g.fillStyle(0x0a1018, 0.94);
    g.lineStyle(2, theme.menu.gold, 0.85);
    const bw = Math.min(380, width * 0.34);
    const bh = 56;
    g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
    g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 8);
    wrap.add(g);
    const t = this.add.text(0, 0, msg, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#d8e1ec',
      align: 'center',
      wordWrap: { width: bw - 24 },
    });
    t.setOrigin(0.5);
    wrap.add(t);
    this.toast = wrap;
    this.time.delayedCall(2400, () => {
      wrap.destroy(true);
      if (this.toast === wrap) this.toast = undefined;
    });
  }

  private lengthLabel(): string {
    return this.introLengthMode === 'kurz' ? '20 Sek' : this.introLengthMode === 'lang' ? '45 Sek' : '30 Sek';
  }

  private qualityLabel(): string {
    return this.introQualityMode === 'normal'
      ? 'Normal'
      : this.introQualityMode === 'extrem'
        ? 'Extrem'
        : 'Hoch';
  }

  private autoIntroLabel(): string {
    return this.alwaysSkipIntro ? 'Aus' : 'An';
  }

  private updateOptionTexts(): void {
    if (this.optionLengthText) this.optionLengthText.setText(`Länge: ${this.lengthLabel()}`);
    if (this.optionQualityText) this.optionQualityText.setText(`Effekte: ${this.qualityLabel()}`);
    if (this.optionAutoText) this.optionAutoText.setText(`Auto-Intro: ${this.autoIntroLabel()}`);
    if (this.optionPreviewText) {
      this.optionPreviewText.setText(
        `Aktiv: ${this.lengthLabel()} · ${this.qualityLabel()} · Auto ${this.autoIntroLabel()}`,
      );
    }
  }

  private createOptionsPanel(cx: number, cy: number): Phaser.GameObjects.Container {
    const panel = this.add.container(cx, cy);
    const w = Math.min(420, this.scale.width * 0.34);
    const h = 198;
    const bg = this.add.rectangle(0, 0, w, h, 0x0b1422, 0.95);
    bg.setStrokeStyle(2, theme.menu.gold, 0.75);
    panel.add(bg);

    const title = this.add.text(0, -54, 'INTRO OPTIONEN', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '13px',
      color: '#e6bf6a',
      letterSpacing: 4,
    });
    title.setOrigin(0.5);
    panel.add(title);

    this.optionPreviewText = this.add.text(0, -32, '', {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: '11px',
      color: '#b8c8dc',
      align: 'center',
    });
    this.optionPreviewText.setOrigin(0.5);
    panel.add(this.optionPreviewText);

    const rowY = [-18, 18, 54] as const;
    const makeRow = (labelY: number, buttonLabel: string, onClick: () => void): Phaser.GameObjects.Text => {
      const b = this.add.rectangle(110, labelY, 180, 28, 0x16283d, 0.95);
      b.setStrokeStyle(1, theme.menu.gold, 0.6);
      b.setInteractive({ useHandCursor: true });
      b.on('pointerover', () => b.setFillStyle(0x1d3552, 0.98));
      b.on('pointerout', () => b.setFillStyle(0x16283d, 0.95));
      b.on('pointerdown', onClick);
      panel.add(b);
      const bt = this.add.text(110, labelY, buttonLabel, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#f0e0b0',
        letterSpacing: 2,
      });
      bt.setOrigin(0.5);
      panel.add(bt);
      const lt = this.add.text(-150, labelY, '', {
        fontFamily: 'Source Sans 3, system-ui, sans-serif',
        fontSize: '12px',
        color: '#d8e1ec',
      });
      lt.setOrigin(0, 0.5);
      panel.add(lt);
      return lt;
    };

    this.optionLengthText = makeRow(rowY[0], 'WECHSELN', () => {
      this.introLengthMode =
        this.introLengthMode === 'kurz'
          ? 'standard'
          : this.introLengthMode === 'standard'
            ? 'lang'
            : 'kurz';
      setIntroLengthMode(this.introLengthMode);
      this.updateOptionTexts();
    });

    this.optionQualityText = makeRow(rowY[1], 'WECHSELN', () => {
      this.introQualityMode =
        this.introQualityMode === 'normal'
          ? 'hoch'
          : this.introQualityMode === 'hoch'
            ? 'extrem'
            : 'normal';
      setIntroQualityMode(this.introQualityMode);
      this.updateOptionTexts();
    });

    this.optionAutoText = makeRow(rowY[2], 'UMSCHALTEN', () => {
      this.alwaysSkipIntro = !this.alwaysSkipIntro;
      setAlwaysSkipIntro(this.alwaysSkipIntro);
      this.updateOptionTexts();
      this.showToast(this.alwaysSkipIntro ? 'Auto-Intro aus (direkt Menü).' : 'Auto-Intro an.');
    });

    const testBtn = this.add.rectangle(0, 84, 250, 30, 0x1c3048, 0.96);
    testBtn.setStrokeStyle(1, theme.menu.gold, 0.7);
    testBtn.setInteractive({ useHandCursor: true });
    testBtn.on('pointerover', () => testBtn.setFillStyle(0x274665, 0.98));
    testBtn.on('pointerout', () => testBtn.setFillStyle(0x1c3048, 0.96));
    testBtn.on('pointerdown', () => {
      try {
        sessionStorage.removeItem('ef1944_intro_skip');
      } catch {
        /* ignore */
      }
      document.body.classList.remove('in-menu');
      this.scene.start('IntroScene');
    });
    panel.add(testBtn);

    const testTxt = this.add.text(0, 84, 'JETZT INTRO TESTEN', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#f0e0b0',
      letterSpacing: 2,
    });
    testTxt.setOrigin(0.5);
    panel.add(testTxt);

    this.updateOptionTexts();
    return panel;
  }

  private toggleOptionsPanel(): void {
    if (!this.optionPanel) return;
    const show = !this.optionPanel.visible;
    this.optionPanel.setVisible(true);
    this.optionPanel.setAlpha(show ? 0 : 1);
    this.tweens.add({
      targets: this.optionPanel,
      alpha: show ? 1 : 0,
      duration: 180,
      onComplete: () => {
        if (!show) this.optionPanel?.setVisible(false);
      },
    });
    setIntroLengthMode(this.introLengthMode);
    setIntroQualityMode(this.introQualityMode);
    setAlwaysSkipIntro(this.alwaysSkipIntro);
    this.updateOptionTexts();
  }
}
