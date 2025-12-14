# ADR 0004: Accessibility-First Design

## Status
Accepted

## Context
The primary purpose of sound3fy is to make data visualizations accessible to blind and low-vision users. Accessibility cannot be an afterthought.

## Decision
Build accessibility features as core functionality, enabled by default:

1. **Keyboard Navigation**
   - Full control without mouse
   - Standard shortcuts (Space, Arrows, Home/End, Escape)
   - Speed control (+/-)

2. **Screen Reader Support**
   - ARIA live regions for announcements
   - Data summaries on play start
   - Value announcements during playback

3. **Visual Focus Indicators**
   - Clear focus ring on current element
   - Respects `prefers-contrast` media query

4. **Hover-to-Hear**
   - Sighted users can explore with mouse
   - Same experience as keyboard navigation

## Rationale
- **Our target users need this** - BLV users are the primary audience
- **WCAG compliance** - Meet accessibility guidelines
- **Universal design** - These features help everyone
- **Enabled by default** - Developers shouldn't need to opt-in

## Consequences
### Positive
- Truly accessible out of the box
- No extra configuration needed
- Benefits all users (keyboard shortcuts, etc.)

### Negative
- Slightly larger code footprint
- DOM manipulation required (live regions, styles)

## Implementation
All accessibility features are enabled by default:

```javascript
// Defaults (all true)
accessibility: {
  keyboard: true,   // Keyboard navigation
  announce: true,   // Screen reader announcements
  focus: true,      // Visual focus indicators
  hover: true       // Hover-to-hear
}

// Can be disabled if needed
sonify({ accessibility: { hover: false } })
```

## WCAG Compliance
- 1.1.1 Non-text Content ✓ (announcements)
- 2.1.1 Keyboard ✓ (full keyboard support)
- 2.4.7 Focus Visible ✓ (focus indicators)
- 4.1.2 Name, Role, Value ✓ (ARIA attributes)

