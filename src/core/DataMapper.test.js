/**
 * DataMapper tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataMapper } from './DataMapper.js';

// Mock AudioEngine
vi.mock('./AudioEngine.js', () => ({
  AudioEngine: vi.fn().mockImplementation(() => ({
    valueToFrequency: vi.fn((v, opts) => opts.minFreq + v * (opts.maxFreq - opts.minFreq))
  }))
}));

describe('DataMapper', () => {
  describe('analyze()', () => {
    it('should calculate extent from numeric data', () => {
      const mapper = new DataMapper({ pitch: { field: 'value' } });
      const data = [
        { datum: { value: 10 }, index: 0 },
        { datum: { value: 50 }, index: 1 },
        { datum: { value: 30 }, index: 2 }
      ];
      
      mapper.analyze(data);
      
      expect(mapper.extent).toEqual({ min: 10, max: 50 });
    });
    
    it('should handle empty data', () => {
      const mapper = new DataMapper();
      mapper.analyze([]);
      expect(mapper.extent).toBeUndefined();
    });
    
    it('should auto-detect value field', () => {
      const mapper = new DataMapper();
      const data = [
        { datum: { value: 100 }, index: 0 },
        { datum: { value: 200 }, index: 1 }
      ];
      
      mapper.analyze(data);
      
      expect(mapper.extent).toEqual({ min: 100, max: 200 });
    });
    
    it('should handle numeric datum directly', () => {
      const mapper = new DataMapper();
      const data = [
        { datum: 5, index: 0 },
        { datum: 15, index: 1 }
      ];
      
      mapper.analyze(data);
      
      expect(mapper.extent).toEqual({ min: 5, max: 15 });
    });
    
    it('should use accessor function', () => {
      const mapper = new DataMapper({ pitch: { field: d => d.x * 2 } });
      const data = [
        { datum: { x: 10 }, index: 0 },
        { datum: { x: 20 }, index: 1 }
      ];
      
      mapper.analyze(data);
      
      expect(mapper.extent).toEqual({ min: 20, max: 40 });
    });
  });
  
  describe('map()', () => {
    it('should map data point to audio parameters', () => {
      const mapper = new DataMapper({
        pitch: { field: 'value', range: [200, 800] },
        duration: 300
      });
      
      mapper.extent = { min: 0, max: 100 };
      
      const item = { datum: { value: 50 }, index: 0 };
      const params = mapper.map(item, 0, 1);
      
      expect(params).toHaveProperty('frequency');
      expect(params).toHaveProperty('volume');
      expect(params).toHaveProperty('pan');
      expect(params.duration).toBe(0.3);
    });
    
    it('should map pan based on position', () => {
      const mapper = new DataMapper({ pan: { range: [-1, 1] } });
      mapper.extent = { min: 0, max: 100 };
      
      const item = { datum: { value: 50 }, index: 5 };
      const params = mapper.map(item, 5, 11);
      
      expect(params.pan).toBe(0); // Middle position
    });
    
    it('should return center pan for single item', () => {
      const mapper = new DataMapper();
      mapper.extent = { min: 0, max: 100 };
      
      const params = mapper.map({ datum: 50, index: 0 }, 0, 1);
      
      expect(params.pan).toBe(0);
    });
  });
  
  describe('mapVolume()', () => {
    it('should return default volume without field', () => {
      const mapper = new DataMapper();
      const volume = mapper.mapVolume({ datum: { value: 50 }, index: 0 });
      expect(volume).toBe(0.5);
    });
    
    it('should map volume from field', () => {
      const mapper = new DataMapper({
        volume: { field: 'importance', range: [0.2, 0.8] }
      });
      mapper.extent = { min: 0, max: 100 };
      
      const volume = mapper.mapVolume({ datum: { importance: 50 }, index: 0 });
      
      expect(volume).toBeGreaterThanOrEqual(0.2);
      expect(volume).toBeLessThanOrEqual(0.8);
    });
  });
  
  describe('describe()', () => {
    it('should generate description with label', () => {
      const mapper = new DataMapper({ pitch: { field: 'value' } });
      mapper.extent = { min: 0, max: 100 };
      
      const desc = mapper.describe(
        { datum: { name: 'January', value: 42 }, index: 0 },
        0, 12
      );
      
      expect(desc).toContain('Point 1 of 12');
      expect(desc).toContain('January');
      expect(desc).toContain('42');
    });
    
    it('should handle numeric datum', () => {
      const mapper = new DataMapper();
      const desc = mapper.describe({ datum: 100, index: 0 }, 0, 5);
      
      expect(desc).toContain('Point 1 of 5');
      expect(desc).toContain('100');
    });
  });
  
  describe('summarize()', () => {
    it('should return count without extent', () => {
      const mapper = new DataMapper();
      const summary = mapper.summarize([{}, {}, {}]);
      expect(summary).toContain('3 data points');
    });
    
    it('should include range with extent', () => {
      const mapper = new DataMapper();
      mapper.extents = { pitch: { min: 10, max: 100 } };
      
      const summary = mapper.summarize([{}, {}, {}]);
      
      expect(summary).toContain('3 data points');
      expect(summary).toContain('10');
      expect(summary).toContain('100');
    });
  });
  
  describe('scatter plot support', () => {
    it('should detect scatter chart type from options', () => {
      const mapper = new DataMapper({ x: 'xField', y: 'yField' });
      expect(mapper.chartType).toBe('scatter');
    });
    
    it('should analyze both x and y extents for scatter plots', () => {
      const mapper = new DataMapper({ chartType: 'scatter', pitch: { field: 'y' } });
      const data = [
        { datum: { x: 10, y: 100 }, index: 0 },
        { datum: { x: 50, y: 500 }, index: 1 },
        { datum: { x: 30, y: 300 }, index: 2 }
      ];
      
      mapper.analyze(data);
      
      expect(mapper.extents.pitch).toEqual({ min: 100, max: 500 });
      expect(mapper.extents.x).toEqual({ min: 10, max: 50 });
    });
    
    it('should map x values to pan for scatter plots', () => {
      const mapper = new DataMapper({ chartType: 'scatter', pitch: { field: 'y' } });
      const data = [
        { datum: { x: 0, y: 100 }, index: 0 },
        { datum: { x: 100, y: 200 }, index: 1 }
      ];
      
      mapper.analyze(data);
      
      const firstPan = mapper.mapPan(data[0], 0, 2);
      const lastPan = mapper.mapPan(data[1], 1, 2);
      
      expect(firstPan).toBeCloseTo(-0.7, 1);
      expect(lastPan).toBeCloseTo(0.7, 1);
    });
    
    it('should describe scatter points with X and Y values', () => {
      const mapper = new DataMapper({ chartType: 'scatter', pitch: { field: 'y' } });
      const item = { datum: { x: 25, y: 150 }, index: 0 };
      
      const desc = mapper.describe(item, 0, 3);
      
      expect(desc).toContain('X: 25');
      expect(desc).toContain('Y: 150');
    });
  });
  
  describe('format()', () => {
    it('should format large numbers with locale', () => {
      const mapper = new DataMapper();
      expect(mapper.format(1000000)).toMatch(/1.*000.*000/);
    });
    
    it('should format decimals', () => {
      const mapper = new DataMapper();
      expect(mapper.format(3.14159)).toBe('3.14');
    });
    
    it('should pass through integers under 1000', () => {
      const mapper = new DataMapper();
      expect(mapper.format(42)).toBe('42');
    });
    
    it('should convert non-numbers to string', () => {
      const mapper = new DataMapper();
      expect(mapper.format('test')).toBe('test');
    });
  });
});

