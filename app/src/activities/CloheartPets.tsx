import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { bark, meow, pop } from "../lib/petsound";
import { ACCESSORIES, bondLevel, petById, PETS, THEMES } from "./pets/data";
import type { PetTraits } from "./pets/data";
import type { Room } from "./pets/scene";
import { SCRUBS } from "./pets/scene";
import { bathed, bondOf, feed, getRoom, happiness, isFull, moodOf, nightAt, pat, played, rested, setAcc, setRoom, stateOf, trickDone } from "./pets/state";
import type { ActivityProps } from "./types";

const MOOD_TEXT = { happy: "is so happy!", peckish: "is a little hungry.", cuddly: "would love a cuddle.", messy: "could use a bubble bath.", sleepy: "is a little sleepy.", content: "is cozy." } as const;
const MOOD_FACE = { happy: "😸", peckish: "🥺", cuddly: "🥰", messy: "🧼", sleepy: "😴", content: "😊" } as const;
const pips = (v: number, on: string, off: string) => { const n = Math.round(v / 20); return on.repeat(n) + off.repeat(5 - n); };

/** Cloheart Pets: gentle virtual pets. Feed, play fetch, bubble bath, nap, tricks, dress-up and room themes. They never get sick and never go away. */
export default function CloheartPets({ profile }: ActivityProps) {
  void profile;
  const [petId, setPetId] = useState(PETS[0].id);
  const tr: PetTraits = petById(petId);
  const box = useRef<HTMLDivElement>(null); const room = useRef<Room | null>(null);
  const [st, setSt] = useState(() => stateOf(petId)); const stRef = useRef(st); stRef.current = st;
  const [ready, setReady] = useState(false); const [failed, setFailed] = useState(false);
  const [msg, setMsg] = useState(""); const [burst, setBurst] = useState(0);
  const [task, setTask] = useState<string | null>(null); const [awaiting, setAwaiting] = useState(false); const [scrubs, setScrubs] = useState(0);
  const [styleOpen, setStyleOpen] = useState(false); const [theme, setThemeState] = useState(getRoom());
  const refresh = () => setSt(stateOf(petId));
  const flash = (t: string) => { setMsg(t); window.setTimeout(() => setMsg((m) => (m === t ? "" : m)), 2800); };
  /** After any care action: save, refresh, and announce anything newly unlocked. */
  const did = (fn: (id: string) => unknown, text: string, party = false) => {
    const before = bondOf(stateOf(petId)); fn(petId); const after = stateOf(petId); refresh();
    const newly = ACCESSORIES.find((a) => a.need > before && a.need <= bondOf(after));
    if (newly) { chime(); setBurst((b) => b + 1); flash(`New: ${newly.name} ${newly.emoji}! Open Style to wear it.`); } else { if (text) flash(text); if (party) { chime(); setBurst((b) => b + 1); } }
  };

  useEffect(() => { setSt(stateOf(petId)); setMsg(""); setStyleOpen(false); const t = window.setInterval(() => setSt(stateOf(petId)), 15000); return () => window.clearInterval(t); }, [petId]);

  // the 3D room (three.js is loaded only when this opens)
  useEffect(() => {
    let dead = false; let ro: ResizeObserver | null = null; let canvas: HTMLCanvasElement | null = null; let poll = 0; setReady(false); setFailed(false); setTask(null); setAwaiting(false);
    (async () => {
      try {
        const THREE = await import("three"); const { createRoom } = await import("./pets/scene");
        if (dead || !box.current) return; const el = box.current;
        canvas = document.createElement("canvas"); canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;display:block";
        el.appendChild(canvas);
        const dims = () => { const r = el.getBoundingClientRect(); const ps = Math.max(2, Math.round(Math.max(r.width, r.height) / 330)); return [Math.floor(r.width / ps), Math.floor(r.height / ps)]; };
        const [w0, h0] = dims();
        const rm = createRoom(THREE, canvas, w0, h0, { traits: tr, theme: getRoom(), accessory: stateOf(petId).acc, mood: () => happiness(stRef.current), night: () => nightAt(new Date().getHours()),
          onFed: () => did(feed, `${tr.name} loved that!`, true), onPat: () => did(pat, ""), onPlayed: () => did(played, `${tr.name} brought the ball back!`, true),
          onBathed: (full) => did((id) => bathed(id, full), full ? `${tr.name} is squeaky clean!` : `${tr.name} had a quick splash!`, full),
          onRested: (full) => did((id) => rested(id, full ? undefined : 30), full ? `${tr.name} woke up refreshed!` : `${tr.name} had a little nap.`),
          onTrick: (name) => did(trickDone, name === "sit" ? `${tr.name} sat like a champ!` : name === "spin" ? `${tr.name} did a spin!` : `${tr.name} jumped high!`, true),
          onScrub: (n) => setScrubs(n), onBusy: () => flash(`${tr.name} is busy right now.`) });
        room.current = rm; setReady(true);
        poll = window.setInterval(() => { const s = rm.stats(); setTask(s.task); setAwaiting(s.awaitingThrow); if (s.task !== "bath") setScrubs(0); }, 300);
        const refit = () => { const [w, h] = dims(); rm.resize(w, h); };
        if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(refit); ro.observe(el); } else window.addEventListener("resize", refit);
        (window as unknown as { __pet?: unknown }).__pet = { stats: () => ({ ...rm.stats() }), screenOf: rm.screenOf, state: () => stateOf(petId), nightAt };
      } catch { if (!dead) setFailed(true); }
    })();
    return () => { dead = true; ro?.disconnect(); window.clearInterval(poll); room.current?.dispose(); room.current = null; canvas?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  const tap = (e: React.MouseEvent) => {
    const rm = room.current; if (!rm) return;
    if (rm.stats().awaitingThrow) { rm.throwBall(e.clientX, e.clientY); return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const s = rm.screenOf();
    if (Math.hypot(s.x - (e.clientX - r.left), s.y - (e.clientY - r.top)) < Math.max(64, r.height * 0.2)) rm.patPet();
  };
  const sound = () => (tr.sound === "bark" ? bark() : meow());
  const doFeed = () => { if (isFull(petId)) { flash(`${tr.name} is full! Maybe a game?`); sound(); return; } if (failed) { did(feed, `${tr.name} loved that!`, true); return; } if (room.current?.feed()) flash(`Dinner time for ${tr.name}!`); };
  const doPlay = () => { if (failed) { did(played, `${tr.name} had fun!`, true); return; } const rm = room.current; if (!rm) return; if (rm.stats().awaitingThrow) { rm.stopPlay(); setAwaiting(false); return; } if (rm.stats().task) { flash(`${tr.name} is busy right now.`); return; } rm.play(); setAwaiting(true); };
  const doBath = () => { if (failed) { did((id) => bathed(id, true), `${tr.name} is squeaky clean!`, true); return; } if (room.current?.bath()) flash(`Bubble bath! Tap ${tr.name} to scrub.`); };
  const doNap = () => { if (failed) { did((id) => rested(id), `${tr.name} had a nap.`); return; } if (task === "nap") { room.current?.wake(); return; } if (stateOf(petId).rest >= 90) { flash(`${tr.name} is wide awake!`); sound(); return; } if (room.current?.nap()) flash(`Shhh… ${tr.name} is going to bed.`); };
  const doTrick = () => { if (failed) { did(trickDone, `${tr.name} did a trick!`, true); return; } room.current?.trick(); };
  const doPat = () => { if (failed) { did(pat, `${tr.name} loves you!`); pop(); sound(); } else room.current?.patPet(); };

  const mood = moodOf(st); const bond = bondOf(st);
  const btn = "flex w-[5.2rem] flex-col items-center rounded-2xl border-[3px] border-ink px-2 py-1 text-ink shadow-xl active:scale-95 sm:w-[5.6rem]";
  const hint = task === "bath" ? `Tap ${tr.name} to scrub! ${scrubs}/${SCRUBS}` : task === "nap" ? `Shh… ${tr.name} is sleeping. Tap to wake.` : awaiting ? "Tap the floor to throw the ball!" : "";
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#2a2540]" data-testid="cloheart">
      <div className="relative min-h-0 flex-1" onClick={tap} ref={box} data-testid="pet-room">
        {failed && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#2a2540]" data-testid="pet-flat"><span className="emoji text-[8rem] leading-none">{tr.species === "dog" ? "🐶" : "🐱"}</span><p className="text-2xl font-bold">{tr.name}</p></div>}
        {!ready && !failed && <p className="absolute inset-0 flex items-center justify-center text-lg font-bold">Waking up {tr.name}…</p>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-1 flex flex-wrap items-start justify-between gap-2 px-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          {PETS.map((p) => <button key={p.id} onClick={() => setPetId(p.id)} aria-pressed={p.id === petId} aria-label={`Visit ${p.name}`} className={`rounded-full border-[3px] border-ink px-3 py-0.5 text-lg font-bold active:scale-95 ${p.id === petId ? "bg-mustard text-black" : "bg-white/85 text-purple-900"}`}><span className="emoji">{p.species === "dog" ? "🐶" : "🐱"}</span> {p.name}</button>)}
        </div>
        <div className="rounded-2xl border-[3px] border-ink bg-white/90 px-3 py-1 text-ink" data-testid="pet-status">
          <p className="text-lg font-bold"><span className="emoji">{MOOD_FACE[mood]}</span> {tr.name} {MOOD_TEXT[mood]}</p>
          <p className="text-sm font-bold" data-testid="pet-bond"><span className="emoji">💞</span> {bondLevel(bond)} · {bond}</p>
          <p className="text-sm leading-tight"><span className="emoji" data-testid="pet-bones">{pips(st.fullness, "🍖", "▫️")}</span> <span className="emoji" data-testid="pet-hearts">{pips(st.joy, "💗", "🤍")}</span></p>
          <p className="text-sm leading-tight"><span className="emoji" data-testid="pet-clean">{pips(st.clean, "🧼", "▫️")}</span> <span className="emoji" data-testid="pet-rest">{pips(st.rest, "😴", "▫️")}</span></p>
        </div>
      </div>
      {msg && <p className="anim-pop pointer-events-none absolute inset-x-3 top-[42%] mx-auto w-fit max-w-md rounded-2xl border-[3px] border-ink bg-[#fff7d6] px-4 py-2 text-center text-xl font-bold text-ink shadow-xl" data-testid="pet-msg">{msg}</p>}
      <p className="min-h-[2.4rem] bg-[#2a2540] px-3 pt-1 text-center text-xl font-bold text-yellow-200" data-testid="pet-hint">{hint || `Tap ${tr.name} to pet them!`}</p>
      <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#2a2540] px-2 py-1.5" data-testid="pet-actions">
        <button onClick={doFeed} aria-label="Feed" className={`${btn} bg-mustard`}><span className="emoji text-3xl">🍖</span><span className="text-base font-bold">Feed</span></button>
        <button onClick={doPlay} aria-label="Play" aria-pressed={awaiting} className={`${btn} ${awaiting ? "bg-white ring-4 ring-yellow-300" : "bg-blue-300"}`}><span className="emoji text-3xl">🎾</span><span className="text-base font-bold">{awaiting ? "Done" : "Play"}</span></button>
        <button onClick={doBath} aria-label="Bath" className={`${btn} bg-cyan-200`}><span className="emoji text-3xl">🛁</span><span className="text-base font-bold">Bath</span></button>
        <button onClick={doNap} aria-label={task === "nap" ? "Wake" : "Nap"} className={`${btn} bg-indigo-300`}><span className="emoji text-3xl">{task === "nap" ? "☀️" : "😴"}</span><span className="text-base font-bold">{task === "nap" ? "Wake" : "Nap"}</span></button>
        <button onClick={doTrick} aria-label="Trick" className={`${btn} bg-lime-300`}><span className="emoji text-3xl">⭐</span><span className="text-base font-bold">Trick</span></button>
        <button onClick={doPat} aria-label="Pet" className={`${btn} bg-pink-300`}><span className="emoji text-3xl">✋</span><span className="text-base font-bold">Pet</span></button>
        <button onClick={() => setStyleOpen(true)} aria-label="Style" className={`${btn} bg-orange-200`}><span className="emoji text-3xl">🎀</span><span className="text-base font-bold">Style</span></button>
      </div>
      {styleOpen && (
        <div className="absolute inset-0 z-30 flex flex-col gap-2 overflow-y-auto bg-[#2a2540] p-3" data-testid="pet-style">
          <div className="flex items-center justify-between"><p className="text-2xl font-bold">🎀 Style for {tr.name}</p><button onClick={() => setStyleOpen(false)} aria-label="Close style" className="rounded-xl bg-white px-4 py-2 text-xl font-bold text-black active:scale-95">Done</button></div>
          <p className="text-lg font-bold">Wear something</p>
          <div className="flex flex-wrap gap-2" data-testid="pet-acc">
            {ACCESSORIES.map((a) => { const locked = bond < a.need; const on = st.acc === a.id; return (
              <button key={a.id} disabled={locked} aria-label={`Wear ${a.name}`} aria-pressed={on} onClick={() => { setAcc(petId, a.id); room.current?.setAccessory(a.id); refresh(); pop(); }}
                className={`flex w-[6.2rem] flex-col items-center rounded-2xl border-[3px] border-ink p-2 text-ink active:scale-95 ${on ? "bg-mustard ring-4 ring-white" : locked ? "bg-gray-300 opacity-70" : "bg-white"}`}>
                <span className="emoji text-4xl">{locked ? "🔒" : a.emoji}</span><span className="text-base font-bold leading-tight">{a.name}</span>{locked && <span className="text-xs">Bond {a.need}</span>}
              </button>); })}
          </div>
          <p className="mt-1 text-lg font-bold">Change the room</p>
          <div className="flex flex-wrap gap-2" data-testid="pet-themes">
            {THEMES.map((t) => <button key={t.id} aria-label={`Room ${t.name}`} aria-pressed={theme === t.id} onClick={() => { setRoom(t.id); setThemeState(t.id); room.current?.setTheme(t.id); pop(); }} className={`flex w-[6.2rem] flex-col items-center rounded-2xl border-[3px] border-ink p-2 text-ink active:scale-95 ${theme === t.id ? "bg-mustard ring-4 ring-white" : "bg-white"}`}><span className="emoji text-4xl">{t.emoji}</span><span className="text-base font-bold">{t.name}</span></button>)}
          </div>
          <p className="text-sm text-white/80">Play, bathe, feed and cuddle {tr.name} to grow your bond and unlock more things to wear!</p>
        </div>
      )}
      {burst > 0 && <Burst key={burst} emojis={["💗", "⭐", "✨", "🐾"]} />}
    </div>
  );
}
