# ADR 0006: Use Stereo Panning for Positional Information

## Status
Accepted

## Context
Data visualizations have spatial information (left-to-right progression). We need to convey this in audio.

## Decision
Map data point position to stereo panning:
- First data point → Left speaker (-0.7)
- Last data point → Right speaker (+0.7)
- Middle points → Proportionally between

## Rationale
- **Spatial awareness** - Users can "locate" where they are in the data
- **Intuitive mapping** - Left-to-right matches most chart conventions
- **Additional dimension** - Conveys info without using pitch/volume
- **Research-backed** - Studies show spatial audio aids comprehension

## Consequences
### Positive
- Users know their position in the data
- Works well with headphones
- Adds another information channel

### Negative
- Requires stereo output (mono speakers lose this info)
- May be disorienting for some users

## Implementation
```javascript
// Default range (not extreme, comfortable)
pan: { range: [-0.7, 0.7] }

// Pan calculation
const pan = range[0] + (index / (total - 1)) * (range[1] - range[0]);
```

## Notes
- Range limited to ±0.7 (full ±1.0 can be jarring)
- Single data points centered at 0
- Can be customized or disabled via options

