# ADR 0001: Use Web Audio API for Sound Generation

## Status
Accepted

## Context
We need to generate audio in the browser to sonify data visualizations. Options considered:
1. **Web Audio API** - Native browser API for audio synthesis
2. **Tone.js** - Higher-level audio library built on Web Audio API
3. **Howler.js** - Audio playback library (pre-recorded sounds)

## Decision
Use the **Web Audio API** directly without additional dependencies.

## Rationale
- **Zero dependencies** - No additional bundle size (~100KB saved vs Tone.js)
- **Full control** - Direct access to oscillators, gain, panning for precise sonification
- **Browser support** - Supported in all modern browsers (Chrome 66+, Firefox 76+, Safari 14+)
- **Performance** - Native implementation is highly optimized
- **Simplicity** - Our use case (simple tones with ADSR envelopes) doesn't require Tone.js complexity

## Consequences
### Positive
- Smaller bundle size
- No dependency management
- Direct control over audio parameters

### Negative
- More low-level code for audio scheduling
- Need to handle browser autoplay policies manually
- More complex code for advanced features (if needed later)

## Notes
If we need more advanced features (instruments, effects, complex scheduling), we can add Tone.js as an optional dependency in v2.

