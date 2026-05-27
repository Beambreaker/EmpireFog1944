import Phaser from 'phaser';
import type { Faction } from '../core/types';
import { theme } from '../core/theme';
import { TEXTURE } from '../rendering/assetCatalog';
import { CAMPAIGN_SUBTITLE, CAMPAIGN_TITLE, FACTION_BRIEFING } from '../narrative/campaign';

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

  constructor() {
    super('MenuScene');
  }

  create(): void {
    document.body.classList.add('in-menu');
    const { width, height } = this.scale;
    const tm = theme.menu;

    // --- Background stack ---------------------------------------------------
    const bg = this.add.graphics();
    bg.fillGradientStyle(tm.bgTop, tm.bgTop, tm.bgBottom, tm.bgBottom, 1);
    bg.fillRect(0, 0, width, height);

    const heroW = Math.min(width * 0.58, 1100);
    const hero = this.add.image(heroW * 0.5, height * 0.5, TEXTURE.refTerrain);
    hero.setDisplaySize(heroW, height);
    hero.setAlpha(0.72);
    hero.setTint(0x9eb8d8);

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

    this.briefingText = this.add.text(titleX, tagline.y + 32, 'Wähle eine Fraktion für das Lagebild.', {
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: '13px',
      color: '#b8c8dc',
      lineSpacing: 8,
      wordWrap: { width: Math.min(420, width * 0.38) },
    });

    const rule = this.add.graphics();
    rule.lineStyle(2, tm.gold, 0.85);
    rule.lineBetween(titleX, this.briefingText.y + this.briefingText.height + 16, titleX + 180, this.briefingText.y + this.briefingText.height + 16);
    rule.lineStyle(1, tm.grid, 0.5);
    rule.lineBetween(titleX, this.briefingText.y + this.briefingText.height + 20, titleX + 280, this.briefingText.y + this.briefingText.height + 20);

    // --- Faction column (right) ---------------------------------------------
    const colX = width * 0.62;
    const cardY1 = height * 0.34;
    const cardY2 = height * 0.62;

    const pickHead = this.add.text(colX, height * 0.2, 'FRAKTION WÄHLEN', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '14px',
      color: `#${tm.gold.toString(16).padStart(6, '0')}`,
      letterSpacing: 5,
    });
    pickHead.setOrigin(0.5, 0);

    this.cardAllies = this.makeFactionCard(colX, cardY1, 'allies', 'ALLIIERTE', 'Koalition · See- & Luftüberlegenheit');
    this.cardAxis = this.makeFactionCard(colX, cardY2, 'axis', 'ACHSENMÄCHTE', 'Offensive · Panzer & Industrie');

    // --- Actions ------------------------------------------------------------
    const btnX = colX;
    const btnY = height * 0.86;
    this.btnStart = this.makeGoldButton(btnX, btnY - 48, 'SPIEL STARTEN', () => {
      if (!this.menuSelected) {
        this.showToast('Bitte zuerst eine Fraktion wählen.');
        return;
      }
      document.body.classList.remove('in-menu');
      this.scene.stop('BootScene');
      this.scene.stop('MenuScene');
      this.scene.start('StrategyScene', { playerFaction: this.menuSelected });
    });
    this.makeGoldButton(btnX, btnY, 'OPTIONEN', () =>
      this.showToast('Optionen — noch nicht implementiert (v0.1).'),
    );
    this.makeGoldButton(btnX, btnY + 48, 'INTRO ERNEUT', () => {
      try {
        sessionStorage.removeItem('ef1944_intro_skip');
      } catch {
        /* ignore */
      }
      document.body.classList.remove('in-menu');
      this.scene.start('IntroScene');
    });
    this.makeGoldButton(btnX, btnY + 96, 'BEENDEN', () =>
      this.showToast('Tab oder Fenster schließen, um zu beenden.'),
    );

    const ver = this.add.text(width - 16, height - 12, 'v0.1 · Empire Fog 1944', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '10px',
      color: '#5e708a',
    });
    ver.setOrigin(1, 1);

    this.refreshCardFrames();
  }

  private makeFactionCard(
    cx: number,
    cy: number,
    faction: Faction,
    title: string,
    blurb: string,
  ): Phaser.GameObjects.Container {
    const w = Math.min(380, this.scale.width * 0.34);
    const h = 168;
    const container = this.add.container(cx, cy);
    const tm = theme.menu;

    const shadow = this.add.rectangle(4, 6, w, h, 0x000000, 0.35);
    container.add(shadow);

    const bg = this.add.rectangle(0, 0, w, h, tm.cardBg, 0.97);
    bg.setStrokeStyle(2, tm.cardBorder);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    // Preview strip (units reference — cropped feel via mask)
    const preview = this.add.image(-w * 0.22, -8, TEXTURE.refUnits);
    preview.setDisplaySize(w * 0.55, h * 0.95);
    preview.setAlpha(0.55);
    preview.setTint(faction === 'allies' ? 0xa8c8f0 : 0xb0b8c4);
    container.add(preview);

    const previewShade = this.add.rectangle(-w * 0.22, 0, w * 0.58, h, 0x0c1826, 0.55);
    container.add(previewShade);

    const symbolKey = faction === 'allies' ? TEXTURE.emblemAllies : TEXTURE.emblemAxis;
    const symbol = this.add.image(w * 0.28, -12, symbolKey);
    symbol.setDisplaySize(88, 88);
    container.add(symbol);

    const head = this.add.text(w * 0.28, 42, title, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '17px',
      color: `#${tm.goldBright.toString(16).padStart(6, '0')}`,
    });
    head.setOrigin(0.5, 0);
    container.add(head);

    const sub = this.add.text(w * 0.28, 68, blurb, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
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
      this.tweens.add({ targets: container, scale: 1.02, duration: 140 });
      preview.setAlpha(0.72);
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 140 });
      preview.setAlpha(0.55);
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
}
