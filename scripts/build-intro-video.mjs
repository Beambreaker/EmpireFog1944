/**
 * Erzeugt public/video/intro.mp4 per ffmpeg (deutsche Intro-Texte).
 * Voraussetzung: ffmpeg im PATH.
 * Ausführen: npm run video:intro
 */
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'video');
const OUT_FILE = join(OUT_DIR, 'intro.mp4');
const TMP = join(OUT_DIR, '_segments');

const SEGMENTS = [
  {
    file: '01.mp4',
    duration: 5.5,
    title: 'EMPIRE FOG 1944',
    lines: ['Der Kontinent liegt unter Kriegsnebel.', 'Städte und Fronten — nur sichtbar für den Eroberer.'],
  },
  {
    file: '02.mp4',
    duration: 5.5,
    title: 'Operation Nebelfront',
    lines: ['Zwei Koalitionen. Eine Karte. Kein Zurück.', 'Jeder Zug schreibt Geschichte.'],
  },
  {
    file: '03.mp4',
    duration: 5,
    title: 'Oberkommando',
    lines: ['Korps, Flotten, Jagdgeschwader.', 'Erobere Städte. Durchbreche den Nebel.'],
  },
];

function escText(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%');
}

function hasFfmpeg() {
  const r = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
  return r.status === 0;
}

function renderSegment(seg) {
  const out = join(TMP, seg.file);
  const filters = [];
  filters.push(
    `drawtext=text='${escText(seg.title)}':fontsize=64:fontcolor=0xF0E0B0:x=(w-text_w)/2:y=h*0.32:shadowcolor=0x000000:shadowx=2:shadowy=2`,
  );
  seg.lines.forEach((line, i) => {
    filters.push(
      `drawtext=text='${escText(line)}':fontsize=28:fontcolor=0xC8D8EC:x=(w-text_w)/2:y=h*${0.44 + i * 0.06}:shadowcolor=0x000000:shadowx=1:shadowy=1`,
    );
  });
  const vf = filters.join(',');

  const args = [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=0x0e1e32:s=1920x1080:d=${seg.duration}`,
    '-vf',
    vf,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-r',
    '30',
    out,
  ];
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8', stdio: 'pipe' });
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error(`ffmpeg segment failed: ${seg.file}`);
  }
  return out;
}

function concatSegments(files) {
  const listPath = join(TMP, 'list.txt');
  const list = files.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
  writeFileSync(listPath, list, 'utf8');
  const r = spawnSync(
    'ffmpeg',
    ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', OUT_FILE],
    { encoding: 'utf8', stdio: 'pipe' },
  );
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error('ffmpeg concat failed');
  }
}

function main() {
  if (!hasFfmpeg()) {
    console.warn('ffmpeg nicht gefunden — Intro-Video wird nicht erzeugt.');
    console.warn('IntroScene nutzt automatisch die eingebaute Kino-Sequenz.');
    process.exit(0);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  const paths = [];
  for (const seg of SEGMENTS) {
    console.log('Rendere Segment:', seg.title);
    paths.push(renderSegment(seg));
  }

  console.log('Füge Segmente zusammen →', OUT_FILE);
  concatSegments(paths);

  try {
    unlinkSync(join(TMP, 'list.txt'));
  } catch {
    /* ignore */
  }

  console.log('Fertig:', OUT_FILE);
}

main();
