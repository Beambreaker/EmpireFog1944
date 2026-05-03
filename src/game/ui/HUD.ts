import type { Faction, Unit } from '../core/types';
import { UNIT_TYPES } from '../units/UnitTypes';
import { FACTION_NAME } from '../core/constants';

/**
 * Top bar + left "unit details" panel. Pure DOM; the StrategyScene calls
 * update functions whenever something changes.
 */
export class HUD {
  private elTurn: HTMLElement;
  private elFaction: HTMLElement;
  private btnEndTurn: HTMLButtonElement;
  private elUnit: HTMLElement;

  constructor(onEndTurn: () => void) {
    this.elTurn = this.must('hud-turn');
    this.elFaction = this.must('hud-faction');
    this.btnEndTurn = this.must('btn-end-turn') as HTMLButtonElement;
    this.elUnit = this.must('unit-details');

    this.btnEndTurn.addEventListener('click', () => onEndTurn());
  }

  private must(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el;
  }

  setTurnInfo(turn: number, activeFaction: Faction, isPlayer: boolean): void {
    this.elTurn.textContent = String(turn);
    this.elFaction.textContent = FACTION_NAME[activeFaction];
    this.elFaction.className =
      'hud-value ' + (activeFaction === 'allies' ? 'faction-allies' : 'faction-axis');
    this.btnEndTurn.disabled = !isPlayer;
    this.btnEndTurn.textContent = isPlayer ? 'Zug beenden' : 'Gegnerzug …';
  }

  showUnit(unit: Unit | null): void {
    if (!unit) {
      this.elUnit.innerHTML = '<p class="panel-empty">Keine Einheit ausgewählt.</p>';
      return;
    }
    const def = UNIT_TYPES[unit.typeId];
    const hpPct = Math.max(0, (unit.hp / def.hpMax) * 100);
    const hpClass = hpPct < 33 ? 'low' : hpPct < 66 ? 'med' : '';
    const factionLabel = FACTION_NAME[unit.faction];
    const domainLabel = ({
      land: 'Land',
      air: 'Luft',
      sea: 'See',
      subsea: 'Untersee',
    } as const)[def.domain];

    this.elUnit.innerHTML = `
      <div class="unit-name">${def.name}</div>
      <div class="unit-domain">${domainLabel} · ${factionLabel}</div>
      <div class="hp-bar"><div class="hp-bar-fill ${hpClass}" style="width:${hpPct.toFixed(0)}%"></div></div>
      <div class="stat-row"><span class="label">TP</span><span class="value">${unit.hp}/${def.hpMax}</span></div>
      <div class="stat-row"><span class="label">Bewegung</span><span class="value">${unit.movementLeft}/${def.movement}</span></div>
      <div class="stat-row"><span class="label">Angriff</span><span class="value">${def.attack}</span></div>
      <div class="stat-row"><span class="label">Verteidigung</span><span class="value">${def.defense}</span></div>
      <div class="stat-row"><span class="label">Sicht</span><span class="value">${def.sight}</span></div>
      <div class="stat-row"><span class="label">Reichweite</span><span class="value">${def.range}</span></div>
      ${def.notes ? `<div class="stat-row" style="margin-top:8px;color:var(--color-text-muted);font-style:italic;font-size:11px;">${def.notes}</div>` : ''}
    `;
  }
}
