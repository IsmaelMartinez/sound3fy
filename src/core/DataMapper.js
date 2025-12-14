/**
 * DataMapper - Maps data values to audio parameters
 */

import { AudioEngine } from './AudioEngine.js';

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.extent = null;
    this.audio = new AudioEngine();
  }
  
  /** Analyze dataset to find value extent */
  analyze(data) {
    if (!data?.length) return;
    
    const values = data.map(d => this.getValue(d.datum, d.index)).filter(v => v !== null);
    if (values.length === 0) return;
    
    this.extent = { min: Math.min(...values), max: Math.max(...values) };
  }
  
  /** Get numeric value from datum */
  getValue(datum, index) {
    const field = this.options.pitch?.field;
    
    if (typeof field === 'function') return field(datum, index);
    if (typeof field === 'string') return datum?.[field];
    if (typeof datum === 'number') return datum;
    
    // Auto-detect common fields
    return datum?.value ?? datum?.y ?? datum?.count ?? null;
  }
  
  /** Map data point to audio parameters */
  map(item, index, total) {
    const value = this.getValue(item.datum, item.index);
    const config = this.options.pitch || {};
    const range = config.range || [220, 880];
    
    // Normalize value to 0-1
    const normalized = this.extent && this.extent.max !== this.extent.min
      ? (value - this.extent.min) / (this.extent.max - this.extent.min)
      : 0.5;
    
    return {
      frequency: this.audio.valueToFrequency(normalized, {
        minFreq: range[0],
        maxFreq: range[1],
        scale: config.scale || 'pentatonic'
      }),
      volume: this.mapVolume(item),
      pan: this.mapPan(index, total),
      duration: (this.options.duration || 200) / 1000
    };
  }
  
  /** Map to volume */
  mapVolume(item) {
    const config = this.options.volume;
    if (!config?.field) return 0.5;
    
    const value = typeof config.field === 'function'
      ? config.field(item.datum, item.index)
      : item.datum?.[config.field];
    
    const range = config.range || [0.3, 0.8];
    const normalized = this.extent && this.extent.max !== this.extent.min
      ? (value - this.extent.min) / (this.extent.max - this.extent.min)
      : 0.5;
    
    return range[0] + Math.max(0, Math.min(1, normalized)) * (range[1] - range[0]);
  }
  
  /** Map position to stereo pan */
  mapPan(index, total) {
    if (total <= 1) return 0;
    const range = this.options.pan?.range || [-0.7, 0.7];
    return range[0] + (index / (total - 1)) * (range[1] - range[0]);
  }
  
  /** Get description for screen readers */
  describe(item, index, total) {
    const value = this.getValue(item.datum, item.index);
    const label = item.datum?.label || item.datum?.name || item.datum?.month || item.datum?.x;
    
    let desc = `Point ${index + 1} of ${total}`;
    if (label) desc += `. ${label}`;
    if (value !== null) desc += `. Value: ${this.format(value)}`;
    
    return desc;
  }
  
  /** Get summary of dataset */
  summarize(data) {
    if (!this.extent) return `${data.length} data points`;
    return `${data.length} data points. Range: ${this.format(this.extent.min)} to ${this.format(this.extent.max)}`;
  }
  
  /** Format number */
  format(n) {
    if (typeof n !== 'number') return String(n);
    return n >= 1000 ? n.toLocaleString() : (Number.isInteger(n) ? n.toString() : n.toFixed(2));
  }
}

export default DataMapper;
