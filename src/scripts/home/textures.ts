import * as THREE from 'three';

type Rgb = [number, number, number];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable value noise with fractal octaves. */
function createNoise(seed: number, period = 64) {
  const rand = mulberry32(seed);
  const grid = new Float32Array(period * period).map(() => rand());
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const sample = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const at = (i: number, j: number) =>
      grid[(((j % period) + period) % period) * period + (((i % period) + period) % period)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
  return (x: number, y: number, octaves = 4) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    for (let o = 0; o < octaves; o++) {
      sum += sample(x * freq, y * freq) * amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum;
  };
}

function paint(w: number, h: number, shade: (x: number, y: number) => Rgb): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = shade(x, y);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

const clamp255 = (v: number) => Math.max(0, Math.min(255, v));
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  clamp255(a[0] + (b[0] - a[0]) * t),
  clamp255(a[1] + (b[1] - a[1]) * t),
  clamp255(a[2] + (b[2] - a[2]) * t),
];

function toTexture(canvas: HTMLCanvasElement, color = true) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function grayscale(src: HTMLCanvasElement) {
  const canvas = document.createElement('canvas');
  canvas.width = src.width;
  canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = 'grayscale(1) contrast(1.4)';
  ctx.drawImage(src, 0, 0);
  return canvas;
}

export interface SurfaceTextures {
  map: THREE.Texture;
  bump: THREE.Texture;
}

function withBump(canvas: HTMLCanvasElement): SurfaceTextures {
  return { map: toTexture(canvas), bump: toTexture(grayscale(canvas), false) };
}

/**
 * Neutral asphalt granules. Tinted by the material color, so one texture
 * serves every shingle color.
 */
export function granules(size = 512): SurfaceTextures {
  const n = createNoise(61, 64);
  const grain = mulberry32(62);
  return withBump(
    paint(size, size, (x, y) => {
      const cloud = n(x / 40, y / 40, 3);
      const g = grain();
      const v = 222 + (cloud - 0.5) * 50 + (g - 0.5) * 70 + (g > 0.97 ? 30 : 0) - (g < 0.03 ? 70 : 0);
      return [v, v, v];
    }),
  );
}

/** TPO membrane with a faint calendered texture. */
export function membrane(size = 512): SurfaceTextures {
  const n = createNoise(91, 64);
  return withBump(
    paint(size, size, (x, y) => {
      const v = 245 + (n(x / 18, y / 18, 3) - 0.5) * 14;
      return [v, v, v];
    }),
  );
}

/** Synthetic underlayment over the decking, before the roof goes on. */
export function underlayment(size = 512): SurfaceTextures {
  const n = createNoise(101, 32);
  const base: Rgb = [70, 76, 84];
  const print: Rgb = [92, 99, 108];
  return withBump(
    paint(size, size, (x, y) => {
      const line = y % 64 < 2 ? 1 : 0;
      const c = mix(base, print, n(x / 30, y / 30, 3) * 0.5 + line * 0.6);
      return c;
    }),
  );
}

/** House wrap over the sheathing, before the siding goes on. */
export function houseWrap(size = 512): SurfaceTextures {
  const n = createNoise(111, 64);
  const base: Rgb = [236, 238, 240];
  const crease: Rgb = [206, 210, 216];
  const print: Rgb = [150, 170, 205];
  return withBump(
    paint(size, size, (x, y) => {
      const c = mix(base, crease, n(x / 14, y / 22, 4) * 0.8);
      // Faint printed band every half texture, like a house-wrap logo stripe.
      const band = (y % 256) > 120 && (y % 256) < 136 && (x % 128) < 84;
      return band ? mix(c, print, 0.55) : c;
    }),
  );
}

/** Embossed cedar-grain fiber cement lap board, tinted by the siding color. */
export function woodGrain(width = 1024, height = 128): SurfaceTextures {
  const n = createNoise(141, 64);
  const grain = mulberry32(142);
  return withBump(
    paint(width, height, (x, y) => {
      const streak = n(x / 90, y / 2.2, 4);
      const v = 236 + (streak - 0.5) * 34 + (grain() - 0.5) * 6;
      return [v, v, v];
    }),
  );
}

/** Red brick foundation with mortar joints. */
export function brick(width = 512, height = 256): SurfaceTextures {
  const n = createNoise(151, 32);
  const speck = mulberry32(152);
  const rows = 8;
  const rowH = height / rows;
  const brickW = width / 4;
  const mortar: Rgb = [196, 190, 180];
  const tones: Rgb[] = [
    [150, 72, 52],
    [132, 60, 44],
    [164, 84, 60],
    [120, 56, 42],
  ];
  return withBump(
    paint(width, height, (x, y) => {
      const row = Math.floor(y / rowH);
      const off = row % 2 ? brickW / 2 : 0;
      const col = Math.floor((x + off) / brickW);
      const inX = (x + off) % brickW;
      const inY = y % rowH;
      if (inX < 4 || inY < 4) return mortar;
      const tone = tones[(row * 7 + col * 3) % tones.length];
      const shade = (n(x / 12, y / 12, 3) - 0.5) * 40 + (speck() - 0.5) * 18;
      return [tone[0] + shade, tone[1] + shade * 0.6, tone[2] + shade * 0.5];
    }),
  );
}

/** Cool-season fescue lawn. */
export function grass(size = 512): SurfaceTextures {
  const n = createNoise(121, 64);
  const blade = mulberry32(122);
  const dark: Rgb = [62, 98, 48];
  const light: Rgb = [108, 142, 70];
  return withBump(
    paint(size, size, (x, y) => {
      const t = n(x / 24, y / 24, 4) * 0.6 + blade() * 0.4;
      return mix(dark, light, t);
    }),
  );
}

/** Broom-finish concrete for the driveway and walk. */
export function concrete(size = 512): SurfaceTextures {
  const n = createNoise(131, 64);
  const speck = mulberry32(132);
  const base: Rgb = [208, 204, 196];
  const dark: Rgb = [184, 180, 172];
  return withBump(
    paint(size, size, (x, y) => {
      const t = n((x / size) * 8, (y / size) * 8, 5);
      const c = mix(base, dark, t * 0.8);
      const s = (speck() - 0.5) * 10;
      return [c[0] + s, c[1] + s, c[2] + s];
    }),
  );
}
