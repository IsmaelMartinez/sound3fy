/**
 * SonificationEngine - Orchestrates audio, data mapping, and accessibility
 */

import { AudioEngine } from './AudioEngine.js';
import { DataMapper } from './DataMapper.js';

export class SonificationEngine {
  constructor(options = {}) {
    this.options = options;
    this.audio = new AudioEngine();
    this.mapper = new DataMapper(options);
    
    this.data = [];
    this.selection = null;
    this.index = -1;
    this.playing = false;
    this.paused = false;
    this.timer = null;
    this.liveRegion = null;
  }
  
  /** Bind to D3 selection and data */
  bind(selection, data) {
    this.selection = selection;
    this.data = data;
    this.mapper.analyze(data);
    
    // Set up accessibility
    if (this.options.accessibility?.focus) {
      selection.each(function() {
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'graphics-symbol');
      });
    }
    
    if (this.options.accessibility?.keyboard) {
      this.setupKeyboard();
    }
    
    if (this.options.accessibility?.announce) {
      this.setupLiveRegion();
    }
    
    return this;
  }
  
  /** Start playback */
  async play() {
    if (this.playing && !this.paused) return this;
    
    this.audio.init();
    await this.audio.resume();
    
    this.playing = true;
    this.paused = false;
    
    if (this.index < 0) {
      this.index = 0;
      if (this.options.markers?.start) {
        this.audio.playMarker('start');
        await this.wait(150);
      }
    }
    
    this.playNext();
    return this;
  }
  
  /** Pause playback */
  pause() {
    this.paused = true;
    clearTimeout(this.timer);
    return this;
  }
  
  /** Stop and reset */
  stop() {
    this.playing = false;
    this.paused = false;
    this.index = -1;
    clearTimeout(this.timer);
    this.clearFocus();
    return this;
  }
  
  /** Toggle play/pause */
  toggle() {
    return (this.playing && !this.paused) ? this.pause() : this.play();
  }
  
  /** Play next point in sequence */
  playNext() {
    if (!this.playing || this.paused) return;
    
    if (this.index >= this.data.length) {
      if (this.options.markers?.end) this.audio.playMarker('end');
      this.playing = false;
      this.index = -1;
      this.clearFocus();
      return;
    }
    
    this.playPoint(this.index);
    this.index++;
    
    const delay = (this.options.duration || 200) + (this.options.gap || 50);
    this.timer = setTimeout(() => this.playNext(), delay);
  }
  
  /** Play a specific data point */
  playPoint(idx) {
    if (idx < 0 || idx >= this.data.length) return;
    
    const item = this.data[idx];
    const params = this.mapper.map(item, idx, this.data.length);
    
    this.audio.playTone(params);
    this.announce(this.mapper.describe(item, idx, this.data.length));
    this.updateFocus(item.element);
  }
  
  /** Navigate to next point */
  next() {
    this.audio.init();
    this.index = Math.min(Math.max(0, this.index + 1), this.data.length - 1);
    this.playPoint(this.index);
    return this;
  }
  
  /** Navigate to previous point */
  previous() {
    this.audio.init();
    this.index = Math.max(0, this.index - 1);
    this.playPoint(this.index);
    return this;
  }
  
  /** Set up keyboard navigation */
  setupKeyboard() {
    const handler = (e) => {
      const actions = {
        ' ': () => { e.preventDefault(); this.toggle(); },
        'ArrowRight': () => { e.preventDefault(); this.next(); },
        'ArrowLeft': () => { e.preventDefault(); this.previous(); },
        'Escape': () => { e.preventDefault(); this.stop(); }
      };
      actions[e.key]?.();
    };
    
    this.selection?.each(function() {
      this.addEventListener('keydown', handler);
    });
    
    this._keyHandler = handler;
  }
  
  /** Set up ARIA live region for announcements */
  setupLiveRegion() {
    if (document.getElementById('sound3fy-live')) return;
    
    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'sound3fy-live';
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
    document.body.appendChild(this.liveRegion);
    
    // Add focus styles
    if (!document.getElementById('sound3fy-styles')) {
      const style = document.createElement('style');
      style.id = 'sound3fy-styles';
      style.textContent = '.sonify-focused { outline: 3px solid #4A90D9; outline-offset: 2px; }';
      document.head.appendChild(style);
    }
  }
  
  /** Announce to screen readers */
  announce(message) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = '';
    requestAnimationFrame(() => { this.liveRegion.textContent = message; });
  }
  
  /** Update visual focus */
  updateFocus(element) {
    this.selection?.each(function() { this.classList.remove('sonify-focused'); });
    element?.classList.add('sonify-focused');
    element?.focus();
  }
  
  /** Clear focus */
  clearFocus() {
    this.selection?.each(function() { this.classList.remove('sonify-focused'); });
  }
  
  /** Utility: wait ms */
  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  /** Clean up */
  destroy() {
    this.stop();
    this.audio.destroy();
    
    if (this._keyHandler) {
      const handler = this._keyHandler;
      this.selection?.each(function() {
        this.removeEventListener('keydown', handler);
      });
    }
    
    this.clearFocus();
    this.liveRegion?.remove();
  }
}

export default SonificationEngine;
