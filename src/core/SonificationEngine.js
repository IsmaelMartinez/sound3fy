/**
 * SonificationEngine - Central orchestration for sonification
 * 
 * Coordinates the AudioEngine, DataMapper, and AccessibilityLayer
 * to provide a complete sonification experience.
 */

import { AudioEngine } from './AudioEngine.js';
import { DataMapper } from './DataMapper.js';
import { AccessibilityLayer } from '../accessibility/AccessibilityLayer.js';

export class SonificationEngine {
  constructor(options = {}) {
    this.options = options;
    this.audioEngine = new AudioEngine();
    this.dataMapper = new DataMapper(options);
    this.accessibility = new AccessibilityLayer();
    
    this.state = {
      playing: false,
      paused: false,
      currentIndex: -1,
      data: [],
      selection: null
    };
    
    this.playbackTimer = null;
    this.eventListeners = new Map();
  }
  
  /**
   * Bind sonification to a D3 selection
   */
  bind(selection, data) {
    this.state.selection = selection;
    this.state.data = data;
    this.dataMapper.analyzeData(data);
    
    // Attach ARIA attributes to elements
    if (this.options.accessibility?.focusIndicator) {
      selection.each(function(d, i) {
        const el = this;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'graphics-symbol');
        el.setAttribute('aria-roledescription', 'data point');
      });
    }
    
    return this;
  }
  
  /**
   * Start playing the sonification
   */
  async play() {
    if (this.state.playing && !this.state.paused) return this;
    
    // Initialize audio on user gesture
    this.audioEngine.initialize();
    await this.audioEngine.resume();
    
    this.state.playing = true;
    this.state.paused = false;
    
    // If starting fresh, play start marker
    if (this.state.currentIndex < 0) {
      this.state.currentIndex = 0;
      if (this.options.markers?.start) {
        this.audioEngine.playMarker('start');
        await this.wait(150);
      }
      this.emit('start');
    }
    
    // Start playback loop
    this.playNext();
    
    return this;
  }
  
  /**
   * Pause playback
   */
  pause() {
    if (!this.state.playing) return this;
    
    this.state.paused = true;
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    this.emit('pause');
    return this;
  }
  
  /**
   * Stop playback and reset
   */
  stop() {
    this.state.playing = false;
    this.state.paused = false;
    this.state.currentIndex = -1;
    
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
    
    this.audioEngine.stopAll();
    this.emit('stop');
    return this;
  }
  
  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.state.playing && !this.state.paused) {
      return this.pause();
    }
    return this.play();
  }
  
  /**
   * Play next data point in sequence
   */
  playNext() {
    if (!this.state.playing || this.state.paused) return;
    
    const { data, currentIndex } = this.state;
    
    if (currentIndex >= data.length) {
      // End of data
      if (this.options.markers?.end) {
        this.audioEngine.playMarker('end');
      }
      this.state.playing = false;
      this.state.currentIndex = -1;
      this.emit('end');
      return;
    }
    
    // Play current point
    this.playPoint(currentIndex);
    
    // Schedule next point
    const duration = this.options.duration || 200;
    const gap = this.options.gap || 50;
    
    this.state.currentIndex++;
    this.playbackTimer = setTimeout(() => this.playNext(), duration + gap);
  }
  
  /**
   * Play a specific data point
   */
  playPoint(index) {
    const { data } = this.state;
    
    if (index < 0 || index >= data.length) return;
    
    const dataItem = data[index];
    const audioParams = this.dataMapper.mapPoint(dataItem, data.length);
    
    // Play the tone
    this.audioEngine.playTone({
      frequency: audioParams.frequency,
      duration: audioParams.duration,
      volume: audioParams.volume,
      pan: audioParams.pan,
      type: 'sine',
      envelope: this.options.envelope
    });
    
    // Announce value if accessibility is enabled
    if (this.options.accessibility?.announceValues) {
      const description = this.dataMapper.describePoint(dataItem, index, data.length);
      this.accessibility.announce(description);
    }
    
    // Update focus if enabled
    if (this.options.accessibility?.focusIndicator && dataItem.element) {
      this.updateFocus(dataItem.element);
    }
    
    this.emit('point', dataItem.datum, index);
  }
  
  /**
   * Go to next data point (for keyboard navigation)
   */
  next() {
    const { data, currentIndex } = this.state;
    const newIndex = Math.min(currentIndex + 1, data.length - 1);
    
    if (newIndex !== currentIndex || currentIndex < 0) {
      this.state.currentIndex = newIndex < 0 ? 0 : newIndex;
      this.audioEngine.initialize();
      this.playPoint(this.state.currentIndex);
    }
    
    return this;
  }
  
  /**
   * Go to previous data point
   */
  previous() {
    const { currentIndex } = this.state;
    const newIndex = Math.max(currentIndex - 1, 0);
    
    if (newIndex !== currentIndex) {
      this.state.currentIndex = newIndex;
      this.audioEngine.initialize();
      this.playPoint(this.state.currentIndex);
    }
    
    return this;
  }
  
  /**
   * Seek to specific index
   */
  seek(index) {
    const { data } = this.state;
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    
    this.state.currentIndex = clampedIndex;
    
    if (this.state.playing && !this.state.paused) {
      // Continue playing from new position
      if (this.playbackTimer) {
        clearTimeout(this.playbackTimer);
      }
      this.playNext();
    }
    
    return this;
  }
  
  /**
   * Seek by percentage
   */
  seekPercent(percent) {
    const { data } = this.state;
    const index = Math.round(percent * (data.length - 1));
    return this.seek(index);
  }
  
  /**
   * Enable keyboard navigation
   */
  enableKeyboardNavigation() {
    const handleKeydown = (event) => {
      switch (event.key) {
        case ' ': // Space
          event.preventDefault();
          this.toggle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.previous();
          break;
        case 'Home':
          event.preventDefault();
          this.seek(0);
          break;
        case 'End':
          event.preventDefault();
          this.seek(this.state.data.length - 1);
          break;
        case 'Escape':
          event.preventDefault();
          this.stop();
          break;
      }
    };
    
    // Attach to each element in selection
    this.state.selection?.each(function() {
      this.addEventListener('keydown', handleKeydown);
    });
    
    this._keydownHandler = handleKeydown;
    return this;
  }
  
  /**
   * Enable screen reader announcements
   */
  enableAnnouncements() {
    this.accessibility.createLiveRegion();
    return this;
  }
  
  /**
   * Update visual focus indicator
   */
  updateFocus(element) {
    // Remove focus from all elements
    this.state.selection?.each(function() {
      this.classList.remove('sonify-focused');
    });
    
    // Add focus to current element
    if (element) {
      element.classList.add('sonify-focused');
      element.focus();
    }
  }
  
  /**
   * Check if currently playing
   */
  isPlaying() {
    return this.state.playing && !this.state.paused;
  }
  
  /**
   * Get current index
   */
  currentIndex() {
    return this.state.currentIndex;
  }
  
  /**
   * Calculate total duration
   */
  duration() {
    const { data } = this.state;
    const noteDuration = this.options.duration || 200;
    const gap = this.options.gap || 50;
    
    return data.length * (noteDuration + gap);
  }
  
  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
    return this;
  }
  
  /**
   * Emit event
   */
  emit(event, ...args) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(...args));
  }
  
  /**
   * Utility: wait for a duration
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Clean up all resources
   */
  destroy() {
    this.stop();
    this.audioEngine.destroy();
    this.accessibility.destroy();
    
    // Remove keyboard handlers
    if (this._keydownHandler) {
      this.state.selection?.each(function() {
        this.removeEventListener('keydown', this._keydownHandler);
      });
    }
    
    // Remove focus classes
    this.state.selection?.each(function() {
      this.classList.remove('sonify-focused');
      this.removeAttribute('tabindex');
    });
    
    this.eventListeners.clear();
    this.state = {
      playing: false,
      paused: false,
      currentIndex: -1,
      data: [],
      selection: null
    };
  }
}

export default SonificationEngine;

