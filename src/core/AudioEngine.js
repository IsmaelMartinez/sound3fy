/**
 * AudioEngine - Web Audio API wrapper with musical scale support
 */

// Musical scales in semitones from root note
const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],           // Pleasant, no dissonance (default)
  major: [0, 2, 4, 5, 7, 9, 11],         // Happy, bright
  minor: [0, 2, 3, 5, 7, 8, 10],         // Sad, serious
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],  // All notes
  blues: [0, 3, 5, 6, 7, 10],            // Bluesy feel
  whole: [0, 2, 4, 6, 8, 10]             // Dreamy, ambiguous
};

// Note frequencies for reference (A4 = 440Hz)
const A4 = 440;
const midiToFreq = (midi) => A4 * Math.pow(2, (midi - 69) / 12);
const freqToMidi = (freq) => 69 + 12 * Math.log2(freq / A4);

export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.compressor = null;
  }
  
  /** Initialize audio context (requires user gesture) */
  init() {
    if (this.context) return this;
    
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master gain
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.6;
    
    // Compressor to prevent clipping
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    
    // Connect: master → compressor → output
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.context.destination);
    
    return this;
  }
  
  /** Resume if suspended */
  async resume() {
    if (this.context?.state === 'suspended') await this.context.resume();
  }
  
  /**
   * Play a tone
   * @param {Object} params
   * @param {number} params.frequency - Frequency in Hz
   * @param {number} params.duration - Duration in seconds
   * @param {number} params.volume - Volume 0-1
   * @param {number} params.pan - Stereo pan -1 to 1
   * @param {string} params.type - Waveform: sine, triangle, square, sawtooth
   * @param {Object} params.envelope - ADSR envelope
   */
  playTone({
    frequency = 440,
    duration = 0.2,
    volume = 0.5,
    pan = 0,
    type = 'sine',
    envelope = {}
  } = {}) {
    this.init();
    
    const now = this.context.currentTime;
    const { attack = 0.02, decay = 0.05, sustain = 0.7, release = 0.1 } = envelope;
    
    // Create nodes
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    // Configure oscillator
    osc.type = type;
    osc.frequency.value = frequency;
    
    // Configure panner
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    
    // Connect: osc → gain → panner → master
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    // ADSR envelope
    const sustainLevel = volume * sustain;
    const sustainTime = Math.max(0, duration - attack - decay - release);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
    gain.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainTime);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    // Play
    osc.start(now);
    osc.stop(now + duration + 0.05);
    
    return this;
  }
  
  /**
   * Convert a normalized value (0-1) to a frequency using a musical scale
   * @param {number} value - Normalized value 0-1
   * @param {Object} options - { minFreq, maxFreq, scale }
   * @returns {number} Frequency in Hz
   */
  valueToFrequency(value, { minFreq = 220, maxFreq = 880, scale = 'pentatonic' } = {}) {
    const clamped = Math.max(0, Math.min(1, value));
    
    // Continuous mode - direct linear mapping
    if (scale === 'continuous' || !SCALES[scale]) {
      return minFreq + (maxFreq - minFreq) * clamped;
    }
    
    // Scale-quantized mode
    const intervals = SCALES[scale];
    const minMidi = freqToMidi(minFreq);
    const maxMidi = freqToMidi(maxFreq);
    
    // Calculate available notes in the scale within our range
    const notes = [];
    let midi = Math.floor(minMidi);
    const rootNote = midi - (midi % 12); // Round down to nearest C
    
    while (midi <= maxMidi) {
      const semitone = midi % 12;
      const octaveRoot = Math.floor(midi / 12) * 12;
      
      for (const interval of intervals) {
        const note = octaveRoot + interval;
        if (note >= minMidi && note <= maxMidi && !notes.includes(note)) {
          notes.push(note);
        }
      }
      midi += 12;
    }
    
    notes.sort((a, b) => a - b);
    
    if (notes.length === 0) return minFreq;
    
    // Map value to note index
    const noteIndex = Math.round(clamped * (notes.length - 1));
    return midiToFreq(notes[noteIndex]);
  }
  
  /** Play orientation marker */
  playMarker(type, options = {}) {
    const markers = {
      start: { frequency: 880, duration: 0.08, volume: 0.35, type: 'triangle' },
      end: { frequency: 220, duration: 0.12, volume: 0.35, type: 'triangle' },
      tick: { frequency: 660, duration: 0.03, volume: 0.2, type: 'sine' },
      error: { frequency: 200, duration: 0.3, volume: 0.4, type: 'sawtooth' }
    };
    
    const params = { ...markers[type], ...options };
    this.playTone(params);
    return this;
  }
  
  /** Play a chord (multiple frequencies) */
  playChord(frequencies, { duration = 0.3, volume = 0.4, type = 'sine' } = {}) {
    frequencies.forEach((freq, i) => {
      this.playTone({
        frequency: freq,
        duration,
        volume: volume / frequencies.length,
        type,
        pan: (i / (frequencies.length - 1)) * 0.6 - 0.3 // Spread slightly
      });
    });
    return this;
  }
  
  /** Set master volume */
  setVolume(vol) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
    return this;
  }
  
  /** Get available scales */
  static get scales() {
    return Object.keys(SCALES);
  }
  
  /** Clean up */
  destroy() {
    if (this.context?.state !== 'closed') this.context?.close();
    this.context = null;
  }
}

export default AudioEngine;
