// Draws a CuddleGame onto a 2D canvas. Flat colors, bold outlines, no gradients (the game's look rules).
import type { CuddleGame, Animal } from "./game";
import { CUDDLE as C, HELPER_LV as H, SIZES } from "./data";
import type { Sprites } from "./art";

export interface View { w: number; h: number; scale: number }
export interface Stick { active: boolean; ox: number; oy: number; x: number; y: number }
const INK = "#2b2540";
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.4);
  ctx.bezierCurveTo(x - s, y - s * 0.2, x - s * 0.5, y - s * 0.95, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.95, x + s, y - s * 0.2, x, y + s * 0.4); ctx.closePath();
}
function star4(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.42 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath();
}

function ground(ctx: CanvasRenderingContext2D, g: CuddleGame, v: View) {
  const cell = 90, x0 = Math.floor((g.px - v.w / 2 / v.scale) / cell) - 1, x1 = Math.ceil((g.px + v.w / 2 / v.scale) / cell) + 1;
  const y0 = Math.floor((g.py - v.h / 2 / v.scale) / cell) - 1, y1 = Math.ceil((g.py + v.h / 2 / v.scale) / cell) + 1;
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) {
    const h1 = hash(cx, cy), h2 = hash(cy + 9, cx - 4), px = cx * cell + h1 * cell * 0.8, py = cy * cell + h2 * cell * 0.8;
    if (h1 > 0.35) { ctx.fillStyle = "#7acb55"; ctx.beginPath(); ctx.ellipse(px, py, 22 + h2 * 14, 9 + h1 * 6, 0, 0, Math.PI * 2); ctx.fill(); }
    if (h2 > 0.62) { const col = ["#fff", "#ffd23f", "#ff8fb8", "#8fc8ff"][Math.floor(h1 * 40) % 4]; ctx.fillStyle = "#58b447"; ctx.fillRect(px + 14, py + 4, 2, 7); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px + 15, py + 2, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#ffd23f"; ctx.fillRect(px + 14, py + 1, 2, 2); }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, g: CuddleGame) {
  const bob = Math.abs(Math.sin(g.walk)) * (Math.hypot(g.vx, g.vy) > 0.05 ? 3 : 0), f = g.face;
  ctx.save(); ctx.translate(g.px, g.py); ctx.fillStyle = "rgba(30,60,30,.28)"; ctx.beginPath(); ctx.ellipse(0, 6, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -bob); ctx.scale(f, 1); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.lineJoin = "round";
  // pony tail
  ctx.fillStyle = "#7a4a2a"; ctx.beginPath(); ctx.ellipse(-17, -34 + Math.sin(g.walk * 0.8) * 2, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // legs + shoes
  ctx.fillStyle = "#e5736b"; ctx.fillRect(-9, -8, 7, 10); ctx.fillRect(3, -8, 7, 10); ctx.strokeRect(-9, -8, 7, 10); ctx.strokeRect(3, -8, 7, 10);
  // backpack + body
  ctx.fillStyle = "#f2b84b"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-20, -34, 12, 20, 4) : ctx.rect(-20, -34, 12, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3fa7a0"; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-13, -36, 26, 30, 8) : ctx.rect(-13, -36, 26, 30); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff7d6"; ctx.fillRect(-8, -24, 16, 12); // apron
  // head
  ctx.fillStyle = "#f7c9a0"; ctx.beginPath(); ctx.arc(0, -48, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7a4a2a"; ctx.beginPath(); ctx.arc(0, -52, 17, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(10, -52); ctx.lineTo(-10, -52); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(6, -46, 2.2, 0, Math.PI * 2); ctx.arc(-4, -46, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#c4476f"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(1, -41, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  if (g.sleepy) { ctx.fillStyle = INK; ctx.fillRect(3, -47, 6, 2); ctx.fillRect(-7, -47, 6, 2); }
  ctx.restore();
}

function drawAnimal(ctx: CanvasRenderingContext2D, a: Animal, sprites: Sprites, t: number) {
  const S = SIZES[a.size], px = 84 * S.scale, sp = sprites.get(a.sp, a.stage);
  ctx.save(); ctx.translate(a.x, a.y);
  if (a.state === "happy") ctx.globalAlpha = Math.max(0, 1 - a.t / 1.4);
  ctx.fillStyle = "rgba(30,60,30,.25)"; ctx.beginPath(); ctx.ellipse(0, 2, px * 0.34, px * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  if (a.needy && a.state !== "happy") { ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 4; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(0, -px * 0.4, px * 0.55 + Math.sin(t * 5) * 3, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  const sway = a.state === "tending" ? Math.sin(a.bob * 1.6) * 0.1 : Math.sin(a.bob) * 0.04, squash = a.state === "tending" ? 1 + Math.sin(a.bob * 2) * 0.05 : 1;
  ctx.translate(0, -px * 0.08); ctx.rotate(sway); ctx.scale(a.face * (a.calm > 0 ? 0.97 : 1), squash);
  if (sp) ctx.drawImage(sp, -px * 0.6, -px * 1.05, px * 1.2, px * 1.2);
  else { ctx.fillStyle = a.sp.main; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -px * 0.4, px * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  // care ring
  if ((a.state === "tending" || a.progress > 0.02) && a.state !== "happy") {
    ctx.save(); ctx.translate(a.x, a.y - px * 1.18); ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#ff5d8f"; ctx.beginPath(); ctx.arc(0, 0, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, a.progress)); ctx.stroke();
    ctx.fillStyle = "#ff5d8f"; heart(ctx, 0, 1, 6); ctx.fill(); ctx.restore();
  }
}

export function drawGame(ctx: CanvasRenderingContext2D, g: CuddleGame, v: View, sprites: Sprites, stick: Stick, now: number) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#8fdc64"; ctx.fillRect(0, 0, v.w, v.h);
  ctx.setTransform(v.scale, 0, 0, v.scale, v.w / 2 - g.px * v.scale, v.h / 2 - g.py * v.scale); ground(ctx, g, v);
  const t = now / 1000;
  // cozy patches
  for (const p of g.patches) { ctx.fillStyle = "#c7f59a"; ctx.strokeStyle = "#58b447"; ctx.lineWidth = 3; ctx.globalAlpha = Math.min(1, p.life / 1.5); ctx.beginPath(); ctx.arc(p.x, p.y, H.patchRadius, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); for (let i = 0; i < 7; i++) { const a = i * 0.9 + p.x, rr = 18 + (i % 3) * 16; ctx.fillStyle = ["#fff", "#ffd23f", "#ff8fb8"][i % 3]; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr * 0.7, 5, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; }
  // helper auras (under creatures)
  for (const h of g.helpers) {
    if (h.el === "fire") { ctx.fillStyle = "rgba(255,170,60,.22)"; ctx.beginPath(); ctx.arc(h.x, h.y, H.warmRadius, 0, Math.PI * 2); ctx.fill(); }
    if (h.el === "moon") { ctx.strokeStyle = "rgba(120,100,200,.5)"; ctx.lineWidth = 3; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.arc(h.x, h.y, H.lullRadius, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
  }
  // reach ring
  ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(g.px, g.py, g.reach, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  // pickups
  for (const p of g.pickups) {
    if (p.kind === "spark") { ctx.fillStyle = "#ffd23f"; ctx.strokeStyle = INK; ctx.lineWidth = 2; star4(ctx, p.x, p.y + Math.sin(t * 4 + p.x) * 2, 9); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = "#e5334b"; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3dbb55"; ctx.fillRect(p.x - 1, p.y - 12, 3, 5); }
  }
  // everything that stands up, sorted by y so the lower one is in front
  type Item = { y: number; draw: () => void };
  const items: Item[] = [{ y: g.py, draw: () => drawPlayer(ctx, g) }];
  g.animals.forEach((a) => items.push({ y: a.y, draw: () => drawAnimal(ctx, a, sprites, t) }));
  g.helpers.forEach((h) => items.push({ y: h.y, draw: () => {
    const sp = sprites.get(h.sp, h.stage, h.seed, h.branch); ctx.save(); ctx.translate(h.x, h.y + Math.sin(t * 3 + h.angle) * 3);
    ctx.fillStyle = "rgba(30,60,30,.25)"; ctx.beginPath(); ctx.ellipse(0, 6, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (sp) ctx.drawImage(sp, -27, -52, 54, 54); else { ctx.fillStyle = h.sp.main; ctx.beginPath(); ctx.arc(0, -22, 18, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  } }));
  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
  // sunbeam lines
  for (const h of g.helpers) if (h.el === "sun" && h.target >= 0) { const a = g.animals.find((q) => q.id === h.target); if (a) { ctx.strokeStyle = "rgba(255,220,80,.9)"; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(h.x, h.y - 20); ctx.lineTo(a.x, a.y - 30); ctx.stroke(); ctx.setLineDash([]); } }
  // effects
  for (const f of g.fx) {
    const k = f.t / f.max; ctx.globalAlpha = 1 - k;
    if (f.kind === "heart") { ctx.fillStyle = "#ff5d8f"; heart(ctx, f.x, f.y - k * 40, f.r * (0.7 + k * 0.5)); ctx.fill(); }
    else if (f.kind === "ring" || f.kind === "wind") { ctx.strokeStyle = f.kind === "ring" ? "#4fc3f0" : "#fff3b0"; ctx.lineWidth = 5; if (f.kind === "wind") ctx.setLineDash([6, 10]); ctx.beginPath(); ctx.arc(f.x, f.y, f.r * k, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.fillStyle = "#fff3b0"; star4(ctx, f.x, f.y, f.r * (0.4 + k)); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // joystick (screen space)
  if (stick.active) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(stick.ox, stick.oy, 48, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(stick.ox + stick.x * 36, stick.oy + stick.y * 36, 22, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  void C;
}
