/**
 * SonificationEngine - Full-featured sonification with accessibility
 * Supports bar charts, line charts, scatter plots, and more
 */

import { AudioEngine } from './AudioEngine.js';
import { DataMapper } from './DataMapper.js';

export class SonificationEngine {
  constructor(options = {}) {
    this.options = options;
    this.audio = new AudioEngine();
    this.mapper = new DataMapper(options);
    
    // State
    this.data = [];
    this.selection = null;
    this.index = -1;
    this.playing = false;
    this.paused = false;
    this.timer = null;
    this.speed = 1;
    this.mode = options.mode || 'discrete'; // 'discrete' or 'continuous'
    
    // For continuous mode
    this.sweepOscillator = null;
    this.sweepGain = null;
    this.sweepStartTime = 0;
    
    // Accessibility
    this.liveRegion = null;
    this._keyHandler = null;
    this._hoverHandler = null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // BINDING
  // ─────────────────────────────────────────────────────────────
  
  /** Bind to D3 selection */
  bind(selection, data) {
    this.selection = selection;
    this.data = data;
    this.mapper.analyze(data);
    
    // Auto-detect mode based on element type
    if (this.options.mode === undefined) {
      selection.each(function() {
        const tagName = this.tagName?.toLowerCase();
        if (tagName === 'path' || tagName === 'line') {
          // Line chart detected
        }
      });
    }
    
    const a11y = this.options.accessibility || {};
    
    // Make elements focusable
    if (a11y.focus !== false) {
      selection.each(function(d, i) {
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'graphics-symbol');
        this.setAttribute('aria-roledescription', 'data point');
      });
    }
    
    // Keyboard navigation
    if (a11y.keyboard !== false) {
      this.setupKeyboard();
    }
    
    // Screen reader announcements
    if (a11y.announce !== false) {
      this.setupLiveRegion();
    }
    
    // Hover to sonify
    if (a11y.hover !== false) {
      this.setupHover();
    }
    
    return this;
  }
  
  // ─────────────────────────────────────────────────────────────
  // PLAYBACK CONTROLS
  // ─────────────────────────────────────────────────────────────
  
  /** Start playback */
  async play() {
    if (this.playing && !this.paused) return this;
    
    this.audio.init();
    await this.audio.resume();
    
    this.playing = true;
    this.paused = false;
    
    // Starting fresh?
    if (this.index < 0) {
      this.index = 0;
      
      // Announce summary
      if (this.liveRegion) {
        this.announce(this.mapper.summarize(this.data));
        await this.wait(800);
      }
      
      // Play start marker
      if (this.options.markers?.start !== false) {
        this.audio.playMarker('start');
        await this.wait(120);
      }
    }
    
    // Choose playback mode
    if (this.mode === 'continuous') {
      this.playContinuous();
    } else {
      this.scheduleNext();
    }
    
    return this;
  }
  
  /** Pause */
  pause() {
    if (!this.playing) return this;
    this.paused = true;
    clearTimeout(this.timer);
    this.stopContinuous();
    this.announce('Paused');
    return this;
  }
  
  /** Stop and reset */
  stop() {
    this.playing = false;
    this.paused = false;
    this.index = -1;
    clearTimeout(this.timer);
    this.stopContinuous();
    this.clearFocus();
    this.announce('Stopped');
    return this;
  }
  
  /** Toggle play/pause */
  toggle() {
    return (this.playing && !this.paused) ? this.pause() : this.play();
  }
  
  /** Set playback speed (0.5 = half, 2 = double) */
  setSpeed(speed) {
    this.speed = Math.max(0.25, Math.min(4, speed));
    return this;
  }
  
  /** Set playback mode */
  setMode(mode) {
    this.mode = mode === 'continuous' ? 'continuous' : 'discrete';
    return this;
  }
  
  // ─────────────────────────────────────────────────────────────
  // CONTINUOUS MODE (for line charts)
  // ─────────────────────────────────────────────────────────────
  
  /** Play continuous frequency sweep */
  playContinuous() {
    if (!this.playing || this.paused || this.data.length === 0) return;
    
    this.audio.init();
    const ctx = this.audio.context;
    const now = ctx.currentTime;
    
    // Calculate total duration
    const baseDuration = (this.options.duration || 200) / 1000;
    const totalDuration = (this.data.length * baseDuration) / this.speed;
    
    // Create oscillator
    this.sweepOscillator = ctx.createOscillator();
    this.sweepGain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    this.sweepOscillator.type = 'sine';
    
    // Connect
    this.sweepOscillator.connect(this.sweepGain);
    this.sweepGain.connect(panner);
    panner.connect(this.audio.masterGain);
    
    // Schedule frequency changes
    const freqParam = this.sweepOscillator.frequency;
    const panParam = panner.pan;
    const gainParam = this.sweepGain.gain;
    
    // Get all frequencies
    const frequencies = this.data.map((item, i) => 
      this.mapper.map(item, i, this.data.length).frequency
    );
    
    // Set initial values
    freqParam.setValueAtTime(frequencies[0], now);
    gainParam.setValueAtTime(0, now);
    gainParam.linearRampToValueAtTime(0.5, now + 0.05); // Fade in
    panParam.setValueAtTime(-0.7, now);
    
    // Schedule frequency and pan ramps
    const timePerPoint = totalDuration / this.data.length;
    
    for (let i = 1; i < frequencies.length; i++) {
      const time = now + (i * timePerPoint);
      freqParam.linearRampToValueAtTime(frequencies[i], time);
      
      // Pan from left to right
      const pan = -0.7 + (i / (frequencies.length - 1)) * 1.4;
      panParam.linearRampToValueAtTime(pan, time);
    }
    
    // Fade out at end
    gainParam.setValueAtTime(0.5, now + totalDuration - 0.1);
    gainParam.linearRampToValueAtTime(0, now + totalDuration);
    
    // Start
    this.sweepOscillator.start(now);
    this.sweepOscillator.stop(now + totalDuration + 0.1);
    this.sweepStartTime = now;
    
    // Track position for focus updates
    this.trackContinuousPosition(totalDuration);
    
    // End marker
    this.timer = setTimeout(() => {
      if (this.options.markers?.end !== false) {
        this.audio.playMarker('end');
      }
      this.announce('Playback complete');
      this.playing = false;
      this.index = -1;
      this.clearFocus();
    }, totalDuration * 1000);
  }
  
  /** Track position during continuous playback */
  trackContinuousPosition(totalDuration) {
    if (!this.playing || this.paused) return;
    
    const ctx = this.audio.context;
    const elapsed = ctx.currentTime - this.sweepStartTime;
    const progress = Math.min(1, elapsed / totalDuration);
    const newIndex = Math.floor(progress * this.data.length);
    
    if (newIndex !== this.index && newIndex < this.data.length) {
      this.index = newIndex;
      const item = this.data[this.index];
      this.updateFocus(item?.element);
      
      // Announce every few points
      if (this.index % Math.max(1, Math.floor(this.data.length / 5)) === 0) {
        this.announce(this.mapper.describe(item, this.index, this.data.length));
      }
    }
    
    if (progress < 1) {
      requestAnimationFrame(() => this.trackContinuousPosition(totalDuration));
    }
  }
  
  /** Stop continuous playback */
  stopContinuous() {
    try {
      if (this.sweepOscillator) {
        this.sweepOscillator.stop();
        this.sweepOscillator.disconnect();
      }
      if (this.sweepGain) {
        this.sweepGain.disconnect();
      }
    } catch (e) {
      // Already stopped
    }
    this.sweepOscillator = null;
    this.sweepGain = null;
  }
  
  // ─────────────────────────────────────────────────────────────
  // DISCRETE MODE (for bar charts)
  // ─────────────────────────────────────────────────────────────
  
  /** Navigate to next point */
  next() {
    this.audio.init();
    const newIndex = Math.min(this.index + 1, this.data.length - 1);
    if (newIndex !== this.index || this.index < 0) {
      this.index = newIndex < 0 ? 0 : newIndex;
      this.playPoint(this.index);
    }
    return this;
  }
  
  /** Go to previous point */
  previous() {
    this.audio.init();
    const newIndex = Math.max(this.index - 1, 0);
    if (newIndex !== this.index) {
      this.index = newIndex;
      this.playPoint(this.index);
    }
    return this;
  }
  
  /** Jump to first point */
  first() {
    this.audio.init();
    this.index = 0;
    this.playPoint(0);
    return this;
  }
  
  /** Jump to last point */
  last() {
    this.audio.init();
    this.index = this.data.length - 1;
    this.playPoint(this.index);
    return this;
  }
  
  /** Seek to specific index */
  seek(idx) {
    this.audio.init();
    this.index = Math.max(0, Math.min(idx, this.data.length - 1));
    this.playPoint(this.index);
    
    if (this.playing && !this.paused && this.mode === 'discrete') {
      clearTimeout(this.timer);
      this.scheduleNext();
    }
    return this;
  }
  
  /** Schedule next point (discrete mode) */
  scheduleNext() {
    if (!this.playing || this.paused) return;
    
    if (this.index >= this.data.length) {
      // End of playback
      if (this.options.markers?.end !== false) {
        this.audio.playMarker('end');
      }
      this.announce('Playback complete');
      this.playing = false;
      this.index = -1;
      this.clearFocus();
      return;
    }
    
    this.playPoint(this.index);
    this.index++;
    
    // Calculate delay based on duration and speed
    const duration = (this.options.duration || 200) / this.speed;
    const gap = (this.options.gap || 50) / this.speed;
    
    this.timer = setTimeout(() => this.scheduleNext(), duration + gap);
  }
  
  /** Play a single data point */
  playPoint(idx) {
    if (idx < 0 || idx >= this.data.length) return;
    
    const item = this.data[idx];
    const params = this.mapper.map(item, idx, this.data.length);
    
    // Adjust duration for speed
    params.duration = params.duration / this.speed;
    
    // Get envelope from options or use defaults
    const envelope = this.options.envelope || {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.7,
      release: 0.1
    };
    
    this.audio.playTone({ ...params, envelope });
    
    // Announce
    this.announce(this.mapper.describe(item, idx, this.data.length));
    
    // Update focus
    this.updateFocus(item.element);
  }
  
  // ─────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────
  
  /** Set up keyboard navigation */
  setupKeyboard() {
    const self = this;
    
    this._keyHandler = function(e) {
      const handlers = {
        ' ': () => { e.preventDefault(); self.toggle(); },
        'Enter': () => { e.preventDefault(); self.play(); },
        'Escape': () => { e.preventDefault(); self.stop(); },
        'ArrowRight': () => { e.preventDefault(); self.next(); },
        'ArrowLeft': () => { e.preventDefault(); self.previous(); },
        'Home': () => { e.preventDefault(); self.first(); },
        'End': () => { e.preventDefault(); self.last(); },
        '+': () => { e.preventDefault(); self.setSpeed(self.speed * 1.25); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        '=': () => { e.preventDefault(); self.setSpeed(self.speed * 1.25); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        '-': () => { e.preventDefault(); self.setSpeed(self.speed * 0.8); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        '_': () => { e.preventDefault(); self.setSpeed(self.speed * 0.8); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        'm': () => { e.preventDefault(); self.setMode(self.mode === 'continuous' ? 'discrete' : 'continuous'); self.announce(`Mode: ${self.mode}`); }
      };
      
      handlers[e.key]?.();
    };
    
    this.selection?.each(function() {
      this.addEventListener('keydown', self._keyHandler);
    });
  }
  
  /** Set up hover sonification */
  setupHover() {
    const self = this;
    
    this._hoverHandler = function(e) {
      const idx = self.data.findIndex(d => d.element === this);
      if (idx >= 0) {
        self.audio.init();
        self.index = idx;
        self.playPoint(idx);
      }
    };
    
    this.selection?.each(function() {
      this.addEventListener('mouseenter', self._hoverHandler);
      this.addEventListener('focus', self._hoverHandler);
    });
  }
  
  /** Create ARIA live region */
  setupLiveRegion() {
    const id = 'sound3fy-live';
    this.liveRegion = document.getElementById(id);
    
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.id = id;
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(this.liveRegion);
    }
    
    // Add focus styles if not present
    if (!document.getElementById('sound3fy-styles')) {
      const style = document.createElement('style');
      style.id = 'sound3fy-styles';
      style.textContent = `
        .sonify-focused {
          outline: 3px solid #4A90D9 !important;
          outline-offset: 2px;
        }
        @media (prefers-contrast: high) {
          .sonify-focused { outline-color: currentColor !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /** Announce to screen readers */
  announce(message) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = '';
    setTimeout(() => {
      if (this.liveRegion) this.liveRegion.textContent = message;
    }, 50);
  }
  
  /** Update visual focus */
  updateFocus(element) {
    this.selection?.each(function() {
      this.classList.remove('sonify-focused');
    });
    
    if (element) {
      element.classList.add('sonify-focused');
      if (document.activeElement?.closest('svg') || document.activeElement === document.body) {
        element.focus({ preventScroll: true });
      }
    }
  }
  
  /** Clear focus */
  clearFocus() {
    this.selection?.each(function() {
      this.classList.remove('sonify-focused');
    });
  }
  
  // ─────────────────────────────────────────────────────────────
  // STATE GETTERS
  // ─────────────────────────────────────────────────────────────
  
  isPlaying() { return this.playing && !this.paused; }
  isPaused() { return this.paused; }
  currentIndex() { return this.index; }
  length() { return this.data.length; }
  getMode() { return this.mode; }
  
  // ─────────────────────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────────────────────
  
  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  /** Clean up everything */
  destroy() {
    this.stop();
    this.audio.destroy();
    
    const keyHandler = this._keyHandler;
    const hoverHandler = this._hoverHandler;
    
    this.selection?.each(function() {
      if (keyHandler) this.removeEventListener('keydown', keyHandler);
      if (hoverHandler) {
        this.removeEventListener('mouseenter', hoverHandler);
        this.removeEventListener('focus', hoverHandler);
      }
      this.classList.remove('sonify-focused');
      this.removeAttribute('tabindex');
      this.removeAttribute('role');
      this.removeAttribute('aria-roledescription');
    });
    
    this._keyHandler = null;
    this._hoverHandler = null;
  }
}

export default SonificationEngine;
