/**
 * Legendary-tier SVG asset pack for Empire Fog 1944.
 * Run: node scripts/generate-premium-assets.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'EmpireFog1944_AssetPack', 'runtime');

const P = {
  navyDeep: '#060a12',
  navy: '#0e1e32',
  navyLight: '#1a3350',
  gold: '#c9a44a',
  goldBright: '#f0e0b0',
  parchment: '#f5ecd8',
  allies: '#3a78c8',
  axis: '#6a7280',
  land: '#6b9a5a',
  landDark: '#3d5c34',
  air: '#8ec8ff',
  sea: '#4a9aaa',
  seaDeep: '#0e2842',
  sub: '#3d5a72',
  roof: '#b84a38',
  stone: '#7a7265',
  shadow: 'rgba(0,0,0,0.45)',
};

function defs(id, extra = '') {
  return `<defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a3050"/><stop offset="100%" stop-color="${P.navyDeep}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
    ${extra}
  </defs>`;
}

function terrain256(inner, gradStops) {
  const g = gradStops
    ? `<linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">${gradStops}</linearGradient>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>${g}<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="t"/>
  <feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" in2="t" mode="multiply" opacity="0.08"/></filter></defs>
  <rect width="256" height="256" fill="${gradStops ? 'url(#tg)' : P.navy}"/>
  ${inner}
  <rect width="256" height="256" fill="url(#tglow)" opacity="0.35" style="mix-blend-mode:overlay"/>
  </svg>`.replace('url(#tglow)', '').replace(
    '<rect width="256" height="256" fill="url(#tglow)"',
    `<radialGradient id="tglow" cx="30%" cy="20%" r="80%"><stop offset="0%" stop-color="#fff" stop-opacity="0.1"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient><rect width="256" height="256" fill="url(#tglow)"`,
  );
}

function unit96(inner, accent, band = accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  ${defs('u')}
  <rect width="96" height="96" rx="10" fill="#121a26"/>
  <rect x="3" y="3" width="90" height="90" rx="8" fill="#1a2638" stroke="${P.gold}" stroke-width="2"/>
  <rect x="6" y="6" width="84" height="14" rx="3" fill="${band}" fill-opacity="0.35"/>
  <ellipse cx="48" cy="82" rx="28" ry="6" fill="#000" opacity="0.35"/>
  ${inner}
  <rect x="6" y="6" width="84" height="84" rx="8" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.6"/>
</svg>`;
}

function writeCategory(base, files) {
  mkdirSync(base, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(base, `${name}.svg`), content.trim() + '\n', 'utf8');
  }
}

// --- Terrain 256 ---
const terrain = {
  water: terrain256(
    `<rect fill="${P.seaDeep}" width="256" height="256"/>
     <path d="M0 140 Q64 120 128 140 T256 130 V256 H0Z" fill="${P.sea}" opacity="0.7"/>
     <path d="M0 160 Q80 145 160 165 T256 155 V256 H0Z" fill="#1a5a68" opacity="0.5"/>
     <ellipse cx="80" cy="200" rx="40" ry="8" fill="#fff" opacity="0.06"/>
     <ellipse cx="180" cy="180" rx="50" ry="10" fill="#fff" opacity="0.05"/>`,
    `<stop offset="0%" stop-color="#143050"/><stop offset="100%" stop-color="${P.seaDeep}"/>`,
  ),
  'water-shallow': terrain256(
    `<rect fill="#1a5a68" width="256" height="256"/>
     <rect y="200" width="256" height="56" fill="#d4c4a0" opacity="0.75"/>
     <path d="M0 200 Q128 185 256 205" stroke="#fff" stroke-opacity="0.15" fill="none" stroke-width="3"/>`,
    `<stop offset="0%" stop-color="#2a7080"/><stop offset="100%" stop-color="#1a5060"/>`,
  ),
  coast: terrain256(
    `<rect fill="${P.land}" width="256" height="256"/>
     <rect y="0" width="256" height="72" fill="${P.seaDeep}"/>
     <rect y="64" width="256" height="16" fill="#d4c4a0"/>
     <path d="M0 72 Q64 58 128 72 T256 68 V88 H0Z" fill="#c9b080" opacity="0.6"/>`,
    `<stop offset="0%" stop-color="#5a8048"/><stop offset="100%" stop-color="#4a6838"/>`,
  ),
  plain: terrain256(
    `<rect fill="#5a7448" width="256" height="256"/>
     <ellipse cx="70" cy="90" rx="45" ry="22" fill="#000" opacity="0.06"/>
     <ellipse cx="190" cy="170" rx="55" ry="28" fill="#000" opacity="0.05"/>
     <circle cx="120" cy="140" r="3" fill="#6a8a58" opacity="0.5"/>
     <circle cx="145" cy="155" r="2" fill="#6a8a58" opacity="0.4"/>`,
    `<stop offset="0%" stop-color="#6a8a58"/><stop offset="100%" stop-color="#4a6238"/>`,
  ),
  forest: terrain256(
    `<rect fill="${P.landDark}" width="256" height="256"/>
     <polygon points="48,200 32,170 64,170" fill="#2a4024"/><polygon points="96,210 78,175 114,175" fill="#324a2c"/>
     <polygon points="150,195 130,160 170,160" fill="#2a4024"/><polygon points="200,205 182,168 218,168" fill="#3a5234"/>
     <polygon points="70,140 54,108 86,108" fill="#3d5530" opacity="0.9"/>`,
    `<stop offset="0%" stop-color="#3a5234"/><stop offset="100%" stop-color="#243020"/>`,
  ),
  mountain: terrain256(
    `<rect fill="#5a5448" width="256" height="256"/>
     <polygon points="128,40 40,220 216,220" fill="#7a7268"/>
     <polygon points="128,55 75,175 181,175" fill="#e8e4dc" opacity="0.35"/>
     <polygon points="180,120 150,200 210,200" fill="#6a6258" opacity="0.8"/>`,
    `<stop offset="0%" stop-color="#6a6458"/><stop offset="100%" stop-color="#4a4438"/>`,
  ),
  desert: terrain256(
    `<rect fill="#d0b080" width="256" height="256"/>
     <ellipse cx="80" cy="100" rx="35" ry="18" fill="#e8d0a8" opacity="0.5"/>
     <ellipse cx="170" cy="160" rx="45" ry="22" fill="#c4a070" opacity="0.4"/>`,
    `<stop offset="0%" stop-color="#e0c898"/><stop offset="100%" stop-color="#b89868"/>`,
  ),
  marsh: terrain256(
    `<rect fill="#3c4a42" width="256" height="256"/>
     <ellipse cx="100" cy="120" rx="70" ry="40" fill="#2a3830" opacity="0.65"/>
     <ellipse cx="170" cy="170" rx="50" ry="30" fill="#344840" opacity="0.5"/>`,
    `<stop offset="0%" stop-color="#445850"/><stop offset="100%" stop-color="#2c3830"/>`,
  ),
  road: terrain256(
    `<rect fill="#6a6558" width="256" height="256"/>
     <rect x="32" y="108" width="192" height="40" fill="#8a8478" rx="4"/>
     <rect x="108" y="32" width="40" height="192" fill="#8a8478" rx="4"/>
     <line x1="48" y1="128" x2="208" y2="128" stroke="${P.gold}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="12 8"/>
     <line x1="128" y1="48" x2="128" y2="208" stroke="${P.gold}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="12 8"/>`,
    `<stop offset="0%" stop-color="#7a7568"/><stop offset="100%" stop-color="#5a5548"/>`,
  ),
  hills: terrain256(
    `<rect fill="#5a7448" width="256" height="256"/>
     <ellipse cx="90" cy="150" rx="75" ry="35" fill="#6a8a58" opacity="0.75"/>
     <ellipse cx="175" cy="110" rx="60" ry="30" fill="#5a8050" opacity="0.65"/>`,
    `<stop offset="0%" stop-color="#6a8a58"/><stop offset="100%" stop-color="#4a6838"/>`,
  ),
};

const cities = {
  village: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#5a5348"/>
    <rect x="48" y="150" width="36" height="40" fill="#6a5a48"/><polygon points="48,150 66,118 84,150" fill="${P.roof}"/>
    <rect x="110" y="140" width="40" height="50" fill="#6a5a48"/><polygon points="110,140 130,100 150,140" fill="${P.roof}"/>
    <rect x="175" y="155" width="32" height="35" fill="#6a5a48"/><polygon points="175,155 191,125 207,155" fill="${P.roof}"/>
  </svg>`,
  town: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#5a5348"/>
    <rect x="24" y="120" width="208" height="100" fill="#4a5048" opacity="0.35"/>
    <rect x="40" y="130" width="44" height="50" fill="#6a5a48"/><polygon points="40,130 62,88 84,130" fill="${P.roof}"/>
    <rect x="100" y="115" width="56" height="65" fill="#6a5a48"/><polygon points="100,115 128,65 156,115" fill="${P.roof}"/>
    <rect x="175" y="135" width="40" height="45" fill="#6a5a48"/><polygon points="175,135 195,95 215,135" fill="${P.roof}"/>
  </svg>`,
  capital: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#5a5348"/>
    <rect x="28" y="28" width="200" height="200" fill="none" stroke="${P.stone}" stroke-width="6"/>
    <rect x="48" y="48" width="160" height="160" fill="#4a5048" opacity="0.25"/>
    <rect x="60" y="120" width="50" height="55" fill="#6a5a48"/><polygon points="60,120 85,70 110,120" fill="${P.roof}"/>
    <rect x="130" y="100" width="70" height="75" fill="#6a5a48"/><polygon points="130,100 165,45 200,100" fill="${P.roof}"/>
    <rect x="155" y="55" width="12" height="30" fill="#2a2824"/><circle cx="161" cy="48" r="8" fill="#3a3836" opacity="0.6"/>
  </svg>`,
  port: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#4a5560"/>
    <rect x="0" y="140" width="160" height="90" fill="${P.seaDeep}" opacity="0.85"/>
    <rect x="0" y="130" width="150" height="14" fill="#4a4034"/>
    <rect x="120" y="130" width="50" height="60" fill="#6a5a48"/><polygon points="120,130 145,95 170,130" fill="${P.roof}"/>
  </svg>`,
  airfield: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#4a5048"/>
    <rect x="24" y="90" width="208" height="76" fill="#3a4238" rx="4"/>
    <line x1="32" y1="128" x2="224" y2="128" stroke="#e8ece4" stroke-width="4"/>
    <line x1="128" y1="98" x2="128" y2="158" stroke="#e8ece4" stroke-width="4"/>
    <circle cx="200" cy="70" r="16" fill="#8899aa"/><line x1="200" y1="70" x2="200" y2="40" stroke="#556677" stroke-width="3"/>
  </svg>`,
  factory: `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#5a5348"/>
    <rect x="70" y="90" width="116" height="100" fill="#6a5a48"/>
    <rect x="105" y="50" width="20" height="50" fill="#2a2824"/>
    <circle cx="115" cy="42" r="14" fill="#4a4844" opacity="0.7"/><circle cx="108" cy="35" r="8" fill="#5a5854" opacity="0.5"/>
  </svg>`,
  'fortified-outpost': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#5a5348"/>
    <rect x="40" y="40" width="176" height="176" fill="none" stroke="${P.stone}" stroke-width="8"/>
    <rect x="90" y="90" width="76" height="76" fill="#6a5a48"/>
  </svg>`,
  'radar-station': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#4a5048"/>
    <line x1="128" y1="200" x2="128" y2="70" stroke="#8899aa" stroke-width="5"/>
    <circle cx="128" cy="70" r="36" fill="none" stroke="${P.air}" stroke-width="3" opacity="0.85"/>
    <path d="M128 34 L148 70 L108 70 Z" fill="${P.air}" opacity="0.25"/>
  </svg>`,
};

const units = {
  infantry: unit96(
    `<rect x="30" y="32" width="36" height="36" rx="4" fill="${P.land}" stroke="${P.parchment}" stroke-width="2"/>
     <path d="M38 40 L58 60 M58 40 L38 60" stroke="${P.parchment}" stroke-width="3" stroke-linecap="round"/>`,
    P.land,
  ),
  'special-forces': unit96(
    `<circle cx="48" cy="48" r="22" fill="none" stroke="${P.parchment}" stroke-width="2.5"/>
     <path d="M34 34 L62 62 M62 34 L34 62" stroke="${P.land}" stroke-width="3" stroke-linecap="round"/>`,
    P.land,
  ),
  tank: unit96(
    `<rect x="18" y="48" width="60" height="22" rx="4" fill="${P.parchment}" stroke="${P.land}" stroke-width="2"/>
     <rect x="34" y="28" width="28" height="22" rx="3" fill="${P.parchment}" stroke="${P.land}" stroke-width="2"/>
     <rect x="68" y="52" width="14" height="6" fill="${P.land}"/>`,
    P.land,
  ),
  'flak-radar': unit96(
    `<circle cx="48" cy="50" r="22" fill="none" stroke="${P.parchment}" stroke-width="2"/>
     <path d="M26 50 H70 M48 28 V72" stroke="${P.land}" stroke-width="2.5"/>
     <line x1="48" y1="18" x2="48" y2="8" stroke="${P.parchment}" stroke-width="2"/>
     <circle cx="48" cy="50" r="6" fill="${P.land}"/>`,
    P.land,
  ),
  fighter: unit96(
    `<path d="M48 18 L72 52 L48 44 L24 52 Z" fill="${P.parchment}" stroke="${P.air}" stroke-width="2" stroke-linejoin="round"/>`,
    P.air,
  ),
  'dive-bomber': unit96(
    `<path d="M48 14 L76 58 L48 46 L20 58 Z" fill="${P.parchment}" stroke="${P.air}" stroke-width="2"/>
     <circle cx="48" cy="66" r="6" fill="#c14040" stroke="${P.parchment}" stroke-width="1"/>`,
    P.air,
  ),
  transport: unit96(
    `<ellipse cx="48" cy="50" rx="34" ry="14" fill="${P.parchment}" stroke="${P.air}" stroke-width="2"/>
     <rect x="36" y="36" width="24" height="12" rx="2" fill="${P.air}" opacity="0.4"/>`,
    P.air,
  ),
  destroyer: unit96(
    `<path d="M18 58 L74 52 L64 36 L26 38 Z" fill="${P.parchment}" stroke="${P.sea}" stroke-width="2" stroke-linejoin="round"/>`,
    P.sea,
  ),
  carrier: unit96(
    `<rect x="14" y="48" width="68" height="20" rx="3" fill="${P.parchment}" stroke="${P.sea}" stroke-width="2"/>
     <rect x="30" y="30" width="36" height="18" fill="${P.parchment}" stroke="${P.sea}" stroke-width="2"/>`,
    P.sea,
  ),
  battleship: unit96(
    `<rect x="12" y="48" width="72" height="24" rx="3" fill="${P.parchment}" stroke="${P.sea}" stroke-width="2"/>
     <rect x="32" y="26" width="32" height="24" fill="${P.parchment}" stroke="${P.sea}" stroke-width="2"/>
     <rect x="62" y="42" width="10" height="14" fill="${P.sea}"/>`,
    P.sea,
  ),
  submarine: unit96(
    `<ellipse cx="48" cy="54" rx="36" ry="14" fill="#1a2830" stroke="${P.sub}" stroke-width="2.5"/>
     <rect x="42" y="28" width="12" height="22" fill="${P.sub}" opacity="0.9"/>`,
    P.sub,
  ),
};

const intro = {
  'intro-fog-layer': `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs><radialGradient id="f" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="#0a1018" stop-opacity="0"/>
    <stop offset="100%" stop-color="#020408" stop-opacity="0.95"/></radialGradient></defs>
    <rect width="1920" height="1080" fill="url(#f)"/>
    <g fill="#fff" fill-opacity="0.04">${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 137) % 1920;
      const y = (i * 89) % 1080;
      return `<circle cx="${x}" cy="${y}" r="${12 + (i % 8) * 4}"/>`;
    }).join('')}</g>
  </svg>`,
  'intro-map-silhouette': `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <ellipse cx="600" cy="420" rx="480" ry="280" fill="#1a3350" opacity="0.6"/>
    <ellipse cx="600" cy="400" rx="420" ry="240" fill="#243f63" opacity="0.5"/>
    <path d="M200 400 Q400 300 600 380 T1000 360" stroke="${P.gold}" stroke-opacity="0.2" fill="none" stroke-width="2"/>
  </svg>`,
  'logo-mark': `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <circle cx="200" cy="200" r="170" fill="#0e1e32" stroke="${P.gold}" stroke-width="6"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="${P.goldBright}" stroke-width="2" opacity="0.5"/>
    <text x="200" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="42" font-weight="bold" fill="${P.goldBright}">EF</text>
    <text x="200" y="255" text-anchor="middle" font-family="Georgia,serif" font-size="14" letter-spacing="8" fill="${P.parchment}" opacity="0.8">1944</text>
  </svg>`,
};

const ui = {
  'panel-frame': `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
    <rect width="320" height="200" rx="8" fill="#0c1826" fill-opacity="0.94" stroke="${P.gold}" stroke-width="2"/>
    <rect x="4" y="4" width="312" height="192" rx="6" fill="none" stroke="${P.goldBright}" stroke-width="1" opacity="0.25"/>
  </svg>`,
  'move-highlight': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${P.gold}" fill-opacity="0.22"/>
    <rect x="2" y="2" width="60" height="60" fill="none" stroke="${P.goldBright}" stroke-width="2" opacity="0.7"/>
  </svg>`,
  'fog-overlay': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#020408" fill-opacity="0.92"/>
    <circle cx="20" cy="24" r="2" fill="#fff" opacity="0.06"/><circle cx="44" cy="40" r="1.5" fill="#fff" opacity="0.05"/>
  </svg>`,
  'selection-ring': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="2" y="2" width="60" height="60" rx="6" fill="none" stroke="${P.goldBright}" stroke-width="3" stroke-dasharray="8 4"/>
  </svg>`,
};

const factions = {
  'emblem-allies': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="110" fill="#122438" stroke="#e8f0ff" stroke-width="6"/>
    <polygon points="128,48 148,98 202,102 162,138 174,192 128,162 82,192 94,138 54,102 108,98" fill="${P.allies}" stroke="#fff" stroke-width="4"/>
  </svg>`,
  'emblem-axis': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="110" fill="#1d232d" stroke="#e0e4ea" stroke-width="6"/>
    <rect x="112" y="56" width="32" height="144" rx="4" fill="${P.axis}"/>
    <rect x="56" y="112" width="144" height="32" rx="4" fill="${P.axis}"/>
    <rect x="100" y="100" width="56" height="56" rx="3" fill="#273140"/>
  </svg>`,
  'emblem-neutral': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="110" fill="#2a3340" stroke="#d8e1ec" stroke-width="6"/>
    <rect x="76" y="76" width="104" height="104" rx="8" fill="none" stroke="#8a9bb3" stroke-width="5"/>
  </svg>`,
};

writeCategory(join(ROOT, 'terrain'), terrain);
writeCategory(join(ROOT, 'cities'), cities);
writeCategory(join(ROOT, 'units', 'soldiers'), {
  infantry: units.infantry,
  'special-forces': units['special-forces'],
  tank: units.tank,
  'flak-radar': units['flak-radar'],
});
writeCategory(join(ROOT, 'units', 'aircraft'), {
  fighter: units.fighter,
  'dive-bomber': units['dive-bomber'],
  transport: units.transport,
});
writeCategory(join(ROOT, 'units', 'ships'), {
  destroyer: units.destroyer,
  carrier: units.carrier,
  battleship: units.battleship,
});
writeCategory(join(ROOT, 'units', 'submarines'), { submarine: units.submarine });
writeCategory(join(ROOT, 'intro'), intro);
writeCategory(join(ROOT, 'ui'), ui);
writeCategory(join(ROOT, 'factions'), factions);

const GENERATED_UI = join(__dirname, '..', 'src', 'assets', 'generated');
const uiGenerated = {
  'map-grain': `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#6c6148" fill-opacity="0.08"/>
  <g fill="#ffffff" fill-opacity="0.08">
    <circle cx="7" cy="11" r="1"/><circle cx="21" cy="9" r="1"/><circle cx="39" cy="15" r="1"/>
    <circle cx="58" cy="10" r="1"/><circle cx="72" cy="16" r="1"/><circle cx="90" cy="12" r="1"/>
    <circle cx="108" cy="9" r="1"/><circle cx="119" cy="18" r="1"/><circle cx="12" cy="29" r="1"/>
    <circle cx="31" cy="27" r="1"/><circle cx="47" cy="22" r="1"/><circle cx="67" cy="31" r="1"/>
    <circle cx="82" cy="25" r="1"/><circle cx="102" cy="29" r="1"/><circle cx="118" cy="26" r="1"/>
    <circle cx="5" cy="43" r="1"/><circle cx="24" cy="41" r="1"/><circle cx="40" cy="35" r="1"/>
    <circle cx="63" cy="44" r="1"/><circle cx="77" cy="39" r="1"/><circle cx="95" cy="35" r="1"/>
    <circle cx="110" cy="45" r="1"/><circle cx="122" cy="39" r="1"/><circle cx="14" cy="55" r="1"/>
    <circle cx="28" cy="61" r="1"/><circle cx="46" cy="52" r="1"/><circle cx="59" cy="58" r="1"/>
    <circle cx="73" cy="53" r="1"/><circle cx="88" cy="59" r="1"/><circle cx="103" cy="50" r="1"/>
    <circle cx="120" cy="57" r="1"/><circle cx="9" cy="72" r="1"/><circle cx="23" cy="68" r="1"/>
    <circle cx="37" cy="76" r="1"/><circle cx="54" cy="71" r="1"/><circle cx="68" cy="77" r="1"/>
    <circle cx="86" cy="70" r="1"/><circle cx="100" cy="75" r="1"/><circle cx="116" cy="69" r="1"/>
    <circle cx="6" cy="89" r="1"/><circle cx="20" cy="95" r="1"/><circle cx="36" cy="88" r="1"/>
    <circle cx="52" cy="94" r="1"/><circle cx="71" cy="86" r="1"/><circle cx="87" cy="92" r="1"/>
    <circle cx="106" cy="89" r="1"/><circle cx="121" cy="93" r="1"/><circle cx="10" cy="107" r="1"/>
    <circle cx="27" cy="112" r="1"/><circle cx="44" cy="104" r="1"/><circle cx="61" cy="111" r="1"/>
    <circle cx="79" cy="106" r="1"/><circle cx="94" cy="113" r="1"/><circle cx="111" cy="105" r="1"/>
    <circle cx="124" cy="110" r="1"/><circle cx="17" cy="123" r="1"/><circle cx="34" cy="120" r="1"/>
    <circle cx="50" cy="125" r="1"/><circle cx="66" cy="121" r="1"/><circle cx="84" cy="126" r="1"/>
    <circle cx="101" cy="121" r="1"/><circle cx="117" cy="124" r="1"/>
  </g>
  <g stroke="#000000" stroke-opacity="0.09" stroke-width="1">
    <path d="M0 14h128M0 49h128M0 83h128M0 116h128"/>
    <path d="M14 0v128M49 0v128M83 0v128M116 0v128"/>
  </g>
</svg>`,
  'fog-pattern': `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="#02050a" fill-opacity="0.22"/>
  <g stroke="#dce8f8" stroke-opacity="0.1" stroke-width="1">
    <path d="M-8 24l40-20M16 40l40-20M40 56l40-20M64 72l40-20"/>
    <path d="M-8 48l40-20M16 64l40-20M40 80l40-20M64 96l40-20"/>
    <path d="M-8 72l40-20M16 88l40-20"/>
  </g>
  <g fill="#ffffff" fill-opacity="0.08">
    <circle cx="12" cy="13" r="1.2"/><circle cx="39" cy="18" r="1.1"/><circle cx="66" cy="10" r="1.3"/>
    <circle cx="83" cy="21" r="1.1"/><circle cx="21" cy="42" r="1.2"/><circle cx="48" cy="37" r="1.1"/>
    <circle cx="75" cy="45" r="1.2"/><circle cx="9" cy="68" r="1.1"/><circle cx="34" cy="73" r="1.2"/>
    <circle cx="59" cy="64" r="1.1"/><circle cx="87" cy="71" r="1.2"/>
  </g>
</svg>`,
  'menu-hero-frame': `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#050810" stop-opacity="0.15"/>
      <stop offset="55%" stop-color="#050810" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#050810" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e6d4a0" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#c9a44a" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="#0a1628"/>
  <g stroke="#2a4560" stroke-opacity="0.35" stroke-width="1">
    <path d="M0 90h960M0 180h960M0 270h960M0 360h960M0 450h960"/>
    <path d="M80 0v540M160 0v540M240 0v540M320 0v540M400 0v540M480 0v540M560 0v540M640 0v540M720 0v540M800 0v540M880 0v540"/>
  </g>
  <ellipse cx="420" cy="300" rx="280" ry="160" fill="#1a3048" fill-opacity="0.45"/>
  <ellipse cx="420" cy="300" rx="220" ry="120" fill="#243f63" fill-opacity="0.35"/>
  <rect width="960" height="540" fill="url(#fade)"/>
  <rect x="32" y="32" width="4" height="72" fill="url(#gold)"/>
  <rect x="32" y="32" width="72" height="4" fill="url(#gold)"/>
</svg>`,
};
writeCategory(GENERATED_UI, uiGenerated);

// Legacy 64px paths for older keys - symlink via duplicate infantry in soldiers
writeFileSync(
  join(ROOT, '..', 'docs', 'ASSET_MANIFEST.json'),
  JSON.stringify(
    {
      version: '2.0.0-premium',
      project: 'Empire Fog 1944',
      generatedAt: new Date().toISOString(),
      sizes: { terrain: 256, units: 96, cities: 256 },
    },
    null,
    2,
  ) + '\n',
);

console.log('Premium asset pack generated at', ROOT);
