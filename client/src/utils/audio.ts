// 8-bit Retro Web Audio Synthesizer (Loud, Crisp, Zero External Asset Dependency)
class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const unlockAudio = () => {
        this.init();
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };
      window.addEventListener("pointerdown", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
    }
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.6, this.ctx.currentTime); // Master boost for "banter" & clear audio
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private getDestination(): AudioNode | null {
    this.init();
    return this.masterGain || this.ctx?.destination || null;
  }

  // Efek Suara: Klik Tombol Retro (Snappy Tactile 8-bit Click - Loud & Crisp)
  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(580, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Efek Suara: Mesin / Motor GLB Menyala (Ignition Start)
  public playStart() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(170, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.30, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Continuous Meaty Engine Hum while vehicle is running
  public startEngineHum(velocity: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const targetFreq = Math.min(280, 80 + velocity * 2.8);

    if (this.engineOsc && this.engineSubOsc) {
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, this.ctx.currentTime, 0.05);
      return;
    }

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = "sawtooth";
      this.engineSubOsc.type = "triangle";

      this.engineOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
      this.engineSubOsc.frequency.setValueAtTime(targetFreq * 0.5, this.ctx.currentTime);

      // Low-pass filter to make the engine sound punchy without harshness
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(0.16, this.ctx.currentTime + 0.12);

      this.engineOsc.connect(filter);
      this.engineSubOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(dest);

      this.engineOsc.start();
      this.engineSubOsc.start();
    } catch {
      // AudioContext policy fallback
    }
  }

  public stopEngineHum() {
    if (!this.engineOsc || !this.ctx || !this.engineGain) return;
    try {
      this.engineGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
      const osc = this.engineOsc;
      const sub = this.engineSubOsc;
      setTimeout(() => {
        try {
          osc?.stop();
          osc?.disconnect();
          sub?.stop();
          sub?.disconnect();
        } catch {}
      }, 120);
    } catch {}
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
  }

  // Efek Suara: Ticker Timer Tape Ticks (Laboratorium Fisika GLB)
  public playTickerTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Efek Suara: Target Tercapai (Kemenangan / Finish Fanfare)
  public playSuccess() {
    this.stopEngineHum();
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.14);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.14);
    });
  }

  // Efek Suara: Reset
  public playReset() {
    this.stopEngineHum();
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  // Efek Suara: Jawaban Kuis Benar (Arcade Coin Chime)
  public playCoin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Efek Suara: Jawaban Kuis Salah (Buzzer)
  public playBuzzer() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(dest);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }
}

export const sound = new RetroAudioSynth();
