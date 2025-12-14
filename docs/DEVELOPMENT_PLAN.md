# Development Plan

> Status: Active Development | Updated: December 2024

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 0. Foundation | ✅ | npm, Vite, Vitest, CI/CD |
| 1. Core Audio | ✅ | AudioEngine, ADSR, scales |
| 2. D3 Integration | ✅ | `.sonify()` plugin |
| 3. Accessibility | ✅ | Keyboard, screen reader, ARIA |
| 4. Mappings | ✅ | Pitch, pan, volume, duration |
| 5. Chart Types | ✅ | Bar, line, scatter |
| 6. User Testing | ⏳ | Planned |
| 7. Polish | 🚧 | 70% complete |

**Overall: ~85%**

---

## Completed Features

### Core (Phases 1-2)
- Web Audio API engine with ADSR envelopes
- Musical scales: pentatonic, major, minor, blues, chromatic, continuous
- D3.js plugin: `selection.sonify(options)`
- Playback control: play, pause, stop, toggle
- Navigation: next, previous, first, last
- Speed control: setSpeed(0.25 - 4.0)

### Accessibility (Phase 3)
- Full keyboard navigation (Space, Arrows, Home/End, +/-, M, Esc)
- Screen reader announcements (`aria-live`)
- ARIA attributes on data points
- Visual focus indicators
- High contrast and reduced motion support

### Chart Types (Phase 5)
- **Bar charts**: Discrete mode, individual tones
- **Line charts**: Continuous mode, frequency sweep
- **Scatter plots**: 2D mapping (X→pan, Y→pitch)

---

## TODO

### Phase 6: User Testing
- [ ] Recruit BLV testers
- [ ] Conduct testing sessions
- [ ] Document findings

### Phase 7: Polish
- [x] Demo website (GitHub Pages)
- [x] Basic documentation
- [ ] Performance optimization
- [ ] Browser compatibility testing
- [ ] v1.0.0 release

### Future (Post v1.0)
- TypeScript support
- Area chart handler
- Auto chart type detection
- React/Vue wrappers

---

## Milestones

| Milestone | Status |
|-----------|--------|
| Working prototype | ✅ |
| GitHub Pages demo | ✅ |
| 71 tests passing | ✅ |
| v0.1.0 | ✅ |
| User testing | ⏳ |
| v1.0.0 | ⏳ Q1 2025 |
