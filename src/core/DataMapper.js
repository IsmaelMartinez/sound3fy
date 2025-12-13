/**
 * DataMapper - Maps data values to audio parameters (pitch, volume, pan)
 */

export class DataMapper {
  constructor(options = {}) {
    this.options = options;
    this.extent = null;
  }
  
  /** Analyze data to find min/max values */
  analyze(data) {
    const field = this.options.pitch?.field;
    if (!field || data.length === 0) return;
    
    const accessor = typeof field === 'function' ? field : (d) => d[field];
    const values = data.map(d => accessor(d.datum, d.index));
    
    this.extent = { min: Math.min(...values), max: Math.max(...values) };
  }
  
  /** Map a data point to audio parameters */
  map(dataItem, index, total) {
    return {
      frequency: this.mapPitch(dataItem),
      volume: this.mapVolume(dataItem),
      pan: this.mapPan(index, total),
      duration: (this.options.duration || 200) / 1000
    };
  }
  
  /** Map value to frequency (pitch) */
  mapPitch(dataItem) {
    const { datum, index } = dataItem;
    const config = this.options.pitch || {};
    const range = config.range || [220, 880];
    const field = config.field;
    
    // Get value
    let value;
    if (!field) {
      value = typeof datum === 'number' ? datum : 440;
      if (typeof datum !== 'number') return 440;
    } else {
      const accessor = typeof field === 'function' ? field : (d) => d[field];
      value = accessor(datum, index);
    }
    
    // Map to frequency range
    return this.lerp(value, this.extent, range);
  }
  
  /** Map value to volume */
  mapVolume(dataItem) {
    const config = this.options.volume || {};
    if (!config.field) return 0.5;
    
    const accessor = typeof config.field === 'function' ? config.field : (d) => d[config.field];
    const value = accessor(dataItem.datum, dataItem.index);
    const range = config.range || [0.3, 0.8];
    
    return this.lerp(value, this.extent, range);
  }
  
  /** Map position to stereo pan (-1 left, 1 right) */
  mapPan(index, total) {
    if (total <= 1) return 0;
    const range = this.options.pan?.range || [-0.8, 0.8];
    const normalized = index / (total - 1);
    return range[0] + normalized * (range[1] - range[0]);
  }
  
  /** Linear interpolation */
  lerp(value, domain, range) {
    if (!domain || domain.min === domain.max) {
      return (range[0] + range[1]) / 2;
    }
    const t = Math.max(0, Math.min(1, (value - domain.min) / (domain.max - domain.min)));
    return range[0] + t * (range[1] - range[0]);
  }
  
  /** Get human-readable description of a data point */
  describe(dataItem, index, total) {
    const { datum } = dataItem;
    const field = this.options.pitch?.field;
    
    let desc = `Point ${index + 1} of ${total}`;
    
    if (field) {
      const accessor = typeof field === 'function' ? field : (d) => d[field];
      desc += `. Value: ${this.format(accessor(datum, index))}`;
    } else if (typeof datum === 'number') {
      desc += `. Value: ${this.format(datum)}`;
    } else if (datum?.value !== undefined) {
      desc += `. Value: ${this.format(datum.value)}`;
    }
    
    return desc;
  }
  
  /** Format number for announcement */
  format(value) {
    if (typeof value !== 'number') return String(value);
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2);
  }
}

export default DataMapper;
