import type { CampaignMission } from '../narrative/missions';

/**
 * Vollbild-Briefing zwischen Runden (DOM, Deutsch).
 */
export class BriefingOverlay {
  private readonly root: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly bodyEl: HTMLElement;
  private readonly objEl: HTMLElement;
  private readonly btn: HTMLButtonElement;
  private resolve: (() => void) | null = null;

  constructor() {
    this.root = document.createElement('div');
    this.root.id = 'briefing-overlay';
    this.root.className = 'briefing-overlay hidden';
    this.root.innerHTML = `
      <div class="briefing-card">
        <p class="briefing-kicker">Oberkommando — Lagebesprechung</p>
        <h2 id="briefing-title"></h2>
        <div id="briefing-body" class="briefing-body"></div>
        <h3 class="briefing-objectives-head">Ziele</h3>
        <ul id="briefing-objectives" class="briefing-objectives"></ul>
        <button type="button" class="btn btn-primary briefing-continue">Weiter</button>
      </div>
    `;
    document.getElementById('app')?.appendChild(this.root);
    this.titleEl = this.must('briefing-title');
    this.bodyEl = this.must('briefing-body');
    this.objEl = this.must('briefing-objectives');
    this.btn = this.root.querySelector('.briefing-continue') as HTMLButtonElement;
    this.btn.addEventListener('click', () => this.dismiss());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.dismiss();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!this.root.classList.contains('hidden')) {
          e.preventDefault();
          this.dismiss();
        }
      }
    });
  }

  private must(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`BriefingOverlay: #${id} fehlt`);
    return el;
  }

  show(mission: CampaignMission): Promise<void> {
    this.titleEl.textContent = mission.title;
    this.bodyEl.innerHTML = mission.briefing.map((p) => `<p>${p}</p>`).join('');
    this.objEl.innerHTML = mission.objectives.map((o) => `<li>${o}</li>`).join('');
    this.root.classList.remove('hidden');
    document.body.classList.add('briefing-open');
    return new Promise((res) => {
      this.resolve = res;
    });
  }

  private dismiss(): void {
    if (this.root.classList.contains('hidden')) return;
    this.root.classList.add('hidden');
    document.body.classList.remove('briefing-open');
    this.resolve?.();
    this.resolve = null;
  }
}
