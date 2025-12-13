/**
 * sound3fy - Make D3.js visualizations accessible through sound
 * 
 * @module sound3fy
 * @description A D3.js plugin that adds sonification capabilities to data visualizations,
 * making charts accessible to blind and low-vision users.
 */

import { AudioEngine } from './core/AudioEngine.js';
import { DataMapper } from './core/DataMapper.js';
import { AccessibilityLayer } from './accessibility/AccessibilityLayer.js';
import { SonificationEngine } from './core/SonificationEngine.js';

// Default options
const DEFAULT_OPTIONS = {
  // Pitch configuration
  pitch: {
    field: null,        // Data field or accessor function
    scale: 'pentatonic', // pentatonic, chromatic, major, minor
    range: [220, 880],   // Frequency range in Hz (A3 to A5)
    domain: 'auto'       // Auto-detect from data
  },
  
  // Volume configuration
  volume: {
    field: null,
    range: [0.3, 0.8]    // Keep volume moderate
  },
  
  // Stereo panning
  pan: {
    field: 'index',      // Default: pan left-to-right
    range: [-0.8, 0.8]   // Not full pan (too extreme)
  },
  
  // Timing
  duration: 200,         // Note duration in ms
  tempo: 120,            // BPM
  gap: 50,               // Gap between notes in ms
  
  // Envelope (ADSR)
  envelope: {
    attack: 0.02,
    decay: 0.05,
    sustain: 0.7,
    release: 0.1
  },
  
  // Orientation sounds
  markers: {
    start: true,
    end: true,
    axes: false
  },
  
  // Accessibility
  accessibility: {
    announceValues: true,
    keyboardNavigation: true,
    focusIndicator: true
  },
  
  // Playback
  autoPlay: false,
  loop: false
};

/**
 * Extend D3 selection with sonify method
 * This is the main entry point for using sound3fy
 * 
 * @param {Object} options - Sonification options
 * @returns {Object} Sonification controller with play/pause/stop methods
 * 
 * @example
 * // Basic usage
 * d3.selectAll("rect").data(data).sonify();
 * 
 * @example
 * // With options
 * d3.selectAll("rect").data(data).sonify({
 *   pitch: "value",
 *   duration: 300,
 *   tempo: 100
 * });
 */
function sonify(options = {}) {
  const selection = this;
  const mergedOptions = mergeOptions(DEFAULT_OPTIONS, normalizeOptions(options));
  
  // Extract data from D3 selection
  const data = extractData(selection);
  
  if (!data || data.length === 0) {
    console.warn('sound3fy: No data bound to selection');
    return createNullController();
  }
  
  // Create sonification engine
  const engine = new SonificationEngine(mergedOptions);
  engine.bind(selection, data);
  
  // Set up accessibility features
  if (mergedOptions.accessibility.keyboardNavigation) {
    engine.enableKeyboardNavigation();
  }
  
  if (mergedOptions.accessibility.announceValues) {
    engine.enableAnnouncements();
  }
  
  // Auto-play if specified
  if (mergedOptions.autoPlay) {
    engine.play();
  }
  
  return engine;
}

/**
 * Normalize shorthand options to full form
 */
function normalizeOptions(options) {
  const normalized = { ...options };
  
  // Handle shorthand pitch: "fieldName" -> pitch: { field: "fieldName" }
  if (typeof options.pitch === 'string' || typeof options.pitch === 'function') {
    normalized.pitch = { field: options.pitch };
  }
  
  // Handle shorthand volume
  if (typeof options.volume === 'string' || typeof options.volume === 'function') {
    normalized.volume = { field: options.volume };
  }
  
  return normalized;
}

/**
 * Deep merge options with defaults
 */
function mergeOptions(defaults, options) {
  const result = { ...defaults };
  
  for (const key in options) {
    if (options[key] && typeof options[key] === 'object' && !Array.isArray(options[key])) {
      result[key] = mergeOptions(defaults[key] || {}, options[key]);
    } else if (options[key] !== undefined) {
      result[key] = options[key];
    }
  }
  
  return result;
}

/**
 * Extract data from D3 selection
 */
function extractData(selection) {
  const data = [];
  
  selection.each(function(d, i) {
    data.push({
      datum: d,
      index: i,
      element: this
    });
  });
  
  return data;
}

/**
 * Create a null controller for when there's no data
 */
function createNullController() {
  return {
    play: () => console.warn('sound3fy: No data to play'),
    pause: () => {},
    stop: () => {},
    toggle: () => {},
    next: () => {},
    previous: () => {},
    seek: () => {},
    isPlaying: () => false,
    currentIndex: () => -1,
    destroy: () => {}
  };
}

// Register as D3 plugin if D3 is available
if (typeof window !== 'undefined' && window.d3) {
  window.d3.selection.prototype.sonify = sonify;
}

// Export for ES modules
export { 
  sonify,
  AudioEngine,
  DataMapper,
  AccessibilityLayer,
  SonificationEngine,
  DEFAULT_OPTIONS
};

// Default export
export default sonify;

