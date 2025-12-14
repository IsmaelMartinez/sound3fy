# sound3fy Research

> Making D3.js visualizations accessible through sound

## Summary

**Problem:** Data visualizations are inaccessible to blind and low-vision users (~340 million globally).

**Solution:** A D3.js plugin that converts visual data into sound through sonification.

**Key Insight:** Human auditory perception can effectively convey data patterns:
- **Pitch** → Value magnitude (higher pitch = higher value)
- **Pan** → Position (left speaker = start, right = end)
- **Volume** → Emphasis
- **Duration** → Timing/rhythm

## Gap Analysis

| Solution | D3.js Native | Keyboard Nav | Screen Reader | Open Source |
|----------|--------------|--------------|---------------|-------------|
| Chart2Music | ❌ | ✅ | ✅ | ✅ |
| Highcharts | ❌ | ✅ | ✅ | ❌ (Commercial) |
| Google Charts | ❌ | ❌ | ❌ | ❌ |
| **sound3fy** | ✅ | ✅ | ✅ | ✅ |

**Finding:** No D3.js-specific sonification library exists. This is the gap sound3fy fills.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  D3.js Selection                │
│              selection.sonify(options)          │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              SonificationEngine                 │
│  - Playback control (play/pause/stop)           │
│  - Navigation (next/previous/seek)              │
│  - Accessibility (keyboard, announcements)      │
└───────────────────────┬─────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌─────────────────┐          ┌─────────────────┐
│   DataMapper    │          │   AudioEngine   │
│  - Analyze data │          │  - Web Audio API│
│  - Map to audio │          │  - Play tones   │
│  - Descriptions │          │  - ADSR envelope│
└─────────────────┘          └─────────────────┘
```

## API Design

### Minimal Usage
```javascript
d3.selectAll(".bar").sonify({ pitch: "value" });
```

### Full Options
```javascript
selection.sonify({
  // Data mapping
  pitch: { field: "value", range: [220, 880], scale: "pentatonic" },
  volume: { field: "importance", range: [0.3, 0.8] },
  pan: { range: [-0.7, 0.7] },
  
  // Playback
  duration: 200,      // ms per data point
  gap: 50,            // ms between points
  mode: "discrete",   // or "continuous"
  
  // Chart type (for 2D mapping)
  chartType: "scatter",
  x: "xField",        // X data → stereo pan
  
  // Accessibility
  accessibility: { keyboard: true, announce: true, focus: true }
});
```

### Playback Control
```javascript
const sonify = selection.sonify(options);

sonify.play();       // Start playback
sonify.pause();      // Pause
sonify.stop();       // Stop and reset
sonify.toggle();     // Play/pause toggle

sonify.next();       // Next data point
sonify.previous();   // Previous data point
sonify.first();      // Jump to first
sonify.last();       // Jump to last

sonify.setSpeed(1.5);        // Playback speed
sonify.setMode("continuous"); // Change mode
sonify.destroy();            // Clean up
```

## Accessibility Standards

### WCAG 2.1 Compliance
- **1.1.1 Non-text Content** - ARIA labels on all data points
- **1.3.1 Info and Relationships** - Semantic roles (`graphics-symbol`)
- **2.1.1 Keyboard** - Full keyboard navigation
- **4.1.2 Name, Role, Value** - Screen reader announcements

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `←` `→` | Previous/Next |
| `Home` `End` | First/Last |
| `+` `-` | Faster/Slower |
| `M` | Toggle mode |
| `Esc` | Stop |

### Screen Reader Support
- Live region announcements for values
- Chart summary on play start
- Data point descriptions with context

## Musical Scales

Using musical scales makes sonification more pleasant and patterns more recognizable:

| Scale | Notes | Best For |
|-------|-------|----------|
| Pentatonic | 5 per octave | General use (no dissonance) |
| Major | 7 per octave | Positive/happy data |
| Minor | 7 per octave | Serious/concerning data |
| Blues | 6 per octave | Emphasis on mid-range |
| Chromatic | 12 per octave | Maximum precision |
| Continuous | Infinite | Smooth trends |

## References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chart2Music](https://chart2music.com/) - Prior art
- [MAIDR](https://github.com/xability/maidr) - Accessibility research
- [D3.js](https://d3js.org/) - Target platform

