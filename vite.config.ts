import { defineConfig } from 'vite';

/** GitHub Pages Projekt-Site: https://beambreaker.github.io/EmpireFog1944/ */
export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/EmpireFog1944/' : './',
  server: {
    host: true,
    port: 5173,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
  },
}));
