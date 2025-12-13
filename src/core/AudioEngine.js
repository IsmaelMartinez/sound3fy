/**
 * AudioEngine - Low-level Web Audio API wrapper
 * 
 * Handles sound generation, scheduling, and playback using the Web Audio API.
 * Provides a clean interface for playing tones, sequences, and orientation sounds.
 */

// Musical scales in semitones from root
const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],      // Major pentatonic (C-D-E-G-A)
  major: [0, 2, 4, 5, 7, 9, 11],    // Major scale
  minor: [0, 2, 3, 5, 7, 8, 10],    // Natural minor
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]  // All semitones
};

// Reference frequencies
const A4 = 440; // Hz - Concert pitch

export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.activeOscillators = [];
  }
  
  /**
   * Initialize the audio context
   * Must be called after a user gesture (click, keypress, etc.)
   */
  initialize() {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.context.destination);
      this.isInitialized = true;
    } catch (e) {
      console.error('sound3fy: Failed to initialize Web Audio API', e);
      throw new Error('Web Audio API not supported');
    }
  }
  
  /**
   * Resume audio context if suspended (browser autoplay policy)
   */
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
  
  /**
   * Play a single tone
   * 
   * @param {Object} params - Tone parameters
   * @param {number} params.frequency - Frequency in Hz
   * @param {number} params.duration - Duration in seconds
   * @param {number} params.volume - Volume 0-1
   * @param {number} params.pan - Stereo pan -1 (left) to 1 (right)
   * @param {string} params.type - Oscillator type: sine, square, sawtooth, triangle
   * @param {Object} params.envelope - ADSR envelope
   * @param {number} params.startTime - When to start (audioContext time)
   */
  playTone({
    frequency = 440,
    duration = 0.2,
    volume = 0.5,
    pan = 0,
    type = 'sine',
    envelope = { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.1 },
    startTime = null
  } = {}) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const now = startTime ?? this.context.currentTime;
    
    // Create oscillator
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    // Create gain for envelope
    const gainNode = this.context.createGain();
    gainNode.gain.value = 0;
    
    // Create stereo panner
    const panner = this.context.createStereoPanner();
    panner.pan.value = pan;
    
    // Connect: oscillator -> gain -> panner -> master
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);
    
    // Apply ADSR envelope
    const { attack, decay, sustain, release } = envelope;
    const sustainLevel = volume * sustain;
    const sustainDuration = Math.max(0, duration - attack - decay - release);
    
    // Attack
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    
    // Decay
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
    
    // Sustain (hold at sustain level)
    gainNode.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainDuration);
    
    // Release
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    // Start and stop oscillator
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01); // Small buffer
    
    // Track active oscillator
    this.activeOscillators.push(oscillator);
    oscillator.onended = () => {
      const index = this.activeOscillators.indexOf(oscillator);
      if (index > -1) {
        this.activeOscillators.splice(index, 1);
      }
    };
    
    return oscillator;
  }
  
  /**
   * Play a sequence of tones
   * 
   * @param {Array} tones - Array of tone parameter objects
   * @param {Object} options - Sequence options
   * @param {number} options.gap - Gap between tones in seconds
   * @returns {Promise} Resolves when sequence completes
   */
  playSequence(tones, { gap = 0.05 } = {}) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    return new Promise((resolve) => {
      let currentTime = this.context.currentTime;
      
      tones.forEach((tone, index) => {
        const duration = tone.duration || 0.2;
        this.playTone({
          ...tone,
          startTime: currentTime
        });
        currentTime += duration + gap;
      });
      
      // Calculate total duration and resolve when done
      const totalDuration = currentTime - this.context.currentTime;
      setTimeout(resolve, totalDuration * 1000);
    });
  }
  
  /**
   * Play orientation marker sound
   * @param {string} type - 'start', 'end', 'axis', 'zero'
   */
  playMarker(type = 'start') {
    const markers = {
      start: { frequency: 880, duration: 0.1, type: 'triangle', volume: 0.4 },
      end: { frequency: 220, duration: 0.2, type: 'triangle', volume: 0.4 },
      axis: { frequency: 440, duration: 0.05, type: 'sine', volume: 0.2 },
      zero: { frequency: 330, duration: 0.1, type: 'sine', volume: 0.3 }
    };
    
    const params = markers[type] || markers.start;
    this.playTone({
      ...params,
      envelope: { attack: 0.01, decay: 0.02, sustain: 0.8, release: 0.05 }
    });
  }
  
  /**
   * Convert value to frequency using a musical scale
   * 
   * @param {number} value - Normalized value 0-1
   * @param {Object} options - Mapping options
   * @returns {number} Frequency in Hz
   */
  valueToFrequency(value, {
    minFreq = 220,
    maxFreq = 880,
    scale = 'pentatonic'
  } = {}) {
    // Clamp value to 0-1
    const clampedValue = Math.max(0, Math.min(1, value));
    
    if (scale === 'continuous') {
      // Linear interpolation (logarithmic would be more accurate)
      return minFreq + (maxFreq - minFreq) * clampedValue;
    }
    
    // Get scale intervals
    const intervals = SCALES[scale] || SCALES.pentatonic;
    
    // Calculate number of octaves in our range
    const minMidi = this.freqToMidi(minFreq);
    const maxMidi = this.freqToMidi(maxFreq);
    const midiRange = maxMidi - minMidi;
    
    // Map value to MIDI note within scale
    const totalNotes = Math.floor(midiRange / 12) * intervals.length;
    const noteIndex = Math.round(clampedValue * (totalNotes - 1));
    
    const octave = Math.floor(noteIndex / intervals.length);
    const scaleIndex = noteIndex % intervals.length;
    
    const midiNote = minMidi + (octave * 12) + intervals[scaleIndex];
    
    return this.midiToFreq(Math.min(midiNote, maxMidi));
  }
  
  /**
   * Convert MIDI note number to frequency
   */
  midiToFreq(midi) {
    return A4 * Math.pow(2, (midi - 69) / 12);
  }
  
  /**
   * Convert frequency to MIDI note number
   */
  freqToMidi(freq) {
    return 69 + 12 * Math.log2(freq / A4);
  }
  
  /**
   * Stop all playing sounds
   */
  stopAll() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator may have already stopped
      }
    });
    this.activeOscillators = [];
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume 0-1
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Get current time from audio context
   */
  get currentTime() {
    return this.context ? this.context.currentTime : 0;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stopAll();
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }
    this.isInitialized = false;
  }
}

export default AudioEngine;

