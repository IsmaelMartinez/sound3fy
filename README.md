# sound3fy 🔊

> Make D3.js visualizations accessible through sound

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**sound3fy** adds sonification to D3.js visualizations, making charts accessible to blind and low-vision users. Data values become musical notes—higher values play higher pitches, creating an auditory representation of your data.

## Features

- 🎵 **Musical Scales** - Pentatonic, major, minor, blues, chromatic
- 📈 **Line Chart Support** - Continuous frequency sweep for trends
- ⌨️ **Full Keyboard Navigation** - Arrow keys, Home/End, speed controls
- 🔈 **Screen Reader Support** - ARIA live regions announce values
- 🎯 **Hover to Hear** - Mouse over any data point to hear its value
- 🎛️ **Customizable** - Control pitch range, duration, speed, and more
- 📦 **Zero Dependencies** - Just D3.js and Web Audio API

## Quick Start

```javascript
// Add sonification with one line
d3.selectAll("rect")
  .data(data)
  .sonify({ pitch: "value" });
```

## Installation

```bash
npm install sound3fy
```

Or include via CDN:
```html
<script src="https://unpkg.com/sound3fy"></script>
```

## Usage

### Basic Usage

```javascript
// Sonify a bar chart
const sonification = d3.selectAll(".bar")
  .data(data)
  .sonify({ pitch: "value" });

// Control playback
sonification.play();
sonification.pause();
sonification.stop();
```

### With Options

```javascript
d3.selectAll(".bar")
  .data(data)
  .sonify({
    pitch: {
      field: "value",           // Data field to map
      range: [220, 880],        // Frequency range (Hz)
      scale: "pentatonic"       // Musical scale
    },
    duration: 200,              // Note duration (ms)
    gap: 50,                    // Gap between notes (ms)
    markers: {
      start: true,              // Play sound at start
      end: true                 // Play sound at end
    }
  });
```

### Available Scales

| Scale | Description |
|-------|-------------|
| `pentatonic` | Pleasant, no dissonance (default) |
| `major` | Bright, happy |
| `minor` | Serious, somber |
| `blues` | Bluesy feel |
| `chromatic` | All 12 notes |
| `continuous` | Direct frequency mapping |

### Playback Controls

```javascript
const s = d3.selectAll(".bar").sonify({ pitch: "value" });

s.play();           // Start playback
s.pause();          // Pause
s.stop();           // Stop and reset
s.toggle();         // Toggle play/pause
s.next();           // Next data point
s.previous();       // Previous data point
s.first();          // Jump to first
s.last();           // Jump to last
s.setSpeed(1.5);    // 1.5x speed
s.setMode('continuous'); // Switch to continuous mode
s.destroy();        // Clean up
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` `→` | Navigate between points |
| `Home` | Jump to first |
| `End` | Jump to last |
| `+` `-` | Increase/decrease speed |
| `M` | Toggle continuous/discrete mode |
| `Escape` | Stop |

## Accessibility

sound3fy is built with accessibility as a core feature:

- **Screen Readers**: Uses ARIA live regions to announce data values
- **Keyboard Navigation**: Full keyboard support, no mouse required
- **Focus Indicators**: Visual focus ring shows current data point
- **Trend Announcements**: Describes if values are increasing/decreasing

## API Reference

### Options

```javascript
{
  // Pitch mapping
  pitch: {
    field: "value",         // Data field or accessor function
    range: [220, 880],      // Frequency range [min, max] Hz
    scale: "pentatonic"     // Musical scale
  },
  
  // Volume mapping (optional)
  volume: {
    field: "importance",    // Data field
    range: [0.4, 0.7]       // Volume range [min, max]
  },
  
  // Stereo panning
  pan: {
    range: [-0.7, 0.7]      // Left to right spread
  },
  
  // Timing
  duration: 200,            // Note duration (ms)
  gap: 50,                  // Gap between notes (ms)
  
  // Sound envelope (ADSR)
  envelope: {
    attack: 0.02,
    decay: 0.05,
    sustain: 0.7,
    release: 0.1
  },
  
  // Orientation markers
  markers: {
    start: true,            // Play sound at start
    end: true               // Play sound at end
  },
  
  // Accessibility
  accessibility: {
    keyboard: true,         // Enable keyboard navigation
    announce: true,         // Screen reader announcements
    focus: true,            // Visual focus indicator
    hover: true             // Sonify on hover
  },
  
  autoPlay: false           // Start playing immediately
}
```

### Methods

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `stop()` | Stop and reset |
| `toggle()` | Toggle play/pause |
| `next()` | Go to next point |
| `previous()` | Go to previous point |
| `first()` | Jump to first point |
| `last()` | Jump to last point |
| `seek(index)` | Jump to specific index |
| `setSpeed(multiplier)` | Set playback speed (0.25-4) |
| `destroy()` | Clean up resources |

### State

| Method | Returns |
|--------|---------|
| `isPlaying()` | `boolean` |
| `isPaused()` | `boolean` |
| `currentIndex()` | `number` |
| `length()` | `number` |

## Examples

### Line Chart (Continuous Mode)

```javascript
// Continuous sweep - hear the entire trend
d3.selectAll(".dot")
  .data(data)
  .sonify({
    pitch: "value",
    mode: "continuous",  // Smooth frequency sweep
    duration: 150
  });

// Discrete mode - step through points
d3.selectAll(".dot")
  .data(data)
  .sonify({
    pitch: "value",
    mode: "discrete",
    duration: 200,
    gap: 30
  });
```

### Multi-Series

```javascript
d3.selectAll(".bar")
  .data(data)
  .sonify({
    pitch: "value",
    timbre: {
      field: "category",
      mapping: {
        "sales": "sine",
        "expenses": "triangle"
      }
    }
  });
```

## Browser Support

- Chrome 66+
- Firefox 76+
- Safari 14+
- Edge 79+

Requires Web Audio API support.

## Development

```bash
# Clone
git clone https://github.com/IsmaelMartinez/sound3fy.git
cd sound3fy

# Install dependencies
npm install

# Start dev server
npm run dev

# Build
npm run build
```

## Research & Background

This project is based on research into data sonification and accessibility. See [RESEARCH.md](./RESEARCH.md) for:

- Market analysis of existing solutions
- Technical research on human hearing perception
- Accessibility standards compliance (WCAG)
- Development roadmap

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Especially needed:**
- 👁️ User testing from blind/low-vision users
- 🔊 Sound design improvements
- 📝 Documentation

## License

MIT License - see [LICENSE](./LICENSE)

## Acknowledgments

Built on research from:
- [MAIDR](https://arxiv.org/abs/2403.00717) - Multimodal accessible data
- [Erie](https://arxiv.org/abs/2402.00156) - Declarative sonification grammar
- [Chart2Music](https://chart2music.com) - Chart sonification library

---

*Making data accessible, one sound at a time.* 🎵
