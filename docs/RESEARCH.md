# Professional Roadmap

Plan to make sound3fy production-ready before public announcement.

## ✅ Completed

- [x] Core functionality (bar, line, scatter charts)
- [x] Keyboard navigation & screen reader support
- [x] 70 unit tests passing
- [x] ADRs documenting key decisions
- [x] MIT License
- [x] CONTRIBUTING.md
- [x] Live demo on GitHub Pages
- [x] Renovate for dependency updates

## 🔧 In Progress

### Repository Hygiene

- [ ] **Rename master → main** - Modern default branch naming
- [ ] **Remove legacy `html/` folder** - Old hackathon prototype
- [ ] **Add .editorconfig** - Consistent formatting across editors

### CI/CD

- [ ] **Add test workflow** - Run tests on every PR
- [ ] **Add Lighthouse CI** - Automated accessibility audits
- [ ] **Branch protection** - Require tests to pass before merge

### Documentation

- [ ] **CODE_OF_CONDUCT.md** - Community standards
- [ ] **SECURITY.md** - Vulnerability reporting
- [ ] **Issue templates** - Bug reports, feature requests
- [ ] **PR template** - Checklist for contributors

### README Polish

- [ ] **Add CI badge** - Show test status
- [ ] **Remove RESEARCH.md link** - Point only to ADRs
- [ ] **Add npm badge** - When published

## 🔮 Future (Post-Announcement)

- [ ] Publish to npm
- [ ] TypeScript type definitions (.d.ts)
- [ ] Observable notebook example
- [ ] More chart types (pie, area, heatmap)
- [ ] Audio export (save as .wav)
- [ ] Internationalization

---

## Implementation Order

1. Clean up repo (remove legacy, add configs)
2. Add CI workflows
3. Add community files
4. Update README
5. Rename master → main (last, to not break anything)

*See [ADRs](./adr/) for technical design decisions.*
