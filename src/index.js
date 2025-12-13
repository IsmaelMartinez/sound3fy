/**
 * sound3fy - Make D3.js visualizations accessible through sound
 */

import { SonificationEngine } from './core/SonificationEngine.js';

// Default options
const DEFAULT_OPTIONS = {
  pitch: { field: null, range: [220, 880] },
  volume: { field: null, range: [0.3, 0.8] },
  pan: { range: [-0.8, 0.8] },
  duration: 200,
  gap: 50,
  markers: { start: true, end: true },
  accessibility: { announce: true, keyboard: true, focus: true },
  autoPlay: false
};

/**
 * Sonify a D3 selection
 * @param {Object} options - Sonification options
 * @returns {SonificationEngine} Controller with play/pause/stop methods
 */
function sonify(options = {}) {
  const selection = this;
  const opts = mergeOptions(DEFAULT_OPTIONS, normalizeOptions(options));
  
  // Extract data from D3 selection
  const data = [];
  selection.each(function(d, i) {
    data.push({ datum: d, index: i, element: this });
  });
  
  if (data.length === 0) {
    console.warn('sound3fy: No data bound to selection');
    return nullController();
  }
  
  const engine = new SonificationEngine(opts);
  engine.bind(selection, data);
  
  if (opts.autoPlay) engine.play();
  
  return engine;
}

/** Normalize shorthand options */
function normalizeOptions(options) {
  const normalized = { ...options };
  
  // Handle shorthand: pitch: "fieldName" → pitch: { field: "fieldName" }
  if (typeof options.pitch === 'string' || typeof options.pitch === 'function') {
    normalized.pitch = { field: options.pitch };
  }
  if (typeof options.volume === 'string' || typeof options.volume === 'function') {
    normalized.volume = { field: options.volume };
  }
  
  return normalized;
}

/** Deep merge options */
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

/** Null controller when no data */
function nullController() {
  const noop = () => {};
  return { play: noop, pause: noop, stop: noop, toggle: noop, next: noop, previous: noop, destroy: noop };
}

// Register as D3 plugin if D3 is available
if (typeof window !== 'undefined' && window.d3) {
  window.d3.selection.prototype.sonify = sonify;
}

export { sonify, SonificationEngine, DEFAULT_OPTIONS };
export default sonify;
