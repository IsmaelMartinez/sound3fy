# sound3fy Research Document & Project Plan

> **Making D3.js visualizations accessible through sound**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Market Analysis](#market-analysis)
4. [Technical Research](#technical-research)
5. [Architecture Design](#architecture-design)
6. [API Design](#api-design)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Iterative Development Plan](#iterative-development-plan)
9. [Accessibility Standards](#accessibility-standards)
10. [User Testing Guidelines](#user-testing-guidelines)
11. [References & Resources](#references--resources)

---

## Executive Summary

**sound3fy** aims to bring auditory representations to D3.js data visualizations, making charts and graphs accessible to blind and low-vision (BLV) users. By adding a simple `.sonify()` method to D3 selections, developers can enable sound-based data exploration with minimal code changes.

### Key Findings

| Aspect | Finding |
|--------|---------|
| **Need** | ✅ Significant - 2.2 billion people globally have vision impairment (WHO) |
| **Gap** | ✅ No D3.js-specific sonification library exists |
| **Feasibility** | ✅ High - Web Audio API is mature and well-supported |
| **Competition** | ⚠️ Moderate - Solutions exist but none for D3.js |
| **Impact Potential** | ✅ High - D3 powers millions of web visualizations |

### Project Vision

```
Before: d3.select("svg").selectAll("rect").data(data).enter().append("rect")...

After:  d3.select("svg").selectAll("rect").data(data).enter().append("rect")...
            .sonify({ pitch: "value", duration: 200 })
```

---

## Problem Statement

### The Accessibility Gap

Data visualizations are fundamentally visual. When a sighted person views a bar chart, they instantly perceive:
- Relative heights (comparison)
- Trends (rising/falling)
- Outliers (unusual values)
- Patterns (cyclical, seasonal)

**Screen readers can only provide:**
- Alt text descriptions (often generic: "Bar chart showing sales data")
- Data table alternatives (loses the "gestalt" understanding)
- No interactive exploration

### Who This Affects

| Population | Size | Impact |
|------------|------|--------|
| Blind individuals | ~43 million globally | Cannot access any visual data |
| Low-vision users | ~295 million globally | Struggle with most visualizations |
| Color-blind users | ~300 million globally | Struggle with color-coded data |
| Situational impairment | Billions | Driving, bright sunlight, multitasking |

### Why Sonification Works

Human auditory perception can detect:
- **Pitch changes** → Value magnitude (higher = more)
- **Volume changes** → Emphasis/importance
- **Spatial panning** → Position (left-to-right progression)
- **Timbre differences** → Categories/series
- **Rhythm patterns** → Trends and cycles
- **Duration** → Data density or significance

Research shows BLV users can achieve **comparable comprehension** to sighted users when data is properly sonified (MAIDR study, 2024).

---

## Market Analysis

### Existing Solutions

#### 1. **Chart2Music** ⭐ Key Reference
- **What:** JavaScript library for chart sonification
- **Strengths:** Screen reader support, keyboard navigation, well-documented
- **Weakness:** Not D3.js integrated, requires separate chart binding
- **URL:** https://chart2music.com

#### 2. **Highcharts Sonification Module**
- **What:** Built-in sonification for Highcharts
- **Strengths:** Production-ready, well-tested
- **Weakness:** Commercial, Highcharts-only, not D3.js compatible
- **URL:** https://api.highcharts.com/highcharts/sonification

#### 3. **MAIDR (Multimodal Access and Interactive Data Representation)**
- **What:** Academic system for accessible visualizations
- **Strengths:** Research-backed, multimodal (audio + braille + text)
- **Weakness:** Academic prototype, Python-focused (PyMAIDR)
- **Paper:** https://arxiv.org/abs/2403.00717

#### 4. **Erie**
- **What:** Declarative grammar for data sonification
- **Strengths:** Elegant API design, compositional
- **Weakness:** Research project, not production-ready
- **Paper:** https://arxiv.org/abs/2402.00156

#### 5. **Susurrus**
- **What:** Natural sounds for data representation
- **Strengths:** Uses familiar sounds (rain, wind) for intuitive mapping
- **Weakness:** Research prototype
- **Paper:** https://drum.lib.umd.edu/items/66d33f10-0c1c-4028-ba5c-a59729a10daa

#### 6. **Data-Scape**
- **What:** D3.js + Tone.js framework for COVID-19 data
- **Strengths:** Proves D3.js + audio integration is feasible
- **Weakness:** Single-purpose, not a reusable library
- **URL:** https://www.stephenroddy.com/projects/data-scape/

#### 7. **Apple Audio Graphs**
- **What:** Native iOS VoiceOver feature
- **Strengths:** Platform-level integration, polished UX
- **Weakness:** iOS only, not web

### Competitive Gap Analysis

```
                    D3.js Native  │  Easy API  │  Production Ready  │  Open Source
────────────────────────────────────────────────────────────────────────────────────
Chart2Music              ❌       │     ✅     │        ✅          │      ✅
Highcharts               ❌       │     ✅     │        ✅          │      ❌
MAIDR                    ❌       │     ⚠️     │        ❌          │      ✅
Erie                     ❌       │     ✅     │        ❌          │      ✅
sound3fy (proposed)      ✅       │     ✅     │        🎯          │      ✅
```

**The opportunity:** No solution provides native D3.js integration with a simple, chainable API.

---

## Technical Research

### Human Hearing Perception

#### Optimal Frequency Ranges

| Range | Frequency | Use Case |
|-------|-----------|----------|
| Low | 100-300 Hz | Bass tones, minimum values |
| Comfortable | 300-3000 Hz | **Primary data range** |
| High | 3000-8000 Hz | Alerts, maximum values |
| Uncomfortable | >10000 Hz | Avoid |

**Recommendation:** Map data to **200-2000 Hz** for comfortable, distinguishable tones.

#### Pitch Perception

```
Frequency (Hz)  Note    Perception
────────────────────────────────────
262             C4      Middle C (reference point)
294             D4      
330             E4      
349             F4      
392             G4      
440             A4      Concert pitch (common reference)
494             B4      
523             C5      One octave above Middle C
```

**Important:** Use **logarithmic scaling** for pitch—human perception is logarithmic, not linear. Doubling the frequency = one octave higher.

#### Musical Scales for Data

| Scale | Notes | Best For |
|-------|-------|----------|
| **Pentatonic** | C-D-E-G-A | Pleasant, no dissonance, good default |
| Chromatic | All 12 | Maximum resolution, can sound harsh |
| Major | 7 notes | Happy/positive data |
| Minor | 7 notes | Serious/negative data |
| Blues | 6 notes | Engaging, distinctive |

**Recommendation:** Default to **pentatonic scale** (C-D-E-G-A) for pleasant, accessible sonification.

### Web Audio API Fundamentals

#### Core Components

```javascript
// Audio context (one per page)
const audioContext = new AudioContext();

// Oscillator (tone generator)
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine'; // sine, square, sawtooth, triangle
oscillator.frequency.value = 440; // Hz

// Gain (volume control)
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.5; // 0-1

// Connect: oscillator → gain → output
oscillator.connect(gainNode);
gainNode.connect(audioContext.destination);

// Start/stop
oscillator.start();
oscillator.stop(audioContext.currentTime + 0.5); // Stop after 0.5s
```

#### Scheduling Best Practices

```javascript
// ❌ BAD: setTimeout for audio (drift, imprecise)
setTimeout(() => playNote(), 500);

// ✅ GOOD: Web Audio API scheduling (sample-accurate)
oscillator.start(audioContext.currentTime + 0.5);
```

#### Envelope (ADSR) for Pleasant Sounds

```
Volume
  │    /\
  │   /  \____
  │  /        \
  │ /          \
  └─────────────────── Time
    A  D   S   R

A = Attack (fade in, ~10-50ms)
D = Decay (initial drop, ~50-100ms)
S = Sustain (hold level, variable)
R = Release (fade out, ~50-200ms)
```

```javascript
// Apply ADSR envelope
const now = audioContext.currentTime;
gainNode.gain.setValueAtTime(0, now);
gainNode.gain.linearRampToValueAtTime(0.8, now + 0.02);  // Attack
gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);   // Decay
gainNode.gain.setValueAtTime(0.5, now + 0.3);            // Sustain
gainNode.gain.linearRampToValueAtTime(0, now + 0.5);     // Release
```

### Tone.js Consideration

**Tone.js** is a higher-level Web Audio library that simplifies:
- Musical timing and scheduling
- Instrument synthesis
- Effects and processing

**Trade-off:**
- ✅ Easier development
- ❌ Additional dependency (~100KB)
- ❌ May be overkill for simple sonification

**Recommendation:** Start with raw Web Audio API, consider Tone.js for v2 if complexity warrants.

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         sound3fy                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   D3.js     │───▶│   sound3fy  │───▶│  Web Audio  │         │
│  │  Selection  │    │    Core     │    │     API     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    Data     │    │   Mapping   │    │   Audio     │         │
│  │  Binding    │    │   Engine    │    │   Engine    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                            │                                    │
│                            ▼                                    │
│                     ┌─────────────┐                             │
│                     │ Accessibility│                            │
│                     │   Layer      │                            │
│                     │ (ARIA, Keys) │                            │
│                     └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
sound3fy/
├── src/
│   ├── index.js              # Main entry, D3 extension
│   ├── core/
│   │   ├── SonificationEngine.js   # Central orchestration
│   │   ├── AudioEngine.js          # Web Audio API wrapper
│   │   └── DataMapper.js           # Data → Audio mapping
│   ├── mappings/
│   │   ├── pitch.js          # Value → Frequency
│   │   ├── volume.js         # Value → Gain
│   │   ├── pan.js            # Position → Stereo
│   │   ├── duration.js       # Value → Note length
│   │   └── timbre.js         # Category → Instrument
│   ├── scales/
│   │   ├── pentatonic.js     # Default scale
│   │   ├── chromatic.js
│   │   └── custom.js         # User-defined
│   ├── accessibility/
│   │   ├── keyboard.js       # Keyboard navigation
│   │   ├── aria.js           # Screen reader support
│   │   └── announcer.js      # Live region announcements
│   └── charts/
│       ├── bar.js            # Bar chart sonification
│       ├── line.js           # Line chart sonification
│       ├── scatter.js        # Scatter plot
│       └── generic.js        # Fallback
├── dist/                     # Built files
├── examples/                 # Demo implementations
├── tests/                    # Test suite
└── docs/                     # Documentation
```

### Core Classes

#### SonificationEngine

```javascript
class SonificationEngine {
  constructor(options = {}) {
    this.audioEngine = new AudioEngine();
    this.dataMapper = new DataMapper(options.mappings);
    this.accessibility = new AccessibilityLayer();
    this.state = {
      playing: false,
      currentIndex: 0,
      data: []
    };
  }

  // Bind to D3 selection
  bind(selection, options) { }
  
  // Play entire sonification
  play() { }
  
  // Pause playback
  pause() { }
  
  // Stop and reset
  stop() { }
  
  // Step through data points
  next() { }
  previous() { }
  
  // Jump to specific point
  seek(index) { }
}
```

#### AudioEngine

```javascript
class AudioEngine {
  constructor() {
    this.context = null;  // Lazy initialization (user gesture required)
    this.masterGain = null;
  }

  // Initialize on first user interaction
  initialize() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  // Play a single tone
  playTone({ frequency, duration, volume, pan }) { }
  
  // Play a sequence
  playSequence(tones, tempo) { }
  
  // Orientation sounds
  playStartMarker() { }
  playEndMarker() { }
  playAxisMarker() { }
}
```

#### DataMapper

```javascript
class DataMapper {
  constructor(options = {}) {
    this.scales = {
      pitch: this.createPitchScale(options.pitch),
      volume: this.createVolumeScale(options.volume),
      pan: this.createPanScale(options.pan),
      duration: this.createDurationScale(options.duration)
    };
  }

  // Map single data point to audio parameters
  mapPoint(datum, index, total) {
    return {
      frequency: this.scales.pitch(datum),
      gain: this.scales.volume(datum),
      pan: this.scales.pan(index / total),
      duration: this.scales.duration(datum)
    };
  }

  // Map entire dataset
  mapDataset(data) {
    return data.map((d, i) => this.mapPoint(d, i, data.length));
  }
}
```

---

## API Design

### Design Principles

1. **Minimal Friction** - Add sonification with one method call
2. **D3-idiomatic** - Chainable, uses selections and data binding
3. **Progressive Disclosure** - Simple defaults, deep customization available
4. **Accessible by Default** - Keyboard + screen reader support built-in

### Basic API

```javascript
// Simplest usage - uses smart defaults
d3.selectAll("rect")
  .data(data)
  .sonify();

// With options
d3.selectAll("rect")
  .data(data)
  .sonify({
    pitch: "value",           // Data field for pitch
    duration: 200,            // Note duration in ms
    tempo: 120                // BPM for playback
  });

// With accessor functions
d3.selectAll("circle")
  .data(data)
  .sonify({
    pitch: d => d.y,
    volume: d => d.importance,
    pan: (d, i, nodes) => i / nodes.length  // Left-to-right
  });
```

### Advanced API

```javascript
// Full control
d3.selectAll("rect")
  .data(data)
  .sonify({
    // Pitch configuration
    pitch: {
      field: "value",
      scale: "pentatonic",      // pentatonic, chromatic, major, minor
      range: [200, 2000],       // Hz
      domain: "auto"            // or [min, max]
    },
    
    // Volume configuration
    volume: {
      field: "confidence",
      range: [0.3, 1.0]
    },
    
    // Stereo panning
    pan: {
      field: "index",           // or accessor function
      range: [-1, 1]            // Left to Right
    },
    
    // Timing
    duration: 200,              // Per-note duration (ms)
    tempo: 120,                 // Playback speed (BPM)
    gap: 50,                    // Gap between notes (ms)
    
    // Envelope
    envelope: {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.7,
      release: 0.1
    },
    
    // Orientation sounds
    markers: {
      start: true,              // Play sound at start
      end: true,                // Play sound at end
      axes: true                // Play at axis crossings
    },
    
    // Accessibility
    accessibility: {
      announceValues: true,     // Speak values via screen reader
      keyboardNavigation: true, // Enable arrow key navigation
      focusIndicator: true      // Visual focus ring
    },
    
    // Events
    onStart: () => {},
    onEnd: () => {},
    onPoint: (d, i) => {},
    onPause: () => {}
  });
```

### Playback Control API

```javascript
const sonification = d3.selectAll("rect").sonify(options);

// Control methods
sonification.play();              // Start playback
sonification.pause();             // Pause
sonification.stop();              // Stop and reset
sonification.toggle();            // Play/Pause toggle

// Navigation
sonification.next();              // Next data point
sonification.previous();          // Previous data point
sonification.seek(5);             // Jump to index 5
sonification.seekPercent(0.5);    // Jump to 50%

// State
sonification.isPlaying();         // Boolean
sonification.currentIndex();      // Current position
sonification.duration();          // Total duration in ms

// Cleanup
sonification.destroy();           // Remove all listeners
```

### Event Handling

```javascript
d3.selectAll("rect")
  .sonify(options)
  .on("sonify:start", () => console.log("Started"))
  .on("sonify:end", () => console.log("Ended"))
  .on("sonify:point", (event, d, i) => {
    console.log(`Playing point ${i}: ${d.value}`);
  })
  .on("sonify:pause", () => console.log("Paused"));
```

### Integration with D3 Events

```javascript
// Sonify on hover
d3.selectAll("rect")
  .data(data)
  .on("mouseenter", function(event, d) {
    d3.select(this).sonify({ instant: true });
  });

// Sonify on focus (keyboard navigation)
d3.selectAll("rect")
  .attr("tabindex", 0)
  .on("focus", function(event, d) {
    d3.select(this).sonify({ instant: true });
  });
```

---

## Implementation Guidelines

### Sound Design Principles

#### 1. Use Distinct, Non-Annoying Tones

```javascript
// ✅ GOOD: Soft sine wave with envelope
{
  type: 'sine',
  envelope: { attack: 0.02, decay: 0.05, sustain: 0.6, release: 0.1 }
}

// ❌ BAD: Harsh square wave, instant on/off
{
  type: 'square',
  envelope: null
}
```

#### 2. Provide Audio Context

```javascript
// Orientation sounds
const orientationSounds = {
  start: { frequency: 880, duration: 100, type: 'triangle' },  // High beep
  end: { frequency: 220, duration: 200, type: 'triangle' },    // Low beep
  zero: { frequency: 440, duration: 50, type: 'sine' },        // Reference tone
  axis: { frequency: 330, duration: 30, type: 'sine' }         // Subtle tick
};
```

#### 3. Map Intuitively

| Data Attribute | Audio Parameter | Mapping |
|----------------|-----------------|---------|
| Higher value | Higher pitch | Intuitive |
| More important | Louder | Intuitive |
| Later in sequence | More to the right | Spatial |
| Different category | Different timbre | Distinguishable |
| Increasing trend | Rising pitch | Familiar (music) |

#### 4. Respect User Preferences

```javascript
// Check for reduced motion preference (may indicate sound sensitivity)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Check for system volume/mute (not directly accessible, but provide controls)
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `Enter` | Play from current position |
| `Escape` | Stop |
| `→` Arrow Right | Next data point |
| `←` Arrow Left | Previous data point |
| `Home` | Go to start |
| `End` | Go to end |
| `+` / `=` | Increase tempo |
| `-` / `_` | Decrease tempo |
| `M` | Mute/Unmute |

### Screen Reader Integration

```javascript
// Create ARIA live region for announcements
const announcer = document.createElement('div');
announcer.setAttribute('role', 'status');
announcer.setAttribute('aria-live', 'polite');
announcer.setAttribute('aria-atomic', 'true');
announcer.className = 'sr-only'; // Visually hidden
document.body.appendChild(announcer);

// Announce data point
function announce(message) {
  announcer.textContent = message;
}

// Example announcements
announce("Playing chart: Sales by Month. 12 data points.");
announce("Point 3 of 12. March 2024. Value: $5,000.");
announce("Playback complete.");
```

### Visual Focus Indicator

```css
/* Focus styles for keyboard navigation */
.sonify-focused {
  outline: 3px solid #4A90D9;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .sonify-focused {
    outline: 4px solid currentColor;
  }
}
```

---

## Iterative Development Plan

### Phase 0: Foundation (Week 1-2)
**Goal:** Set up project infrastructure

- [ ] Initialize npm package
- [ ] Set up build system (Rollup/Vite)
- [ ] Configure TypeScript (optional but recommended)
- [ ] Set up testing framework (Vitest/Jest)
- [ ] Create basic documentation structure
- [ ] Set up CI/CD pipeline

**Deliverable:** Empty but functional npm package

---

### Phase 1: Core Audio (Week 3-4)
**Goal:** Basic sound generation

- [ ] Implement AudioEngine class
- [ ] Implement basic oscillator with ADSR envelope
- [ ] Implement tone scheduling
- [ ] Create pitch mapping (linear and logarithmic)
- [ ] Create volume mapping
- [ ] Add pentatonic scale quantization
- [ ] Write unit tests for audio engine

**Deliverable:** Can play a sequence of tones from an array of values

```javascript
// Phase 1 API
const audio = new sound3fy.AudioEngine();
audio.playSequence([100, 200, 300, 400, 500], { duration: 200 });
```

---

### Phase 2: D3 Integration (Week 5-6)
**Goal:** Basic D3 selection binding

- [ ] Create D3 plugin wrapper
- [ ] Implement `.sonify()` method on selections
- [ ] Extract data from D3 data binding
- [ ] Basic options handling
- [ ] Play/Pause/Stop controls
- [ ] Write integration tests with D3

**Deliverable:** Basic working prototype

```javascript
// Phase 2 API
d3.selectAll("rect")
  .data(data)
  .sonify({ pitch: "value" })
  .play();
```

---

### Phase 3: Accessibility Layer (Week 7-8)
**Goal:** Keyboard and screen reader support

- [ ] Implement keyboard navigation
- [ ] Create ARIA live region announcer
- [ ] Add focus management
- [ ] Implement element-by-element navigation
- [ ] Add visual focus indicators
- [ ] Write accessibility tests (axe-core)

**Deliverable:** Fully accessible basic sonification

```javascript
// Phase 3 API (accessibility enabled by default)
d3.selectAll("rect")
  .data(data)
  .sonify({ pitch: "value" });
// Arrow keys now navigate, screen reader announces values
```

---

### Phase 4: Advanced Mappings (Week 9-10)
**Goal:** Sophisticated data-to-audio mapping

- [ ] Add stereo panning
- [ ] Add duration mapping
- [ ] Add timbre/instrument selection
- [ ] Support multiple scales (major, minor, chromatic)
- [ ] Add orientation sounds (start/end markers)
- [ ] Implement axis crossing sounds
- [ ] Support multi-series data

**Deliverable:** Feature-complete mapping system

```javascript
// Phase 4 API
d3.selectAll("rect")
  .data(data)
  .sonify({
    pitch: { field: "value", scale: "pentatonic" },
    pan: { field: "index" },
    volume: { field: "importance" },
    markers: { start: true, end: true }
  });
```

---

### Phase 5: Chart-Specific Handlers (Week 11-12)
**Goal:** Optimized handling for common chart types

- [ ] Bar chart handler (discrete tones)
- [ ] Line chart handler (continuous sweep)
- [ ] Scatter plot handler (2D mapping)
- [ ] Area chart handler
- [ ] Auto-detection of chart type
- [ ] Chart-specific announcements

**Deliverable:** Smart chart handling

```javascript
// Phase 5 API
d3.selectAll("rect")
  .sonify({ type: "bar" });  // Or auto-detected

d3.selectAll("path.line")
  .sonify({ type: "line" });  // Continuous frequency sweep
```

---

### Phase 6: User Testing (Week 13-14)
**Goal:** Validate with real users

- [ ] Recruit BLV testers (3-5 users)
- [ ] Conduct moderated testing sessions
- [ ] Gather feedback on:
  - Comprehension accuracy
  - Sound pleasantness
  - Navigation usability
  - Screen reader compatibility
- [ ] Document findings
- [ ] Prioritize improvements

**Deliverable:** User testing report with action items

---

### Phase 7: Polish & Documentation (Week 15-16)
**Goal:** Production readiness

- [ ] Address user testing feedback
- [ ] Performance optimization
- [ ] Browser compatibility testing
- [ ] Complete API documentation
- [ ] Create tutorial examples
- [ ] Write migration guide (for existing D3 code)
- [ ] Create demo website
- [ ] Write blog post / announcement

**Deliverable:** v1.0.0 release

---

### Future Phases (Post v1.0)

**v1.1 - Enhanced Features**
- Custom instrument synthesis
- Real-time data streaming support
- Mobile touch gestures

**v1.2 - Integrations**
- Observable / Jupyter support
- React/Vue component wrappers
- Tone.js backend option

**v2.0 - AI-Enhanced**
- Automatic chart type detection
- Smart default mappings
- Natural language descriptions

---

## Accessibility Standards

### WCAG 2.2 Compliance Checklist

#### Perceivable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | Text alternatives | Announce values via screen reader |
| 1.2.1 Audio-only | Alternatives | Provide data table export |
| 1.4.2 Audio Control | Pause/stop/volume | Playback controls required |

#### Operable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.1.1 Keyboard | All functionality | Full keyboard navigation |
| 2.1.2 No Keyboard Trap | Can navigate away | Escape stops sonification |
| 2.4.7 Focus Visible | Clear focus indicator | Visual focus ring |

#### Understandable

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.2.1 On Focus | No unexpected changes | Don't auto-play on focus |
| 3.2.2 On Input | Predictable behavior | Document all keyboard shortcuts |

#### Robust

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 4.1.2 Name, Role, Value | Assistive tech support | ARIA labels and live regions |

### ARIA Implementation

```html
<!-- Chart container -->
<svg role="img" aria-label="Bar chart: Sales by Month, January to December 2024">
  
  <!-- Interactive elements -->
  <rect 
    role="graphics-symbol" 
    aria-roledescription="bar"
    aria-label="January: $5,000"
    tabindex="0"
  />
  
</svg>

<!-- Live region for announcements -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Dynamic announcements appear here -->
</div>

<!-- Controls -->
<div role="group" aria-label="Sonification controls">
  <button aria-label="Play">▶</button>
  <button aria-label="Pause">⏸</button>
  <button aria-label="Stop">⏹</button>
</div>
```

---

## User Testing Guidelines

### Participant Recruitment

**Target participants:**
- 3-5 blind screen reader users
- 2-3 low-vision users (may use magnification)
- 1-2 sighted users (baseline comparison)

**Recruitment channels:**
- National Federation of the Blind (NFB)
- American Foundation for the Blind (AFB)
- Royal National Institute of Blind People (RNIB)
- University accessibility research labs
- r/Blind subreddit

### Testing Protocol

#### Pre-Test (5 min)
1. Confirm assistive technology setup
2. Explain the purpose of the study
3. Get consent for recording

#### Tasks (30 min)

**Task 1: Basic Comprehension**
> "Listen to this sonification and tell me what you think the trend is."

**Task 2: Value Identification**
> "Which month had the highest value? Which had the lowest?"

**Task 3: Navigation**
> "Using the keyboard, navigate to the third data point."

**Task 4: Comparison**
> "Compare these two charts and tell me which one shows faster growth."

#### Post-Test (10 min)
1. System Usability Scale (SUS) questionnaire
2. Open-ended feedback
3. Feature requests

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task success rate | >80% | % of tasks completed correctly |
| Time on task | <2min baseline | Seconds to complete task |
| Error rate | <20% | Incorrect interpretations |
| SUS score | >70 | Standard SUS questionnaire |
| Satisfaction | >4/5 | Likert scale |

---

## References & Resources

### Academic Papers

1. **MAIDR** - "Making Statistical Visualizations Accessible with Multimodal Data Representation" (2024)
   - https://arxiv.org/abs/2403.00717

2. **Erie** - "A Declarative Grammar for Data Sonification" (2024)
   - https://arxiv.org/abs/2402.00156

3. **Susurrus** - "Accessible Data Representation with Natural Sound" (2023)
   - https://drum.lib.umd.edu/items/66d33f10-0c1c-4028-ba5c-a59729a10daa

4. **Chart4Blind** - "An Intelligent Interface for Chart Accessibility Conversion" (2024)
   - https://arxiv.org/abs/2403.06693

### Tools & Libraries

1. **Chart2Music** - https://chart2music.com
2. **Highcharts Sonification** - https://api.highcharts.com/highcharts/sonification
3. **Tone.js** - https://tonejs.github.io/
4. **Web Audio API** - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

### Accessibility Resources

1. **WCAG 2.2** - https://www.w3.org/TR/WCAG22/
2. **WAI-ARIA** - https://www.w3.org/WAI/ARIA/apg/
3. **A11y Project** - https://www.a11yproject.com/
4. **Inclusive Design Principles** - https://inclusivedesignprinciples.org/

### Community & Organizations

1. **National Federation of the Blind** - https://nfb.org
2. **American Foundation for the Blind** - https://afb.org
3. **Accessible Oceans Project** - https://accessibleoceans.whoi.edu

### D3.js Resources

1. **D3.js Documentation** - https://d3js.org
2. **D3.js Accessibility** - https://observablehq.com/@d3/d3-accessibility

---

## Appendix A: Frequency Reference

```
Note  Freq(Hz)  MIDI  Suggested Use
────────────────────────────────────
C2    65.41    36    Minimum (rare)
C3    130.81   48    Low values
C4    261.63   60    Middle C (reference)
G4    392.00   67    Baseline/zero
A4    440.00   69    Concert pitch
C5    523.25   72    Medium-high values
C6    1046.50  84    High values
C7    2093.00  96    Maximum
```

### Pentatonic Scale (Recommended Default)

```
C4  = 261.63 Hz
D4  = 293.66 Hz
E4  = 329.63 Hz
G4  = 392.00 Hz
A4  = 440.00 Hz
C5  = 523.25 Hz (octave)
```

---

## Appendix B: Quick Start Code

```javascript
// Minimal implementation
import * as d3 from 'd3';
import { sonify } from 'sound3fy';

// Register plugin
d3.selection.prototype.sonify = sonify;

// Use it!
d3.select("#chart")
  .selectAll("rect")
  .data([10, 25, 15, 30, 20])
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * 50)
  .attr("y", d => 100 - d)
  .attr("width", 40)
  .attr("height", d => d)
  .sonify();  // That's it!
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: sound3fy research team*

