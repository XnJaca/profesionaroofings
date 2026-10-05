/** Two-story Maryland colonial with an attached flat-roof garage. Meters. */
export const HOUSE = {
  width: 10,
  depth: 7.6,
  wallHeight: 5.4,
  rise: 2.5,
  eaveOverhang: 0.4,
  rakeOverhang: 0.3,
  /** Brick foundation band; siding starts above it. */
  foundation: 0.6,
};

const run = HOUSE.depth / 2;
export const PITCH = Math.atan2(HOUSE.rise, run);
/** Slope plane size: width along the ridge, length from ridge to eave edge. */
export const SLOPE_WIDTH = HOUSE.width + HOUSE.rakeOverhang * 2;
export const SLOPE_LENGTH = (run + HOUSE.eaveOverhang) / Math.cos(PITCH);
export const RIDGE_Y = HOUSE.wallHeight + HOUSE.rise;
/** World height and depth of the eave edge (front slope; the back mirrors it). */
export const EAVE_Y = HOUSE.wallHeight - HOUSE.eaveOverhang * Math.tan(PITCH);
export const EAVE_Z = HOUSE.depth / 2 + HOUSE.eaveOverhang;

/** Attached garage with a flat roof, to the right of the house, set back a little. */
export const GARAGE = {
  x0: HOUSE.width / 2,
  x1: HOUSE.width / 2 + 4.4,
  depth: 6.6,
  height: 3.0,
  front: HOUSE.depth / 2 - 0.4,
};

export type Motion = 'drop' | 'roll' | 'press' | 'run';

export interface Piece {
  /** Layout-local position. Roof: x along the ridge, z down the slope. Wall: x along the wall, y up. */
  x: number;
  y: number;
  z: number;
  len: number;
  wid: number;
  h: number;
  order: number;
  tint: number;
  tiltX: number;
  tiltZ: number;
}

export interface Layout {
  pieces: Piece[];
  motion: Motion;
}

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const HALF_W = SLOPE_WIDTH / 2;

/** Architectural shingles: random-width laminated tabs, one course at a time from the eave. */
export function shingles(seed: number): Layout {
  const r = rng(seed);
  const exposure = 0.145;
  const courses = Math.floor((SLOPE_LENGTH - 0.12) / exposure);
  const pieces: Piece[] = [];
  for (let n = 0; n < courses; n++) {
    const bottom = SLOPE_LENGTH - n * exposure;
    let x = -HALF_W - r() * 0.2;
    while (x < HALF_W) {
      const len = 0.16 + r() * 0.26;
      const x0 = Math.max(x, -HALF_W);
      const x1 = Math.min(x + len, HALF_W);
      if (x1 - x0 > 0.03) {
        const h = 0.012 + (r() > 0.55 ? 0.006 : 0);
        pieces.push({
          x: (x0 + x1) / 2,
          z: bottom - exposure,
          y: n * 0.0009,
          len: x1 - x0 - 0.005,
          wid: exposure * 2,
          h,
          order: (n + ((x0 + HALF_W) / SLOPE_WIDTH) * 0.85) / courses,
          tint: 0.78 + r() * 0.36,
          tiltX: (r() - 0.5) * 0.5,
          tiltZ: (r() - 0.5) * 0.5,
        });
      }
      x += len;
    }
  }
  // Ridge cap along the top.
  for (let x = -HALF_W + 0.15; x < HALF_W; x += 0.3) {
    pieces.push({
      x, z: 0.11, y: courses * 0.0009 + 0.004, len: 0.3, wid: 0.24, h: 0.02,
      order: 1, tint: 0.9 + r() * 0.15, tiltX: 0, tiltZ: 0,
    });
  }
  return { pieces, motion: 'drop' };
}

/** TPO sheets rolled out across the garage roof. */
export function tpoSheets(): Layout {
  const width = GARAGE.x1 - GARAGE.x0 + 0.2;
  const depth = GARAGE.depth + 0.2;
  const sheet = 1.0;
  const count = Math.ceil(depth / sheet);
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    const z0 = -depth / 2 + i * sheet;
    const z1 = Math.min(z0 + sheet + 0.06, depth / 2);
    pieces.push({
      x: 0, z: (z0 + z1) / 2, y: i * 0.0015, len: width, wid: z1 - z0, h: 0.006,
      order: i / count, tint: 0.97 + (i % 2) * 0.03, tiltX: 0, tiltZ: 0,
    });
  }
  return { pieces, motion: 'roll' };
}

// ---------------------------------------------------------------- walls

export type OpeningKind = 'window' | 'door' | 'garage';

export interface Opening {
  /** Wall-local center x and bottom y. */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: OpeningKind;
  shutters?: boolean;
}

export interface Wall {
  id: string;
  /** World position of the wall plane's bottom center. */
  x: number;
  z: number;
  /** Rotation so local +z points out of the wall and local +x runs to the viewer's right. */
  rotY: number;
  width: number;
  y0: number;
  y1: number;
  /** Gable triangle above y1, peaking at the wall center. */
  gableRise?: number;
  openings: Opening[];
}

const d2 = HOUSE.depth / 2;
const floor1 = { y: 1.35, h: 1.55 };
const floor2 = { y: 3.55, h: 1.4 };
const sideWindows = (xs: number[]): Opening[] =>
  xs.flatMap((x) => [
    { x, y: floor1.y, w: 0.9, h: floor1.h, kind: 'window' as const },
    { x, y: floor2.y, w: 0.9, h: floor2.h, kind: 'window' as const },
  ]);

export const WALLS: Wall[] = [
  {
    id: 'front',
    x: 0,
    z: d2,
    rotY: 0,
    width: HOUSE.width,
    y0: HOUSE.foundation,
    y1: HOUSE.wallHeight,
    openings: [
      ...[-3.6, -1.6, 1.6, 3.6].map((x) => ({ x, y: floor1.y, w: 0.9, h: floor1.h, kind: 'window' as const, shutters: true })),
      ...[-3.6, -1.6, 0, 1.6, 3.6].map((x) => ({ x, y: floor2.y, w: 0.9, h: floor2.h, kind: 'window' as const, shutters: x !== 0 })),
      { x: 0, y: 0.75, w: 1.05, h: 2.25, kind: 'door' },
    ],
  },
  {
    id: 'left',
    x: -HOUSE.width / 2,
    z: 0,
    rotY: -Math.PI / 2,
    width: HOUSE.depth,
    y0: HOUSE.foundation,
    y1: HOUSE.wallHeight,
    gableRise: HOUSE.rise,
    openings: [...sideWindows([-1.7, 1.7]), { x: 0, y: HOUSE.wallHeight + 0.55, w: 0.7, h: 0.9, kind: 'window' }],
  },
  {
    id: 'right',
    x: HOUSE.width / 2,
    z: 0,
    rotY: Math.PI / 2,
    width: HOUSE.depth,
    y0: GARAGE.height,
    y1: HOUSE.wallHeight,
    gableRise: HOUSE.rise,
    openings: [
      { x: -1.7, y: floor2.y, w: 0.9, h: floor2.h, kind: 'window' },
      { x: 1.7, y: floor2.y, w: 0.9, h: floor2.h, kind: 'window' },
      { x: 0, y: HOUSE.wallHeight + 0.55, w: 0.7, h: 0.9, kind: 'window' },
    ],
  },
  {
    id: 'garage-front',
    x: (GARAGE.x0 + GARAGE.x1) / 2,
    z: GARAGE.front,
    rotY: 0,
    width: GARAGE.x1 - GARAGE.x0,
    y0: 0.3,
    y1: GARAGE.height,
    openings: [{ x: 0, y: 0, w: 3.2, h: 2.25, kind: 'garage' }],
  },
  {
    id: 'garage-side',
    x: GARAGE.x1,
    z: GARAGE.front - GARAGE.depth / 2,
    rotY: Math.PI / 2,
    width: GARAGE.depth,
    y0: 0.3,
    y1: GARAGE.height,
    openings: [{ x: 0.8, y: 1.15, w: 0.9, h: 1.2, kind: 'window' }],
  },
];

/** Casing width around openings; siding stops at the casing. */
export const CASING = 0.11;

/** Lap siding: 7" exposure boards in 12' lengths, staggered, trimmed around openings and gables. */
export function lapSiding(wall: Wall, seed: number): Layout {
  const r = rng(seed);
  const exposure = 0.178;
  const boardLen = 3.66;
  const top = wall.y1 + (wall.gableRise ?? 0);
  const courses = Math.ceil((top - wall.y0) / exposure);
  const pieces: Piece[] = [];
  const half = wall.width / 2;
  // Each board laps 3 cm over the course above it. Without a gable the wall ends
  // under the roof, so the top course is trimmed to stay below the roof plane.
  const cap = wall.gableRise ? Infinity : wall.y1 - 0.01;
  for (let n = 0; n < courses; n++) {
    const yb = wall.y0 + n * exposure;
    const yt = yb + exposure;
    if (yb >= top - 0.05) break;
    const yTop = Math.min(yt + 0.03, cap);
    if (yTop - yb < 0.04) break;
    // Gable: the course narrows toward the peak.
    let reach = half;
    if (wall.gableRise && yt > wall.y1) reach = half * Math.max(0, 1 - (yt - wall.y1) / wall.gableRise);
    if (reach < 0.08) continue;
    // Free intervals after cutting out openings.
    let spans: [number, number][] = [[-reach, reach]];
    for (const o of wall.openings) {
      if (yb >= o.y + o.h + CASING || yt <= o.y - CASING) continue;
      const a = o.x - o.w / 2 - CASING;
      const b = o.x + o.w / 2 + CASING;
      spans = spans.flatMap(([s, e]) => {
        const out: [number, number][] = [];
        if (a > s) out.push([s, Math.min(a, e)]);
        if (b < e) out.push([Math.max(b, s), e]);
        return out.filter(([p, q]) => q - p > 0.02);
      });
    }
    const stagger = r() * boardLen;
    for (const [s, e] of spans) {
      let x = s - stagger;
      while (x < e) {
        const x0 = Math.max(x, s);
        const x1 = Math.min(x + boardLen, e);
        if (x1 - x0 > 0.02) {
          pieces.push({
            x: (x0 + x1) / 2,
            y: (yb + yTop) / 2,
            z: 0,
            len: x1 - x0 - 0.004,
            wid: yTop - yb,
            h: 0.02,
            order: (n + ((x0 + half) / wall.width) * 0.6) / courses,
            tint: 0.94 + r() * 0.1,
            tiltX: 0,
            tiltZ: (r() - 0.5) * 0.3,
          });
        }
        x += boardLen;
      }
    }
  }
  return { pieces, motion: 'press' };
}

/** Seamless K-style gutters along the eaves plus downspouts, in world space. */
export function gutters(): Layout {
  const pieces: Piece[] = [];
  const size = 0.18;
  const run = (x0: number, x1: number, y: number, z: number, order0: number, order1: number) => {
    const segs = 8;
    const seg = (x1 - x0) / segs;
    for (let i = 0; i < segs; i++) {
      pieces.push({
        x: x0 + seg * (i + 0.5), y, z, len: seg + 0.002, wid: size, h: size,
        order: order0 + ((order1 - order0) * i) / segs, tint: 1, tiltX: 0, tiltZ: 0,
      });
    }
  };
  const spout = (x: number, z: number, yTop: number, order: number) => {
    // A vertical run, encoded with len/wid as the section and h as the height.
    pieces.push({ x, y: yTop / 2, z, len: 0.1, wid: 0.1, h: yTop, order, tint: 0.96, tiltX: 1, tiltZ: 0 });
  };
  const gy = EAVE_Y - 0.1;
  const gz = EAVE_Z + 0.1;
  run(-HALF_W, HALF_W, gy, gz, 0, 0.5);
  run(-HALF_W, HALF_W, gy, -gz, 0.05, 0.55);
  run(GARAGE.x0, GARAGE.x1 + 0.1, GARAGE.height + 0.02, GARAGE.front + 0.12, 0.4, 0.75);
  spout(-HALF_W + 0.2, gz, gy, 0.6);
  spout(HALF_W - 0.25, gz, gy, 0.65);
  spout(GARAGE.x1 - 0.05, GARAGE.front + 0.12, GARAGE.height, 0.85);
  return { pieces, motion: 'run' };
}

/** Downspout outlets, for storm runoff once gutters are installed. */
export const OUTLETS: [number, number][] = [
  [-HALF_W + 0.2, EAVE_Z + 0.1],
  [HALF_W - 0.25, EAVE_Z + 0.1],
  [GARAGE.x1 - 0.05, GARAGE.front + 0.12],
];
