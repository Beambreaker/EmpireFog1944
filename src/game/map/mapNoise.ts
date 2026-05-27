/** Deterministic noise helpers for procedural map shape and biomes. */

export function hashNoise(x: number, y: number, seed: number): number {
  const v = Math.sin((x * 127.1 + y * 311.7 + seed * 0.017) * 0.91) * 43758.5453;
  return v - Math.floor(v);
}

export function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += hashNoise(x * freq, y * freq, seed + i * 19) * amp;
    amp *= 0.52;
    freq *= 2.1;
  }
  return sum;
}

/** 0…1 — höher = eher Land (für Kontinent-Silhouette). */
export function continentLandness(
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): number {
  const nx = x / width;
  const ny = y / height;
  const cx = 0.52;
  const cy = 0.5;
  const dx = (nx - cx) / 0.46;
  const dy = (ny - cy) / 0.4;
  const base = 1 - (dx * dx + dy * dy);
  const detail = fbm(nx * 6.2 + 0.3, ny * 5.1, seed) * 0.22;
  const ridges = fbm(nx * 11, ny * 9, seed + 50) * 0.1;
  return base + detail + ridges;
}
