
class SoundService {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.5;
  private musicInterval: number | null = null;
  private step: number = 0;
  private isMusicPlaying: boolean = false;
  private humNode: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private currentTrackIndex: number = 0;

  private tracks = [
    {
      name: "NEON_PULSE",
      bpm: 110,
      bass: [110, 110, 146.83, 110, 164.81, 110, 146.83, 123.47],
      melody: [440, 0, 440, 523.25, 0, 440, 392.00, 349.23]
    },
    {
      name: "GLITCH_HOP",
      bpm: 128,
      bass: [82.41, 0, 82.41, 110, 0, 82.41, 123.47, 0],
      melody: [329.63, 392, 440, 493.88, 392, 440, 329.63, 0]
    },
    {
      name: "BOSS_FIGHT",
      bpm: 145,
      bass: [73.42, 73.42, 87.31, 73.42, 110, 73.42, 98, 73.42],
      melody: [293.66, 311.13, 293.66, 349.23, 293.66, 311.13, 293.66, 440]
    }
  ];

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(val: boolean) {
    this.muted = val;
    if (val) {
      this.stopMusic();
      this.stopIntroHum();
    } else if (this.isMusicPlaying) {
      this.startMusic();
    }
  }

  setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.humGain) {
      this.humGain.gain.setValueAtTime(this.volume * 0.04, this.ctx?.currentTime || 0);
    }
  }

  private playOsc(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, fadeOut: boolean = true) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const targetVolume = volume * this.volume;
    gain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playArpeggio(notes: number[], type: OscillatorType, speed: number, volume: number = 0.05) {
    if (this.muted) return;
    this.initCtx();
    notes.forEach((note, i) => {
      setTimeout(() => this.playOsc(note, type, speed * 2, volume), i * speed * 1000);
    });
  }

  playTick() {
    this.playOsc(800, 'square', 0.05, 0.05);
  }

  playBlip() {
    this.playOsc(1500, 'sine', 0.05, 0.03);
  }

  playSelect() {
    this.playOsc(1200, 'square', 0.03, 0.04);
    setTimeout(() => this.playOsc(1600, 'square', 0.03, 0.02), 30);
  }

  playActionClick() {
    this.playOsc(400, 'square', 0.08, 0.12);
    this.playOsc(200, 'square', 0.1, 0.08);
    this.playDataBurst();
  }

  playCabinetBoot() {
    const freqs = [220, 261, 329, 392, 523, 659, 783, 1046];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playOsc(f, 'square', 0.1, 0.05), i * 50);
    });
  }

  playIntroBeep() {
    this.playOsc(1200 + Math.random() * 200, 'square', 0.04, 0.03);
  }

  playSuccessChime() {
    this.playArpeggio([523.25, 659.25, 783.99, 1046.50], 'square', 0.08, 0.06);
  }

  playStartSequence() {
    this.playOsc(440, 'square', 0.1, 0.1);
    setTimeout(() => this.playOsc(440, 'square', 0.1, 0.1), 400);
    setTimeout(() => this.playOsc(440, 'square', 0.1, 0.1), 800);
    setTimeout(() => this.playOsc(880, 'square', 0.3, 0.15), 1200);
  }

  playDataBurst() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    const targetVolume = 0.05 * this.volume;
    gain.gain.setValueAtTime(targetVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }

  startIntroHum() {
    if (this.muted || this.humNode) return;
    this.initCtx();
    if (!this.ctx) return;

    this.humNode = this.ctx.createOscillator();
    this.humGain = this.ctx.createGain();
    
    this.humNode.type = 'sawtooth';
    this.humNode.frequency.setValueAtTime(55, this.ctx.currentTime); 
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);

    this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.humGain.gain.linearRampToValueAtTime(this.volume * 0.04, this.ctx.currentTime + 2);

    this.humNode.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humNode.start();
  }

  stopIntroHum() {
    if (this.humGain && this.ctx) {
      this.humGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.humNode?.stop();
        this.humNode = null;
        this.humGain = null;
      }, 500);
    }
  }

  playBreachAlarm() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.1);
    
    gain.gain.setValueAtTime(0.05 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCoin() {
    this.playOsc(987.77, 'square', 0.15, 0.1, false);
    setTimeout(() => this.playOsc(1318.51, 'square', 0.45, 0.12), 80);
    if (!this.isMusicPlaying && !this.muted) {
      this.startMusic();
    }
  }

  playPowerUp() {
    this.initCtx();
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playGlitch() {
    if (this.muted) return;
    this.initCtx();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playOsc(Math.random() * 400 + 100, 'triangle', 0.1, 0.05);
        if (Math.random() > 0.5) this.playDataBurst();
      }, i * 150);
    }
  }

  playVictory() {
    this.playArpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51], 'square', 0.12, 0.08);
  }

  playGameOver() {
    this.playArpeggio([392.00, 329.63, 261.63, 196.00], 'square', 0.15, 0.08);
  }

  playVanish() {
    this.playOsc(880, 'sawtooth', 0.3, 0.05, true);
    this.initCtx();
    if (this.ctx) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05 * this.volume, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
  }

  playExplosion() {
    this.initCtx();
    if (this.muted || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playCriticalError() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(60, now);
    osc2.frequency.setValueAtTime(63, now); 
    
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.stopMusic();
    if (this.isMusicPlaying && !this.muted) {
      this.startMusic();
    }
    return this.tracks[this.currentTrackIndex].name;
  }

  getCurrentTrackName() {
    return this.tracks[this.currentTrackIndex].name;
  }

  startMusic() {
    this.stopMusic();
    this.isMusicPlaying = true;
    if (this.muted) return;
    
    const track = this.tracks[this.currentTrackIndex];
    const stepTime = (60 / track.bpm) / 2; 

    this.musicInterval = window.setInterval(() => {
      const freq = track.bass[this.step % track.bass.length];
      const melFreq = track.melody[this.step % track.melody.length];

      this.playOsc(freq, 'triangle', stepTime * 0.8, 0.04);
      if (melFreq > 0) {
        this.playOsc(melFreq, 'square', stepTime * 0.4, 0.02);
      }

      this.step++;
    }, stepTime * 1000);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundService = new SoundService();
