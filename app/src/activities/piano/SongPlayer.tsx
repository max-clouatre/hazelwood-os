import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../../components/Burst";
import { chime, oops } from "../../lib/audio";
import { isBlack, letterOf, parseSong, pianoNote } from "../../lib/piano";
import { addStar } from "../../lib/store";
import type { ProfileId } from "../../lib/store";
import { cheer, say } from "../../lib/speech";
import { colorOf, PianoStage } from "./Keyboard";
import { markDone } from "./progress";

export interface PlaySong { id: string; title: string; emoji: string; bpm: number; notes: string }
type Mode = "listen" | "follow" | "play";
const MODES: { id: Mode; name: string; emoji: string; help: string }[] = [
  { id: "follow", name: "Follow me", emoji: "👆", help: "The song waits for you. Press the glowing key!" },
  { id: "play", name: "Play along", emoji: "🎵", help: "The notes keep falling. Press each key as it lands!" },
  { id: "listen", name: "Listen", emoji: "👂", help: "Hear the whole song first." },
];
const VISIBLE_BEATS = 4.5;
const HIT_WINDOW = 0.8; // beats either side, in Play along

/** Falling notes. Follow me waits for the right key; Play along keeps going and cheers hits (no fail); Listen plays it for you. */
export function SongPlayer({ song, profile, onExit }: { song: PlaySong; profile: ProfileId; onExit: () => void }) {
  const parsed = useMemo(() => parseSong(song.notes), [song]);
  const notes = parsed.notes;
  const { lo, hi } = useMemo(() => {
    let a = Math.min(...notes.map((n) => n.midi)), b = Math.max(...notes.map((n) => n.midi));
    while (isBlack(a)) a--; while (isBlack(b)) b++;
    const whites = () => { let c = 0; for (let m = a; m <= b; m++) if (!isBlack(m)) c++; return c; };
    let up = true; while (whites() < 8) { if (up) { b++; while (isBlack(b)) b++; } else { a--; while (isBlack(a)) a--; } up = !up; }
    return { lo: a, hi: b };
  }, [notes]);

  const [mode, setMode] = useState<Mode>("follow");
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState<"ready" | "playing" | "paused" | "done">("ready");
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set());
  const [glow, setGlow] = useState<ReadonlySet<number>>(new Set());
  const [hits, setHits] = useState(0);
  const [hint, setHint] = useState("");
  const [fx, setFx] = useState<{ id: number; m: number }[]>([]);
  const [burst, setBurst] = useState(0);
  const [round, setRound] = useState(0);
  const lane = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const g = useRef({ pos: 0, next: 0, hit: [] as boolean[], miss: [] as boolean[], wrong: 0, last: 0, fired: -1, doneAt: 0, mode: "follow" as Mode, speed: 1, phase: "ready" as string, fallH: 200 });
  g.current.mode = mode; g.current.speed = speed; g.current.phase = phase;
  const flash = (m: number) => { setLit((s) => new Set(s).add(m)); window.setTimeout(() => setLit((s) => { const n = new Set(s); n.delete(m); return n; }), 220); };
  const spark = (m: number) => { const id = Date.now() + Math.random(); setFx((f) => [...f, { id, m }]); window.setTimeout(() => setFx((f) => f.filter((q) => q.id !== id)), 900); };

  const reset = () => {
    const s = g.current; s.pos = -1.2; s.next = 0; s.hit = notes.map(() => false); s.miss = notes.map(() => false); s.wrong = 0; s.fired = -1; s.doneAt = 0;
    els.current.forEach((e) => { if (e) { e.style.opacity = "1"; e.style.filter = "none"; } });
    setHits(0); setHint(""); setGlow(mode === "follow" && notes[0] ? new Set([notes[0].midi]) : new Set());
  };
  const start = () => { reset(); setPhase("playing"); setRound((r) => r + 1); say(mode === "follow" ? "Press the glowing keys!" : mode === "play" ? "Play along!" : `Listen to ${song.title}`, 0.9); };
  useEffect(() => { reset(); setPhase("ready"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [mode]);

  const markHit = (i: number) => {
    const s = g.current; s.hit[i] = true; const e = els.current[i]; if (e) { e.style.opacity = "0.25"; e.style.filter = "saturate(0)"; }
    setHits((h) => h + 1); spark(notes[i].midi);
  };
  const press = (m: number) => {
    pianoNote(m, 0.5); flash(m);
    const s = g.current; if (s.phase !== "playing" || s.mode === "listen") return;
    if (s.mode === "follow") {
      const n = notes[s.next];
      if (n && n.midi === m) {
        markHit(s.next); s.pos = Math.max(s.pos, n.start); s.next += 1; s.wrong = 0; setHint("");
        const nn = notes[s.next]; setGlow(nn ? new Set([nn.midi]) : new Set());
      } else if (n) { s.wrong += 1; setHint(s.wrong >= 2 ? `Try the ${letterOf(n.midi)} key. It is glowing!` : "Look for the glowing key!"); if (s.wrong === 2) say(`Try the ${letterOf(n.midi)} key`, 0.9); }
    } else {
      let best = -1, bd = HIT_WINDOW + 0.001;
      notes.forEach((n, i) => { if (!s.hit[i] && !s.miss[i] && n.midi === m) { const d = Math.abs(n.start - s.pos); if (d < bd) { bd = d; best = i; } } });
      if (best >= 0) markHit(best); else setHint("");
    }
  };

  // the clock
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0; g.current.last = performance.now();
    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      const s = g.current; const dt = Math.min(0.05, (ts - s.last) / 1000); s.last = ts;
      const adv = dt * (song.bpm / 60) * s.speed;
      if (s.mode === "follow") { const n = notes[s.next]; if (n && s.pos + adv >= n.start) s.pos = n.start; else s.pos += adv; }
      else s.pos += adv;
      if (s.mode === "listen") for (let i = s.fired + 1; i < notes.length && notes[i].start <= s.pos; i++) { s.fired = i; pianoNote(notes[i].midi, notes[i].dur * 60 / song.bpm); flash(notes[i].midi); }
      if (s.mode === "play") notes.forEach((n, i) => { if (!s.hit[i] && !s.miss[i] && n.start + HIT_WINDOW < s.pos) { s.miss[i] = true; const e = els.current[i]; if (e) e.style.filter = "saturate(0.2) brightness(0.8)"; } });
      if (lane.current) lane.current.style.transform = `translateY(${s.pos * (s.fallH / VISIBLE_BEATS)}px)`;
      const end = s.mode === "follow" ? s.next >= notes.length : s.pos > parsed.beats + 1.2;
      if (end) { if (!s.doneAt) s.doneAt = ts; if (ts - s.doneAt > 700) { cancelAnimationFrame(raf); finish(); } }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);
  useEffect(() => () => { window.speechSynthesis?.cancel?.(); }, []);
  const finish = () => {
    const s = g.current; const got = s.hit.filter(Boolean).length; setPhase("done"); setGlow(new Set());
    if ((s.mode === "follow" && got === notes.length) || (s.mode === "play" && got / notes.length >= 0.6)) { addStar(profile); markDone("songs", song.id); chime(); setBurst((b) => b + 1); say(`${cheer()} You played ${song.title}!`); }
    else if (s.mode === "listen") say("Now you try!"); else { oops(); say("Nice try! Let's play it again!"); }
  };

  const m = MODES.find((x) => x.id === mode)!;
  return (
    <div className="relative flex h-full flex-col bg-[#2b2d62]" data-testid="song-player">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2">
        <button onClick={onExit} aria-label="Back to songs" className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Songs</button>
        <p className="min-w-0 flex-1 truncate text-center text-xl font-bold"><span className="emoji">{song.emoji}</span> {song.title}</p>
        <span className="rounded-full bg-black/30 px-3 py-1 text-lg font-bold" data-testid="song-hits">{mode === "listen" ? "👂" : `⭐ ${hits}/${notes.length}`}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-1">
        {MODES.map((x) => <button key={x.id} onClick={() => setMode(x.id)} aria-pressed={mode === x.id} aria-label={`${x.name} mode`} className={`rounded-full px-3 py-1 text-base font-bold active:scale-95 ${mode === x.id ? "bg-mustard text-black" : "bg-white/20"}`}><span className="emoji">{x.emoji}</span> {x.name}</button>)}
        {mode !== "follow" && [0.6, 1].map((v) => <button key={v} onClick={() => setSpeed(v)} aria-pressed={speed === v} aria-label={v < 1 ? "Slow" : "Normal speed"} className={`rounded-full px-3 py-1 text-base font-bold active:scale-95 ${speed === v ? "bg-emerald-400 text-black" : "bg-white/20"}`}>{v < 1 ? "🐢 Slow" : "🐇 Normal"}</button>)}
      </div>
      <PianoStage lo={lo} hi={hi} minKw={38} keyH={140}
        kb={{ onDown: press, lit, glow, rainbow: true, letters: true }}
        fall={(L, fh) => { g.current.fallH = fh; return (
          <>
            <div ref={lane} className="absolute left-0 top-full will-change-transform" style={{ width: L.width, height: 0, transform: `translateY(${g.current.pos * (fh / VISIBLE_BEATS)}px)` }}>
              {notes.map((n, i) => { const ppb = fh / VISIBLE_BEATS, black = isBlack(n.midi); return (
                <div key={i} ref={(e) => { els.current[i] = e; }} className="absolute flex items-start justify-center rounded-lg border-[3px] border-ink text-sm font-bold text-ink"
                  style={{ left: L.x(n.midi) + 2, width: L.w(n.midi) - 6, height: Math.max(16, n.dur * ppb - 4), top: -(n.start + n.dur) * ppb + 2, background: black ? colorOf(n.midi) : colorOf(n.midi) }}>{letterOf(n.midi)}</div>
              ); })}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-yellow-300" />
            {fx.map((f) => <span key={f.id} className="emoji pointer-events-none absolute bottom-2 text-3xl" style={{ left: L.x(f.m) + L.w(f.m) / 2 - 14, animation: "floatup 0.9s ease-out forwards" }}>✨</span>)}
          </>
        ); }} />
      <div className="px-2 pb-2 pt-1 text-center">
        {phase === "ready" && <div className="flex flex-col items-center gap-1"><p className="text-base">{m.help}</p><button onClick={start} aria-label="Start song" className="rounded-3xl bg-mustard px-12 py-3 text-3xl font-bold text-black shadow-xl ring-4 ring-white active:scale-95">▶ Start</button></div>}
        {phase !== "ready" && phase !== "done" && (
          <div className="flex items-center justify-center gap-2"><p className="min-w-0 flex-1 text-lg font-bold" data-testid="song-hint">{hint || (mode === "follow" ? "Press the glowing key!" : mode === "play" ? "Press each key as the note lands!" : "Listening…")}</p>
            <button onClick={() => { setPhase(phase === "paused" ? "playing" : "paused"); }} aria-label={phase === "paused" ? "Resume song" : "Pause song"} className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-black active:scale-95">{phase === "paused" ? "▶" : "⏸"}</button>
            <button onClick={() => { setPhase("ready"); reset(); }} aria-label="Restart song" className="rounded-xl bg-white/90 px-4 py-2 text-lg font-bold text-black active:scale-95">↺</button></div>
        )}
        {phase === "done" && (
          <div className="flex flex-col items-center gap-1"><p className="anim-pop text-2xl font-bold" data-testid="song-done">{mode === "listen" ? "Now you try!" : `You played ${hits} of ${notes.length} notes!`}</p>
            <div className="flex gap-2"><button onClick={start} aria-label="Play again" className="rounded-2xl bg-mustard px-6 py-2 text-xl font-bold text-black active:scale-95">↺ Again</button>
              {mode === "listen" && <button onClick={() => setMode("follow")} aria-label="Try it yourself" className="rounded-2xl bg-emerald-400 px-6 py-2 text-xl font-bold text-black active:scale-95">👆 I'll play</button>}
              <button onClick={onExit} className="rounded-2xl bg-white px-6 py-2 text-xl font-bold text-black active:scale-95">◀ Songs</button></div></div>
        )}
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🎵", "✨"]} />}
    </div>
  );
}
