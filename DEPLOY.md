# Empire Fog 1944 — Online spielen

## Spiel-Link (nach Aktivierung von GitHub Pages)

**https://beambreaker.github.io/EmpireFog1944/**

Einmalig im GitHub-Repository:

1. **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Änderungen auf Branch `main` pushen (Workflow startet automatisch)

Nach 1–3 Minuten ist der Link oben spielbar (Intro → Menü → Fraktion wählen → Spiel starten).

## Lokal testen (wie die Online-Version)

```bash
npm install
npm run build:pages
npm run preview:pages
```

Dann im Browser die angezeigte Adresse öffnen (z. B. http://localhost:4173/EmpireFog1944/).

## Entwicklung

```bash
npm run dev
```

## Alternative: Netlify

Falls GitHub Pages nicht verfügbar ist, im Projektordner:

```bash
npm run build:pages
npx netlify deploy --prod --dir=dist
```

Konfiguration: `netlify.toml` (Basis-URL `/`, nicht `/EmpireFog1944/`).

## Nur in diesem Projekt

Alle Befehle nur im Ordner `EmpireFog1944` ausführen — andere Projekte auf dem Rechner werden nicht verändert.
