import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BerryPill } from "./BerryGuide";
import { Creature } from "./Creature";
import { stageFor } from "./game";
import { ModeTabs } from "./ModeTabs";
import type { Mode } from "./ModeTabs";
import { Sprites } from "./cuddle/art";
import { CUDDLE as C, FACTS, HELPERS, makeQuestion } from "./cuddle/data";
import type { Question } from "./cuddle/data";
import { drawGame } from "./cuddle/draw";
import type { Stick, View } from "./cuddle/draw";
import { CuddleGame } from "./cuddle/game";
import type { Card, Summary } from "./cuddle/game";
import { applyRun, clearPending, cuddleOf, savePick, teamOf } from "./cuddle/rewards";
import type { Rewards } from "./cuddle/rewards";
import { SPECIES, SPECIES_BY_ID } from "./species";
import type { Biome } from "./species";
import type { Owned } from "./types";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
interface Lu { q: Question; ans: number | null; cards: Card[] | null }
const BG = "#8fdc64";

/** Cuddle Run: animals come to you for cuddles. All the rules are in cuddle/game.ts; this file is the screens around it. */
export function CuddleRun({ biome, mode, onMode, onBack, onFriend }: { biome: Biome; mode: Mode; onMode: (m: Mode) => void; onBack: () => void; onFriend: (o: Owned) => void }) {
  const { wilds: w } = useStore();
  const cs = cuddleOf(w);
  const pool = useMemo(() => SPECIES.filter((s) => s.rarity < 4 && s.biomes.includes(biome.id)), [biome.id]);
  const [phase, setPhase] = useState<"prep" | "loading" | "run" | "result">("prep");
  const [team, setTeam] = useState<string[]>(() => teamOf(w).map((o) => o.id));
  const [notesOpen, setNotesOpen] = useState(false);
  const sprites = useRef(new Sprites());
  const game = useRef<CuddleGame | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stick = useRef<Stick>({ active: false, ox: 0, oy: 0, x: 0, y: 0 });
  const keys = useRef<Record<string, boolean>>({});
  const view = useRef<View>({ w: 1, h: 1, scale: 1 });
  const [hud, setHud] = useState({ energy: C.energy, max: C.energy, t: 0, level: 1, xp: 0, need: C.levelXp(1), helped: 0, sleepy: false });
  const [lu, setLu] = useState<Lu | null>(null);
  const [tut, setTut] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<{ s: Summary; rw: Rewards } | null>(null);
  const [burst, setBurst] = useState(0);
  const guard = useRef({ ended: false, lu: false });
  const pausedRef = useRef(false); pausedRef.current = paused || tut || lu !== null;
  const teamOwned = team.map((id) => w.owned.find((o) => o.id === id)).filter(Boolean) as Owned[];

  const toggle = (id: string) => setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= 3 ? [...t.slice(1), id] : [...t, id]));
  const start = async () => {
    if (!pool.length) return;
    setPhase("loading"); savePick(team);
    const jobs: Promise<void>[] = [];
    pool.forEach((sp) => [1, 2, 3].forEach((st) => jobs.push(sprites.current.load(sp, st))));
    teamOwned.forEach((o) => jobs.push(sprites.current.load(SPECIES_BY_ID[o.sp], stageFor(o.xp), o.seed, o.branch)));
    await Promise.all(jobs);
    const g = new CuddleGame({ pool, knownNotes: new Set(Object.keys(cs.notes)), team: teamOwned.map((o) => ({ id: o.id, sp: SPECIES_BY_ID[o.sp], stage: stageFor(o.xp), seed: o.seed, branch: o.branch })) });
    g.onNote = (sp) => { setToast(`📓 ${SPECIES_BY_ID[sp.id].kind}: ${FACTS[sp.id] ?? ""}`); window.setTimeout(() => setToast(null), 4200); };
    game.current = g; guard.current = { ended: false, lu: false };
    setLu(null); setResult(null); setPaused(false); setTut(cs.runs === 0); setHud({ energy: C.energy, max: C.energy, t: 0, level: 1, xp: 0, need: C.levelXp(1), helped: 0, sleepy: false });
    setPhase("run"); note(2);
  };

  // ---- the loop (only while running)
  useEffect(() => {
    if (phase !== "run") return;
    const cv = canvas.current!; const ctx = cv.getContext("2d")!; let raf = 0, last = performance.now(), q = 1, slow = 0, n = 0, acc = 0;
    const fit = () => { const r = cv.parentElement!.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * q; cv.width = Math.max(100, Math.floor(r.width * dpr)); cv.height = Math.max(100, Math.floor(r.height * dpr)); view.current = { w: cv.width, h: cv.height, scale: Math.min(cv.width, cv.height) / 430 }; };
    fit(); window.addEventListener("resize", fit);
    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame); const dt = (ts - last) / 1000; last = ts; const g = game.current; if (!g) return;
      if (!pausedRef.current) {
        const k = keys.current; const kx = (k.ArrowRight || k.d ? 1 : 0) - (k.ArrowLeft || k.a ? 1 : 0), ky = (k.ArrowDown || k.s ? 1 : 0) - (k.ArrowUp || k.w ? 1 : 0);
        if (stick.current.active) g.setMove(stick.current.x, stick.current.y); else g.setMove(kx, ky);
        g.update(dt);
      }
      drawGame(ctx, g, view.current, sprites.current, stick.current, ts);
      n++; acc += dt; if (acc >= 2) { const fps = n / acc; n = 0; acc = 0; if (fps < 24) { slow++; if (slow >= 2 && q > 0.6) { q -= 0.15; slow = 0; fit(); } } else slow = 0; }
    };
    raf = requestAnimationFrame(frame);
    const kd = (e: KeyboardEvent) => { keys.current[e.key] = true; }, ku = (e: KeyboardEvent) => { keys.current[e.key] = false; if (!stick.current.active) game.current?.setMove(0, 0); };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const poll = window.setInterval(() => {
      const g = game.current; if (!g) return;
      setHud({ energy: g.energy, max: g.maxEnergy, t: g.t, level: g.level, xp: g.xp, need: g.xpNeed, helped: g.helped, sleepy: g.sleepy });
      if (g.state === "levelup" && !guard.current.lu) { guard.current.lu = true; setLu({ q: makeQuestion(g.level), ans: null, cards: null }); chime(); }
      if (g.state === "ended" && !guard.current.ended && g.summary) {
        guard.current.ended = true; const s = g.summary; const rw = applyRun(s, teamOwned, biome.id);
        setResult({ s, rw }); setPhase("result"); setBurst((b) => b + 1);
        say(s.reason === "sunset" ? "The sun is setting. What a lovely day!" : "Time for a nap!", 0.9);
      }
    }, 120);
    (window as unknown as { __cuddle?: unknown }).__cuddle = { game: () => game.current, step: (sec: number) => { const g = game.current!; for (let i = 0; i < sec * 30 && g.state === "run"; i++) g.update(1 / 30); } };
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", fit); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- touch / mouse joystick: drag anywhere
  const down = (e: React.PointerEvent) => { if (pausedRef.current) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); stick.current = { active: true, ox: ((e.clientX - r.left) / r.width) * view.current.w, oy: ((e.clientY - r.top) / r.height) * view.current.h, x: 0, y: 0 }; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: React.PointerEvent) => { const s = stick.current; if (!s.active) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * view.current.w, py = ((e.clientY - r.top) / r.height) * view.current.h; const dx = px - s.ox, dy = py - s.oy, m = Math.hypot(dx, dy) || 1, R = 48 * view.current.scale / 1.4; const f = Math.min(1, m / R); s.x = (dx / m) * f; s.y = (dy / m) * f; };
  const up = () => { stick.current.active = false; stick.current.x = 0; stick.current.y = 0; game.current?.setMove(0, 0); };

  // ---- level-up modal
  const answer = (opt: number) => { const g = game.current!; if (!lu || lu.ans !== null) return; const right = opt === lu.q.answer; right ? chime() : oops(); setLu({ ...lu, ans: opt, cards: g.cards(right ? 3 : 2) }); };
  const pick = (c: Card) => { const g = game.current!; g.choose(c); note(3); guard.current.lu = g.state === "levelup"; if (g.state === "levelup") setLu({ q: makeQuestion(g.level), ans: null, cards: null }); else setLu(null); };

  const rest = () => { game.current?.rest(); };
  const meet = () => { const p = cuddleOf(w).pending; if (!p) return; clearPending(); onFriend(p); };

  const energyPct = Math.max(0, Math.min(100, (hud.energy / hud.max) * 100));
  const energyColor = energyPct > 50 ? "#3dbb55" : energyPct > 25 ? "#f2b84b" : "#e5534b";

  // ================= screens
  if (phase === "run") {
    const left = Math.max(0, C.day - hud.t);
    return (
      <div className="absolute inset-0 z-20 select-none" style={{ background: BG }} data-testid="cuddle-run">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" style={{ touchAction: "none" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-testid="cuddle-canvas" />
        <div className="pointer-events-none absolute inset-x-0 top-2 flex items-start justify-between gap-2 px-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-sm">
            <div className="flex items-center gap-2"><span className="emoji text-2xl">⚡</span><div className="h-6 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-white/70"><div className="h-full transition-all" style={{ width: `${energyPct}%`, background: energyColor }} data-testid="cuddle-energy" /></div></div>
            <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-white/60"><div className="h-full bg-[#b266ff]" style={{ width: `${Math.min(100, (hud.xp / hud.need) * 100)}%` }} /></div>
            <p className="text-base font-bold text-ink" style={{ textShadow: "0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff" }} data-testid="cuddle-stats">Level {hud.level} · 💗 {hud.helped} helped</p>
            {hud.sleepy && <p className="anim-pop w-fit rounded-full bg-[#fff7d6] px-3 py-0.5 text-base font-bold text-ink">😴 Getting sleepy…</p>}
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-1.5">
            <span className="rounded-full border-[3px] border-ink bg-white/90 px-3 py-0.5 text-lg font-bold text-ink" data-testid="cuddle-time">☀️ {mmss(left)}</span>
            <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume" : "Pause"} className="rounded-xl border-[3px] border-ink bg-white px-3 py-1 text-lg font-bold text-ink active:scale-95">{paused ? "▶ Go" : "⏸"}</button>
            <button onClick={rest} aria-label="Go rest" className="rounded-xl border-[3px] border-ink bg-white px-3 py-1 text-lg font-bold text-ink active:scale-95">😴 Rest</button>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 flex gap-1.5">
          {teamOwned.map((o) => <div key={o.id} className="rounded-xl border-[3px] border-ink bg-white/85 p-0.5"><Creature species={SPECIES_BY_ID[o.sp]} stage={stageFor(o.xp)} seed={o.seed} branch={o.branch} personality={o.pers} className="h-11 w-11" /></div>)}
        </div>
        {toast && <p key={toast} className="anim-pop pointer-events-none absolute inset-x-3 bottom-16 mx-auto max-w-lg rounded-2xl border-[3px] border-ink bg-[#fff7d6] px-4 py-2 text-center text-lg font-bold text-ink shadow-xl" data-testid="cuddle-fact">{toast}</p>}
        {paused && !lu && !tut && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><p className="rounded-2xl bg-white px-6 py-3 text-3xl font-bold text-ink">Paused</p></div>}
        {tut && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4" data-testid="cuddle-tut">
            <div className="max-w-md rounded-3xl border-[3px] border-ink bg-white p-4 text-center text-ink shadow-2xl">
              <p className="text-3xl font-bold">💗 How to play</p>
              <p className="mt-2 text-xl">👆 <b>Drag</b> to walk around.</p>
              <p className="text-xl">🐾 Stand <b>close to animals</b> and you pet them. Fill the heart ring to make them happy!</p>
              <p className="text-xl">⚡ Big animals take longer and make you tired.</p>
              <p className="text-xl">😴 If your energy runs out, you get a nap. That's okay!</p>
              <button onClick={() => setTut(false)} aria-label="Let's go" className="mt-3 rounded-2xl border-[3px] border-ink bg-mustard px-8 py-2 text-2xl font-bold text-black active:scale-95">Let's go!</button>
            </div>
          </div>
        )}
        {lu && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-3" data-testid="cuddle-levelup">
            <div className="max-h-full w-full max-w-xl overflow-y-auto rounded-3xl border-[3px] border-ink bg-white p-4 text-center text-ink shadow-2xl">
              <p className="text-3xl font-bold">⭐ Level {hud.level}!</p>
              {lu.cards === null ? (<>
                <p className="mt-1 text-xl font-bold" data-testid="cuddle-question">{lu.q.text}</p>
                <div className="mt-3 flex justify-center gap-3">{lu.q.options.map((o) => <button key={o} onClick={() => answer(o)} aria-label={`Answer ${o}`} className="h-16 min-w-[4.5rem] rounded-2xl border-[3px] border-ink bg-sky-100 px-4 text-3xl font-bold active:scale-95">{o}</button>)}</div>
                <p className="mt-2 text-sm">Get it right for 3 choices!</p>
              </>) : (<>
                <p className="mt-1 text-lg font-bold" data-testid="cuddle-answer">{lu.ans === lu.q.answer ? "✓ Yes! Pick a gift:" : `Nice try! The answer is ${lu.q.answer}. Pick a gift:`}</p>
                <div className="mt-2 flex flex-col gap-2">{lu.cards.map((c) => <button key={c.kind + c.id} onClick={() => pick(c)} aria-label={`Card ${c.name}`} className={`rounded-2xl border-[3px] border-ink p-2 text-left active:scale-95 ${c.kind === "helper" ? "bg-yellow-100" : "bg-emerald-50"}`}><span className="text-xl font-bold">{c.kind === "helper" ? "🐾 " : "⬆️ "}{c.name} <span className="text-base font-normal">Lv {c.level}</span></span><span className="block text-base">{c.text}</span></button>)}</div>
              </>)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === "result" && result) {
    const { s, rw } = result; const pending = cs.pending;
    return (
      <div className="absolute inset-0 overflow-y-auto bg-[#2a5c45] p-3 text-center" data-testid="cuddle-result">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 pt-2">
          <p className="text-4xl font-bold" data-testid="cuddle-title">{s.reason === "sunset" ? "🌇 What a lovely day!" : "😴 Nap time!"}</p>
          <p className="text-xl">{s.reason === "sunset" ? "The sun is setting and every animal is happy." : "You were sleepy, so you rested. That's the right thing to do!"}</p>
          <p className="rounded-2xl bg-white/90 px-5 py-2 text-2xl font-bold text-emerald-900" data-testid="cuddle-helped">💗 You helped {s.helped} animal{s.helped === 1 ? "" : "s"}!</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-pink-300 px-4 py-1 text-xl font-bold text-pink-950">🍓 +{rw.berries}</span>
            {teamOwned.length > 0 && rw.bond > 0 && <span className="rounded-full bg-yellow-300 px-4 py-1 text-xl font-bold text-black">💞 Helpers grew closer</span>}
            {rw.notes.length > 0 && <span className="rounded-full bg-sky-200 px-4 py-1 text-xl font-bold text-sky-950">📓 +{rw.notes.length} field note{rw.notes.length === 1 ? "" : "s"}</span>}
          </div>
          {rw.notes.length > 0 && <div className="w-full rounded-2xl bg-white/90 p-2 text-left text-emerald-950">{rw.notes.map((id) => <p key={id} className="text-base"><b>{SPECIES_BY_ID[id].kind}:</b> {FACTS[id]}</p>)}</div>}
          {pending && <button onClick={meet} aria-label="Meet your new friend" className="anim-pop rounded-3xl border-[3px] border-ink bg-mustard px-8 py-3 text-2xl font-bold text-black shadow-xl ring-4 ring-white active:scale-95">🎁 A new friend wants to join you!</button>}
          <div className="flex gap-2"><button onClick={() => setPhase("prep")} aria-label="Play again" className="rounded-2xl bg-white px-6 py-2 text-xl font-bold text-emerald-900 shadow-xl active:scale-95">↺ Another day</button><button onClick={onBack} className="rounded-2xl bg-white/90 px-6 py-2 text-xl font-bold text-purple-800 shadow-xl active:scale-95">◀ Map</button></div>
        </div>
        {burst > 0 && s.reason === "sunset" && <Burst key={burst} emojis={["💗", "⭐", "✨", "🌈"]} />}
      </div>
    );
  }

  // ---- prep (and loading)
  const sorted = [...w.owned].sort((a, b) => b.xp - a.xp);
  const known = Object.keys(cs.notes).length;
  return (
    <div className="absolute inset-0 overflow-y-auto bg-forest pb-4">
      <div className="absolute inset-x-0 top-2 flex items-center justify-between gap-2 px-3">
        <button onClick={onBack} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800 active:scale-95">◀ Map</button>
        <BerryPill n={w.berries} className="!bg-black/40" />
      </div>
      <ModeTabs biome={biome} mode={mode} onMode={onMode} />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-3 pt-[8.4rem] text-center" data-testid="cuddle-prep">
        <p className="text-3xl font-bold">💗 Cuddle Run</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-base">
          <span className="rounded-full bg-black/30 px-3 py-1">Best day: {cs.best} helped</span>
          <span className="rounded-full bg-black/30 px-3 py-1">Days: {cs.runs}</span>
          <button onClick={() => setNotesOpen(true)} aria-label="Field notes" className="rounded-full bg-sky-200 px-3 py-1 font-bold text-sky-950 active:scale-95">📓 Field notes {known}</button>
        </div>
        <p className="text-lg">Animals come to you for cuddles. Pet them to make them happy, and rest when you get sleepy!</p>
        {cs.pending && <button onClick={meet} aria-label="Meet your new friend" className="anim-pop rounded-3xl border-[3px] border-ink bg-mustard px-6 py-2 text-xl font-bold text-black shadow-xl ring-4 ring-white active:scale-95">🎁 A new friend is waiting for you!</button>}
        <p className="text-xl font-bold">Pick up to 3 helper friends:</p>
        <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4" data-testid="cuddle-team">
          {sorted.map((o) => { const sp = SPECIES_BY_ID[o.sp]; const on = team.indexOf(o.id); const hp = HELPERS[sp.element]; return (
            <button key={o.id} onClick={() => toggle(o.id)} aria-pressed={on >= 0} aria-label={`Helper ${o.name}`} className={`relative rounded-2xl p-1 text-center text-emerald-950 active:scale-95 ${on >= 0 ? "bg-mustard ring-4 ring-white" : "bg-white/85"}`}>
              <Creature species={sp} stage={stageFor(o.xp)} shiny={o.shiny} variant={o.variant} branch={o.branch} seed={o.seed} personality={o.pers} className="mx-auto h-14 w-14" />
              <p className="truncate text-sm font-bold leading-tight">{o.name}</p>
              <p className="text-xs leading-tight"><span className="emoji">{hp.emoji}</span> {hp.name} · Lv {stageFor(o.xp)}</p>
              {on >= 0 && <span className="absolute -right-1 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-ink bg-white text-lg font-bold text-black">{on + 1}</span>}
            </button>
          ); })}
        </div>
        <p className="text-sm text-white/85">Each family helps in its own way, and friends that have grown help more!</p>

        <div className="pb-24" />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-20 flex justify-center"><div className="pointer-events-auto">
                <button onClick={start} disabled={phase === "loading" || !pool.length} aria-label="Start the day" className="rounded-3xl border-[3px] border-ink bg-mustard px-12 py-4 text-3xl font-bold text-black shadow-xl ring-4 ring-white active:scale-95 disabled:opacity-60">{phase === "loading" ? "Getting ready…" : "▶ Start the day!"}</button>
      </div></div>
      {notesOpen && (
        <div className="absolute inset-0 z-30 flex flex-col gap-2 bg-forest p-3" data-testid="cuddle-notes">
          <div className="flex items-center justify-between"><p className="text-2xl font-bold">📓 Field notes</p><button onClick={() => setNotesOpen(false)} className="rounded-xl bg-white px-4 py-2 text-xl font-bold text-black">Close</button></div>
          <div className="flex-1 overflow-y-auto">{known === 0 ? <p className="p-3 text-center text-lg">Help an animal for the first time and you will get a true fact about it here!</p> : Object.keys(cs.notes).map((id) => SPECIES_BY_ID[id] && <p key={id} className="mb-2 rounded-2xl bg-white/90 p-2 text-left text-base text-emerald-950"><b>{SPECIES_BY_ID[id].kind}:</b> {FACTS[id]}</p>)}</div>
        </div>
      )}
    </div>
  );
}
