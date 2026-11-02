// The living meadow: floating island, wandering crew, camp workers, clouds, butterflies, little sparkles.
import type * as T from "three";
import type { Owned } from "../types";
import { DEFAULT_POST, Stage, toonMap } from "./engine";
import type { PostOpts, TH } from "./engine";
import { shapeOf } from "./buildings";
import { boxesToMesh, buildIsland, campSpots, groundY, plotPos, PLOTS, walkable } from "./island";
import type { Box } from "./island";
import { buildSprite, rasterize, spriteKey } from "./sprite";
import type { SpriteGeo } from "./sprite";

/** What the Village screen wants drawn: each plot (null = empty, ready = pile colour when something waits) and the friends working. */
export interface VillageView { plots: ({ kind: string; level: number; ready: string | null } | null)[]; workers: { owned: Owned; plot: number }[] }
export interface MeadowOpts { scene?: "meadow" | "village"; onPlot?: (i: number, screenX: number, screenY: number) => void; post?: PostOpts; onTap?: (o: Owned, xPct: number, yPct: number, worker: boolean) => void }
type Mode = "idle" | "walk" | "sleep" | "work";
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

class Actor {
  group!: T.Group; mesh!: T.Mesh; shadow!: T.Mesh; mode!: Mode; t = 0; x = 0; z = 0; tx = 0; tz = 0; face = 1; ph = 0; hop = 0; fx = 0;
  o!: Owned; worker!: boolean; geo!: SpriteGeo;
}


export interface Meadow {
  setActors(crew: Owned[], workers: Owned[]): Promise<void>; setVillage(v: VillageView): Promise<void>; plotScreen(i: number): { x: number; y: number }; rotate(dir: number): void; resize(w: number, h: number): void; setPost(p: PostOpts): void;
  setActive(on: boolean): void; stats(): { fps: number; post: PostOpts; w: number; h: number; actors: number; yawK: number }; screenOf(id: string): { x: number; y: number } | null; dispose(): void;
}

export function createMeadow(THREE: TH, canvas: HTMLCanvasElement, w: number, h: number, opts: MeadowOpts): Meadow {
  const stage = new Stage(THREE, canvas, w, h, opts.post ?? DEFAULT_POST);
  const scene = stage.scene; if (opts.scene === "village") stage.frame(5.3); /* closer, so buildings read well */ scene.background = new THREE.Color("#92dbff");
  scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  const sun = new THREE.DirectionalLight(0xfff6dc, 1.9); sun.position.set(6, 12, 7); scene.add(sun);
  const gm = toonMap(THREE);
  const village = opts.scene === "village";
  const island = buildIsland(THREE, gm, { village }); scene.add(island.mesh);
  const toon = new THREE.MeshBasicMaterial({ vertexColors: true }); // sprites carry their own baked light and shade
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x1a3a22, transparent: true, opacity: 0.28 });
  const shadowGeo = new THREE.CircleGeometry(0.7, 8); shadowGeo.rotateX(-Math.PI / 2);

  // ---- clouds: little voxel puffs that drift round the island
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const clouds: T.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group();
    [[0, 0, 1.6, 0.6], [0.9, 0.15, 1.0, 0.5], [-0.9, 0.1, 1.1, 0.45]].forEach(([x, y, sw, sh]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.9), cloudMat); m.position.set(x, y, 0); g.add(m); });
    g.userData = { a: (i / 4) * Math.PI * 2, r: 9 + (i % 2) * 2, y: 3 + i * 0.7, s: 0.05 + i * 0.01 }; scene.add(g); clouds.push(g);
  }
  // ---- butterflies
  const wingMat = new THREE.MeshToonMaterial({ color: 0xffa94d, gradientMap: gm });
  const flies: T.Group[] = [0, 1].map((i) => { const g = new THREE.Group(); const a = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.02), wingMat), b = a.clone(); a.position.x = -0.1; b.position.x = 0.1; g.add(a, b); g.userData = { ph: i * 3, a, b }; scene.add(g); return g; });
  // ---- particles (hearts, z's, sparkles, glow): one instanced cube set
  const MAXP = 64;
  const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial(), MAXP);
  const parts: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; s: number }[] = [];
  const pc = new THREE.Color(); const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < MAXP; i++) { pm.setMatrixAt(i, zero); pm.setColorAt(i, pc.set("#ffffff")); }
  pm.frustumCulled = false; scene.add(pm);
  let pmDirty = false;
  const emit = (x: number, y: number, z: number, color: string, n = 1, up = 0.9, spread = 0.4, size = 0.14) => {
    for (let i = 0; i < n && parts.length < MAXP; i++) {
      const idx = parts.length; parts.push({ x, y, z, vx: rnd(-spread, spread), vy: rnd(up * 0.6, up), vz: rnd(-spread, spread), life: 0, max: rnd(0.9, 1.5), s: size });
      pm.setColorAt(idx, pc.set(color)); if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    }
  };

  // ---- actors
  const cache = new Map<string, SpriteGeo>(); let actors: Actor[] = []; let sig = "";
  const spots = walkable(); const cspots = campSpots();
  const dummy = new THREE.Object3D();
  async function geoFor(o: Owned): Promise<SpriteGeo> {
    const k = spriteKey(o); let g = cache.get(k);
    if (!g) { g = buildSprite(THREE, await rasterize(o)); cache.set(k, g); }
    return g;
  }
  const dropActor = (a: Actor) => { scene.remove(a.group); };
  function make(o: Owned, worker: boolean, geo: SpriteGeo, i: number, at?: [number, number]): Actor {
    const mesh = new THREE.Mesh(geo.geometry, toon);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    const group = new THREE.Group(); group.add(mesh); scene.add(group); scene.add(shadow); group.add(shadow); shadow.position.y = 0.03; shadow.renderOrder = 1;
    const sp = at ?? (worker ? cspots[i % cspots.length] : spots[(i * 7 + 3) % spots.length]);
    const a = Object.create(Actor.prototype) as Actor;
    Object.assign(a, { o, worker, geo, mesh, shadow, group, mode: worker ? "work" : "idle", t: rnd(0.2, 2), x: sp[0], z: sp[1], tx: sp[0], tz: sp[1], face: 1, ph: rnd(0, 6), hop: 0, fx: 0 });
    return a;
  }
  let setSeq = 0;
  async function setActors(crew: Owned[], workers: Owned[]) {
    const mine = ++setSeq, s = crew.map((o) => o.id).join(",") + "|" + workers.map((o) => o.id).join(",");
    if (s === sig) return;
    const geos = await Promise.all([...crew, ...workers].map(geoFor));
    if (mine !== setSeq) return; sig = s;
    actors.forEach(dropActor); actors = [];
    crew.forEach((o, i) => actors.push(make(o, false, geos[i], i)));
    workers.forEach((o, i) => actors.push(make(o, true, geos[crew.length + i], i)));
  }

  const v3 = new THREE.Vector3();
  // ---- village: building meshes, empty-plot markers, ready bubbles
  let vMesh: T.InstancedMesh | null = null; let vSig = ""; let vView: VillageView | null = null;
  const marker: (T.Mesh | null)[] = []; const readyCubes: (T.Mesh | null)[] = [];
  const markMat = new THREE.MeshBasicMaterial({ color: 0xffd23f });
  const readyColor: Record<string, string> = { glow: "#ffd23f", berries: "#ff5d8f", wood: "#c8905a" };
  async function setVillage(v: VillageView) {
    vView = v; const sig = JSON.stringify(v.plots) + "|" + v.workers.map((x) => x.owned.id + x.plot).join(",");
    if (sig === vSig) return; vSig = sig;
    if (vMesh) { scene.remove(vMesh); vMesh.geometry.dispose(); vMesh = null; }
    marker.forEach((q) => q && scene.remove(q)); marker.length = 0; readyCubes.forEach((q) => q && scene.remove(q)); readyCubes.length = 0;
    const boxes: Box[] = [];
    v.plots.forEach((p, i) => {
      const { x, y, z } = plotPos(i);
      if (!p) {
        shapeOf("", 1).forEach((b) => boxes.push({ ...b, x: b.x + x, y: b.y + y, z: b.z + z }));
        const mk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.2), markMat), mk2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.9), markMat);
        const g = new THREE.Group(); g.add(mk, mk2); g.position.set(x, y + 0.45, z); scene.add(g); marker[i] = g as unknown as T.Mesh;
      } else shapeOf(p.kind, p.level).forEach((b, k) => { const S = k < 2 ? 1 : 1.3; boxes.push({ x: b.x * S + x, y: b.y * S + y, z: b.z * S + z, sx: b.sx * S, sy: b.sy * S, sz: b.sz * S, c: b.c }); });
      if (p?.ready) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), new THREE.MeshBasicMaterial({ color: new THREE.Color(readyColor[p.ready] ?? "#ffffff") })); scene.add(c); readyCubes[i] = c; }
    });
    vMesh = boxesToMesh(THREE, gm, boxes); scene.add(vMesh);
    const geos = await Promise.all(v.workers.map((x) => geoFor(x.owned)));
    if (vView !== v) return;
    actors.forEach(dropActor); actors = [];
    v.workers.forEach((x, k) => { const { x: px, z: pz } = plotPos(x.plot); actors.push(make(x.owned, true, geos[k], k, [px + 1.0, pz + 0.9])); });
  }
  const plotScreen = (i: number) => { const r = canvas.getBoundingClientRect(); const { x, y, z } = plotPos(i); v3.set(x, y + 0.7, z).project(stage.camera); return { x: ((v3.x + 1) / 2) * r.width, y: ((1 - v3.y) / 2) * r.height }; };

  // ---- camera, loop, taps
  let yawK = 0, yaw = Math.PI / 4, active = true, raf = 0, last = 0, fpsN = 0, fpsT = 0, fps = 0, slow = 0;
  const targetYaw = () => Math.PI / 4 + yawK * (Math.PI / 2);
  const frame = (ts: number) => {
    raf = requestAnimationFrame(frame);
    if (!active || document.hidden) { last = ts; return; }
    const dtRaw = (ts - last) / 1000;
    if (dtRaw < 1 / 31) return; // about 30 pictures a second is plenty for pixel art and keeps the tablet cool
    const dt = Math.min(dtRaw, 0.1); last = ts; const t = ts / 1000;
    yaw += (targetYaw() - yaw) * Math.min(1, dt * 7);
    stage.orbit(yaw);
    // clouds + butterflies
    clouds.forEach((c) => { c.userData.a += c.userData.s * dt; c.position.set(Math.cos(c.userData.a) * c.userData.r, c.userData.y, Math.sin(c.userData.a) * c.userData.r - 2); c.rotation.y = yaw; });
    flies.forEach((f) => { const p = f.userData.ph + t * 0.6; f.position.set(Math.sin(p) * 3.2 - 1, 1.6 + Math.sin(p * 2.1) * 0.35, Math.cos(p * 0.8) * 2.6); f.rotation.y = yaw; const flap = Math.abs(Math.sin(t * 14 + f.userData.ph)); f.userData.a.scale.x = f.userData.b.scale.x = 0.3 + flap * 0.9; });
    // ambient: wishing tree sparkles and the campfire
    if (Math.random() < dt * 3) emit(island.wish.x + rnd(-1, 1), island.wish.y - rnd(0, 1.2), island.wish.z + rnd(-1, 1), Math.random() < 0.5 ? "#ffd1e6" : "#fff3b0", 1, 0.5, 0.1, 0.1);
    if (!village && Math.random() < dt * 8) emit(island.fire.x, island.fire.y, island.fire.z, Math.random() < 0.5 ? "#ff9f3a" : "#ffd23f", 1, 1.1, 0.12, 0.12);
    marker.forEach((g) => { if (g) { g.scale.setScalar(0.85 + Math.sin(t * 3) * 0.2); g.rotation.y = yaw; } });
    readyCubes.forEach((c, i) => { if (c) { const { x, y, z } = plotPos(i); c.position.set(x, y + 2.3 + Math.sin(t * 3 + i) * 0.12, z); c.rotation.y = t * 2; } });
    const vs = village ? 0.55 : 1; // friends are small helpers beside their building in a village
    const cr = Math.cos(yaw), sr = -Math.sin(yaw); // screen-right direction on the ground
    for (const a of actors) {
      a.t -= dt; a.ph += dt;
      let hop = 0, sq = 1 + Math.sin(a.ph * 3) * 0.025;
      if (a.mode === "walk") {
        const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz);
        if (d < 0.08) { a.mode = "idle"; a.t = rnd(1.5, 4); } else { const sp = 1.05 * dt; a.x += (dx / d) * Math.min(sp, d); a.z += (dz / d) * Math.min(sp, d); const side = dx * cr + dz * sr; if (Math.abs(side) > 0.01) a.face = side > 0 ? 1 : -1; hop = Math.abs(Math.sin(a.ph * 9)) * 0.22; }
      } else if (a.mode === "idle" && a.t <= 0) {
        const r = Math.random();
        if (r < 0.62) { const p = spots[Math.floor(rnd(0, spots.length))]; a.tx = p[0]; a.tz = p[1]; a.mode = "walk"; } else if (r < 0.8) { a.mode = "sleep"; a.t = rnd(4, 7); } else a.t = rnd(1.5, 3);
      } else if (a.mode === "sleep") {
        sq = 0.86 + Math.sin(a.ph * 1.6) * 0.02;
        if (Math.random() < dt * 0.9) emit(a.x + 0.4 * a.face, groundY(a.x, a.z) + a.geo.height * 0.85, a.z, "#ffffff", 1, 0.55, 0.05, 0.12);
        if (a.t <= 0) { a.mode = "idle"; a.t = rnd(1, 2.5); }
      } else if (a.mode === "work") {
        hop = Math.abs(Math.sin(a.ph * 4 + a.x)) * 0.12; a.fx -= dt;
        if (a.fx <= 0) { a.fx = rnd(2.2, 4); emit(a.x, groundY(a.x, a.z) + a.geo.height, a.z, "#ffd23f", 3, 1.0, 0.25, 0.14); }
      }
      if (a.hop > 0) { a.hop -= dt; hop += Math.abs(Math.sin((1 - a.hop) * Math.PI * 4)) * 0.4; if (Math.random() < dt * 14) emit(a.x, groundY(a.x, a.z) + a.geo.height * 0.9, a.z, "#ff5d8f", 1, 0.9, 0.35, 0.16); }
      const gy = groundY(a.x, a.z);
      a.group.position.set(a.x, gy + hop, a.z); a.group.rotation.y = yaw; a.mesh.scale.set(a.face * vs, sq * vs, vs);
      a.shadow.position.y = 0.03 - hop; a.shadow.scale.setScalar(1 - hop * 0.8);
    }
    // particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.life >= p.max) { parts.splice(i, 1); }
    }
    if (parts.length || pmDirty) {
    pmDirty = parts.length > 0;
    for (let i = 0; i < MAXP; i++) {
      const p = parts[i]; if (!p) { pm.setMatrixAt(i, zero); continue; }
      const s = p.s * (1 - p.life / p.max * 0.6); dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, yaw, 0); dummy.scale.set(s, s, s); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix);
    }
    pm.instanceMatrix.needsUpdate = true;
    }
    stage.render();
    fpsN++; fpsT += dt; if (fpsT >= 1) { fps = Math.round(fpsN / fpsT); fpsN = 0; fpsT = 0; }
    void slow;
  };
  raf = requestAnimationFrame(frame);

  const screenOf = (id: string) => {
    const a = actors.find((q) => q.o.id === id); if (!a) return null;
    const r = canvas.getBoundingClientRect(); v3.set(a.x, groundY(a.x, a.z) + a.geo.height * 0.5, a.z).project(stage.camera);
    return { x: ((v3.x + 1) / 2) * r.width, y: ((1 - v3.y) / 2) * r.height };
  };
  const onClick = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (village) {
      let bi = -1, bdist = Infinity; const ppu = r.height / (stage.halfH * 2);
      for (let i = 0; i < PLOTS.length; i++) { const s = plotScreen(i), d = Math.hypot(s.x - px, s.y - py); if (d < Math.max(34, ppu * 0.9) && d < bdist) { bi = i; bdist = d; } }
      if (bi >= 0) { const s = plotScreen(bi); opts.onPlot?.(bi, (s.x / r.width) * 100, (s.y / r.height) * 100); }
      return;
    }
    let best: Actor | null = null, bd = Infinity;
    for (const a of actors) {
      const s = screenOf(a.o.id); if (!s) continue;
      const pxPerUnit = r.height / (stage.halfH * 2), rad = Math.max(34, a.geo.height * pxPerUnit * 0.62), d = Math.hypot(s.x - px, s.y - py);
      if (d < rad && d < bd) { best = a; bd = d; }
    }
    if (best) { best.hop = 0.9; if (best.mode === "sleep") { best.mode = "idle"; best.t = 2; } opts.onTap?.(best.o, ((best ? screenOf(best.o.id)!.x : px) / r.width) * 100, ((screenOf(best.o.id)!.y - best.geo.height * (r.height / (stage.halfH * 2)) * 0.5) / r.height) * 100, best.worker); }
  };
  canvas.addEventListener("click", onClick);
  return {
    setActors, setVillage, plotScreen,
    rotate: (dir) => { yawK += dir; },
    resize: (nw, nh) => stage.resize(nw, nh),
    setPost: (p) => stage.setPost(p),
    setActive: (on) => { active = on; },
    stats: () => ({ fps, post: stage.post, w: stage.w, h: stage.h, actors: actors.length, yawK }),
    screenOf,
    dispose: () => { cancelAnimationFrame(raf); canvas.removeEventListener("click", onClick); stage.dispose(); cache.forEach((g) => g.geometry.dispose()); },
  };
}
