/**
 * Synthetische Kampfgeräusche für den Intro-Trailer (Web Audio API).
 * Keine externen Soundfiles nötig; optional können MP3s in public/audio/intro/ liegen.
 */

export class IntroAudio {
  private ctx: AudioContext | null = null;
  private ambientNodes: AudioNode[] = [];
  private master: GainNode | null = null;

  private ensure(): AudioContext | null {
    const W = window as Window & { webkitAudioContext?: typeof AudioContext };
    if (typeof AudioContext === 'undefined' && !W.webkitAudioContext) {
      return null;
    }
    if (!this.ctx) {
      const Ctx = AudioContext ?? W.webkitAudioContext!;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    return this.ctx;
  }

  stopAll(): void {
    for (const n of this.ambientNodes) {
      try {
        n.disconnect();
      } catch {
        /* ignore */
      }
    }
    this.ambientNodes = [];
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.master = null;
    }
  }

  /** Leises Kriegs-Drone-Rauschen im Hintergrund. */
  startAmbient(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    const gain = ctx.createGain();
    gain.gain.value = 0.12;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 42;
    const og = ctx.createGain();
    og.gain.value = 0.04;
    osc.connect(og);
    og.connect(this.master);
    osc.start();

    this.ambientNodes.push(src, filter, gain, osc, og);
  }

  playExplosion(intensity = 1): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const dur = 0.35 + intensity * 0.2;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t) * intensity;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5 * intensity, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
    src.stop(ctx.currentTime + dur);
  }

  playMachineGunBurst(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const shots = 14;
    for (let i = 0; i < shots; i++) {
      const t = ctx.currentTime + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 180 + Math.random() * 80;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  playTankRumble(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(38, ctx.currentTime + 2.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 2.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 2.5);
  }

  playPlaneFlyby(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 1.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }

  playNavalSalvo(): void {
    this.playExplosion(0.65);
    const ctx = this.ensure();
    if (!ctx) return;
    window.setTimeout(() => this.playExplosion(0.45), 180);
  }

  /** Tiefer Puls für Spannungsaufbau (musikalischer Unterbau). */
  playWarPulse(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.42;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(72 - i * 4, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 250;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + 0.32);
    }
  }

  /** Kurzer Spannungsanstieg für Aktwechsel. */
  playTensionRise(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.75);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.82);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 120;
    osc.connect(hp);
    hp.connect(gain);
    gain.connect(this.master);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  }

  /** Finale-Akkord als kurzer Titel-Hit. */
  playFinalSting(): void {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const notes = [196, 246.94, 293.66];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = notes[i];
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    }
  }
}
