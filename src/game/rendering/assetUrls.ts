/** Öffentliche Asset-URL mit Vite-BASE (lokal, GitHub Pages, Netlify). */
export function resolveAssetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = relativePath.replace(/^\//, '');
  if (!base || base === './') {
    return `./${clean}`;
  }
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${clean}`;
}
