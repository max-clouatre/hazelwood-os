// Cuddle Run rules. No drawing and no DOM in here, so it can be tested and simulated headless.
// Animals walk to the player; the player automatically pets those in reach (a few at a time); happy animals leave sparkles (xp) and sometimes snacks.
import type { ElementId, Species } from "../species";
import { CUDDLE as C, HELPER_LV as H, SIZES, sizeCap, sizeOf, UPGRADES } from "./data";
import type { SizeId, UpgradeId } from "./data";

export interface Animal {
  id: number; sp: Species; stage: 1 | 2 | 3; size: SizeId; needy: boolean;
  x: number; y: number; progress: number; care: number; drain: number;
  state: "coming" | "waiting" | "tending" | "happy"; t: number; face: number; calm: number; bob: number;
}
export interface HelperPet { id: string; sp: Species; stage: 1 | 2 | 3; seed: number; branch?: "sun" | "moon"; el: ElementId; x: number; y: number; lv: number; timer: number; angle: number; target: number }
export interface Pickup { x: number; y: number; kind: "spark" | "snack"; v: number; fly: boolean }
export interface Patch { x: number; y: number; life: number }
export interface Fx { x: number; y: number; kind: "heart" | "ring" | "beam" | "wind" | "pop"; t: number; max: number; r: number; x2?: number; y2?: number }
export interface Summary {
  reason: "sunset" | "nap"; time: number; helped: number; level: number; species: Record<string, number>; newNotes: string[]; maxEnergyLeft: number;
}
export interface Card { kind: "upgrade" | "helper"; id: string; name: string; text: string; level: number }

export type Rng = () => number;
export interface Setup { pool: Species[]; team: { id: string; sp: Species; stage: 1 | 2 | 3; seed?: number; branch?: "sun" | "moon" }[]; knownNotes: Set<string>; rng?: Rng }

export class CuddleGame {
  t = 0; px = 0; py = 0; face = 1; walk = 0; vx = 0; vy = 0;
  energy = C.energy; maxEnergy = C.energy; level = 1; xp = 0; helped = 0;
  up: Record<UpgradeId, number> = { reach: 0, hands: 0, gentle: 0, heart: 0, cozy: 0, feet: 0, magnet: 0, snacks: 0, calm: 0 };
  animals: Animal[] = []; helpers: HelperPet[] = []; pickups: Pickup[] = []; patches: Patch[] = []; fx: Fx[] = [];
  species: Record<string, number> = {}; notesNew: string[] = []; toast: { text: string; t: number } | null = null;
  state: "run" | "levelup" | "ended" = "run"; summary: Summary | null = null; sleepy = false;
  private nextId = 1; private spawnT = 0.6; private knownNotes: Set<string>; private rng: Rng; private pool: Species[];
  onNote: ((sp: Species, text: string) => void) | null = null;

  constructor(s: Setup) {
    this.rng = s.rng ?? Math.random; this.pool = s.pool; this.knownNotes = new Set(s.knownNotes);
    this.helpers = s.team.map((m, i) => ({ id: m.id, sp: m.sp, stage: m.stage, seed: m.seed ?? 7, branch: m.branch, el: m.sp.element, x: 0, y: 0, lv: m.stage, timer: 2 + i, angle: (i / Math.max(1, s.team.length)) * Math.PI * 2, target: -1 }));
  }

  // ---- derived numbers
  get reach() { return C.reach * (1 + 0.18 * this.up.reach); }
  get slots() { return C.slots + this.up.hands; }
  get careRate() { return 1 + 0.2 * this.up.gentle; }
  get regen() { return C.regen + 0.6 * this.up.cozy; }
  get speed() { const star = this.helpers.filter((h) => h.el === "star").reduce((a, h) => a + H.breezeSpeed[h.lv], 0); return C.speed * (1 + 0.12 * this.up.feet + star); }
  get pickupR() { return C.pickup * (1 + 0.4 * this.up.magnet); }
  get snackP() { return C.snackChance * (1 + 0.5 * this.up.snacks); }
  get snackE() { return C.snackEnergy + 4 * this.up.snacks; }
  get hugMult() { return 1 - 0.2 * this.up.calm; }
  get xpNeed() { return C.levelXp(this.level); }
  r(a: number, b: number) { return a + this.rng() * (b - a); }

  // ---- input: direction in [-1,1] (not necessarily unit length)
  setMove(x: number, y: number) { const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; } this.vx = x; this.vy = y; }

  private spawn() {
    if (this.animals.length >= C.maxAnimals || !this.pool.length) return;
    const cap = sizeCap(this.t);
    let sp = this.pool[Math.floor(this.rng() * this.pool.length)], stage: 1 | 2 | 3 = 1, size: SizeId = "tiny";
    for (let tries = 0; tries < 6; tries++) {
      sp = this.pool[Math.floor(this.rng() * this.pool.length)];
      const roll = this.rng(); const late = Math.min(0.4, this.t / 400);
      stage = roll < 0.55 - late ? 1 : roll < 0.92 - late / 2 ? 2 : 3;
      size = sizeOf(sp.rarity, stage);
      if (["tiny", "small", "medium", "big", "giant"].indexOf(size) <= cap) break;
      stage = 1; size = sizeOf(sp.rarity, 1); if (["tiny", "small", "medium", "big", "giant"].indexOf(size) <= cap) break;
    }
    const idx = ["tiny", "small", "medium", "big", "giant"].indexOf(size);
    const needy = idx >= 1 && this.rng() < C.needyChance;
    const a = this.rng() * Math.PI * 2, d = 330 + this.rng() * C.spawnRing;
    const S = SIZES[size];
    this.animals.push({ id: this.nextId++, sp, stage, size, needy, x: this.px + Math.cos(a) * d, y: this.py + Math.sin(a) * d, progress: 0,
      care: S.care * (needy ? C.needyCare : 1), drain: S.drain * (needy ? C.needyDrain : 1), state: "coming", t: 0, face: 1, calm: 0, bob: this.rng() * 6 });
  }

  private levelUp() { this.xp -= this.xpNeed; this.level += 1; if (this.level > C.levelMax) this.level = C.levelMax; this.state = "levelup"; }
  /** Three cards to choose from (two if the question was missed). Upgrades that are maxed are left out. */
  cards(n: number): Card[] {
    const pool: Card[] = UPGRADES.filter((u) => this.up[u.id] < u.max).map((u) => ({ kind: "upgrade", id: u.id, name: u.name, text: u.text, level: this.up[u.id] + 1 }));
    this.helpers.filter((h) => h.lv < C.helperMax).forEach((h) => pool.push({ kind: "helper", id: h.id, name: `${h.sp.names[h.stage - 1]}: stronger!`, text: `Makes the ${h.el === "leaf" ? "Cozy Patch" : h.el === "water" ? "Splash Hello" : h.el === "fire" ? "Warm Cuddles" : h.el === "sun" ? "Sunbeam" : h.el === "moon" ? "Lullaby" : "Star Breeze"} better.`, level: h.lv + 1 }));
    const out: Card[] = []; const bag = [...pool];
    // always offer a helper card when she has helpers, so her friends keep mattering
    const hc = bag.filter((c) => c.kind === "helper"); if (hc.length && n >= 3) { const c = hc[Math.floor(this.rng() * hc.length)]; out.push(c); bag.splice(bag.indexOf(c), 1); }
    while (out.length < n && bag.length) out.push(bag.splice(Math.floor(this.rng() * bag.length), 1)[0]);
    return out;
  }
  choose(card: Card) {
    if (card.kind === "helper") { const h = this.helpers.find((q) => q.id === card.id); if (h) h.lv = Math.min(C.helperMax, h.lv + 1); }
    else { this.up[card.id as UpgradeId] += 1; if (card.id === "heart") { this.maxEnergy += 20; this.energy = Math.min(this.maxEnergy, this.energy + 20); } }
    if (this.xp >= this.xpNeed && this.level < C.levelMax) this.levelUp(); else this.state = "run";
  }

  /** She decides to rest: the run ends kindly and keeps everything earned. */
  rest() { if (this.state === "run") this.end("nap"); }
  private end(reason: "sunset" | "nap") {
    this.state = "ended";
    this.summary = { reason, time: this.t, helped: this.helped, level: this.level, species: { ...this.species }, newNotes: [...this.notesNew], maxEnergyLeft: Math.max(0, Math.round(this.energy)) };
  }

  /** Advance the game by dt seconds. Does nothing while a level-up card is showing or after the run has ended. */
  update(dt: number) {
    if (this.state !== "run") return;
    dt = Math.min(dt, 0.1); this.t += dt;
    // ---- player
    let slow = 1; const hugging = this.animals.filter((a) => a.state !== "happy" && Math.hypot(a.x - this.px, a.y - this.py) < C.hugDist * 1.4).length;
    slow = Math.max(0.55, 1 - C.hugSlow * this.hugMult * hugging);
    const m = Math.hypot(this.vx, this.vy);
    if (m > 0.05) { this.px += this.vx * this.speed * slow * dt; this.py += this.vy * this.speed * slow * dt; if (Math.abs(this.vx) > 0.1) this.face = this.vx > 0 ? 1 : -1; this.walk += dt * 9; }
    // ---- helpers follow her
    this.helpers.forEach((h, i) => {
      h.angle += dt * 0.7; const n = this.helpers.length; const a = h.angle + (i / n) * Math.PI * 2;
      const tx = this.px + Math.cos(a) * C.helperOrbit, ty = this.py + Math.sin(a) * C.helperOrbit * 0.8;
      h.x += (tx - h.x) * Math.min(1, dt * 6); h.y += (ty - h.y) * Math.min(1, dt * 6);
    });
    // ---- spawning: faster as the day goes on
    this.spawnT -= dt;
    if (this.spawnT <= 0) { this.spawn(); this.spawnT = C.spawnStart + (C.spawnEnd - C.spawnStart) * Math.min(1, this.t / C.day); }

    // ---- who is in reach, nearest first; she pets up to `slots` of them
    const inReach = this.animals.filter((a) => a.state !== "happy" && Math.hypot(a.x - this.px, a.y - this.py) < this.reach).sort((a, b) => Math.hypot(a.x - this.px, a.y - this.py) - Math.hypot(b.x - this.px, b.y - this.py));
    const tended = new Set(inReach.slice(0, this.slots).map((a) => a.id));
    let drain = 0;
    const hz = (el: ElementId) => this.helpers.filter((h) => h.el === el);
    for (const a of this.animals) {
      a.t += dt; a.bob += dt * 4; if (a.calm > 0) a.calm -= dt;
      if (a.state === "happy") { a.y -= 18 * dt; a.x += (a.x > this.px ? 1 : -1) * 26 * dt; continue; }
      const dx = this.px - a.x, dy = this.py - a.y, d = Math.hypot(dx, dy) || 1;
      let calmF = a.calm > 0 ? 0.15 : 1;
      if (Math.abs(dx) > 1) a.face = dx > 0 ? 1 : -1;
      if (tended.has(a.id)) {
        a.state = "tending";
        let rate = this.careRate;
        for (const h of hz("fire")) if (Math.hypot(a.x - h.x, a.y - h.y) < H.warmRadius) rate *= H.warmBoost[h.lv];
        a.progress += (dt * rate) / a.care;
        let dr = a.drain;
        for (const h of hz("moon")) if (Math.hypot(a.x - h.x, a.y - h.y) < H.lullRadius) dr *= H.lullDrain[h.lv];
        if (a.calm > 0) dr *= 0.3;
        drain += dr;
      } else {
        a.state = d < this.reach ? "waiting" : "coming";
        if (d > C.hugDist) { const sp = SIZES[a.size].speed * calmF; a.x += (dx / d) * sp * dt; a.y += (dy / d) * sp * dt; }
        if (a.state === "waiting") { let hg = SIZES[a.size].hug * this.hugMult; for (const h of hz("moon")) if (Math.hypot(a.x - h.x, a.y - h.y) < H.lullRadius) hg *= H.lullDrain[h.lv]; if (a.calm > 0) hg *= 0.3; drain += hg; }
      }
      if (tended.has(a.id) && d > C.hugDist * 0.8) { a.x += (dx / d) * SIZES[a.size].speed * 0.5 * calmF * dt; a.y += (dy / d) * SIZES[a.size].speed * 0.5 * calmF * dt; }
    }
    // sunbeam helpers pet the nearest animal on their own (no energy cost)
    for (const h of hz("sun")) {
      let best: Animal | null = null, bd = H.sunRange;
      for (const a of this.animals) { if (a.state === "happy") continue; const d = Math.hypot(a.x - h.x, a.y - h.y); if (d < bd) { bd = d; best = a; } }
      h.target = best ? best.id : -1;
      if (best) best.progress += (dt * H.sunRate[h.lv]) / best.care;
    }
    // finished animals
    for (const a of this.animals) if (a.state !== "happy" && a.progress >= 1) this.finish(a);
    this.animals = this.animals.filter((a) => !(a.state === "happy" && a.t > 1.4));

    // ---- helper abilities with timers
    for (const h of this.helpers) {
      h.timer -= dt;
      if (h.el === "leaf" && h.timer <= 0) { h.timer = H.patchEvery; this.patches.push({ x: h.x, y: h.y, life: H.patchLife }); this.fx.push({ x: h.x, y: h.y, kind: "pop", t: 0, max: 0.6, r: 40 }); }
      if (h.el === "water" && h.timer <= 0) { h.timer = H.splashEvery[h.lv]; this.fx.push({ x: h.x, y: h.y, kind: "ring", t: 0, max: 0.9, r: H.splashRadius }); for (const a of this.animals) if (a.state !== "happy" && Math.hypot(a.x - h.x, a.y - h.y) < H.splashRadius) a.calm = H.splashCalm[h.lv]; }
      if (h.el === "star" && h.timer <= 0) { h.timer = H.breezeEvery; this.fx.push({ x: h.x, y: h.y, kind: "wind", t: 0, max: 0.9, r: H.breezeRadius }); for (const p of this.pickups) if (Math.hypot(p.x - this.px, p.y - this.py) < H.breezeRadius) p.fly = true; }
    }
    let regen = this.regen;
    for (const p of this.patches) { p.life -= dt; if (Math.hypot(p.x - this.px, p.y - this.py) < H.patchRadius) { const lv = this.helpers.filter((h) => h.el === "leaf").reduce((m2, h) => Math.max(m2, h.lv), 1); regen += H.patchRegen[lv]; } }
    this.patches = this.patches.filter((p) => p.life > 0);

    // ---- pickups: they drift to her when close, and are collected when touched
    for (const p of this.pickups) {
      const dx = this.px - p.x, dy = this.py - p.y, d = Math.hypot(dx, dy) || 1;
      if (d < this.pickupR || p.fly) { p.fly = true; const sp = C.magnetSpeed * dt; p.x += (dx / d) * Math.min(sp, d); p.y += (dy / d) * Math.min(sp, d); }
    }
    this.pickups = this.pickups.filter((p) => {
      if (Math.hypot(this.px - p.x, this.py - p.y) < 16) {
        if (p.kind === "spark") { this.xp += p.v; this.fx.push({ x: p.x, y: p.y, kind: "pop", t: 0, max: 0.4, r: 18 }); } else { this.energy = Math.min(this.maxEnergy, this.energy + p.v); this.fx.push({ x: p.x, y: p.y, kind: "heart", t: 0, max: 0.8, r: 14 }); }
        return false;
      }
      return true;
    });
    // ---- energy
    this.energy = Math.min(this.maxEnergy, this.energy + (regen - drain) * dt);
    this.sleepy = this.energy < 25;
    this.fx.forEach((f) => (f.t += dt)); this.fx = this.fx.filter((f) => f.t < f.max);
    if (this.toast) { this.toast.t -= dt; if (this.toast.t <= 0) this.toast = null; }
    // ---- level up, end of day, nap
    if (this.xp >= this.xpNeed && this.level < C.levelMax && this.state === "run") this.levelUp();
    if (this.energy <= 0) { this.energy = 0; this.end("nap"); } else if (this.t >= C.day) this.end("sunset");
  }

  private finish(a: Animal) {
    a.state = "happy"; a.t = 0; this.helped += 1;
    this.species[a.sp.id] = (this.species[a.sp.id] ?? 0) + 1;
    const S = SIZES[a.size]; const xp = S.xp * (a.needy ? C.needyXp : 1);
    for (let i = 0; i < Math.min(4, 1 + Math.floor(xp / 3)); i++) this.pickups.push({ x: a.x + this.r(-14, 14), y: a.y + this.r(-14, 14), kind: "spark", v: Math.ceil(xp / Math.min(4, 1 + Math.floor(xp / 3))), fly: false });
    if (this.rng() < this.snackP * (a.size === "tiny" ? 0.6 : 1)) this.pickups.push({ x: a.x + this.r(-16, 16), y: a.y + this.r(-16, 16), kind: "snack", v: this.snackE, fly: false });
    this.fx.push({ x: a.x, y: a.y - 30, kind: "heart", t: 0, max: 1.0, r: 18 });
    if (!this.knownNotes.has(a.sp.id)) { this.knownNotes.add(a.sp.id); this.notesNew.push(a.sp.id); this.onNote?.(a.sp, a.sp.id); }
  }
}
