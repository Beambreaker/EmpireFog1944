import type { LogEntry } from '../core/types';

/**
 * Renders the bottom-centre log panel. It listens to GameState.onLog and
 * appends new entries. Older entries scroll out of view but stay in the DOM
 * up to a small cap.
 */
export class LogPanel {
  private readonly container: HTMLElement;

  constructor() {
    const el = document.getElementById('log-content');
    if (!el) throw new Error('log-content element missing');
    this.container = el;
    this.clear();
  }

  clear(): void {
    this.container.innerHTML = '';
  }

  push(entry: LogEntry): void {
    const div = document.createElement('div');
    div.className = `log-entry ${entry.kind}`;
    const factionSlug = entry.faction === 'allies' ? '🟦' : entry.faction === 'axis' ? '⚙' : '·';
    div.textContent = `R${entry.turn} ${factionSlug} ${entry.message}`;
    this.container.appendChild(div);

    while (this.container.children.length > 80) {
      this.container.removeChild(this.container.firstChild as Node);
    }
    this.container.scrollTop = this.container.scrollHeight;
  }
}
