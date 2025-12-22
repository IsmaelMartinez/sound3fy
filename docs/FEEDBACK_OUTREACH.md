# Feedback Outreach Plan

## The Story

This project started as an idea at a Web Audio API hackathon about 10 years ago. The concept was simple: what if we could make data visualizations accessible to blind users by turning them into sound?

Life got in the way, and the idea sat in my head (and a dusty repo) for a decade.

Recently, while cleaning up old repositories, I stumbled across my notes and decided it was finally time. With the help of AI pair programming, I was able to develop this initial prototype in a fraction of the time it would have taken me alone.

Now I need the most important thing: **feedback from real users**.

---

## Where to Share

### 🔴 High Priority: Blind/Low-Vision Communities

These are the people who would actually use this tool. Their feedback is invaluable.

#### 1. Reddit: r/Blind (~50k members)

**Link:** https://www.reddit.com/r/Blind/

```
📣 Looking for feedback: Data sonification for charts (early prototype)

Hi everyone,

I'm building an open-source tool called sound3fy that adds sound to data visualizations (bar charts, line charts, scatter plots). The idea is to make charts accessible by:

- Mapping data values to pitch (higher value = higher note)
- Using stereo panning for position (left-to-right movement)
- Supporting keyboard navigation with screen reader announcements

**Live demo:** https://ismaelmartinez.github.io/sound3fy/

A bit of background: This idea came to me at a Web Audio hackathon about 10 years ago, but I never had time to build it properly. Recently I dusted off the concept and finally built a working prototype.

Now I need the most important part: feedback from people who would actually use this.

- Does the sonification help you understand the data?
- Is the keyboard navigation intuitive?
- What's confusing or annoying?
- What would make this more useful?

Works with VoiceOver, NVDA, and JAWS. No visual interaction required - just Tab to the Play button and use arrow keys.

Thanks for any thoughts! 🙏
```

---

#### 2. AppleVis (Apple accessibility community)

**Link:** https://www.applevis.com/

```
Subject: Feedback request: sound3fy - making D3 charts audible

Hello AppleVis community,

I'm developing an open-source JavaScript library that adds sonification to web charts - basically turning data into sound so you can "hear" a bar chart or line graph.

**Demo:** https://ismaelmartinez.github.io/sound3fy/

How it works:
- Higher data values = higher pitched notes
- Left-to-right position = stereo panning
- Keyboard navigation (arrow keys to explore points)
- VoiceOver announces each data point

This idea has been bouncing around my head since a Web Audio hackathon 10 years ago. I finally built a prototype and now need feedback from actual users.

I'm specifically looking for feedback on how well this works with VoiceOver on Mac:
- Does the audio help you understand trends in the data?
- Is anything confusing or annoying?
- What would make this more useful?

Any feedback would be incredibly helpful!
```

---

#### 3. WebAIM Discussion List

**Link:** https://webaim.org/discussion/

```
Subject: [Feedback Request] Data sonification library for accessible charts

Hello,

I'm working on an open-source library called sound3fy that adds sonification to D3.js data visualizations, making charts accessible to blind and low-vision users.

**Demo:** https://ismaelmartinez.github.io/sound3fy/
**GitHub:** https://github.com/IsmaelMartinez/sound3fy

Key features:
- Pitch mapping (value → frequency)
- Stereo panning (x-position → left/right)
- Keyboard navigation with arrow keys
- Screen reader announcements
- Musical scales (pentatonic, major, etc.) for pleasanter audio

Background: This concept originated at a Web Audio hackathon about 10 years ago, but I never had time to properly develop it. I recently revived the project and built this prototype.

I'm seeking feedback on:
1. Does this approach effectively convey data patterns?
2. Are there WCAG considerations I'm missing?
3. What existing research or guidelines should I reference?
4. Would this be useful in your work?

This is an early prototype. Any feedback from accessibility practitioners or end users would be greatly appreciated.

Best regards,
Ismael
```

---

#### 4. National Federation of the Blind (NFB)

**Link:** https://nfb.org/

Consider reaching out to their technology committee or posting in their community forums.

---

### 🟡 Medium Priority: Technical Communities

#### 5. Hacker News (Show HN)

**Link:** https://news.ycombinator.com/submit

```
Show HN: sound3fy – Add sonification to D3.js charts for accessibility

I built an open-source library that adds sound to data visualizations. One line of code: selection.sonify()

**Demo:** https://ismaelmartinez.github.io/sound3fy/

This idea came from a Web Audio API hackathon about 10 years ago. Life happened, and it sat in my notes until recently. I finally built a working prototype with the help of AI pair programming.

Why? ~2.2 billion people have vision impairments. Charts are everywhere but almost never accessible. Alt text like "bar chart showing sales" doesn't let you explore the actual data.

How it works:
- Data values → pitch (higher value = higher note)
- X-position → stereo pan (left to right)
- Notes quantized to musical scales (pentatonic, major, blues)
- Full keyboard navigation + ARIA screen reader support

Now available on npm: `npm install sound3fy`

Looking for feedback from:
- Blind/low-vision users (does this actually help?)
- D3.js developers (API design feedback)
- Accessibility experts (what am I missing?)

MIT licensed. Install via `npm install sound3fy`
```

---

#### 6. Reddit: r/dataisbeautiful (~22M members)

**Link:** https://www.reddit.com/r/dataisbeautiful/

```
[OC Tool] I built a library to make D3 charts accessible through sound

As a data viz enthusiast, I realized charts are completely inaccessible to blind users. Alt text doesn't let you explore the data.

This idea came from a Web Audio hackathon 10 years ago. I finally built it.

**sound3fy** - add .sonify() to any D3 selection and the chart becomes audible:
- Values become pitch
- Position becomes stereo pan
- Arrow keys to navigate

**Demo:** https://ismaelmartinez.github.io/sound3fy/

Try closing your eyes and pressing Play - can you tell which month had the highest sales?

Looking for feedback, especially from anyone who's worked on accessible data viz!
```

---

#### 7. Reddit: r/javascript or r/webdev

**Link:** https://www.reddit.com/r/javascript/

```
Built an accessibility library: sonify D3.js charts for blind users

I've been working on sound3fy, a library that adds sonification to D3 visualizations. The idea originated at a Web Audio hackathon about 10 years ago - finally built it!

```javascript
// One line to add sound to any D3 selection
bars.sonify();
```

Features:
- Web Audio API for low-latency sound
- Musical scale quantization (pentatonic, major, blues)
- Stereo panning for spatial awareness
- Keyboard navigation
- Screen reader integration

**Demo:** https://ismaelmartinez.github.io/sound3fy/
**GitHub:** https://github.com/IsmaelMartinez/sound3fy

Early prototype - looking for API feedback and accessibility testing help!
```

---

#### 8. Observable / D3.js Community

**Link:** https://observablehq.com/

Consider creating an Observable notebook demonstrating sound3fy.

---

#### 9. Medium

**Link:** https://medium.com/

```
# Making Data Visualisations Audible

*Photo by Milad Fakurian on Unsplash*

## A 10-year-old hackathon idea finally comes to life

About 10 years ago, I attended a Web Audio API hackathon, and left with an idea of a side project: what if blind users could "hear" data visualisations?

Charts are everywhere. Sales dashboards, stock prices, COVID statistics, climate data. For sighted users, a quick glance reveals trends, outliers, and patterns. But for the 2.2 billion people with vision impairments worldwide, these visualisations are essentially invisible walls.

Screen readers typically announce that a chart exists, or read values sequentially. That instant understanding that visualisations provide is lost.

Life got busy, and that hackathon idea sat in my notes for a decade, until now. With the help of AI pair programming, I was able to turn that decade-old idea into a working prototype in a fraction of the time.

## Introducing sound3fy

**sound3fy** is an open-source library that adds sonification to D3.js visualisations. One line of code makes many charts audible:

```javascript
d3.selectAll(".bar").sonify({ pitch: "value" });
```

It works with existing D3.js charts. No rewrites. No special data formats.

sound3fy is not intended to replace tables or screen readers, but to complement them by restoring some of the rapid, high-level pattern recognition that sighted users get from charts.

### How sound3fy works

- **Keyboard navigation**: Arrow keys to explore individual data points
- **Screen reader support**: ARIA live regions announce values
- **Pitch mapping**: Higher data values play higher notes
- **Stereo panning**: Position maps to left/right audio channels
- **Musical scales**: Notes quantized to pleasant scales like pentatonic or major

### Try it yourself

**[Live Demo](https://ismaelmartinez.github.io/sound3fy/)** (interactive sonified charts)

The demo includes bar charts, line charts, and scatter plots. Try closing your eyes and pressing Play. Can you tell if sales are increasing or decreasing?

## Why sonification?

Research shows that humans are particularly good at detecting patterns through sound. Rising pitch for trends, rhythm for regularity, and stereo positioning for spatial relationships.

Studies of sonification tools suggest that blind users can understand trends and comparisons in ways much closer to how sighted users read charts.

Recent research backs this up. A 2024 study from UIUC found that combining sonification with other modalities helps blind users interpret statistical charts with high accuracy.

## Prior work

Sonification for accessibility isn't new. Highcharts has offered a sonification module for years, and tools like TwoTone let anyone turn data into music without code.

Research tools like MAIDR have explored multimodal approaches combining sound with braille and natural audio.

sound3fy aims to bring this capability to the D3.js ecosystem, where many custom visualisations live but accessibility tooling is sparse. Chart2Music is a valid alternative, especially if you aren't using D3.js for your graphs.

## Technical design

sound3fy uses the Web Audio API for low-latency sound generation. Key design decisions include:

### Musical scales

Raw frequency mapping sounds harsh. Quantizing to pentatonic scales makes the audio pleasant while preserving data relationships.

### D3.js plugin architecture

It should work with any existing D3.js visualisation. No need to rebuild your charts.

### Accessibility-first

Full keyboard navigation, ARIA attributes, focus management, and screen reader announcements are built in.

## Looking for feedback

This is an early prototype, and I need feedback, especially from blind and low-vision users. I want to make sure this is genuinely useful, not just well intentioned.

- Does the sonification help you understand data?
- Is the keyboard navigation intuitive?
- What is confusing or missing?

Hopefully it helps bridge that gap on accessibility. If it doesn't, that's still useful learning. I hope it sparks a conversation about how we can do better.

**GitHub:** https://github.com/IsmaelMartinez/sound3fy
**Install:** `npm install sound3fy`

---

If you work in accessibility, data visualisation, or know someone who might benefit from this tool, I would love to hear from you.
```

---

### 🟢 Lower Priority: Social Media

#### 10. Twitter/X

```
🔊 10 years ago at a Web Audio hackathon, I had an idea: make charts audible for blind users.

Finally built it and just published to npm!

sound3fy - add .sonify() to D3.js charts:
- Higher values = higher pitch
- Position = stereo pan
- Arrow keys to explore

npm install sound3fy
Demo: https://ismaelmartinez.github.io/sound3fy/

Need feedback from #a11y community! 🙏

#accessibility #d3js #dataviz #webdev #opensource
```

---

#### 11. LinkedIn

```
🔊 What if you could hear a bar chart?

Sounds weird, right? But for the 2.2 billion people with vision impairments, charts are invisible walls.

I finally built that weird hackathon idea from 10 years ago: sound3fy—turn D3.js charts into sound with one line of code.

Higher values = higher notes. Left-to-right = stereo pan.

Try it (close your eyes): https://ismaelmartinez.github.io/sound3fy/

Looking for feedback from blind/low-vision users. Is this actually useful, or just well intentioned?

#accessibility #a11y #dataviz #opensource
```

---

#### 12. Mastodon (accessibility-focused instances)

Post on instances like `a]y.info` or `dragonscave.space` which have strong accessibility communities.

---

## Summary Table

| Platform | Audience | Link | Priority |
|----------|----------|------|----------|
| r/Blind | End users | reddit.com/r/Blind | 🔴 High |
| AppleVis | VoiceOver users | applevis.com | 🔴 High |
| WebAIM list | A11y experts | webaim.org/discussion | 🔴 High |
| NFB | Blind community | nfb.org | 🔴 High |
| Hacker News | Developers | news.ycombinator.com | 🟡 Medium |
| r/dataisbeautiful | DataViz folks | reddit.com/r/dataisbeautiful | 🟡 Medium |
| Observable | D3 community | observablehq.com | 🟡 Medium |
| Medium | Tech readers | medium.com | 🟡 Medium |
| Twitter #a11y | Mixed | twitter.com | 🟡 Medium |
| r/javascript | Developers | reddit.com/r/javascript | 🟢 Low |
| LinkedIn | Professional | linkedin.com | 🟢 Low |
| Mastodon | A11y community | Various instances | 🟢 Low |

---

## Tips for Posting

1. **Be genuine** - You're asking for help, not promoting a product
2. **Be specific** - Ask concrete questions about what feedback you need
3. **Be responsive** - Reply to every comment, even critical ones
4. **Be grateful** - Thank everyone who takes time to test
5. **Follow up** - Share how you've incorporated feedback

---

## Tracking

| Platform | Posted | Date | Response | Notes |
|----------|--------|------|----------|-------|
| r/Blind | ☐ | | | |
| AppleVis | ☐ | | | |
| WebAIM | ☐ | | | |
| Hacker News | ☐ | | | |
| Medium | ☐ | | | |
| Twitter | ☐ | | | |
| LinkedIn | ☐ | | | |

---

*Last updated: December 2024*

---

## Release Status

**✅ npm package published:** `npm install sound3fy` (v0.1.1)

The library is now available on npm with:
- ESM and UMD builds
- Zero dependencies (d3 is a peer dependency)


