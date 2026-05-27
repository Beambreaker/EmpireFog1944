import { theme } from '../core/theme';

/**
 * Pushes theme colours into CSS custom properties (DOM HUD / panels).
 * Call once at startup (see `main.ts`).
 */
export function applyUiThemeToDocument(): void {
  const r = document.documentElement;
  const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`;

  r.style.setProperty('--color-bg', hex(theme.menu.bgBottom));
  r.style.setProperty('--color-bg-2', hex(theme.menu.bgTop));
  r.style.setProperty('--color-panel', 'rgba(10, 20, 34, 0.94)');
  r.style.setProperty('--color-panel-glow', 'rgba(201, 164, 74, 0.12)');
  r.style.setProperty('--color-panel-border', hex(theme.menu.cardBorder));
  r.style.setProperty('--color-panel-border-strong', hex(theme.menu.grid));
  r.style.setProperty('--color-text', '#d8e1ec');
  r.style.setProperty('--color-text-dim', hex(theme.menu.subtitle));
  r.style.setProperty('--color-text-muted', '#5e708a');
  r.style.setProperty('--color-gold', hex(theme.menu.gold));
  r.style.setProperty('--color-gold-bright', hex(theme.menu.goldBright));
  r.style.setProperty('--color-blue-allies', theme.factionHex.allies);
  r.style.setProperty('--color-grey-axis', theme.factionHex.axis);
  r.style.setProperty('--color-danger', '#c14040');
  r.style.setProperty('--color-success', '#4a9a5e');
  r.style.setProperty('--color-shadow', 'rgba(0,0,0,0.55)');
}
