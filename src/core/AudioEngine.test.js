/**
 * AudioEngine tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from './AudioEngine.js';

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn(),
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { value: 440, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  })),
  createGain: vi.fn(() => ({
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn()
  })),
  createStereoPanner: vi.fn(() => ({
    pan: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn()
  })),
  destination: {}
};

global.AudioContext = vi.fn(() => mockAudioContext);
global.webkitAudioContext = vi.fn(() => mockAudioContext);

describe('AudioEngine', () => {
  let engine;
  
  beforeEach(() => {
    engine = new AudioEngine();
    vi.clearAllMocks();
  });
  
  describe('init()', () => {
    it('should create audio context on first call', () => {
      engine.init();
      expect(global.AudioContext).toHaveBeenCalled();
      expect(engine.context).toBeDefined();
      expect(engine.masterGain).toBeDefined();
    });
    
    it('should not recreate context on subsequent calls', () => {
      engine.init();
      engine.init();
      expect(global.AudioContext).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('resume()', () => {
    it('should resume suspended context', async () => {
      engine.init();
      mockAudioContext.state = 'suspended';
      await engine.resume();
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });
    
    it('should not resume running context', async () => {
      engine.init();
      mockAudioContext.state = 'running';
      await engine.resume();
      expect(mockAudioContext.resume).not.toHaveBeenCalled();
    });
  });
  
  describe('playTone()', () => {
    it('should create and connect audio nodes', () => {
      engine.playTone({ frequency: 440, duration: 0.2 });
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createStereoPanner).toHaveBeenCalled();
    });
    
    it('should use default values', () => {
      engine.playTone();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });
  
  describe('valueToFrequency()', () => {
    beforeEach(() => engine.init());
    
    it('should return minFreq for value 0', () => {
      const freq = engine.valueToFrequency(0, { minFreq: 220, maxFreq: 880, scale: 'continuous' });
      expect(freq).toBe(220);
    });
    
    it('should return maxFreq for value 1', () => {
      const freq = engine.valueToFrequency(1, { minFreq: 220, maxFreq: 880, scale: 'continuous' });
      expect(freq).toBe(880);
    });
    
    it('should return midpoint for value 0.5 in continuous mode', () => {
      const freq = engine.valueToFrequency(0.5, { minFreq: 200, maxFreq: 800, scale: 'continuous' });
      expect(freq).toBe(500);
    });
    
    it('should clamp values below 0', () => {
      const freq = engine.valueToFrequency(-0.5, { minFreq: 220, maxFreq: 880, scale: 'continuous' });
      expect(freq).toBe(220);
    });
    
    it('should clamp values above 1', () => {
      const freq = engine.valueToFrequency(1.5, { minFreq: 220, maxFreq: 880, scale: 'continuous' });
      expect(freq).toBe(880);
    });
    
    it('should quantize to pentatonic scale', () => {
      const freq = engine.valueToFrequency(0.5, { minFreq: 220, maxFreq: 880, scale: 'pentatonic' });
      expect(freq).toBeGreaterThan(220);
      expect(freq).toBeLessThan(880);
    });
    
    it('should handle unknown scale as continuous', () => {
      const freq = engine.valueToFrequency(0.5, { minFreq: 200, maxFreq: 800, scale: 'unknown' });
      expect(freq).toBe(500);
    });
  });
  
  describe('playMarker()', () => {
    it('should play start marker', () => {
      engine.playMarker('start');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
    
    it('should play end marker', () => {
      engine.playMarker('end');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
    
    it('should default to start marker for unknown type', () => {
      engine.playMarker('unknown');
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });
  });
  
  describe('destroy()', () => {
    it('should close audio context', () => {
      engine.init();
      engine.destroy();
      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(engine.context).toBeNull();
    });
    
    it('should handle destroy without init', () => {
      expect(() => engine.destroy()).not.toThrow();
    });
  });
  
});

