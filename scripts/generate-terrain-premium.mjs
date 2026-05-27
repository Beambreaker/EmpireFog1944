/**
 * Realistische Gelände-SVGs (256×256) + Küsten-Overlays — gedämpfte Erdtöne, Rausch-Textur.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'EmpireFog1944_AssetPack', 'runtime', 'terrain');
const BLEND = join(dirname(fileURLToPath(import.meta.url)), '..', 'EmpireFog1944_AssetPack', 'runtime', 'terrain-blend');

const NOISE_FILTER = `
  <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="5" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0.4 0 0 0 0  0 0.38 0 0 0  0 0 0.35 0 0  0 0 0 0.55 0"/>
    <feBlend in="SourceGraphic" in2="n" mode="multiply"/>
  </filter>
  <filter id="macro" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="11" result="m"/>
    <feColorMatrix in="m" type="saturate" values="0.15"/>
    <feBlend in="SourceGraphic" in2="m" mode="overlay" opacity="0.35"/>
  </filter>`;

function svg256(body, extraDefs = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs>
${NOISE_FILTER}
${extraDefs}
</defs>
<g filter="url(#grain)">
<g filter="url(#macro)">
${body}
</g>
</g>
</svg>`;
}

function writeDir(dir, files) {
  mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, `${name}.svg`), content.trim() + '\n', 'utf8');
  }
}

const water = svg256(`
  <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a4a62"/>
    <stop offset="55%" stop-color="#0c2a3e"/>
    <stop offset="100%" stop-color="#061820"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#deep)"/>
  <path d="M-30 95 Q90 78 200 92 T320 85 V256 H-30Z" fill="#143850" opacity="0.4"/>
  <path d="M0 145 Q110 128 220 148 T360 138 V256 H0Z" fill="#0a2838" opacity="0.55"/>
  <ellipse cx="85" cy="205" rx="60" ry="10" fill="#ffffff" opacity="0.04"/>
  <ellipse cx="175" cy="168" rx="75" ry="11" fill="#ffffff" opacity="0.035"/>
`);

const waterShallow = svg256(`
  <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2a6078"/>
    <stop offset="70%" stop-color="#1a4858"/>
    <stop offset="100%" stop-color="#0e3038"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#sh)"/>
  <rect y="178" width="256" height="78" fill="#4a5a48" opacity="0.45"/>
  <rect y="170" width="256" height="14" fill="#6a6a58" opacity="0.35"/>
  <path d="M0 176 Q128 162 256 180" stroke="#8a9080" stroke-width="2" fill="none" opacity="0.3"/>
`);

const lake = svg256(`
  <linearGradient id="lk" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#3a4a42"/>
    <stop offset="100%" stop-color="#222c28"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#lk)"/>
  <ellipse cx="100" cy="115" rx="75" ry="38" fill="#4a5a50" opacity="0.25"/>
  <ellipse cx="165" cy="155" rx="58" ry="28" fill="#2a3830" opacity="0.35"/>
  <path d="M35 85 Q128 98 220 82" stroke="#5a6860" stroke-width="1.2" fill="none" opacity="0.35"/>
`);

const ice = svg256(`
  <linearGradient id="ic" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#d8e4ec"/>
    <stop offset="100%" stop-color="#98b0c4"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#ic)"/>
  <path d="M15 70 L95 48 L175 72 L245 52" stroke="#f4f8fc" stroke-width="2.5" fill="none" opacity="0.45"/>
  <path d="M30 150 L120 128 L210 158" stroke="#b8ccd8" stroke-width="1.5" fill="none" opacity="0.35"/>
`);

const plain = svg256(`
  <linearGradient id="pl" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6a7a52"/>
    <stop offset="100%" stop-color="#4a5a3c"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#pl)"/>
  <ellipse cx="70" cy="90" rx="55" ry="30" fill="#000" opacity="0.06"/>
  <ellipse cx="185" cy="175" rx="70" ry="35" fill="#000" opacity="0.07"/>
  <path d="M0 120 Q80 108 160 118 T256 110" stroke="#5a6848" stroke-width="0.8" fill="none" opacity="0.25"/>
  <path d="M20 200 Q130 188 240 202" stroke="#4a5838" stroke-width="0.8" fill="none" opacity="0.2"/>
`);

const forest = svg256(`
  <linearGradient id="fo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2e4028"/>
    <stop offset="100%" stop-color="#1a2418"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#fo)"/>
  <ellipse cx="128" cy="205" rx="105" ry="32" fill="#000" opacity="0.2"/>
  <ellipse cx="60" cy="95" rx="48" ry="38" fill="#243820" opacity="0.85"/>
  <ellipse cx="145" cy="75" rx="55" ry="42" fill="#2a4024" opacity="0.9"/>
  <ellipse cx="200" cy="130" rx="50" ry="40" fill="#1e2c1a" opacity="0.88"/>
  <ellipse cx="95" cy="165" rx="42" ry="35" fill="#324830" opacity="0.75"/>
  <ellipse cx="175" cy="185" rx="38" ry="30" fill="#283c24" opacity="0.7"/>
`);

const hills = svg256(`
  <linearGradient id="hi" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5a6a48"/>
    <stop offset="100%" stop-color="#3e4e34"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#hi)"/>
  <ellipse cx="80" cy="160" rx="85" ry="42" fill="#6a7a58" opacity="0.65"/>
  <ellipse cx="175" cy="105" rx="72" ry="36" fill="#4a5a40" opacity="0.7"/>
  <ellipse cx="130" cy="185" rx="55" ry="24" fill="#000" opacity="0.08"/>
`);

const mountain = svg256(`
  <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a5850"/>
    <stop offset="100%" stop-color="#2e2c28"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#mt)"/>
  <polygon points="128,35 45,225 211,225" fill="#4a4840"/>
  <polygon points="128,52 72,175 184,175" fill="#6a6660"/>
  <polygon points="128,68 95,145 161,145" fill="#8a8880" opacity="0.9"/>
  <polygon points="175,125 148,218 202,218" fill="#3a3834" opacity="0.85"/>
  <polygon points="95,135 68,205 122,205" fill="#424038" opacity="0.75"/>
`);

const mountainSnow = svg256(`
  <linearGradient id="mts" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#6a7078"/>
    <stop offset="100%" stop-color="#3a4048"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#mts)"/>
  <polygon points="128,28 38,232 218,232" fill="#4a5058"/>
  <polygon points="128,48 55,168 201,168" fill="#d8dce4"/>
  <polygon points="128,62 82,138 174,138" fill="#f0f4f8"/>
  <polygon points="168,118 142,218 198,218" fill="#5a6068" opacity="0.85"/>
`);

const desert = svg256(`
  <linearGradient id="ds" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#c4a878"/>
    <stop offset="50%" stop-color="#a88858"/>
    <stop offset="100%" stop-color="#8a6840"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#ds)"/>
  <ellipse cx="75" cy="100" rx="58" ry="24" fill="#d0b888" opacity="0.4"/>
  <ellipse cx="170" cy="160" rx="72" ry="28" fill="#b09060" opacity="0.35"/>
  <path d="M25 145 Q95 132 165 142 T255 135" stroke="#9a7848" stroke-width="1.5" fill="none" opacity="0.3"/>
`);

const snow = svg256(`
  <linearGradient id="sn" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e8eef4"/>
    <stop offset="100%" stop-color="#b8c4d0"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#sn)"/>
  <ellipse cx="85" cy="105" rx="48" ry="22" fill="#c8d4e0" opacity="0.35"/>
  <ellipse cx="168" cy="165" rx="62" ry="26" fill="#a8b8c8" opacity="0.3"/>
`);

const marsh = svg256(`
  <linearGradient id="ma" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3a4840"/>
    <stop offset="100%" stop-color="#222c28"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#ma)"/>
  <ellipse cx="105" cy="125" rx="78" ry="42" fill="#2a3830" opacity="0.65"/>
  <ellipse cx="168" cy="172" rx="58" ry="32" fill="#1e2824" opacity="0.6"/>
  <path d="M40 95 Q128 112 220 90" stroke="#4a5a50" stroke-width="1.5" fill="none" opacity="0.35"/>
`);

/** Horizontale Fahrspur — im Spiel per Rotation für N/S. */
const road = svg256(`
  <linearGradient id="rd" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5a5848"/>
    <stop offset="100%" stop-color="#4a483c"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#rd)"/>
  <rect x="0" y="108" width="256" height="40" fill="#6a6658" opacity="0.85"/>
  <rect x="0" y="118" width="256" height="20" fill="#7a7668" opacity="0.5"/>
  <line x1="8" y1="128" x2="248" y2="128" stroke="#9a9488" stroke-width="1" opacity="0.35" stroke-dasharray="12 8"/>
`);

const coast = svg256(`
  <linearGradient id="co" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a6848"/>
    <stop offset="40%" stop-color="#8a7a60"/>
    <stop offset="100%" stop-color="#0c2a3e"/>
  </linearGradient>
  <rect width="256" height="256" fill="url(#co)"/>
`);

writeDir(ROOT, {
  water,
  'water-shallow': waterShallow,
  lake,
  ice,
  plain,
  forest,
  mountain,
  'mountain-snow': mountainSnow,
  desert,
  snow,
  marsh,
  hills,
  road,
  coast,
});

function blendSvg(mask) {
  const n = (mask & 1) !== 0;
  const e = (mask & 2) !== 0;
  const s = (mask & 4) !== 0;
  const w = (mask & 8) !== 0;
  let gradients = '';
  let rects = '';
  if (n) {
    gradients += `<linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8a8070" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#6a6050" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#6a6050" stop-opacity="0"/>
    </linearGradient>`;
    rects += `<rect x="0" y="0" width="256" height="115" fill="url(#gn)"/>`;
  }
  if (s) {
    gradients += `<linearGradient id="gs" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#7a7060" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#5a5048" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#5a5048" stop-opacity="0"/>
    </linearGradient>`;
    rects += `<rect x="0" y="141" width="256" height="115" fill="url(#gs)"/>`;
  }
  if (w) {
    gradients += `<linearGradient id="gw" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a8070" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#6a6050" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#6a6050" stop-opacity="0"/>
    </linearGradient>`;
    rects += `<rect x="0" y="0" width="115" height="256" fill="url(#gw)"/>`;
  }
  if (e) {
    gradients += `<linearGradient id="ge" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#8a8070" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#6a6050" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#6a6050" stop-opacity="0"/>
    </linearGradient>`;
    rects += `<rect x="141" y="0" width="115" height="256" fill="url(#ge)"/>`;
  }
  if (mask === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"></svg>`;
  }
  const foam =
    (n || s) && (e || w)
      ? `<ellipse cx="128" cy="128" rx="36" ry="36" fill="#c8c4b8" opacity="0.08"/>`
      : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs>${gradients}</defs>
${rects}
${foam}
</svg>`;
}

const blends = {};
for (let m = 0; m < 16; m++) {
  blends[`mask-${m}`] = blendSvg(m);
}
writeDir(BLEND, blends);

console.log(`Terrain realistic: ${Object.keys(blends).length + 15} files → ${ROOT}`);
