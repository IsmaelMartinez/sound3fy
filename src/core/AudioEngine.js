/**
 * AudioEngine - Web Audio API wrapper with musical scale support
 */

// Musical scales (semitones from root)
const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  blues: [0, 3, 5, 6, 7, 10]
};

const A4 = 440;
const midiToFreq = (midi) => A4 * Math.pow(2, (midi - 69) / 12);

export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
  }
  
  init() {
    if (this.context) return this;
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.6;
    this.masterGain.connect(this.context.destination);
    return this;
  }
  
  async resume() {
    if (this.context?.state === 'suspended') await this.context.resume();
  }
  
  /**
   * Play a tone with ADSR envelope
   * @param {Object} options
   * @param {number} options.frequency - Frequency in Hz (default: 440)
   * @param {number} options.duration - Duration in seconds (default: 0.2)
   * @param {number} options.volume - Volume 0-1 (default: 0.5)
   * @param {number} options.pan - Stereo pan -1 to 1 (default: 0)
   * @param {string} options.instrument - Oscillator type: 'sine', 'triangle', 'square', 'sawtooth' (default: 'sine')
   * @param {Object} options.envelope - ADSR envelope settings
   */
  playTone({ frequency = 440, duration = 0.2, volume = 0.5, pan = 0, instrument = 'sine', envelope = {} } = {}) {
    this.init();
    
    const ctx = this.context;
    const now = ctx.currentTime;
    const { attack = 0.02, decay = 0.05, sustain = 0.7, release = 0.1 } = envelope;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    // Validate and set oscillator type
    const validTypes = ['sine', 'triangle', 'square', 'sawtooth'];
    osc.type = validTypes.includes(instrument) ? instrument : 'sine';
    osc.frequency.value = frequency;
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    // ADSR
    const sustainLevel = volume * sustain;
    const sustainTime = Math.max(0, duration - attack - decay - release);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
    gain.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainTime);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    osc.start(now);
    osc.stop(now + duration + 0.05);
    
    return this;
  }
  
  /**
   * Convert normalized value (0-1) to frequency using a musical scale
   */
  valueToFrequency(value, { minFreq = 220, maxFreq = 880, scale = 'pentatonic' } = {}) {
    const v = Math.max(0, Math.min(1, value));
    
    // Continuous mode - direct linear mapping
    if (scale === 'continuous' || !SCALES[scale]) {
      return minFreq + (maxFreq - minFreq) * v;
    }
    
    // Scale-quantized mode
    const intervals = SCALES[scale];
    const minMidi = 69 + 12 * Math.log2(minFreq / A4);
    const maxMidi = 69 + 12 * Math.log2(maxFreq / A4);
    
    // Build array of valid notes in range
    const notes = [];
    for (let octave = Math.floor(minMidi / 12); octave <= Math.ceil(maxMidi / 12); octave++) {
      for (const interval of intervals) {
        const midi = octave * 12 + interval;
        if (midi >= minMidi && midi <= maxMidi) notes.push(midi);
      }
    }
    
    if (notes.length === 0) return minFreq;
    
    const noteIndex = Math.round(v * (notes.length - 1));
    return midiToFreq(notes[noteIndex]);
  }
  
  /** Play marker sound */
  playMarker(type) {
    const markers = {
      start: { frequency: 880, duration: 0.08, volume: 0.35 },
      end: { frequency: 220, duration: 0.12, volume: 0.35 }
    };
    return this.playTone(markers[type] || markers.start);
  }
  
  /** Get audio context (for continuous mode) */
  getContext() {
    this.init();
    return this.context;
  }
  
  /** Get master gain node */
  getMasterGain() {
    this.init();
    return this.masterGain;
  }
  
  destroy() {
    if (this.context?.state !== 'closed') this.context?.close();
    this.context = null;
  }
}

export default AudioEngine;
