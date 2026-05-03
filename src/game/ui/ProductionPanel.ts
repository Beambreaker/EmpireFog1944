import type { City, UnitTypeId, Faction } from '../core/types';
import { UNIT_TYPES } from '../units/UnitTypes';
import { buildableUnits, effectiveProductionTurns } from '../cities/City';
import { FACTION_NAME } from '../core/constants';

/**
 * Right-side panel: city information & production menu.
 *
 * Only enabled (clickable) when the city is owned by the player faction.
 * Player picks a unit type to start producing — the order replaces any
 * previous one.
 */
export class ProductionPanel {
  private container: HTMLElement;
  private onPick: (unitTypeId: UnitTypeId) => void;

  constructor(onPick: (unitTypeId: UnitTypeId) => void) {
    const el = document.getElementById('city-details');
    if (!el) throw new Error('city-details element missing');
    this.container = el;
    this.onPick = onPick;
    this.clear();
  }

  clear(): void {
    this.container.innerHTML = '<p class="panel-empty">Keine Stadt ausgewählt.</p>';
  }

  show(city: City | null, playerFaction: Faction): void {
    if (!city) {
      this.clear();
      return;
    }
    const allowed = buildableUnits(city);
    const owned = city.faction === playerFaction;
    const factionLabel = FACTION_NAME[city.faction];
    const traits = [
      city.hasFactory ? '<span style="color:var(--color-gold-bright)">Fabrik</span>' : '',
      city.hasPort ? '<span style="color:#7aa6d8">Hafen</span>' : '',
      city.hasAirfield ? '<span style="color:#d8a87a">Flugplatz</span>' : '',
    ].filter(Boolean).join(' · ') || '<span style="color:var(--color-text-muted)">keine Einrichtungen</span>';

    let prodHtml = '';
    if (city.production) {
      const def = UNIT_TYPES[city.production.unitTypeId];
      const pct = ((city.production.turnsTotal - city.production.turnsRemaining) / city.production.turnsTotal) * 100;
      prodHtml = `
        <div class="production-current">
          <div class="label">Aktuell in Produktion</div>
          <div class="name">${def.name}</div>
          <div style="font-size:11px;color:var(--color-text-muted)">noch ${city.production.turnsRemaining}/${city.production.turnsTotal} Runden</div>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct.toFixed(0)}%"></div></div>
        </div>
      `;
    }

    let listHtml = '';
    if (owned) {
      listHtml = '<div class="production-list">';
      for (const id of allowed) {
        const def = UNIT_TYPES[id];
        const turns = effectiveProductionTurns(city, id);
        listHtml += `
          <div class="production-item" data-unit="${id}">
            <span>${def.name}</span>
            <span class="turns">${turns} Rd.</span>
          </div>
        `;
      }
      listHtml += '</div>';
    } else {
      listHtml = `<p class="panel-empty">Stadt im Besitz: ${factionLabel}</p>`;
    }

    this.container.innerHTML = `
      <div class="city-name">${city.name}</div>
      <div class="city-meta">${factionLabel.toUpperCase()}</div>
      <div class="city-meta" style="margin-bottom:14px">${traits}</div>
      ${prodHtml}
      ${listHtml}
    `;

    if (owned) {
      this.container.querySelectorAll<HTMLElement>('.production-item').forEach((el) => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-unit') as UnitTypeId | null;
          if (id) this.onPick(id);
        });
      });
    }
  }
}
