# sound3fy 🔊

> Make D3.js visualizations accessible through sound

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

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
  markers: { start: true, end: true },
  accessibility: { keyboard: true, announce: true, focus: true, hover: true }
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

## Accessibility

Built for WCAG 2.2 compliance:

- **ARIA**: `role="graphics-symbol"`, `aria-label`, `aria-live="polite"`
- **Keyboard**: Full navigation
- **Focus**: Visual indicators with high contrast support
- **Reduced Motion**: Respects user preferences

## Development

```bash
git clone https://github.com/IsmaelMartinez/sound3fy.git
cd sound3fy
npm install
npm run dev
npm test
```

## Documentation

- [Research](./docs/RESEARCH.md) - Architecture and design
- [ADRs](./docs/adr/) - Key decisions

## License

MIT

---

*Making data accessible, one sound at a time.* 🎵
