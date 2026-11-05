import { PadId } from '../types/drums';

class DrumSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private backingTrackTimer: number | null = null;
  private currentBackingStyle: string | null = null;
  private backingBpm: number = 90;
  private backingGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.backingGain = this.ctx.createGain();
      this.backingGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.backingGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play pad sound by ID
  public triggerPad(padId: PadId, velocity: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    switch (padId) {
      case 'kick_pad':
      case 'pedal_kick':
        this.playKick(velocity);
        break;
      case 'snare':
        this.playSnare(velocity);
        break;
      case 'hihat':
        this.playHiHatClosed(velocity);
        break;
      case 'pedal_hihat':
        this.playHiHatPedal(velocity);
        break;
      case 'ride':
        this.playRide(velocity);
        break;
      case 'crash1':
        this.playCrash(1, velocity);
        break;
      case 'crash2':
        this.playCrash(2, velocity);
        break;
      case 'tom1':
        this.playTom(150, 85, 0.35, velocity);
        break;
      case 'tom2':
        this.playTom(120, 68, 0.4, velocity);
        break;
      case 'floor_tom':
        this.playTom(90, 48, 0.5, velocity);
        break;
    }
  }

  public playKick(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Sub-bass pitch-falling oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

    const gainVal = Math.min(1.2, 0.9 * velocity);
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    // Punch click transient
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(260, now);
    clickOsc.frequency.exponentialRampToValueAtTime(50, now + 0.03);

    clickGain.gain.setValueAtTime(0.4 * velocity, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);

    clickOsc.start(now);
    clickOsc.stop(now + 0.04);
  }

  public playSnare(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    oscGain.gain.setValueAtTime(0.6 * velocity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Noise burst (snare wires)
    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1100, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7 * velocity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.23);
  }

  public playHiHatClosed(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise with metallic bandpass
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9500, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.06);
  }

  public playHiHatOpen(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9000, now);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.39);
  }

  public playHiHatPedal(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(7000, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.08);
  }

  public playTom(startFreq: number, endFreq: number, decaySec: number, velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + decaySec);

    gain.gain.setValueAtTime(0.8 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decaySec);

    // Initial attack snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(startFreq * 2.2, now);
    snap.frequency.exponentialRampToValueAtTime(startFreq, now + 0.025);
    snapGain.gain.setValueAtTime(0.3 * velocity, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);

    snap.connect(snapGain);
    snapGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + decaySec + 0.01);

    snap.start(now);
    snap.stop(now + 0.03);
  }

  public playCrash(type: 1 | 2 = 1, velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = type === 1 ? 1.4 : 1.1;

    // Cymbal noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(type === 1 ? 3800 : 4500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7 * velocity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration + 0.01);

    // Inharmonic metallic ring partials
    const ringFreqs = type === 1 ? [820, 1190, 1450, 2120] : [980, 1340, 1680, 2450];
    ringFreqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = 'square';
      ringOsc.frequency.setValueAtTime(freq, now);

      ringGain.gain.setValueAtTime(0.08 * velocity, now);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

      ringOsc.connect(ringGain);
      ringGain.connect(this.masterGain);

      ringOsc.start(now);
      ringOsc.stop(now + duration * 0.75);
    });
  }

  public playRide(velocity = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const duration = 0.9;

    // Distinct metallic bell "ping"
    const pingOsc = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    pingOsc.type = 'sine';
    pingOsc.frequency.setValueAtTime(2850, now);

    pingGain.gain.setValueAtTime(0.5 * velocity, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    pingOsc.connect(pingGain);
    pingGain.connect(this.masterGain);

    pingOsc.start(now);
    pingOsc.stop(now + 0.35);

    // Warm metallic sizzle
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(6200, now);
    filter.Q.setValueAtTime(4.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35 * velocity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Metronome click
  public playMetronomeClick(accent: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 1200 : 800, now);

    gain.gain.setValueAtTime(accent ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Procedural Backing Track accompaniment (Bass line + melodic groove)
  public startBackingTrack(style: 'rock' | 'pop' | 'funk', bpm: number = 90) {
    this.stopBackingTrack();
    this.initContext();
    this.currentBackingStyle = style;
    this.backingBpm = bpm;

    const intervalMs = (60 / bpm) * 1000 * 0.5; // Eighth note
    let step = 0;

    // Rock chord roots (E - G - A - C)
    const rockProgression = [41.2, 41.2, 49.0, 49.0, 55.0, 55.0, 65.4, 61.7]; // E1, G1, A1, C2
    // Pop progression (C - G - Am - F)
    const popProgression = [65.4, 65.4, 49.0, 49.0, 55.0, 55.0, 43.6, 43.6];
    // Funk groove (D minor pentatonic funk)
    const funkProgression = [73.4, 73.4, 82.4, 87.3, 98.0, 87.3, 82.4, 73.4];

    this.backingTrackTimer = window.setInterval(() => {
      if (!this.ctx || !this.backingGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      let rootFreq = 55;
      const progIndex = Math.floor(step / 2) % 8;

      if (style === 'rock') {
        rootFreq = rockProgression[progIndex];
      } else if (style === 'pop') {
        rootFreq = popProgression[progIndex];
      } else {
        rootFreq = funkProgression[progIndex];
      }

      // Play bass synth note on every beat & some 8ths
      if (step % 2 === 0 || (style === 'funk' && step % 4 === 3)) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const noteGain = this.ctx.createGain();

        bassOsc.type = style === 'rock' ? 'sawtooth' : 'sine';
        bassOsc.frequency.setValueAtTime(rootFreq, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(style === 'rock' ? 450 : 320, now);

        noteGain.gain.setValueAtTime(0.22, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 0.9);

        bassOsc.connect(bassFilter);
        bassFilter.connect(noteGain);
        noteGain.connect(this.backingGain);

        bassOsc.start(now);
        bassOsc.stop(now + (intervalMs / 1000) * 0.95);
      }

      // Play subtle chord stabs on beat 2 and 4
      if (step % 4 === 2) {
        const chordOsc1 = this.ctx.createOscillator();
        const chordOsc2 = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();

        chordOsc1.type = 'triangle';
        chordOsc2.type = 'triangle';

        chordOsc1.frequency.setValueAtTime(rootFreq * 3, now);
        chordOsc2.frequency.setValueAtTime(rootFreq * 3.75, now);

        chordGain.gain.setValueAtTime(0.08, now);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        chordOsc1.connect(chordGain);
        chordOsc2.connect(chordGain);
        chordGain.connect(this.backingGain);

        chordOsc1.start(now);
        chordOsc1.stop(now + 0.2);
        chordOsc2.start(now);
        chordOsc2.stop(now + 0.2);
      }

      step++;
    }, intervalMs);
  }

  public stopBackingTrack() {
    if (this.backingTrackTimer !== null) {
      clearInterval(this.backingTrackTimer);
      this.backingTrackTimer = null;
    }
    this.currentBackingStyle = null;
  }

  public isBackingPlaying(): boolean {
    return this.backingTrackTimer !== null;
  }

  public getCurrentBackingStyle(): string | null {
    return this.currentBackingStyle;
  }
}

export const soundEngine = new DrumSoundEngine();
