/*
 * Shaders for the hero scenes: the ribbons, the black hole, their backdrop,
 * and a glow pass over everything. They shade threads the way the
 * wallpaper does: each thread its own level averaged over the pixel,
 * broader bands over that, light drifting along the threads, and the
 * palette's ramp, rim and glowing fibres.
 */

// Shared pieces: noise, the palette ramp, a fibre warming up, threads.
const COMMON = `
  uniform vec3 uRamp[5];
  uniform vec3 uFibreCool;
  uniform vec3 uFibreWarm[3];
  uniform float uGain;
  uniform float uWarm;
  uniform float uSparkle;
  uniform float uTime;
  uniform float uFibreTime;

  float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), f);
  }
  float vn2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
               mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // vn2 repeating every period along y (no repeat if period is 0).
  float vn2p(vec2 p, float period) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float y0 = period > 0.0 ? mod(i.y, period) : i.y;
    float y1 = period > 0.0 ? mod(i.y + 1.0, period) : i.y + 1.0;
    return mix(mix(hash2(vec2(i.x, y0)), hash2(vec2(i.x + 1.0, y0)), f.x),
               mix(hash2(vec2(i.x, y1)), hash2(vec2(i.x + 1.0, y1)), f.x), f.y);
  }

  vec3 ramp(float v) {
    v = max(v, 0.0);
    if (v > 0.7) v = 0.7 + 0.3 * (1.0 - exp(-(v - 0.7) / 0.3));
    if (v < 0.25) return mix(uRamp[0], uRamp[1], v / 0.25);
    if (v < 0.5) return mix(uRamp[1], uRamp[2], (v - 0.25) / 0.25);
    if (v < 0.75) return mix(uRamp[2], uRamp[3], (v - 0.5) / 0.25);
    return mix(uRamp[3], uRamp[4], (v - 0.75) / 0.25);
  }

  vec3 warmth(float s) {
    s = clamp(s, 0.0, 1.0);
    if (s < 0.18) return mix(vec3(0.98, 0.98, 0.95), uFibreWarm[0], s / 0.18);
    if (s < 0.5) return mix(uFibreWarm[0], uFibreWarm[1], (s - 0.18) / 0.32);
    if (s < 0.85) return mix(uFibreWarm[1], uFibreWarm[2], (s - 0.5) / 0.35);
    return mix(uFibreWarm[2], uFibreWarm[2] * 0.66, (s - 0.85) / 0.15);
  }

  float strand(float at) {
    float id = floor(at);
    float h0 = hash(id * 1.37 + 3.1);
    float h1 = hash((id + 1.0) * 1.37 + 3.1);
    return mix(h0 * h0, h1 * h1, smoothstep(0.62, 1.0, fract(at)));
  }

  // How bright the threads are at thread coordinate t (one unit a thread),
  // dt of them under the pixel: fine threads over broader bands, weighted
  // like the wallpaper's.
  float threads(float t, float dt) {
    float sum = 0.0;
    for (int i = 0; i < 4; i++) sum += strand(t + dt * (float(i) - 1.5) / 4.0);
    float thread = mix(sum * 0.25, 1.0 / 3.0, smoothstep(1.5, 5.0, dt));
    float fine = mix(vn(t * 0.33 + 13.0), 0.5, smoothstep(2.0, 8.0, dt));
    return 0.26 + 0.3 * thread + 0.16 * fine + 0.2 * vn(t * 0.12 + 7.0) + 0.2 * vn(t * 0.05 + 29.0);
  }

  // A few threads glow, warming along their length; the warm stretch
  // slides along them and moves on to other threads over time.
  vec3 fibre(vec3 col, float t, float dt, float along) {
    float id = floor(t);
    float turn = uFibreTime * 0.06 + hash(id * 0.37);
    float pick = hash(id * 1.91 + floor(turn) * 7.3);
    if (pick > 0.012 * uSparkle) return col;
    float core = 1.0 - smoothstep(0.25, 0.25 + max(dt, 0.3), abs(fract(t) - 0.5));
    float s = fract(along * 0.08 - uFibreTime * 0.05 + hash(id));
    float lit = sin(3.14159 * fract(turn)) * smoothstep(0.0, 0.15, s) * smoothstep(1.0, 0.85, s);
    vec3 c = s < 0.35 ? mix(mix(uFibreCool, vec3(1.0), 0.6), uFibreCool, s / 0.35)
                      : mix(vec3(0.98, 0.98, 0.95), warmth((s - 0.35) / 0.65), mix(0.55, 1.0, uWarm));
    return mix(col, c, core * lit);
  }
`;

export const RIBBON_VERT = `#version 300 es
  in vec3 aPos;
  in vec2 aUv;
  in vec3 aNormal;
  in vec3 aTangent;
  uniform mat4 uProj;
  uniform mat4 uView;
  uniform mat4 uModel;
  out vec2 vUv;
  out vec3 vNormal;
  out vec3 vTangent;
  out vec3 vWorld;
  void main() {
    vec4 world = uModel * vec4(aPos, 1.0);
    vWorld = world.xyz;
    vNormal = mat3(uModel) * aNormal;
    vTangent = mat3(uModel) * aTangent;
    vUv = aUv;
    gl_Position = uProj * uView * world;
  }`;

// A ribbon: threads run along u. They catch light the way fibres do (a
// sheen across the threads, strongest where the light glances off them),
// with light drifting along them, a bright rim at the band's edges, and
// fading into the backdrop with distance.
export const RIBBON_FRAG = `#version 300 es
  precision highp float;
  ${COMMON}
  uniform float uThreads;     // threads across the band
  uniform float uSheen;
  uniform vec3 uEye;
  uniform vec3 uLight;
  uniform vec3 uBg;
  uniform vec2 uFog;          // distances where fading starts and ends
  uniform float uLoop;        // a closed band's length (0 if open)
  uniform float uWrap;        // 1 if the band closes round on itself across (a tube)
  uniform vec3 uFall;         // light falling from where the threads start: how much, how far, the floor it settles to
  uniform vec3 uPool;         // light pooling at a fold: where along the threads, how strong, how far it spreads past
  in vec2 vUv;
  in vec3 vNormal;
  in vec3 vTangent;
  in vec3 vWorld;
  out vec4 outColor;

  // On a closed band, each pattern along it fits a whole number of times
  // round, so it meets itself without a seam.
  float bandsAt(float t, float along) {
    float k = 2.2;
    if (uLoop > 0.0) k = max(1.0, floor(uLoop * k + 0.5)) / uLoop;
    float dir = vn(t * 0.07 + 21.0) > 0.5 ? 1.0 : -1.0;
    float pace = mix(0.3, 1.0, vn(t * 0.11 + 5.0));
    return vn2p(vec2(t * 0.5, along * k - uTime * pace * dir), uLoop > 0.0 ? floor(uLoop * k + 0.5) : 0.0);
  }

  void main() {
    float t = (vUv.y * 0.5 + 0.5) * uThreads;
    float dt = max(fwidth(t), 1e-4);
    float along = vUv.x;
    float s = threads(t, dt);
    float bands = bandsAt(t, along);
    // A tube's last threads fade into its first, so it closes without a seam.
    if (uWrap > 0.5) {
      float join = smoothstep(uThreads * 0.86, uThreads, t);
      s = mix(s, threads(t - uThreads, dt), join);
      bands = mix(bands, bandsAt(t - uThreads, along), join);
    }

    vec3 T = normalize(vTangent);
    vec3 N = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 V = normalize(uEye - vWorld);
    vec3 L = normalize(uLight);
    vec3 H = normalize(L + V);
    // Threads as fine cylinders: lit by how square the light falls across
    // them, with a sheen where the half vector is square to them too.
    float diffuse = sqrt(max(0.0, 1.0 - pow(dot(T, L), 2.0)));
    float sheen = pow(sqrt(max(0.0, 1.0 - pow(dot(T, H), 2.0))), 60.0);
    float facing = 0.55 + 0.45 * abs(dot(N, V));

    float w = 0.9;
    if (uLoop > 0.0) w = 6.28318 * max(1.0, floor(uLoop * w / 6.28318 + 0.5)) / uLoop;
    float swell = 0.75 + 0.25 * sin(along * w - uTime * 0.7 + vn(t * 0.02) * 6.0);

    // The band's edges, a couple of pixels wide (a tube has none).
    float edge = (1.0 - abs(vUv.y)) / max(fwidth(vUv.y), 1e-5);
    float rim = uWrap > 0.5 ? 0.0 : exp(-edge / 2.2);

    // As on the wallpaper, light can fall from where the threads start and
    // settle to a floor, a little further on some threads than others.
    float reach = uFall.y * mix(0.7, 1.3, vn(t * 0.9 + 17.0));
    float fall = mix(1.0, uFall.z + (1.0 - uFall.z) * exp(-pow(along / reach, 1.3)), uFall.x);
    float light = (0.25 + 0.75 * diffuse) * facing * (0.7 + 0.6 * bands) * swell * fall;
    // Where a wall rolls onto the floor the light gathers on the fold and
    // spreads on across the floor toward the viewer.
    float past = along - uPool.x;
    // The spread past the fold eases in, so the light has no edge there.
    float spread = smoothstep(-0.4, 0.4, past) * exp(-max(past, 0.0) / uPool.z);
    light += uPool.y * (exp(-pow(past / 0.35, 2.0)) + 0.6 * spread) * (0.85 + 0.3 * bands);
    float v = (s * light + sheen * uSheen * (0.5 + s) + rim * 0.8) * uGain;
    vec3 col = fibre(ramp(v), t, dt, uLoop > 0.0 ? along * floor(uLoop * 0.08 + 0.5) / (uLoop * 0.08) : along);

    float fog = smoothstep(uFog.x, uFog.y, distance(uEye, vWorld));
    outColor = vec4(mix(col, uBg, fog), 1.0);
  }`;

export const QUAD_VERT = `#version 300 es
  in vec2 aPos;
  out vec2 vUv;
  void main() {
    vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

// The backdrop behind a ribbon: the palette's background with a little
// light pooled behind the shape, and, for the tunnel, the glow at its far end.
export const BACKDROP_FRAG = `#version 300 es
  precision highp float;
  uniform vec3 uBg;
  uniform vec3 uTint;
  uniform vec3 uHot;
  uniform float uAspect;
  uniform vec3 uSource;       // where the glow sits on screen, and whether there is one
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 p = (vUv - uSource.xy) * vec2(uAspect, 1.0);
    vec3 col = uBg + uTint * 0.06 * exp(-dot(p, p) * 5.0);
    if (uSource.z > 0.5) {
      float r = length(p);
      col += uHot * (exp(-r * r / 0.00025) * 1.2 + exp(-r / 0.06) * 0.45);
    }
    outColor = vec4(col, 1.0);
  }`;

// A black hole, ray traced. Each pixel's ray is bent by the hole as it
// goes (the usual pseudo-Newtonian bend for light, in units of the
// hole's radius), and wherever it crosses the plane of the accretion disk
// within the disk's radii it picks up the disk's colour there. So the far
// side of the disk is seen bent up over the hole, its underside bent down
// below it, and a thin photon ring where light circles the hole before
// escaping. Rays that fall in stay black; rays that get away show faint
// stars, warped near the hole.
export const BLACKHOLE_FRAG = `#version 300 es
  precision highp float;
  ${COMMON}
  uniform float uAspect;
  uniform vec3 uBg;
  uniform float uThreads;
  uniform float uSpin;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamFwd;
  uniform float uTanHalf;     // tan of half the vertical field of view
  uniform float uPixel;       // one pixel's angle, in radians
  in vec2 vUv;
  out vec4 outColor;

  const float RIN = 2.6;
  const float ROUT = 9.0;

  // The disk where a ray crosses it: circling threads, turning faster
  // near the hole, brighter on the side coming toward the viewer.
  vec4 disk(vec3 hit, vec3 dir, float travelled) {
    float r = length(hit.xz);
    float a = atan(hit.z, hit.x);
    float x = (r - RIN) / (ROUT - RIN);
    float t = x * uThreads;
    // How many threads one pixel covers here, from how far the ray came and
    // how slantingly it meets the disk.
    float dt = uThreads / (ROUT - RIN) * travelled * uPixel / max(abs(dir.y), 0.08);
    float s = threads(t, dt);
    float spin = uSpin * 0.45 * pow(r / RIN, -1.5);
    float bands = vn2p(vec2(t * 0.5, a / 6.28318 * 28.0 - uTime * spin * 28.0 / 6.28318), 28.0);
    vec3 orbit = normalize(vec3(-sin(a), 0.0, cos(a)));
    float beta = 0.5 * pow(r / RIN, -0.5);
    float beam = clamp(pow(1.0 / (1.0 - beta * dot(orbit, -dir)), 3.0), 0.2, 2.2);
    float light = (0.2 + 0.62 * exp(-x * 2.6)) * (0.7 + 0.6 * bands) * beam;
    float edge = smoothstep(0.0, 0.03, x) * smoothstep(1.0, 0.7, x);
    vec3 col = fibre(ramp(s * light * uGain), t, dt, a * r);
    return vec4(col, 0.92 * edge);
  }

  float stars(vec3 d) {
    vec2 q = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0))) * 160.0;
    vec2 cell = floor(q);
    float h = hash2(cell);
    vec2 at = fract(q) - vec2(hash2(cell + 7.1), hash2(cell + 3.7));
    return step(0.985, h) * exp(-dot(at, at) * 40.0) * (0.3 + 0.7 * hash2(cell + 1.3));
  }

  void main() {
    vec2 ndc = vec2((vUv.x * 2.0 - 1.0) * uAspect, 1.0 - vUv.y * 2.0);
    vec3 v = normalize(uCamFwd + (uCamRight * ndc.x + uCamUp * ndc.y) * uTanHalf);
    vec3 p = uCamPos;
    vec3 h = cross(p, v);
    float h2 = dot(h, h);
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    float travelled = 0.0;
    bool escaped = false;
    for (int i = 0; i < 260; i++) {
      float r2 = dot(p, p);
      float r = sqrt(r2);
      if (r < 1.0) break;
      if (r > 40.0 && dot(p, v) > 0.0) { escaped = true; break; }
      float ds = clamp(0.07 * r, 0.02, 1.5);
      vec3 next = p + v * ds;
      // Crossing the disk's plane: take the disk's colour there.
      if (p.y * next.y < 0.0) {
        vec3 hit = mix(p, next, p.y / (p.y - next.y));
        float hr = length(hit.xz);
        if (hr > RIN && hr < ROUT) {
          vec4 c = disk(hit, v, travelled + distance(p, hit));
          col += (1.0 - alpha) * c.rgb * c.a;
          alpha += (1.0 - alpha) * c.a;
          if (alpha > 0.97) break;
        }
      }
      v = normalize(v - 1.5 * h2 * p / pow(r2, 2.5) * ds);
      p = next;
      travelled += ds;
    }
    if (escaped) col += (1.0 - alpha) * (uBg + ramp(0.9) * stars(v) * 0.4);
    outColor = vec4(col, 1.0);
  }`;

// Glow: keep what is brighter than a threshold, at a quarter size...
export const BRIGHT_FRAG = `#version 300 es
  precision highp float;
  uniform sampler2D uSrc;
  uniform vec2 uTexel;
  uniform float uThreshold;
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec3 c = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      vec2 o = (vec2(i % 2, i / 2) - 0.5) * uTexel;
      c += texture(uSrc, uv + o).rgb;
    }
    c *= 0.25;
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    outColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.25, lum), 1.0);
  }`;

// ...blur it one way at a time...
export const BLUR_FRAG = `#version 300 es
  precision highp float;
  uniform sampler2D uSrc;
  uniform vec2 uStep;
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    const float w[5] = float[5](0.227, 0.194, 0.122, 0.054, 0.016);
    vec3 c = texture(uSrc, uv).rgb * w[0];
    for (int i = 1; i < 5; i++) {
      c += texture(uSrc, uv + uStep * float(i)).rgb * w[i];
      c += texture(uSrc, uv - uStep * float(i)).rgb * w[i];
    }
    outColor = vec4(c, 1.0);
  }`;

// ...and lay a near and a wide glow over the picture, then grade it:
// contrast as an S-curve about a low pivot (darks deepen, brights rise
// toward white without clipping) and saturation away from each pixel's grey.
export const COMPOSITE_FRAG = `#version 300 es
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uNear;
  uniform sampler2D uWide;
  uniform float uGlow;
  uniform vec2 uGrade;        // contrast, saturation
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec3 c = texture(uScene, uv).rgb + (texture(uNear, uv).rgb * 0.9 + texture(uWide, uv).rgb * 1.4) * uGlow;
    // Leave the picture as it is up to 0.8, and roll off what the glow
    // pushes past that instead of clipping it.
    vec3 over = max(c - 0.8, 0.0);
    c = min(c - over + over / (1.0 + over * 2.5), 1.0);
    const float pivot = 0.3;
    vec3 low = pivot * pow(max(c, 0.0) / pivot, vec3(uGrade.x));
    vec3 high = 1.0 - (1.0 - pivot) * pow(max(1.0 - c, 0.0) / (1.0 - pivot), vec3(uGrade.x));
    c = mix(low, high, step(pivot, c));
    float grey = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(grey), c, uGrade.y);
    outColor = vec4(clamp(c, 0.0, 1.0), 1.0);
  }`;
