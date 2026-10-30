# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Wallpaper.** An animated, real-time WebGL wallpaper of letters woven from threads of light, drawn by one full-screen fragment shader, with light that breathes, sweeps and drifts along the threads and coloured fibres that warm as they pass.
- **A–Z thread typeface.** All 26 letters built from sheets of threads, each end bending as an arch, dome, sweep, wedge or foot; any word of up to 10 letters, or the whole alphabet in rows (`?view=az`) with adjustable spacing.
- **Palettes and effects.** Nine palettes (XDR Blue, Graphite, Ember, Chroma, Violet, Ocean, Aurora, Rose Gold, Paper) and seven effect presets (Original, Calm, Lively, Silk, Fine Wire, Glow, Low Light), with every colour, light and shape value adjustable in the panel.
- **Sizes and export.** Desktop presets, current iPhone and Android phone presets and custom sizes; PNG export at 1×–4×, drawn in tiles up to 16384 px a side; a stretch control that eases the letters from keeping their proportions to filling the frame.
- **Hero scenes.** Five scenes for the first screen of a landing page: a ring, a ray-traced black hole, a wide-angle perspective, a Möbius strip and a tunnel, each with a glow pass, a contrast and saturation grade, pointer parallax and PNG export.
- **Demo landing page.** A sample first screen laid over the hero scenes, centred or on the left with a live frame-time chart.
- **Settings in the URL.** Every panel value is kept in the page's address and can be set from it; each page's last settings are remembered for the tab, and a hard reload starts from the defaults.
- **Chinese panel.** The panel in English or Simplified Chinese (`?lang=zh`).
- **Custom dropdowns.** Panel menus with grouped options and details, such as each size preset's PNG size.
- **Embedding.** An Embed dialog with ready-to-paste code (web component, iframe or link) carrying the current settings; the `<pro-threads>` web component (`embed.js`), installable from this repository with npm; and an `embed=1` mode for iframes.
- **Frame pacing.** A frame-rate cap (30, 60 or 120, default 60), no drawing while offscreen, hidden or paused, and automatic resolution that steps down when frames run slow.
- **Stills.** `?t=` holds a single moment for screenshots, and `?ui=0` hides the panel.

[Unreleased]: https://github.com/kubai087/pro-threads/commits/main
