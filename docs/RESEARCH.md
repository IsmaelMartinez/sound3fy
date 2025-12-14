# sound3fy Technical Design

## Architecture

```
D3.js Selection
      │
      ▼
┌─────────────────────────────────────┐
│        SonificationEngine           │
│  - Playback (play/pause/stop)       │
│  - Navigation (next/prev/seek)      │
│  - Accessibility (keyboard, ARIA)   │
└─────────────────┬───────────────────┘
                  │
       ┌──────────┴──────────┐
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│ DataMapper  │       │ AudioEngine │
│ - Analyze   │       │ - Web Audio │
│ - Map data  │       │ - ADSR      │
│ - Describe  │       │ - Scales    │
└─────────────┘       └─────────────┘
```

## API

```javascript
// Minimal
d3.selectAll(".bar").sonify({ pitch: "value" });

// Full options
selection.sonify({
  pitch: { field: "value", range: [220, 880], scale: "pentatonic" },
  volume: { field: "importance", range: [0.3, 0.8] },
  pan: { range: [-0.7, 0.7] },
  duration: 200,
  gap: 50,
  mode: "discrete",  // or "continuous"
  chartType: "scatter",  // enables X→pan mapping
  x: "xField"
});

// Control
sonify.play();
sonify.pause();
sonify.stop();
sonify.next();
sonify.previous();
sonify.setSpeed(1.5);
sonify.destroy();
```

## Data Mapping

| Data | Audio | Effect |
|------|-------|--------|
| Value | Pitch | Higher value = higher frequency |
| Position | Pan | Left to right = left to right speaker |
| Index | Time | Sequential playback |
| Category | Timbre | Different wave shapes |

## Scales

| Scale | Intervals | Use |
|-------|-----------|-----|
| Pentatonic | 0,2,4,7,9 | Default, pleasant |
| Major | 0,2,4,5,7,9,11 | Bright |
| Minor | 0,2,3,5,7,8,10 | Serious |
| Blues | 0,3,5,6,7,10 | Emphasis |
| Chromatic | 0-11 | Precision |
| Continuous | Linear | Smooth |

## Accessibility

- **WCAG 2.1**: 1.1.1, 1.3.1, 2.1.1, 4.1.2
- **ARIA**: `role="graphics-symbol"`, `aria-label`, `aria-live`
- **Keyboard**: Space, Arrows, Home/End, +/-, M, Esc
- **Preferences**: `prefers-contrast`, `prefers-reduced-motion`

## References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Why sound3fy?](https://ismaelmartinez.github.io/sound3fy/about.html)
