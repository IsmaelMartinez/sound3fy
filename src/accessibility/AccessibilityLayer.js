/**
 * AccessibilityLayer - Screen reader and keyboard accessibility support
 * 
 * Provides ARIA live region announcements, focus management,
 * and other accessibility features for sonification.
 */

export class AccessibilityLayer {
  constructor() {
    this.liveRegion = null;
    this.announceQueue = [];
    this.isAnnouncing = false;
  }
  
  /**
   * Create ARIA live region for announcements
   * @param {string} politeness - 'polite' or 'assertive'
   */
  createLiveRegion(politeness = 'polite') {
    // Check if already exists
    if (this.liveRegion) return this.liveRegion;
    
    // Create visually hidden live region
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', politeness);
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sound3fy-sr-only';
    
    // Add screen-reader-only styles if not present
    if (!document.getElementById('sound3fy-styles')) {
      const style = document.createElement('style');
      style.id = 'sound3fy-styles';
      style.textContent = `
        .sound3fy-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .sonify-focused {
          outline: 3px solid #4A90D9;
          outline-offset: 2px;
        }
        
        @media (prefers-contrast: high) {
          .sonify-focused {
            outline: 4px solid currentColor;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .sonify-focused {
            transition: none;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(this.liveRegion);
    return this.liveRegion;
  }
  
  /**
   * Announce a message to screen readers
   * Uses a queue to prevent overlapping announcements
   * 
   * @param {string} message - Message to announce
   * @param {Object} options - Announcement options
   * @param {boolean} options.immediate - Skip queue and announce immediately
   * @param {number} options.delay - Delay before announcing (ms)
   */
  announce(message, { immediate = false, delay = 0 } = {}) {
    if (!this.liveRegion) {
      this.createLiveRegion();
    }
    
    if (immediate) {
      // Clear queue and announce immediately
      this.announceQueue = [];
      this.doAnnounce(message, delay);
    } else {
      // Add to queue
      this.announceQueue.push({ message, delay });
      this.processQueue();
    }
  }
  
  /**
   * Process announcement queue
   */
  processQueue() {
    if (this.isAnnouncing || this.announceQueue.length === 0) return;
    
    this.isAnnouncing = true;
    const { message, delay } = this.announceQueue.shift();
    
    setTimeout(() => {
      this.doAnnounce(message);
      
      // Wait a bit before next announcement
      setTimeout(() => {
        this.isAnnouncing = false;
        this.processQueue();
      }, 500); // Min gap between announcements
    }, delay);
  }
  
  /**
   * Actually perform the announcement
   */
  doAnnounce(message, delay = 0) {
    setTimeout(() => {
      if (this.liveRegion) {
        // Clear and set content (triggers screen reader)
        this.liveRegion.textContent = '';
        // Use requestAnimationFrame to ensure the clear is processed
        requestAnimationFrame(() => {
          if (this.liveRegion) {
            this.liveRegion.textContent = message;
          }
        });
      }
    }, delay);
  }
  
  /**
   * Announce the start of sonification
   */
  announceStart(chartDescription, dataCount) {
    const message = chartDescription 
      ? `Playing ${chartDescription}. ${dataCount} data points.`
      : `Playing sonification. ${dataCount} data points.`;
    
    this.announce(message, { immediate: true });
  }
  
  /**
   * Announce the end of sonification
   */
  announceEnd() {
    this.announce('Playback complete.', { delay: 300 });
  }
  
  /**
   * Announce current position
   */
  announcePosition(index, total, value) {
    const message = `Point ${index + 1} of ${total}. Value: ${value}`;
    this.announce(message);
  }
  
  /**
   * Announce a trend
   */
  announceTrend(trend) {
    const trendMessages = {
      rising: 'Values are rising',
      falling: 'Values are falling',
      steady: 'Values are steady',
      peak: 'Peak value',
      trough: 'Lowest value'
    };
    
    const message = trendMessages[trend] || trend;
    this.announce(message);
  }
  
  /**
   * Create accessible controls panel
   */
  createControls(container, callbacks = {}) {
    const controlsPanel = document.createElement('div');
    controlsPanel.setAttribute('role', 'group');
    controlsPanel.setAttribute('aria-label', 'Sonification controls');
    controlsPanel.className = 'sound3fy-controls';
    
    // Play button
    const playBtn = this.createButton('Play', '▶', callbacks.onPlay);
    
    // Pause button
    const pauseBtn = this.createButton('Pause', '⏸', callbacks.onPause);
    
    // Stop button
    const stopBtn = this.createButton('Stop', '⏹', callbacks.onStop);
    
    // Previous button
    const prevBtn = this.createButton('Previous', '⏮', callbacks.onPrevious);
    
    // Next button
    const nextBtn = this.createButton('Next', '⏭', callbacks.onNext);
    
    controlsPanel.appendChild(prevBtn);
    controlsPanel.appendChild(playBtn);
    controlsPanel.appendChild(pauseBtn);
    controlsPanel.appendChild(stopBtn);
    controlsPanel.appendChild(nextBtn);
    
    if (container) {
      container.appendChild(controlsPanel);
    }
    
    return controlsPanel;
  }
  
  /**
   * Create an accessible button
   */
  createButton(label, icon, onClick) {
    const button = document.createElement('button');
    button.setAttribute('aria-label', label);
    button.setAttribute('type', 'button');
    button.textContent = icon;
    button.className = 'sound3fy-btn';
    
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    return button;
  }
  
  /**
   * Set up focus trap for modal sonification
   */
  createFocusTrap(container) {
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleKeydown = (event) => {
      if (event.key !== 'Tab') return;
      
      const focusables = container.querySelectorAll(focusableSelector);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    
    container.addEventListener('keydown', handleKeydown);
    
    return () => container.removeEventListener('keydown', handleKeydown);
  }
  
  /**
   * Generate description of chart data
   */
  generateChartDescription(data, options = {}) {
    if (!data || data.length === 0) {
      return 'Empty chart';
    }
    
    const values = data.map(d => {
      if (typeof d.datum === 'number') return d.datum;
      if (typeof d.datum?.value === 'number') return d.datum.value;
      return null;
    }).filter(v => v !== null);
    
    if (values.length === 0) {
      return `Chart with ${data.length} data points`;
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Detect trend
    let trend = 'varies';
    if (values.length >= 2) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
      else trend = 'stable';
    }
    
    return `Chart with ${data.length} data points. ` +
           `Values range from ${min.toLocaleString()} to ${max.toLocaleString()}. ` +
           `Overall trend is ${trend}.`;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
    }
    this.liveRegion = null;
    this.announceQueue = [];
    this.isAnnouncing = false;
  }
}

export default AccessibilityLayer;

