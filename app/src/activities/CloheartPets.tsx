import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { bark, meow, pop } from "../lib/petsound";
import { say } from "../lib/speech";
import { PETS, petById } from "./pets/data";
import type { PetTraits } from "./pets/data";
import { feed, happiness, isFull, moodOf, pat, stateOf } from "./pets/state";
import type { Room } from "./pets/scene";
import type { ActivityProps } from "./types";

const MOOD_TEXT = { happy: "is so happy!", peckish: "is a little hungry.", cuddly: "would love a cuddle.", content: "is cozy." } as const;
const MOOD_FACE = { happy: "😸", peckish: "🥺", cuddly: "🥰", content: "😊" } as const;

/** Cloheart Pets: a gentle virtual pet. Feed it, pet it, watch it wander. It never gets sick and never goes away. */
export default function CloheartPets({ profile }: ActivityProps) {
  void profile;
  const [petId, setPetId] = useState(PETS[0].id);
  const tr: PetTraits = petById(petId);
  const box = useRef<HTMLDivElement>(null); const room = useRef<Room | null>(null);
  const [st, setSt] = useState(() => stateOf(petId));
  const stRef = useRef(st); stRef.current = st;
  const [ready, setReady] = useState(false); const [failed, setFailed] = useState(false);
  const [msg, setMsg] = useState(""); const [burst, setBurst] = useState(0);
  const refresh = () => setSt(stateOf(petId));
  const flash = (t: string) => { setMsg(t); window.setTimeout(() => setMsg((m) => (m === t ? "" : m)), 2600); };

  useEffect(() => { setSt(stateOf(petId)); setMsg(""); say(`Hi! I'm ${tr.name}!`, 0.95); const t = window.setInterval(() => setSt(stateOf(petId)), 15000); return () => window.clearInterval(t); }, [petId]); // eslint-disable-line react-hooks/exhaustive-deps

  // the 3D room (three.js is loaded only when this opens)
  useEffect(() => {
    let dead = false; let ro: ResizeObserver | null = null; let canvas: HTMLCanvasElement | null = null; setReady(false); setFailed(false);
    (async () => {
      try {
        const THREE = await import("three"); const { createRoom } = await import("./pets/scene");
        if (dead || !box.current) return; const el = box.current;
        canvas = document.createElement("canvas"); canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;display:block";
        el.appendChild(canvas);
        const dims = () => { const r = el.getBoundingClientRect(); const ps = Math.max(2, Math.round(Math.max(r.width, r.height) / 330)); return [Math.floor(r.width / ps), Math.floor(r.height / ps)]; };
        const [w0, h0] = dims();
        const rm = createRoom(THREE, canvas, w0, h0, { traits: tr, mood: () => happiness(stRef.current),
          onFed: () => { feed(petId); refresh(); chime(); setBurst((b) => b + 1); flash(`${tr.name} loved that!`); say(`${tr.name} loved that!`, 0.95); },
          onPat: () => { pat(petId); refresh(); } });
        room.current = rm; setReady(true);
        const refit = () => { const [w, h] = dims(); rm.resize(w, h); };
        if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(refit); ro.observe(el); } else window.addEventListener("resize", refit);
        (window as unknown as { __pet?: unknown }).__pet = { stats: () => ({ ...rm.stats() }), screenOf: rm.screenOf, state: () => stateOf(petId) };
      } catch { if (!dead) setFailed(true); }
    })();
    return () => { dead = true; ro?.disconnect(); room.current?.dispose(); room.current = null; canvas?.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  const tap = (e: React.MouseEvent) => {
    const rm = room.current; if (!rm) return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const s = rm.screenOf();
    if (Math.hypot(s.x - (e.clientX - r.left), s.y - (e.clientY - r.top)) < Math.max(64, r.height * 0.2)) rm.patPet();
  };
  const doFeed = () => {
    if (isFull(petId)) { flash(`${tr.name} is full! Maybe a cuddle?`); tr.sound === "bark" ? bark() : meow(); return; }
    if (failed) { feed(petId); refresh(); chime(); flash(`${tr.name} loved that!`); setBurst((b) => b + 1); return; }
    room.current?.feed(); flash(`Dinner time for ${tr.name}!`);
  };
  const doPat = () => { if (failed) { pat(petId); refresh(); pop(); tr.sound === "bark" ? bark() : meow(); flash(`${tr.name} loves you!`); } else room.current?.patPet(); };

  const mood = moodOf(st); const hearts = Math.round(st.joy / 20), bones = Math.round(st.fullness / 20);
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#2a2540]" data-testid="cloheart">
      <div className="relative min-h-0 flex-1" onClick={tap} ref={box} data-testid="pet-room">
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#2a2540]" data-testid="pet-flat">
            <span className="emoji text-[8rem] leading-none">{tr.species === "dog" ? "🐶" : "🐱"}</span><p className="text-2xl font-bold">{tr.name}</p>
          </div>
        )}
        {!ready && !failed && <p className="absolute inset-0 flex items-center justify-center text-lg font-bold">Waking up {tr.name}…</p>}
      </div>
      {/* top: who, how they feel */}
      <div className="pointer-events-none absolute inset-x-0 top-1 flex flex-wrap items-start justify-between gap-2 px-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {PETS.length > 1 && PETS.map((p) => <button key={p.id} onClick={() => setPetId(p.id)} aria-pressed={p.id === petId} aria-label={`Visit ${p.name}`} className={`rounded-full border-[3px] border-ink px-3 py-1 text-lg font-bold active:scale-95 ${p.id === petId ? "bg-mustard text-black" : "bg-white/85 text-purple-900"}`}><span className="emoji">{p.species === "dog" ? "🐶" : "🐱"}</span> {p.name}</button>)}
        </div>
        <div className="rounded-2xl border-[3px] border-ink bg-white/90 px-3 py-1 text-ink" data-testid="pet-status">
          <p className="text-lg font-bold"><span className="emoji">{MOOD_FACE[mood]}</span> {tr.name} {MOOD_TEXT[mood]}</p>
          <p className="text-base" aria-label="Fullness and joy"><span className="emoji" data-testid="pet-bones">{"🍖".repeat(bones)}{"▫️".repeat(5 - bones)}</span> <span className="emoji" data-testid="pet-hearts">{"💗".repeat(hearts)}{"🤍".repeat(5 - hearts)}</span></p>
        </div>
      </div>
      {msg && <p className="anim-pop pointer-events-none absolute inset-x-3 top-24 mx-auto w-fit max-w-md rounded-2xl border-[3px] border-ink bg-[#fff7d6] px-4 py-2 text-center text-xl font-bold text-ink shadow-xl" data-testid="pet-msg">{msg}</p>}
      {/* big buttons */}
      <div className="flex items-center justify-center gap-3 bg-[#2a2540] px-3 py-2">
        <button onClick={doFeed} aria-label="Feed" className="flex min-w-[8rem] flex-col items-center rounded-3xl border-[3px] border-ink bg-mustard px-6 py-2 text-black shadow-xl active:scale-95"><span className="emoji text-4xl">🍖</span><span className="text-xl font-bold">Feed</span></button>
        <button onClick={doPat} aria-label="Pet" className="flex min-w-[8rem] flex-col items-center rounded-3xl border-[3px] border-ink bg-pink-300 px-6 py-2 text-pink-950 shadow-xl active:scale-95"><span className="emoji text-4xl">✋</span><span className="text-xl font-bold">Pet</span></button>
      </div>
      <p className="bg-[#2a2540] pb-1 text-center text-sm text-white/70">Tap {tr.name} to pet them!</p>
      {burst > 0 && <Burst key={burst} emojis={["💗", "🍖", "✨"]} />}
    </div>
  );
}
