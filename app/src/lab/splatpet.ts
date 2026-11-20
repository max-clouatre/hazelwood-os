// Builds a pet (from the same traits the live Cloheart Pets use) as sculpted solids baked into pixel-art Gaussian splats with ink-studio,
// inside a cosy room. A puppet rig moves the parts (breathing, tail, ears, blinking, head turns) and particles make hearts and crumbs.
// The toolkit comes from window.__INK__ (see scripts/vendor-ink.js). Everything here is demo code for the Pets preview lab.
import type { PetTraits } from "../activities/pets/data";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Kit = any;
const hexN = (h: string) => parseInt(h.slice(1), 16);
const mix = (a: number, b: number, t: number) => { const f = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return (f(16) << 16) | (f(8) << 8) | f(0); };
/** Four shades from dark to light for one colour. */
const ramp = (h: string): number[] => { const c = hexN(h); return [mix(c, 0x14111c, 0.5), mix(c, 0x14111c, 0.22), c, mix(c, 0xffffff, 0.28)]; };

export interface PetWorld {
  world: any; buildMs: number; splats: number;
  update(dt: number, t: number): void;
  pet(): void; feed(): void; setNight(night: number): void; relight(): any;
}

export function buildPetWorld(K: Kit, tr: PetTraits, seed = 7): PetWorld {
  const t0 = performance.now(); const { makeBuilder, makeSculpt, KIT } = K;
  // ---- palette: ink, pet colours, then the room
  const pal: number[] = [0x14111c]; const idx = (cols: number[]) => { const s = pal.length; cols.forEach((c) => pal.push(c)); return cols.map((_, i) => s + i); };
  const cache = new Map<string, number[]>(); const R = (h: string) => { let r = cache.get(h); if (!r) { r = idx(ramp(h)); cache.set(h, r); } return r; }; // one ramp per distinct colour (palettes are small)
  const fur = R(tr.main), white = R(tr.second), acc = R(tr.accent), eyeC = idx([mix(hexN(tr.eye), 0x14111c, 0.3), hexN(tr.eye), mix(hexN(tr.eye), 0xffffff, 0.55)]), noseC = idx([hexN(tr.nose)]);
  const collarC = tr.collar ? R(tr.collar) : fur; const earRamp = tr.earColor ? R(tr.earColor) : acc; const tailRamp = tr.tailColor ? R(tr.tailColor) : fur;
  const wood = idx([0x7a4f28, 0x9a6a38, 0xb98448, 0xd9a86a]), wall = idx([0xb89f78, 0xd2bb94, 0xe8d6b2, 0xf6ecd2]), wain = idx([0x4f7fa0, 0x6fa0c4, 0x8fb8d9, 0xb5d4ea]);
  const rug1 = idx([0xc9873a, 0xf2b84b, 0xffd98a, 0xfff0c0]), rug2 = idx([0x9a3a36, 0xc9544b, 0xe5736b, 0xf5a09a]), bed = idx([0x5a4290, 0x8a6bbf, 0xb39ae0, 0xd9ccf5]);
  const bowl = idx([0x8a2a22, 0xc9544b, 0xe5736b, 0xff9a90]), kibble = idx([0x6a3f18, 0x8a5428, 0xa8693a, 0xc98a52]), glow = idx([0xffe9a8, 0xfff3c8, 0xffffff]), plant = idx([0x2f7a3a, 0x3dbb55, 0x6fdc6f, 0xa8f090]), pot = idx([0x8a4a28, 0xa8693a, 0xc98a52]);
  const pink = idx([0xff5d8f, 0xff9ab8, 0xffd0e0]), crumb = idx([0xa8693a, 0xc98a52]), ball = idx([0x2a6fa8, 0x3fa7e0, 0x8fd0f8]), tub = idx([0xbfc8d8, 0xe8ecf4, 0xffffff]);
  if (pal.length > 64) console.warn("splat palette is large:", pal.length);
  const B = makeBuilder(seed, pal); const S = KIT.sculpt(makeSculpt(B));
  const m = (r: number[], extra: any = {}) => ({ r, ...extra });

  // ---- the room (baked first, so nothing the pet does leaves holes in it)
  S.ground(m(wood), { rad: 5.4, res: 0.2 });
  S.box([0, 0.025, 0.2], [1.6, 0.025, 1.1], m(rug2), { res: 0.1 }); S.box([0, 0.05, 0.2], [1.35, 0.03, 0.9], m(rug1), { res: 0.1 });
  S.box([0, 1.7, -4.5], [5.1, 1.7, 0.18], m(wall), { res: 0.22 }); S.box([-4.7, 1.7, 0], [0.18, 1.7, 4.6], m(wall), { res: 0.22 });
  S.box([0, 0.5, -4.34], [5.1, 0.5, 0.06], m(wain), { res: 0.2 }); S.box([-4.54, 0.5, 0], [0.06, 0.5, 4.6], m(wain), { res: 0.2 });
  S.box([-4.5, 2.2, -1.2], [0.06, 0.75, 1.0], m(glow, { em: true }), { res: 0.15 });                                   // window glow
  S.box([3.0, 0.2, -3.2], [0.95, 0.2, 0.65], m(bed), { res: 0.1 }); S.box([3.0, 0.42, -3.2], [0.8, 0.12, 0.55], m(tub), { res: 0.1 });    // bed
  S.tube([[-3.0, 0.12, 2.1], [-3.0, 0.2, 2.1]], 0.5, 0.42, m(bowl), { res: 0.08 }); S.ball([-3.0, 0.24, 2.1], [0.34, 0.1, 0.34], m(kibble), { res: 0.06 }); // bowl
  S.tube([[-3.9, 0.0, -3.9], [-3.9, 0.45, -3.9]], 0.3, 0.26, m(pot), { res: 0.08 }); [[-0.2, 1.1], [0.15, 1.4], [0, 0.85]].forEach(([dx, h], i) => S.tube([[-3.9, 0.45, -3.9], [-3.9 + dx * 1.4, 0.45 + h, -3.9 + (i - 1) * 0.2]], 0.07, 0.02, m(plant), { res: 0.06 }));
  S.ball([1.9, 0.14, 3.0], 0.14, m(ball), { res: 0.05 });
  S.ball([-3.2, 3.15, -3.9], 0.28, m(glow, { em: true }), { res: 0.08 });                                              // a lamp
  S.bake();

  // ---- the pet
  const cat = tr.species === "cat"; const s = tr.size * (cat ? 1.65 : 1.85); const tags = KIT.deform.tags(S);
  const bodyLen = cat ? 0.5 : 0.56, bodyW = cat ? 0.27 : 0.31, bodyH = cat ? 0.26 : 0.3; const legLen = (cat ? 0.34 : 0.42) * s; const by = legLen + bodyH * s * 0.75;
  const hr = (cat ? 0.25 : 0.28) * s, sn = tr.snout; const hy = by + bodyH * s * 0.75, hz = bodyLen * s * 0.95;
  S.ball([0, by, 0], [bodyW * s, bodyH * s, bodyLen * s], m(fur), { tag: "body", res: 0.06 });
  S.ball([0, by - bodyH * s * 0.45, bodyLen * s * 0.28], [bodyW * s * 0.82, bodyH * s * 0.55, bodyLen * s * 0.6], m(white), { tag: "body", res: 0.06 });
  if (tr.stripes) for (let i = 0; i < 4; i++) S.ball([0, by + bodyH * s * 0.82, (-0.3 + i * 0.2) * s], [bodyW * s * 0.85, 0.025 * s, 0.06 * s], m(acc), { tag: "body", res: 0.04 });
  (tr.patches ?? []).forEach((p) => { const c = R(p.c); if (p.on === "head") S.ball([p.x * hr, hy + (p.y - 0.4) * hr, hz + hr * (0.55 + p.z)], [p.r * hr * 1.6, p.r * hr * 1.2, p.r * hr * 0.9], m(c), { tag: "head", res: 0.04 }); else S.ball([p.x * s, by + p.y * s * 0.9, p.z * s], [p.r * s * 0.9, p.r * s * 0.55, p.r * s * 0.9], m(c), { tag: "body", res: 0.04 }); });
  S.ball([0, hy, hz], [hr, hr * 0.95, hr], m(fur), { tag: "head", res: 0.05 });
  const snL = hr * (0.4 + sn * 0.9); S.ball([0, hy - hr * 0.22, hz + hr * 0.75 + snL * 0.25], [hr * 0.5, hr * 0.38, snL * 0.8], m(white), { tag: "head", res: 0.04 });
  S.ball([0, hy - hr * 0.1, hz + hr * 0.75 + snL * 0.95], [hr * 0.2, hr * 0.14, hr * 0.14], m(noseC), { tag: "head", res: 0.03 });
  [-1, 1].forEach((sx) => {
    S.ball([sx * hr * 0.42, hy + hr * 0.25, hz + hr * 0.78], [hr * 0.15, hr * 0.17, hr * 0.12], m(eyeC, { em: true }), { tag: sx < 0 ? "eyeL" : "eyeR", res: 0.025 });
    if (tr.ears === "pointy") S.tube([[sx * hr * 0.55, hy + hr * 0.7, hz - hr * 0.1], [sx * hr * 0.72, hy + hr * 1.75, hz - hr * 0.12]], hr * 0.42, hr * 0.03, m(earRamp), { tag: sx < 0 ? "earL" : "earR", res: 0.04 });
    else if (tr.ears === "floppy") S.ball([sx * hr * 0.92, hy + hr * 0.15, hz - hr * 0.05], [hr * 0.22, hr * 0.62, hr * 0.38], m(earRamp), { tag: sx < 0 ? "earL" : "earR", res: 0.04 });
    else S.ball([sx * hr * 0.6, hy + hr * 0.85, hz], hr * 0.3, m(earRamp), { tag: sx < 0 ? "earL" : "earR", res: 0.04 });
  });
  if (tr.collar) S.ball([0, hy - hr * 0.7, hz - hr * 0.35], [hr * 0.78, hr * 0.14, hr * 0.78], m(collarC), { tag: "head", res: 0.04 });
  [[-1, 1, "legFL"], [1, 1, "legFR"], [-1, -1, "legBL"], [1, -1, "legBR"]].forEach(([sx, sz, id]: any) => {
    const x = sx * bodyW * s * 0.62, z = sz * bodyLen * s * 0.55;
    S.tube([[x, by - bodyH * s * 0.2, z], [x, 0.05 * s, z + 0.02]], 0.085 * s, 0.065 * s, m(fur), { tag: id, res: 0.045 }); S.ball([x, 0.05 * s, z + 0.06 * s], [0.075 * s, 0.05 * s, 0.1 * s], m(white), { tag: id, res: 0.035 });
  });
  const segs = tr.tail === "stub" ? 1 : tr.tail === "curly" ? 3 : cat ? 3 : 3; const tr0 = [0, by + bodyH * s * 0.3, -bodyLen * s * 0.9]; const thick = (tr.tail === "fluffy" ? 0.11 : cat ? 0.05 : 0.065) * s;
  for (let i = 0; i < segs; i++) { const a = [tr0[0], tr0[1] + i * 0.22 * s * (tr.tail === "curly" ? 0.9 : 0.8), tr0[2] - i * 0.12 * s + (tr.tail === "curly" ? i * 0.1 * s : 0)]; const b = [a[0], a[1] + 0.22 * s, a[2] - 0.1 * s + (tr.tail === "curly" ? 0.1 * s : 0)]; S.tube([a, b], thick, thick * 0.85, m(i === segs - 1 ? tailRamp : tailRamp), { tag: "tail" + (i + 1), res: 0.045 }); }
  S.bake();

  // ---- hearts and crumbs
  const pool = KIT.pool(B, 120);
  const world = B.finish({
    cam: { target: [0, 1.0, 0.3], dist: 7.4, pitch: 0.4, yaw: 0.72 }, detail: 14, dither: 0.25, radius: 6,
    relighting: { sun: { direction: [0.4, 1, 0.5], color: "#ffffff", intensity: 0 }, ambient: 0.62, strength: 0.7, lights: { lamp: { at: [-3.2, 3.0, -3.8], range: 9, color: "#ffd9a0", intensity: 1.0 }, window: { at: [-4.2, 2.4, -1.2], range: 7, color: "#cfe6ff", intensity: 0.55 } } },
  });
  const stage = KIT.stage(world); const particles = stage.add(KIT.particles(stage, pool, { flow: KIT.flow.wind([0, 0.5, 0]), ground: () => 0 }));
  const parts: any = {}; const addPart = (name: string, o: any) => { if (tags[name] && tags[name].length) parts[name] = { ids: tags[name], ...o }; };
  const neck = [0, by + bodyH * s * 0.4, hz - hr * 0.6];
  addPart("body", { pivot: [0, by - bodyH * s * 0.5, 0], axis: [0, 0, 1], slices: 5 });
  addPart("head", { pivot: neck, parent: "body" }); addPart("earL", { pivot: [-hr * 0.5, hy + hr * 0.6, hz], parent: "head" }); addPart("earR", { pivot: [hr * 0.5, hy + hr * 0.6, hz], parent: "head" });
  addPart("eyeL", { pivot: [-hr * 0.42, hy + hr * 0.25, hz + hr * 0.78], parent: "head" }); addPart("eyeR", { pivot: [hr * 0.42, hy + hr * 0.25, hz + hr * 0.78], parent: "head" });
  [["legFL", -1, 1], ["legFR", 1, 1], ["legBL", -1, -1], ["legBR", 1, -1]].forEach(([id, sx, sz]: any) => addPart(id, { pivot: [sx * bodyW * s * 0.62, by - bodyH * s * 0.2, sz * bodyLen * s * 0.55], parent: "body" }));
  for (let i = 0; i < segs; i++) addPart("tail" + (i + 1), { pivot: [tr0[0], tr0[1] + i * 0.22 * s * 0.8, tr0[2] - i * 0.12 * s], parent: i ? "tail" + i : "body" });

  const st = { react: 0, reactT: -9, eat: 0, eatT: -9, night: 0, nextBlink: 2, blink: 0, tw: 0 }; let lastT = 0;
  const pup = KIT.puppet(world, { parts, pose(t: number, _dt: number, p: any) {
    const P = p.pose; const mood = 0.7; const breathe = Math.sin(t * 2.0) * 0.012;
    const k = (n: string) => (P[n] = P[n] || {});
    k("body").scale = [1, 1 + breathe, 1 + breathe * 0.5];
    const wag = (tr.species === "dog" ? 24 : 10) * (0.6 + mood); for (let i = 1; i <= segs; i++) k("tail" + i).rot = [Math.sin(t * 2.4 + i * 0.7) * 6 * i, Math.sin(t * (3 + mood * 5) - i * 0.7) * wag * (0.4 + i * 0.3) * 0.5, 0];
    const react = Math.max(0, 1 - (t - st.reactT) / 1.4), eat = Math.max(0, 1 - (t - st.eatT) / 2.6);
    k("head").rot = [eat * (28 + Math.sin(t * 12) * 4) - react * 8, Math.sin(t * 0.7) * 14 * (1 - eat), react * Math.sin(t * 14) * 6];
    k("body").pos = [0, react * Math.abs(Math.sin(t * 9)) * 0.12 * s, 0];
    if (tr.ears === "pointy") { const tw = Math.max(0, Math.sin(t * 1.3) - 0.92) * 40; k("earL").rot = [0, 0, tw]; k("earR").rot = [0, 0, -tw * 0.6]; } else { k("earL").rot = [react * 12, 0, 0]; k("earR").rot = [react * 12, 0, 0]; }
    const blink = (t % 3.7) < 0.14 ? 0.12 : 1; k("eyeL").scale = [1, blink, 1]; k("eyeR").scale = [1, blink, 1];
    const swing = Math.sin(t * 1.5) * 0.0; ["legFL", "legFR", "legBL", "legBR"].forEach((n) => (k(n).rot = [swing * 10, 0, 0]));
  } });
  void pup;
  const heartCols = pink; let nextCrumb = 0;
  stage.add({ update(_dt: number, t: number) { if (st.eat > 0 && t >= nextCrumb) { particles.chips([-3.0 + 0.1, 0.35, 2.1], 3, crumb); nextCrumb = t + 0.22; } if (t - st.eatT > 2.6) st.eat = 0; } });
  const headPos = [0, hy + hr, hz]; const bowlPos = [-3.0, 0.3, 2.1];
  const out: PetWorld = {
    world, buildMs: performance.now() - t0, splats: world.count,
    update(dt, t) { lastT = t; world.anim.update(dt, t); },
    pet() { st.reactT = lastT; particles.ring ? particles.ring([headPos[0], headPos[1] + 0.2, headPos[2]], 0.4, heartCols, 10) : null; particles.embers([headPos[0], headPos[1] + 0.2, headPos[2]], 12, heartCols); },
    feed() { st.eatT = lastT; st.eat = 1; particles.embers([bowlPos[0], bowlPos[1], bowlPos[2]], 8, crumb); },
    setNight(n) { st.night = n; },
    relight() { const n = st.night; return { sun: { direction: [0.4, 1, 0.5], color: "#ffffff", intensity: 0 }, ambient: 0.62 - 0.35 * n, strength: 0.7, lights: { lamp: { at: [-3.2, 3.0, -3.8], range: 9, color: "#ffd9a0", intensity: 1.0 + 0.8 * n }, window: { at: [-4.2, 2.4, -1.2], range: 7, color: n > 0.5 ? "#6a86d8" : "#cfe6ff", intensity: 0.55 - 0.25 * n } } }; },
  };
  return out;
}
