/**
 * DataMapper - Maps data to audio parameters with smart defaults
 */

import { AudioEngine } from './AudioEngine.js';

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.extents = {};
    this.audioEngine = new AudioEngine();
  }
  
  /** Analyze dataset to calculate extents for all mapped fields */
  analyze(data) {
    if (!data?.length) return;
    
    // Analyze pitch field
    const pitchField = this.options.pitch?.field;
    if (pitchField) {
      this.extents.pitch = this.calcExtent(data, pitchField);
    } else {
      // Try to auto-detect numeric data
      this.extents.pitch = this.autoDetectExtent(data);
    }
    
    // Analyze volume field (if different from pitch)
    const volumeField = this.options.volume?.field;
    if (volumeField && volumeField !== pitchField) {
      this.extents.volume = this.calcExtent(data, volumeField);
    }
    
    // Analyze duration field
    const durationField = this.options.duration?.field;
    if (durationField) {
      this.extents.duration = this.calcExtent(data, durationField);
    }
  }
  
  /** Calculate min/max for a field */
  calcExtent(data, field) {
    const accessor = this.accessor(field);
    const values = data.map(d => accessor(d.datum, d.index)).filter(v => typeof v === 'number');
    if (values.length === 0) return null;
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  
  /** Auto-detect extent from data */
  autoDetectExtent(data) {
    const values = data.map(d => {
      const datum = d.datum;
      if (typeof datum === 'number') return datum;
      if (typeof datum?.value === 'number') return datum.value;
      if (typeof datum?.y === 'number') return datum.y;
      return null;
    }).filter(v => v !== null);
    
    if (values.length === 0) return null;
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  
  /** Create accessor function */
  accessor(field) {
    if (typeof field === 'function') return field;
    if (typeof field === 'string') return (d) => d?.[field];
    return (d) => (typeof d === 'number' ? d : d?.value ?? d?.y ?? 0);
  }
  
  /** Map data point to audio parameters */
  map(item, index, total) {
    return {
      frequency: this.mapPitch(item, index, total),
      volume: this.mapVolume(item, index),
      pan: this.mapPan(index, total),
      duration: this.mapDuration(item, index),
      type: this.mapTimbre(item, index)
    };
  }
  
  /** Map to frequency */
  mapPitch(item, index, total) {
    const config = this.options.pitch || {};
    const range = config.range || [220, 880];
    const scale = config.scale || 'pentatonic';
    
    // Get value
    const accessor = this.accessor(config.field);
    const value = accessor(item.datum, item.index);
    
    if (typeof value !== 'number') return 440;
    
    // Normalize to 0-1
    const extent = this.extents.pitch;
    const normalized = extent && extent.max !== extent.min
      ? (value - extent.min) / (extent.max - extent.min)
      : 0.5;
    
    // Convert to frequency using scale
    return this.audioEngine.valueToFrequency(normalized, {
      minFreq: range[0],
      maxFreq: range[1],
      scale
    });
  }
  
  /** Map to volume */
  mapVolume(item, index) {
    const config = this.options.volume || {};
    const range = config.range || [0.4, 0.7];
    
    if (!config.field) return (range[0] + range[1]) / 2;
    
    const accessor = this.accessor(config.field);
    const value = accessor(item.datum, item.index);
    
    if (typeof value !== 'number') return 0.5;
    
    const extent = this.extents.volume || this.extents.pitch;
    return this.lerp(value, extent, range);
  }
  
  /** Map to stereo pan */
  mapPan(index, total) {
    if (total <= 1) return 0;
    
    const range = this.options.pan?.range || [-0.7, 0.7];
    const t = index / (total - 1);
    return range[0] + t * (range[1] - range[0]);
  }
  
  /** Map to duration */
  mapDuration(item, index) {
    const config = this.options.duration;
    
    // Simple number duration
    if (typeof config === 'number') return config / 1000;
    
    // Object with field mapping
    if (config?.field) {
      const accessor = this.accessor(config.field);
      const value = accessor(item.datum, item.index);
      const range = config.range || [100, 400];
      const extent = this.extents.duration || this.extents.pitch;
      return this.lerp(value, extent, range) / 1000;
    }
    
    return 0.2; // Default 200ms
  }
  
  /** Map to timbre (waveform type) */
  mapTimbre(item, index) {
    const config = this.options.timbre;
    if (!config) return 'sine';
    
    if (typeof config === 'string') return config;
    
    // Map category to timbre
    if (config.field) {
      const accessor = this.accessor(config.field);
      const value = accessor(item.datum, item.index);
      const mapping = config.mapping || {};
      return mapping[value] || 'sine';
    }
    
    return 'sine';
  }
  
  /** Linear interpolation */
  lerp(value, extent, range) {
    if (!extent || extent.min === extent.max) return (range[0] + range[1]) / 2;
    const t = Math.max(0, Math.min(1, (value - extent.min) / (extent.max - extent.min)));
    return range[0] + t * (range[1] - range[0]);
  }
  
  /** Generate description for screen readers */
  describe(item, index, total) {
    const { datum } = item;
    const parts = [`Point ${index + 1} of ${total}`];
    
    // Add label if available
    const label = datum?.label || datum?.name || datum?.category || datum?.x || datum?.month || datum?.date;
    if (label) parts.push(String(label));
    
    // Add value
    const pitchField = this.options.pitch?.field;
    const accessor = this.accessor(pitchField);
    const value = accessor(datum, index);
    
    if (typeof value === 'number') {
      parts.push(`Value: ${this.formatNumber(value)}`);
    }
    
    // Add trend hint
    if (index > 0 && this.prevValue !== undefined) {
      if (value > this.prevValue * 1.05) parts.push('↑ increasing');
      else if (value < this.prevValue * 0.95) parts.push('↓ decreasing');
    }
    this.prevValue = value;
    
    return parts.join('. ');
  }
  
  /** Generate summary of entire dataset */
  summarize(data) {
    const extent = this.extents.pitch;
    if (!extent) return `${data.length} data points`;
    
    const accessor = this.accessor(this.options.pitch?.field);
    const values = data.map(d => accessor(d.datum, d.index)).filter(v => typeof v === 'number');
    
    // Detect trend
    let trend = 'varies';
    if (values.length >= 4) {
      const firstQ = values.slice(0, Math.floor(values.length / 4));
      const lastQ = values.slice(-Math.floor(values.length / 4));
      const firstAvg = firstQ.reduce((a, b) => a + b, 0) / firstQ.length;
      const lastAvg = lastQ.reduce((a, b) => a + b, 0) / lastQ.length;
      
      if (lastAvg > firstAvg * 1.1) trend = 'increasing';
      else if (lastAvg < firstAvg * 0.9) trend = 'decreasing';
      else trend = 'stable';
    }
    
    return `${data.length} data points. Range: ${this.formatNumber(extent.min)} to ${this.formatNumber(extent.max)}. Trend: ${trend}.`;
  }
  
  /** Format number for display */
  formatNumber(n) {
    if (typeof n !== 'number') return String(n);
    if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (Number.isInteger(n)) return n.toString();
    return n.toFixed(2);
  }
}

export default DataMapper;
