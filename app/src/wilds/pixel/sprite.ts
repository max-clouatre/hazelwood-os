// Turns one of our flat SVG creatures into a small voxel mesh: sample to a 40x40 pixel grid, (the engine draws the ink outline from depth),
// inflate it into a pillow (thicker in the middle, so the top catches light), and mesh only the faces you can see.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Creature } from "../Creature";
import { stageFor } from "../game";
import { SPECIES_BY_ID } from "../species";
import type { Owned } from "../types";
import type * as T from "three";
import type { TH } from "./engine";

export const GRID = 40;
const SS = 4; // supersample so thin ink lines survive the shrink
export const spriteKey = (o: Owned) => [o.sp, stageFor(o.xp), o.seed, o.variant ?? "", o.branch ?? "", o.shiny ? 1 : 0].join("|");

/** Draw the creature and return RGBA of a GRID x GRID image (alpha already hardened to 0 or 255). */
export function rasterize(o: Owned): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const svg = renderToStaticMarkup(createElement(Creature, { species: SPECIES_BY_ID[o.sp], stage: stageFor(o.xp), shiny: o.shiny, variant: o.variant, branch: o.branch, seed: o.seed, personality: o.pers, className: "" }))
      .replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${GRID * SS}" height="${GRID * SS}" `);
    const img = new Image();
    img.onload = () => {
      const S = GRID * SS, big = document.createElement("canvas"); big.width = big.height = S;
      const g = big.getContext("2d")!; g.drawImage(img, 0, 0, S, S);
      const src = g.getImageData(0, 0, S, S).data, out = new Uint8ClampedArray(GRID * GRID * 4);
      for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
        let r = 0, gg = 0, b = 0, a = 0;
        for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const k = ((y * SS + j) * S + x * SS + i) * 4, al = src[k + 3]; r += src[k] * al; gg += src[k + 1] * al; b += src[k + 2] * al; a += al; }
        const o4 = (y * GRID + x) * 4;
        if (a / (SS * SS) > 120) { out[o4] = r / a; out[o4 + 1] = gg / a; out[o4 + 2] = b / a; out[o4 + 3] = 255; }
      }
      resolve(out);
    };
    img.onerror = () => reject(new Error("could not draw creature"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export interface SpriteGeo { geometry: T.BufferGeometry; height: number }

/** Voxel size in world units. */
export const U = 0.075;

export function buildSprite(THREE: TH, px: Uint8ClampedArray): SpriteGeo {
  const G = GRID, N = G * G;
  const body = new Uint8Array(N), ring = new Uint8Array(N);
  for (let i = 0; i < N; i++) body[i] = px[i * 4 + 3] ? 1 : 0;
  const at = (a: Uint8Array, x: number, y: number) => (x < 0 || y < 0 || x >= G || y >= G ? 0 : a[y * G + x]);
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) if (!body[y * G + x] && (at(body, x - 1, y) || at(body, x + 1, y) || at(body, x, y - 1) || at(body, x, y + 1))) ring[y * G + x] = 1;
  // distance from the edge (city block), then thickness grows toward the middle
  const dist = new Uint8Array(N);
  for (let i = 0; i < N; i++) dist[i] = body[i] ? 40 : 0;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { const i = y * G + x; if (dist[i]) dist[i] = Math.min(dist[i], (x ? dist[i - 1] : 0) + 1, (y ? dist[i - G] : 0) + 1); }
  for (let y = G - 1; y >= 0; y--) for (let x = G - 1; x >= 0; x--) { const i = y * G + x; if (dist[i]) dist[i] = Math.min(dist[i], (x < G - 1 ? dist[i + 1] : 0) + 1, (y < G - 1 ? dist[i + G] : 0) + 1); }
  const H = new Uint8Array(N);
  let minY = G, maxY = 0, minX = G, maxX = 0;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const i = y * G + x;
    if (body[i]) H[i] = Math.min(4, 1 + (dist[i] >> 1)); 
    if (H[i]) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
  }
  const solid = (x: number, y: number, z: number) => x >= 0 && y >= 0 && x < G && y < G && z >= 0 && z < H[y * G + x];
  const cx = (minX + maxX + 1) / 2;
  const pos: number[] = [], nor: number[] = [], col: number[] = [];
  const c = new THREE.Color();
  // corner offsets (0/1) for each face direction, counter-clockwise seen from outside
  const SHADE = [1, 0.88, 0.88, 1.12, 0.72]; // baked light: front as drawn, top lighter, sides darker
  const FACES: [number, number, number, number[][]][] = [
    [0, 0, 1, [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],   // +z (front, faces the camera)
    [1, 0, 0, [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]]],   // +x
    [-1, 0, 0, [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],  // -x
    [0, 1, 0, [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]],   // +y (up)
    [0, -1, 0, [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],  // -y
  ];
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const i = y * G + x; if (!H[i]) continue;
    // bake each face's light into a color that sits exactly on a palette step, so the post pass leaves sprites crisp (no dither grain)
    const shaded = SHADE.map((k) => { const snap = (v: number) => Math.round(Math.min(1, (v / 255) * k) * 7) / 7; c.setRGB(snap(px[i * 4]), snap(px[i * 4 + 1]), snap(px[i * 4 + 2]), THREE.SRGBColorSpace); return [c.r, c.g, c.b]; });
    for (let z = 0; z < H[i]; z++) for (let f = 0; f < FACES.length; f++) {
      const [dx, dy, dz, quad] = FACES[f];
      // world +y is up, pixel row y grows downward, so a world "up" face looks at row y-1
      if (solid(x + dx, y - dy, z + dz)) continue;
      const idx = [0, 1, 2, 0, 2, 3];
      for (const k of idx) {
        const q = quad[k];
        pos.push((x + q[0] - cx) * U, (maxY + 1 - (y + (1 - q[1]))) * U, (z + q[2] - 2) * U);
        nor.push(dx, dy, dz); col.push(shaded[f][0], shaded[f][1], shaded[f][2]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return { geometry: g, height: (maxY - minY + 1) * U };
}
