# sound3fy 🔊

> Make D3.js visualizations accessible through sound

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**sound3fy** is a D3.js plugin that adds auditory representations to data visualizations, making charts accessible to blind and low-vision users through sonification.

## The Problem

Data visualizations are fundamentally inaccessible to the 2.2 billion people worldwide with vision impairment. Screen readers can only read alt-text descriptions—they can't convey trends, patterns, or relationships that visualizations are designed to show.

## The Solution

sound3fy maps data to sound, enabling users to:
- **Hear trends** (rising pitch = rising values)
- **Perceive patterns** through rhythm and melody
- **Navigate data** with keyboard controls
- **Get context** through screen reader announcements

## Quick Start

```javascript
import * as d3 from 'd3';
import 'sound3fy';

// Add sonification with one line
d3.selectAll("rect")
  .data([10, 25, 15, 30, 20])
  .sonify();
```

## Features

- 🎵 **Simple API** - Add `.sonify()` to any D3 selection
- ⌨️ **Keyboard Navigation** - Arrow keys to step through data
- 🔈 **Screen Reader Support** - ARIA live region announcements
- 🎹 **Customizable Mapping** - Control pitch, volume, pan, duration
- 🎼 **Musical Scales** - Pentatonic, major, minor, chromatic
- 📊 **Chart-Aware** - Optimized handling for bars, lines, scatter plots

## Documentation

- [Research Document](./RESEARCH.md) - Deep dive into the project research, architecture, and development plan
- [API Reference](./docs/API.md) - Complete API documentation (coming soon)
- [Examples](./examples/) - Working examples (coming soon)

## Development Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 0 | Project Setup | 🔄 In Progress |
| 1 | Core Audio Engine | ⏳ Planned |
| 2 | D3 Integration | ⏳ Planned |
| 3 | Accessibility Layer | ⏳ Planned |
| 4 | Advanced Mappings | ⏳ Planned |
| 5 | Chart Handlers | ⏳ Planned |
| 6 | User Testing | ⏳ Planned |
| 7 | Documentation & Release | ⏳ Planned |

## Why This Project?

### The Gap

| Tool | D3 Native | Easy API | Open Source |
|------|-----------|----------|-------------|
| Highcharts Sonification | ❌ | ✅ | ❌ |
| Chart2Music | ❌ | ✅ | ✅ |
| MAIDR | ❌ | ⚠️ | ✅ |
| **sound3fy** | ✅ | ✅ | ✅ |

D3.js powers millions of web visualizations, but has no dedicated sonification solution. sound3fy fills this gap.

### Research-Backed

This project is built on extensive research into:
- Human auditory perception and psychoacoustics
- Existing sonification tools and academic research
- WCAG accessibility guidelines
- User-centered design principles

See our [Research Document](./RESEARCH.md) for the complete analysis.

## Contributing

We welcome contributions! Areas where we especially need help:

- 👁️ **User Testing** - Are you blind or low-vision? We'd love your feedback
- 🔊 **Sound Design** - Help us create pleasant, informative audio mappings
- 📝 **Documentation** - Help make the docs more accessible
- 🧪 **Testing** - Help us test across browsers and screen readers

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

This project builds on research and ideas from:
- [MAIDR](https://arxiv.org/abs/2403.00717) - Multimodal accessible data representation
- [Erie](https://arxiv.org/abs/2402.00156) - Declarative grammar for sonification
- [Chart2Music](https://chart2music.com) - JavaScript chart sonification
- [Accessible Oceans](https://accessibleoceans.whoi.edu) - Ocean data sonification

---

*Making data accessible, one sound at a time.* 🎵
