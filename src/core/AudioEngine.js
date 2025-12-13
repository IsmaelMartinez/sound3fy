/**
 * AudioEngine - Web Audio API wrapper for tone generation
 */

const A4 = 440; // Hz - Concert pitch reference

export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
  }
  
  /** Initialize audio context (must be called after user gesture) */
  init() {
    if (this.context) return;
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.context.destination);
  }
  
  /** Resume if suspended (browser autoplay policy) */
  async resume() {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }
  
  /**
   * Play a tone with ADSR envelope
   * @param {Object} params - { frequency, duration, volume, pan }
   */
  playTone({ frequency = 440, duration = 0.2, volume = 0.5, pan = 0 } = {}) {
    this.init();
    
    const now = this.context.currentTime;
    
    // Create audio nodes
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    
    // Configure
    osc.type = 'sine';
    osc.frequency.value = frequency;
    panner.pan.value = pan;
    
    // Connect: osc → gain → panner → master
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);
    
    // ADSR envelope (attack, decay, sustain, release)
    const attack = 0.02, decay = 0.05, sustainLevel = 0.7, release = 0.1;
    const sustainTime = Math.max(0, duration - attack - decay - release);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(volume * sustainLevel, now + attack + decay);
    gain.gain.setValueAtTime(volume * sustainLevel, now + attack + decay + sustainTime);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    // Play
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }
  
  /** Play orientation marker sound */
  playMarker(type) {
    const markers = {
      start: { frequency: 880, duration: 0.1, volume: 0.4 },
      end: { frequency: 220, duration: 0.15, volume: 0.4 }
    };
    this.playTone(markers[type] || markers.start);
  }
  
  /** Clean up */
  destroy() {
    if (this.context?.state !== 'closed') {
      this.context?.close();
    }
    this.context = null;
  }
}

export default AudioEngine;
