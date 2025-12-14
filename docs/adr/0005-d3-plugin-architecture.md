# ADR 0005: D3.js Plugin Architecture

## Status
Accepted

## Context
We need to decide how users will integrate sound3fy with their D3.js visualizations. Options:

1. **Standalone function** - `sonify(selection, options)`
2. **D3 plugin** - `selection.sonify(options)`
3. **Wrapper component** - Higher-level abstraction

## Decision
Implement as a **D3.js selection method** that extends `d3.selection.prototype`.

## Rationale
- **D3-idiomatic** - Follows D3's chainable API pattern
- **Familiar to D3 users** - Works like other D3 methods
- **Minimal friction** - One line to add sonification
- **Works with existing code** - No restructuring needed

## Consequences
### Positive
- Natural integration with D3 workflows
- Chainable with other D3 methods
- Automatic data extraction from selection

### Negative
- Modifies D3's prototype (could conflict with other plugins)
- Requires D3 to be loaded first

## Implementation
```javascript
// Auto-registers when loaded
if (window.d3?.selection?.prototype) {
  window.d3.selection.prototype.sonify = sonify;
}

// Usage
d3.selectAll(".bar")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", ...)
  .attr("y", ...)
  .sonify({ pitch: "value" }); // ← Just add this!
```

## API Design Principles
1. **Simple defaults** - Works with zero configuration
2. **Progressive disclosure** - Simple → advanced options
3. **Shorthand support** - `pitch: "value"` instead of `pitch: { field: "value" }`
4. **Chainable returns** - Returns engine for further control

