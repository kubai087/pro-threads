/*
 * A moving take on the MacBook Pro PROLED XDR wallpaper: a word set as
 * rounded slabs of fine vertical threads of light, one slab per letter,
 * with the light drifting up and down the threads.
 *
 * Each letter is built from sheets of threads: mostly a left and a right
 * half either side of a slit down its middle, cut into bands (M and W use
 * three columns). At each of its ends the whole sheet bends together: each
 * thread runs straight, then eases into a turn until it lies flat along
 * the end. How far a thread travels sideways is linear across the sheet,
 * from one amount at its left edge to another at its right, so the
 * sheet's own outer threads draw its outline. P, R and O follow the
 * original; the rest of the alphabet is set the same way (letters.js).
 * Every letter keeps the original's proportions, so longer words are set
 * smaller. A few coloured fibres drift through each letter.
 *
 * Because the offset is linear in a thread's own coordinate psi, every
 * pixel can be traced back to the thread it lies on exactly (shader.js).
 *
 * The panel on the right (Tweakpane) sets everything; any of its values
 * can also be given in the URL, e.g. ?text=HELLO&speed=2&steel=3a5f8f, and
 * ?palette=ember&effect=calm start from a preset.
 * Also: ?view=az (the alphabet)  ?ui=0 (hide the panel)  ?t=7 (hold one
 * moment, for stills)  ?ref=0.5 (the original on top, at that opacity).
 * Keys: H toggles the panel, R overlays the original, Space pauses.
 */
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { CELL, MAX_LETTERS, MAX_CELLS, TEXELS, ALPHABET, pack } from './letters.js';
import { VERT, FRAG } from './shader.js';
import { PALETTES } from './palettes.js';

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('wall');
const stage = document.querySelector('.stage');
const still = params.has('t') ? Number(params.get('t')) : null;

// ---------- Settings ----------

const SIZES = {
  'Original 2000 × 1293': [2000, 1293],
  '16:9 · 1920 × 1080': [1920, 1080],
  '16:10 · 2560 × 1600': [2560, 1600],
  '4:3 · 1600 × 1200': [1600, 1200],
  '1:1 · 1440 × 1440': [1440, 1440],
  '3:4 · 1200 × 1600': [1200, 1600],
  '9:16 · 1080 × 1920': [1080, 1920],
};

const DEFAULTS = {
  view: 'word',
  text: 'PRO',
  // Size: the stage's proportions, and the pixels a saved PNG has.
  width: 2000,
  height: 1293,
  // Motion
  speed: 1,
  breathe: 1,
  swell: 1,
  fibrePace: 1,
  paused: false,
  // Light, fitted to the original
  gain: 1.5,
  density: 1,
  texture: 1,
  rim: 1,
  reach: 1,
  floorDim: 0.2,
  floorLit: 0.52,
  // Colour: the ramp from shadow to highlight, the glow where the light
  // ends, the backdrop, the coloured fibres (above where they warm, then
  // as they warm), and how warm and how many the fibres are.
  shadow: '#1a1d24',
  steel: '#475e7a',
  silver: '#a3b8d1',
  highlight: '#e6ebf2',
  glow: '#ffad66',
  background: '#000000',
  fibreCool: '#38a3eb',
  warmLight: '#fff2ad',
  warmMid: '#f5ba29',
  warmDeep: '#db3317',
  warm: 0.6,
  sparkle: 1,
  // Shape, in the original's pixels
  corner: 28,
  arch: 40,
  tip: 66,
  // The alphabet's spacing: between letters in pixels, between rows in letter heights
  spacing: 90,
  rowGap: 0.22,
  // Performance: the share of the screen's pixels drawn, and whether to
  // lower it when frames run slow.
  quality: (devicePixelRatio || 1) >= 2 ? 0.75 : 1,
  autoQuality: true,
};

// Effects: how the light moves and falls, and how the threads look. The
// first is the original's.
const EFFECTS = {
  Original: { speed: 1, breathe: 1, swell: 1, fibrePace: 1, gain: 1.5, reach: 1, floorDim: 0.2, floorLit: 0.52, density: 1, texture: 1, rim: 1, warm: 0.6, sparkle: 1 },
  Calm: { speed: 0.4, breathe: 0.6, swell: 0.5, fibrePace: 0.5, gain: 1.45, reach: 1.1, floorDim: 0.2, floorLit: 0.52, density: 1, texture: 0.9, rim: 1, warm: 0.5, sparkle: 0.7 },
  Lively: { speed: 2, breathe: 1.7, swell: 2, fibrePace: 2.2, gain: 1.55, reach: 1, floorDim: 0.22, floorLit: 0.52, density: 1, texture: 1.1, rim: 1.1, warm: 0.75, sparkle: 1.3 },
  Silk: { speed: 0.7, breathe: 1, swell: 1, fibrePace: 0.8, gain: 1.5, reach: 1.4, floorDim: 0.24, floorLit: 0.56, density: 0.7, texture: 0.4, rim: 0.6, warm: 0.5, sparkle: 0.6 },
  'Fine Wire': { speed: 1, breathe: 1, swell: 1, fibrePace: 1, gain: 1.45, reach: 0.9, floorDim: 0.16, floorLit: 0.46, density: 2, texture: 1.6, rim: 1.5, warm: 0.6, sparkle: 1 },
  Glow: { speed: 0.9, breathe: 1.2, swell: 1.4, fibrePace: 1, gain: 1.9, reach: 1.8, floorDim: 0.26, floorLit: 0.66, density: 1, texture: 0.9, rim: 1.6, warm: 1, sparkle: 1.2 },
  'Low Light': { speed: 0.8, breathe: 1, swell: 1, fibrePace: 0.8, gain: 1.1, reach: 0.7, floorDim: 0.08, floorLit: 0.35, density: 1, texture: 1.1, rim: 0.8, warm: 0.4, sparkle: 0.8 },
};

const state = { ...DEFAULTS };
// ?palette= and ?effect= start from a preset; other values override it.
const pick = (table, name) => Object.keys(table).find((k) => k.toLowerCase().replace(/ /g, '-') === name?.toLowerCase());
const chosen = { palette: pick(PALETTES, params.get('palette')) ?? 'XDR Blue', effect: pick(EFFECTS, params.get('effect')) ?? 'Original' };
Object.assign(state, PALETTES[chosen.palette], EFFECTS[chosen.effect]);
for (const [key, fallback] of Object.entries(DEFAULTS)) {
  if (!params.has(key)) continue;
  const raw = params.get(key);
  if (typeof fallback === 'number') state[key] = Number(raw);
  else if (typeof fallback === 'boolean') state[key] = raw !== '0' && raw !== 'false';
  else if (fallback.startsWith('#')) state[key] = raw.startsWith('#') ? raw : `#${raw}`;
  else state[key] = raw;
}
if (params.get('view') === 'az') state.view = 'alphabet';
if (params.get('ui') === '0') document.body.dataset.ui = 'off';
// The original, for comparison, if a copy sits beside the page as
// reference.webp (it is not part of this project). Loaded only when asked for.
const reference = document.querySelector('.reference');
function showReference(on) {
  if (on && !reference.src) reference.src = './reference.webp';
  document.body.toggleAttribute('data-reference', on);
}
if (params.has('ref')) {
  showReference(true);
  reference.style.opacity = params.get('ref');
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

// ---------- WebGL ----------

const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: still !== null });

function compile(type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
gl.useProgram(program);

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(program, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const u = {};
const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
for (let i = 0; i < count; i++) {
  const name = gl.getActiveUniform(program, i).name.replace(/\[0\]$/, '');
  u[name] = gl.getUniformLocation(program, name);
}

// The letters' sheets and fibres, read texel by texel.
const sheetTex = gl.createTexture();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, sheetTex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.uniform1i(u.uSheetTex, 0);

// ---------- Layout and uniforms ----------

let layout = { width: 1, height: 1 };

// Packs the letters shown (the word, or the alphabet in rows) and uploads them.
function relayout() {
  const alphabet = state.view === 'alphabet';
  const text = [...(state.text || ' ')].slice(0, MAX_LETTERS).join('');
  const shape = {
    corner: state.corner,
    arch: state.arch,
    tip: state.tip,
    gap: alphabet ? state.spacing : 15,
    rowGap: alphabet ? state.rowGap : 0,
  };
  layout = pack(alphabet ? ALPHABET : [text], shape);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEXELS, MAX_CELLS, 0, gl.RGBA, gl.FLOAT, layout.data);
  gl.uniform4fv(u.uRows, layout.rows);
  gl.uniform1i(u.uRowCount, layout.nRows);
  gl.uniform1f(u.uRowPitch, layout.rowPitch);
  gl.uniform1f(u.uCell, CELL);
  gl.uniform1f(u.uGap, shape.gap / 1293);
  document.body.dataset.view = state.view;
  placeLetters();
}

// Fits the letters to the stage: three fill the original's frame, anything
// wider or taller is scaled down as a whole, and everything is centred.
function placeLetters() {
  const aspect = state.width / state.height;
  const scale = Math.min(1, aspect / layout.width, 1 / layout.height);
  gl.uniform1f(u.uAspect, aspect);
  gl.uniform3f(u.uFrame, (aspect - layout.width * scale) / 2, (1 - layout.height * scale) / 2, scale);
  gl.uniform1f(u.uPx, 1 / (canvas.height * scale));
}

// Everything else the panel sets.
function setUniforms() {
  gl.uniform1f(u.uDensity, state.density);
  gl.uniform1f(u.uWarm, state.warm);
  gl.uniform1f(u.uGain, state.gain);
  gl.uniform1f(u.uSparkle, state.sparkle);
  gl.uniform4f(u.uMotion, state.breathe, state.swell, state.texture, state.rim);
  // How far the light falls (left, right of a slit) and the floors it settles to.
  gl.uniform4f(u.uShape, 0.285 * state.reach, 0.144 * state.reach, state.floorDim, state.floorLit);
  // How far and how strongly it rises above an end.
  gl.uniform2f(u.uEnd, 0.152, 0.35);
  // How sharply it falls (left, right), how much shorter it reaches below a
  // seam, and how much further the few long threads carry it.
  gl.uniform4f(u.uFall, 1.3, 1.17, 0.84, 0.69);
  const shadow = rgb(state.shadow);
  gl.uniform3fv(u.uRamp, [
    ...shadow.map((c) => c * 0.16), ...shadow, ...rgb(state.steel), ...rgb(state.silver), ...rgb(state.highlight),
  ]);
  gl.uniform3fv(u.uGlow, rgb(state.glow));
  gl.uniform3fv(u.uFibreCool, rgb(state.fibreCool));
  gl.uniform3fv(u.uFibreWarm, [...rgb(state.warmLight), ...rgb(state.warmMid), ...rgb(state.warmDeep)]);
  gl.uniform3fv(u.uBg, rgb(state.background));
  document.body.style.setProperty('--backdrop', state.background);
}

// Sizes the stage to the chosen proportions and the canvas to the pixels
// it covers, times the quality setting.
function resize() {
  stage.style.setProperty('--ratio', state.width / state.height);
  const box = stage.getBoundingClientRect();
  const density = (devicePixelRatio || 1) * state.quality;
  canvas.width = Math.max(1, Math.round(box.width * density));
  canvas.height = Math.max(1, Math.round(box.height * density));
  gl.viewport(0, 0, canvas.width, canvas.height);
  placeLetters();
  stats.resolution = `${canvas.width} × ${canvas.height}`;
  dirty = true;
  if (still !== null) draw();
}

// ---------- Drawing ----------

let lightClock = still ?? 0;
let fibreClock = still ?? 0;
let dirty = true;

function draw() {
  gl.uniform1f(u.uTime, lightClock);
  gl.uniform1f(u.uFibreTime, fibreClock);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  dirty = false;
  window.__wallDrawn = true;
}

// Frames: the clocks advance with the speed settings (so changing a speed
// never makes the light jump), and nothing is drawn while paused unless
// something changed. If frames keep running slow, draw fewer pixels.
const stats = { fps: 0, resolution: '' };
let last = null;
let slow = 0;
let frames = 0;
let since = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!state.paused) {
    lightClock += dt * state.speed;
    fibreClock += dt * state.speed * state.fibrePace;
  }
  if (state.paused && !dirty) return;
  draw();

  frames++;
  since += dt;
  if (since >= 0.5) {
    stats.fps = Math.round(frames / since);
    frames = 0;
    since = 0;
  }
  if (state.autoQuality && !state.paused && dt > 0) {
    slow = dt > 1 / 40 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 45 && state.quality > 0.5) {
      state.quality = Math.max(0.5, Math.round((state.quality - 0.1) * 100) / 100);
      slow = 0;
      resize();
      pane.refresh();
    }
  }
}

// Saves a PNG at the size chosen in the panel, then goes back to the screen's size.
function savePng() {
  canvas.width = state.width;
  canvas.height = state.height;
  gl.viewport(0, 0, canvas.width, canvas.height);
  placeLetters();
  draw();
  canvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pro-threads-${state.width}x${state.height}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  resize();
}

// ---------- Panel ----------

const pane = new Pane({ container: document.querySelector('.sidebar'), title: 'PRO Threads' });

// PRO and A–Z switch what this page shows; Shapes goes to the hero
// scenes (hero/), taking the palette along.
const tabs = pane.addTab({ pages: [{ title: 'PRO' }, { title: 'A–Z' }, { title: 'Shapes' }] });
tabs.pages[0].addBinding(state, 'text', { label: 'Text' }).on('change', () => {
  state.text = [...state.text.toUpperCase()].slice(0, MAX_LETTERS).join('');
  pane.refresh();
});
tabs.pages[1].addBinding(state, 'spacing', { label: 'Spacing', min: 15, max: 240, step: 1 });
tabs.pages[1].addBinding(state, 'rowGap', { label: 'Row gap', min: 0.02, max: 0.6, step: 0.01 });
tabs.pages[state.view === 'alphabet' ? 1 : 0].selected = true;
tabs.on('select', (event) => {
  if (event.index === 2) {
    location.href = `hero/?palette=${chosen.palette.toLowerCase().replace(/ /g, '-')}`;
    return;
  }
  state.view = event.index === 1 ? 'alphabet' : 'word';
  relayout();
  dirty = true;
});

const presets = pane.addFolder({ title: 'Presets' });
presets.addBinding(chosen, 'palette', {
  label: 'Palette',
  options: Object.fromEntries(Object.keys(PALETTES).map((k) => [k, k])),
}).on('change', (event) => {
  Object.assign(state, PALETTES[event.value]);
  pane.refresh();
});
presets.addBinding(chosen, 'effect', {
  label: 'Effect',
  options: Object.fromEntries(Object.keys(EFFECTS).map((k) => [k, k])),
}).on('change', (event) => {
  Object.assign(state, EFFECTS[event.value]);
  pane.refresh();
});

const size = pane.addFolder({ title: 'Size' });
const preset = { size: Object.keys(SIZES).find((k) => SIZES[k][0] === state.width && SIZES[k][1] === state.height) ?? 'Custom' };
size.addBinding(preset, 'size', {
  label: 'Preset',
  options: Object.fromEntries([...Object.keys(SIZES), 'Custom'].map((k) => [k, k])),
}).on('change', (event) => {
  if (!SIZES[event.value]) return;
  [state.width, state.height] = SIZES[event.value];
  pane.refresh();
});
size.addBinding(state, 'width', { label: 'Width', min: 320, max: 7680, step: 1 });
size.addBinding(state, 'height', { label: 'Height', min: 320, max: 7680, step: 1 });
size.addButton({ title: 'Save PNG' }).on('click', savePng);

const motion = pane.addFolder({ title: 'Motion' });
motion.addBinding(state, 'speed', { label: 'Speed', min: 0, max: 4, step: 0.01 });
motion.addBinding(state, 'breathe', { label: 'Breathing', min: 0, max: 2.5, step: 0.01 });
motion.addBinding(state, 'swell', { label: 'Swell', min: 0, max: 3, step: 0.01 });
motion.addBinding(state, 'fibrePace', { label: 'Fibre pace', min: 0, max: 4, step: 0.01 });
motion.addBinding(state, 'paused', { label: 'Paused' });

const light = pane.addFolder({ title: 'Light' });
light.addBinding(state, 'gain', { label: 'Brightness', min: 0.6, max: 2.4, step: 0.01 });
light.addBinding(state, 'reach', { label: 'Reach', min: 0.4, max: 2.5, step: 0.01 });
light.addBinding(state, 'floorDim', { label: 'Dim side', min: 0, max: 0.6, step: 0.01 });
light.addBinding(state, 'floorLit', { label: 'Lit side', min: 0.1, max: 0.9, step: 0.01 });
light.addBinding(state, 'density', { label: 'Threads', min: 0.4, max: 2.5, step: 0.01 });
light.addBinding(state, 'texture', { label: 'Texture', min: 0, max: 2, step: 0.01 });
light.addBinding(state, 'rim', { label: 'Edge rim', min: 0, max: 2.5, step: 0.01 });

const colour = pane.addFolder({ title: 'Colour' });
colour.addBinding(state, 'shadow', { label: 'Shadow' });
colour.addBinding(state, 'steel', { label: 'Steel' });
colour.addBinding(state, 'silver', { label: 'Silver' });
colour.addBinding(state, 'highlight', { label: 'Highlight' });
colour.addBinding(state, 'glow', { label: 'Edge glow' });
colour.addBinding(state, 'fibreCool', { label: 'Fibre cool' });
colour.addBinding(state, 'warmLight', { label: 'Fibre warm 1' });
colour.addBinding(state, 'warmMid', { label: 'Fibre warm 2' });
colour.addBinding(state, 'warmDeep', { label: 'Fibre warm 3' });
colour.addBinding(state, 'background', { label: 'Background' });
colour.addBinding(state, 'warm', { label: 'Warmth', min: 0, max: 1, step: 0.01 });
colour.addBinding(state, 'sparkle', { label: 'Fibres', min: 0, max: 1.5, step: 0.01 });

const shape = pane.addFolder({ title: 'Shape', expanded: false });
shape.addBinding(state, 'corner', { label: 'Corner', min: 8, max: 70, step: 1 });
shape.addBinding(state, 'arch', { label: 'Arch', min: 8, max: 90, step: 1 });
shape.addBinding(state, 'tip', { label: 'Tip', min: 16, max: 140, step: 1 });

const perf = pane.addFolder({ title: 'Performance', expanded: false });
perf.addBinding(state, 'quality', { label: 'Resolution', min: 0.4, max: 1, step: 0.05 });
perf.addBinding(state, 'autoQuality', { label: 'Auto' });
perf.addBinding(stats, 'fps', { label: 'FPS', readonly: true, view: 'graph', min: 0, max: 130, interval: 500 });
perf.addBinding(stats, 'resolution', { label: 'Pixels', readonly: true, interval: 500 });

pane.addButton({ title: 'Reset' }).on('click', () => {
  Object.assign(state, DEFAULTS, { view: state.view });
  preset.size = Object.keys(SIZES)[0];
  chosen.palette = 'XDR Blue';
  chosen.effect = 'Original';
  pane.refresh();
});

// Any change: re-lay the letters if their shapes or spacing moved, resize
// if the size or quality did, and redraw.
const LAYOUT = new Set(['text', 'spacing', 'rowGap', 'corner', 'arch', 'tip']);
const SIZE = new Set(['width', 'height', 'quality']);
pane.on('change', (event) => {
  const key = event.target.key;
  if (LAYOUT.has(key)) relayout();
  if (SIZE.has(key)) {
    preset.size = Object.keys(SIZES).find((k) => SIZES[k][0] === state.width && SIZES[k][1] === state.height) ?? 'Custom';
    resize();
  }
  setUniforms();
  dirty = true;
});

// ---------- Start ----------

addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
  if (event.key === 'h' || event.key === 'H') {
    document.body.dataset.ui = document.body.dataset.ui === 'off' ? 'on' : 'off';
  }
  if (event.key === 'r' || event.key === 'R') showReference(!document.body.hasAttribute('data-reference'));
  if (event.key === ' ') {
    state.paused = !state.paused;
    pane.refresh();
    event.preventDefault();
  }
});

setUniforms();
relayout();
new ResizeObserver(resize).observe(stage.parentElement);
resize();
if (still === null) requestAnimationFrame(frame);
else draw();

window.__wall = { state, draw, pane };
