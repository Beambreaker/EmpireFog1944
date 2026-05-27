/**
 * Erzählerstimme: bevorzugt MP3 aus public/audio/intro/, sonst Browser-Sprachausgabe (de-DE).
 */

export class IntroNarrator {
  private readonly scheduled: number[] = [];
  private cancelled = false;
  private currentAudio: HTMLAudioElement | null = null;

  /** Optional: scene.load.audio Keys, wenn Dateien vorhanden. */
  private readonly mp3Paths: string[];

  constructor() {
    const base =
      typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
        ? import.meta.env.BASE_URL
        : './';
    const p = base.endsWith('/') ? base : `${base}/`;
    this.mp3Paths = [1, 2, 3, 4, 5, 6].map((n) => `${p}audio/intro/narrator-0${n}.mp3`);
  }

  schedule(cues: { atMs: number; text: string }[], onAllDone?: () => void): void {
    this.cancelled = false;
    let completed = 0;
    const total = cues.length;

    cues.forEach((cue, index) => {
      const id = window.setTimeout(() => {
        if (this.cancelled) return;
        this.speakLine(cue.text, index, () => {
          completed += 1;
          if (completed >= total) onAllDone?.();
        });
      }, cue.atMs);
      this.scheduled.push(id);
    });
  }

  cancel(): void {
    this.cancelled = true;
    for (const id of this.scheduled) window.clearTimeout(id);
    this.scheduled.length = 0;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  private speakLine(text: string, index: number, onEnd: () => void): void {
    const mp3 = this.mp3Paths[index];
    if (mp3) {
      const audio = new Audio(mp3);
      this.currentAudio = audio;
      audio.volume = 0.9;
      audio.onended = () => {
        if (this.currentAudio === audio) this.currentAudio = null;
        onEnd();
      };
      audio.onerror = () => this.speakTts(text, onEnd);
      void audio.play().catch(() => this.speakTts(text, onEnd));
      return;
    }
    this.speakTts(text, onEnd);
  }

  private speakTts(text: string, onEnd: () => void): void {
    if (typeof speechSynthesis === 'undefined') {
      onEnd();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    u.rate = 0.9;
    u.pitch = 0.82;
    u.volume = 1;

    const pickVoice = (): SpeechSynthesisVoice | undefined => {
      const voices = speechSynthesis.getVoices();
      return (
        voices.find((v) => v.lang === 'de-DE') ??
        voices.find((v) => v.lang.startsWith('de')) ??
        voices[0]
      );
    };

    const voice = pickVoice();
    if (voice) u.voice = voice;
    else {
      speechSynthesis.onvoiceschanged = () => {
        const v = pickVoice();
        if (v) u.voice = v;
      };
    }

    u.onend = () => onEnd();
    u.onerror = () => onEnd();
    speechSynthesis.speak(u);
  }
}
