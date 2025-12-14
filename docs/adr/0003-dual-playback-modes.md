# ADR 0003: Support Discrete and Continuous Playback Modes

## Status
Accepted

## Context
Different chart types benefit from different sonification approaches:
- **Bar charts**: Individual data points should be heard as separate notes
- **Line charts**: Trends are better conveyed as continuous frequency sweeps

## Decision
Implement two playback modes:

1. **Discrete mode** (default)
   - Each data point plays as a separate tone
   - Gap between tones for clear separation
   - Best for: bar charts, categorical data, scatter plots

2. **Continuous mode**
   - Single oscillator sweeps through all frequencies
   - Smooth transitions between values
   - Best for: line charts, time series, trends

## Rationale
- **Different data = different representation** - No one-size-fits-all approach
- **Line charts need continuity** - Discrete notes lose the "trend" feeling
- **Bar charts need separation** - Continuous sweep loses individual value clarity
- **User choice** - Let developers pick what fits their data

## Consequences
### Positive
- Optimal sonification for each chart type
- Users can experiment to find best representation
- More expressive data communication

### Negative
- More complex implementation
- Users need to understand when to use each mode

## Implementation
```javascript
// Discrete (default) - good for bar charts
sonify({ mode: 'discrete', duration: 200, gap: 50 })

// Continuous - good for line charts  
sonify({ mode: 'continuous', duration: 200 })
```

## Keyboard Shortcut
Press `M` to toggle between modes during playback.

