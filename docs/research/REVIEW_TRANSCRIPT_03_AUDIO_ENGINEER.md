# Review Transcript: Jordan Okonkwo - Audio Engineer

**Date:** December 19, 2024  
**Reviewer:** Jordan Okonkwo (simulated audio engineer)  
**Attendees:** Ismael Martinez (Owner), UltraThinker (AI Co-Creator)

---

## Session Opening

**Jordan Okonkwo:** I've been working with audio accessibility tools for two decades, and I'm genuinely excited about sound3fy. Sonification is underutilized in data visualization. Let me walk through my technical analysis of the audio implementation.

---

## Review Findings

### Strengths

#### 1. Correct Web Audio API Architecture

```javascript
// src/core/AudioEngine.js:23-29
init() {
  if (this.context) return this;
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  this.masterGain = this.context.createGain();
  this.masterGain.gain.value = 0.6;
  this.masterGain.connect(this.context.destination);
  return this;
}
```

**Jordan:** This is the correct pattern:
- Lazy initialization (context created on first use)
- webkit prefix fallback for older Safari
- Master gain node for global volume control (0.6 is a good default - not too loud)
- Single context reused across all operations

#### 2. Well-Designed ADSR Envelope

```javascript
// src/core/AudioEngine.js:51,67-75
const { attack = 0.02, decay = 0.05, sustain = 0.7, release = 0.1 } = envelope;

// ADSR implementation
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(volume, now + attack);
gain.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay);
gain.gain.setValueAtTime(sustainLevel, now + attack + decay + sustainTime);
gain.gain.linearRampToValueAtTime(0, now + duration);
```

**Jordan:** The ADSR values are well-chosen for data sonification:
- **Attack (20ms):** Fast enough to be percussive, slow enough to avoid clicks
- **Decay (50ms):** Quick transition to sustain
- **Sustain (0.7):** 70% of peak volume - maintains presence
- **Release (100ms):** Smooth fade prevents abrupt cutoff

These parameters produce a clean, distinguishable tone perfect for data communication.

#### 3. Musical Scale Quantization

```javascript
// src/core/AudioEngine.js:6-12
const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  blues: [0, 3, 5, 6, 7, 10]
};
```

**Jordan:** Brilliant choice to include musical scales. The pentatonic default is perfect because:
- No semitone intervals = no dissonance
- Universally pleasant across cultures
- Easy to perceive pitch relationships

The scale quantization algorithm is mathematically sound:

```javascript
// Build valid notes in frequency range, then map normalized value to note index
const noteIndex = Math.round(v * (notes.length - 1));
return midiToFreq(notes[noteIndex]);
```

#### 4. Stereo Panning Implementation

```javascript
// src/core/AudioEngine.js:55,61
const panner = ctx.createStereoPanner();
panner.pan.value = Math.max(-1, Math.min(1, pan));
```

**Jordan:** Using `StereoPanner` is correct (simpler than `PannerNode` for 2D positioning). The clamping to [-1, 1] prevents invalid values.

#### 5. Continuous Mode Sweep

```javascript
// src/core/SonificationEngine.js:160-168
this.sweepOsc.frequency.setValueAtTime(frequencies[0], now);
for (let i = 1; i < frequencies.length; i++) {
  const t = now + i * timePerPoint;
  this.sweepOsc.frequency.linearRampToValueAtTime(frequencies[i], t);
}
```

**Jordan:** The linear ramp between frequencies creates a smooth "auditory graph" that traces the data shape. This is exactly how sonification research recommends presenting trends.

---

### Issues Identified

#### Issue 1: No Click Prevention on Oscillator Start (Severity: Medium)

**Jordan:** When you start the oscillator in discrete mode:

```javascript
// src/core/AudioEngine.js:77
osc.start(now);
```

The gain envelope starts at 0, which is good. But in continuous mode:

```javascript
// src/core/SonificationEngine.js:161-162
this.sweepOsc.frequency.setValueAtTime(frequencies[0], now);
this.sweepGain.gain.setValueAtTime(0, now);
this.sweepGain.gain.linearRampToValueAtTime(0.5, now + 0.05);
```

The 50ms ramp-in is good, but if the oscillator starts BEFORE the gain ramp is scheduled, you might get a brief click. Consider using `osc.start(now + small_offset)`.

---

#### Issue 2: Frequency Range May Be Too Narrow (Severity: Low)

**Jordan:** The default range is 220Hz (A3) to 880Hz (A5) - just two octaves.

```javascript
// src/index.js:10
pitch: { field: null, range: [220, 880], scale: 'pentatonic' },
```

For data with high variance, this compresses the auditory representation. With pentatonic scale, you only get ~10-12 distinct notes in this range.

**Recommendation:** Consider widening default to [110, 1760] (A2 to A6) - four octaves gives ~24 pentatonic notes.

**Question for Ismael:** What's the reasoning behind the 220-880 range?

---

#### Issue 3: No Volume Normalization (Severity: Low)

**Jordan:** Human perception of loudness is non-linear. Higher frequencies sound louder at the same amplitude. Currently, all notes play at the same gain level.

**Recommendation:** Consider applying equal-loudness contour compensation (simplified: reduce volume slightly for frequencies above 1kHz, boost slightly below 200Hz).

This is an enhancement, not critical for v1.

---

#### Issue 4: Missing Audio Cues for Data Boundaries (Severity: Medium)

**Jordan:** When data hits min/max values, there's no distinct audio indication. Users might not realize they've heard the extreme.

You have marker sounds:

```javascript
// src/core/AudioEngine.js:115-119
playMarker(type) {
  const markers = {
    start: { frequency: 880, duration: 0.08, volume: 0.35 },
    end: { frequency: 220, duration: 0.12, volume: 0.35 }
  };
}
```

But these are only for playback start/end, not data extremes.

**Recommendation:** Add optional earcons for:
- Data minimum reached
- Data maximum reached
- Significant change (>50% delta between consecutive points)

---

#### Issue 5: Instrument Selection Limited (Severity: Low)

**Jordan:** You support oscillator types:

```javascript
// src/core/AudioEngine.js:58-59
const validTypes = ['sine', 'triangle', 'square', 'sawtooth'];
osc.type = validTypes.includes(instrument) ? instrument : 'sine';
```

These are basic waveforms. For longer listening sessions, richer timbres reduce fatigue.

**Future enhancement:** Consider adding:
- Simple FM synthesis for bell-like tones
- Filtered noise for "shh" sounds (useful for uncertainty/error bars)
- Custom periodic waves for brand-specific sounds

---

#### Issue 6: No Spatialization for Scatter Plots (Severity: Medium)

**Jordan:** For scatter plots, X maps to pan (left/right). But real spatial audio could do more:

```javascript
// Current: 2D panning
panner.pan.value = pan; // Left/right only
```

With Web Audio's `PannerNode`, you could simulate:
- Distance (volume attenuation)
- Elevation (subtle frequency filtering)

This would give scatter plots a more immersive "audio space" representation.

**Question for Ismael:** Is enhanced spatial audio in scope, or is simple stereo panning sufficient?

---

#### Issue 7: Timing Precision in Discrete Mode (Severity: Low)

**Jordan:** You use `setTimeout` for note scheduling:

```javascript
// src/core/SonificationEngine.js:121
this.timer = setTimeout(() => this.playDiscrete(), delay);
```

JavaScript timers aren't sample-accurate. For most data viz, this is fine, but with fast playback (4x speed, 50ms gaps), you might get drift.

**Alternative:** Use Web Audio API's scheduling:

```javascript
// Schedule notes ahead of time using audioContext.currentTime
```

This is an optimization for later versions.

---

## Psychoacoustic Considerations

| Factor | Current Implementation | Assessment |
|--------|----------------------|------------|
| Pitch discrimination | Pentatonic scale | ✅ Excellent |
| Temporal resolution | 200ms default | ✅ Good for up to ~5 notes/sec |
| Spatial awareness | Stereo pan | ⚠️ Adequate, could enhance |
| Loudness perception | Uniform volume | ⚠️ Could improve |
| Timbral variety | 4 oscillator types | ✅ Sufficient for v1 |
| Listener fatigue | ADSR envelope | ✅ Smooth, non-fatiguing |

---

## Summary Table

| Finding | Severity | Type | Recommendation |
|---------|----------|------|----------------|
| Web Audio architecture | N/A | Strength | Keep as-is |
| ADSR envelope | N/A | Strength | Keep as-is |
| Musical scales | N/A | Strength | Keep as-is |
| Stereo panning | N/A | Strength | Keep as-is |
| Continuous sweep | N/A | Strength | Keep as-is |
| Potential click on start | Medium | Issue | Add small start offset |
| Narrow frequency range | Low | Issue | Consider widening default |
| No loudness normalization | Low | Enhancement | Future version |
| No min/max earcons | Medium | Issue | Add data boundary sounds |
| Limited instruments | Low | Enhancement | Future version |
| 2D-only spatialization | Medium | Enhancement | Consider PannerNode |
| setTimeout drift | Low | Issue | Use Web Audio scheduling |

---

## Questions for Discussion

**Jordan:** Ismael, I'd like to understand:

1. **Frequency range:** Why 220-880Hz? Is this based on research or practical testing?

2. **Target listening duration:** How long do you expect users to listen? 10 seconds? 2 minutes? This affects fatigue considerations.

3. **Headphones vs speakers:** Do you recommend headphones for the stereo panning to be effective?

---

*Awaiting responses from Ismael...*

---

## Discussion Notes

*(To be filled in during conversation)*


