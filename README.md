# PRO Threads

An animated, real-time WebGL wallpaper: letters made of thousands of fine threads of light that bend, flare and glow — inspired by the MacBook Pro PROLED XDR wallpaper, rebuilt from scratch as a live shader, with a full A–Z thread typeface, palettes and a settings panel.

一个实时渲染的 WebGL 动态壁纸：字母由成千上万根细光线组成，线条整体弯折、甩尖、发光。灵感来自 MacBook Pro PROLED XDR 壁纸的视觉风格，用着色器从零重写，并扩展成完整的 A–Z 字体，带配色预设和参数面板。

**Live demo / 在线体验：** <https://www.kubai.design/pro-threads/> · [A–Z](https://www.kubai.design/pro-threads/?view=az) · [Chroma](https://www.kubai.design/pro-threads/?palette=chroma) · [Ember](https://www.kubai.design/pro-threads/?palette=ember&effect=glow) · **[Hero scenes](https://www.kubai.design/pro-threads/hero/)**

![PRO in the default palette](media/pro.jpg)

![Ember and Chroma palettes](media/ember-chroma.jpg)

## Features

- **Live, not a video** — one full-screen fragment shader, 60 fps on a laptop GPU; the light breathes, sweeps and drifts along every thread.
- **A whole typeface** — all 26 letters built from the same parts: two halves split by a slit, cut into bands, each end bending as an arch, sweep, foot, wedge or dome. Type any word up to 10 letters.
- **Palettes and effects** — 9 palettes (XDR Blue, Graphite, Ember, Chroma, Violet, Ocean, Aurora, Rose Gold, Paper) with hue-shifting ramps and matched glowing fibres; 7 effect presets (Calm, Lively, Silk, Fine Wire, Glow, Low Light…).
- **Any size** — presets from 16:9 to 9:16 or a custom size; letters keep their proportions. Save a PNG at the exact pixel size.
- **Fast** — renders at 75% of screen pixels on dense displays, lowers resolution by itself if frames run slow, and stops drawing while paused.

![The A–Z thread typeface](media/alphabet.jpg)

![Palettes](media/palettes.jpg)

## Hero scenes

The same threads of light, as first screens for a landing page: a **ring**; a **black hole**, ray traced so its accretion disk is seen bent over and under the hole, with a photon ring; a wide-angle **perspective** of a wall of threads rolling onto the floor; and a **tunnel** to a glowing vanishing point. Each is drawn with a glow pass and a contrast and saturation grade, takes 1–4 ms a frame, and follows the pointer with a little parallax. The panel's **PRO / A–Z / Shapes** tabs switch between the wallpaper and the scenes, keeping the palette.

同样的光线丝线，做成落地页首屏：**圆环**；光线追踪的**黑洞**（吸积盘被引力弯折到黑洞上下，带光子环）；广角**透视**（一面丝线墙翻落到地面、向镜头散开）；以及冲向发光消失点的**隧道**。全部带辉光和对比度、饱和度调色，面板上的 PRO / A–Z / Shapes 标签可以在壁纸和场景之间切换。

[Open the hero scenes →](https://www.kubai.design/pro-threads/hero/) · [Black hole](https://www.kubai.design/pro-threads/hero/?scene=blackhole) · [Perspective](https://www.kubai.design/pro-threads/hero/?scene=perspective&palette=chroma) · [Tunnel](https://www.kubai.design/pro-threads/hero/?scene=tunnel&palette=ocean)

![Hero scenes: ring, black hole, perspective, tunnel](media/hero.jpg)

URL options: `?scene=ring|blackhole|perspective|tunnel`, `?palette=chroma`, `?ui=0`. Keys: `H` hides the panel, `Space` pauses.

## Run it

It is a static page with no build step. Serve the folder over HTTP (ES modules don't load from `file://`):

```bash
python3 -m http.server 8765
```

Then open <http://localhost:8765>.

**Keys:** `H` hides the panel · `Space` pauses · `R` overlays a reference image (see below).

**URL options:** every panel value can be set in the URL, for example
`?text=HELLO&palette=chroma&effect=calm&speed=1.5`, plus `?view=az` (the alphabet), `?ui=0` (no panel) and `?t=7` (freeze one moment, for stills).

## How it works

Not noise, mostly geometry. Each letter is a few **sheets** of parallel threads. At each end of a sheet every thread runs straight, then eases into a turn until it lies flat along the end, and the sideways travel is linear across the sheet — so the sheet's own outer threads draw the outline (rounded corners, pointed arches over the slit, long flared tips).

Because the offset is linear in a thread's coordinate **ψ**, each pixel can solve exactly which thread it lies on. From there:

1. **Find** the row, letter and sheets under the pixel.
2. **Solve ψ**, the distance to the sheet's edge and how steeply the thread lies; anti-alias edges by distance over gradient.
3. **Average threads** under the pixel — where threads lie flat they overlap, so their stripes melt into a smooth sheen.
4. **Light** each thread: a fall-off fitted to the original's brightness, plus slow breathing, a sweeping swell and bands drifting along the threads.
5. **Colour** through a palette ramp with a soft highlight roll-off, then add the edge rim, glowing fibres and the warm edge glow.
6. **Composite** overlapping sheets by taking the brighter one.

Per-thread variation comes from hashes of ψ and three layers of value noise weighted to match the original's measured texture.

Files: `letters.js` (the letters and layout), `shader.js` (the shader), `wallpaper.js` (rendering and the panel, built with [Tweakpane](https://tweakpane.github.io/docs/)), `palettes.js` (shared by both pages), and `hero/` (the hero scenes: ribbon meshes, the black hole shader and the glow pass).

## Reference image

To compare against the original wallpaper, put your own copy next to `index.html` as `reference.webp` and press `R` (or add `?ref=0.5`). It is not included here and is ignored by git.

## License

[MIT](LICENSE) © Kubai087 — covers the code and the images in `media/`, which are renders of this project.

Tweakpane is MIT-licensed and loaded from a CDN.

*Not affiliated with, endorsed by or sponsored by Apple Inc. MacBook Pro and PROLED XDR are trademarks of Apple Inc. No Apple artwork is included in this repository.*
