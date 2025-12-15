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
- Data values map to pitch (Web Audio API)
- X-position maps to stereo pan
- Notes quantized to musical scales
- Keyboard navigation + screen reader support

Looking for feedback from:
- Blind/low-vision users (does this actually help?)
- D3.js developers (API design feedback)
- Accessibility experts (what am I missing?)

MIT licensed, no dependencies beyond D3.
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
bars.sonify({ pitch: { field: 'value', scale: 'pentatonic' } });
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

### 🟢 Lower Priority: Social Media

#### 9. Twitter/X

```
🔊 10 years ago at a Web Audio hackathon, I had an idea: make charts audible for blind users.

Finally built it.

sound3fy - add .sonify() to D3.js charts:
- Higher values = higher pitch
- Position = stereo pan
- Arrow keys to explore

Demo: https://ismaelmartinez.github.io/sound3fy/

Need feedback from #a11y community! 🙏

#accessibility #d3js #dataviz #webdev #opensource
```

---

#### 10. LinkedIn

```
🔊 Making data visualizations accessible through sound

10 years ago at a Web Audio API hackathon, I had an idea: what if blind users could "hear" data visualizations?

Life got busy. The idea sat in my notes.

Recently, while cleaning up old repos, I decided to finally build it. With AI pair programming, I created sound3fy - an open-source library that adds sonification to D3.js charts.

How it works:
- Data values → pitch (higher value = higher note)
- X-position → stereo pan (left to right)
- Keyboard navigation with screen reader support

**Try the demo:** https://ismaelmartinez.github.io/sound3fy/

This is an early prototype. I'm actively seeking feedback from:
- Blind and low-vision users
- Accessibility practitioners
- Data visualization developers

If you know someone who might benefit from or contribute to this project, please share!

#accessibility #a11y #dataviz #opensource #webdevelopment
```

---

#### 11. Mastodon (accessibility-focused instances)

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
| Twitter | ☐ | | | |
| LinkedIn | ☐ | | | |

---

*Last updated: December 2024*


