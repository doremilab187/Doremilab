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

  // Synthesizes an organic bubble water droplet (Agudo is high-pitch sparkle, Grave is deep plop)
  public playDrip(isAgudo: boolean, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;

    const t = time !== undefined ? time : this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const rippleOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Natural fluid water bubbles sweep frequencies upwards rather than downwards
    const startFreq = isAgudo ? 850 : 220;
    const endFreq = isAgudo ? 1950 : 560;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.12);

    rippleOsc.type = 'triangle';
    rippleOsc.frequency.setValueAtTime(startFreq * 1.5, t);
    rippleOsc.frequency.exponentialRampToValueAtTime(endFreq * 1.5, t + 0.08);

    gain.gain.setValueAtTime(isAgudo ? 0.3 : 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAgudo ? 1600 : 450, t);
    filter.Q.setValueAtTime(2.5, t);

    osc.connect(gain);
    rippleOsc.connect(gain);
    gain.connect(filter);
    filter.connect(this.ctx.destination);

    osc.start(t);
    rippleOsc.start(t);
    osc.stop(t + 0.16);
    rippleOsc.stop(t + 0.16);
  }

  // Synthesizes a happy hollow woodblock step representing walking steps
  public playWoodblockStep(time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;
    const t = time !== undefined ? time : this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Synthesizes a soft organic seed/maraca rattle (shaker) for agricultural sowing
  public playSeedScatter(time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;
    const t = time !== undefined ? time : this.ctx.currentTime;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.12);
  }

  // Synthesizes a beautiful natural wind gust using bandpass-filtered pinkish noise
  public playWindGust(durationSeconds: number, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;
    const t = time !== undefined ? time : this.ctx.currentTime;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate organic wind-like pink-ambient noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.09; // volume limit
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.8, t); // responsive whistling focus
    filter.frequency.setValueAtTime(260, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.4); // graceful fade-in

    // Simulate leafy breeze gusts by modulation of the bandpass cutoff frequency
    const steps = Math.floor(durationSeconds * 20);
    for (let i = 0; i < steps; i++) {
      const timeOffset = t + (i / 20);
      const ratio = i / steps;
      const wave = Math.sin(ratio * Math.PI);
      const microWind = Math.sin(ratio * Math.PI * 4) * 60;
      const freqVal = 260 + (wave * 420) + microWind + (Math.random() * 20);
      filter.frequency.linearRampToValueAtTime(freqVal, timeOffset);

      const ampVal = 0.04 + (wave * 0.18);
      gain.gain.linearRampToValueAtTime(ampVal, timeOffset);
    }

    gain.gain.setValueAtTime(gain.gain.value, t + durationSeconds - 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSeconds);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(t);
    noiseSource.stop(t + durationSeconds);
  }

  // Synthesizes clean solar wind chimes (gold metallic) and hollow wooden bars for solar march
  public playSolarChime(accented: boolean, time?: number) {
    this.initCtx();
    if (!this.ctx || this.isMuted || !this.soundEnabled) return;
    const t = time !== undefined ? time : this.ctx.currentTime;

    if (accented) {
      // Golden solar chime - multi-layered bell chime chord (B5, E6, G6, B6)
      const bells = [987.77, 1318.51, 1567.98, 1975.53];
      bells.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const delay = index * 0.012; // shimmering chime sweep

        gainNode.gain.setValueAtTime(0, t);
        gainNode.gain.linearRampToValueAtTime(0.07, t + delay + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.6);

        osc.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.65);
      });

      // Warm background earth pluck
      this.playPluck(392, t);
      this.playBom(t);
    } else {
      // Organic hollow wooden bar key hit
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.06);

      gainNode.gain.setValueAtTime(0.18, t);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    }
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

  private getProfileId(blockId: number): number {
    if (blockId <= 1) return 1;
    if (blockId === 2 || blockId === 3) return 2; // Tierra
    if (blockId === 4 || blockId === 5) return 3; // Agua
    if (blockId === 6 || blockId === 7) return 4; // Viento
    if (blockId === 8 || blockId === 9) return 5; // Trueno 1
    if (blockId === 10) return 6; // Trueno 2
    if (blockId === 11 || blockId === 12) return 7; // Sol
    return 8; // Final
  }

  // Metronome clock loop which triggers synthesized rhythm events automatically!
  public start(blockId: number, blockProgress: number) {
    this.initCtx();
    this.stop();
    this.soundEnabled = true;

    this.activeBlockId = blockId;
    const profileId = this.getProfileId(blockId);
    let stepCount = 0;

    // Background pads for narrative blocks
    if (profileId === 1) {
      this.startAmbientPad(130.81); // C3 deep ambient pad
      return;
    }

    if (profileId === 8) {
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

    if (profileId === 4) {
      // Viento: play a continuous series of beautiful, refreshing forest wind gusts
      this.startAmbientPad(220); // A3 breezy tone
      this.playWindGust(5, this.ctx!.currentTime);
      this.intervalId = setInterval(() => {
        if (this.ctx) {
          const t = this.ctx.currentTime;
          // Trigger a beautiful wind gust periodically
          if (stepCount % 4 === 0) {
            this.playWindGust(4.2, t);
          }
          // Soft melodic wooden pluck in the breeze
          this.playPluck(stepCount % 2 === 0 ? 330 : 440, t);
        }
        stepCount++;
      }, 1000);
      return;
    }

    // Set custom BPM tempo parameters based on active block instructions
    let computedIntervalMs = 60000 / 90; // Default 90 BPM
    
    if (profileId === 2) {
      computedIntervalMs = 60000 / 90; // 90 BPM
    } else if (profileId === 3) {
      computedIntervalMs = 60000 / 100; // 100 BPM
    } else if (profileId === 5) {
      computedIntervalMs = 60000 / 115; // 115 BPM rapid storm
    } else if (profileId === 6) {
      computedIntervalMs = 60000 / 75; // 75 BPM slow heavy industrial march
    } else if (profileId === 7) {
      // Progressively slows down according to block narrative (from 110 to 60)
      const tPercent = Math.min(blockProgress / 80, 1); // 80s block length
      const currentBpm = 110 - (tPercent * 50); // scales down
      computedIntervalMs = 60000 / currentBpm;
    }

    const runRhythmStep = () => {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const currentProfile = this.getProfileId(this.activeBlockId || blockId);

      switch (currentProfile) {
        case 2: // TIERRA: March + lanzar semillas + BOM grave
          const beatInBar = stepCount % 4;
          if (beatInBar === 0) {
            this.playBom(t);
            this.playSeedScatter(t);
          } else if (beatInBar === 2) {
            this.playWoodblockStep(t);
            this.playPluck(196, t); // Hollow Sol (G3)
          } else {
            this.playWoodblockStep(t);
          }
          break;

        case 3: // AGUA: Gotas (Agudo vs. Grave)
          // Alternates high vs low bubbles
          const dropletPattern = [true, false, true, true, false, true, false, false];
          const isAgudo = dropletPattern[stepCount % dropletPattern.length];
          this.playDrip(isAgudo, t);
          if (stepCount % 2 === 0) {
            this.playPluck(261.63, t); // C4
          }
          break;

        case 5: // TRUENO 1: Contraste súbito & Rayo
          if (stepCount % 10 === 0) {
            this.playLightning(t);
          } else {
            this.playWoodblockStep(t);
          }
          break;

        case 6: // TRUENO 2: Sigilo & Estatua Congelados
          const marchBeat = stepCount % 8;
          if (marchBeat === 0 || marchBeat === 3) {
            // sudden lightning strike (congelarse!)
            this.playLightning(t);
          } else {
            // cautious tip-toe wooden steps
            this.playWoodblockStep(t);
          }
          break;

        case 7: // LLAMADO SOL: Acentos del Sol
          const solarBeat = stepCount % 4;
          this.playSolarChime(solarBeat === 0, t);
          break;

        default:
          break;
      }

      stepCount++;

      // Recalculate tempo dynamically for block 7 (solar transition)
      const dynamicProfile = this.getProfileId(this.activeBlockId || blockId);
      if (dynamicProfile === 7) {
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

  public playSoundLogo(callback?: () => void) {
    this.initCtx();
    if (!this.ctx) {
      if (callback) callback();
      return;
    }
    
    this.stop();
    const t = this.ctx.currentTime;
    
    // Tap x4 (woodblock)
    this.playWoodblockStep(t);
    this.playWoodblockStep(t + 0.25);
    this.playWoodblockStep(t + 0.5);
    this.playWoodblockStep(t + 0.75);
    
    // DO
    setTimeout(() => {
      if (this.isMuted || !this.soundEnabled) return;
      this.playPluck(261.63); // C4
    }, 1000);
    
    // RE
    setTimeout(() => {
      if (this.isMuted || !this.soundEnabled) return;
      this.playPluck(293.66); // D4
    }, 1500);
    
    // MI
    setTimeout(() => {
      if (this.isMuted || !this.soundEnabled) return;
      this.playPluck(329.63); // E4
    }, 2000);
    
    // Glissando / Scale leading up to LAB!
    const glissandoNotes = [
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
    ];
    glissandoNotes.forEach((freq, idx) => {
      setTimeout(() => {
        if (this.isMuted || !this.soundEnabled) return;
        this.playPluck(freq);
      }, 2500 + (idx * 120));
    });
    
    // LAB! Grand Chime & Rich C Major Chord Resolution
    setTimeout(() => {
      if (this.isMuted || !this.soundEnabled) return;
      this.playSolarChime(true);
      
      // Synthesis of an extra-rich resonance chord: C4, E4, G4, C5, E5, C6
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50];
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 2.1);
      });
    }, 3500);

    // Call back once fully resolved (e.g. at 5.5s)
    setTimeout(() => {
      if (callback) callback();
    }, 5500);
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
