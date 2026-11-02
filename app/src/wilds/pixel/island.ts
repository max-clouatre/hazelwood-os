// The floating meadow island: one instanced mesh of boxes for everything that stands still, plus the numbers the
// walkers need (where the ground is, where they may walk, where the camp is).
import type * as T from "three";
import type { TH } from "./engine";

export const R = 5.6;
export const CAMP = { x: 3.3, z: 2.3 };
const POND = { x: 1.9, z: -2.3, r: 1.35 };
const WISH = { x: -2.6, z: 3.4 };
const TREES: [number, number][] = [[-4, -1.3], [-3.2, -3.4], [3.9, -2.8], [-0.6, -4.5]];
const hs = (x: number, z: number) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };

interface Box { x: number; y: number; z: number; sx: number; sy: number; sz: number; c: string }
const cells = new Map<string, number>(); // "x,z" -> height step (0..2); missing = no ground
const key = (x: number, z: number) => `${Math.round(x)},${Math.round(z)}`;
let built = false;
function layout() {
  if (built) return; built = true;
  for (let x = -7; x <= 7; x++) for (let z = -7; z <= 7; z++) {
    const d = Math.hypot(x, z); if (d > R + hs(x, z) * 0.7) continue;
    let h = 1 + (Math.sin(x * 0.7 + 1) + Math.cos(z * 0.6) > 1 ? 1 : 0);
    if (x <= -3 && z <= -1) h = 2;
    if (Math.hypot(x - POND.x, z - POND.z) < POND.r) h = 0;
    if (Math.hypot(x - CAMP.x, z - CAMP.z) < 2) h = 1;
    cells.set(`${x},${z}`, h);
  }
}
export const groundY = (x: number, z: number) => { layout(); const h = cells.get(key(x, z)); return h === undefined ? 0 : h * 0.5; };
export const isWater = (x: number, z: number) => { layout(); return cells.get(key(x, z)) === 0; };

const blocked = (x: number, z: number) =>
  Math.hypot(x - POND.x, z - POND.z) < POND.r + 0.7 || Math.hypot(x - CAMP.x, z - CAMP.z) < 1.6 || Math.hypot(x - WISH.x, z - WISH.z) < 1.2 || TREES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.9);
/** Places the creatures may stroll to. */
export function walkable(): [number, number][] {
  layout(); const out: [number, number][] = [];
  cells.forEach((_, k) => { const [x, z] = k.split(",").map(Number); if (Math.hypot(x, z) < R - 0.9 && !blocked(x, z)) out.push([x + (hs(x, z) - 0.5) * 0.5, z + (hs(z, x) - 0.5) * 0.5]); });
  return out;
}
/** Spots around the tent where workers stand. */
export const campSpots = (): [number, number][] => [[CAMP.x - 1.5, CAMP.z + 0.7], [CAMP.x - 0.2, CAMP.z + 1.6], [CAMP.x + 1.5, CAMP.z + 0.9], [CAMP.x - 1.3, CAMP.z - 0.9], [CAMP.x + 1.4, CAMP.z - 0.8], [CAMP.x + 0.2, CAMP.z - 1.7]];

export function buildIsland(THREE: TH, gradientMap: T.Texture) {
  layout();
  const boxes: Box[] = [];
  const add = (x: number, y: number, z: number, sx: number, sy: number, sz: number, c: string) => boxes.push({ x, y, z, sx, sy, sz, c });
  cells.forEach((h, k) => {
    const [x, z] = k.split(",").map(Number); const top = h * 0.5, water = h === 0;
    const bottom = -0.35;
    if (water) { add(x, (top + bottom) / 2, z, 1, top - bottom, 1, "#8a6a4a"); add(x, top - 0.08, z, 1, 0.3, 1, (x + z) % 2 ? "#4aa3df" : "#5cb4ec"); return; }
    add(x, (top - 0.25 + bottom) / 2, z, 1, top - 0.25 - bottom, 1, "#8a6a4a");
    add(x, top - 0.125, z, 1, 0.25, 1, (x + z) % 2 ? "#5fbf55" : "#6fcf62");
  });
  // the underside, a stack of shrinking rings
  for (let k = 1; k <= 5; k++) for (let x = -7; x <= 7; x++) for (let z = -7; z <= 7; z++) {
    if (Math.hypot(x, z) > R * (1 - 0.16 * k) + hs(x + k, z) * 0.6) continue;
    add(x, -0.35 - 0.7 * (k - 0.5), z, 1, 0.7, 1, k <= 2 ? "#8a6a4a" : (x + z) % 2 ? "#6b6485" : "#5b5478");
  }
  const top = (x: number, z: number) => groundY(x, z);
  // trees: trunk + three stacked crowns
  const tree = (x: number, z: number, s: number, crown: string, crown2: string) => {
    const y = top(x, z); add(x, y + 0.5 * s, z, 0.34 * s, 1.0 * s, 0.34 * s, "#7a4e2d");
    add(x, y + 1.2 * s, z, 1.5 * s, 0.7 * s, 1.5 * s, crown2); add(x, y + 1.8 * s, z, 1.15 * s, 0.6 * s, 1.15 * s, crown); add(x, y + 2.3 * s, z, 0.7 * s, 0.5 * s, 0.7 * s, crown);
  };
  TREES.forEach(([x, z], i) => tree(x, z, 1 - (i % 2) * 0.15, "#37b062", "#2f9e55"));
  tree(WISH.x, WISH.z, 1.35, "#f59ac0", "#e57aa8"); // the wishing tree
  // pond lily pad, flowers, rocks, mushrooms
  add(POND.x + 0.2, 0.0 + 0.1, POND.z - 0.1, 0.45, 0.06, 0.45, "#2f9e55"); add(POND.x + 0.2, 0.17, POND.z - 0.1, 0.14, 0.12, 0.14, "#f59ac0");
  const FL = ["#f27aa5", "#ffd23f", "#ffffff", "#7ab8ff"];
  cells.forEach((h, k) => {
    const [x, z] = k.split(",").map(Number); if (!h || blocked(x, z) || Math.hypot(x, z) > R - 0.6) return;
    const r = hs(x * 1.7, z * 2.3);
    const fx = x + (hs(z, x) - 0.5) * 0.6, fz = z + (hs(x, z + 5) - 0.5) * 0.6, y = top(x, z);
    if (r > 0.8) { add(fx, y + 0.12, fz, 0.06, 0.24, 0.06, "#2f9e55"); add(fx, y + 0.28, fz, 0.2, 0.16, 0.2, FL[Math.floor(r * 40) % 4]); }
    else if (r > 0.74) add(fx, y + 0.1, fz, 0.42, 0.28, 0.34, "#a5a0b8");
    else if (r < 0.05) { add(fx, y + 0.1, fz, 0.1, 0.2, 0.1, "#fff3d6"); add(fx, y + 0.24, fz, 0.32, 0.14, 0.32, "#e5534b"); }
  });
  // the camp: striped tent with a dark door, and a fire ring
  const cy = top(CAMP.x, CAMP.z), tx = CAMP.x, tz = CAMP.z;
  const stripe = ["#e5534b", "#fff3d6"];
  [[1.7, 0.45], [1.35, 0.4], [1.0, 0.4], [0.65, 0.35], [0.3, 0.3]].forEach(([w, hgt], i) => add(tx, cy + 0.22 + i * 0.4, tz, w, hgt, w, stripe[i % 2]));
  add(tx, cy + 0.05 + 0.3, tz + 0.88, 0.42, 0.6, 0.06, "#2b2540"); add(tx, cy + 2.3, tz, 0.06, 0.5, 0.06, "#7a4e2d"); add(tx + 0.18, cy + 2.45, tz, 0.3, 0.18, 0.04, "#f2b84b");
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; add(tx - 1.0 + Math.cos(a) * 0.32, cy + 0.07, tz + 1.5 + Math.sin(a) * 0.32, 0.16, 0.14, 0.16, "#8e8aa0"); }

  const mat = new THREE.MeshToonMaterial({ gradientMap });
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, boxes.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  boxes.forEach((b, i) => { o.position.set(b.x, b.y, b.z); o.scale.set(b.sx, b.sy, b.sz); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); mesh.setColorAt(i, c.set(b.c)); });
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return { mesh, fire: { x: tx - 1.0, y: cy + 0.2, z: tz + 1.5 }, wish: { x: WISH.x, y: top(WISH.x, WISH.z) + 2.6, z: WISH.z } };
}
