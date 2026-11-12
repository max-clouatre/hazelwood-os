// Balance simulation for Cuddle Run (headless). Run:  cd app && npx esbuild ../tests/tools/cuddle-sim.ts --bundle --platform=node --outfile=/tmp/cuddle-sim.js && node /tmp/cuddle-sim.js
// Bots: chaser (walks to animals), still (stands), runaway (walks away). Check naps, time survived, helped, level.
import { CuddleGame } from "../../app/src/wilds/cuddle/game";
import { CUDDLE as C } from "../../app/src/wilds/cuddle/data";
import { SPECIES } from "../../app/src/wilds/species";
const pool = SPECIES.filter((s) => s.biomes.includes("meadow") && s.rarity < 4);
function mulberry(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
type Bot = "chaser" | "still" | "runaway";
function run(bot: Bot, seed: number, team: number, cardPick: "random" | "first") {
  const rng = mulberry(seed);
  const members = SPECIES.filter((s) => s.rarity < 4).slice(0, 40);
  const t = Array.from({ length: team }, (_, i) => ({ id: "h" + i, sp: members[(seed + i * 7) % members.length], stage: 1 as 1 | 2 | 3 }));
  const g = new CuddleGame({ pool, team: t, knownNotes: new Set(), rng });
  let guard = 0;
  while (g.state !== "ended" && guard++ < 100000) {
    if (g.state === "levelup") { const cs = g.cards(3); g.choose(cs[cardPick === "first" ? 0 : Math.floor(rng() * cs.length)]); continue; }
    if (bot === "chaser") {
      // go toward the nearest animal that is not yet happy, but avoid big ones when energy is low
      let best = null as null | { x: number; y: number }, bd = 1e9;
      for (const a of g.animals) { if (a.state === "happy") continue; if (g.energy < 40 && (a.size === "big" || a.size === "giant")) continue; const d = Math.hypot(a.x - g.px, a.y - g.py); if (d < bd) { bd = d; best = a; } }
      if (best && bd > g.reach * 0.6) g.setMove(best.x - g.px, best.y - g.py); else g.setMove(0, 0);
    } else if (bot === "runaway") g.setMove(1, 0); else g.setMove(0, 0);
    g.update(1 / 30);
  }
  const s = g.summary!; return { reason: s.reason, time: Math.round(s.time), helped: s.helped, level: s.level };
}
for (const bot of ["chaser", "still", "runaway"] as Bot[]) for (const team of [1, 3]) {
  const rs = Array.from({ length: 12 }, (_, i) => run(bot, i + 1, team, "random"));
  const naps = rs.filter((r) => r.reason === "nap").length, avgT = Math.round(rs.reduce((a, r) => a + r.time, 0) / rs.length), avgH = Math.round(rs.reduce((a, r) => a + r.helped, 0) / rs.length), avgL = (rs.reduce((a, r) => a + r.level, 0) / rs.length).toFixed(1);
  console.log(`${bot.padEnd(8)} team ${team}: naps ${naps}/12, avg time ${avgT}s of ${C.day}, helped ${avgH}, level ${avgL}`);
}
