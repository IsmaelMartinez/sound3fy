/**
 * DataMapper - Maps data values to audio parameters
 * 
 * Handles the translation of data attributes to sound properties
 * like pitch, volume, pan, and duration.
 */

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.scales = {};
    this.domain = null;
    this.dataExtent = null;
  }
  
  /**
   * Analyze data to determine domain extents
   * @param {Array} data - Array of data items
   */
  analyzeData(data) {
    if (!data || data.length === 0) return;
    
    const pitchField = this.options.pitch?.field;
    const volumeField = this.options.volume?.field;
    
    // Calculate extents for each mapped field
    if (pitchField) {
      this.dataExtent = this.calculateExtent(data, pitchField);
    }
    
    if (volumeField && volumeField !== pitchField) {
      this.volumeExtent = this.calculateExtent(data, volumeField);
    }
  }
  
  /**
   * Calculate min/max extent for a field
   */
  calculateExtent(data, field) {
    const accessor = this.createAccessor(field);
    const values = data.map(d => accessor(d.datum, d.index));
    
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }
  
  /**
   * Create an accessor function from field specification
   */
  createAccessor(field) {
    if (typeof field === 'function') {
      return field;
    }
    if (typeof field === 'string') {
      return (d) => d[field];
    }
    return (d) => d;
  }
  
  /**
   * Map a single data point to audio parameters
   * 
   * @param {Object} dataItem - Data item with datum, index, element
   * @param {number} total - Total number of data points
   * @returns {Object} Audio parameters { frequency, volume, pan, duration }
   */
  mapPoint(dataItem, total) {
    const { datum, index } = dataItem;
    
    return {
      frequency: this.mapPitch(datum, index),
      volume: this.mapVolume(datum, index),
      pan: this.mapPan(index, total),
      duration: this.mapDuration(datum, index)
    };
  }
  
  /**
   * Map data value to frequency
   */
  mapPitch(datum, index) {
    const config = this.options.pitch || {};
    const field = config.field;
    const range = config.range || [220, 880];
    
    if (!field) {
      // No pitch mapping, use default based on value or index
      if (typeof datum === 'number') {
        return this.linearMap(datum, this.dataExtent, range);
      }
      return 440; // Default A4
    }
    
    const accessor = this.createAccessor(field);
    const value = accessor(datum, index);
    
    if (this.dataExtent) {
      return this.linearMap(value, this.dataExtent, range);
    }
    
    return value; // Assume it's already a frequency
  }
  
  /**
   * Map data value to volume
   */
  mapVolume(datum, index) {
    const config = this.options.volume || {};
    const field = config.field;
    const range = config.range || [0.3, 0.8];
    
    if (!field) {
      return 0.5; // Default volume
    }
    
    const accessor = this.createAccessor(field);
    const value = accessor(datum, index);
    const extent = this.volumeExtent || this.dataExtent;
    
    if (extent) {
      return this.linearMap(value, extent, range);
    }
    
    return Math.max(0, Math.min(1, value));
  }
  
  /**
   * Map position to stereo pan
   */
  mapPan(index, total) {
    const config = this.options.pan || {};
    const range = config.range || [-0.8, 0.8];
    
    if (total <= 1) {
      return 0; // Center if single point
    }
    
    // Linear pan from left to right
    const normalized = index / (total - 1);
    return range[0] + normalized * (range[1] - range[0]);
  }
  
  /**
   * Map data value to duration
   */
  mapDuration(datum, index) {
    const baseDuration = this.options.duration || 200;
    
    // Could be extended to map duration to data
    return baseDuration / 1000; // Convert to seconds
  }
  
  /**
   * Linear interpolation between ranges
   */
  linearMap(value, domain, range) {
    if (!domain || domain.min === domain.max) {
      return (range[0] + range[1]) / 2;
    }
    
    const normalized = (value - domain.min) / (domain.max - domain.min);
    const clamped = Math.max(0, Math.min(1, normalized));
    
    return range[0] + clamped * (range[1] - range[0]);
  }
  
  /**
   * Map entire dataset to audio parameters
   */
  mapDataset(data) {
    this.analyzeData(data);
    return data.map((item, i) => this.mapPoint(item, data.length));
  }
  
  /**
   * Get human-readable description of a data point
   */
  describePoint(dataItem, index, total) {
    const { datum } = dataItem;
    const pitchField = this.options.pitch?.field;
    
    let description = `Point ${index + 1} of ${total}`;
    
    if (pitchField) {
      const accessor = this.createAccessor(pitchField);
      const value = accessor(datum, index);
      description += `. Value: ${this.formatValue(value)}`;
    } else if (typeof datum === 'number') {
      description += `. Value: ${this.formatValue(datum)}`;
    } else if (typeof datum === 'object') {
      // Try to find a reasonable value to announce
      const keys = ['value', 'y', 'count', 'amount', 'total'];
      for (const key of keys) {
        if (datum[key] !== undefined) {
          description += `. ${key}: ${this.formatValue(datum[key])}`;
          break;
        }
      }
    }
    
    return description;
  }
  
  /**
   * Format value for announcement
   */
  formatValue(value) {
    if (typeof value === 'number') {
      // Format with appropriate precision
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    }
    return String(value);
  }
}

export default DataMapper;

