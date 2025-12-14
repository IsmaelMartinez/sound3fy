/**
 * SonificationEngine - Orchestrates audio playback with accessibility
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
    this.speed = 1;
    this.mode = options.mode || 'discrete';
    
    this.liveRegion = null;
    this._keyHandler = null;
    this._hoverHandler = null;
  }
  
  /** Bind to D3 selection */
  bind(selection, data) {
    this.selection = selection;
    this.data = data;
    this.mapper.analyze(data);
    
    const a11y = this.options.accessibility || {};
    
    if (a11y.focus !== false) {
      selection.each(function() {
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'graphics-symbol');
      });
    }
    
    if (a11y.keyboard !== false) this.setupKeyboard();
    if (a11y.announce !== false) this.setupLiveRegion();
    if (a11y.hover !== false) this.setupHover();
    
    return this;
  }
  
  // ─────────────────────────────────────────────────────────────
  // PLAYBACK
  // ─────────────────────────────────────────────────────────────
  
  async play() {
    if (this.playing && !this.paused) return this;
    
    this.audio.init();
    await this.audio.resume();
    this.playing = true;
    this.paused = false;
    
    if (this.index < 0) {
      this.index = 0;
      this.announce(this.mapper.summarize(this.data));
      await this.wait(600);
      if (this.options.markers?.start !== false) {
        this.audio.playMarker('start');
        await this.wait(100);
      }
    }
    
    this.mode === 'continuous' ? this.playContinuous() : this.playDiscrete();
    return this;
  }
  
  pause() {
    this.paused = true;
    clearTimeout(this.timer);
    this.stopContinuousSound();
    this.announce('Paused');
    return this;
  }
  
  stop() {
    this.playing = false;
    this.paused = false;
    this.index = -1;
    clearTimeout(this.timer);
    this.stopContinuousSound();
    this.clearFocus();
    return this;
  }
  
  toggle() {
    return (this.playing && !this.paused) ? this.pause() : this.play();
  }
  
  setSpeed(s) { this.speed = Math.max(0.25, Math.min(4, s)); return this; }
  setMode(m) { this.mode = m === 'continuous' ? 'continuous' : 'discrete'; return this; }
  
  // ─────────────────────────────────────────────────────────────
  // DISCRETE MODE
  // ─────────────────────────────────────────────────────────────
  
  playDiscrete() {
    if (!this.playing || this.paused) return;
    
    if (this.index >= this.data.length) {
      this.endPlayback();
      return;
    }
    
    this.playPoint(this.index++);
    
    const delay = ((this.options.duration || 200) + (this.options.gap || 50)) / this.speed;
    this.timer = setTimeout(() => this.playDiscrete(), delay);
  }
  
  playPoint(idx) {
    if (idx < 0 || idx >= this.data.length) return;
    
    const item = this.data[idx];
    const params = this.mapper.map(item, idx, this.data.length);
    params.duration /= this.speed;
    params.envelope = this.options.envelope;
    
    this.audio.playTone(params);
    this.announce(this.mapper.describe(item, idx, this.data.length));
    this.updateFocus(item.element);
  }
  
  // ─────────────────────────────────────────────────────────────
  // CONTINUOUS MODE
  // ─────────────────────────────────────────────────────────────
  
  playContinuous() {
    if (!this.playing || this.paused || !this.data.length) return;
    
    const ctx = this.audio.getContext();
    const now = ctx.currentTime;
    const duration = (this.data.length * (this.options.duration || 200) / 1000) / this.speed;
    
    // Create oscillator for sweep
    this.sweepOsc = ctx.createOscillator();
    this.sweepGain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    this.sweepOsc.type = 'sine';
    this.sweepOsc.connect(this.sweepGain);
    this.sweepGain.connect(panner);
    panner.connect(this.audio.getMasterGain());
    
    // Schedule frequency changes
    const frequencies = this.data.map((item, i) => this.mapper.map(item, i, this.data.length).frequency);
    const timePerPoint = duration / this.data.length;
    
    this.sweepOsc.frequency.setValueAtTime(frequencies[0], now);
    this.sweepGain.gain.setValueAtTime(0, now);
    this.sweepGain.gain.linearRampToValueAtTime(0.5, now + 0.05);
    panner.pan.setValueAtTime(-0.7, now);
    
    for (let i = 1; i < frequencies.length; i++) {
      const t = now + i * timePerPoint;
      this.sweepOsc.frequency.linearRampToValueAtTime(frequencies[i], t);
      panner.pan.linearRampToValueAtTime(-0.7 + (i / (frequencies.length - 1)) * 1.4, t);
    }
    
    this.sweepGain.gain.setValueAtTime(0.5, now + duration - 0.1);
    this.sweepGain.gain.linearRampToValueAtTime(0, now + duration);
    
    this.sweepOsc.start(now);
    this.sweepOsc.stop(now + duration + 0.1);
    this.sweepStart = now;
    
    this.trackPosition(duration);
    this.timer = setTimeout(() => this.endPlayback(), duration * 1000);
  }
  
  trackPosition(duration) {
    if (!this.playing || this.paused) return;
    
    const elapsed = this.audio.getContext().currentTime - this.sweepStart;
    const progress = Math.min(1, elapsed / duration);
    const newIdx = Math.floor(progress * this.data.length);
    
    if (newIdx !== this.index && newIdx < this.data.length) {
      this.index = newIdx;
      this.updateFocus(this.data[this.index]?.element);
    }
    
    if (progress < 1) requestAnimationFrame(() => this.trackPosition(duration));
  }
  
  stopContinuousSound() {
    try {
      this.sweepOsc?.stop();
      this.sweepOsc?.disconnect();
      this.sweepGain?.disconnect();
    } catch (e) {}
    this.sweepOsc = this.sweepGain = null;
  }
  
  endPlayback() {
    if (this.options.markers?.end !== false) this.audio.playMarker('end');
    this.announce('Playback complete');
    this.playing = false;
    this.index = -1;
    this.clearFocus();
  }
  
  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────
  
  next() {
    this.audio.init();
    this.index = Math.min(Math.max(0, this.index + 1), this.data.length - 1);
    this.playPoint(this.index);
    return this;
  }
  
  previous() {
    this.audio.init();
    this.index = Math.max(0, this.index - 1);
    this.playPoint(this.index);
    return this;
  }
  
  first() { this.audio.init(); this.index = 0; this.playPoint(0); return this; }
  last() { this.audio.init(); this.index = this.data.length - 1; this.playPoint(this.index); return this; }
  
  // ─────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────
  
  setupKeyboard() {
    const self = this;
    this._keyHandler = function(e) {
      const actions = {
        ' ': () => self.toggle(),
        'Escape': () => self.stop(),
        'ArrowRight': () => self.next(),
        'ArrowLeft': () => self.previous(),
        'Home': () => self.first(),
        'End': () => self.last(),
        '+': () => { self.setSpeed(self.speed * 1.25); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        '=': () => { self.setSpeed(self.speed * 1.25); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        '-': () => { self.setSpeed(self.speed * 0.8); self.announce(`Speed: ${Math.round(self.speed * 100)}%`); },
        'm': () => { self.setMode(self.mode === 'continuous' ? 'discrete' : 'continuous'); self.announce(`Mode: ${self.mode}`); },
        'M': () => { self.setMode(self.mode === 'continuous' ? 'discrete' : 'continuous'); self.announce(`Mode: ${self.mode}`); }
      };
      if (actions[e.key]) { e.preventDefault(); actions[e.key](); }
    };
    this.selection?.each(function() { this.addEventListener('keydown', self._keyHandler); });
  }
  
  setupHover() {
    const self = this;
    this._hoverHandler = function() {
      const idx = self.data.findIndex(d => d.element === this);
      if (idx >= 0) { self.audio.init(); self.index = idx; self.playPoint(idx); }
    };
    this.selection?.each(function() {
      this.addEventListener('mouseenter', self._hoverHandler);
      this.addEventListener('focus', self._hoverHandler);
    });
  }
  
  setupLiveRegion() {
    if (!document.getElementById('sound3fy-live')) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.id = 'sound3fy-live';
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
      document.body.appendChild(this.liveRegion);
    } else {
      this.liveRegion = document.getElementById('sound3fy-live');
    }
    
    if (!document.getElementById('sound3fy-styles')) {
      const style = document.createElement('style');
      style.id = 'sound3fy-styles';
      style.textContent = '.sonify-focused{outline:3px solid #4A90D9!important;outline-offset:2px}';
      document.head.appendChild(style);
    }
  }
  
  announce(msg) {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = '';
    setTimeout(() => { if (this.liveRegion) this.liveRegion.textContent = msg; }, 50);
  }
  
  updateFocus(el) {
    this.selection?.each(function() { this.classList.remove('sonify-focused'); });
    el?.classList.add('sonify-focused');
  }
  
  clearFocus() {
    this.selection?.each(function() { this.classList.remove('sonify-focused'); });
  }
  
  // ─────────────────────────────────────────────────────────────
  // STATE & CLEANUP
  // ─────────────────────────────────────────────────────────────
  
  isPlaying() { return this.playing && !this.paused; }
  isPaused() { return this.paused; }
  currentIndex() { return this.index; }
  length() { return this.data.length; }
  getMode() { return this.mode; }
  
  wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  
  destroy() {
    this.stop();
    this.audio.destroy();
    
    const kh = this._keyHandler, hh = this._hoverHandler;
    this.selection?.each(function() {
      if (kh) this.removeEventListener('keydown', kh);
      if (hh) { this.removeEventListener('mouseenter', hh); this.removeEventListener('focus', hh); }
      this.classList.remove('sonify-focused');
      this.removeAttribute('tabindex');
    });
  }
}

export default SonificationEngine;
