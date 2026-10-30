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
// light pooled behind the shape, and, for the portal, the light coming
// through its slit, or, for the tunnel, the glow at its far end.
export const BACKDROP_FRAG = `#version 300 es
  precision highp float;
  uniform vec3 uBg;
  uniform vec3 uTint;
  uniform vec3 uHot;
  uniform float uAspect;
  uniform vec3 uSource;       // where the light comes from on screen, and which kind (0 none, 1 slit, 2 point)
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 p = (vUv - uSource.xy) * vec2(uAspect, 1.0);
    vec3 col = uBg + uTint * 0.06 * exp(-dot(p, p) * 5.0);
    if (uSource.z > 0.5 && uSource.z < 1.5) {
      float beam = exp(-pow(p.x / 0.012, 2.0)) + 0.35 * exp(-abs(p.x) / 0.06);
      col += uHot * beam * smoothstep(0.75, -0.2, vUv.y) * 1.8;
    }
    if (uSource.z > 1.5) {
      float r = length(p);
      col += uHot * (exp(-r * r / 0.00025) * 1.2 + exp(-r / 0.06) * 0.45);
    }
    outColor = vec4(col, 1.0);
  }`;

// A black hole: a black shadow ringed by a thin, hot photon ring; round it
// the bent image of the far side of its disk, threads circling the hole;
// and the disk itself, flattened by the view, crossing in front. The disk
// turns faster near the hole and is brighter on the side coming toward us.
export const BLACKHOLE_FRAG = `#version 300 es
  precision highp float;
  ${COMMON}
  uniform float uAspect;
  uniform float uPx;
  uniform vec3 uBg;
  uniform float uRadius;      // the shadow's radius, in frame heights
  uniform float uThreads;
  uniform float uSpin;
  uniform vec2 uCenter;
  in vec2 vUv;
  out vec4 outColor;

  // A band of circular threads between radii r0 and r1, at radius r and
  // angle a; returns its colour and, in cover, how much of the pixel it fills.
  vec3 rings(float r, float a, float r0, float r1, float count, float glow, out float cover) {
    float x = (r - r0) / (r1 - r0);
    float t = x * count;
    float dt = max(fwidth(t), 1e-4);
    float s = threads(t, dt);
    // Inner rings turn faster, as orbits do.
    float spin = uSpin * 0.35 * pow(max(r / r0, 1.0), -1.5);
    float bands = vn2p(vec2(t * 0.5, a / 6.28318 * 28.0 + uTime * spin * 28.0 / 6.28318), 28.0);
    float light = (0.3 + glow * exp(-x * 2.4)) * (0.7 + 0.6 * bands);
    float rim = exp(-(x * (r1 - r0)) / max(fwidth(r) * 2.0, 1e-5));
    float dr = max(fwidth(r), 1e-5);
    cover = smoothstep(r0 - dr, r0 + dr, r) * smoothstep(r1 + dr, r1 - dr, r) * smoothstep(1.0, 0.7, x);
    return fibre(ramp((s * light + rim * 0.9) * uGain), t, dt, a * 3.0);
  }

  void main() {
    vec2 p = (vUv - uCenter) * vec2(uAspect, 1.0);
    float R = uRadius;
    float r = length(p);
    vec3 col = uBg;

    // The disk, seen from just above its plane.
    float tilt = 0.2;
    vec2 d = vec2(p.x, p.y / tilt);
    float rd = length(d);
    float ad = atan(d.y, d.x);
    float diskCover;
    vec3 disk = rings(rd, ad, R * 1.45, R * 3.7, uThreads, 0.95, diskCover);
    disk *= 0.75 + 0.5 * cos(ad);
    float front = smoothstep(-0.002, 0.002, p.y);

    // Behind: the far half of the disk, then its bent image round the hole.
    col = mix(col, disk, diskCover * (1.0 - front));
    float haloCover;
    vec3 halo = rings(r, atan(p.y, p.x), R * 1.06, R * 1.8, uThreads * 0.4, 0.45, haloCover);
    halo *= mix(0.45, 0.9, smoothstep(0.4, -0.4, p.y / max(r, 1e-4)));
    col = mix(col, halo, haloCover);

    // The shadow, its photon ring, then the near half of the disk in front.
    col = mix(col, vec3(0.0), smoothstep(R + uPx, R - uPx, r));
    float ring = exp(-abs(r - R * 1.025) / max(uPx * 1.4, R * 0.008));
    col += ramp(1.0) * ring * 1.1;
    col = mix(col, disk, diskCover * front);
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

// ...and lay a near and a wide glow over the picture.
export const COMPOSITE_FRAG = `#version 300 es
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uNear;
  uniform sampler2D uWide;
  uniform float uGlow;
  in vec2 vUv;
  out vec4 outColor;
  void main() {
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec3 c = texture(uScene, uv).rgb + (texture(uNear, uv).rgb * 0.9 + texture(uWide, uv).rgb * 1.4) * uGlow;
    // Leave the picture as it is up to 0.8, and roll off what the glow
    // pushes past that instead of clipping it.
    vec3 over = max(c - 0.8, 0.0);
    outColor = vec4(min(c - over + over / (1.0 + over * 2.5), 1.0), 1.0);
  }`;
