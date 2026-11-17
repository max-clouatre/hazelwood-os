// A procedural low-poly pet built from traits. No baked animation: every motion is computed in code each frame.
// Faces +z. All shapes are flat-shaded and chunky on purpose (PS1 look).
import type * as T from "three";
import type { TH } from "../../wilds/pixel/engine";
import type { PetTraits } from "./data";

export interface Anim { mode: "idle" | "walk" | "eat" | "happy" | "sleep"; mood: number /* 0 (wants love) to 1 (very happy) */ }
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class PetRig {
  group: any; // THREE.Group
  height = 1;
  private legs: any[] = []; private torso: any; private head: any; private tail: any[] = []; private ears: any[] = []; private eyes: any[] = [];
  private t = 0; private walk = 0; private blink = 0; private nextBlink = 2; private twitch = 0; private nextTwitch = 3; private look = 0; private lookTo = 0; private nextLook = 2;
  private baseY: number; private cat: boolean;

  constructor(THREE: TH, tr: PetTraits, mat: (hex: string) => T.Material) {
    const { Group, Mesh, SphereGeometry, BoxGeometry, ConeGeometry, CylinderGeometry } = THREE;
    const cat = tr.species === "cat"; this.cat = cat; const S = tr.size;
    const g = new Group(); this.group = g;
    const part = (geo: T.BufferGeometry, hex: string, x = 0, y = 0, z = 0, parent: T.Object3D = g) => { const m = new Mesh(geo, mat(hex)); m.position.set(x, y, z); parent.add(m); return m; };
    const legLen = (cat ? 0.34 : 0.42) * S; this.baseY = legLen + 0.06 * S;
    // body
    const bl = cat ? 0.55 : 0.62, bw = cat ? 0.27 : 0.34, bh = cat ? 0.27 : 0.33;
    const torso = new Group(); torso.position.y = this.baseY + bh * S * 0.6; g.add(torso); this.torso = torso;
    part(new SphereGeometry(1, 8, 6), tr.main, 0, 0, 0, torso).scale.set(bw * S, bh * S, bl * S);
    part(new SphereGeometry(1, 7, 5), tr.second, 0, -bh * S * 0.45, bl * S * 0.25, torso).scale.set(bw * S * 0.8, bh * S * 0.55, bl * S * 0.62); // belly and chest
    if (tr.patch) part(new SphereGeometry(1, 6, 5), tr.accent, tr.patch.x * S, tr.patch.y * S, tr.patch.z * S, torso).scale.set(tr.patch.r * S, tr.patch.r * S * 0.5, tr.patch.r * S);
    if (tr.stripes) for (let i = 0; i < 4; i++) part(new BoxGeometry(bw * S * 1.9, 0.03 * S, 0.07 * S), tr.accent, 0, bh * S * 0.93, (-0.3 + i * 0.2) * S, torso);
    if (!cat && tr.collar !== undefined) { /* collar sits on the neck, added with the head */ }
    // head group pivots at the neck
    const head = new Group(); head.position.set(0, this.baseY + bh * S * 1.0, bl * S * 0.82); g.add(head); this.head = head;
    const hr = (cat ? 0.27 : 0.3) * S;
    part(new SphereGeometry(1, 8, 7), tr.main, 0, hr * 0.5, hr * 0.3, head).scale.set(hr, hr * 0.95, hr);
    const sn = tr.snout; const snL = hr * (0.35 + sn * 0.9), snW = hr * (0.55 + sn * 0.1);
    part(new BoxGeometry(snW, hr * 0.5, snL), tr.second, 0, hr * 0.28, hr * 0.85 + snL * 0.3, head);
    part(new BoxGeometry(snW * 0.45, hr * 0.22, hr * 0.22), tr.nose, 0, hr * 0.42, hr * 0.85 + snL * 0.78, head);
    [-1, 1].forEach((s) => {
      const e = part(new SphereGeometry(1, 6, 5), tr.eye, s * hr * 0.42, hr * 0.78, hr * 0.78, head); e.scale.set(hr * 0.15, hr * 0.17, hr * 0.12); this.eyes.push(e);
      part(new BoxGeometry(hr * 0.06, hr * 0.06, hr * 0.06), "#ffffff", s * hr * 0.38, hr * 0.85, hr * 0.88, head); // eye shine
      // ears
      const ear = new Group(); ear.position.set(s * hr * 0.62, hr * 1.1, hr * 0.15); head.add(ear); this.ears.push(ear);
      if (tr.ears === "pointy") { const c = part(new ConeGeometry(hr * 0.42, hr * 0.85, 4), tr.accent, 0, hr * 0.32, 0, ear); c.rotation.z = -s * 0.15; part(new ConeGeometry(hr * 0.22, hr * 0.5, 4), tr.second, 0, hr * 0.22, hr * 0.05, ear).rotation.z = -s * 0.15; }
      else if (tr.ears === "floppy") { ear.position.set(s * hr * 0.78, hr * 0.85, hr * 0.1); part(new SphereGeometry(1, 6, 5), tr.accent, s * hr * 0.12, -hr * 0.3, 0, ear).scale.set(hr * 0.22, hr * 0.55, hr * 0.32); }
      else part(new SphereGeometry(1, 6, 5), tr.accent, 0, hr * 0.15, 0, ear).scale.set(hr * 0.32, hr * 0.32, hr * 0.2);
    });
    if (cat) [-1, 1].forEach((s) => [0.1, -0.02].forEach((dy) => part(new BoxGeometry(hr * 0.9, 0.012, 0.012), "#f6f2ea", s * (hr * 0.72 + hr * 0.4), hr * 0.3 + dy, hr * 1.0, head))); // whiskers
    if (tr.collar) part(new CylinderGeometry(hr * 0.62, hr * 0.66, hr * 0.2, 8), tr.collar, 0, -hr * 0.35, hr * 0.05, head);
    // legs: pivot at the top so they swing from the hip
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz]) => {
      const leg = new Group(); leg.position.set(sx * bw * S * 0.62, this.baseY, sz * bl * S * 0.55); g.add(leg);
      part(new CylinderGeometry(0.09 * S, 0.075 * S, legLen, 5), tr.main, 0, -legLen / 2, 0, leg);
      part(new BoxGeometry(0.15 * S, 0.07 * S, 0.2 * S), tr.second, 0, -legLen, 0.03 * S, leg);
      this.legs.push(leg);
    });
    // tail: a chain that sways
    const tl = tr.tail === "stub" ? 1 : tr.tail === "curly" ? 3 : cat ? 5 : 4, seg = (cat ? 0.13 : 0.12) * S * (tr.tail === "fluffy" ? 1.5 : 1);
    let parent: T.Object3D = g; const tailRoot = new Group(); tailRoot.position.set(0, this.baseY + bh * S * 1.05, -bl * S * 0.9); g.add(tailRoot); parent = tailRoot;
    for (let i = 0; i < tl; i++) { const j = new Group(); j.position.set(0, i ? seg * 0.9 : 0, i ? -seg * 0.3 : 0); parent.add(j); part(new SphereGeometry(seg * (tr.tail === "fluffy" ? 1.1 - i * 0.1 : 1 - i * 0.08), 6, 5), i === tl - 1 && cat ? tr.accent : tr.main, 0, seg * 0.5, 0, j); this.tail.push(j); parent = j; }
    this.height = this.baseY + bh * S * 2 + hr * 1.4;
  }

  /** Move the body parts for this frame. */
  update(dt: number, a: Anim) {
    this.t += dt; const t = this.t, S = 1; void S;
    const g = this.group;
    // blinking
    this.nextBlink -= dt; if (this.nextBlink <= 0) { this.blink = 0.13; this.nextBlink = rnd(2.2, 5); }
    this.blink = Math.max(0, this.blink - dt);
    const closed = this.blink > 0 || a.mode === "sleep" ? 0.1 : 1; this.eyes.forEach((e) => { e.scale.y += ((closed * 0.17 * this.head.children[0].scale.y) - e.scale.y) * 0.5; });
    // legs
    const moving = a.mode === "walk"; if (moving) this.walk += dt * 9; else this.walk += dt * 0;
    this.legs.forEach((l, i) => { const ph = this.walk + (i === 0 || i === 3 ? 0 : Math.PI); const target = moving ? Math.sin(ph) * 0.7 : a.mode === "sleep" ? 1.2 : 0; l.rotation.x += (target - l.rotation.x) * Math.min(1, dt * 14); });
    // body: bob, breathe, hop, squash
    let y = 0, tilt = 0, headX = 0, headY = 0, sy = 1 + Math.sin(t * 2.2) * 0.018;
    if (moving) y = Math.abs(Math.sin(this.walk)) * 0.035;
    if (a.mode === "happy") { y = Math.abs(Math.sin(t * 9)) * 0.22; tilt = Math.sin(t * 9) * 0.08; }
    if (a.mode === "eat") { headX = 0.62 + Math.sin(t * 11) * 0.09; y = -0.01; }
    if (a.mode === "sleep") { sy = 0.8 + Math.sin(t * 1.6) * 0.03; y = -this.baseY * 0.55; headX = 0.5; }
    this.torso.scale.y += (sy - this.torso.scale.y) * 0.3; this.torso.rotation.z += (tilt - this.torso.rotation.z) * 0.3;
    g.position.y += (y - g.position.y) * Math.min(1, dt * 20);
    // head looks about when idle
    this.nextLook -= dt; if (this.nextLook <= 0) { this.lookTo = rnd(-0.6, 0.6); this.nextLook = rnd(1.5, 4); }
    this.look += (this.lookTo - this.look) * Math.min(1, dt * 3); headY = a.mode === "idle" ? this.look : 0;
    this.head.rotation.x += (headX - this.head.rotation.x) * Math.min(1, dt * 10); this.head.rotation.y += (headY - this.head.rotation.y) * Math.min(1, dt * 6);
    // tail: wag speed and size from mood
    const wag = a.mode === "happy" ? 1 : a.mood; const sp = 3 + wag * 12, amp = (this.cat ? 0.25 : 0.2) + wag * (this.cat ? 0.25 : 0.55);
    this.tail.forEach((j, i) => { j.rotation.y = Math.sin(t * sp - i * 0.6) * amp * (0.5 + i * 0.25); j.rotation.x = (this.cat ? -0.35 : -0.55) + (a.mode === "sleep" ? 0.5 : 0) + Math.sin(t * 1.3 + i) * 0.04; });
    // ears twitch now and then
    this.nextTwitch -= dt; if (this.nextTwitch <= 0) { this.twitch = 0.25; this.nextTwitch = rnd(2.5, 6); }
    this.twitch = Math.max(0, this.twitch - dt);
    this.ears.forEach((e, i) => { const k = (this.twitch > 0 ? Math.sin(this.twitch * 28) * 0.35 : 0) * (i ? 1 : -1); e.rotation.z += (k - e.rotation.z) * 0.4; });
  }
}
