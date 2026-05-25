/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private intervalId: any = null;
  private activeBlockId: number | null = null;
  private tempo: number = 90; // BPM
  private soundEnabled: boolean = true;
  private bgOsc: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.ctx && this.bgGain) {
      this.bgGain.gain.setValueAtTime(mute ? 0 : 0.08, this.ctx.currentTime);
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  // Purely synthesizes a high-fidelity deep percussion (bombo) "BOM!"
  public playBom(time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep swoop from 140Hz down to 45Hz
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  // Synthesizes a high droplet (Agudo, e.g. 1500Hz) or a lower droplet (Grave, e.g. 350Hz)
  public playDrip(isAgudo: boolean, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = isAgudo ? 1320 : 330; // E6 vs E4

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + 0.15);

    // Add metallic ring
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2.01, t);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  // Synthesizes a guitar-style melodic pluck sound
  public playPluck(freq: number, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(freq * 2, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    oscHarmonic.start(t);
    osc.stop(t + 0.55);
    oscHarmonic.stop(t + 0.55);
  }

  // Synthesizes a loud, terrifying crack of lightning using modeled noise
  public playLightning(time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;
    
    // Create noise buffer
    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filter to shape raw noise into explosion rumbles
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 0.82);
    filter.Q.setValueAtTime(4, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.08); // initial clap
    gain.gain.setValueAtTime(0.4, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2); // low rumble decay

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    // Also trigger an extreme high pitch crack oscillator
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(800, t);
    crackOsc.frequency.linearRampToValueAtTime(100, t + 0.15);
    crackGain.gain.setValueAtTime(0.25, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    crackOsc.connect(crackGain);
    crackGain.connect(this.ctx.destination);

    noiseSource.start(t);
    crackOsc.start(t);
    noiseSource.stop(t + 1.5);
    crackOsc.stop(t + 0.2);
  }

  // Synthesizes a snare drum or marching hit
  public playMarchSnare(accented: boolean, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;

    // Drum body sweep
    const osc = this.ctx.createOscillator();
    const gainOsc = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(accented ? 130 : 90, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

    gainOsc.gain.setValueAtTime(accented ? 0.6 : 0.35, t);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gainOsc);
    gainOsc.connect(this.ctx.destination);

    // Snare rattle (white noise)
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(700, t);

    const gainNoise = this.ctx.createGain();
    gainNoise.gain.setValueAtTime(accented ? 0.38 : 0.18, t);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(this.ctx.destination);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.25);
    noise.stop(t + 0.25);

    if (accented) {
      // Trigger a bright cymbal/bouncing highlight ring for Sol's acentos
      const cymOsc = this.ctx.createOscillator();
      const cymGain = this.ctx.createGain();
      cymOsc.type = 'triangle';
      cymOsc.frequency.setValueAtTime(2500, t);
      cymGain.gain.setValueAtTime(0.08, t);
      cymGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      cymOsc.connect(cymGain);
      cymGain.connect(this.ctx.destination);
      cymOsc.start(t);
      cymOsc.stop(t + 0.5);
    }
  }

  // Generates a soft constant wind sound in the background for dynamics
  public startWind(intensity: number) { // intensity 0 to 1
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    if (!this.filterNode) {
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.Q.setValueAtTime(2, this.ctx.currentTime);
      this.filterNode.connect(this.ctx.destination);
    }

    this.filterNode.frequency.setValueAtTime(220 + (intensity * 600), this.ctx.currentTime);
  }

  // Metronome clock loop which triggers synthesized rhythm events automatically!
  public start(blockId: number, blockProgress: number) {
    this.initCtx();
    this.stop();
    this.soundEnabled = true;

    this.activeBlockId = blockId;
    let stepCount = 0;

    // Background pads for narrative blocks
    if (blockId === 1) {
      this.startAmbientPad(130.81); // C3 deep ambient pad
      return;
    }

    if (blockId === 8) {
      this.startAmbientPad(261.63); // Victory C4 major harmony pad
      this.intervalId = setInterval(() => {
        // Play a beautiful, happy combined arpeggio periodically!
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic
        const note = notes[stepCount % notes.length];
        this.playPluck(note);
        if (stepCount % 4 === 0) {
          this.playDrip(true);
        }
        stepCount++;
      }, 500);
      return;
    }

    if (blockId === 4) {
      // Viento: dynamic wind sound is calculated
      this.startAmbientPad(220); // A3 breezy tone
      let intensity = 0.2;
      this.intervalId = setInterval(() => {
        // Slowly oscillate the wind speed
        intensity = 0.3 + 0.4 * Math.sin(stepCount * 0.25);
        if (this.ctx) {
          const t = this.ctx.currentTime;
          this.playPluck(330, t); // soft wind melody note E4
          if (stepCount % 4 === 0) {
            this.playPluck(440, t); // A4
          }
        }
        stepCount++;
      }, 1000);
      return;
    }

    // Set custom BPM tempo parameters based on active block instructions
    let computedIntervalMs = 60000 / 90; // Default 90 BPM
    
    if (blockId === 2) {
      computedIntervalMs = 60000 / 90; // 90 BPM
    } else if (blockId === 3) {
      computedIntervalMs = 60000 / 100; // 100 BPM
    } else if (blockId === 5) {
      computedIntervalMs = 60000 / 120; // 120 BPM rapid storm
    } else if (blockId === 6) {
      computedIntervalMs = 60000 / 75; // 75 BPM slow heavy industrial march
    } else if (blockId === 7) {
      // Progressively slows down according to block narrative (from 110 to 60)
      const tPercent = Math.min(blockProgress / 80, 1); // 80s block length
      const currentBpm = 110 - (tPercent * 50); // scales down
      computedIntervalMs = 60000 / currentBpm;
    }

    const runRhythmStep = () => {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      switch (this.activeBlockId) {
        case 2: // TIERRA: March + lanzar semillas + BOM grave
          // Play deep BOM on beat 0, guitar plucks on other beats
          const beatInBar = stepCount % 4;
          if (beatInBar === 0) {
            this.playBom(t);
            this.playPluck(196, t); // Sol (G3)
          } else if (beatInBar === 2) {
            this.playPluck(220, t); // La (A4)
            this.playPluck(196 * 1.5, t); // D4 pluck
          } else {
            this.playPluck(196, t); // standard guitar beat
          }
          break;

        case 3: // AGUA: Gotas (Agudo vs. Grave)
          // Alternates high vs low droplets
          const dropletPattern = [true, false, true, true, false, true, false, false];
          const isAgudo = dropletPattern[stepCount % dropletPattern.length];
          this.playDrip(isAgudo, t);
          // light guitar backing pluck
          if (stepCount % 2 === 0) {
            this.playPluck(261.63, t); // C4
          }
          break;

        case 5: // TRUENO 1: Contraste súbito & Rayo
          // Continuous Wind with sudden random lightning strikes
          if (stepCount % 12 === 0) {
            this.playLightning(t);
          } else {
            this.playPluck(147 + (Math.sin(stepCount) * 10), t); // tense notes
          }
          break;

        case 6: // TRUENO 2: Sigilo & Estatua Congelados
          const marchBeat = stepCount % 8;
          if (marchBeat === 0 || marchBeat === 3) {
            // sudden lightning strike (congelarse!)
            this.playLightning(t);
          } else {
            // heavy metallic industrial percussion step
            this.playMarchSnare(false, t);
          }
          break;

        case 7: // LLAMADO SOL: Marcha militar (BPM 110 -> 60) + Acentuaciones
          const solarBeat = stepCount % 4;
          if (solarBeat === 0) {
            // ACENTO - Trigger big salto jump beat!
            this.playMarchSnare(true, t);
            this.playBom(t);
          } else {
            // standard march beat step
            this.playMarchSnare(false, t);
          }
          break;

        default:
          break;
      }

      stepCount++;

      // Recalculate tempo dynamically for block 7 (solar transition)
      if (this.activeBlockId === 7) {
        // Adjust the timer interval
        clearInterval(this.intervalId);
        const elapsed = stepCount * (computedIntervalMs / 1000);
        const tPercent = Math.min(elapsed / 80, 1);
        const currentBpm = 110 - (tPercent * 50);
        computedIntervalMs = 60000 / currentBpm;
        this.intervalId = setInterval(runRhythmStep, computedIntervalMs);
      }
    };

    // run rhythm step immediately and setup interval
    runRhythmStep();
    this.intervalId = setInterval(runRhythmStep, computedIntervalMs);
  }

  private startAmbientPad(freq: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    try {
      this.stopAmbientPad();

      this.bgOsc = this.ctx.createOscillator();
      this.bgGain = this.ctx.createGain();

      this.bgOsc.type = 'triangle';
      this.bgOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.bgGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);

      this.bgOsc.connect(this.bgGain);
      this.bgGain.connect(this.ctx.destination);

      this.bgOsc.start();
    } catch (e) {
      console.error(e);
    }
  }

  private stopAmbientPad() {
    if (this.bgOsc) {
      try {
        this.bgOsc.stop();
        this.bgOsc.disconnect();
      } catch (e) {}
      this.bgOsc = null;
    }
    if (this.bgGain) {
      this.bgGain.disconnect();
      this.bgGain = null;
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stopAmbientPad();
    this.activeBlockId = null;
  }
}

// Single core instance export
export const audioInstance = new AudioEngine();
