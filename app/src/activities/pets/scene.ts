// The room: a cosy cutaway room in the PS1 look (small render, 15-bit colour with dither, vertex snapping, flat low-poly shapes).
// The pet wanders, walks to the bowl to eat, and reacts when tapped.
import type * as T from "three";
import { Stage } from "../../wilds/pixel/engine";
import type { TH } from "../../wilds/pixel/engine";
import { bark, crunch, meow, pop, purr } from "../../lib/petsound";
import type { PetTraits } from "./data";
import { PetRig } from "./rig";
import type { Anim } from "./rig";

export interface RoomOpts { traits: PetTraits; mood: () => number; onPat?: () => void; onFed?: () => void }
type Mode = "idle" | "walk" | "eat" | "happy";
const BOUND = 3.5, BOWL = { x: -3.1, z: 2.2 };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export interface Room {
  feed(): void; patPet(): void; resize(w: number, h: number): void; setActive(on: boolean): void;
  screenOf(): { x: number; y: number }; stats(): { fps: number; w: number; h: number; mode: string; x: number; z: number; eating: boolean }; dispose(): void;
}

export function createRoom(THREE: TH, canvas: HTMLCanvasElement, w: number, h: number, o: RoomOpts): Room {
  const stage = new Stage(THREE, canvas, w, h, { palette: true, outline: false, dither: true }, { levels: 32 }); // 32 steps per channel = 15-bit colour
  const scene = stage.scene; scene.background = new THREE.Color("#2a2540"); stage.frame(4.6);
  scene.add(new THREE.AmbientLight(0xffffff, 0.95)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(5, 9, 6); scene.add(sun);
  const mats = new Map<string, T.Material>();
  const mat = (hex: string) => { let m = mats.get(hex); if (!m) { m = stage.ps1(new THREE.MeshLambertMaterial({ color: hex, flatShading: true })); mats.set(hex, m); } return m; };
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, hex: string, parent: T.Object3D = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat(hex)); m.position.set(x, y, z); parent.add(m); return m; };

  // floor boards, two walls (the camera looks in from the +x +z corner), rug, window, bed, bowl, ball, plant
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) box(1, 0.2, 1, i, -0.1, j, (i + j) % 2 ? "#c98f56" : "#d9a86a");
  box(0.3, 3.4, 9.6, -4.65, 1.6, 0, "#f2e6c8"); box(9.6, 3.4, 0.3, 0, 1.6, -4.65, "#ead9b8");
  box(0.34, 1.0, 9.6, -4.65, 0.5, 0, "#8fb8d9"); box(9.6, 1.0, 0.34, 0, 0.5, -4.65, "#8fb8d9"); // blue wainscot
  box(0.1, 1.3, 1.8, -4.45, 2.2, -1.2, "#fff7d6"); box(0.16, 1.5, 2.0, -4.52, 2.2, -1.2, "#a8693a"); box(0.1, 1.3, 0.08, -4.44, 2.2, -1.2, "#a8693a"); // window with frame
  box(3.2, 0.05, 2.2, 0.3, 0.03, 0.2, "#e5736b"); box(2.8, 0.06, 1.8, 0.3, 0.05, 0.2, "#f2b84b"); // rug
  box(1.8, 0.35, 1.2, 3.1, 0.17, -3.5, "#8a6bbf"); box(1.5, 0.2, 0.95, 3.1, 0.42, -3.5, "#c9b6f2"); // bed
  const bowl = box(0.8, 0.2, 0.8, BOWL.x, 0.1, BOWL.z, "#e5534b"); void bowl; box(0.62, 0.05, 0.62, BOWL.x, 0.22, BOWL.z, "#b8412e");
  const food = box(0.46, 0.14, 0.46, BOWL.x, 0.3, BOWL.z, "#a8693a"); food.visible = false;
  box(0.34, 0.34, 0.34, 1.9, 0.17, 3.3, "#3fa7e0"); // toy ball (a cube: PS1)
  box(0.5, 0.5, 0.5, -3.9, 0.25, -3.9, "#a8693a"); for (let i = 0; i < 3; i++) box(0.2, 0.8 + i * 0.25, 0.2, -3.9 + (i - 1) * 0.18, 0.85 + i * 0.12, -3.9, "#3dbb55"); // plant
  box(0.9, 0.14, 0.4, -4.4, 1.9, 2.6, "#a8693a"); box(0.4, 0.3, 0.3, -4.4, 2.14, 2.6, "#f59ac0"); // little shelf with a pot

  const rig = new PetRig(THREE, o.traits, mat); const PS = 1.75; rig.group.scale.setScalar(PS); scene.add(rig.group); rig.height *= PS; // the pet is big and chunky in its room
  // shadow blob
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.75 * o.traits.size * 1.75, 8), new THREE.MeshBasicMaterial({ color: 0x1a1226, transparent: true, opacity: 0.35 })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02; scene.add(sh);

  // hearts: a few pink cubes that float up
  const MAXP = 40; const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), MAXP); pm.frustumCulled = false; scene.add(pm);
  const zero = new THREE.Matrix4().makeScale(0, 0, 0); const dummy = new THREE.Object3D(), pc = new THREE.Color();
  for (let i = 0; i < MAXP; i++) { pm.setMatrixAt(i, zero); pm.setColorAt(i, pc.set("#ffffff")); }
  const parts: { x: number; y: number; z: number; vx: number; vz: number; vy: number; life: number; max: number; s: number }[] = [];
  const emit = (n: number, color: string, y0: number) => { for (let i = 0; i < n && parts.length < MAXP; i++) { const idx = parts.length; parts.push({ x: pet.x + rnd(-0.3, 0.3), y: y0, z: pet.z + rnd(-0.3, 0.3), vx: rnd(-0.3, 0.3), vz: rnd(-0.3, 0.3), vy: rnd(0.8, 1.4), life: 0, max: rnd(0.9, 1.5), s: rnd(0.14, 0.22) }); pm.setColorAt(idx, pc.set(color)); } if (pm.instanceColor) pm.instanceColor.needsUpdate = true; };

  // the pet's brain: a tiny state machine
  const pet = { x: 0.5, z: 0.5, heading: 0.6, mode: "idle" as Mode, t: rnd(0.5, 1.5), tx: 0, tz: 0, goalBowl: false, eatLeft: 0, crunchT: 0, hasWalkTarget: false };
  let yaw = Math.PI / 4, active = true, raf = 0, last = 0, fps = 0, fpsN = 0, fpsT = 0, ph = 0;
  const v3 = new THREE.Vector3();
  const sound = () => (o.traits.sound === "bark" ? bark() : meow());
  const walkTo = (x: number, z: number) => { pet.tx = x; pet.tz = z; pet.mode = "walk"; };
  const frame = (ts: number) => {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden) { last = ts; return; }
    const dtRaw = (ts - last) / 1000; if (dtRaw < 1 / 31) return; const dt = Math.min(dtRaw, 0.1); last = ts; ph += dt;
    // behaviour
    pet.t -= dt;
    if (pet.mode === "idle" && pet.t <= 0) { if (pet.goalBowl) walkTo(BOWL.x + 1.05, BOWL.z + 0.3); else walkTo(rnd(-BOUND, BOUND), rnd(-BOUND, BOUND)); }
    if (pet.mode === "walk") {
      const dx = pet.tx - pet.x, dz = pet.tz - pet.z, d = Math.hypot(dx, dz);
      if (d < 0.12) {
        if (pet.goalBowl) { pet.mode = "eat"; pet.eatLeft = 3.2; pet.crunchT = 0; pet.heading = Math.atan2(BOWL.x - pet.x, BOWL.z - pet.z); }
        else { pet.mode = "idle"; pet.t = rnd(1.5, 4); }
      } else { const sp = 1.25 * Math.min(1, dt * 60 / 60); const stepd = Math.min(d, 1.25 * dt); pet.x += (dx / d) * stepd; pet.z += (dz / d) * stepd; void sp; const want = Math.atan2(dx, dz); let diff = want - pet.heading; while (diff > Math.PI) diff -= 2 * Math.PI; while (diff < -Math.PI) diff += 2 * Math.PI; pet.heading += diff * Math.min(1, dt * 7); }
    }
    if (pet.mode === "eat") { pet.eatLeft -= dt; pet.crunchT -= dt; if (pet.crunchT <= 0) { crunch(); pet.crunchT = 0.55; } if (pet.eatLeft <= 0) { food.visible = false; pet.goalBowl = false; pet.mode = "happy"; pet.t = 1.3; emit(6, "#ff5d8f", 1.0); sound(); o.onFed?.(); } }
    if (pet.mode === "happy") { pet.t -= 0; if (pet.t <= 0) { pet.mode = "idle"; pet.t = rnd(1.2, 3); } }
    pet.x = Math.max(-BOUND - 0.3, Math.min(BOUND + 0.3, pet.x)); pet.z = Math.max(-BOUND - 0.3, Math.min(BOUND + 0.3, pet.z));
    rig.group.position.x = pet.x; rig.group.position.z = pet.z; rig.group.rotation.y = pet.heading; sh.position.x = pet.x; sh.position.z = pet.z;
    const anim: Anim = { mode: pet.mode, mood: o.mood() }; rig.update(dt, anim);
    sh.scale.setScalar(1 - Math.min(0.3, rig.group.position.y)); 
    // particles
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life += dt; p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt; if (p.life >= p.max) parts.splice(i, 1); }
    for (let i = 0; i < MAXP; i++) { const p = parts[i]; if (!p) { pm.setMatrixAt(i, zero); continue; } const s = p.s * (1 - (p.life / p.max) * 0.6); dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, yaw, 0); dummy.scale.set(s, s, s); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix); }
    pm.instanceMatrix.needsUpdate = true;
    stage.orbit(yaw, 0, 1.1, 0, 0.62, 40); stage.render();
    fpsN++; fpsT += dt; if (fpsT >= 1) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
  };
  raf = requestAnimationFrame(frame);

  return {
    feed() { food.visible = true; pet.goalBowl = true; if (pet.mode === "idle" || pet.mode === "walk" || pet.mode === "happy") { pet.t = 0; pet.mode = "idle"; } pop(); },
    patPet() { pet.mode = "happy"; pet.t = 1.5; emit(5, "#ff7aa8", rig.height * 0.9); if (o.traits.species === "cat") { purr(); window.setTimeout(meow, 350); } else bark(); o.onPat?.(); },
    resize: (nw, nh) => stage.resize(nw, nh),
    setActive: (on) => { active = on; },
    screenOf: () => { const r = canvas.getBoundingClientRect(); v3.set(pet.x, rig.height * 0.5, pet.z).project(stage.camera); return { x: ((v3.x + 1) / 2) * r.width, y: ((1 - v3.y) / 2) * r.height }; },
    stats: () => ({ fps, w: stage.w, h: stage.h, mode: pet.mode, x: pet.x, z: pet.z, eating: pet.mode === "eat" }),
    dispose: () => { cancelAnimationFrame(raf); stage.dispose(); },
  };
}
