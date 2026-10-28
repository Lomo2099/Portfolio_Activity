// Minecraft Procedural Web Audio Engine
// Generates authentic 8-bit and retro sound effects without external audio files

class MinecraftSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initContext();
  }

  initContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.resume();
      this.playDing();
    }
    return this.enabled;
  }

  // Click / Button Press (Wood/Stone click)
  playClick() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Ender Pearl Throw Whoosh
  playPearlThrow() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.15);
    } catch (e) {}
  }

  // Ender Pearl Teleport (Enderman / Pearl Landing 'Vwoop!')
  playPearlTeleport() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      
      // Dual oscillator for resonant ender harmonic
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sawtooth";

      // Vwoop frequency drop then rise
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.1);
      osc1.frequency.exponentialRampToValueAtTime(520, now + 0.28);

      osc2.frequency.setValueAtTime(400, now);
      osc2.frequency.exponentialRampToValueAtTime(120, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(260, now + 0.28);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.32);
      osc2.stop(now + 0.32);
    } catch (e) {}
  }

  // Nether Portal Warp Sound
  playPortalWarp() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const masterGain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";
      lfo.type = "sine";

      // Nether portal hum & wobble
      lfo.frequency.setValueAtTime(5, now);
      lfo.frequency.linearRampToValueAtTime(14, now + 1.2);
      lfoGain.gain.setValueAtTime(30, now);

      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.8);
      osc1.frequency.exponentialRampToValueAtTime(75, now + 1.5);

      osc2.frequency.setValueAtTime(165, now);
      osc2.frequency.exponentialRampToValueAtTime(330, now + 0.8);
      osc2.frequency.exponentialRampToValueAtTime(110, now + 1.5);

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);

      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 0.5);
      masterGain.gain.linearRampToValueAtTime(0.25, now + 1.0);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      lfo.stop(now + 1.6);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    } catch (e) {}
  }

  // Level Up / Chime (XP Orb Pickup / Achievement Ding)
  playDing() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteStart = now + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.26);
      });
    } catch (e) {}
  }

  // Chest Open sound
  playChest() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Player Damage / Hurt "Oof"
  playOof() {
    if (!this.enabled) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }
}

window.soundEngine = new MinecraftSoundEngine();

