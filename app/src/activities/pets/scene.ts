// The room: a cosy cutaway room in the PS1 look (small render, 15-bit colour with dither, vertex snapping, flat low-poly shapes).
// The pet lives here: wanders, eats, fetches a ball, takes a bubble bath, naps in its bed, does tricks, and reacts when tapped.
import type * as T from "three";
import { Stage } from "../../wilds/pixel/engine";
import type { TH } from "../../wilds/pixel/engine";
import { bark, crunch, meow, pop, purr } from "../../lib/petsound";
import { THEMES } from "./data";
import type { PetTraits } from "./data";
import { PetRig } from "./rig";
import type { Anim } from "./rig";

export interface RoomOpts {
  traits: PetTraits; theme: string; accessory: string; mood: () => number; night: () => number;
  onPat?: () => void; onFed?: () => void; onPlayed?: () => void; onBathed?: (full: boolean) => void; onRested?: (full: boolean) => void; onTrick?: (name: string) => void;
  onScrub?: (n: number, need: number) => void; onBusy?: (task: string) => void;
}
type Mode = Anim["mode"];
export const SCRUBS = 6; // pats it takes to get the suds on
const BOUND = 3.5, BOWL = { x: -3.1, z: 2.2 }, TUB = { x: 2.7, z: 2.6 }, BED = { x: 3.1, z: -3.4 };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
type Step = { k: "walk"; x: number; z: number; run?: boolean } | { k: "anim"; mode: Mode; t: number; spin?: boolean; enter?: () => void } | { k: "call"; fn: () => void } | { k: "scrub" } | { k: "sleep" };
export type Task = "feed" | "fetch" | "bath" | "nap" | "trick" | null;

export interface Room {
  feed(): boolean; play(): void; stopPlay(): void; throwBall(clientX: number, clientY: number): boolean; bath(): boolean; scrub(): void; nap(): boolean; wake(): void; trick(): boolean; patPet(): void;
  setTheme(id: string): void; setAccessory(id: string): void; resize(w: number, h: number): void; setActive(on: boolean): void; screenOf(): { x: number; y: number };
  stats(): { fps: number; w: number; h: number; mode: string; task: Task; x: number; z: number; dim: number; acc: string; theme: string; scrubs: number; awaitingThrow: boolean; suds: number; flies: number; chases: number };
  dispose(): void;
}

export function createRoom(THREE: TH, canvas: HTMLCanvasElement, w: number, h: number, o: RoomOpts): Room {
  const stage = new Stage(THREE, canvas, w, h, { palette: true, outline: false, dither: true }, { levels: 32 }); // 32 steps per channel = 15-bit colour
  const scene = stage.scene; const bgDay = new THREE.Color("#2a2540"), bgNight = new THREE.Color("#120f26"); scene.background = bgDay.clone(); stage.frame(4.6);
  const amb = new THREE.AmbientLight(0xffffff, 0.95), sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(5, 9, 6); scene.add(amb, sun);
  const mats = new Map<string, T.Material>();
  const mat = (hex: string) => { let m = mats.get(hex); if (!m) { m = stage.ps1(new THREE.MeshLambertMaterial({ color: hex, flatShading: true })); mats.set(hex, m); } return m; };
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, hex: string, parent: T.Object3D) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat(hex)); m.position.set(x, y, z); parent.add(m); return m; };

  // ---- the yard: a sunny garden with a fence, a tree to nap under, flowers, a wading pool and butterflies the pet chases
  type Fly = { g: T.Group; wl: T.Mesh; wr: T.Mesh; ph: number; cx: number; cz: number };
  let flies: Fly[] = []; let sunObj: T.Object3D = new THREE.Group(); let chases = 0; let chasing = false; let tNow = 0;
  const buildYard = (g: T.Group, t: (typeof THEMES)[number]) => {
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) box(1, 0.2, 1, i, -0.1, j, (i + j) % 2 ? t.floorA : t.floorB, g);
    for (let n = 0; n <= 16; n++) { const k = -4.4 + n * 0.55; box(0.36, 1.3, 0.12, k, 0.65, -4.65, t.wain, g); box(0.12, 1.3, 0.36, -4.65, 0.65, k, t.wain, g); }      // fence pickets (back and left)
    for (const y of [0.4, 0.95]) { box(9.8, 0.14, 0.1, 0, y, -4.76, t.wall, g); box(0.1, 0.14, 9.8, -4.76, y, 0, t.wall, g); }                                        // fence rails
    sunObj = new THREE.Group(); sunObj.position.set(-4.4, 3.2, 0.2); g.add(sunObj); box(0.2, 0.7, 0.7, 0, 0, 0, "#ffd23f", sunObj); box(0.12, 0.3, 0.3, 0.02, 0, 0, "#fff3b0", sunObj);
    moon = new THREE.Group(); moon.position.set(-4.4, 3.0, -1.4); g.add(moon); box(0.12, 0.5, 0.5, 0, 0, 0, "#fff3b0", moon); box(0.1, 0.1, 0.1, 0, 0.3, 0.6, "#fff3b0", moon); box(0.1, 0.1, 0.1, 0, -0.1, 1.1, "#fff3b0", moon);
    glass = box(0.05, 0.05, 0.05, 0, -3, 0, "#ffffff", g); glass.visible = false;                                                                                      // (the room's window colour hook; unused in the yard)
    box(3.2, 0.05, 2.2, 0.3, 0.03, 0.2, t.rug2, g); box(2.8, 0.06, 1.8, 0.3, 0.05, 0.2, t.rug, g);                                                                     // picnic blanket with checks
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) box(0.5, 0.02, 0.5, -0.9 + i * 0.55, 0.1, -0.3 + j * 0.55, t.rug2, g);
    box(1.8, 0.35, 1.2, BED.x, 0.17, BED.z - 0.1, t.bed, g); box(1.5, 0.2, 0.95, BED.x, 0.42, BED.z - 0.1, t.bed2, g);                                                // cushion under the tree
    box(0.5, 2.0, 0.5, 4.1, 1.0, -4.1, "#8a5a2e", g); box(2.6, 0.9, 2.6, 3.6, 2.3, -3.9, "#3dbb55", g); box(1.8, 0.8, 1.8, 3.6, 3.0, -3.9, "#58cf6d", g); box(1.5, 0.7, 1.5, 2.9, 2.0, -3.6, "#3dbb55", g);
    for (const [ax, ay, az] of [[2.6, 2.5, -2.6], [3.4, 2.1, -2.55], [4.6, 2.6, -3.3]]) box(0.2, 0.2, 0.2, ax, ay, az, "#e5534b", g);                                       // apples
    box(1.5, 0.7, 0.9, -2.4, 0.35, -4.15, "#3dbb55", g); box(1.1, 0.4, 0.7, -2.4, 0.8, -4.15, "#58cf6d", g);                                                           // bush
    for (const [fx, fz, c] of [[-4.2, -3.2, "#f59ac0"], [-4.1, -2.5, "#ffd23f"], [-4.3, -0.9, "#ffffff"], [-4.2, 1.5, "#f59ac0"], [-4.1, 3.0, "#ffd23f"], [-3.3, -4.25, "#ffffff"], [-1.0, -4.3, "#f59ac0"], [0.5, -4.3, "#ffd23f"], [1.7, -4.3, "#ffffff"]] as [number, number, string][]) {
      box(0.06, 0.4, 0.06, fx, 0.2, fz, "#3dbb55", g); box(0.24, 0.14, 0.24, fx, 0.46, fz, c, g); box(0.1, 0.1, 0.1, fx, 0.54, fz, c === "#ffd23f" ? "#e5736b" : "#ffd23f", g);
    }
    box(0.8, 0.2, 0.8, BOWL.x, 0.1, BOWL.z, "#e5534b", g); box(0.62, 0.05, 0.62, BOWL.x, 0.22, BOWL.z, "#b8412e", g);                                                   // bowl
    food = box(0.46, 0.14, 0.46, BOWL.x, 0.3, BOWL.z, "#a8693a", g); food.visible = false;
    box(1.7, 0.45, 1.2, TUB.x, 0.22, TUB.z, "#ff8fb8", g); box(1.4, 0.1, 0.9, TUB.x, 0.47, TUB.z, "#5ec8f0", g); box(1.3, 0.04, 0.8, TUB.x, 0.54, TUB.z, "#bfe9ff", g);    // wading pool for the bath
    box(0.3, 0.22, 0.3, TUB.x - 0.3, 0.62, TUB.z, "#ffd23f", g); box(0.14, 0.08, 0.12, TUB.x - 0.5, 0.6, TUB.z, "#ff8a3a", g);                                         // rubber duck
    ballRest = box(0.26, 0.26, 0.26, 1.9, 0.14, 3.3, "#3fa7e0", g);
    ([["#ff8fb8", 0, -1.5, 0.5], ["#ffd23f", 2.1, 1.5, -1.5], ["#8fd0f0", 4.2, 0, 2.0]] as [string, number, number, number][]).forEach(([c, ph, cx, cz]) => {
      const f = new THREE.Group(); g.add(f); box(0.06, 0.06, 0.22, 0, 0, 0, "#25222c", f); const wl = box(0.26, 0.03, 0.2, -0.14, 0.03, 0, c, f), wr = box(0.26, 0.03, 0.2, 0.14, 0.03, 0, c, f); flies.push({ g: f, wl, wr, ph, cx, cz });
    });
  };

  // ---- the room (rebuilt when the theme changes)
  let roomG: T.Group | null = null; let food: T.Mesh, ballRest: T.Mesh; let moon: T.Object3D; let glass: T.Mesh; let theme = THEMES.find((t) => t.id === o.theme) ?? THEMES[0];
  const buildRoom = () => {
    if (roomG) { scene.remove(roomG); roomG.traverse((c) => { const m = c as T.Mesh; if (m.geometry) m.geometry.dispose(); }); }
    const g = new THREE.Group(); roomG = g; scene.add(g); const t = theme;
    bgDay.set(t.yard ? t.sky ?? "#8fd0f0" : "#2a2540"); bgNight.set(t.yard ? t.skyNight ?? "#14183a" : "#120f26"); flies = []; sunObj = new THREE.Group(); g.add(sunObj);
    if (t.yard) { buildYard(g, t); return; }
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) box(1, 0.2, 1, i, -0.1, j, (i + j) % 2 ? t.floorA : t.floorB, g);
    box(0.3, 3.4, 9.6, -4.65, 1.6, 0, t.wall, g); box(9.6, 3.4, 0.3, 0, 1.6, -4.65, t.wall2, g); box(0.34, 1.0, 9.6, -4.65, 0.5, 0, t.wain, g); box(9.6, 1.0, 0.34, 0, 0.5, -4.65, t.wain, g);
    glass = box(0.1, 1.3, 1.8, -4.45, 2.2, -1.2, "#cfe8ff", g); box(0.16, 1.5, 2.0, -4.52, 2.2, -1.2, "#a8693a", g); box(0.1, 1.3, 0.08, -4.44, 2.2, -1.2, "#a8693a", g);
    moon = new THREE.Group(); moon.position.set(-4.4, 2.5, -1.7); g.add(moon); box(0.12, 0.34, 0.34, 0, 0, 0, "#fff3b0", moon); box(0.1, 0.1, 0.1, 0, -0.2, 0.55, "#fff3b0", moon); box(0.1, 0.1, 0.1, 0, 0.15, 0.9, "#fff3b0", moon);
    box(3.2, 0.05, 2.2, 0.3, 0.03, 0.2, t.rug2, g); box(2.8, 0.06, 1.8, 0.3, 0.05, 0.2, t.rug, g);                                                    // rug
    box(1.8, 0.35, 1.2, BED.x, 0.17, BED.z - 0.1, t.bed, g); box(1.5, 0.2, 0.95, BED.x, 0.42, BED.z - 0.1, t.bed2, g);                                  // bed
    box(0.8, 0.2, 0.8, BOWL.x, 0.1, BOWL.z, "#e5534b", g); box(0.62, 0.05, 0.62, BOWL.x, 0.22, BOWL.z, "#b8412e", g);                                    // bowl
    food = box(0.46, 0.14, 0.46, BOWL.x, 0.3, BOWL.z, "#a8693a", g); food.visible = false;
    box(1.5, 0.55, 1.0, TUB.x, 0.27, TUB.z, "#ffffff", g); box(1.2, 0.1, 0.7, TUB.x, 0.56, TUB.z, "#8fd0f0", g); box(1.6, 0.1, 1.1, TUB.x, 0.6, TUB.z, "#e8e4f2", g); box(1.2, 0.04, 0.7, TUB.x, 0.64, TUB.z, "#bfe9ff", g); // bubble-bath tub
    ballRest = box(0.26, 0.26, 0.26, 1.9, 0.14, 3.3, "#3fa7e0", g);                                                                                        // toy ball
    box(0.5, 0.5, 0.5, -3.9, 0.25, -3.9, "#a8693a", g); for (let i = 0; i < 3; i++) box(0.2, 0.8 + i * 0.25, 0.2, -3.9 + (i - 1) * 0.18, 0.85 + i * 0.12, -3.9, "#3dbb55", g); // plant
    box(0.9, 0.14, 0.4, -4.4, 1.9, 2.6, "#a8693a", g); box(0.4, 0.3, 0.3, -4.4, 2.14, 2.6, "#f59ac0", g);                                              // shelf
  };
  buildRoom();

  const rig = new PetRig(THREE, o.traits, mat); const PS = 1.75; rig.group.scale.setScalar(PS); scene.add(rig.group); rig.height *= PS; rig.setAccessory(o.accessory);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.75 * o.traits.size * PS, 8), new THREE.MeshBasicMaterial({ color: 0x1a1226, transparent: true, opacity: 0.35 })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; scene.add(sh);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), mat("#3fa7e0")); ball.visible = false; scene.add(ball); // the ball you throw

  // ---- particles: hearts, bubbles, crumbs, z's
  const MAXP = 56; const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), MAXP); pm.frustumCulled = false; scene.add(pm);
  const zero = new THREE.Matrix4().makeScale(0, 0, 0); const dummy = new THREE.Object3D(), pc = new THREE.Color();
  for (let i = 0; i < MAXP; i++) { pm.setMatrixAt(i, zero); pm.setColorAt(i, pc.set("#ffffff")); }
  const parts: { x: number; y: number; z: number; vx: number; vz: number; vy: number; life: number; max: number; s: number }[] = [];
  const emit = (n: number, color: string, y0: number, spread = 0.3, up = 1.1) => { for (let i = 0; i < n && parts.length < MAXP; i++) { const idx = parts.length; parts.push({ x: pet.x + rnd(-spread, spread), y: y0, z: pet.z + rnd(-spread, spread), vx: rnd(-0.3, 0.3), vz: rnd(-0.3, 0.3), vy: rnd(up * 0.7, up * 1.2), life: 0, max: rnd(0.9, 1.6), s: rnd(0.12, 0.22) }); pm.setColorAt(idx, pc.set(color)); } if (pm.instanceColor) pm.instanceColor.needsUpdate = true; };

  // ---- the pet's brain: free wandering, or a task made of steps
  const pet = { x: 0.5, z: 0.5, heading: 0.6, mode: "idle" as Mode, t: rnd(0.5, 1.5), tx: 0, tz: 0, wandering: false, phase: 0 };
  let task: Task = null; let steps: Step[] = []; let cur: Step | null = null; let stepT = 0; let scrubs = 0; let awaitingThrow = false; let throwsLeft = 0; let slept = 0; let curRun = false; let wakeEarly = false;
  const sound = () => (o.traits.sound === "bark" ? bark() : meow());
  const start = (name: Task, s: Step[]) => { task = name; steps = s; cur = null; pet.wandering = false; scrubs = 0; };
  const endTask = () => { task = null; steps = []; cur = null; pet.mode = "idle"; pet.t = rnd(1, 2.5); rig.setBall(false); rig.setSuds(0); };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.2), hit = new THREE.Vector3();

  const walkStep = (s: Extract<Step, { k: "walk" }>, dt: number): boolean => {
    const dx = s.x - pet.x, dz = s.z - pet.z, d = Math.hypot(dx, dz); pet.mode = "walk"; curRun = !!s.run;
    if (d < 0.14) return true;
    const sp = (s.run ? 2.6 : 1.25) * dt; const st = Math.min(d, sp); pet.x += (dx / d) * st; pet.z += (dz / d) * st;
    const want = Math.atan2(dx, dz); let diff = want - pet.heading; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI; pet.heading += diff * Math.min(1, dt * 8); return false;
  };
  const faceTo = (x: number, z: number) => { pet.heading = Math.atan2(x - pet.x, z - pet.z); };
  const run = (dt: number) => {
    if (!cur) { cur = steps.shift() ?? null; stepT = 0; if (!cur) { endTask(); return; }
      if (cur.k === "call") { cur.fn(); cur = null; return; }
      if (cur.k === "anim") { pet.mode = cur.mode; cur.enter?.(); }
      if (cur.k === "scrub") pet.mode = "sit"; if (cur.k === "sleep") { pet.mode = "sleep"; slept = 0; wakeEarly = false; } }
    const s = cur; stepT += dt;
    if (s.k === "walk") { if (walkStep(s, dt)) cur = null; return; }
    if (s.k === "anim") { pet.mode = s.mode; pet.phase = Math.min(1, stepT / s.t); if (s.spin) pet.heading += dt * (Math.PI * 2 / s.t); if (stepT >= s.t) cur = null; return; }
    if (s.k === "scrub") { pet.mode = "sit"; if (Math.random() < dt * 5) emit(1, Math.random() < 0.5 ? "#ffffff" : "#bfe9ff", 1.0 + rnd(0, 0.8), 0.5, 0.6); if (scrubs >= SCRUBS || stepT > 40) { if (scrubs < SCRUBS) scrubs = -1; cur = null; } return; }
    if (s.k === "sleep") { pet.mode = "sleep"; slept += dt; if (Math.random() < dt * 0.9) emit(1, "#cdd6ff", rig.height * 0.8, 0.2, 0.5); if (slept > 24 || wakeEarly) cur = null; return; }
  };

  let accNow = o.accessory; let yaw = Math.PI / 4, active = true, raf = 0, last = 0, fps = 0, fpsN = 0, fpsT = 0, dim = 0, throwT = -1, throwFrom = { x: 0, z: 0 };
  const v3 = new THREE.Vector3(); const ballPos = { x: 1.9, z: 3.3 };
  const frame = (ts: number) => {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden) { last = ts; return; }
    const dtRaw = (ts - last) / 1000; if (dtRaw < 1 / 31) return; const dt = Math.min(dtRaw, 0.1); last = ts;
    // behaviour: a task, or wandering
    if (task) run(dt);
    else if (pet.mode === "happy") { pet.t -= dt; if (pet.t <= 0) { pet.mode = "idle"; pet.t = rnd(1.2, 3); } }
    else {
      pet.t -= dt;
      if (pet.mode === "idle" && pet.t <= 0) {
        chasing = false; if (flies.length && dim < 0.3 && Math.random() < 0.45) { const fp = flies[Math.floor(Math.random() * flies.length)].g.position; pet.tx = Math.max(-BOUND, Math.min(BOUND, fp.x)); pet.tz = Math.max(-BOUND, Math.min(BOUND, fp.z)); chasing = true; } else { pet.tx = rnd(-BOUND, BOUND); pet.tz = rnd(-BOUND, BOUND); }
        pet.wandering = true; pet.mode = "walk"; }
      if (pet.mode === "walk" && pet.wandering && walkStep({ k: "walk", x: pet.tx, z: pet.tz }, dt)) { pet.mode = "idle"; pet.t = rnd(1.5, 4); pet.wandering = false; if (chasing) { chasing = false; chases += 1; emit(2, "#ff5d8f", rig.height * 0.85); } }
    }
    pet.x = Math.max(-BOUND - 0.4, Math.min(BOUND + 0.4, pet.x)); pet.z = Math.max(-BOUND - 0.4, Math.min(BOUND + 0.4, pet.z));
    rig.group.position.x = pet.x; rig.group.position.z = pet.z; rig.group.rotation.y = pet.heading; sh.position.x = pet.x; sh.position.z = pet.z;
    const anim: Anim = { mode: pet.mode, mood: o.mood(), phase: pet.phase }; rig.update(dt * (pet.mode === "walk" && curRun ? 1.9 : 1), anim); sh.scale.setScalar(1 - Math.min(0.3, rig.group.position.y));
    // thrown ball: a little arc, then it rests where it landed
    if (throwT >= 0) { throwT += dt / 0.7; const k = Math.min(1, throwT); ball.position.set(throwFrom.x + (ballPos.x - throwFrom.x) * k, 0.2 + Math.sin(k * Math.PI) * 2.2 * (1 - k * 0.3), throwFrom.z + (ballPos.z - throwFrom.z) * k); if (k >= 1) { throwT = -1; ball.position.y = 0.2; } }
    // light: dim at night and when napping (smoothly)
    const dimTarget = Math.max(o.night() * 0.55, pet.mode === "sleep" ? 0.65 : 0); dim += (dimTarget - dim) * Math.min(1, dt * 2.5);
    amb.intensity = 0.95 - dim * 0.5; sun.intensity = 1.5 - dim * 1.0; (scene.background as T.Color).copy(bgDay).lerp(bgNight, Math.min(1, dim * 1.5)); moon.visible = dim > 0.25; (glass.material as T.MeshLambertMaterial).color.set(dim > 0.25 ? "#1b2a52" : "#cfe8ff");
    // yard life: the sun by day, the moon at night, butterflies drifting about (they sleep at night)
    tNow += dt; sunObj.visible = dim <= 0.25;
    for (const f of flies) { f.g.visible = dim < 0.3; f.g.position.set(Math.max(-3.7, Math.min(3.7, f.cx + Math.sin(tNow * 0.5 + f.ph) * 2.2)), 1.3 + Math.sin(tNow * 1.7 + f.ph) * 0.35, Math.max(-3.7, Math.min(3.7, f.cz + Math.cos(tNow * 0.37 + f.ph * 1.3) * 1.8))); f.g.rotation.y = tNow * 0.9 + f.ph; f.wl.rotation.z = Math.sin(tNow * 20 + f.ph) * 0.9; f.wr.rotation.z = -f.wl.rotation.z; }
    // particles
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life += dt; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt; if (p.life >= p.max) parts.splice(i, 1); }
    for (let i = 0; i < MAXP; i++) { const p = parts[i]; if (!p) { pm.setMatrixAt(i, zero); continue; } const s = p.s * (1 - (p.life / p.max) * 0.6); dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, yaw, 0); dummy.scale.set(s, s, s); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix); }
    pm.instanceMatrix.needsUpdate = true;
    stage.orbit(yaw, 0, 1.1, 0, 0.62, 40); stage.render();
    fpsN++; fpsT += dt; if (fpsT >= 1) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
  };
  raf = requestAnimationFrame(frame);

  const busy = (): boolean => { if (task) { o.onBusy?.(task); return true; } return false; };
  const hearts = (n = 6) => emit(n, "#ff5d8f", rig.height * 0.85);
  return {
    feed() {
      if (busy()) return false; ballRest.visible = true; food.visible = true; pop();
      start("feed", [{ k: "walk", x: BOWL.x + 1.05, z: BOWL.z + 0.3 }, { k: "call", fn: () => { faceTo(BOWL.x, BOWL.z); } }, { k: "anim", mode: "eat", t: 3.2, enter: () => { crunch(); window.setTimeout(crunch, 600); window.setTimeout(crunch, 1200); window.setTimeout(crunch, 1800); window.setTimeout(crunch, 2400); } },
        { k: "call", fn: () => { food.visible = false; hearts(6); sound(); o.onFed?.(); } }, { k: "anim", mode: "happy", t: 1.3 }]); return true;
    },
    play() { if (busy()) return; awaitingThrow = true; throwsLeft = 5; pop(); },
    stopPlay() { awaitingThrow = false; },
    throwBall(cx: number, cy: number) {
      if (!awaitingThrow || task) return false;
      const r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -(((cy - r.top) / r.height) * 2 - 1)); raycaster.setFromCamera(ndc, stage.camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return false;
      const tx = Math.max(-BOUND, Math.min(BOUND, hit.x)), tz = Math.max(-BOUND, Math.min(BOUND, hit.z));
      throwFrom = { x: 3.9, z: 3.9 }; ballPos.x = tx; ballPos.z = tz; ball.visible = true; ballRest.visible = false; throwT = 0; pop();
      throwsLeft -= 1; awaitingThrow = false;
      start("fetch", [{ k: "anim", mode: "idle", t: 0.5 }, { k: "walk", x: tx, z: tz, run: true }, { k: "call", fn: () => { ball.visible = false; rig.setBall(true); } },
        { k: "walk", x: 1.4, z: 1.8, run: true }, { k: "call", fn: () => { rig.setBall(false); ball.visible = true; ballPos.x = pet.x + 0.7; ballPos.z = pet.z + 0.5; ball.position.set(ballPos.x, 0.2, ballPos.z); hearts(6); sound(); o.onPlayed?.(); } },
        { k: "anim", mode: "happy", t: 1.4 }, { k: "call", fn: () => { awaitingThrow = throwsLeft > 0; } }]); return true;
    },
    bath() {
      if (busy()) return false; pop(); awaitingThrow = false; rig.setSuds(0);
      start("bath", [{ k: "walk", x: TUB.x - 0.2, z: TUB.z + 1.0 }, { k: "call", fn: () => { faceTo(TUB.x, TUB.z); } }, { k: "scrub" },
        { k: "call", fn: () => { const full = scrubs >= SCRUBS; rig.setSuds(0); emit(9, "#8fd0f0", 1.0, 0.5, 1.4); pop(); o.onBathed?.(full); } }, { k: "anim", mode: "shake", t: 1.2 }, { k: "call", fn: () => { hearts(6); sound(); } }, { k: "anim", mode: "happy", t: 1.2 }]); return true;
    },
    scrub() {
      if (task !== "bath" || !cur || cur.k !== "scrub" || scrubs >= SCRUBS) return; scrubs += 1; rig.setSuds(Math.ceil((scrubs / SCRUBS) * 7)); emit(4, "#ffffff", rig.height * 0.7, 0.4, 0.8); pop(); o.onScrub?.(scrubs, SCRUBS);
    },
    nap() {
      if (busy()) return false; awaitingThrow = false; ballRest.visible = true;
      start("nap", [{ k: "walk", x: BED.x, z: BED.z + 0.1 }, { k: "call", fn: () => { pet.heading = Math.PI; } }, { k: "sleep" }, { k: "call", fn: () => { o.onRested?.(!wakeEarly); purr(); } }, { k: "anim", mode: "happy", t: 1.0 }]); return true;
    },
    wake() { if (task === "nap") wakeEarly = true; },
    trick() {
      if (busy()) return false; awaitingThrow = false; const pick = ["sit", "spin", "jump"][Math.floor(Math.random() * 3)];
      const s: Step = pick === "sit" ? { k: "anim", mode: "sit", t: 2.4 } : pick === "spin" ? { k: "anim", mode: "walk", t: 1.3, spin: true } : { k: "anim", mode: "jump", t: 0.9 };
      start("trick", [s, { k: "call", fn: () => { hearts(8); sound(); o.onTrick?.(pick); } }, { k: "anim", mode: "happy", t: 1.0 }]); return true;
    },
    patPet() {
      if (task === "bath") { this.scrub(); return; } if (task === "nap") { this.wake(); return; } if (task) return;
      pet.mode = "happy"; pet.t = 1.5; hearts(5); if (o.traits.species === "cat") { purr(); window.setTimeout(meow, 350); } else bark(); o.onPat?.();
    },
    setTheme(id) { theme = THEMES.find((t) => t.id === id) ?? THEMES[0]; buildRoom(); },
    setAccessory(id) { accNow = id; rig.setAccessory(id); },
    resize: (nw, nh) => stage.resize(nw, nh),
    setActive: (on) => { active = on; },
    screenOf: () => { const r = canvas.getBoundingClientRect(); v3.set(pet.x, rig.height * 0.5, pet.z).project(stage.camera); return { x: ((v3.x + 1) / 2) * r.width, y: ((1 - v3.y) / 2) * r.height }; },
    stats: () => ({ fps, w: stage.w, h: stage.h, mode: pet.mode, task, x: pet.x, z: pet.z, dim, acc: accNow, theme: theme.id, scrubs, awaitingThrow, suds: 0, flies: flies.length, chases }),
    dispose: () => { cancelAnimationFrame(raf); stage.dispose(); },
  };
}
