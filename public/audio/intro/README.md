# Intro-Trailer — Ton & Erzähler

Das Spiel spielt standardmäßig einen **~30 Sekunden Cinematic-Trailer** (See, Panzer, Flugzeuge, Explosionen, MG, deutsche Erzählerstimme).

## Automatisch (ohne Dateien)

- **Geräusche:** synthetisch im Browser (Web Audio)
- **Stimme:** Windows-Sprachausgabe (de-DE), klingt je nach System unterschiedlich — oft eher „Computerstimme“

## Professionelle Stimme (empfohlen für „echten“ Trailer)

Lege sechs MP3-Dateien hier ab (gleiche Reihenfolge wie im Spiel):

| Datei | Text (deutsch) |
|-------|----------------|
| `narrator-01.mp3` | Europa. Neunzehnhundertvierundvierzig. |
| `narrator-02.mp3` | Die Flotten feuern. Die Fronten brennen. |
| `narrator-03.mp3` | Panzer rollen durch den Rauch — kein Zurück. |
| `narrator-04.mp3` | Jagdgeschwader über dem Nebel. Städte werden umkämpft. |
| `narrator-05.mp3` | Empire Fog 1944. Operation Nebelfront beginnt. |
| `narrator-06.mp3` | Du führst das Oberkommando. Der Kontinent wartet nicht. |

**Quellen für Stimme:** eigenes Mikrofon, [ElevenLabs](https://elevenlabs.io), [Azure Speech](https://azure.microsoft.com/products/ai-services/text-to-speech), oder Synchronsprecher.

## Echtes Video (MP4) statt Engine-Trailer

Wenn `public/video/intro.mp4` existiert, wird es **statt** des eingebauten Trailers abgespielt.

Erstellung z. B. mit **DaVinci Resolve** (kostenlos):

1. Gameplay-Aufnahmen oder die SVG-Unit-Grafiken exportieren
2. Musik + SFX von [Freesound.org](https://freesound.org) (Lizenz beachten)
3. Erzähler-Spur unterlegen
4. Als H.264 MP4 exportieren → `public/video/intro.mp4`

Optional: `npm run video:intro` erzeugt ein einfaches Text-MP4 (nur mit installiertem ffmpeg).

## Lautstärke

Erster Klick im Browser aktiviert oft Audio — bei Stille einmal irgendwo klicken.
