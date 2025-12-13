/**
 * sound3fy - Make D3.js visualizations accessible through sound
 * 
 * @example
 * // Basic usage
 * d3.selectAll("rect").data(data).sonify();
 * 
 * @example
 * // With options
 * d3.selectAll("rect").data(data).sonify({
 *   pitch: { field: "value", scale: "pentatonic" },
 *   duration: 250,
 *   markers: { start: true, end: true }
 * });
 */

import { AudioEngine } from './core/AudioEngine.js';
import { DataMapper } from './core/DataMapper.js';
import { SonificationEngine } from './core/SonificationEngine.js';

/** Default configuration */
const DEFAULTS = {
  // Pitch mapping
  pitch: {
    field: null,           // Data field or accessor function
    range: [220, 880],     // Frequency range [min, max] Hz
    scale: 'pentatonic'    // Musical scale: pentatonic, major, minor, chromatic, blues, continuous
  },
  
  // Volume mapping (optional)
  volume: {
    field: null,
    range: [0.4, 0.7]
  },
  
  // Stereo panning
  pan: {
    range: [-0.7, 0.7]     // Left to right spread
  },
  
  // Timing
  duration: 200,           // Note duration in ms
  gap: 50,                 // Gap between notes in ms
  
  // Sound envelope
  envelope: {
    attack: 0.02,
    decay: 0.05,
    sustain: 0.7,
    release: 0.1
  },
  
  // Orientation markers
  markers: {
    start: true,           // Play sound at start
    end: true              // Play sound at end
  },
  
  // Accessibility features
  accessibility: {
    keyboard: true,        // Enable keyboard navigation
    announce: true,        // Screen reader announcements
    focus: true,           // Visual focus indicator
    hover: true            // Sonify on hover
  },
  
  // Playback
  autoPlay: false
};

/**
 * Sonify a D3 selection
 * @param {Object} options - Configuration options
 * @returns {SonificationEngine} Controller with play/pause/stop/next/previous methods
 */
function sonify(options = {}) {
  const selection = this;
  const config = mergeDeep(DEFAULTS, normalize(options));
  
  // Extract data from D3 selection
  const data = [];
  selection.each(function(d, i) {
    data.push({ datum: d, index: i, element: this });
  });
  
  if (data.length === 0) {
    console.warn('sound3fy: No data bound to selection');
    return nullEngine();
  }
  
  // Create and bind engine
  const engine = new SonificationEngine(config);
  engine.bind(selection, data);
  
  if (config.autoPlay) {
    // Delay autoPlay to ensure DOM is ready
    setTimeout(() => engine.play(), 100);
  }
  
  return engine;
}

/** Normalize shorthand options */
function normalize(options) {
  const normalized = { ...options };
  
  // pitch: "fieldName" → pitch: { field: "fieldName" }
  if (typeof options.pitch === 'string' || typeof options.pitch === 'function') {
    normalized.pitch = { field: options.pitch };
  }
  
  // volume: "fieldName" → volume: { field: "fieldName" }
  if (typeof options.volume === 'string' || typeof options.volume === 'function') {
    normalized.volume = { field: options.volume };
  }
  
  // timbre: "sine" → timbre: { type: "sine" }
  if (typeof options.timbre === 'string') {
    normalized.timbre = { type: options.timbre };
  }
  
  return normalized;
}

/** Deep merge objects */
function mergeDeep(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] === undefined) continue;
    
    if (isObject(source[key]) && isObject(target[key])) {
      output[key] = mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/** Null engine for empty data */
function nullEngine() {
  const noop = () => nullEngine;
  return {
    play: noop, pause: noop, stop: noop, toggle: noop,
    next: noop, previous: noop, first: noop, last: noop, seek: noop,
    setSpeed: noop, destroy: noop,
    isPlaying: () => false, isPaused: () => false,
    currentIndex: () => -1, length: () => 0
  };
}

// ─────────────────────────────────────────────────────────────
// AUTO-REGISTER D3 PLUGIN
// ─────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  // Wait for D3 to be available
  const registerPlugin = () => {
    if (window.d3?.selection?.prototype) {
      window.d3.selection.prototype.sonify = sonify;
    }
  };
  
  // Try immediately
  registerPlugin();
  
  // Also try after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerPlugin);
  }
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export {
  sonify,
  AudioEngine,
  DataMapper,
  SonificationEngine,
  DEFAULTS
};

export default sonify;
