/**
 * Zeigt aktuellen Kampagnen-Auftrag unter der oberen Leiste (Deutsch).
 */
export class MissionBanner {
  private readonly root: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly hintEl: HTMLElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'mission-banner';
    this.root.className = 'mission-banner';
    this.root.innerHTML = `
      <span class="mission-banner-label">Aktueller Auftrag</span>
      <span id="mission-banner-title" class="mission-banner-title"></span>
      <span id="mission-banner-hint" class="mission-banner-hint"></span>
    `;
    const hud = document.getElementById('hud-top');
    hud?.insertAdjacentElement('afterend', this.root);
    this.titleEl = document.getElementById('mission-banner-title')!;
    this.hintEl = document.getElementById('mission-banner-hint')!;
  }

  show(title: string, hint: string): void {
    this.titleEl.textContent = title;
    this.hintEl.textContent = hint;
    this.root.classList.toggle('hidden', !title);
  }
}
