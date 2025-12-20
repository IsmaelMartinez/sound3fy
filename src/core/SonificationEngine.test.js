/**
 * SonificationEngine tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock AudioEngine - must be before import
vi.mock('./AudioEngine.js', () => {
  const AudioEngine = function() {
    this.init = vi.fn().mockReturnThis();
    this.resume = vi.fn().mockResolvedValue(undefined);
    this.playTone = vi.fn().mockReturnThis();
    this.playMarker = vi.fn().mockReturnThis();
    this.getContext = vi.fn().mockReturnValue({ currentTime: 0 });
    this.getMasterGain = vi.fn().mockReturnValue({ connect: vi.fn() });
    this.destroy = vi.fn();
  };
  return { AudioEngine };
});

// Mock DataMapper
vi.mock('./DataMapper.js', () => {
  const DataMapper = function() {
    this.analyze = vi.fn();
    this.map = vi.fn().mockReturnValue({ frequency: 440, volume: 0.5, pan: 0, duration: 0.2 });
    this.describe = vi.fn().mockReturnValue('Point 1 of 3');
    this.summarize = vi.fn().mockReturnValue('3 data points');
  };
  return { DataMapper };
});

import { SonificationEngine } from './SonificationEngine.js';

// Mock DOM
const mockElement = {
  setAttribute: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  classList: { add: vi.fn(), remove: vi.fn() },
  removeAttribute: vi.fn()
};

const mockSelection = {
  each: vi.fn((callback) => {
    callback.call(mockElement, { value: 10 }, 0);
  })
};

describe('SonificationEngine', () => {
  let engine;
  
  beforeEach(() => {
    vi.useFakeTimers();
    engine = new SonificationEngine({
      duration: 200,
      gap: 50,
      markers: { start: true, end: true }
    });
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });
  
  describe('bind()', () => {
    it('should store selection and data', () => {
      const data = [
        { datum: { value: 10 }, index: 0, element: mockElement }
      ];
      
      engine.bind(mockSelection, data);
      
      expect(engine.selection).toBe(mockSelection);
      expect(engine.data).toBe(data);
    });
    
    it('should analyze data', () => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
      
      expect(engine.mapper.analyze).toHaveBeenCalledWith(data);
    });
    
    it('should set up keyboard navigation', () => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
    
    it('should set up hover handlers', () => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
      
      expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
      expect(mockElement.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
    });
  });
  
  describe('play()', () => {
    beforeEach(() => {
      const data = [
        { datum: { value: 10 }, index: 0, element: mockElement },
        { datum: { value: 20 }, index: 1, element: mockElement },
        { datum: { value: 30 }, index: 2, element: mockElement }
      ];
      engine.bind(mockSelection, data);
    });
    
    it('should set playing state', async () => {
      const playPromise = engine.play();
      await vi.advanceTimersByTimeAsync(600); // Allow for 500ms summary delay
      await playPromise;
      
      expect(engine.playing).toBe(true);
      expect(engine.paused).toBe(false);
    });
    
    it('should initialize audio', async () => {
      engine.play();
      await vi.advanceTimersByTimeAsync(100);
      
      expect(engine.audio.init).toHaveBeenCalled();
    });
    
    it('should play start marker when markers.start is true', async () => {
      const playPromise = engine.play();
      await vi.advanceTimersByTimeAsync(600); // Allow for 500ms summary delay
      await playPromise;
      
      expect(engine.audio.playMarker).toHaveBeenCalledWith('start');
    });
    
    it('should not play start marker when markers.start is false', async () => {
      const engineNoMarker = new SonificationEngine({
        duration: 200,
        markers: { start: false, end: false }
      });
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engineNoMarker.bind(mockSelection, data);
      
      const playPromise = engineNoMarker.play();
      await vi.advanceTimersByTimeAsync(600); // Allow for 500ms summary delay
      await playPromise;
      
      expect(engineNoMarker.audio.playMarker).not.toHaveBeenCalledWith('start');
    });
    
    it('should announce chart summary by default', async () => {
      engine.play();
      await vi.advanceTimersByTimeAsync(100);
      
      expect(engine.mapper.summarize).toHaveBeenCalledWith(engine.data);
    });
    
    it('should skip summary announcement when announceSummary is false', async () => {
      const engineNoSummary = new SonificationEngine({
        duration: 200,
        accessibility: { announceSummary: false }
      });
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engineNoSummary.bind(mockSelection, data);
      
      const playPromise = engineNoSummary.play();
      await vi.advanceTimersByTimeAsync(100);
      await playPromise;
      
      expect(engineNoSummary.mapper.summarize).not.toHaveBeenCalled();
    });
  });
  
  describe('pause()', () => {
    it('should set paused state', () => {
      engine.playing = true;
      engine.pause();
      
      expect(engine.paused).toBe(true);
    });
    
    it('should clear timer', () => {
      engine.playing = true;
      engine.timer = setTimeout(() => {}, 1000);
      engine.pause();
      
      expect(engine.paused).toBe(true);
    });
  });
  
  describe('stop()', () => {
    it('should reset all state', () => {
      engine.playing = true;
      engine.paused = true;
      engine.index = 5;
      
      engine.stop();
      
      expect(engine.playing).toBe(false);
      expect(engine.paused).toBe(false);
      expect(engine.index).toBe(-1);
    });
  });
  
  describe('toggle()', () => {
    beforeEach(() => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
    });
    
    it('should pause when playing', () => {
      engine.playing = true;
      engine.paused = false;
      
      engine.toggle();
      
      expect(engine.paused).toBe(true);
    });
    
    it('should play when paused', async () => {
      engine.playing = true;
      engine.paused = true;
      
      engine.toggle();
      await vi.advanceTimersByTimeAsync(100);
      
      expect(engine.paused).toBe(false);
    });
  });
  
  describe('navigation', () => {
    beforeEach(() => {
      const data = [
        { datum: { value: 10 }, index: 0, element: mockElement },
        { datum: { value: 20 }, index: 1, element: mockElement },
        { datum: { value: 30 }, index: 2, element: mockElement }
      ];
      engine.bind(mockSelection, data);
    });
    
    it('next() should advance index', () => {
      engine.index = 0;
      engine.next();
      expect(engine.index).toBe(1);
    });
    
    it('next() should not exceed data length', () => {
      engine.index = 2;
      engine.next();
      expect(engine.index).toBe(2);
    });
    
    it('previous() should decrease index', () => {
      engine.index = 2;
      engine.previous();
      expect(engine.index).toBe(1);
    });
    
    it('previous() should not go below 0', () => {
      engine.index = 0;
      engine.previous();
      expect(engine.index).toBe(0);
    });
    
    it('first() should go to index 0', () => {
      engine.index = 2;
      engine.first();
      expect(engine.index).toBe(0);
    });
    
    it('last() should go to last index', () => {
      engine.index = 0;
      engine.last();
      expect(engine.index).toBe(2);
    });
  });
  
  describe('setSpeed()', () => {
    it('should set speed within bounds', () => {
      engine.setSpeed(2);
      expect(engine.speed).toBe(2);
    });
    
    it('should clamp speed to minimum', () => {
      engine.setSpeed(0.1);
      expect(engine.speed).toBe(0.25);
    });
    
    it('should clamp speed to maximum', () => {
      engine.setSpeed(10);
      expect(engine.speed).toBe(4);
    });
  });
  
  describe('setMode()', () => {
    it('should set continuous mode', () => {
      engine.setMode('continuous');
      expect(engine.mode).toBe('continuous');
    });
    
    it('should set discrete mode', () => {
      engine.setMode('discrete');
      expect(engine.mode).toBe('discrete');
    });
    
    it('should default to discrete for unknown mode', () => {
      engine.setMode('unknown');
      expect(engine.mode).toBe('discrete');
    });
  });
  
  describe('state getters', () => {
    it('isPlaying() returns correct state', () => {
      engine.playing = true;
      engine.paused = false;
      expect(engine.isPlaying()).toBe(true);
      
      engine.paused = true;
      expect(engine.isPlaying()).toBe(false);
    });
    
    it('isPaused() returns correct state', () => {
      engine.paused = true;
      expect(engine.isPaused()).toBe(true);
    });
    
    it('currentIndex() returns index', () => {
      engine.index = 5;
      expect(engine.currentIndex()).toBe(5);
    });
    
    it('length() returns data length', () => {
      engine.data = [{}, {}, {}];
      expect(engine.length()).toBe(3);
    });
    
    it('getMode() returns mode', () => {
      engine.mode = 'continuous';
      expect(engine.getMode()).toBe('continuous');
    });
  });
  
  describe('destroy()', () => {
    it('should stop playback', () => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
      engine.playing = true;
      
      engine.destroy();
      
      expect(engine.playing).toBe(false);
    });
    
    it('should destroy audio engine', () => {
      const data = [{ datum: { value: 10 }, index: 0, element: mockElement }];
      engine.bind(mockSelection, data);
      
      engine.destroy();
      
      expect(engine.audio.destroy).toHaveBeenCalled();
    });
  });
});

