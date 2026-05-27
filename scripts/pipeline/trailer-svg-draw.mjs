/** Procedural 512×512 trailer silhouettes — studio “3D/2D creation” step. */

const W = 512;
const H = 512;

export function wrapSvg(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a5854"/>
    <stop offset="100%" stop-color="#2e2c28"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#7a7874"/>
    <stop offset="100%" stop-color="#3a3834"/>
  </linearGradient>
  <linearGradient id="track" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#4a4844"/>
    <stop offset="100%" stop-color="#1a1816"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="none"/>
${body}
</svg>`;
}

function trackOffset(frame) {
  return (frame % 5) * 10 - 20;
}

export function drawTank(frame) {
  const ox = trackOffset(frame);
  const smoke = frame >= 2 ? `<ellipse cx="118" cy="198" rx="${12 + frame * 2}" ry="${8 + frame}" fill="#6a6460" opacity="0.45"/>` : '';
  return wrapSvg(`
<g transform="translate(${ox}, 0)">
  <rect x="72" y="318" width="368" height="28" rx="6" fill="url(#track)"/>
  <rect x="88" y="334" width="48" height="14" rx="3" fill="#2a2826"/>
  <rect x="156" y="334" width="48" height="14" rx="3" fill="#2a2826"/>
  <rect x="224" y="334" width="48" height="14" rx="3" fill="#2a2826"/>
  <rect x="292" y="334" width="48" height="14" rx="3" fill="#2a2826"/>
  <rect x="360" y="334" width="48" height="14" rx="3" fill="#2a2826"/>
  <path d="M96 310 L416 310 L400 268 L112 268 Z" fill="url(#hull)"/>
  <rect x="200" y="228" width="120" height="52" rx="8" fill="url(#metal)"/>
  <rect x="248" y="212" width="72" height="36" rx="6" fill="#4a4844"/>
  <rect x="312" y="224" width="96" height="12" rx="4" fill="#3a3834"/>
  <circle cx="260" cy="248" r="6" fill="#1a1816"/>
  ${smoke}
</g>`);
}

export function drawInfantry(frame) {
  const leg = frame % 2 === 0 ? 8 : -8;
  return wrapSvg(`
<g transform="translate(180, 80)">
  <ellipse cx="76" cy="300" rx="44" ry="10" fill="#000" opacity="0.2"/>
  <rect x="58" y="120" width="36" height="90" rx="10" fill="#4a4844"/>
  <circle cx="76" cy="108" r="28" fill="#5a5854"/>
  <rect x="52" y="200" width="14" height="${70 + leg}" rx="6" fill="#3a3834"/>
  <rect x="86" y="200" width="14" height="${70 - leg}" rx="6" fill="#3a3834"/>
  <line x1="94" y1="150" x2="140" y2="120" stroke="#2a2826" stroke-width="8" stroke-linecap="round"/>
  <rect x="130" y="108" width="48" height="10" rx="3" fill="#3a3834" transform="rotate(-18 154 113)"/>
</g>`);
}

export function drawArtillery(frame) {
  const recoil = frame === 3 ? -14 : frame === 4 ? -8 : 0;
  const smoke = frame >= 3 ? `<ellipse cx="340" cy="210" rx="36" ry="22" fill="#8a8480" opacity="0.5"/>` : '';
  return wrapSvg(`
<g transform="translate(40, 60)">
  <circle cx="120" cy="300" r="52" fill="#3a3834" stroke="#2a2826" stroke-width="6"/>
  <circle cx="300" cy="300" r="52" fill="#3a3834" stroke="#2a2826" stroke-width="6"/>
  <path d="M100 260 L320 260 L300 220 L120 220 Z" fill="url(#metal)"/>
  <rect x="200" y="${180 + recoil}" width="200" height="16" rx="6" fill="#4a4844" transform="rotate(-8 200 ${188 + recoil})"/>
  ${smoke}
</g>`);
}

export function drawDestroyer(frame) {
  const wave = Math.sin(frame * 1.2) * 6;
  return wrapSvg(`
<g transform="translate(0, ${wave})">
  <path d="M40 340 Q256 ${320 + wave} 472 340 L460 300 L80 300 Z" fill="#3a6a9a" opacity="0.55"/>
  <path d="M60 300 L120 220 L380 200 L452 280 L420 300 Z" fill="url(#hull)"/>
  <rect x="140" y="210" width="24" height="40" rx="4" fill="#4a4844"/>
  <rect x="220" y="200" width="28" height="48" rx="4" fill="#5a5854"/>
  <rect x="300" y="215" width="22" height="36" rx="4" fill="#4a4844"/>
  <rect x="360" y="230" width="40" height="20" rx="3" fill="#3a3834"/>
</g>`);
}

export function drawBattleship(frame) {
  const wave = Math.sin(frame * 0.9) * 5;
  return wrapSvg(`
<g transform="translate(0, ${wave})">
  <path d="M20 350 Q256 ${328 + wave} 492 350 L480 305 L40 305 Z" fill="#3a6a9a" opacity="0.5"/>
  <path d="M48 300 L140 180 L400 170 L464 290 L440 300 Z" fill="url(#hull)"/>
  <rect x="160" y="195" width="32" height="56" rx="5" fill="#5a5854"/>
  <rect x="240" y="185" width="36" height="64" rx="5" fill="#6a6864"/>
  <rect x="320" y="195" width="32" height="56" rx="5" fill="#5a5854"/>
  <rect x="200" y="250" width="120" height="28" rx="4" fill="#3a3834"/>
</g>`);
}

export function drawSubmarine(frame) {
  const bob = Math.sin(frame * 1.1) * 4;
  return wrapSvg(`
<g transform="translate(60, ${80 + bob})">
  <path d="M40 280 Q256 300 440 280 L420 260 Q256 240 60 260 Z" fill="#3a6a9a" opacity="0.45"/>
  <ellipse cx="240" cy="220" rx="200" ry="48" fill="url(#hull)"/>
  <rect x="200" y="160" width="80" height="70" rx="12" fill="url(#metal)"/>
  <rect x="220" y="175" width="40" height="20" rx="4" fill="#2a2826"/>
  <line x1="240" y1="160" x2="240" y2="${130 - frame * 2}" stroke="#4a4844" stroke-width="4"/>
</g>`);
}

function propeller(frame) {
  const rot = (frame % 4) * 22;
  return `<g transform="translate(88, 248) rotate(${rot})"><ellipse cx="0" cy="0" rx="6" ry="28" fill="#8a8880" opacity="0.75"/><ellipse cx="0" cy="0" rx="28" ry="6" fill="#8a8880" opacity="0.75"/></g>`;
}

export function drawFighter(frame) {
  return wrapSvg(`
<g transform="translate(40, 140)">
  <path d="M40 120 L380 100 L400 130 L360 140 L200 150 L80 180 Z" fill="url(#metal)"/>
  <path d="M180 150 L120 60 L200 130 Z" fill="#5a5854"/>
  <path d="M200 150 L280 200 L220 155 Z" fill="#4a4844"/>
  ${propeller(frame)}
  <circle cx="88" cy="248" r="14" fill="#3a3834"/>
</g>`);
}

export function drawBomber(frame) {
  const bank = frame % 2 === 0 ? 0 : 4;
  return wrapSvg(`
<g transform="translate(30, ${120 + bank})">
  <path d="M60 100 L400 90 L420 120 L360 130 L200 145 L70 170 Z" fill="url(#hull)"/>
  <path d="M160 145 L100 50 L200 135 Z" fill="#5a5854"/>
  <path d="M200 145 L300 210 L240 150 Z" fill="#4a4844"/>
  <path d="M200 145 L300 80 L240 145 Z" fill="#4a4844"/>
  ${propeller(frame)}
</g>`);
}

export const DRAWERS = {
  tank: drawTank,
  infantry: drawInfantry,
  artillery: drawArtillery,
  destroyer: drawDestroyer,
  battleship: drawBattleship,
  submarine: drawSubmarine,
  fighter: drawFighter,
  bomber: drawBomber,
};
