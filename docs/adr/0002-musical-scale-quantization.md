# ADR 0002: Use Musical Scale Quantization for Pitch Mapping

## Status
Accepted

## Context
When mapping data values to frequencies, we need to decide how to convert normalized values (0-1) to audible pitches. Options:

1. **Linear/continuous mapping** - Direct interpolation between min/max frequency
2. **Musical scale quantization** - Snap to notes in a musical scale
3. **Logarithmic mapping** - Match human pitch perception (octaves)

## Decision
Default to **pentatonic scale quantization** with support for multiple scales and continuous mode.

Supported scales:
- `pentatonic` (default) - C-D-E-G-A, pleasant, no dissonance
- `major` - Bright, happy feeling
- `minor` - Serious, somber feeling
- `blues` - Distinctive bluesy character
- `chromatic` - All 12 semitones, maximum resolution
- `continuous` - Direct linear mapping, no quantization

## Rationale
- **Pentatonic sounds pleasant** - No dissonant intervals, widely used in world music
- **Musical context aids interpretation** - Familiar intervals help users understand relative values
- **Flexibility** - Users can choose based on their data and audience
- **Research-backed** - Studies show scale-quantized sonification improves comprehension

## Consequences
### Positive
- More pleasant listening experience
- Easier to distinguish relative values
- Culturally familiar sound patterns

### Negative
- Some precision lost due to quantization
- May not suit all data types (continuous mode available as fallback)

## Implementation
```javascript
// Usage
sonify({ pitch: { field: 'value', scale: 'pentatonic' } })
sonify({ pitch: { field: 'value', scale: 'continuous' } })
```

