/**
 * DataMapper - Maps data values to audio parameters
 * Supports bar charts, line charts, scatter plots, and area charts
 */

import { AudioEngine } from './AudioEngine.js';

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.extents = {};  // Support multiple extents for 2D mapping
    this.audio = new AudioEngine();
    this.chartType = options.chartType || this.detectChartType(options);
  }
  
  /** Detect chart type from options */
  detectChartType(options) {
    if (options.chartType) return options.chartType;
    if (options.mode === 'scatter') return 'scatter';
    if (options.x && options.y) return 'scatter';  // 2D mapping suggests scatter
    if (options.mode === 'continuous') return 'line';
    return 'bar';  // Default
  }
  
  /** Analyze dataset to find value extents */
  analyze(data) {
    if (!data?.length) return;
    
    // Primary value (for pitch)
    const pitchValues = data.map(d => this.getValue(d.datum, d.index, 'pitch')).filter(v => v !== null);
    if (pitchValues.length > 0) {
      this.extents.pitch = { min: Math.min(...pitchValues), max: Math.max(...pitchValues) };
    }
    
    // Secondary value (for volume)
    if (this.options.volume?.field) {
      const volValues = data.map(d => this.getValue(d.datum, d.index, 'volume')).filter(v => v !== null);
      if (volValues.length > 0) {
        this.extents.volume = { min: Math.min(...volValues), max: Math.max(...volValues) };
      }
    }
    
    // X value (for scatter plots - maps to pan)
    if (this.options.x || this.chartType === 'scatter') {
      const xValues = data.map(d => this.getXValue(d.datum, d.index)).filter(v => v !== null);
      if (xValues.length > 0) {
        this.extents.x = { min: Math.min(...xValues), max: Math.max(...xValues) };
      }
    }
    
    // Backward compatibility
    this.extent = this.extents.pitch;
  }
  
  /** Get numeric value from datum for a specific parameter */
  getValue(datum, index, param = 'pitch') {
    const config = this.options[param] || this.options.pitch;
    const field = config?.field;
    
    if (typeof field === 'function') return field(datum, index);
    if (typeof field === 'string') return datum?.[field];
    if (typeof datum === 'number') return datum;
    
    // Auto-detect common fields for Y (pitch)
    return datum?.value ?? datum?.y ?? datum?.count ?? null;
  }
  
  /** Get X value for scatter plots */
  getXValue(datum, index) {
    const config = this.options.x;
    if (!config) {
      // Try to auto-detect x field
      return datum?.x ?? datum?.time ?? datum?.date ?? index;
    }
    
    const field = config.field || config;
    if (typeof field === 'function') return field(datum, index);
    if (typeof field === 'string') return datum?.[field];
    return index;
  }
  
  /** Map data point to audio parameters */
  map(item, index, total) {
    const value = this.getValue(item.datum, item.index, 'pitch');
    const config = this.options.pitch || {};
    const range = config.range || [220, 880];
    
    // Normalize value to 0-1
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
      volume: this.mapVolume(item),
      pan: this.mapPan(item, index, total),
      duration: this.mapDuration(item),
      chartType: this.chartType
    };
  }
  
  /** Map to volume - can be data-driven or fixed */
  mapVolume(item) {
    const config = this.options.volume;
    if (!config?.field) return 0.5;
    
    const value = this.getValue(item.datum, item.index, 'volume');
    const extent = this.extents.volume || this.extents.pitch;
    const range = config.range || [0.3, 0.8];
    
    if (!extent || extent.max === extent.min) return (range[0] + range[1]) / 2;
    
    const normalized = (value - extent.min) / (extent.max - extent.min);
    return range[0] + Math.max(0, Math.min(1, normalized)) * (range[1] - range[0]);
  }
  
  /** Map position to stereo pan - supports scatter plots with 2D mapping */
  mapPan(item, index, total) {
    const range = this.options.pan?.range || [-0.7, 0.7];
    
    // For scatter plots, use X data value for pan
    if (this.chartType === 'scatter' && this.extents.x) {
      const xValue = this.getXValue(item.datum, item.index);
      const extent = this.extents.x;
      
      if (extent && extent.max !== extent.min) {
        const normalized = (xValue - extent.min) / (extent.max - extent.min);
        return range[0] + Math.max(0, Math.min(1, normalized)) * (range[1] - range[0]);
      }
    }
    
    // Default: position-based pan (left to right)
    if (total <= 1) return 0;
    return range[0] + (index / (total - 1)) * (range[1] - range[0]);
  }
  
  /** Map duration - can be data-driven or fixed */
  mapDuration(item) {
    const config = this.options.duration;
    
    // Fixed duration (default)
    if (typeof config === 'number') return config / 1000;
    if (!config) return 0.2; // 200ms default
    
    // Data-driven duration
    if (config.field) {
      const value = typeof config.field === 'function'
        ? config.field(item.datum, item.index)
        : item.datum?.[config.field];
      
      const range = config.range || [100, 400]; // ms
      const extent = this.extents.pitch;
      
      if (extent && extent.max !== extent.min && value !== null) {
        const normalized = (value - extent.min) / (extent.max - extent.min);
        const ms = range[0] + Math.max(0, Math.min(1, normalized)) * (range[1] - range[0]);
        return ms / 1000;
      }
    }
    
    return 0.2;
  }
  
  /** Get description for screen readers */
  describe(item, index, total) {
    const yValue = this.getValue(item.datum, item.index, 'pitch');
    const label = item.datum?.label || item.datum?.name || item.datum?.month;
    
    let desc = `Point ${index + 1} of ${total}`;
    if (label) desc += `. ${label}`;
    
    // For scatter plots, describe both X and Y
    if (this.chartType === 'scatter') {
      const xValue = this.getXValue(item.datum, item.index);
      if (xValue !== null && typeof xValue === 'number') {
        desc += `. X: ${this.format(xValue)}`;
      }
      if (yValue !== null) {
        desc += `. Y: ${this.format(yValue)}`;
      }
    } else {
      if (yValue !== null) desc += `. Value: ${this.format(yValue)}`;
    }
    
    return desc;
  }
  
  /** Get summary of dataset */
  summarize(data) {
    const extent = this.extents.pitch;
    const chartName = this.getChartTypeName();
    
    if (!extent) return `${chartName} with ${data.length} data points`;
    
    let summary = `${chartName} with ${data.length} data points. `;
    summary += `Range: ${this.format(extent.min)} to ${this.format(extent.max)}`;
    
    // Add trend analysis
    if (data.length >= 3) {
      const trend = this.analyzeTrend(data);
      if (trend) summary += `. Trend: ${trend}`;
    }
    
    return summary;
  }
  
  /** Get human-readable chart type name */
  getChartTypeName() {
    const names = {
      bar: 'Bar chart',
      line: 'Line chart',
      scatter: 'Scatter plot',
      area: 'Area chart'
    };
    return names[this.chartType] || 'Chart';
  }
  
  /** Analyze data trend */
  analyzeTrend(data) {
    if (data.length < 3) return null;
    
    const values = data.map(d => this.getValue(d.datum, d.index, 'pitch')).filter(v => v !== null);
    if (values.length < 3) return null;
    
    const firstThird = values.slice(0, Math.floor(values.length / 3));
    const lastThird = values.slice(-Math.floor(values.length / 3));
    
    const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;
    
    const change = (lastAvg - firstAvg) / firstAvg;
    
    if (change > 0.15) return 'increasing';
    if (change < -0.15) return 'decreasing';
    return 'stable';
  }
  
  /** Format number */
  format(n) {
    if (typeof n !== 'number') return String(n);
    return n >= 1000 ? n.toLocaleString() : (Number.isInteger(n) ? n.toString() : n.toFixed(2));
  }
}

export default DataMapper;
