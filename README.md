# sound3fy 🔊

> Make D3.js visualizations accessible through sound

[![CI](https://github.com/IsmaelMartinez/sound3fy/actions/workflows/ci.yml/badge.svg)](https://github.com/IsmaelMartinez/sound3fy/actions/workflows/ci.yml)
[![Lighthouse](https://github.com/IsmaelMartinez/sound3fy/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/IsmaelMartinez/sound3fy/actions/workflows/lighthouse.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**[▶ Live Demo](https://ismaelmartinez.github.io/sound3fy/)** · **[Why?](https://ismaelmartinez.github.io/sound3fy/about.html)**

**sound3fy** adds sonification to D3.js visualizations, making charts accessible to blind and low-vision users. Data values become musical notes—higher values play higher pitches.

## Features

- 🎵 **Musical Scales** - Pentatonic, major, minor, blues, chromatic
- 📈 **Chart Support** - Bar, line (continuous sweep), scatter (2D mapping)
- ⌨️ **Keyboard Navigation** - Full control without mouse
- 🔈 **Screen Reader** - ARIA live regions announce values
- 🎯 **Hover to Hear** - Mouse over any data point

## Quick Start

```javascript
// One line to add sonification
d3.selectAll(".bar").sonify({ pitch: "value" });
```

## Installation

```bash
npm install sound3fy
```

## Usage

```javascript
const sonify = d3.selectAll(".bar")
  .data(data)
  .sonify({
    pitch: {
      field: "value",
      range: [220, 880],
      scale: "pentatonic"
    },
    duration: 200,
    gap: 50
  });

// Control playback
sonify.play();
sonify.pause();
sonify.stop();
sonify.next();
sonify.previous();
sonify.setSpeed(1.5);
```

### Line Charts (Continuous Mode)

```javascript
d3.selectAll(".dot").sonify({
  pitch: "value",
  mode: "continuous"  // Smooth frequency sweep
});
```

### Scatter Plots (2D Mapping)

```javascript
d3.selectAll(".dot").sonify({
  chartType: "scatter",
  x: "area",              // X → stereo pan
  pitch: { field: "pop" } // Y → pitch
});
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` `→` | Navigate |
| `Home` `End` | First/Last |
| `+` `-` | Speed |
| `M` | Toggle mode |
| `Esc` | Stop |

## Options

```javascript
{
  pitch: { field: "value", range: [220, 880], scale: "pentatonic" },
  volume: { field: null, range: [0.4, 0.7] },
  pan: { range: [-0.7, 0.7] },
  duration: 200,
  gap: 50,
  mode: "discrete",  // or "continuous"
  autoPlay: false,   // Auto-start playback after binding
  markers: {
    start: false,    // Play audio cue at playback start
    end: false       // Play audio cue at playback end
  },
  accessibility: {
    keyboard: true,        // Enable keyboard navigation
    announce: true,        // Announce data points to screen readers
    announceSummary: true, // Announce chart summary at playback start
    focus: true,           // Visual focus indicators
    hover: true            // Play sound on hover/focus
  }
}
```

### Scales

| Scale | Notes |
|-------|-------|
| `pentatonic` | Pleasant, no dissonance (default) |
| `major` | Bright |
| `minor` | Serious |
| `blues` | Bluesy |
| `chromatic` | All 12 notes |
| `continuous` | Direct frequency |

## API Methods

### Playback Control

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `stop()` | Stop and reset |
| `toggle()` | Toggle play/pause |
| `next()` | Navigate to next point |
| `previous()` | Navigate to previous point |
| `first()` | Jump to first point |
| `last()` | Jump to last point |
| `setSpeed(n)` | Set playback speed (0.25-4) |
| `setMode(m)` | Set mode ("discrete" or "continuous") |
| `destroy()` | Clean up and remove listeners |

### State Getters

| Method | Description |
|--------|-------------|
| `isPlaying()` | Returns `true` if currently playing |
| `isPaused()` | Returns `true` if paused |
| `currentIndex()` | Returns current data point index |
| `length()` | Returns total number of data points |
| `getMode()` | Returns current mode ("discrete" or "continuous") |

## Accessibility

Built for WCAG 2.2 compliance:

- **ARIA**: `role="graphics-symbol"`, `aria-label`, `aria-live="polite"`
- **Chart Summary**: Announces chart type, data point count, and value range at playback start
- **Keyboard**: Full navigation
- **Focus**: Visual indicators with high contrast support
- **Reduced Motion**: Respects user preferences

## Development

```bash
git clone https://github.com/IsmaelMartinez/sound3fy.git
cd sound3fy
npm install
npm run dev
npm test  # 70 tests
```

## Documentation

- [Architecture Decisions](./docs/adr/) - Key design decisions

## Help Wanted

**Are you blind or low-vision?** Your feedback is invaluable! Please [share your experience](https://github.com/IsmaelMartinez/sound3fy/issues) — does the sonification work for you?

## License

MIT

---

*Making data accessible, one sound at a time.* 🎵
