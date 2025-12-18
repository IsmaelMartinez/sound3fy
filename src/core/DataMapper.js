/**
 * DataMapper - Maps data values to audio parameters
 */

import { AudioEngine } from './AudioEngine.js';

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.extents = {};
    this.chartType = options.chartType || (options.x ? 'scatter' : options.mode === 'continuous' ? 'line' : 'bar');
    this._audio = null; // Lazy init
  }
  
  get audio() {
    if (!this._audio) this._audio = new AudioEngine();
    return this._audio;
  }
  
  /** Analyze dataset to find value extents */
  analyze(data) {
    if (!data?.length) return;
    
    const pitchValues = data.map(d => this.getValue(d.datum, d.index)).filter(v => v !== null);
    if (pitchValues.length) {
      this.extents.pitch = { min: Math.min(...pitchValues), max: Math.max(...pitchValues) };
    }
    
    if (this.chartType === 'scatter') {
      const xValues = data.map(d => this.getXValue(d.datum, d.index)).filter(v => v !== null);
      if (xValues.length) {
        this.extents.x = { min: Math.min(...xValues), max: Math.max(...xValues) };
      }
    }
    
    this.extent = this.extents.pitch; // Backward compat
  }
  
  /** Get numeric value from datum */
  getValue(datum, index) {
    const field = this.options.pitch?.field;
    if (typeof field === 'function') return field(datum, index);
    if (typeof field === 'string') return datum?.[field];
    if (typeof datum === 'number') return datum;
    return datum?.value ?? datum?.y ?? datum?.count ?? null;
  }
  
  /** Get X value for scatter plots */
  getXValue(datum, index) {
    const field = this.options.x?.field || this.options.x;
    if (typeof field === 'function') return field(datum, index);
    if (typeof field === 'string') return datum?.[field];
    return datum?.x ?? index;
  }
  
  /** Map data point to audio parameters */
  map(item, index, total) {
    const value = this.getValue(item.datum, item.index);
    const config = this.options.pitch || {};
    const range = config.range || [220, 880];
    const extent = this.extents.pitch;
    
    const normalized = extent && extent.max !== extent.min
      ? (value - extent.min) / (extent.max - extent.min)
      : 0.5;
    
    return {
      frequency: this.audio.valueToFrequency(normalized, {
        minFreq: range[0],
        maxFreq: range[1],
        scale: config.scale || 'pentatonic'
      }),
      volume: this.options.volume?.field ? this.mapVolume(item) : 0.5,
      pan: this.mapPan(item, index, total),
      duration: (this.options.duration || 200) / 1000
    };
  }
  
  /** Map to volume (only if field specified) */
  mapVolume(item) {
    const config = this.options.volume;
    if (!config?.field) return 0.5;
    
    const field = config.field;
    const value = typeof field === 'function' ? field(item.datum, item.index) : item.datum?.[field];
    const extent = this.extents.pitch;
    const range = config.range || [0.4, 0.7];
    
    if (!extent || extent.max === extent.min) return 0.5;
    const normalized = Math.max(0, Math.min(1, (value - extent.min) / (extent.max - extent.min)));
    return range[0] + normalized * (range[1] - range[0]);
  }
  
  /** Map position to stereo pan */
  mapPan(item, index, total) {
    const range = this.options.pan?.range || [-0.7, 0.7];
    
    // Scatter: X data → pan
    if (this.chartType === 'scatter' && this.extents.x) {
      const xValue = this.getXValue(item.datum, item.index);
      const extent = this.extents.x;
      if (extent && extent.max !== extent.min) {
        const normalized = (xValue - extent.min) / (extent.max - extent.min);
        return range[0] + Math.max(0, Math.min(1, normalized)) * (range[1] - range[0]);
      }
    }
    
    // Default: position-based
    if (total <= 1) return 0;
    return range[0] + (index / (total - 1)) * (range[1] - range[0]);
  }
  
  /** Get description for screen readers */
  describe(item, index, total) {
    const value = this.getValue(item.datum, item.index);
    const label = item.datum?.label || item.datum?.name || item.datum?.month;
    
    let desc = `Point ${index + 1} of ${total}`;
    if (label) desc += `. ${label}`;
    
    if (this.chartType === 'scatter') {
      const x = this.getXValue(item.datum, item.index);
      if (typeof x === 'number') desc += `. X: ${this.format(x)}`;
      if (value !== null) desc += `. Y: ${this.format(value)}`;
    } else if (value !== null) {
      desc += `. Value: ${this.format(value)}`;
    }
    
    return desc;
  }
  
  /** Get summary of dataset */
  summarize(data) {
    const extent = this.extents.pitch;
    const type = { bar: 'Bar chart', line: 'Line chart', scatter: 'Scatter plot' }[this.chartType] || 'Chart';
    
    if (!extent) return `${type} with ${data.length} data points`;
    return `${type} with ${data.length} data points. Range: ${this.format(extent.min)} to ${this.format(extent.max)}`;
  }
  
  /** Format number */
  format(n) {
    if (typeof n !== 'number') return String(n);
    return n >= 1000 ? n.toLocaleString() : (Number.isInteger(n) ? String(n) : n.toFixed(2));
  }
}

export default DataMapper;
