/**
 * sound3fy - Make D3.js visualizations accessible through sound
 */

import { AudioEngine } from './core/AudioEngine.js';
import { DataMapper } from './core/DataMapper.js';
import { SonificationEngine } from './core/SonificationEngine.js';

const DEFAULTS = {
  pitch: { field: null, range: [220, 880], scale: 'pentatonic' },
  volume: { field: null, range: [0.4, 0.7] },
  pan: { range: [-0.7, 0.7] },
  duration: 200,
  gap: 50,
  mode: 'discrete',
  instrument: 'sine',
  envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.1 },
  markers: { start: false, end: false },
  accessibility: { keyboard: true, announce: true, focus: true, hover: true },
  autoPlay: false
};

/** Sonify a D3 selection */
function sonify(options = {}) {
  const data = [];
  this.each(function(d, i) { data.push({ datum: d, index: i, element: this }); });
  
  if (!data.length) {
    console.warn('sound3fy: No data');
    return nullEngine();
  }
  
  const config = merge(DEFAULTS, normalize(options));
  const engine = new SonificationEngine(config);
  engine.bind(this, data);
  
  if (config.autoPlay) setTimeout(() => engine.play(), 100);
  
  return engine;
}

function normalize(opts) {
  const o = { ...opts };
  if (typeof o.pitch === 'string' || typeof o.pitch === 'function') o.pitch = { field: o.pitch };
  if (typeof o.volume === 'string' || typeof o.volume === 'function') o.volume = { field: o.volume };
  return o;
}

function merge(a, b) {
  const r = { ...a };
  for (const k in b) {
    if (b[k] === undefined) continue;
    r[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k])
      ? merge(a[k], b[k])
      : b[k];
  }
  return r;
}

function nullEngine() {
  const n = () => nullEngine();
  return { play: n, pause: n, stop: n, toggle: n, next: n, previous: n, first: n, last: n, setSpeed: n, setMode: n, destroy: () => {}, isPlaying: () => false, length: () => 0 };
}

// Auto-register D3 plugin
if (typeof window !== 'undefined' && window.d3?.selection?.prototype) {
  window.d3.selection.prototype.sonify = sonify;
}

export { sonify, AudioEngine, DataMapper, SonificationEngine, DEFAULTS };
export default sonify;
