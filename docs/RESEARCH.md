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
- [x] Remove legacy `html/` folder
- [x] Add .editorconfig
- [x] Add CI workflow (tests on every PR)
- [x] Add Lighthouse CI (accessibility audits)
- [x] CODE_OF_CONDUCT.md
- [x] SECURITY.md
- [x] Issue templates (bug, feature, accessibility)
- [x] PR template with accessibility checklist
- [x] CI badges in README
- [x] Created `main` branch

## ⚠️ Manual Steps Required (GitHub UI)

### 1. Change Default Branch
Go to **Settings → General → Default Branch** and change from `master` to `main`.

### 2. Delete `master` Branch
After changing default, go to **Code → Branches** and delete `master`.

### 3. Set Up Branch Protection
Go to **Settings → Branches → Add rule**:
- Branch name: `main`
- [x] Require a pull request before merging
- [x] Require status checks to pass (select "test" and "lighthouse")
- [x] Require branches to be up to date

### 4. Update GitHub Pages Source
Go to **Settings → Pages** and ensure source is `main` branch.

## 🔮 Future (Post-Announcement)

- [ ] Publish to npm
- [ ] TypeScript type definitions (.d.ts)
- [ ] Observable notebook example
- [ ] More chart types (pie, area, heatmap)
- [ ] Audio export (save as .wav)
- [ ] Internationalization

*See [ADRs](./adr/) for technical design decisions.*
