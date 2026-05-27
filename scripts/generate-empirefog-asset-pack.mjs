/**
 * Generates Empire Fog 1944 runtime SVG asset pack (neutral tactical style).
 * Run: node scripts/generate-empirefog-asset-pack.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'EmpireFog1944_AssetPack', 'runtime');

const C = {
  tokenBg: '#141a22',
  tokenEdge: '#c9a44a',
  symbol: '#f0e6d2',
  land: '#9fcf92',
  air: '#9ec7ff',
  sea: '#7fc9d6',
  sub: '#5f7e9f',
  allies: '#3a78c8',
  axis: '#6a7280',
  stroke: '#1a1510',
};

function wrap64(id, inner, accent = C.tokenEdge) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="7" fill="${C.tokenBg}" fill-opacity="0.92"/>
  <rect x="2.5" y="2.5" width="59" height="59" rx="6" fill="none" stroke="${accent}" stroke-width="2"/>
  <rect x="5" y="5" width="54" height="8" fill="${accent}" fill-opacity="0.22"/>
  ${inner}
</svg>`;
}

function wrap128(id, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  ${inner}
</svg>`;
}

const units = {
  soldiers: {
    infantry: wrap64(
      'infantry',
      `<rect x="20" y="20" width="24" height="24" rx="2" fill="${C.land}" stroke="${C.symbol}" stroke-width="1.5"/>
       <path d="M26 26 L38 38 M38 26 L26 38" stroke="${C.symbol}" stroke-width="2.5" stroke-linecap="round"/>`,
      C.land,
    ),
    'special-forces': wrap64(
      'special',
      `<circle cx="32" cy="32" r="16" fill="none" stroke="${C.symbol}" stroke-width="2"/>
       <path d="M22 22 L42 42 M42 22 L22 42" stroke="${C.land}" stroke-width="2.5" stroke-linecap="round"/>`,
      C.land,
    ),
    tank: wrap64(
      'tank',
      `<rect x="12" y="30" width="40" height="14" rx="3" fill="${C.symbol}" stroke="${C.land}" stroke-width="1.5"/>
       <rect x="24" y="18" width="16" height="14" rx="2" fill="${C.symbol}" stroke="${C.land}" stroke-width="1.5"/>
       <rect x="44" y="32" width="10" height="4" fill="${C.land}"/>`,
      C.land,
    ),
    'flak-radar': wrap64(
      'flak',
      `<circle cx="32" cy="34" r="14" fill="none" stroke="${C.symbol}" stroke-width="2"/>
       <path d="M18 34 H46 M32 20 V48" stroke="${C.land}" stroke-width="2"/>
       <circle cx="32" cy="34" r="4" fill="${C.land}"/>
       <line x1="32" y1="14" x2="32" y2="8" stroke="${C.symbol}" stroke-width="2"/>`,
      C.land,
    ),
    artillery: wrap64(
      'artillery',
      `<rect x="14" y="36" width="22" height="10" rx="2" fill="${C.symbol}" stroke="${C.land}" stroke-width="1.5"/>
       <rect x="36" y="32" width="16" height="6" fill="${C.land}"/>
       <path d="M36 35 L52 28" stroke="${C.symbol}" stroke-width="3" stroke-linecap="round"/>`,
      C.land,
    ),
    engineer: wrap64(
      'engineer',
      `<rect x="22" y="22" width="20" height="20" fill="${C.land}" opacity="0.9"/>
       <path d="M26 38 L38 26" stroke="${C.symbol}" stroke-width="2"/>
       <rect x="28" y="40" width="8" height="6" fill="${C.symbol}"/>`,
      C.land,
    ),
  },
  aircraft: {
    fighter: wrap64(
      'fighter',
      `<path d="M32 14 L48 38 L32 32 L16 38 Z" fill="${C.symbol}" stroke="${C.air}" stroke-width="1.5" stroke-linejoin="round"/>`,
      C.air,
    ),
    'dive-bomber': wrap64(
      'divebomber',
      `<path d="M32 12 L50 42 L32 34 L14 42 Z" fill="${C.symbol}" stroke="${C.air}" stroke-width="1.5"/>
       <circle cx="32" cy="46" r="4" fill="#c14040" stroke="${C.symbol}" stroke-width="1"/>`,
      C.air,
    ),
    transport: wrap64(
      'transport',
      `<ellipse cx="32" cy="34" rx="22" ry="8" fill="${C.symbol}" stroke="${C.air}" stroke-width="1.5"/>
       <rect x="26" y="26" width="12" height="6" fill="${C.air}" opacity="0.5"/>`,
      C.air,
    ),
    recon: wrap64(
      'recon',
      `<path d="M32 16 L44 36 L32 30 L20 36 Z" fill="${C.symbol}" stroke="${C.air}" stroke-width="1.5"/>
       <circle cx="32" cy="40" r="3" fill="${C.air}"/>`,
      C.air,
    ),
    'heavy-bomber': wrap64(
      'heavy-bomber',
      `<path d="M12 34 L52 34 L44 28 L20 28 Z" fill="${C.symbol}" stroke="${C.air}" stroke-width="1.5"/>
       <rect x="28" y="22" width="8" height="8" fill="${C.air}" opacity="0.6"/>`,
      C.air,
    ),
  },
  ships: {
    destroyer: wrap64(
      'destroyer',
      `<path d="M12 38 L50 34 L44 26 L18 28 Z" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5" stroke-linejoin="round"/>`,
      C.sea,
    ),
    carrier: wrap64(
      'carrier',
      `<rect x="10" y="30" width="44" height="12" rx="2" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>
       <rect x="22" y="20" width="20" height="10" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>`,
      C.sea,
    ),
    battleship: wrap64(
      'battleship',
      `<rect x="8" y="30" width="48" height="14" rx="2" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>
       <rect x="24" y="18" width="16" height="14" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>
       <rect x="40" y="26" width="6" height="8" fill="${C.sea}"/>`,
      C.sea,
    ),
    cruiser: wrap64(
      'cruiser',
      `<path d="M14 36 L48 33 L42 24 L20 26 Z" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>
       <rect x="30" y="20" width="6" height="8" fill="${C.sea}"/>`,
      C.sea,
    ),
    'patrol-boat': wrap64(
      'patrol',
      `<path d="M16 36 L48 34 L42 30 L20 32 Z" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>`,
      C.sea,
    ),
    'landing-ship': wrap64(
      'landing',
      `<rect x="12" y="28" width="40" height="16" rx="2" fill="${C.symbol}" stroke="${C.sea}" stroke-width="1.5"/>
       <path d="M12 44 L20 36 H44 L52 44" fill="none" stroke="${C.sea}" stroke-width="1.5"/>`,
      C.sea,
    ),
  },
  submarines: {
    submarine: wrap64(
      'sub',
      `<ellipse cx="32" cy="36" rx="24" ry="9" fill="#1a2830" stroke="${C.sub}" stroke-width="2"/>
       <rect x="28" y="22" width="8" height="10" fill="${C.sub}" opacity="0.8"/>`,
      C.sub,
    ),
    'submarine-surfaced': wrap64(
      'sub-surfaced',
      `<ellipse cx="32" cy="38" rx="22" ry="8" fill="#1a2830" stroke="${C.sub}" stroke-width="2"/>
       <rect x="30" y="18" width="4" height="14" fill="${C.symbol}"/>`,
      C.sub,
    ),
    'submarine-torpedo': wrap64(
      'sub-torp',
      `<ellipse cx="28" cy="36" rx="20" ry="8" fill="#1a2830" stroke="${C.sub}" stroke-width="2"/>
       <ellipse cx="50" cy="38" rx="6" ry="3" fill="${C.symbol}" stroke="${C.sub}" stroke-width="1"/>`,
      C.sub,
    ),
  },
};

const cities = {
  village: wrap128(`<rect width="128" height="128" fill="#5a5344"/>
    <rect x="36" y="72" width="20" height="18" fill="#6a5a48"/><polygon points="36,72 46,58 56,72" fill="#a84838"/>
    <rect x="72" y="68" width="16" height="14" fill="#6a5a48"/><polygon points="72,68 80,58 88,68" fill="#a84838"/>`),
  town: wrap128(`<rect width="128" height="128" fill="#5a5344"/>
    <rect x="24" y="64" width="80" height="40" fill="#4a5048" opacity="0.35"/>
    <rect x="28" y="70" width="18" height="16" fill="#6a5a48"/><rect x="54" y="66" width="22" height="20" fill="#6a5a48"/>
    <rect x="82" y="72" width="16" height="14" fill="#6a5a48"/>
    <polygon points="28,70 37,56 46,70" fill="#a84838"/><polygon points="54,66 65,50 76,66" fill="#a84838"/>`),
  capital: wrap128(`<rect width="128" height="128" fill="#5a5344"/>
    <rect x="16" y="16" width="96" height="96" fill="none" stroke="#7a7265" stroke-width="4"/>
    <rect x="32" y="58" width="64" height="44" fill="#4a5048" opacity="0.3"/>
    <rect x="36" y="62" width="20" height="18" fill="#6a5a48"/><rect x="62" y="58" width="28" height="24" fill="#6a5a48"/>
    <polygon points="62,58 76,38 90,58" fill="#a84838"/>`),
  port: wrap128(`<rect width="128" height="128" fill="#4a5560"/>
    <rect x="8" y="72" width="56" height="24" fill="#1a3048" opacity="0.7"/>
    <rect x="8" y="68" width="56" height="6" fill="#4a4034"/>
    <rect x="72" y="70" width="20" height="16" fill="#6a5a48"/>`),
  airfield: wrap128(`<rect width="128" height="128" fill="#4a5048"/>
    <rect x="16" y="52" width="96" height="28" fill="#3a4238"/>
    <line x1="20" y1="66" x2="108" y2="66" stroke="#c8d0c8" stroke-width="2"/>
    <circle cx="100" cy="40" r="8" fill="#8899aa"/><line x1="100" y1="40" x2="100" y2="24" stroke="#445566" stroke-width="2"/>`),
  factory: wrap128(`<rect width="128" height="128" fill="#5a5344"/>
    <rect x="44" y="48" width="40" height="36" fill="#6a5a48"/>
    <rect x="58" y="28" width="8" height="22" fill="#2a2824"/>
  <circle cx="62" cy="24" r="6" fill="#3a3836" opacity="0.7"/>`),
  'fortified-outpost': wrap128(`<rect width="128" height="128" fill="#5a5344"/>
    <rect x="20" y="20" width="88" height="88" fill="none" stroke="#7a7265" stroke-width="3"/>
    <rect x="48" y="48" width="32" height="28" fill="#6a5a48"/>`),
  'radar-station': wrap128(`<rect width="128" height="128" fill="#4a5048"/>
    <line x1="64" y1="88" x2="64" y2="36" stroke="#8899aa" stroke-width="3"/>
    <circle cx="64" cy="36" r="14" fill="none" stroke="#9ec7ff" stroke-width="2" opacity="0.8"/>`),
};

const terrain = {
  water: wrap128(`<rect width="128" height="128" fill="#0c2138"/>
    <path d="M0 72 Q32 64 64 72 T128 72 V128 H0Z" fill="#1a5a62" opacity="0.5"/>`),
  'water-shallow': wrap128(`<rect width="128" height="128" fill="#1a5a62"/>
    <rect y="96" width="128" height="20" fill="#c9b896" opacity="0.6"/>`),
  coast: wrap128(`<rect width="128" height="128" fill="#4d6236"/>
    <rect y="0" width="128" height="40" fill="#0c2138"/><rect y="36" width="128" height="8" fill="#c9b896"/>`),
  plain: wrap128(`<rect width="128" height="128" fill="#4d6236"/>
    <ellipse cx="40" cy="50" rx="18" ry="10" fill="#000" opacity="0.06"/>
    <ellipse cx="90" cy="80" rx="14" ry="8" fill="#000" opacity="0.06"/>`),
  forest: wrap128(`<rect width="128" height="128" fill="#2a3d24"/>
    <polygon points="32,100 24,88 40,88" fill="#1a2818"/><polygon points="64,100 56,84 72,84" fill="#1a2818"/>
    <polygon points="96,100 88,86 104,86" fill="#1a2818"/>`),
  mountain: wrap128(`<rect width="128" height="128" fill="#5c5648"/>
    <polygon points="64,20 20,110 108,110" fill="#6a6258"/>
    <polygon points="64,32 48,70 80,70" fill="#e8e4dc" opacity="0.35"/>`),
  desert: wrap128(`<rect width="128" height="128" fill="#c4a574"/>
    <ellipse cx="36" cy="40" rx="10" ry="6" fill="#d8b888" opacity="0.5"/>
    <ellipse cx="88" cy="72" rx="12" ry="7" fill="#d8b888" opacity="0.5"/>`),
  marsh: wrap128(`<rect width="128" height="128" fill="#344038"/>
    <ellipse cx="50" cy="60" rx="36" ry="20" fill="#2a3830" opacity="0.55"/>
    <ellipse cx="84" cy="84" rx="24" ry="14" fill="#2a3830" opacity="0.45"/>`),
  road: wrap128(`<rect width="128" height="128" fill="#6a6558"/>
    <rect x="16" y="58" width="96" height="12" fill="#d4c48a" opacity="0.85"/>
    <rect x="58" y="16" width="12" height="96" fill="#d4c48a" opacity="0.85"/>`),
  hills: wrap128(`<rect width="128" height="128" fill="#4d6236"/>
    <ellipse cx="48" cy="72" rx="28" ry="14" fill="#5a7440" opacity="0.7"/>
    <ellipse cx="88" cy="58" rx="22" ry="12" fill="#5a7440" opacity="0.6"/>`),
};

const factions = {
  'emblem-allies': `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="54" fill="#122438" stroke="#e3eaf4" stroke-width="4"/>
    <polygon points="64,24 74,52 104,54 82,72 90,102 64,86 38,102 46,72 24,54 54,52" fill="${C.allies}" stroke="#f5f9ff" stroke-width="3"/>
  </svg>`,
  'emblem-axis': `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="54" fill="#1d232d" stroke="#e0e4ea" stroke-width="4"/>
    <rect x="56" y="32" width="16" height="64" rx="2" fill="${C.axis}"/>
    <rect x="32" y="56" width="64" height="16" rx="2" fill="${C.axis}"/>
    <rect x="52" y="52" width="24" height="24" fill="#273140"/>
  </svg>`,
  'emblem-neutral': `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="54" fill="#2a3340" stroke="#d8e1ec" stroke-width="4"/>
    <rect x="44" y="44" width="40" height="40" rx="4" fill="none" stroke="#8a9bb3" stroke-width="4"/>
  </svg>`,
};

const ui = {
  'token-frame': wrap64('frame', `<rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="${C.symbol}" stroke-width="1" opacity="0.4"/>`),
  'selection-ring': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="2" y="2" width="60" height="60" rx="4" fill="none" stroke="${C.tokenEdge}" stroke-width="3" stroke-dasharray="6 4"/>
  </svg>`,
  'hp-bar-full': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="8" viewBox="0 0 48 8">
    <rect width="48" height="8" rx="2" fill="#000" opacity="0.65"/>
    <rect x="1" y="1" width="46" height="6" rx="1" fill="#4a9a5e"/>
  </svg>`,
  'hp-bar-damaged': `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="8" viewBox="0 0 48 8">
    <rect width="48" height="8" rx="2" fill="#000" opacity="0.65"/>
    <rect x="1" y="1" width="22" height="6" rx="1" fill="#c9a44a"/>
  </svg>`,
  'fog-overlay': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#020408" opacity="0.9"/>
    <circle cx="20" cy="24" r="2" fill="#fff" opacity="0.06"/><circle cx="44" cy="40" r="2" fill="#fff" opacity="0.05"/>
  </svg>`,
  'move-highlight': `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${C.tokenEdge}" opacity="0.18"/>
    <rect x="1" y="1" width="62" height="62" fill="none" stroke="${C.tokenEdge}" stroke-width="1" opacity="0.45"/>
  </svg>`,
};

const effects = {
  explosion: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <polygon points="32,8 38,26 56,22 42,34 48,52 32,42 16,52 22,34 8,22 26,26" fill="#c14040" opacity="0.85"/>
  </svg>`,
  smoke: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="28" cy="36" r="10" fill="#3a3836" opacity="0.5"/>
    <circle cx="38" cy="30" r="8" fill="#3a3836" opacity="0.4"/>
  </svg>`,
};

function writeCategory(base, files) {
  mkdirSync(base, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(base, `${name}.svg`), content.trim() + '\n', 'utf8');
  }
}

mkdirSync(ROOT, { recursive: true });
writeCategory(join(ROOT, 'units', 'soldiers'), units.soldiers);
writeCategory(join(ROOT, 'units', 'aircraft'), units.aircraft);
writeCategory(join(ROOT, 'units', 'ships'), units.ships);
writeCategory(join(ROOT, 'units', 'submarines'), units.submarines);
writeCategory(join(ROOT, 'cities'), cities);
writeCategory(join(ROOT, 'terrain'), terrain);
writeCategory(join(ROOT, 'factions'), factions);
writeCategory(join(ROOT, 'ui'), ui);
writeCategory(join(ROOT, 'effects'), effects);

const manifest = {
  version: '1.0.0',
  project: 'Empire Fog 1944',
  license: 'Project-internal generated assets (neutral tactical style)',
  generatedAt: new Date().toISOString(),
  categories: {
    soldiers: Object.keys(units.soldiers),
    aircraft: Object.keys(units.aircraft),
    ships: Object.keys(units.ships),
    submarines: Object.keys(units.submarines),
    cities: Object.keys(cities),
    terrain: Object.keys(terrain),
    factions: Object.keys(factions),
    ui: Object.keys(ui),
    effects: Object.keys(effects),
  },
};

const docsDir = join(ROOT, '..', 'docs');
mkdirSync(docsDir, { recursive: true });
writeFileSync(
  join(docsDir, 'ASSET_MANIFEST.json'),
  JSON.stringify(manifest, null, 2) + '\n',
  'utf8',
);

console.log(`Asset pack written to ${ROOT}`);
console.log(`Total SVG files: ${
  Object.values(manifest.categories).reduce((n, arr) => n + arr.length, 0)
}`);
