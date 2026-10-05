import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  CASING,
  EAVE_Y,
  EAVE_Z,
  GARAGE,
  HOUSE,
  OUTLETS,
  PITCH,
  RIDGE_Y,
  SLOPE_LENGTH,
  SLOPE_WIDTH,
  WALLS,
  gutters,
  lapSiding,
  shingles,
  tpoSheets,
  type Layout,
  type Wall,
} from './layouts';
import * as tex from './textures';

export type LayerKey = 'siding' | 'shingle' | 'gutters' | 'tpo';

/** Install order for the guided first run; each layer waits for its prerequisite. */
const ORDER: LayerKey[] = ['siding', 'shingle', 'gutters', 'tpo'];
const PREREQ: Record<LayerKey, LayerKey | null> = { siding: null, shingle: 'siding', gutters: 'shingle', tpo: 'shingle' };
const SPEED: Record<LayerKey, number> = { siding: 0.3, shingle: 0.34, gutters: 0.6, tpo: 0.55 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Per-instance UV window so repeated pieces sample different parts of a texture. */
function surfaceMaterial(surface: tex.SurfaceTextures, opts: THREE.MeshStandardMaterialParameters & { bumpScale: number }) {
  const material = new THREE.MeshStandardMaterial({ map: surface.map, bumpMap: surface.bump, ...opts });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aUvT;')
      .replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
#ifdef USE_MAP
  vMapUv = vMapUv * aUvT.zw + aUvT.xy;
#endif
#ifdef USE_BUMPMAP
  vBumpMapUv = vBumpMapUv * aUvT.zw + aUvT.xy;
#endif`,
      );
  };
  return material;
}

interface Group {
  layout: Layout;
  mesh: THREE.InstancedMesh;
}

interface Layer {
  key: LayerKey;
  groups: Group[];
  material: THREE.MeshStandardMaterial;
  value: number;
  shown: number;
  color: THREE.Color;
  extras: THREE.Object3D[];
}

export interface HomeScene {
  select(key: LayerKey): void;
  setColor(key: LayerKey, hex: string): void;
  scrub(value: number | null): void;
  onProgress(cb: (value: number) => void): void;
  /** Fires when the guided first run moves the focus to another layer. */
  onActive(cb: (key: LayerKey) => void): void;
  playStorm(): void;
  onStorm(cb: (progress: number, active: boolean) => void): void;
  dispose(): void;
}

export function createHomeScene(canvas: HTMLCanvasElement, host: HTMLElement): HomeScene {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 767px)').matches;
  const instant = reduced || new URLSearchParams(location.search).has('still');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 220);

  // Mid-Atlantic afternoon: clear sun, cool sky fill, green bounce from the lawn.
  const hemi = new THREE.HemisphereLight(0xcfe0f0, 0x5a7448, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.3);
  sun.position.set(15, 17, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 70 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  sun.target.position.set(2, 0, 0);
  scene.add(sun, sun.target);

  const world = new THREE.Group();
  scene.add(world);

  const add = <T extends THREE.Mesh>(mesh: T, parent: THREE.Object3D = world, cast = true) => {
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const box = (m: THREE.Material | THREE.Material[], w: number, h: number, d: number, x: number, y: number, z: number, parent: THREE.Object3D = world) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    return add(mesh, parent);
  };

  // Materials
  const wrapTex = tex.houseWrap();
  wrapTex.map.repeat.set(4, 3);
  wrapTex.bump.repeat.set(4, 3);
  const wrap = new THREE.MeshStandardMaterial({ map: wrapTex.map, bumpMap: wrapTex.bump, bumpScale: 0.5, roughness: 0.8, side: THREE.DoubleSide });
  const brickTex = tex.brick();
  brickTex.map.repeat.set(5, 0.6);
  brickTex.bump.repeat.set(5, 0.6);
  const brick = new THREE.MeshStandardMaterial({ map: brickTex.map, bumpMap: brickTex.bump, bumpScale: 1.2, roughness: 0.9 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xf2f1ec, roughness: 0.55 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x2b3946, roughness: 0.06, metalness: 0.5, envMapIntensity: 1.5 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.6 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e3a6e, roughness: 0.45 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a45c, roughness: 0.3, metalness: 0.9 });
  const under = tex.underlayment();
  under.map.repeat.set(4, 2);
  const deckTop = new THREE.MeshStandardMaterial({ map: under.map, roughness: 0.85 });
  const concreteTex = tex.concrete();
  concreteTex.map.repeat.set(3, 3);
  const concrete = new THREE.MeshStandardMaterial({ map: concreteTex.map, roughness: 0.9 });

  const d2 = HOUSE.depth / 2;
  const cx = (GARAGE.x0 + GARAGE.x1) / 2;
  const gWidth = GARAGE.x1 - GARAGE.x0;
  const gz = GARAGE.front - GARAGE.depth / 2;

  // Ground: lawn fading into the page, driveway, walk and steps.
  const lawnTex = tex.grass();
  lawnTex.map.repeat.set(16, 16);
  lawnTex.bump.repeat.set(16, 16);
  const fade = document.createElement('canvas');
  fade.width = fade.height = 256;
  const fctx = fade.getContext('2d')!;
  const grad = fctx.createRadialGradient(128, 128, 60, 128, 128, 128);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(1, '#000');
  fctx.fillStyle = grad;
  fctx.fillRect(0, 0, 256, 256);
  const lawn = new THREE.Mesh(
    new THREE.CircleGeometry(25, 64),
    new THREE.MeshStandardMaterial({
      map: lawnTex.map,
      bumpMap: lawnTex.bump,
      bumpScale: 1.2,
      roughness: 1,
      alphaMap: new THREE.CanvasTexture(fade),
      transparent: true,
    }),
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(2, 0, 2);
  add(lawn, world, false);
  box(concrete, 3.8, 0.04, 9, cx, 0.02, GARAGE.front + 4.5);
  box(concrete, 1.2, 0.04, 4.6, 0, 0.02, d2 + 3.4);
  box(concrete, 2.0, 0.25, 1.15, 0, 0.125, d2 + 0.55);
  box(concrete, 1.7, 0.25, 0.75, 0, 0.375, d2 + 0.38);
  box(concrete, 1.6, 0.25, 0.45, 0, 0.625, d2 + 0.23);

  // House body (house wrap until the siding goes on), brick foundation and gables.
  box(wrap, HOUSE.width, HOUSE.wallHeight, HOUSE.depth, 0, HOUSE.wallHeight / 2, 0);
  box(brick, HOUSE.width + 0.1, HOUSE.foundation, HOUSE.depth + 0.1, 0, HOUSE.foundation / 2, 0);
  const gable = new THREE.BufferGeometry();
  gable.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, HOUSE.wallHeight, -d2, 0, HOUSE.wallHeight, d2, 0, RIDGE_Y, 0], 3),
  );
  gable.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 3, 0, 1.5, 0.9], 2));
  gable.computeVertexNormals();
  for (const x of [-HOUSE.width / 2, HOUSE.width / 2]) {
    const g = new THREE.Mesh(gable, wrap);
    g.position.x = x;
    add(g);
  }

  // Garage body and foundation.
  box(wrap, gWidth, GARAGE.height, GARAGE.depth, cx, GARAGE.height / 2, gz);
  box(brick, gWidth + 0.08, 0.3, GARAGE.depth + 0.08, cx, 0.15, gz);

  // Corner boards.
  const corner = (x: number, z: number, y0: number, y1: number) => box(trim, 0.13, y1 - y0 - 0.03, 0.13, x, (y0 + y1 - 0.03) / 2, z);
  for (const [x, z] of [[-HOUSE.width / 2, d2], [HOUSE.width / 2, d2], [-HOUSE.width / 2, -d2], [HOUSE.width / 2, -d2]]) {
    corner(x, z, HOUSE.foundation, HOUSE.wallHeight);
  }
  corner(GARAGE.x1, GARAGE.front, 0.3, GARAGE.height);
  corner(GARAGE.x1, GARAGE.front - GARAGE.depth, 0.3, GARAGE.height);

  // Wall groups: local +z points out of the wall.
  const wallGroups = new Map<string, THREE.Group>();
  for (const wall of WALLS) {
    const g = new THREE.Group();
    g.position.set(wall.x, 0, wall.z);
    g.rotation.y = wall.rotY;
    world.add(g);
    wallGroups.set(wall.id, g);
  }

  // Openings: windows with colonial grids, the front door and the garage door.
  function windowAt(wall: Wall, x: number, y: number, w: number, h: number, shutters?: boolean) {
    const g = wallGroups.get(wall.id)!;
    const cy = y + h / 2;
    box(glass, w, h, 0.02, x, cy, 0.0, g);
    // Casing sits proud of the siding.
    box(trim, w + CASING * 2, CASING, 0.06, x, y + h + CASING / 2, 0.05, g);
    box(trim, w + CASING * 2 + 0.08, CASING * 0.8, 0.12, x, y - CASING * 0.4, 0.07, g);
    box(trim, CASING, h, 0.06, x - w / 2 - CASING / 2, cy, 0.05, g);
    box(trim, CASING, h, 0.06, x + w / 2 + CASING / 2, cy, 0.05, g);
    // Sash grid.
    box(trim, w, 0.05, 0.03, x, cy, 0.025, g);
    for (const k of [-1, 1]) {
      box(trim, 0.025, h, 0.02, x + (k * w) / 6, cy, 0.02, g);
      box(trim, w, 0.025, 0.02, x, cy + (k * h) / 4, 0.02, g);
    }
    if (shutters) {
      for (const k of [-1, 1]) box(shutterMat, 0.34, h + 0.1, 0.04, x + k * (w / 2 + CASING + 0.2), cy, 0.06, g);
    }
  }
  for (const wall of WALLS) {
    const g = wallGroups.get(wall.id)!;
    for (const o of wall.openings) {
      if (o.kind === 'window') windowAt(wall, o.x, o.y, o.w, o.h, o.shutters);
      else if (o.kind === 'door') {
        const cy = o.y + o.h / 2;
        box(doorMat, o.w, o.h, 0.06, o.x, cy, 0.0, g);
        for (const k of [-1, 1]) {
          box(trim, 0.16, o.h + 0.1, 0.08, o.x + k * (o.w / 2 + 0.08), cy + 0.05, 0.05, g);
          box(trim, 0.3, 0.3, 0.1, o.x + k * (o.w / 2 + 0.08), o.y + 0.15, 0.06, g);
        }
        box(trim, o.w + 0.6, 0.22, 0.2, o.x, o.y + o.h + 0.2, 0.08, g);
        box(trim, o.w + 0.75, 0.06, 0.26, o.x, o.y + o.h + 0.33, 0.1, g);
        box(glass, o.w - 0.1, 0.22, 0.02, o.x, o.y + o.h - 0.2, 0.04, g);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), brass);
        knob.position.set(o.x + o.w / 2 - 0.14, o.y + 1.0, 0.07);
        add(knob, g);
      } else {
        const cy = o.y + o.h / 2;
        box(new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.9 }), o.w, o.h, 0.02, o.x, cy, 0.0, g);
        for (let i = 0; i < 4; i++) box(trim, o.w - 0.08, o.h / 4 - 0.04, 0.05, o.x, o.y + (o.h / 4) * (i + 0.5), 0.03, g);
        for (let i = 0; i < 4; i++) box(glass, 0.5, 0.22, 0.02, o.x - 1.05 + i * 0.7, o.y + o.h - 0.3, 0.06, g);
        box(trim, o.w + CASING * 2, CASING, 0.06, o.x, o.y + o.h + CASING / 2, 0.05, g);
        for (const k of [-1, 1]) box(trim, CASING, o.h, 0.06, o.x + k * (o.w / 2 + CASING / 2), cy, 0.05, g);
      }
    }
  }

  // Branding: a contractor yard sign on the lawn.
  const logo = new Image();
  logo.src = '/logo-mark.png';
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 700;
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  signTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const drawSign = () => {
    const g = signCanvas.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 1024, 700);
    // Isotype, then the name as real type so it stays legible at a distance.
    const w = 360;
    const h = (logo.height / logo.width) * w;
    g.drawImage(logo, 512 - w / 2, 48, w, h);
    g.textAlign = 'center';
    g.fillStyle = '#1e3a6e';
    g.font = '700 84px Poppins, Arial, sans-serif';
    g.fillText('Professional', 512, 300);
    g.fillText('Construction', 512, 388);
    g.fillStyle = '#1e3a6e';
    g.fillRect(0, 470, 1024, 230);
    g.fillStyle = '#ffffff';
    g.font = '700 128px Poppins, Arial, sans-serif';
    g.fillText('703-881-2291', 512, 630);
    signTex.needsUpdate = true;
  };
  // Wait for both the image and Poppins, otherwise the canvas falls back to Arial.
  Promise.all([
    logo.decode().catch(() => undefined),
    document.fonts?.load('700 84px Poppins').catch(() => undefined),
  ]).then(drawSign);
  const sign = new THREE.Group();
  sign.position.set(-2.9, 0, d2 + 4.2);
  sign.rotation.y = 0.5;
  sign.scale.setScalar(1.9);
  const stakeMat = new THREE.MeshStandardMaterial({ color: 0x2b2d2e, roughness: 0.5, metalness: 0.6 });
  for (const x of [-0.42, 0.42]) {
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.25), stakeMat);
    stake.position.set(x, 0.62, -0.04);
    add(stake, sign);
  }
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.82, 0.03),
    [0, 1, 2, 3, 4, 5].map((i) =>
      i === 4 ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.55 }) : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }),
    ),
  );
  board.position.y = 1.0;
  add(board, sign);
  world.add(sign);

  // Landscaping: shade trees and boxwoods.
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 0.95 });
  const leafMats = [0x4e7a3a, 0x5d8a43, 0x46703a].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }));
  const shrubMat = new THREE.MeshStandardMaterial({ color: 0x35582c, roughness: 0.95, flatShading: true });
  function tree(x: number, z: number, height: number, spread: number, seed: number) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, height * 0.62, 9), barkMat);
    trunk.position.y = height * 0.31;
    add(trunk, g);
    let s = seed;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 7; i++) {
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(spread * (0.55 + r() * 0.35), 1), leafMats[i % leafMats.length]);
      const a = (i / 7) * Math.PI * 2;
      blob.position.set(Math.cos(a) * spread * 0.55 * r(), height * (0.62 + r() * 0.3), Math.sin(a) * spread * 0.55 * r());
      add(blob, g);
    }
    world.add(g);
  }
  tree(-8.6, 3.2, 7.2, 2.2, 7);
  tree(-6.8, -5.8, 8.6, 2.6, 11);
  tree(12.6, -2.4, 6.6, 2.0, 13);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36 + (i % 3) * 0.05, 1), shrubMat);
      s.position.set(side * (1.35 + i * 0.6), 0.3, d2 + 0.45);
      s.scale.y = 0.85;
      add(s);
    }
  }

  // Roof framing: decks with underlayment on top, fascia and barge boards on the edges.
  const slopes = [new THREE.Group(), new THREE.Group()];
  slopes.forEach((slope, i) => {
    const holder = new THREE.Group();
    holder.position.y = RIDGE_Y;
    holder.rotation.y = i === 0 ? 0 : Math.PI;
    slope.rotation.x = PITCH;
    holder.add(slope);
    world.add(holder);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(SLOPE_WIDTH, 0.14, SLOPE_LENGTH), [trim, trim, deckTop, trim, trim, trim]);
    deck.position.set(0, -0.07, SLOPE_LENGTH / 2);
    add(deck, slope);
    const fascia = box(trim, SLOPE_WIDTH + 0.02, 0.24, 0.05, 0, -0.11, SLOPE_LENGTH + 0.02, slope);
    fascia.rotation.x = -PITCH;
    for (const side of [-1, 1]) {
      box(trim, 0.05, 0.26, SLOPE_LENGTH + 0.03, side * (SLOPE_WIDTH / 2 + 0.025), -0.1, SLOPE_LENGTH / 2, slope);
    }
  });

  // Garage flat roof deck and drip edge.
  box(new THREE.MeshStandardMaterial({ color: 0x8e959b, roughness: 0.9 }), gWidth + 0.2, 0.1, GARAGE.depth + 0.2, cx, GARAGE.height + 0.05, gz);
  box(trim, gWidth + 0.24, 0.16, 0.04, cx, GARAGE.height + 0.02, GARAGE.front + 0.12);
  box(trim, 0.04, 0.16, GARAGE.depth + 0.24, GARAGE.x1 + 0.12, GARAGE.height + 0.02, gz);

  // Layers
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const rand = (seed: number) => {
    let s = seed;
    return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  };

  function makeGroup(layout: Layout, material: THREE.Material, parent: THREE.Object3D, uvScale: [number, number], seed: number): Group {
    const g = unitBox.clone();
    const r = rand(seed);
    const uv = new Float32Array(layout.pieces.length * 4);
    layout.pieces.forEach((p, i) => uv.set([r(), r(), p.len / uvScale[0], p.wid / uvScale[1]], i * 4));
    g.setAttribute('aUvT', new THREE.InstancedBufferAttribute(uv, 4));
    const mesh = new THREE.InstancedMesh(g, material, layout.pieces.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    const color = new THREE.Color();
    layout.pieces.forEach((p, i) => {
      mesh.setColorAt(i, color.setScalar(p.tint));
      mesh.setMatrixAt(i, hidden);
    });
    parent.add(mesh);
    return { layout, mesh };
  }

  const shingleMat = surfaceMaterial(tex.granules(), { color: 0x4a4b4d, roughness: 0.95, bumpScale: 1.6 });
  const sidingMat = surfaceMaterial(tex.woodGrain(), { color: 0x7d7c74, roughness: 0.7, bumpScale: 0.9 });
  const tpoMat = surfaceMaterial(tex.membrane(), { color: 0xf1f2f0, roughness: 0.55, bumpScale: 0.2 });
  const gutterMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.35, metalness: 0.15 });

  const garageRoof = new THREE.Group();
  garageRoof.position.set(cx, GARAGE.height + 0.1, gz);
  world.add(garageRoof);

  const layers: Record<LayerKey, Layer> = {
    siding: {
      key: 'siding',
      material: sidingMat,
      groups: WALLS.map((w, i) => makeGroup(lapSiding(w, 31 + i), sidingMat, wallGroups.get(w.id)!, [3.66, 0.45], 41 + i)),
      value: 0, shown: -1, color: new THREE.Color(0x7d7c74), extras: [],
    },
    shingle: {
      key: 'shingle',
      material: shingleMat,
      groups: slopes.map((s, i) => makeGroup(shingles(11 + i), shingleMat, s, [0.6, 0.6], 3 + i)),
      value: 0, shown: -1, color: new THREE.Color(0x4a4b4d), extras: [],
    },
    gutters: {
      key: 'gutters',
      material: gutterMat,
      groups: [makeGroup(gutters(), gutterMat, world, [1, 1], 19)],
      value: 0, shown: -1, color: new THREE.Color(0xf4f4f2), extras: [],
    },
    tpo: {
      key: 'tpo',
      material: tpoMat,
      groups: [makeGroup(tpoSheets(), tpoMat, garageRoof, [1.2, 1.2], 17)],
      value: 0, shown: -1, color: new THREE.Color(0xf1f2f0), extras: [],
    },
  };

  const m4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const scl = new THREE.Vector3();
  const LAP = -0.07;

  function poseLayer(layer: Layer) {
    if (Math.abs(layer.value - layer.shown) < 1e-4) return;
    layer.shown = layer.value;
    const v = layer.value;
    for (const { layout, mesh } of layer.groups) {
      mesh.visible = v > 0;
      layout.pieces.forEach((p, i) => {
        const t = clamp01((v * 1.25 - p.order) / 0.25);
        if (t <= 0) {
          mesh.setMatrixAt(i, hidden);
          return;
        }
        const e = easeOutCubic(t);
        const air = instant ? 0 : 1 - e;
        if (layout.motion === 'roll') {
          const len = p.len * Math.max(e, 0.001);
          pos.set(-p.len / 2 + len / 2, p.y + p.h / 2, p.z);
          quat.identity();
          scl.set(len, p.h, p.wid);
        } else if (layout.motion === 'press') {
          // Lap siding swings in from the yard and seats against the wall.
          pos.set(p.x, p.y + air * 0.35, 0.012 + p.h / 2 + air * 0.9);
          euler.set(LAP, air * 0.5, p.tiltZ * air);
          quat.setFromEuler(euler);
          const k = 0.85 + 0.15 * e;
          scl.set(p.len * k, p.wid, p.h);
        } else if (layout.motion === 'run') {
          quat.identity();
          if (p.tiltX === 1) {
            // Downspouts grow down from the gutter.
            const h = Math.max(p.h * e, 0.001);
            pos.set(p.x, p.y + p.h / 2 - h / 2, p.z);
            scl.set(p.len, h, p.wid);
          } else {
            const len = Math.max(p.len * e, 0.001);
            pos.set(p.x - p.len / 2 + len / 2, p.y + air * 0.25, p.z);
            scl.set(len, p.h, p.wid);
          }
        } else {
          pos.set(p.x, p.y + p.h / 2 + air * 1.3, p.z);
          euler.set(p.tiltX * air, 0, p.tiltZ * air);
          quat.setFromEuler(euler);
          const k = 0.6 + 0.4 * e;
          scl.set(p.len * k, p.h * k, p.wid * k);
        }
        m4.compose(pos, quat, scl);
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    layer.extras.forEach((x) => (x.visible = v > 0.97));
  }

  // Coach lights by the door and the garage.
  const lanternGlass = new THREE.MeshStandardMaterial({ color: 0xfff0d2, emissive: 0xffc777, emissiveIntensity: 1.5 });
  const lanternFrame = new THREE.MeshStandardMaterial({ color: 0x23272a, roughness: 0.4, metalness: 0.6 });
  const lantern = (x: number, y: number, z: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    box(lanternFrame, 0.2, 0.05, 0.2, 0, 0.19, 0.1, g);
    box(lanternGlass, 0.15, 0.3, 0.15, 0, 0.02, 0.1, g);
    box(lanternFrame, 0.06, 0.4, 0.04, 0, 0, 0.02, g);
    world.add(g);
    const light = new THREE.PointLight(0xffc777, 1.2, 2.6, 1.6);
    light.position.set(x, y, z + 0.35);
    world.add(light);
  };
  lantern(-0.95, 2.35, d2 + 0.06);
  lantern(0.95, 2.35, d2 + 0.06);
  lantern(cx - 2.0, 2.0, GARAGE.front + 0.06);
  lantern(cx + 2.0, 2.0, GARAGE.front + 0.06);

  // Storm timelapse: rain, runoff off bare eaves or out of the downspouts, lightning, then sun.
  const STORM_SECONDS = 12;
  const rainCount = small ? 2600 : 6500;
  const rainBox = { x0: -15, x1: 19, y0: 0, y1: 26, z0: -13, z1: 17 };
  const wind = new THREE.Vector3(-0.22, -1, 0.12).normalize();
  const dropLen = 0.55;
  const rainPos = new Float32Array(rainCount * 6);
  const rainSeed = new Float32Array(rainCount * 3);
  const rr = rand(91);
  for (let i = 0; i < rainCount; i++) {
    rainSeed[i * 3] = rainBox.x0 + rr() * (rainBox.x1 - rainBox.x0);
    rainSeed[i * 3 + 1] = rainBox.y0 + rr() * (rainBox.y1 - rainBox.y0);
    rainSeed[i * 3 + 2] = rainBox.z0 + rr() * (rainBox.z1 - rainBox.z0);
  }
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xc9d9e6, transparent: true, opacity: 0, depthWrite: false });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  rain.visible = false;
  scene.add(rain);

  const dripCount = small ? 300 : 600;
  const dripPos = new Float32Array(dripCount * 3);
  /** life, side (front/back), mode (0 eave, 1 outlet), x jitter */
  const dripState = new Float32Array(dripCount * 4);
  for (let i = 0; i < dripCount; i++) dripState[i * 4] = rr();
  const dripGeo = new THREE.BufferGeometry();
  dripGeo.setAttribute('position', new THREE.BufferAttribute(dripPos, 3));
  const dripMat = new THREE.PointsMaterial({ color: 0xdbe8f2, size: 0.1, transparent: true, opacity: 0, depthWrite: false });
  const drips = new THREE.Points(dripGeo, dripMat);
  drips.frustumCulled = false;
  drips.visible = false;
  scene.add(drips);

  function respawnDrip(i: number) {
    const guttered = layers.gutters.value > 0.95;
    dripState[i * 4 + 1] = Math.random() < 0.5 ? 1 : -1;
    dripState[i * 4 + 2] = guttered ? 1 : 0;
    dripState[i * 4 + 3] = guttered ? Math.floor(Math.random() * OUTLETS.length) : -SLOPE_WIDTH / 2 + Math.random() * SLOPE_WIDTH;
  }
  for (let i = 0; i < dripCount; i++) respawnDrip(i);

  const flashLight = new THREE.DirectionalLight(0xdfe8ff, 0);
  flashLight.position.set(-8, 22, 6);
  scene.add(flashLight);

  const wetMats = [shingleMat, sidingMat, tpoMat, gutterMat].map((m) => ({ m, rough: m.roughness }));
  const wrapBase = wrap.color.clone();
  const lawnMat = lawn.material as THREE.MeshStandardMaterial;
  const lawnBase = lawnMat.color.clone();
  const sunBase = sun.intensity;
  const hemiSky = hemi.color.clone();
  const stormSky = new THREE.Color(0x6f7e8c);
  let stormT = -1;
  let stormCb: ((p: number, active: boolean) => void) | null = null;

  const smooth = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const pulse = (t: number, at: number) => (t > at ? Math.exp(-(t - at) * 9) : 0);

  // `?stormAt=seconds` freezes the timelapse at that moment, for screenshots.
  const frozenStorm = Number(new URLSearchParams(location.search).get('stormAt') ?? NaN);
  if (!Number.isNaN(frozenStorm)) stormT = frozenStorm;

  function stepStorm(dt: number) {
    if (stormT < 0) return;
    if (Number.isNaN(frozenStorm)) stormT += dt;
    const t = stormT;
    const dark = smooth(0, 1.6, t) * (1 - smooth(9.4, 11.6, t));
    const rainAmt = smooth(1.2, 3, t) * (1 - smooth(8, 9.6, t));
    const wet = smooth(2, 4.6, t) * (1 - smooth(9.8, 12, t));
    const flash = Math.min(1, pulse(t, 3.6) + pulse(t, 3.85) * 0.8 + pulse(t, 6.3) + pulse(t, 6.42) * 0.6);

    sun.intensity = sunBase * (1 - 0.85 * dark);
    hemi.color.copy(hemiSky).lerp(stormSky, dark);
    hemi.intensity = 0.55 - 0.2 * dark + flash * 1.6;
    flashLight.intensity = flash * 6;
    renderer.toneMappingExposure = 0.95 - 0.17 * dark;

    wetMats.forEach(({ m, rough }) => (m.roughness = rough * (1 - 0.7 * wet)));
    wrap.color.copy(wrapBase).multiplyScalar(1 - 0.12 * wet);
    lawnMat.color.copy(lawnBase).multiplyScalar(1 - 0.22 * wet);

    rain.visible = rainAmt > 0.01;
    rainMat.opacity = rainAmt * 0.55;
    if (rain.visible) {
      const fall = 26;
      for (let i = 0; i < rainCount; i++) {
        let y = rainSeed[i * 3 + 1] - fall * dt;
        let x = rainSeed[i * 3] + wind.x * fall * dt;
        let z = rainSeed[i * 3 + 2] + wind.z * fall * dt;
        if (y < rainBox.y0) {
          y += rainBox.y1 - rainBox.y0;
          x = rainBox.x0 + Math.random() * (rainBox.x1 - rainBox.x0);
          z = rainBox.z0 + Math.random() * (rainBox.z1 - rainBox.z0);
        }
        rainSeed[i * 3] = x;
        rainSeed[i * 3 + 1] = y;
        rainSeed[i * 3 + 2] = z;
        const o = i * 6;
        rainPos[o] = x;
        rainPos[o + 1] = y;
        rainPos[o + 2] = z;
        rainPos[o + 3] = x - wind.x * dropLen;
        rainPos[o + 4] = y - wind.y * dropLen;
        rainPos[o + 5] = z - wind.z * dropLen;
      }
      rainGeo.attributes.position.needsUpdate = true;
    }

    const runoff = smooth(2.6, 4.4, t) * (1 - smooth(9, 10.6, t));
    drips.visible = runoff > 0.01;
    dripMat.opacity = runoff * 0.9;
    if (drips.visible) {
      for (let i = 0; i < dripCount; i++) {
        let life = dripState[i * 4] + dt * 1.6;
        if (life > 1) {
          life -= 1;
          respawnDrip(i);
        }
        dripState[i * 4] = life;
        if (dripState[i * 4 + 2] === 1) {
          // Out of a downspout, kicked away from the foundation.
          const [ox, oz] = OUTLETS[dripState[i * 4 + 3]];
          dripPos[i * 3] = ox + (Math.random() - 0.5) * 0.05;
          dripPos[i * 3 + 1] = Math.max(0.02, 0.25 - life * life * 0.4);
          dripPos[i * 3 + 2] = oz + 0.05 + life * 0.7;
        } else {
          // Off the bare eave, straight down onto the beds by the foundation.
          dripPos[i * 3] = dripState[i * 4 + 3];
          dripPos[i * 3 + 1] = EAVE_Y - life * life * EAVE_Y;
          dripPos[i * 3 + 2] = dripState[i * 4 + 1] * (EAVE_Z + life * 0.2);
        }
      }
      dripGeo.attributes.position.needsUpdate = true;
    }

    host.style.setProperty('--storm', dark.toFixed(3));
    host.style.setProperty('--flash', flash.toFixed(3));

    const done = t >= STORM_SECONDS;
    stormCb?.(Math.min(1, t / STORM_SECONDS), !done);
    if (done) {
      stormT = -1;
      rain.visible = drips.visible = false;
    }
  }

  // Ambient occlusion grounds the house: contact shadows under eaves, casings and shrubs.
  let composer: EffectComposer | null = null;
  if (!small) {
    // The composer renders off-screen, which skips the canvas' own antialiasing;
    // a multisampled target keeps edges smooth.
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    const gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1.4, thickness: 1.2, scale: 1.2, samples: 16 });
    gtao.blendIntensity = 0.8;
    composer.addPass(gtao);
    composer.addPass(new OutputPass());
  }

  // State
  let current: LayerKey = instant ? 'shingle' : 'siding';
  let guided = !instant;
  let scrubbing: number | null = null;
  let progressCb: ((v: number) => void) | null = null;
  let activeCb: ((k: LayerKey) => void) | null = null;
  const speedScale = instant ? 100 : 1;

  if (instant) for (const k of ORDER) layers[k].value = 1;

  function ready(k: LayerKey) {
    const pre = PREREQ[k];
    return !pre || layers[pre].value >= 1;
  }

  function step(dt: number) {
    // Hold the guided install until the stage is properly in view.
    if (!started) return;
    for (const k of ORDER) {
      const layer = layers[k];
      if (k === current && scrubbing !== null) layer.value += (scrubbing - layer.value) * Math.min(1, dt * 12);
      else if (k === current || ready(k)) layer.value = Math.min(1, layer.value + dt * SPEED[k] * speedScale);
    }
    if (guided) {
      const next = ORDER.find((k) => layers[k].value < 1);
      const focus = next ?? 'shingle';
      if (!next) guided = false;
      if (focus !== current) {
        current = focus;
        activeCb?.(current);
      }
    }
    for (const layer of Object.values(layers)) {
      layer.material.color.lerp(layer.color, Math.min(1, dt * 8));
      poseLayer(layer);
    }
    progressCb?.(layers[current].value);
  }

  // Camera: one framing per layer, with drag-to-orbit and pointer drift.
  type View = { target: THREE.Vector3; radius: number; height: number; azimuth: number };
  const views: Record<LayerKey, View> = {
    siding: { target: new THREE.Vector3(0.6, 3.2, 0.5), radius: 27, height: 7, azimuth: 0.42 },
    shingle: { target: new THREE.Vector3(1.8, 4.4, 0.2), radius: 32, height: 16, azimuth: 0.55 },
    gutters: { target: new THREE.Vector3(-1, 3.6, 2.8), radius: 21, height: 8, azimuth: -0.38 },
    tpo: { target: new THREE.Vector3(cx - 0.6, 3, gz), radius: 18, height: 15, azimuth: 0.9 },
  };
  const start = views[current];
  const cam = { target: start.target.clone(), radius: start.radius, height: start.height, azimuth: start.azimuth };
  let orbit = 0;
  let orbitTarget = 0;
  const pointer = new THREE.Vector2();
  const pointerEased = new THREE.Vector2();

  function updateCamera(dt: number) {
    const v = views[current];
    const k = Math.min(1, dt * 2.2);
    cam.target.lerp(v.target, k);
    cam.radius += (v.radius - cam.radius) * k;
    cam.height += (v.height - cam.height) * k;
    cam.azimuth += (v.azimuth - cam.azimuth) * k;
    orbit += (orbitTarget - orbit) * Math.min(1, dt * 6);
    pointerEased.lerp(pointer, 0.04);
    const a = cam.azimuth + orbit + pointerEased.x * 0.04;
    // Portrait screens need more distance to keep the whole house in frame.
    const radius = cam.radius * (camera.aspect < 1 ? 1.35 : 1);
    camera.position.set(cam.target.x + Math.sin(a) * radius, cam.height + pointerEased.y * 0.4, cam.target.z + Math.cos(a) * radius);
    camera.lookAt(cam.target);
  }

  let drag: { x: number; orbit: number } | null = null;
  const onDown = (e: PointerEvent) => {
    drag = { x: e.clientX, orbit: orbitTarget };
  };
  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1));
    }
    if (drag) orbitTarget = Math.max(-1.0, Math.min(0.9, drag.orbit - ((e.clientX - drag.x) / rect.width) * 2.4));
  };
  const onUp = () => (drag = null);
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp);

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 42 : 30;
    camera.updateProjectionMatrix();
  }

  let last = performance.now();
  let raf = 0;
  let visible = true;
  let started = instant;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    stepStorm(dt);
    updateCamera(dt);
    if (composer) composer.render();
    else renderer.render(scene, camera);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.45) started = true;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    },
    { threshold: [0, 0.45] },
  );
  io.observe(host);
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  raf = requestAnimationFrame(loop);

  return {
    select(key) {
      guided = false;
      layers[key].value = Math.min(layers[key].value, 0.001);
      current = key;
      scrubbing = null;
    },
    setColor(key, hex) {
      layers[key].color.set(hex);
    },
    scrub(value) {
      guided = false;
      scrubbing = value;
    },
    onProgress(cb) {
      progressCb = cb;
    },
    onActive(cb) {
      activeCb = cb;
    },
    playStorm() {
      stormT = 0;
    },
    onStorm(cb) {
      stormCb = cb;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
    },
  };
}
